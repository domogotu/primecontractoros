/**
 * SAM.gov Router — tRPC procedures for SAM.gov API integration
 * 
 * Includes: search, entity lookup, URL import, preview, resync, 
 * import logs, and source file management.
 */
import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { searchOpportunities, searchEntities, getOpportunityByNoticeId } from "./services/samGov";
import {
  validateSamGovUrl,
  extractOpportunityId,
  fetchOpportunityFromSam,
  mapSamDataToOpportunity,
  checkForDuplicate,
} from "./services/samImport";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { getDb, getInsertId } from "./db";
import { opportunities, samImportLogs, opportunitySourceFiles, opportunityImportRuns } from "../drizzle/schema";
import { logAudit } from "./featureRouter";
import { eq, and, isNull, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { persistSamAttachment } from "./services/samAttachmentStorage";

export const samRouter = router({
  // ─── Existing Search Routes ────────────────────────────────────────────────
  searchOpportunities: protectedProcedure
    .input(z.object({
      keyword: z.string().optional(),
      naicsCode: z.string().optional(),
      setAside: z.string().optional(),
      postedFrom: z.string().optional(),
      postedTo: z.string().optional(),
      responseDeadlineFrom: z.string().optional(),
      responseDeadlineTo: z.string().optional(),
      status: z.string().optional(),
      limit: z.number().default(25),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return await searchOpportunities(input);
    }),

  searchEntities: protectedProcedure
    .input(z.object({
      ueiSAM: z.string().optional(),
      cageCode: z.string().optional(),
      legalBusinessName: z.string().optional(),
      stateCode: z.string().optional(),
      naicsCode: z.string().optional(),
      limit: z.number().default(10),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return await searchEntities(input);
    }),

  getOpportunity: protectedProcedure
    .input(z.object({ noticeId: z.string() }))
    .query(async ({ input }) => {
      return await getOpportunityByNoticeId(input.noticeId);
    }),

  // ─── Import from SAM.gov URL ───────────────────────────────────────────────
  importFromUrl: protectedProcedure
    .input(z.object({
      samUrl: z.string().min(1, "SAM.gov URL is required"),
    }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // 1. Validate URL
      const validation = validateSamGovUrl(input.samUrl);
      if (!validation.valid) {
        // Log the failed attempt
        await db.insert(samImportLogs).values({
          workspaceId: wsId,
          samUrl: input.samUrl,
          importStatus: "failed",
          errorMessage: validation.error || "Invalid URL",
          importedBy: ctx.user.id,
        });
        throw new TRPCError({ code: "BAD_REQUEST", message: validation.error || "Invalid SAM.gov URL" });
      }

      // 2. Extract opportunity ID
      const noticeId = extractOpportunityId(input.samUrl);
      if (!noticeId) {
        await db.insert(samImportLogs).values({
          workspaceId: wsId,
          samUrl: input.samUrl,
          importStatus: "failed",
          errorMessage: "Could not extract opportunity ID from URL",
          importedBy: ctx.user.id,
        });
        throw new TRPCError({ code: "BAD_REQUEST", message: "Could not extract opportunity ID from this URL." });
      }

      // 3. Check for duplicates
      const dupCheck = await checkForDuplicate(db, wsId, noticeId, noticeId, null, input.samUrl);
      if (dupCheck.isDuplicate) {
        return {
          success: false,
          isDuplicate: true,
          existingId: dupCheck.existingId,
          message: "This opportunity already exists in your workspace.",
        };
      }

      // 4. Fetch from SAM.gov API
      const fetchResult = await fetchOpportunityFromSam(noticeId);
      if (!fetchResult.success || !fetchResult.opportunity) {
        await db.insert(samImportLogs).values({
          workspaceId: wsId,
          samUrl: input.samUrl,
          samOpportunityId: noticeId,
          importStatus: "failed",
          apiStatusCode: fetchResult.apiStatusCode,
          errorMessage: fetchResult.error,
          rawResponseSnapshot: fetchResult.rawResponse || null,
          importedBy: ctx.user.id,
        });
        throw new TRPCError({
          code: "NOT_FOUND",
          message: fetchResult.error || "Could not import this SAM.gov opportunity. Please confirm the URL is valid or enter the opportunity manually.",
        });
      }

      // 5. Map data to local schema
      const mappedData = mapSamDataToOpportunity(fetchResult.opportunity, input.samUrl, noticeId);

      // 6. Insert opportunity
      const insertResult = await db.insert(opportunities).values({
        workspaceId: wsId,
        ...mappedData,
        createdBy: ctx.user.id,
        lastSyncedAt: new Date(),
      });

      const opportunityId = resolveInsertId(insertResult);
      if (!opportunityId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Opportunity import did not return an insert id" });

      // 7. Save attachments as source files and persist eligible source documents
let attachmentWarning: string | null = null;
if (fetchResult.attachments && fetchResult.attachments.length > 0) {
  let savedCount = 0;
  let downloadWarnings = 0;
  for (const att of fetchResult.attachments) {
    try {
      const sourceFileResult = await db.insert(opportunitySourceFiles).values({
        workspaceId: wsId,
        opportunityId,
        fileName: att.name || "Unnamed Attachment",
        fileUrl: att.url || null,
        fileType: att.type || null,
        sourceSystem: "sam.gov",
        sourceCategory: categorizeAttachment(att.name, att.type),
        isDownloaded: false,
        isSourceDocument: att.type === "related_notice" || att.name?.toLowerCase().includes("solicitation"),
      });
      const sourceFileId = resolveInsertId(sourceFileResult);
      if (sourceFileId && att.url && att.type !== "related_notice") {
        const persisted = await persistSamAttachment({
          workspaceId: wsId,
          opportunityId,
          fileName: att.name || "Unnamed Attachment",
          sourceUrl: att.url,
          declaredType: att.type || null,
        });
        if (persisted.downloaded && persisted.storagePath) {
          await db.update(opportunitySourceFiles).set({
            isDownloaded: true,
            downloadedFilePath: persisted.storagePath,
            fileType: persisted.contentType || att.type || null,
          }).where(and(
            eq(opportunitySourceFiles.id, sourceFileId),
            eq(opportunitySourceFiles.workspaceId, wsId),
            eq(opportunitySourceFiles.opportunityId, opportunityId),
          ));
        } else if (persisted.warning) {
          downloadWarnings++;
          console.warn("[SAM Import] Attachment retained as source link:", att.name, persisted.warning);
        }
      }
      savedCount++;
    } catch (err) {
      console.warn("[SAM Import] Failed to save attachment:", att.name, err);
    }
  }
  if (savedCount < fetchResult.attachments.length) {
    attachmentWarning = `Opportunity imported, but ${fetchResult.attachments.length - savedCount} of ${fetchResult.attachments.length} source attachments could not be saved. Available links were preserved for review.`;
  } else if (downloadWarnings > 0) {
    attachmentWarning = `Opportunity imported with all source links preserved; ${downloadWarnings} attachment(s) were not eligible for automatic local storage.`;
  }
}

      // 8. Log successful import
      await db.insert(samImportLogs).values({
        workspaceId: wsId,
        opportunityId,
        samUrl: input.samUrl,
        samOpportunityId: noticeId,
        importStatus: "success",
        apiStatusCode: 200,
        rawResponseSnapshot: JSON.stringify(fetchResult.opportunity).substring(0, 5000),
        importedBy: ctx.user.id,
      });

      // 9. Audit log
      try { await logAudit(wsId, ctx.user.id, "create", "opportunities", opportunityId, { source: "sam.gov", noticeId, samUrl: input.samUrl }); } catch {}

      return {
        success: true,
        opportunityId,
        message: attachmentWarning || "Opportunity imported from SAM.gov successfully.",
        isArchived: fetchResult.isArchived,
        isInactive: fetchResult.isInactive,
        redirectUrl: `/app/opportunities/${opportunityId}`,
      };
    }),

  // ─── Preview Before Saving ─────────────────────────────────────────────────
  previewFromUrl: protectedProcedure
    .input(z.object({
      samUrl: z.string().min(1, "SAM.gov URL is required"),
    }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);

      // 1. Validate URL
      const validation = validateSamGovUrl(input.samUrl);
      if (!validation.valid) {
        throw new TRPCError({ code: "BAD_REQUEST", message: validation.error || "Invalid SAM.gov URL" });
      }

      // 2. Extract ID
      const noticeId = extractOpportunityId(input.samUrl);
      if (!noticeId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Could not extract opportunity ID from this URL." });
      }

      // 3. Check for duplicates
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const dupCheck = await checkForDuplicate(db, wsId, noticeId, noticeId, null, input.samUrl);

      // 4. Fetch from SAM.gov
      const fetchResult = await fetchOpportunityFromSam(noticeId);
      if (!fetchResult.success || !fetchResult.opportunity) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: fetchResult.error || "Could not retrieve opportunity data from SAM.gov.",
        });
      }

      // 5. Map data
      const mappedData = mapSamDataToOpportunity(fetchResult.opportunity, input.samUrl, noticeId);

      return {
        success: true,
        data: mappedData,
        attachments: fetchResult.attachments || [],
        isDuplicate: dupCheck.isDuplicate,
        existingId: dupCheck.existingId,
        isArchived: fetchResult.isArchived,
        isInactive: fetchResult.isInactive,
      };
    }),

  // ─── Re-sync from SAM.gov ─────────────────────────────────────────────────
  resync: protectedProcedure
    .input(z.object({
      opportunityId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get existing opportunity
      const [existing] = await db
        .select()
        .from(opportunities)
        .where(and(eq(opportunities.id, input.opportunityId), eq(opportunities.workspaceId, wsId)))
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Opportunity not found." });
      }

      const noticeId = existing.samOpportunityId || existing.noticeId;
      if (!noticeId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This opportunity was not imported from SAM.gov and cannot be re-synced." });
      }

      // Fetch fresh data
      const fetchResult = await fetchOpportunityFromSam(noticeId);
      if (!fetchResult.success || !fetchResult.opportunity) {
        await db.insert(samImportLogs).values({
          workspaceId: wsId,
          opportunityId: input.opportunityId,
          samUrl: existing.samUrl,
          samOpportunityId: noticeId,
          importStatus: "sync_failed",
          apiStatusCode: fetchResult.apiStatusCode,
          errorMessage: fetchResult.error,
          importedBy: ctx.user.id,
        });

        // Update opportunity sync status
        await db.update(opportunities)
          .set({ importStatus: "sync_failed" })
          .where(and(eq(opportunities.id, input.opportunityId), eq(opportunities.workspaceId, wsId)));

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: fetchResult.error || "Failed to re-sync from SAM.gov.",
        });
      }

      // Map new data
      const mappedData = mapSamDataToOpportunity(fetchResult.opportunity, existing.samUrl || "", noticeId);

      // Build changes list (only update fields that came from SAM, don't overwrite user edits)
      const changes: Record<string, { old: any; new: any }> = {};
      const updateFields: Record<string, any> = {};

      const fieldsToSync = [
        "title", "agency", "subAgency", "office", "solicitation", "naics", "pscCode",
        "setAside", "setAsideDescription", "noticeType", "description", "placeOfPerformance",
        "pointOfContact",
      ] as const;

      for (const field of fieldsToSync) {
        const oldVal = (existing as any)[field];
        const newVal = (mappedData as any)[field];
        if (newVal && newVal !== oldVal) {
          changes[field] = { old: oldVal, new: newVal };
          updateFields[field] = newVal;
        }
      }

      // Always update dates if available from SAM
      if (mappedData.dueDate && mappedData.dueDate.getTime() !== existing.dueDate?.getTime()) {
        changes["dueDate"] = { old: existing.dueDate, new: mappedData.dueDate };
        updateFields["dueDate"] = mappedData.dueDate;
      }
      if (mappedData.postedDate && mappedData.postedDate.getTime() !== existing.postedDate?.getTime()) {
        changes["postedDate"] = { old: existing.postedDate, new: mappedData.postedDate };
        updateFields["postedDate"] = mappedData.postedDate;
      }
      if (mappedData.archiveDate && mappedData.archiveDate.getTime() !== existing.archiveDate?.getTime()) {
        changes["archiveDate"] = { old: existing.archiveDate, new: mappedData.archiveDate };
        updateFields["archiveDate"] = mappedData.archiveDate;
      }

      // Apply updates
      if (Object.keys(updateFields).length > 0) {
        await db.update(opportunities)
          .set({
            ...updateFields,
            importStatus: "synced",
            lastSyncedAt: new Date(),
          })
          .where(and(eq(opportunities.id, input.opportunityId), eq(opportunities.workspaceId, wsId)));
      } else {
        await db.update(opportunities)
          .set({ importStatus: "synced", lastSyncedAt: new Date() })
          .where(and(eq(opportunities.id, input.opportunityId), eq(opportunities.workspaceId, wsId)));
      }

      // Save and persist newly discovered attachments
if (fetchResult.attachments && fetchResult.attachments.length > 0) {
  for (const att of fetchResult.attachments) {
    const [existingFile] = await db
      .select()
      .from(opportunitySourceFiles)
      .where(and(
        eq(opportunitySourceFiles.workspaceId, wsId),
        eq(opportunitySourceFiles.opportunityId, input.opportunityId),
        eq(opportunitySourceFiles.fileName, att.name || "Unnamed")
      ))
      .limit(1);

    if (!existingFile) {
      const sourceFileResult = await db.insert(opportunitySourceFiles).values({
        workspaceId: wsId,
        opportunityId: input.opportunityId,
        fileName: att.name || "Unnamed Attachment",
        fileUrl: att.url || null,
        fileType: att.type || null,
        sourceSystem: "sam.gov",
        sourceCategory: categorizeAttachment(att.name, att.type),
        isDownloaded: false,
        isSourceDocument: att.type === "related_notice" || att.name?.toLowerCase().includes("solicitation"),
      });
      const sourceFileId = resolveInsertId(sourceFileResult);
      if (sourceFileId && att.url && att.type !== "related_notice") {
        const persisted = await persistSamAttachment({
          workspaceId: wsId,
          opportunityId: input.opportunityId,
          fileName: att.name || "Unnamed Attachment",
          sourceUrl: att.url,
          declaredType: att.type || null,
        });
        if (persisted.downloaded && persisted.storagePath) {
          await db.update(opportunitySourceFiles).set({
            isDownloaded: true,
            downloadedFilePath: persisted.storagePath,
            fileType: persisted.contentType || att.type || null,
          }).where(and(
            eq(opportunitySourceFiles.id, sourceFileId),
            eq(opportunitySourceFiles.workspaceId, wsId),
            eq(opportunitySourceFiles.opportunityId, input.opportunityId),
          ));
        } else if (persisted.warning) {
          console.warn("[SAM Resync] Attachment retained as source link:", att.name, persisted.warning);
        }
      }
    }
  }
}

      // Log sync
      await db.insert(samImportLogs).values({
        workspaceId: wsId,
        opportunityId: input.opportunityId,
        samUrl: existing.samUrl,
        samOpportunityId: noticeId,
        importStatus: "synced",
        apiStatusCode: 200,
        rawResponseSnapshot: JSON.stringify({ changes, fieldsUpdated: Object.keys(updateFields) }).substring(0, 5000),
        importedBy: ctx.user.id,
      });

      try { await logAudit(wsId, ctx.user.id, "update", "opportunities", input.opportunityId, { action: "resync", changes: Object.keys(changes) }); } catch {}

      return {
        success: true,
        changes,
        fieldsUpdated: Object.keys(updateFields),
        message: Object.keys(updateFields).length > 0
          ? `Re-synced successfully. ${Object.keys(updateFields).length} field(s) updated.`
          : "Re-synced successfully. No changes detected from SAM.gov.",
      };
    }),

  // ─── Get Import Logs ───────────────────────────────────────────────────────
  getImportLogs: protectedProcedure
    .input(z.object({
      opportunityId: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) return [];

      if (input.opportunityId) {
        return await db
          .select()
          .from(samImportLogs)
          .where(and(eq(samImportLogs.workspaceId, wsId), eq(samImportLogs.opportunityId, input.opportunityId)))
          .orderBy(desc(samImportLogs.importedAt))
          .limit(20);
      }

      return await db
        .select()
        .from(samImportLogs)
        .where(eq(samImportLogs.workspaceId, wsId))
        .orderBy(desc(samImportLogs.importedAt))
        .limit(50);
    }),

  // ─── Get Source Files ──────────────────────────────────────────────────────
  getSourceFiles: protectedProcedure
    .input(z.object({
      opportunityId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(opportunitySourceFiles)
        .where(and(
          eq(opportunitySourceFiles.workspaceId, wsId),
          eq(opportunitySourceFiles.opportunityId, input.opportunityId)
        ));
    }),

  // ─── Legacy Import (kept for backward compatibility) ───────────────────────
  importOpportunity: protectedProcedure
    .input(z.object({
      noticeId: z.string(),
      title: z.string(),
      agency: z.string().optional(),
      solicitationNumber: z.string().optional(),
      naicsCode: z.string().optional(),
      setAside: z.string().optional(),
      responseDeadline: z.string().optional(),
      description: z.string().optional(),
      sourceLink: z.string().optional(),
      type: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const dupCheck = await checkForDuplicate(db, wsId, input.noticeId, input.noticeId, input.solicitationNumber || null, input.sourceLink || null);
      if (dupCheck.isDuplicate) {
        return { success: false, isDuplicate: true, existingId: dupCheck.existingId, id: dupCheck.existingId || 0 };
      }

      const result = await db.insert(opportunities).values({
        workspaceId: wsId,
        title: input.title,
        agency: input.agency || null,
        solicitation: input.solicitationNumber || null,
        naics: input.naicsCode || null,
        setAside: input.setAside || null,
        dueDate: input.responseDeadline ? new Date(input.responseDeadline) : null,
        summary: input.description || null,
        sourceLink: input.sourceLink || null,
        samOpportunityId: input.noticeId,
        noticeId: input.noticeId,
        sourceSystem: "SAM.gov",
        type: input.type || "federal",
        status: "new",
        importStatus: "imported",
        reviewStatus: "needs_review",
        pursuitDecision: "undecided",
        createdBy: ctx.user.id,
      });

      try { await logAudit(wsId, ctx.user.id, "create", "opportunities", 0, { source: "sam.gov", noticeId: input.noticeId }); } catch {}
      return { success: true, id: resolveInsertId(result) };
    }),

  // ─── Bulk Import from Search Results ──────────────────────────────────────
  bulkImport: protectedProcedure
    .input(z.object({
      opportunities: z.array(z.object({
        noticeId: z.string(),
        title: z.string(),
        agency: z.string().optional(),
        solicitationNumber: z.string().optional(),
        naicsCode: z.string().optional(),
        setAside: z.string().optional(),
        responseDeadline: z.string().optional(),
        description: z.string().optional(),
        sourceLink: z.string().optional(),
        type: z.string().optional(),
      })),
      triggerAiReview: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Create import run record
      const runResult = await db.insert(opportunityImportRuns).values({
        workspaceId: wsId,
        runType: "bulk",
        status: "running",
        totalItems: input.opportunities.length,
        importedBy: ctx.user.id,
      });
      const runId = resolveInsertId(runResult);
      if (!runId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Import run did not return an insert id" });

      let importedCount = 0;
      let skippedCount = 0;
      let failedCount = 0;
      let duplicateCount = 0;
      const importedIds: number[] = [];

      for (const opp of input.opportunities) {
        try {
          // Check for duplicates
          const dupCheck = await checkForDuplicate(db, wsId, opp.noticeId, opp.noticeId, opp.solicitationNumber || null, opp.sourceLink || null);
          if (dupCheck.isDuplicate) {
            duplicateCount++;
            skippedCount++;
            continue;
          }

          const result = await db.insert(opportunities).values({
            workspaceId: wsId,
            title: opp.title,
            agency: opp.agency || null,
            solicitation: opp.solicitationNumber || null,
            naics: opp.naicsCode || null,
            setAside: opp.setAside || null,
            dueDate: opp.responseDeadline ? new Date(opp.responseDeadline) : null,
            summary: opp.description?.substring(0, 500) || null,
            sourceLink: opp.sourceLink || null,
            samOpportunityId: opp.noticeId,
            noticeId: opp.noticeId,
            sourceSystem: "SAM.gov",
            type: opp.type || "federal",
            status: "new",
            importStatus: "imported",
            reviewStatus: "needs_review",
            pursuitDecision: "undecided",
            createdBy: ctx.user.id,
          });
          const oppId = resolveInsertId(result);
          if (oppId) importedIds.push(oppId);
          importedCount++;
        } catch (err: any) {
          console.error("[SAM Bulk Import] Failed to import:", opp.noticeId, err.message);
          failedCount++;
        }
      }

      if (input.triggerAiReview && importedIds.length > 0) {
        const { runOpportunityReview } = await import("./aiEngine");
        for (const opportunityId of importedIds) {
          try {
            const [importedOpportunity] = await db.select().from(opportunities)
              .where(and(eq(opportunities.id, opportunityId), eq(opportunities.workspaceId, wsId)))
              .limit(1);
            if (importedOpportunity) {
              await runOpportunityReview(
                { workspaceId: wsId, userId: ctx.user.id, recordType: "opportunity", recordId: opportunityId, runType: "opportunity_review" },
                JSON.stringify(importedOpportunity)
              );
            }
          } catch (err: any) {
            console.error("[SAM Bulk Import] AI review failed for opportunity", opportunityId, err?.message || err);
          }
        }
      }

      // Update import run
      await db.update(opportunityImportRuns).set({
        status: "completed",
        importedCount,
        skippedCount,
        failedCount,
        duplicateCount,
        importedOpportunityIds: importedIds,
        triggeredAiReview: input.triggerAiReview,
        completedAt: new Date(),
      }).where(and(eq(opportunityImportRuns.id, runId), eq(opportunityImportRuns.workspaceId, wsId)));

      // Log
      await db.insert(samImportLogs).values({
        workspaceId: wsId,
        samUrl: "bulk_import",
        importStatus: "success",
        rawResponseSnapshot: JSON.stringify({ importedCount, skippedCount, failedCount, duplicateCount }),
        importedBy: ctx.user.id,
      });

      try { await logAudit(wsId, ctx.user.id, "create", "opportunities", 0, { source: "sam.gov_bulk", count: importedCount }); } catch {}

      return {
        success: true,
        runId,
        importedCount,
        skippedCount,
        failedCount,
        duplicateCount,
        importedIds,
        message: `Bulk import complete: ${importedCount} imported, ${duplicateCount} duplicates skipped, ${failedCount} failed.`,
      };
    }),

  // ─── Get Import Runs ──────────────────────────────────────────────────────
  getImportRuns: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }).optional())
    .query(async ({ ctx, input }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) return [];
      return db.select().from(opportunityImportRuns)
        .where(eq(opportunityImportRuns.workspaceId, wsId))
        .orderBy(desc(opportunityImportRuns.startedAt))
        .limit(input?.limit || 20);
    }),

  // ─── Trigger AI Review After Import ───────────────────────────────────────
  triggerAiReview: protectedProcedure
    .input(z.object({ opportunityId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      // Get opportunity data
      const [opp] = await db.select().from(opportunities)
        .where(and(eq(opportunities.id, input.opportunityId), eq(opportunities.workspaceId, wsId)))
        .limit(1);

      if (!opp) throw new TRPCError({ code: "NOT_FOUND", message: "Opportunity not found" });

      // Trigger AI review using the existing engine
      try {
        const { runOpportunityReview } = await import("./aiEngine");
        const result = await runOpportunityReview(
          { workspaceId: wsId, userId: ctx.user.id, recordType: "opportunity", recordId: input.opportunityId, runType: "opportunity_review" },
          JSON.stringify(opp)
        );
        return { success: true, result };
      } catch (err: any) {
        console.error("[SAM AI Review] Failed:", err.message);
        return { success: false, error: err.message };
      }
    }),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolveInsertId(result: unknown): number {
  if (typeof result === "number") return result;
  return getInsertId(result);
}


function categorizeAttachment(name?: string, type?: string): "source_notice" | "solicitation" | "amendment" | "attachment" | "supporting_document" | "screenshot" | "other" {
  const lower = (name || "").toLowerCase();
  if (lower.includes("solicitation") || lower.includes("rfp") || lower.includes("rfi") || lower.includes("rfq")) return "solicitation";
  if (lower.includes("amendment") || lower.includes("modification")) return "amendment";
  if (lower.includes("notice") || type === "related_notice") return "source_notice";
  if (lower.includes("support") || lower.includes("guide")) return "supporting_document";
  return "attachment";
}

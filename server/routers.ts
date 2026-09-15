import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createOpportunity,
  getOpportunity,
  listOpportunities,
  updateOpportunity,
  deleteOpportunity,
  updateOpportunityStatus,
  createProposal,
  getProposal,
  listProposals,
  updateProposal,
  deleteProposal,
  updateProposalStatus,
  createContract,
  getContract,
  listContracts,
  updateContract,
  deleteContract,
  updateContractStatus,
  updateContractHealth,
  createAiRun,
  createAiSuggestion,
  getAiSuggestionsForRecord,
  dismissAiSuggestion,
  acceptAiSuggestion,
  getDb,
  getInsertId,
} from "./db";
import { invokeLLM } from "./_core/llm";
import {
  filesRouter, contactsRouter, messagesRouter, invoicesRouter, paymentsRouter,
  tasksRouter, alertsRouter, deliverablesRouter, deadlinesRouter, obligationsRouter,
  complianceRouter, notesRouter, capabilityStatementsRouter, templatesRouter,
  closeoutRouter, lessonsRouter, lossReviewsRouter,
  followupsRouter, closeoutBlockersRouter, contractRequirementsRouter,
  contactLinksRouter, financeNotesRouter, fileVersionsRouter,
  proposalFrameworksRouter, proposalSectionsRouter
} from "./entityRouters";
import { workspaceRouter, platformRouter } from "./platformRouter";
import { planVersionsRouter, discountUsageRouter, billingEventsRouter, consentRecordsRouter, backupExportsRouter, platformTasksRouter, policyVersionsRouter } from "./platformBusinessRouter";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { enforcePermission, enforceAction } from "./rbacMiddleware";
import { logAudit } from "./featureRouter";
import { checkPlanLimit } from "./services/billing";
import { sendContractStatusChangeNotification } from "./services/email";
import { TRPCError } from "@trpc/server";
import { clinsRouter, modificationsRouter, personnelRouter, complianceMatrixRouter, teamAssignmentsRouter, settingsRouter, financeRouter, findingsRouter, auditRouter } from "./featureRouter";
import { fileStorageRouter, emailRouter, billingRouter, reportsRouter, templatesRouter as intTemplatesRouter, closeoutRouter as intCloseoutRouter, lessonsLearnedRouter, capabilityRouter } from "./integrationsRouter";
import { guidanceRouter } from "./guidanceRouter";
import { platformAdminRouter } from "./platformAdminRouter";
import { pdfRouter } from "./pdfRouter";
import { aiRouter } from "./aiRouter";
import { systemInfraRouter } from "./systemInfraRouter";
import { onboardingRouter, recordNotesRouter, recordTimelineRouter, helpRouter } from "./batch1Router";
import { subcontractorsRouter, vendorsRouter, documentVersionsRouter, fileLinksRouter, changeOrdersRouter } from "./batch2Router";
import { planFeaturesRouter, emailTemplatesRouter, diagnosticsRouter, invitesRouter } from "./batch3Router";
import { inviteRouter } from "./inviteRouter";
import { documentGenerationRouter, flowdownReviewsRouter, customerAdoptionRouter, businessProfileRouter, userProfileRouter } from "./batch4Router";
import { webhookRouter } from "./webhookRouter";
import { samRouter } from "./samRouter";
import { guidanceQuestionRouter } from "./guidanceQuestionRouter";
import { searchRouter } from "./searchRouter";
import { rateParityRouter } from "./rateParityRouter";
import { trainingRouter } from "./trainingRouter";
import { efficiencyRouter } from "./efficiencyRouter";
import { farDfarsRouter } from "./farDfarsRouter";
import { customerSupportRouter } from "./customerSupportRouter";
import { platformHealthRouter } from "./platformHealthRouter";
import { dispatchWebhookEvent } from "./services/webhookDispatch";
import { emailPreferences, aiRuns, aiSuggestions } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { contextualHelpRouter, lifecycleRouter, autoPopulationRouter, sourceReferencesRouter, templateImprovementsRouter, helpArticlesRouter, glossaryRouter, dashboardDataRouter, aiSuggestionsEnhancedRouter, aiFindingsEnhancedRouter } from "./phase35Router";
import { contractOperationsRouter } from "./contractOperationsRouter";
import { financeCloseoutRouter } from "./financeCloseoutRouter";

export const appRouter = router({
  pdf: pdfRouter,
  system: systemRouter,
  workspace: workspaceRouter,
  platform: platformRouter,
  platformBusiness: router({
    planVersions: planVersionsRouter,
    discountUsage: discountUsageRouter,
    billingEvents: billingEventsRouter,
    consentRecords: consentRecordsRouter,
    backupExports: backupExportsRouter,
    platformTasks: platformTasksRouter,
    policyVersions: policyVersionsRouter,
  }),
  platformAdmin: platformAdminRouter,
  files: filesRouter,
  contacts: contactsRouter,
  messages: messagesRouter,
  invoices: invoicesRouter,
  payments: paymentsRouter,
  tasks: tasksRouter,
  alerts: alertsRouter,
  deliverables: deliverablesRouter,
  contractOperations: contractOperationsRouter,
  financeCloseout: financeCloseoutRouter,
  deadlines: deadlinesRouter,
  obligations: obligationsRouter,
  compliance: complianceRouter,
  notes: notesRouter,
  capabilityStatements: capabilityStatementsRouter,
  templates: templatesRouter,
  closeout: closeoutRouter,
  lessons: lessonsRouter,
  lossReviews: lossReviewsRouter,
  clins: clinsRouter,
  modifications: modificationsRouter,
  personnel: personnelRouter,
  complianceMatrix: complianceMatrixRouter,
  teamAssignments: teamAssignmentsRouter,
  settings: settingsRouter,
  finance: financeRouter,
  findings: findingsRouter,
  audit: auditRouter,
  fileStorage: fileStorageRouter,
  email: emailRouter,
  billing: billingRouter,
  reports: reportsRouter,
  intTemplates: intTemplatesRouter,
  intCloseout: intCloseoutRouter,
  lessonsLearnedV2: lessonsLearnedRouter,
  capability: capabilityRouter,
  guidance: guidanceRouter,
  aiWorkflow: aiRouter,
  systemInfra: systemInfraRouter,
  onboarding: onboardingRouter,
  recordNotes: recordNotesRouter,
  recordTimeline: recordTimelineRouter,
  help: helpRouter,
  subcontractors: subcontractorsRouter,
  vendors: vendorsRouter,
  documentVersions: documentVersionsRouter,
  fileLinks: fileLinksRouter,
  changeOrders: changeOrdersRouter,
  planFeatures: planFeaturesRouter,
  emailTemplates: emailTemplatesRouter,
  diagnostics: diagnosticsRouter,
  invites: invitesRouter,
  inviteWorkflow: inviteRouter,
  businessProfile: businessProfileRouter,
  userProfile: userProfileRouter,
  documentGeneration: documentGenerationRouter,
  flowdownReviews: flowdownReviewsRouter,
  customerAdoption: customerAdoptionRouter,
  followups: followupsRouter,
  closeoutBlockers: closeoutBlockersRouter,
  contractRequirements: contractRequirementsRouter,
  proposalFrameworks: proposalFrameworksRouter,
  proposalSections: proposalSectionsRouter,
  contactLinks: contactLinksRouter,
  financeNotes: financeNotesRouter,
  fileVersions: fileVersionsRouter,
  webhooks: webhookRouter,
  sam: samRouter,
  guidanceQuestions: guidanceQuestionRouter,
  search: searchRouter,
  rateParity: rateParityRouter,
  training: trainingRouter,
  efficiency: efficiencyRouter,
  farDfars: farDfarsRouter,
  customerSupport: customerSupportRouter,
  platformHealth: platformHealthRouter,
  contextualHelp: contextualHelpRouter,
  lifecycle: lifecycleRouter,
  autoPopulation: autoPopulationRouter,
  sourceRefs: sourceReferencesRouter,
  templateImprovements: templateImprovementsRouter,
  helpArticles: helpArticlesRouter,
  glossaryData: glossaryRouter,
  dashboardData: dashboardDataRouter,
  aiSuggestionsV2: aiSuggestionsEnhancedRouter,
  aiFindingsV2: aiFindingsEnhancedRouter,
  emailPrefs: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return null;
      const [prefs] = await db.select().from(emailPreferences).where(eq(emailPreferences.userId, ctx.user.id)).limit(1);
      if (prefs) return prefs;
      // Return defaults if not set
      return {
        id: null,
        userId: ctx.user.id,
        deadlineReminders: true,
        invoiceAlerts: true,
        contractStatusChanges: true,
        proposalUpdates: true,
        weeklyDigest: false,
      };
    }),
    update: protectedProcedure
      .input(z.object({
        deadlineReminders: z.boolean().optional(),
        invoiceAlerts: z.boolean().optional(),
        contractStatusChanges: z.boolean().optional(),
        proposalUpdates: z.boolean().optional(),
        weeklyDigest: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const [existing] = await db.select({ id: emailPreferences.id }).from(emailPreferences).where(eq(emailPreferences.userId, ctx.user.id)).limit(1);
        if (existing) {
          await db.update(emailPreferences).set(input).where(eq(emailPreferences.userId, ctx.user.id));
        } else {
          await db.insert(emailPreferences).values({ userId: ctx.user.id, ...input });
        }
        return { success: true };
      }),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  opportunities: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const wsId = await requireWorkspaceId(ctx.user.id);
          return await listOpportunities(wsId);
        } catch (error) {
          console.error("Error listing opportunities:", error);
          return [];
        }
      }),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        try {
          const wsId = await requireWorkspaceId(ctx.user.id);
          return await getOpportunity(input.id, wsId);
        } catch (error) {
          console.error("Error getting opportunity:", error);
          return null;
        }
      }),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        agency: z.string().optional(),
        solicitation: z.string().optional(),
        naics: z.string().optional(),
        setAside: z.string().optional(),
        dueDate: z.date().optional(),
        type: z.string().optional(),
        sourceLink: z.string().optional(),
        summary: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { wsId } = await enforcePermission(ctx.user.id, "write");
          const existing = await listOpportunities(wsId);
          const limitCheck = await checkPlanLimit(wsId, "opportunities", existing.length);
          if (!limitCheck.allowed) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: `Plan limit reached: you can have at most ${limitCheck.limit} opportunities. Upgrade your plan to add more.`,
            });
          }
          await createOpportunity({ ...input, workspaceId: wsId });
          try { await logAudit(wsId, ctx.user.id, "create", "opportunities", 0, input); } catch {}
          dispatchWebhookEvent(wsId, "opportunity.created", { title: input.title, agency: input.agency }).catch(() => {});
          return { success: true };
        } catch (error) {
          console.error("Error creating opportunity:", error);
          throw error;
        }
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        agency: z.string().optional(),
        subAgency: z.string().optional(),
        office: z.string().optional(),
        solicitation: z.string().optional(),
        naics: z.string().optional(),
        pscCode: z.string().optional(),
        setAside: z.string().optional(),
        setAsideDescription: z.string().optional(),
        noticeType: z.string().optional(),
        dueDate: z.date().optional(),
        postedDate: z.date().optional(),
        archiveDate: z.date().optional(),
        type: z.string().optional(),
        sourceLink: z.string().optional(),
        summary: z.string().optional(),
        description: z.string().optional(),
        placeOfPerformance: z.string().optional(),
        reviewStatus: z.string().optional(),
        pursuitDecision: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { wsId } = await enforcePermission(ctx.user.id, "write");
          const { id, ...data } = input;
          await updateOpportunity(id, wsId, data);
          try { await logAudit(wsId, ctx.user.id, "update", "opportunities", 0, input); } catch {}
          return { success: true };
        } catch (error) {
          console.error("Error updating opportunity:", error);
          throw error;
        }
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { wsId } = await enforcePermission(ctx.user.id, "delete");
          await deleteOpportunity(input.id, wsId);
          try { await logAudit(wsId, ctx.user.id, "delete", "opportunities", input.id, null); } catch {}
          return { success: true };
        } catch (error) {
          console.error("Error deleting opportunity:", error);
          throw error;
        }
      }),
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "in_review", "pursue", "hold", "no_pursue", "moved_to_proposal", "archived"]),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { wsId } = await enforcePermission(ctx.user.id, "write");
          await updateOpportunityStatus(input.id, wsId, input.status);
          try { await logAudit(wsId, ctx.user.id, "update", "opportunities", input.id, input); } catch {}
          return { success: true };
        } catch (error) {
          console.error("Error updating opportunity status:", error);
          throw error;
        }
      }),
    convertToProposal: protectedProcedure
      .input(z.object({
        opportunityId: z.number(),
        proposalTitle: z.string().min(1),
        framework: z.string().optional(),
        carryForward: z.object({
          contacts: z.boolean().default(true),
          files: z.boolean().default(true),
          notes: z.boolean().default(true),
          tasks: z.boolean().default(false),
        }).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { wsId } = await enforcePermission(ctx.user.id, "write");
          const db = await getDb();
          if (!db) throw new Error("Database not available");

          const {
            contacts: contactsTbl,
            files: filesTbl,
            notes: notesTbl,
            tasks: tasksTbl,
            contactLinks,
            fileLinks,
            opportunitySourceFiles,
            sourceReferences,
            autoPopulationEvents,
            lifecycleStatusHistory,
          } = await import("../drizzle/schema");
          const { and: andOp, eq: eqOp, isNull: isNullOp } = await import("drizzle-orm");

          const opportunity = await getOpportunity(input.opportunityId, wsId);
          if (!opportunity) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Opportunity not found." });
          }

          const cf = input.carryForward || { contacts: true, files: true, notes: true, tasks: false };
          const existingProposals = await listProposals(wsId);
          const existingProposal = existingProposals.find((proposal: any) => proposal.opportunityId === input.opportunityId);

          let proposalId: number;
          let created = false;
          if (existingProposal) {
            proposalId = existingProposal.id;
          } else {
            const limitCheck = await checkPlanLimit(wsId, "proposals", existingProposals.length);
            if (!limitCheck.allowed) {
              throw new TRPCError({
                code: "FORBIDDEN",
                message: `Plan limit reached: you can have at most ${limitCheck.limit} proposals. Upgrade your plan to add more.`,
              });
            }

            const proposalResult = await createProposal({
              workspaceId: wsId,
              title: input.proposalTitle,
              opportunityId: input.opportunityId,
              framework: input.framework,
              dueDate: opportunity.dueDate || undefined,
            });
            proposalId = typeof proposalResult === "number"
              ? proposalResult
              : getInsertId(proposalResult);
            if (!proposalId) {
              throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Proposal creation did not return an insert id." });
            }
            created = true;
          }

          const carried = { contacts: 0, files: 0, notes: 0, tasks: 0, sourceReferences: 0 };

          if (cf.contacts) {
            const linked = await db.select().from(contactsTbl).where(andOp(
              eqOp(contactsTbl.workspaceId, wsId),
              eqOp(contactsTbl.linkedRecordType, "opportunity"),
              eqOp(contactsTbl.linkedRecordId, input.opportunityId),
            ));
            for (const c of linked) {
              const [alreadyLinked] = await db.select({ id: contactLinks.id }).from(contactLinks).where(andOp(
                eqOp(contactLinks.workspaceId, wsId),
                eqOp(contactLinks.contactId, c.id),
                eqOp(contactLinks.recordType, "proposal"),
                eqOp(contactLinks.recordId, proposalId),
              )).limit(1);
              if (!alreadyLinked) {
                await db.insert(contactLinks).values({ contactId: c.id, recordType: "proposal", recordId: proposalId, workspaceId: wsId });
                carried.contacts++;
              }
            }
          }

          if (cf.files) {
            const linked = await db.select().from(filesTbl).where(andOp(
              eqOp(filesTbl.workspaceId, wsId),
              eqOp(filesTbl.linkedRecordType, "opportunity"),
              eqOp(filesTbl.linkedRecordId, input.opportunityId),
            ));
            for (const f of linked) {
              const [alreadyLinked] = await db.select({ id: fileLinks.id }).from(fileLinks).where(andOp(
                eqOp(fileLinks.workspaceId, wsId),
                eqOp(fileLinks.fileId, f.id),
                eqOp(fileLinks.targetType, "proposal"),
                eqOp(fileLinks.targetId, proposalId),
              )).limit(1);
              if (!alreadyLinked) {
                await db.insert(fileLinks).values({ fileId: f.id, targetType: "proposal", targetId: proposalId, linkType: "carry_forward", workspaceId: wsId });
                carried.files++;
              }
            }
          }

          if (cf.notes) {
            const linked = await db.select().from(notesTbl).where(andOp(
              eqOp(notesTbl.workspaceId, wsId),
              eqOp(notesTbl.linkedRecordType, "opportunity"),
              eqOp(notesTbl.linkedRecordId, input.opportunityId),
            ));
            for (const n of linked) {
              const [alreadyCopied] = await db.select({ id: notesTbl.id }).from(notesTbl).where(andOp(
                eqOp(notesTbl.workspaceId, wsId),
                eqOp(notesTbl.linkedRecordType, "proposal"),
                eqOp(notesTbl.linkedRecordId, proposalId),
                n.title === null ? isNullOp(notesTbl.title) : eqOp(notesTbl.title, n.title),
              )).limit(1);
              if (!alreadyCopied) {
                await db.insert(notesTbl).values({ workspaceId: wsId, title: n.title, content: n.content, linkedRecordType: "proposal", linkedRecordId: proposalId, authorId: ctx.user.id });
                carried.notes++;
              }
            }
          }

          if (cf.tasks) {
            const linked = await db.select().from(tasksTbl).where(andOp(
              eqOp(tasksTbl.workspaceId, wsId),
              eqOp(tasksTbl.linkedRecordType, "opportunity"),
              eqOp(tasksTbl.linkedRecordId, input.opportunityId),
              eqOp(tasksTbl.status, "todo"),
            ));
            for (const t of linked) {
              const [alreadyCopied] = await db.select({ id: tasksTbl.id }).from(tasksTbl).where(andOp(
                eqOp(tasksTbl.workspaceId, wsId),
                eqOp(tasksTbl.linkedRecordType, "proposal"),
                eqOp(tasksTbl.linkedRecordId, proposalId),
                eqOp(tasksTbl.title, t.title),
              )).limit(1);
              if (!alreadyCopied) {
                await db.insert(tasksTbl).values({ workspaceId: wsId, title: t.title, description: t.description, assignedTo: t.assignedTo, linkedRecordType: "proposal", linkedRecordId: proposalId, priority: t.priority, dueDate: t.dueDate });
                carried.tasks++;
              }
            }
          }

          const [rootSource] = await db.select({ id: sourceReferences.id }).from(sourceReferences).where(andOp(
            eqOp(sourceReferences.workspaceId, wsId),
            eqOp(sourceReferences.relatedRecordType, "proposal"),
            eqOp(sourceReferences.relatedRecordId, proposalId),
            eqOp(sourceReferences.sourceType, "opportunity"),
          )).limit(1);
          if (!rootSource) {
            await db.insert(sourceReferences).values({
              workspaceId: wsId,
              relatedRecordType: "proposal",
              relatedRecordId: proposalId,
              sourceType: "opportunity",
              sourceUrl: opportunity.samUrl || opportunity.sourceLink || null,
              sourceLocation: `Opportunity #${opportunity.id}`,
              excerpt: (opportunity.summary || opportunity.description || opportunity.title || "").slice(0, 1000),
            });
            carried.sourceReferences++;
          }

          const samSources = await db.select().from(opportunitySourceFiles).where(andOp(
            eqOp(opportunitySourceFiles.workspaceId, wsId),
            eqOp(opportunitySourceFiles.opportunityId, input.opportunityId),
          ));
          for (const source of samSources) {
            const location = source.fileName || `SAM source #${source.id}`;
            const [alreadyReferenced] = await db.select({ id: sourceReferences.id }).from(sourceReferences).where(andOp(
              eqOp(sourceReferences.workspaceId, wsId),
              eqOp(sourceReferences.relatedRecordType, "proposal"),
              eqOp(sourceReferences.relatedRecordId, proposalId),
              eqOp(sourceReferences.sourceType, "sam.gov_attachment"),
              eqOp(sourceReferences.sourceLocation, location),
            )).limit(1);
            if (!alreadyReferenced) {
              await db.insert(sourceReferences).values({
                workspaceId: wsId,
                relatedRecordType: "proposal",
                relatedRecordId: proposalId,
                sourceType: "sam.gov_attachment",
                sourceUrl: source.fileUrl || null,
                sourceLocation: location,
                excerpt: source.sourceCategory || null,
              });
              carried.sourceReferences++;
            }
          }

          const [autoPop] = await db.select({ id: autoPopulationEvents.id }).from(autoPopulationEvents).where(andOp(
            eqOp(autoPopulationEvents.workspaceId, wsId),
            eqOp(autoPopulationEvents.targetRecordType, "proposal"),
            eqOp(autoPopulationEvents.targetRecordId, proposalId),
            eqOp(autoPopulationEvents.sourceRecordType, "opportunity"),
            eqOp(autoPopulationEvents.sourceRecordId, input.opportunityId),
          )).limit(1);
          if (!autoPop) {
            await db.insert(autoPopulationEvents).values({
              workspaceId: wsId,
              targetRecordType: "proposal",
              targetRecordId: proposalId,
              sourceRecordType: "opportunity",
              sourceRecordId: input.opportunityId,
              fieldsApplied: {
                opportunityId: input.opportunityId,
                dueDate: opportunity.dueDate || null,
                title: input.proposalTitle,
                framework: input.framework || null,
                carryForward: cf,
              },
              fieldsSkipped: null,
              reviewedBy: ctx.user.id,
              reviewedAt: new Date(),
            });
          }

          if (created) {
            await db.insert(lifecycleStatusHistory).values({
              workspaceId: wsId,
              recordType: "proposal",
              recordId: proposalId,
              previousStatus: null,
              newStatus: "draft",
              reason: `Created from opportunity #${input.opportunityId}`,
              changedBy: ctx.user.id,
            });
          }

          await updateOpportunityStatus(input.opportunityId, wsId, "moved_to_proposal");
          if (created) {
            try { await logAudit(wsId, ctx.user.id, "create", "proposals", proposalId, { opportunityId: input.opportunityId, carryForward: cf }); } catch {}
          }
          try { await logAudit(wsId, ctx.user.id, "update", "opportunities", input.opportunityId, { status: "moved_to_proposal", proposalId }); } catch {}

          return {
            success: true,
            proposalId,
            created,
            reusedExisting: !created,
            carried,
            message: created
              ? "Proposal created with opportunity lineage and carry-forward data."
              : "Existing proposal reused; carry-forward lineage was reconciled without creating a duplicate.",
          };
        } catch (error) {
          console.error("Error converting opportunity to proposal:", error);
          throw error;
        }
      }),
  }),
  proposals: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const wsId = await requireWorkspaceId(ctx.user.id);
          return await listProposals(wsId);
        } catch (error) {
          console.error("Error listing proposals:", error);
          return [];
        }
      }),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        try {
          const wsId = await requireWorkspaceId(ctx.user.id);
          return await getProposal(input.id, wsId);
        } catch (error) {
          console.error("Error getting proposal:", error);
          return null;
        }
      }),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        opportunityId: z.number().optional(),
        framework: z.string().optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { wsId } = await enforcePermission(ctx.user.id, "write");
          const existing = await listProposals(wsId);
          const limitCheck = await checkPlanLimit(wsId, "proposals", existing.length);
          if (!limitCheck.allowed) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: `Plan limit reached: you can have at most ${limitCheck.limit} proposals. Upgrade your plan to add more.`,
            });
          }
          const result = await createProposal({ ...input, workspaceId: wsId });
          const insertId = getInsertId(result);
          try { await logAudit(wsId, ctx.user.id, "create", "proposals", 0, input); } catch {}
          return { success: true, id: insertId };
        } catch (error) {
          console.error("Error creating proposal:", error);
          throw error;
        }
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        opportunityId: z.number().optional(),
        framework: z.string().optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { wsId } = await enforcePermission(ctx.user.id, "write");
          const { id, ...data } = input;
          await updateProposal(id, wsId, data);
          try { await logAudit(wsId, ctx.user.id, "update", "proposals", 0, input); } catch {}
          return { success: true };
        } catch (error) {
          console.error("Error updating proposal:", error);
          throw error;
        }
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { wsId } = await enforcePermission(ctx.user.id, "delete");
          await deleteProposal(input.id, wsId);
          try { await logAudit(wsId, ctx.user.id, "delete", "proposals", input.id, null); } catch {}
          return { success: true };
        } catch (error) {
          console.error("Error deleting proposal:", error);
          throw error;
        }
      }),
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["draft", "in_progress", "under_review", "submitted", "won", "lost", "withdrawn", "archived"]),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { wsId } = await enforcePermission(ctx.user.id, "write");
          await updateProposalStatus(input.id, wsId, input.status);
          try { await logAudit(wsId, ctx.user.id, "update", "proposals", input.id, input); } catch {}
          if (input.status === "submitted") {
            dispatchWebhookEvent(wsId, "proposal.submitted", { proposalId: input.id, status: input.status }).catch(() => {});
          }
          return { success: true };
        } catch (error) {
          console.error("Error updating proposal status:", error);
          throw error;
        }
      }),
    convertToContract: protectedProcedure
      .input(z.object({
        proposalId: z.number(),
        contractTitle: z.string().min(1),
        contractNumber: z.string().optional(),
        carryForward: z.object({
          contacts: z.boolean().default(true),
          files: z.boolean().default(true),
          notes: z.boolean().default(true),
          tasks: z.boolean().default(false),
          deliverables: z.boolean().default(true),
        }).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { wsId } = await enforceAction(ctx.user.id, "manage_contracts");
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          const {
            contacts: contactsTbl,
            files: filesTbl,
            notes: notesTbl,
            tasks: tasksTbl,
            contracts: contractsTbl,
            contactLinks,
            fileLinks,
            sourceReferences,
            autoPopulationEvents,
            lifecycleStatusHistory,
          } = await import("../drizzle/schema");
          const { and: andOp, eq: eqOp, isNull: isNullOp } = await import("drizzle-orm");

          const proposal = await getProposal(input.proposalId, wsId);
          if (!proposal) throw new TRPCError({ code: "NOT_FOUND", message: "Proposal not found." });
          if (proposal.status !== "won") {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: "Only a proposal marked Won can be converted to an awarded contract. Confirm the award outcome before creating the contract record.",
            });
          }
          const cf = input.carryForward || { contacts: true, files: true, notes: true, tasks: false, deliverables: true };

          const existingContracts = await db.select().from(contractsTbl).where(andOp(
            eqOp(contractsTbl.workspaceId, wsId),
            eqOp(contractsTbl.proposalId, input.proposalId),
          ));
          let contractId = existingContracts[0]?.id;
          let created = false;

          if (!contractId) {
            const allContracts = await listContracts(wsId);
            const limitCheck = await checkPlanLimit(wsId, "contracts", allContracts.length);
            if (!limitCheck.allowed) {
              throw new TRPCError({
                code: "FORBIDDEN",
                message: `Plan limit reached: you can have at most ${limitCheck.limit} contracts. Upgrade your plan to add more.`,
              });
            }
            const opportunity = proposal.opportunityId ? await getOpportunity(proposal.opportunityId, wsId) : null;
            const contractResult = await createContract({
              workspaceId: wsId,
              title: input.contractTitle,
              proposalId: input.proposalId,
              contractNumber: input.contractNumber || undefined,
              agency: opportunity?.agency || undefined,
            });
            contractId = typeof contractResult === "number"
              ? contractResult
              : getInsertId(contractResult);
            if (!contractId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Contract creation did not return an insert id." });
            created = true;
          }

          const carried = { contacts: 0, files: 0, notes: 0, tasks: 0, sourceReferences: 0, deliverableSetupTasks: 0 };

          if (cf.contacts) {
            const contactIds = new Set<number>();
            const directContacts = await db.select({ id: contactsTbl.id }).from(contactsTbl).where(andOp(
              eqOp(contactsTbl.workspaceId, wsId),
              eqOp(contactsTbl.linkedRecordType, "proposal"),
              eqOp(contactsTbl.linkedRecordId, input.proposalId),
            ));
            directContacts.forEach((row) => contactIds.add(row.id));
            const proposalContactLinks = await db.select({ contactId: contactLinks.contactId }).from(contactLinks).where(andOp(
              eqOp(contactLinks.workspaceId, wsId),
              eqOp(contactLinks.recordType, "proposal"),
              eqOp(contactLinks.recordId, input.proposalId),
            ));
            proposalContactLinks.forEach((row) => contactIds.add(row.contactId));
            for (const contactId of Array.from(contactIds)) {
              const [alreadyLinked] = await db.select({ id: contactLinks.id }).from(contactLinks).where(andOp(
                eqOp(contactLinks.workspaceId, wsId),
                eqOp(contactLinks.contactId, contactId),
                eqOp(contactLinks.recordType, "contract"),
                eqOp(contactLinks.recordId, contractId),
              )).limit(1);
              if (!alreadyLinked) {
                await db.insert(contactLinks).values({ contactId, recordType: "contract", recordId: contractId, workspaceId: wsId });
                carried.contacts++;
              }
            }
          }

          if (cf.files) {
            const fileIds = new Set<number>();
            const directFiles = await db.select({ id: filesTbl.id }).from(filesTbl).where(andOp(
              eqOp(filesTbl.workspaceId, wsId),
              eqOp(filesTbl.linkedRecordType, "proposal"),
              eqOp(filesTbl.linkedRecordId, input.proposalId),
            ));
            directFiles.forEach((row) => fileIds.add(row.id));
            const proposalFileLinks = await db.select({ fileId: fileLinks.fileId }).from(fileLinks).where(andOp(
              eqOp(fileLinks.workspaceId, wsId),
              eqOp(fileLinks.targetType, "proposal"),
              eqOp(fileLinks.targetId, input.proposalId),
            ));
            proposalFileLinks.forEach((row) => fileIds.add(row.fileId));
            for (const fileId of Array.from(fileIds)) {
              const [alreadyLinked] = await db.select({ id: fileLinks.id }).from(fileLinks).where(andOp(
                eqOp(fileLinks.workspaceId, wsId),
                eqOp(fileLinks.fileId, fileId),
                eqOp(fileLinks.targetType, "contract"),
                eqOp(fileLinks.targetId, contractId),
              )).limit(1);
              if (!alreadyLinked) {
                await db.insert(fileLinks).values({ fileId, targetType: "contract", targetId: contractId, linkType: "carry_forward", workspaceId: wsId });
                carried.files++;
              }
            }
          }

          if (cf.notes) {
            const linked = await db.select().from(notesTbl).where(andOp(
              eqOp(notesTbl.workspaceId, wsId),
              eqOp(notesTbl.linkedRecordType, "proposal"),
              eqOp(notesTbl.linkedRecordId, input.proposalId),
            ));
            for (const n of linked) {
              const [alreadyCopied] = await db.select({ id: notesTbl.id }).from(notesTbl).where(andOp(
                eqOp(notesTbl.workspaceId, wsId),
                eqOp(notesTbl.linkedRecordType, "contract"),
                eqOp(notesTbl.linkedRecordId, contractId),
                n.title === null ? isNullOp(notesTbl.title) : eqOp(notesTbl.title, n.title),
              )).limit(1);
              if (!alreadyCopied) {
                await db.insert(notesTbl).values({ workspaceId: wsId, title: n.title, content: n.content, linkedRecordType: "contract", linkedRecordId: contractId, authorId: ctx.user.id });
                carried.notes++;
              }
            }
          }

          if (cf.tasks) {
            const linked = await db.select().from(tasksTbl).where(andOp(
              eqOp(tasksTbl.workspaceId, wsId),
              eqOp(tasksTbl.linkedRecordType, "proposal"),
              eqOp(tasksTbl.linkedRecordId, input.proposalId),
              eqOp(tasksTbl.status, "todo"),
            ));
            for (const t of linked) {
              const [alreadyCopied] = await db.select({ id: tasksTbl.id }).from(tasksTbl).where(andOp(
                eqOp(tasksTbl.workspaceId, wsId),
                eqOp(tasksTbl.linkedRecordType, "contract"),
                eqOp(tasksTbl.linkedRecordId, contractId),
                eqOp(tasksTbl.title, t.title),
              )).limit(1);
              if (!alreadyCopied) {
                await db.insert(tasksTbl).values({ workspaceId: wsId, title: t.title, description: t.description, assignedTo: t.assignedTo, linkedRecordType: "contract", linkedRecordId: contractId, priority: t.priority, dueDate: t.dueDate });
                carried.tasks++;
              }
            }
          }

          const proposalSources = await db.select().from(sourceReferences).where(andOp(
            eqOp(sourceReferences.workspaceId, wsId),
            eqOp(sourceReferences.relatedRecordType, "proposal"),
            eqOp(sourceReferences.relatedRecordId, input.proposalId),
          ));
          for (const source of proposalSources) {
            const location = source.sourceLocation || `Proposal source #${source.id}`;
            const [alreadyReferenced] = await db.select({ id: sourceReferences.id }).from(sourceReferences).where(andOp(
              eqOp(sourceReferences.workspaceId, wsId),
              eqOp(sourceReferences.relatedRecordType, "contract"),
              eqOp(sourceReferences.relatedRecordId, contractId),
              eqOp(sourceReferences.sourceType, source.sourceType),
              eqOp(sourceReferences.sourceLocation, location),
            )).limit(1);
            if (!alreadyReferenced) {
              await db.insert(sourceReferences).values({
                workspaceId: wsId,
                relatedRecordType: "contract",
                relatedRecordId: contractId,
                sourceType: source.sourceType,
                sourceUrl: source.sourceUrl,
                sourceLocation: location,
                excerpt: source.excerpt,
              });
              carried.sourceReferences++;
            }
          }

          const [proposalLineage] = await db.select({ id: sourceReferences.id }).from(sourceReferences).where(andOp(
            eqOp(sourceReferences.workspaceId, wsId),
            eqOp(sourceReferences.relatedRecordType, "contract"),
            eqOp(sourceReferences.relatedRecordId, contractId),
            eqOp(sourceReferences.sourceType, "proposal"),
          )).limit(1);
          if (!proposalLineage) {
            await db.insert(sourceReferences).values({
              workspaceId: wsId,
              relatedRecordType: "contract",
              relatedRecordId: contractId,
              sourceType: "proposal",
              sourceLocation: `Proposal #${input.proposalId}`,
              excerpt: proposal.title,
            });
            carried.sourceReferences++;
          }

          const [autoPop] = await db.select({ id: autoPopulationEvents.id }).from(autoPopulationEvents).where(andOp(
            eqOp(autoPopulationEvents.workspaceId, wsId),
            eqOp(autoPopulationEvents.targetRecordType, "contract"),
            eqOp(autoPopulationEvents.targetRecordId, contractId),
            eqOp(autoPopulationEvents.sourceRecordType, "proposal"),
            eqOp(autoPopulationEvents.sourceRecordId, input.proposalId),
          )).limit(1);
          if (!autoPop) {
            await db.insert(autoPopulationEvents).values({
              workspaceId: wsId,
              targetRecordType: "contract",
              targetRecordId: contractId,
              sourceRecordType: "proposal",
              sourceRecordId: input.proposalId,
              fieldsApplied: { proposalId: input.proposalId, title: input.contractTitle, contractNumber: input.contractNumber || null, carryForward: cf },
              fieldsSkipped: null,
              reviewedBy: ctx.user.id,
              reviewedAt: new Date(),
            });
          }

          if (cf.deliverables) {
            const setupTitle = "Establish contract deliverables from governing award";
            const [existingSetupTask] = await db.select({ id: tasksTbl.id }).from(tasksTbl).where(andOp(
              eqOp(tasksTbl.workspaceId, wsId),
              eqOp(tasksTbl.linkedRecordType, "contract"),
              eqOp(tasksTbl.linkedRecordId, contractId),
              eqOp(tasksTbl.title, setupTitle),
            )).limit(1);
            if (!existingSetupTask) {
              await db.insert(tasksTbl).values({
                workspaceId: wsId,
                title: setupTitle,
                description: "Review the governing award, incorporated solicitation/amendments, acceptance terms, CLINs, QASP, and modifications. Create contract deliverable records only after award requirements are confirmed.",
                linkedRecordType: "contract",
                linkedRecordId: contractId,
                priority: "high",
                status: "todo",
              });
              carried.deliverableSetupTasks++;
            }
          }

          if (created) {
            await db.insert(lifecycleStatusHistory).values({
              workspaceId: wsId,
              recordType: "contract",
              recordId: contractId,
              previousStatus: null,
              newStatus: "setup",
              reason: `Created from awarded proposal #${input.proposalId}`,
              changedBy: ctx.user.id,
            });
          }

          await updateProposalStatus(input.proposalId, wsId, "won");
          if (created) {
            try { await logAudit(wsId, ctx.user.id, "create", "contracts", contractId, { proposalId: input.proposalId, carryForward: cf }); } catch {}
            dispatchWebhookEvent(wsId, "contract.created", { proposalId: input.proposalId, contractId, title: input.contractTitle }).catch(() => {});
          }
          try { await logAudit(wsId, ctx.user.id, "update", "proposals", input.proposalId, { status: "won", contractId }); } catch {}

          return {
            success: true,
            contractId,
            created,
            reusedExisting: !created,
            carried,
            deliverablesPendingAwardReview: cf.deliverables,
          };
        } catch (error) {
          console.error("Error converting proposal to contract:", error);
          throw error;
        }
      }),
  }),
  contracts: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const wsId = await requireWorkspaceId(ctx.user.id);
          return await listContracts(wsId);
        } catch (error) {
          console.error("Error listing contracts:", error);
          return [];
        }
      }),
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        try {
          const wsId = await requireWorkspaceId(ctx.user.id);
          return await getContract(input.id, wsId);
        } catch (error) {
          console.error("Error getting contract:", error);
          return null;
        }
      }),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        proposalId: z.number().optional(),
        contractNumber: z.string().optional(),
        agency: z.string().optional(),
        value: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { wsId } = await enforceAction(ctx.user.id, "manage_contracts");
          const existing = await listContracts(wsId);
          const limitCheck = await checkPlanLimit(wsId, "contracts", existing.length);
          if (!limitCheck.allowed) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: `Plan limit reached: you can have at most ${limitCheck.limit} contracts. Upgrade your plan to add more.`,
            });
          }
          await createContract({ ...input, workspaceId: wsId });
          try { await logAudit(wsId, ctx.user.id, "create", "contracts", 0, input); } catch {}
          dispatchWebhookEvent(wsId, "contract.created", { title: input.title, contractNumber: input.contractNumber }).catch(() => {});
          return { success: true };
        } catch (error) {
          console.error("Error creating contract:", error);
          throw error;
        }
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        proposalId: z.number().optional(),
        contractNumber: z.string().optional(),
        agency: z.string().optional(),
        value: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { wsId } = await enforceAction(ctx.user.id, "manage_contracts");
          const { id, ...data } = input;
          await updateContract(id, wsId, data);
          try { await logAudit(wsId, ctx.user.id, "update", "contracts", 0, input); } catch {}
          return { success: true };
        } catch (error) {
          console.error("Error updating contract:", error);
          throw error;
        }
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { wsId } = await enforceAction(ctx.user.id, "manage_contracts");
          await deleteContract(input.id, wsId);
          try { await logAudit(wsId, ctx.user.id, "delete", "contracts", input.id, null); } catch {}
          return { success: true };
        } catch (error) {
          console.error("Error deleting contract:", error);
          throw error;
        }
      }),
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["setup", "active", "modification", "closeout", "closed", "suspended"]),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { wsId } = await enforcePermission(ctx.user.id, "write");
          // Contract lifecycle changes are protected server-side so API callers cannot skip required stages.
          const contract = await getContract(input.id, wsId);
          if (!contract) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Contract not found." });
          }
          const previousStatus = contract.status || "setup";
          const allowedTransitions: Record<string, string[]> = {
            setup: ["active", "suspended"],
            active: ["modification", "closeout", "suspended"],
            modification: ["active", "closeout", "suspended"],
            suspended: ["active", "closeout"],
            closeout: ["active", "closed"],
            closed: [],
          };
          if (input.status !== previousStatus && !(allowedTransitions[previousStatus] || []).includes(input.status)) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: `Invalid contract status transition: ${previousStatus} → ${input.status}. Follow the contract lifecycle instead of skipping stages.`,
            });
          }

          // A contract cannot be marked Closed until its closeout record has passed all required-item/blocker checks.
          if (input.status === "closed" && previousStatus !== "closed") {
            const db2 = await getDb();
            if (!db2) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available." });
            const { closeoutRecords } = await import("../drizzle/schema");
            const { and: andStatus, eq: eqStatus } = await import("drizzle-orm");
            const [closeout] = await db2.select({ status: closeoutRecords.status }).from(closeoutRecords).where(andStatus(
              eqStatus(closeoutRecords.workspaceId, wsId),
              eqStatus(closeoutRecords.contractId, input.id),
            )).limit(1);
            if (!closeout || closeout.status !== "completed") {
              throw new TRPCError({
                code: "PRECONDITION_FAILED",
                message: "Complete the contract closeout checklist and resolve or waive all closeout blockers before marking this contract Closed.",
              });
            }
          }

          await updateContractStatus(input.id, wsId, input.status);
          // Send email notification about status change (fire-and-forget)
          try {
            const db2 = await getDb();
            if (db2 && contract) {
              const { workspaces, users } = await import("../drizzle/schema");
              const { eq } = await import("drizzle-orm");
              const [ws] = await db2.select({ ownerId: workspaces.ownerId }).from(workspaces).where(eq(workspaces.id, wsId));
              if (ws) {
                const [owner] = await db2.select({ email: users.email }).from(users).where(eq(users.id, ws.ownerId));
                if (owner?.email) {
                  await sendContractStatusChangeNotification(
                    wsId, owner.email, contract.title, contract.contractNumber || "",
                    previousStatus, input.status
                  );
                }
              }
            }
          } catch (emailErr) {
            console.error("Failed to send contract status change email:", emailErr);
          }
          try { await logAudit(wsId, ctx.user.id, "update", "contracts", input.id, input); } catch {}
          dispatchWebhookEvent(wsId, "contract.status_changed", { contractId: input.id, previousStatus, newStatus: input.status, title: contract?.title }).catch(() => {});
          return { success: true };
        } catch (error) {
          console.error("Error updating contract status:", error);
          throw error;
        }
      }),
    updateHealth: protectedProcedure
      .input(z.object({
        id: z.number(),
        health: z.enum(["healthy", "at_risk", "warning"]),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { wsId } = await enforcePermission(ctx.user.id, "write");
          await updateContractHealth(input.id, wsId, input.health);
          try { await logAudit(wsId, ctx.user.id, "update", "contracts", input.id, input); } catch {}
          return { success: true };
        } catch (error) {
          console.error("Error updating contract health:", error);
          throw error;
        }
      }),
    convertFromProposal: protectedProcedure
      .input(z.object({
        proposalId: z.number(),
      }))
      .query(async ({ input, ctx }) => {
        try {
          const wsId = await requireWorkspaceId(ctx.user.id);
          const proposal = await getProposal(input.proposalId, wsId);
          if (!proposal) {
            throw new Error("Proposal not found");
          }
          return {
            proposalTitle: proposal.title,
            opportunityId: proposal.opportunityId,
          };
        } catch (error) {
          console.error("Error fetching proposal for conversion:", error);
          throw error;
        }
      }),
  }),
  ai: router({
    listRuns: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input, ctx }) => {
        try {
          const wsId = await requireWorkspaceId(ctx.user.id);
          const db = await getDb();
          if (!db) return [];
          return db.select().from(aiRuns)
            .where(eq(aiRuns.workspaceId, wsId))
            .orderBy(desc(aiRuns.createdAt))
            .limit(input?.limit ?? 100);
        } catch (error) {
          console.error("Error fetching AI runs:", error);
          return [];
        }
      }),
    listSuggestions: protectedProcedure
      .input(z.object({ status: z.string().optional(), limit: z.number().optional() }).optional())
      .query(async ({ input, ctx }) => {
        try {
          const wsId = await requireWorkspaceId(ctx.user.id);
          const db = await getDb();
          if (!db) return [];
          const { and: andOp } = await import("drizzle-orm");
          let conditions: any[] = [eq(aiSuggestions.workspaceId, wsId)];
          if (input?.status && input.status !== "all") {
            conditions.push(eq(aiSuggestions.status, input.status as any));
          }
          return db.select().from(aiSuggestions)
            .where(conditions.length === 1 ? conditions[0] : andOp(...conditions))
            .orderBy(desc(aiSuggestions.createdAt))
            .limit(input?.limit ?? 100);
        } catch (error) {
          console.error("Error fetching AI suggestions:", error);
          return [];
        }
      }),
    generateGuidance: protectedProcedure
      .input(z.object({
        recordType: z.string(),
        recordId: z.number(),
        context: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const wsId = await requireWorkspaceId(ctx.user.id);
          
          // Create AI run
          await createAiRun({
            workspaceId: wsId,
            userId: ctx.user.id,
            relatedRecordType: input.recordType,
            relatedRecordId: input.recordId,
            aiType: "guidance",
            purpose: `Generate guidance for ${input.recordType}`,
            inputSummary: input.context.substring(0, 500),
          });

          // Call LLM to generate suggestions
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are a government contracting expert. Provide 2-3 practical, actionable suggestions to help improve their government contracting process. Be specific and reference relevant FAR regulations.",
              },
              {
                role: "user",
                content: `${input.recordType} context: ${input.context}\n\nProvide suggestions in JSON format with title, text, priority, and action.`,
              },
            ],
          });

          const messageContent = response.choices[0]?.message?.content;
          if (!messageContent || typeof messageContent !== "string") throw new Error("No response from LLM");
          
          // Parse suggestions from response
          const suggestions: any[] = [];
          try {
            const parsed = JSON.parse(messageContent);
            if (Array.isArray(parsed)) {
              suggestions.push(...parsed);
            } else if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
              suggestions.push(...parsed.suggestions);
            }
          } catch {
            suggestions.push({
              title: "AI Guidance",
              text: messageContent.substring(0, 500),
              priority: "medium",
            });
          }

          // Store suggestions
          for (const suggestion of suggestions) {
            await createAiSuggestion({
              workspaceId: wsId,
              aiRunId: 1,
              relatedRecordType: input.recordType,
              relatedRecordId: input.recordId,
              suggestionTitle: suggestion.title || "AI Suggestion",
              suggestionText: suggestion.text || messageContent,
              priority: suggestion.priority || "medium",
              suggestedAction: suggestion.action,
            });
          }

          try { await logAudit(wsId, ctx.user.id, "update", "ai", 0, input); } catch {}
          return { success: true, suggestionsCount: suggestions.length };
        } catch (error) {
          console.error("Error generating guidance:", error);
          throw error;
        }
      }),
    getSuggestions: protectedProcedure
      .input(z.object({
        recordType: z.string(),
        recordId: z.number(),
      }))
      .query(async ({ input, ctx }) => {
        try {
          const wsId = await requireWorkspaceId(ctx.user.id);
          return await getAiSuggestionsForRecord(wsId, input.recordType, input.recordId);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          return [];
        }
      }),
    dismissSuggestion: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const wsId = await requireWorkspaceId(ctx.user.id);
          await dismissAiSuggestion(input.id, wsId);
          try { await logAudit(wsId, ctx.user.id, "update", "ai", input.id, input); } catch {}
          return { success: true };
        } catch (error) {
          console.error("Error dismissing suggestion:", error);
          throw error;
        }
      }),
    acceptSuggestion: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        try {
          const wsId = await requireWorkspaceId(ctx.user.id);
          await acceptAiSuggestion(input.id, wsId);
          try { await logAudit(wsId, ctx.user.id, "update", "ai", input.id, input); } catch {}
          return { success: true };
        } catch (error) {
          console.error("Error accepting suggestion:", error);
          throw error;
        }
      }),
  }),
  legal: router({
    recordAcceptance: publicProcedure
      .input(z.object({
        documentType: z.string().default("terms_of_service"),
        version: z.string().default("1.0"),
      }))
      .mutation(async ({ input, ctx }) => {
        const { legalAcceptances } = await import("../drizzle/schema");
        const database = await getDb();
        if (!database) return { success: false };
        const userId = ctx.user?.id || 0;
        await database.insert(legalAcceptances).values({
          userId,
          documentType: input.documentType,
          documentVersion: input.version,
        });
        return { success: true };
      }),
    getAcceptance: protectedProcedure
      .query(async ({ ctx }) => {
        const { legalAcceptances } = await import("../drizzle/schema");
        const { eq, desc } = await import("drizzle-orm");
        const database = await getDb();
        if (!database) return null;
        const results = await database.select().from(legalAcceptances)
          .where(eq(legalAcceptances.userId, ctx.user.id))
          .orderBy(desc(legalAcceptances.acceptedAt))
          .limit(1);
        return results[0] || null;
      }),
    // Server-side consent audit trail (GDPR/CCPA)
    recordConsent: publicProcedure
      .input(z.object({
        policyVersion: z.string().default("1.0"),
        action: z.enum(["accepted", "declined"]),
        consentType: z.string().default("terms_and_privacy"),
      }))
      .mutation(async ({ input, ctx }) => {
        const { consentRecords } = await import("../drizzle/schema");
        const database = await getDb();
        if (!database) return { success: false };
        const userId = ctx.user?.id;
        if (!userId) return { success: false }; // only record for logged-in users
        // Get workspaceId if available
        let workspaceId: number | undefined;
        try {
          workspaceId = await requireWorkspaceId(userId);
        } catch { /* no workspace yet is fine */ }
        // Capture request metadata
        const ipAddress = (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
          || ctx.req.socket?.remoteAddress
          || undefined;
        const userAgent = (ctx.req.headers["user-agent"] as string | undefined)?.slice(0, 499);
        await database.insert(consentRecords).values({
          userId,
          workspaceId: workspaceId ?? null,
          consentType: input.consentType,
          policyVersion: input.policyVersion,
          action: input.action,
          ipAddress,
          userAgent,
        });
        if (workspaceId) { try { await logAudit(workspaceId, userId, "update", "legal", 0, input); } catch {} }
        return { success: true };
      }),
    // List consent history for the current user
    getConsentHistory: protectedProcedure
      .query(async ({ ctx }) => {
        const { consentRecords } = await import("../drizzle/schema");
        const { eq, desc } = await import("drizzle-orm");
        const database = await getDb();
        if (!database) return [];
        return database.select().from(consentRecords)
          .where(eq(consentRecords.userId, ctx.user.id))
          .orderBy(desc(consentRecords.acceptedAt))
          .limit(20);
      }),
  }),
});

export type AppRouter = typeof appRouter;

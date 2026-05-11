import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { getDb } from "./db";
import {
  files,
  emailNotifications,
  subscriptions,
  plans,
  templates,
  closeoutRecords,
  closeoutChecklistItems,
  lessonsLearned,
  capabilityStatements,
  contracts,
  opportunities,
  proposals,
  invoices,
  workspaceSettings,
} from "../drizzle/schema";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { getS3Config, uploadToS3, getPresignedDownloadUrl, deleteFromS3, getPresignedUploadUrl } from "./services/fileStorage";
import { sendEmail, getEmailConfig, EMAIL_TEMPLATES, sendWelcomeEmail } from "./services/email";
import { getPlatformStripeConfig, getWorkspacePlanLimits, getSubscriptionStatus, createCheckoutSession, checkPlanLimit } from "./services/billing";
import { storagePut } from "./storage";

// ===== FILE STORAGE ROUTER =====
export const fileStorageRouter = router({
  getConfig: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const config = await getS3Config(workspaceId);
    return { configured: !!config, region: config?.region, bucket: config?.bucket };
  }),

  upload: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      mimeType: z.string(),
      fileData: z.string(), // base64 encoded
      linkedRecordType: z.string().optional(),
      linkedRecordId: z.number().optional(),
      category: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const buffer = Buffer.from(input.fileData, "base64");
      const fileKey = `workspace-${workspaceId}/${Date.now()}-${input.fileName}`;

      // Try user-configured S3 first
      const s3Config = await getS3Config(workspaceId);
      let url: string;

      if (s3Config) {
        const result = await uploadToS3(s3Config, fileKey, buffer, input.mimeType);
        url = result.url;
      } else {
        // Fall back to built-in storage
        const result = await storagePut(fileKey, buffer, input.mimeType);
        url = result.url;
      }

      const [result] = await db.insert(files).values({
        workspaceId,
        name: input.fileName,
        fileKey,
        url,
        mimeType: input.mimeType,
        size: buffer.length,
        linkedRecordType: input.linkedRecordType || null,
        linkedRecordId: input.linkedRecordId || null,
        category: input.category || null,
        uploadedBy: ctx.user?.id || null,
      });

      return { id: result.insertId, fileKey, url };
    }),

  getDownloadUrl: protectedProcedure
    .input(z.object({ fileId: z.number() }))
    .query(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [file] = await db
        .select()
        .from(files)
        .where(and(eq(files.id, input.fileId), eq(files.workspaceId, workspaceId)));

      if (!file) throw new Error("File not found");

      const s3Config = await getS3Config(workspaceId);
      if (s3Config && file.url.startsWith("s3://")) {
        const presignedUrl = await getPresignedDownloadUrl(s3Config, file.fileKey);
        return { url: presignedUrl, name: file.name };
      }

      // Built-in storage
      return { url: file.url, name: file.name };
    }),

  list: protectedProcedure
    .input(z.object({
      linkedRecordType: z.string().optional(),
      linkedRecordId: z.number().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) return [];

      let query = db
        .select()
        .from(files)
        .where(and(eq(files.workspaceId, workspaceId), isNull(files.deletedAt)))
        .orderBy(desc(files.createdAt));

      return query;
    }),

  delete: protectedProcedure
    .input(z.object({ fileId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(files)
        .set({ deletedAt: new Date() })
        .where(and(eq(files.id, input.fileId), eq(files.workspaceId, workspaceId)));

      return { success: true };
    }),
});

// ===== EMAIL ROUTER =====
export const emailRouter = router({
  getConfig: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const config = await getEmailConfig(workspaceId);
    return { configured: !!config };
  }),

  getHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }).optional())
    .query(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) return [];

      return db
        .select()
        .from(emailNotifications)
        .where(eq(emailNotifications.workspaceId, workspaceId))
        .orderBy(desc(emailNotifications.createdAt))
        .limit(input?.limit || 50);
    }),

  sendTest: protectedProcedure
    .input(z.object({ recipientEmail: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      return sendEmail(
        workspaceId,
        input.recipientEmail,
        "Test Email from PrimeContractorOS",
        "<h2>Test Email</h2><p>This is a test email to verify your email configuration is working correctly.</p>",
        "test"
      );
    }),

  getTemplates: protectedProcedure.query(async () => {
    return Object.entries(EMAIL_TEMPLATES).map(([key, template]) => ({
      key,
      name: template.name,
      subject: typeof template.subject === "string" ? template.subject : "(dynamic)",
    }));
  }),
});

// ===== BILLING ROUTER =====
export const billingRouter = router({
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const stripeConfigured = !!getPlatformStripeConfig();
    const subscription = await getSubscriptionStatus(workspaceId);
    const limits = await getWorkspacePlanLimits(workspaceId);

    return {
      stripeConfigured,
      subscription,
      limits,
      developmentMode: !stripeConfigured,
    };
  }),

  getPlans: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(plans).where(eq(plans.isActive, true)).orderBy(plans.sortOrder);
  }),

  checkLimit: protectedProcedure
    .input(z.object({
      entityType: z.enum(["contracts", "proposals", "opportunities", "teamMembers"]),
      currentCount: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      return checkPlanLimit(workspaceId, input.entityType, input.currentCount);
    }),

  createCheckout: protectedProcedure
    .input(z.object({
      planId: z.number(),
      successUrl: z.string(),
      cancelUrl: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      return createCheckoutSession(workspaceId, input.planId, input.successUrl, input.cancelUrl);
    }),
});

// ===== REPORTS ROUTER =====
export const reportsRouter = router({
  generateContractSummary: protectedProcedure
    .input(z.object({ contractId: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const contractList = input.contractId
        ? await db.select().from(contracts).where(and(eq(contracts.id, input.contractId), eq(contracts.workspaceId, workspaceId)))
        : await db.select().from(contracts).where(and(eq(contracts.workspaceId, workspaceId), isNull(contracts.deletedAt)));

      const invoiceList = await db.select().from(invoices).where(eq(invoices.workspaceId, workspaceId));

      return {
        type: "contract_summary",
        generatedAt: new Date().toISOString(),
        data: {
          totalContracts: contractList.length,
          contracts: contractList.map((c) => ({
            id: c.id,
            title: c.title,
            status: c.status,
            value: c.value,
            startDate: c.startDate,
            endDate: c.endDate,
            agency: c.agency,
          })),
          financials: {
            totalInvoiced: invoiceList.reduce((sum, inv) => sum + parseFloat(inv.amount || "0"), 0),
            totalPaid: invoiceList.filter((i) => i.status === "paid").reduce((sum, inv) => sum + parseFloat(inv.amount || "0"), 0),
            totalOutstanding: invoiceList.filter((i) => i.status !== "paid").reduce((sum, inv) => sum + parseFloat(inv.amount || "0"), 0),
          },
        },
      };
    }),

  generateFinancialReport: protectedProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const invoiceList = await db.select().from(invoices).where(eq(invoices.workspaceId, workspaceId));
      const contractList = await db.select().from(contracts).where(and(eq(contracts.workspaceId, workspaceId), isNull(contracts.deletedAt)));

      const byContract = contractList.map((c) => {
        const contractInvoices = invoiceList.filter((i) => i.contractId === c.id);
        return {
          contractId: c.id,
          contractTitle: c.title,
          totalInvoiced: contractInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount || "0"), 0),
          totalPaid: contractInvoices.filter((i) => i.status === "paid").reduce((sum, inv) => sum + parseFloat(inv.amount || "0"), 0),
          outstanding: contractInvoices.filter((i) => i.status !== "paid").reduce((sum, inv) => sum + parseFloat(inv.amount || "0"), 0),
          invoiceCount: contractInvoices.length,
        };
      });

      return {
        type: "financial_report",
        generatedAt: new Date().toISOString(),
        period: { start: input.startDate || "all", end: input.endDate || "all" },
        data: {
          summary: {
            totalRevenue: byContract.reduce((sum, c) => sum + c.totalPaid, 0),
            totalOutstanding: byContract.reduce((sum, c) => sum + c.outstanding, 0),
            totalInvoiced: byContract.reduce((sum, c) => sum + c.totalInvoiced, 0),
          },
          byContract,
        },
      };
    }),

  generateWinLossAnalysis: protectedProcedure.mutation(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const proposalList = await db.select().from(proposals).where(and(eq(proposals.workspaceId, workspaceId), isNull(proposals.deletedAt)));

    const won = proposalList.filter((p) => p.status === "won");
    const lost = proposalList.filter((p) => p.status === "lost");
    const pending = proposalList.filter((p) => !["won", "lost"].includes(p.status || ""));

    return {
      type: "win_loss_analysis",
      generatedAt: new Date().toISOString(),
      data: {
        totalProposals: proposalList.length,
        won: won.length,
        lost: lost.length,
        pending: pending.length,
        winRate: proposalList.length > 0 ? Math.round((won.length / (won.length + lost.length)) * 100) || 0 : 0,
        wonProposals: won.map((p) => ({ id: p.id, title: p.title })),
        lostProposals: lost.map((p) => ({ id: p.id, title: p.title })),
      },
    };
  }),

  generateComplianceReport: protectedProcedure.mutation(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const contractList = await db.select().from(contracts).where(and(eq(contracts.workspaceId, workspaceId), isNull(contracts.deletedAt)));

    return {
      type: "compliance_status",
      generatedAt: new Date().toISOString(),
      data: {
        totalContracts: contractList.length,
        contracts: contractList.map((c) => ({
          id: c.id,
          title: c.title,
          status: c.status,
          endDate: c.endDate,
        })),
      },
    };
  }),
});

// ===== TEMPLATES ROUTER =====
export const templatesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const db = await getDb();
    if (!db) return [];
    return db.select().from(templates).where(eq(templates.workspaceId, workspaceId)).orderBy(desc(templates.createdAt));
  }),

  getDefaults: protectedProcedure.query(async () => {
    // Return built-in default templates
    return DEFAULT_TEMPLATES;
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [template] = await db.select().from(templates).where(and(eq(templates.id, input.id), eq(templates.workspaceId, workspaceId)));
      return template || null;
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      category: z.string(),
      content: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(templates).values({ workspaceId, ...input });
      return { id: result.insertId };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      content: z.string().optional(),
      category: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(templates).set(data).where(and(eq(templates.id, id), eq(templates.workspaceId, workspaceId)));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(templates).where(and(eq(templates.id, input.id), eq(templates.workspaceId, workspaceId)));
      return { success: true };
    }),

  createFromDefault: protectedProcedure
    .input(z.object({ templateKey: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const defaultTemplate = DEFAULT_TEMPLATES.find((t) => t.key === input.templateKey);
      if (!defaultTemplate) throw new Error("Template not found");
      const [result] = await db.insert(templates).values({
        workspaceId,
        name: defaultTemplate.name,
        category: defaultTemplate.category,
        content: defaultTemplate.content,
      });
      return { id: result.insertId };
    }),
});

// ===== CLOSEOUT ROUTER =====
export const closeoutRouter = router({
  getByContract: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .query(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) return null;

      const [record] = await db
        .select()
        .from(closeoutRecords)
        .where(and(eq(closeoutRecords.contractId, input.contractId), eq(closeoutRecords.workspaceId, workspaceId)));

      if (!record) return null;

      const items = await db
        .select()
        .from(closeoutChecklistItems)
        .where(eq(closeoutChecklistItems.closeoutId, record.id))
        .orderBy(closeoutChecklistItems.sortOrder);

      const completedCount = items.filter((i) => i.completed).length;
      const totalCount = items.length;
      const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      return { ...record, items, completedCount, totalCount, completionPercentage };
    }),

  initiate: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if closeout already exists
      const [existing] = await db
        .select()
        .from(closeoutRecords)
        .where(and(eq(closeoutRecords.contractId, input.contractId), eq(closeoutRecords.workspaceId, workspaceId)));

      if (existing) return { id: existing.id, alreadyExists: true };

      // Create closeout record
      const [record] = await db.insert(closeoutRecords).values({
        workspaceId,
        contractId: input.contractId,
        status: "in_progress",
      });

      const closeoutId = Number(record.insertId);

      // Create default checklist items
      const defaultItems = [
        { label: "Final invoice submitted", description: "Submit the final invoice for all remaining work performed" },
        { label: "All deliverables accepted", description: "Confirm all contract deliverables have been submitted and accepted by the government" },
        { label: "Government property returned", description: "Return all government-furnished property and equipment" },
        { label: "Subcontractor payments complete", description: "Verify all subcontractor invoices are paid in full" },
        { label: "Final report submitted", description: "Submit the final technical/performance report" },
        { label: "Security clearances terminated", description: "Process termination of any security clearances associated with the contract" },
        { label: "Contract files archived", description: "Archive all contract documentation per retention requirements" },
        { label: "Lessons learned documented", description: "Complete post-contract lessons learned review" },
        { label: "Release of claims signed", description: "Execute the release of claims document" },
        { label: "Final modification processed", description: "Process any final contract modifications (de-obligation of funds, etc.)" },
      ];

      for (let i = 0; i < defaultItems.length; i++) {
        await db.insert(closeoutChecklistItems).values({
          closeoutId,
          label: defaultItems[i].label,
          description: defaultItems[i].description,
          sortOrder: i + 1,
        });
      }

      return { id: closeoutId, alreadyExists: false };
    }),

  toggleItem: protectedProcedure
    .input(z.object({ itemId: z.number(), completed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(closeoutChecklistItems)
        .set({
          completed: input.completed,
          completedAt: input.completed ? new Date() : null,
          completedBy: input.completed ? ctx.user?.id || null : null,
        })
        .where(eq(closeoutChecklistItems.id, input.itemId));

      return { success: true };
    }),

  addItem: protectedProcedure
    .input(z.object({ closeoutId: z.number(), label: z.string(), description: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(closeoutChecklistItems).values({
        closeoutId: input.closeoutId,
        label: input.label,
        description: input.description || null,
        sortOrder: 99,
      });
      return { id: result.insertId };
    }),

  updateStatus: protectedProcedure
    .input(z.object({ closeoutId: z.number(), status: z.enum(["not_started", "in_progress", "pending_review", "completed"]) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db
        .update(closeoutRecords)
        .set({ status: input.status, completedAt: input.status === "completed" ? new Date() : null })
        .where(eq(closeoutRecords.id, input.closeoutId));
      return { success: true };
    }),
});

// ===== LESSONS LEARNED ROUTER =====
export const lessonsLearnedRouter = router({
  list: protectedProcedure
    .input(z.object({
      contractId: z.number().optional(),
      category: z.string().optional(),
      impact: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) return [];

      return db
        .select()
        .from(lessonsLearned)
        .where(eq(lessonsLearned.workspaceId, workspaceId))
        .orderBy(desc(lessonsLearned.createdAt));
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) return null;
      const [lesson] = await db
        .select()
        .from(lessonsLearned)
        .where(and(eq(lessonsLearned.id, input.id), eq(lessonsLearned.workspaceId, workspaceId)));
      return lesson || null;
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      contractId: z.number().optional(),
      proposalId: z.number().optional(),
      category: z.string().optional(),
      description: z.string().optional(),
      impact: z.enum(["positive", "negative", "neutral"]).optional(),
      severity: z.enum(["low", "medium", "high", "critical"]).optional(),
      rootCause: z.string().optional(),
      recommendation: z.string().optional(),
      tags: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(lessonsLearned).values({
        workspaceId,
        title: input.title,
        contractId: input.contractId || null,
        proposalId: input.proposalId || null,
        category: input.category || null,
        description: input.description || null,
        impact: input.impact || "neutral",
        severity: input.severity || "medium",
        rootCause: input.rootCause || null,
        recommendation: input.recommendation || null,
        tags: input.tags || null,
      });
      return { id: result.insertId };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      category: z.string().optional(),
      description: z.string().optional(),
      impact: z.enum(["positive", "negative", "neutral"]).optional(),
      severity: z.enum(["low", "medium", "high", "critical"]).optional(),
      rootCause: z.string().optional(),
      recommendation: z.string().optional(),
      tags: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(lessonsLearned).set(data).where(and(eq(lessonsLearned.id, id), eq(lessonsLearned.workspaceId, workspaceId)));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(lessonsLearned).where(and(eq(lessonsLearned.id, input.id), eq(lessonsLearned.workspaceId, workspaceId)));
      return { success: true };
    }),
});

// ===== CAPABILITY STATEMENT ROUTER =====
export const capabilityRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const db = await getDb();
    if (!db) return [];
    return db.select().from(capabilityStatements).where(eq(capabilityStatements.workspaceId, workspaceId)).orderBy(desc(capabilityStatements.createdAt));
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) return null;
      const [stmt] = await db.select().from(capabilityStatements).where(and(eq(capabilityStatements.id, input.id), eq(capabilityStatements.workspaceId, workspaceId)));
      return stmt || null;
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      version: z.string().optional(),
      content: z.string().optional(),
      naicsCodes: z.string().optional(),
      pastPerformance: z.string().optional(),
      differentiators: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [result] = await db.insert(capabilityStatements).values({
        workspaceId,
        title: input.title,
        version: input.version || "1.0",
        content: input.content || null,
        naicsCodes: input.naicsCodes || null,
        pastPerformance: input.pastPerformance || null,
        differentiators: input.differentiators || null,
        status: "draft",
      });
      return { id: result.insertId };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      version: z.string().optional(),
      content: z.string().optional(),
      naicsCodes: z.string().optional(),
      pastPerformance: z.string().optional(),
      differentiators: z.string().optional(),
      status: z.enum(["draft", "active", "archived"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      await db.update(capabilityStatements).set(data).where(and(eq(capabilityStatements.id, id), eq(capabilityStatements.workspaceId, workspaceId)));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(capabilityStatements).where(and(eq(capabilityStatements.id, input.id), eq(capabilityStatements.workspaceId, workspaceId)));
      return { success: true };
    }),

  // Pull data from workspace settings for pre-fill
  getProfileData: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const db = await getDb();
    if (!db) return {};
    const settings = await db.select().from(workspaceSettings).where(eq(workspaceSettings.workspaceId, workspaceId));
    const map: Record<string, string> = {};
    for (const s of settings) {
      if (s.settingValue) map[s.settingKey] = s.settingValue;
    }
    return map;
  }),
});

// ===== DEFAULT TEMPLATES =====
const DEFAULT_TEMPLATES = [
  {
    key: "proposal_outline",
    name: "Proposal Outline",
    category: "proposal",
    description: "Standard government proposal outline with all required sections",
    content: `# Proposal Outline

## 1. Executive Summary
- Brief overview of your understanding of the requirement
- Your proposed solution
- Key differentiators
- Relevant past performance summary

## 2. Technical Approach
### 2.1 Understanding of Requirements
### 2.2 Proposed Solution
### 2.3 Technical Methodology
### 2.4 Tools and Technologies
### 2.5 Risk Mitigation

## 3. Management Approach
### 3.1 Project Management Plan
### 3.2 Organizational Structure
### 3.3 Key Personnel
### 3.4 Quality Assurance
### 3.5 Communication Plan

## 4. Past Performance
### 4.1 Relevant Contract 1
### 4.2 Relevant Contract 2
### 4.3 Relevant Contract 3

## 5. Staffing Plan
### 5.1 Key Personnel Resumes
### 5.2 Staffing Matrix
### 5.3 Recruitment Plan

## 6. Cost/Price Volume
### 6.1 Cost Summary
### 6.2 Basis of Estimate
### 6.3 Rate Schedule
`,
  },
  {
    key: "contract_checklist",
    name: "Contract Startup Checklist",
    category: "contract",
    description: "Checklist for new contract startup activities",
    content: `# Contract Startup Checklist

## Administrative Setup
- [ ] Contract document reviewed and filed
- [ ] Key dates entered into tracking system
- [ ] Contract team notified and briefed
- [ ] Subcontractors notified (if applicable)
- [ ] Insurance requirements verified

## Financial Setup
- [ ] Billing codes established
- [ ] Budget loaded into accounting system
- [ ] Invoicing schedule confirmed
- [ ] Payment terms documented

## Technical Kickoff
- [ ] Kickoff meeting scheduled with government
- [ ] Work breakdown structure created
- [ ] Deliverable schedule confirmed
- [ ] Quality plan established
- [ ] Security requirements addressed

## Compliance
- [ ] Reporting requirements documented
- [ ] DCAA compliance verified (if cost-type)
- [ ] Labor categories confirmed
- [ ] Small business plan filed (if applicable)
`,
  },
  {
    key: "closeout_checklist",
    name: "Contract Closeout Checklist",
    category: "closeout",
    description: "Standard contract closeout checklist",
    content: `# Contract Closeout Checklist

## Financial Closeout
- [ ] Final invoice submitted
- [ ] All payments received
- [ ] Indirect rate adjustments processed
- [ ] Final incurred cost submission prepared
- [ ] Subcontractor final payments verified

## Deliverables & Performance
- [ ] All deliverables submitted and accepted
- [ ] Final performance report submitted
- [ ] Government acceptance letters received
- [ ] Data rights documentation complete

## Property & Security
- [ ] Government-furnished property returned
- [ ] Government-furnished equipment returned
- [ ] Security clearances terminated
- [ ] Classified materials returned/destroyed

## Administrative
- [ ] Release of claims signed
- [ ] Final contract modification processed
- [ ] Contract files archived
- [ ] Lessons learned documented
- [ ] Past performance reference prepared
- [ ] CPARS response submitted
`,
  },
  {
    key: "capability_statement",
    name: "Capability Statement Template",
    category: "capability",
    description: "One-page capability statement template",
    content: `# Capability Statement

## Company Overview
[Company Name] is a [size standard] business providing [services/products] to federal, state, and local government agencies.

## Core Competencies
- [Competency 1]
- [Competency 2]
- [Competency 3]
- [Competency 4]

## Past Performance
### Contract 1
- Agency: [Agency Name]
- Contract #: [Number]
- Value: $[Amount]
- Period: [Start] - [End]
- Description: [Brief description]

### Contract 2
- Agency: [Agency Name]
- Contract #: [Number]
- Value: $[Amount]
- Period: [Start] - [End]
- Description: [Brief description]

## Differentiators
- [What makes you unique]
- [Special capabilities]
- [Certifications or clearances]

## Company Data
- DUNS: [Number]
- UEI: [Number]
- CAGE Code: [Code]
- NAICS: [Codes]
- Set-Asides: [Applicable set-asides]

## Contact Information
[Name] | [Title]
[Phone] | [Email]
[Address]
[Website]
`,
  },
  {
    key: "past_performance",
    name: "Past Performance Writeup",
    category: "proposal",
    description: "Template for writing past performance narratives",
    content: `# Past Performance Narrative

## Contract Information
- **Contract Number:** [Number]
- **Contract Title:** [Title]
- **Contracting Agency:** [Agency]
- **Contract Type:** [FFP/T&M/Cost-Plus]
- **Contract Value:** $[Amount]
- **Period of Performance:** [Start Date] to [End Date]
- **Point of Contact:** [Name, Title, Phone, Email]

## Relevance to Current Requirement
[Explain how this past performance is relevant to the current solicitation. Address similar scope, complexity, size, and technical requirements.]

## Work Performed
[Describe the work performed, including specific tasks, deliverables, and outcomes. Be specific about your role if you were a subcontractor.]

## Challenges and Solutions
[Describe any significant challenges encountered and how your team resolved them. This demonstrates problem-solving capability.]

## Results and Outcomes
[Quantify results wherever possible. Include metrics such as cost savings, schedule improvements, quality metrics, etc.]

## Lessons Learned
[What did you learn from this contract that you will apply to the current requirement?]
`,
  },
];

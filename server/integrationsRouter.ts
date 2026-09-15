import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { logAudit } from "./featureRouter";
import { getDb, getInsertId } from "./db";
import {
  files,
  fileVersions,
  aiFindings,
  emailNotifications,
  subscriptions,
  plans,
  templates,
  closeoutRecords,
  closeoutChecklistItems,
  closeoutBlockingItems,
  closeoutEvidence,
  lessonsLearned,
  capabilityStatements,
  contracts,
  opportunities,
  proposals,
  invoices,
  workspaceSettings,
  tasks,
  checkoutSessions,
  workspaces,
  users,
} from "../drizzle/schema";
import { eq, and, desc, isNull, sql } from "drizzle-orm";
import { getS3Config, uploadToS3, getPresignedDownloadUrl, deleteFromS3, getPresignedUploadUrl } from "./services/fileStorage";
import { sendEmail, getEmailConfig, EMAIL_TEMPLATES, sendWelcomeEmail } from "./services/email";
import { getPlatformStripeConfig, getWorkspacePlanLimits, getSubscriptionStatus, createCheckoutSession, checkPlanLimit } from "./services/billing";
import { storagePut } from "./storage";
import { updateAccessState, evaluateAccess, logBillingAudit } from "./accessGating";

// ===== FILE STORAGE ROUTER =====
export const fileStorageRouter = router({
  getConfig: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const config = await getS3Config(workspaceId);
    // Always report as configured since built-in storage is always available
    return { configured: true, region: config?.region || "built-in", bucket: config?.bucket || "manus-storage" };
  }),

  upload: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      mimeType: z.string(),
      fileData: z.string(), // base64 encoded
      linkedRecordType: z.string().optional(),
      linkedRecordId: z.number().optional(),
      category: z.string().optional(),
      isGoverningDocument: z.boolean().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      const buffer = Buffer.from(input.fileData, "base64");
      if (buffer.length > MAX_FILE_SIZE) {
        throw new Error(`File exceeds 10MB limit (${(buffer.length / 1024 / 1024).toFixed(1)}MB). Please reduce file size or contact support for large file handling.`);
      }

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
        isGoverningDocument: input.isGoverningDocument || false,
        notes: input.notes || null,
        uploadedBy: ctx.user?.id || null,
        storageProvider: s3Config ? "s3" : "built-in",
      } as any);

      try { await logAudit(workspaceId, ctx.user.id, "create", "fileStorage", 0, { fileName: input.fileName, size: buffer.length }); } catch {}
      return { id: getInsertId(result), fileKey, url };
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

      const conditions: any[] = [eq(files.workspaceId, workspaceId), isNull(files.deletedAt)];
      if (input?.linkedRecordType) conditions.push(eq(files.linkedRecordType, input.linkedRecordType));
      if (input?.linkedRecordId) conditions.push(eq(files.linkedRecordId, input.linkedRecordId));

      return db
        .select()
        .from(files)
        .where(and(...conditions))
        .orderBy(desc(files.createdAt));
    }),

  bulkUpload: protectedProcedure
    .input(z.object({
      files: z.array(z.object({
        fileName: z.string(),
        mimeType: z.string(),
        fileData: z.string(),
        linkedRecordType: z.string().optional(),
        linkedRecordId: z.number().optional(),
        category: z.string().optional(),
        isGoverningDocument: z.boolean().optional(),
        notes: z.string().optional(),
      })).min(1).max(20),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB per file
      const results: Array<{ fileName: string; id?: number; error?: string }> = [];

      for (const fileInput of input.files) {
        try {
          const buffer = Buffer.from(fileInput.fileData, "base64");
          if (buffer.length > MAX_FILE_SIZE) {
            results.push({ fileName: fileInput.fileName, error: `File exceeds 10MB limit (${(buffer.length / 1024 / 1024).toFixed(1)}MB)` });
            continue;
          }
          const fileKey = `workspace-${workspaceId}/${Date.now()}-${fileInput.fileName}`;
          const s3Config = await getS3Config(workspaceId);
          let url: string;
          if (s3Config) {
            const result = await uploadToS3(s3Config, fileKey, buffer, fileInput.mimeType);
            url = result.url;
          } else {
            const result = await storagePut(fileKey, buffer, fileInput.mimeType);
            url = result.url;
          }
          const [result] = await db.insert(files).values({
            workspaceId,
            name: fileInput.fileName,
            fileKey,
            url,
            mimeType: fileInput.mimeType,
            size: buffer.length,
            linkedRecordType: fileInput.linkedRecordType || null,
            linkedRecordId: fileInput.linkedRecordId || null,
            category: fileInput.category || null,
            isGoverningDocument: fileInput.isGoverningDocument || false,
            notes: fileInput.notes || null,
            uploadedBy: ctx.user?.id || null,
            storageProvider: s3Config ? "s3" : "built-in",
          } as any);
          results.push({ fileName: fileInput.fileName, id: getInsertId(result) });
        } catch (err: any) {
          results.push({ fileName: fileInput.fileName, error: err.message || "Upload failed" });
        }
      }

      try { await logAudit(workspaceId, ctx.user.id, "create", "fileStorage.bulk", 0, { count: results.filter(r => r.id).length }); } catch {}
      return { results };
    }),

  uploadVersion: protectedProcedure
    .input(z.object({
      fileId: z.number(),
      fileName: z.string(),
      mimeType: z.string(),
      fileData: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      const buffer = Buffer.from(input.fileData, "base64");
      if (buffer.length > MAX_FILE_SIZE) {
        throw new Error(`File exceeds 10MB limit (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);
      }

      // Get current file to determine next version
      const [currentFile] = await db.select().from(files).where(and(eq(files.id, input.fileId), eq(files.workspaceId, workspaceId)));
      if (!currentFile) throw new Error("File not found");

      // Get max version number from versions table
      const existingVersions = await db.select().from(fileVersions).where(eq(fileVersions.fileId, input.fileId)).orderBy(desc(fileVersions.versionNumber));
      const nextVersion = existingVersions.length > 0 ? existingVersions[0].versionNumber + 1 : (currentFile.versionNumber || 1) + 1;

      // Upload the new file
      const fileKey = `workspace-${workspaceId}/${Date.now()}-v${nextVersion}-${input.fileName}`;
      const s3Config = await getS3Config(workspaceId);
      let url: string;
      if (s3Config) {
        const result = await uploadToS3(s3Config, fileKey, buffer, input.mimeType);
        url = result.url;
      } else {
        const result = await storagePut(fileKey, buffer, input.mimeType);
        url = result.url;
      }

      // Save old version to versions table (if not already saved)
      if (existingVersions.length === 0) {
        // Save the original as version 1
        await db.insert(fileVersions).values({
          fileId: input.fileId,
          workspaceId,
          versionNumber: currentFile.versionNumber || 1,
          fileKey: currentFile.fileKey,
          url: currentFile.url,
          size: currentFile.size,
          mimeType: currentFile.mimeType,
          uploadedBy: currentFile.uploadedBy,
          notes: "Original upload",
          createdAt: currentFile.createdAt,
        } as any);
      }

      // Save new version to versions table
      await db.insert(fileVersions).values({
        fileId: input.fileId,
        workspaceId,
        versionNumber: nextVersion,
        fileKey,
        url,
        size: buffer.length,
        mimeType: input.mimeType,
        uploadedBy: ctx.user?.id || null,
        notes: input.notes || null,
        createdAt: new Date(),
      } as any);

      // Update the main file record to point to the new version
      await db.update(files).set({
        fileKey,
        url,
        size: buffer.length,
        mimeType: input.mimeType,
        versionNumber: nextVersion,
        name: input.fileName,
      } as any).where(and(eq(files.id, input.fileId), eq(files.workspaceId, workspaceId)));

      try { await logAudit(workspaceId, ctx.user.id, "create", "fileVersion", input.fileId, { versionNumber: nextVersion }); } catch {}
      return { versionNumber: nextVersion, url };
    }),

  toggleGoverning: protectedProcedure
    .input(z.object({ fileId: z.number(), isGoverningDocument: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.update(files).set({ isGoverningDocument: input.isGoverningDocument } as any)
        .where(and(eq(files.id, input.fileId), eq(files.workspaceId, workspaceId)));

      // If marking as governing document on a contract, mark AI findings as stale
      if (input.isGoverningDocument) {
        const [file] = await db.select().from(files).where(and(eq(files.id, input.fileId), eq(files.workspaceId, workspaceId)));
        if (file && file.linkedRecordType === "contract" && file.linkedRecordId) {
          await db.update(aiFindings)
            .set({ staleStatus: "stale" } as any)
            .where(and(
              eq(aiFindings.workspaceId, workspaceId),
              eq(aiFindings.contractId, file.linkedRecordId),
              eq(aiFindings.staleStatus, "current")
            ));
        }
      }

      try { await logAudit(workspaceId, ctx.user.id, "update", "fileStorage.governing", input.fileId, { isGoverningDocument: input.isGoverningDocument }); } catch {}
      return { success: true };
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

      try { await logAudit(workspaceId, ctx.user.id, "delete", "fileStorage", 0, null); } catch {}
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
      billingInterval: z.enum(["month", "year"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const config = getPlatformStripeConfig();
      if (!config) return { url: null, error: "Stripe not configured" };

      const db = await getDb();
      if (!db) return { url: null, error: "Database not available" };

      const [plan] = await db.select().from(plans).where(eq(plans.id, input.planId));
      if (!plan) return { url: null, error: "Plan not found" };

      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(config.secretKey, { apiVersion: "2025-04-30.basil" as any });

      const interval = input.billingInterval || "month";
      const unitAmount = interval === "year"
        ? Math.round(parseFloat(plan.annualPrice || plan.monthlyPrice || "0") * 100)
        : Math.round(parseFloat(plan.monthlyPrice || "0") * 100);

      try {
        const session = await stripe.checkout.sessions.create({
          mode: "subscription",
          customer_email: ctx.user.email || undefined,
          client_reference_id: ctx.user.id.toString(),
          allow_promotion_codes: true,
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `PrimeContractorOS - ${plan.name}`,
                  description: plan.description || undefined,
                },
                recurring: { interval },
                unit_amount: unitAmount,
              },
              quantity: 1,
            },
          ],
          metadata: {
            workspaceId: String(workspaceId),
            planId: String(input.planId),
            user_id: String(ctx.user.id),
            customer_email: ctx.user.email || "",
            customer_name: ctx.user.name || "",
          },
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
        });
        return { url: session.url };
      } catch (error: any) {
        return { url: null, error: error.message };
      }
    }),

  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const config = getPlatformStripeConfig();
    if (!config) return { success: false, error: "Stripe not configured" };

    const db = await getDb();
    if (!db) return { success: false, error: "Database not available" };

    const [sub] = await db.select().from(subscriptions)
      .where(and(eq(subscriptions.workspaceId, workspaceId), eq(subscriptions.status, "active")));

    if (!sub || !sub.stripeSubscriptionId) {
      try { await logAudit(workspaceId, ctx.user.id, "delete", "billing", 0, null); } catch {}
      return { success: false, error: "No active subscription found" };
    }

    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(config.secretKey, { apiVersion: "2025-04-30.basil" as any });
      await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      await db.update(subscriptions)
        .set({ cancelAtPeriodEnd: true })
        .where(eq(subscriptions.id, sub.id));

      try { await logAudit(workspaceId, ctx.user.id, "delete", "billing", 0, null); } catch {}
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }),

  reactivateSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const config = getPlatformStripeConfig();
    if (!config) return { success: false, error: "Stripe not configured" };

    const db = await getDb();
    if (!db) return { success: false, error: "Database not available" };

    const [sub] = await db.select().from(subscriptions)
      .where(eq(subscriptions.workspaceId, workspaceId));

    if (!sub || !sub.stripeSubscriptionId) {
      try { await logAudit(workspaceId, ctx.user.id, "delete", "billing", 0, null); } catch {}
      return { success: false, error: "No subscription found" };
    }

    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(config.secretKey, { apiVersion: "2025-04-30.basil" as any });
      await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });

      await db.update(subscriptions)
        .set({ cancelAtPeriodEnd: false, status: "active" })
        .where(eq(subscriptions.id, sub.id));

      try { await logAudit(workspaceId, ctx.user.id, "delete", "billing", 0, null); } catch {}
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }),

  /**
   * verifyCheckout — called by /checkout/success page after Stripe redirects back.
   * Verifies the session server-side, records the checkout session, and returns
   * the current access state so the client can route accordingly.
   */
  verifyCheckout: protectedProcedure
    .input(z.object({
      sessionId: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: false, error: "Database not available", status: "error" as const };

      const config = getPlatformStripeConfig();
      if (!config) {
        // Development mode — no Stripe. Grant trial_active access.
        const userId = ctx.user.id;
        const [ws] = await db.select().from(workspaces).where(eq(workspaces.ownerId, userId)).limit(1);
        if (ws) {
          await updateAccessState(ws.id, "trial_active", "Development mode — Stripe not configured", userId);
        }
        return { success: true, status: "trial_active" as const, developmentMode: true, workspaceId: ws?.id ?? null, onboardingCompleted: ws?.onboardingCompleted ?? false };
      }

      try {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(config.secretKey, { apiVersion: "2025-04-30.basil" as any });

        // Retrieve session from Stripe
        const session = await stripe.checkout.sessions.retrieve(input.sessionId, {
          expand: ["subscription"],
        });

        // A Stripe redirect alone is not proof of successful activation.
        // Require a completed Checkout Session and a settled/no-payment-required state.
        if (session.status !== "complete" || !["paid", "no_payment_required"].includes(session.payment_status)) {
          return { success: false, error: "Payment not completed", status: "pending" as const };
        }

        const userId = ctx.user.id;
        const planIdStr = session.metadata?.planId;
        const planId = planIdStr ? parseInt(planIdStr) : null;

        // Checkout metadata is the source of truth for the workspace being purchased.
        // Verify that the authenticated user owns that workspace before activating it.
        const metadataWorkspaceId = Number(session.metadata?.workspaceId || 0);
        const [ws] = metadataWorkspaceId
          ? await db.select().from(workspaces).where(and(eq(workspaces.id, metadataWorkspaceId), eq(workspaces.ownerId, userId))).limit(1)
          : await db.select().from(workspaces).where(eq(workspaces.ownerId, userId)).limit(1);
        const workspaceId = ws?.id ?? null;
        if (!workspaceId) {
          return { success: false, error: "Checkout workspace could not be verified for this account", status: "error" as const };
        }
        if (metadataWorkspaceId && metadataWorkspaceId !== workspaceId) {
          return { success: false, error: "Checkout workspace does not belong to this account", status: "error" as const };
        }

        // Record checkout session
        const [existing] = await db.select().from(checkoutSessions)
          .where(eq(checkoutSessions.stripeSessionId, input.sessionId)).limit(1);
        if (!existing) {
          await db.insert(checkoutSessions).values({
            userId,
            workspaceId: workspaceId ?? undefined,
            planId: planId ?? 0,
            stripeSessionId: input.sessionId,
            status: session.status === "complete" ? "completed" : "pending",
            billingInterval: (session.metadata?.billingInterval as any) ?? "month",
            completedAt: session.status === "complete" ? new Date() : null,
            metadata: JSON.stringify({ stripeCustomerId: session.customer, stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : session.subscription?.id }),
          });
        } else {
          await db.update(checkoutSessions)
            .set({
              status: session.status === "complete" ? "completed" : "pending",
              workspaceId: workspaceId ?? undefined,
              completedAt: session.status === "complete" ? new Date() : null,
            })
            .where(eq(checkoutSessions.stripeSessionId, input.sessionId));
        }

        // Persist the Stripe subscription before granting access so billing and
        // authorization cannot drift apart. Re-verification is idempotent.
        const stripeSubscription = typeof session.subscription === "string" ? null : session.subscription;
        const stripeSubscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
        const stripeCustomerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        if (!planId || !stripeSubscriptionId) {
          return { success: false, error: "Stripe subscription metadata is incomplete", status: "error" as const };
        }
        const [existingSubscription] = await db.select().from(subscriptions)
          .where(eq(subscriptions.workspaceId, workspaceId)).limit(1);
        const stripeSubscriptionData = stripeSubscription as any;
        const subscriptionData = {
          planId,
          stripeCustomerId: stripeCustomerId || null,
          stripeSubscriptionId,
          status: ((stripeSubscription?.status || "active") === "trialing" ? "trialing" : "active") as "active" | "trialing",
          currentPeriodStart: stripeSubscriptionData?.current_period_start ? new Date(stripeSubscriptionData.current_period_start * 1000) : null,
          currentPeriodEnd: stripeSubscriptionData?.current_period_end ? new Date(stripeSubscriptionData.current_period_end * 1000) : null,
          cancelAtPeriodEnd: stripeSubscription?.cancel_at_period_end || false,
        };
        if (existingSubscription) {
          await db.update(subscriptions).set(subscriptionData).where(eq(subscriptions.id, existingSubscription.id));
        } else {
          await db.insert(subscriptions).values({ workspaceId, ...subscriptionData });
        }
        await db.update(workspaces).set({ planId }).where(eq(workspaces.id, workspaceId));

        await updateAccessState(
          workspaceId,
          subscriptionData.status === "trialing" ? "trial_active" : "active_paid",
          "Verified Stripe checkout completed",
          userId
        );
        await logBillingAudit(workspaceId, "checkout_completed", userId, `Plan ${planId} checkout completed via Stripe session ${input.sessionId}`);

        // Evaluate current access
        const access = workspaceId ? await evaluateAccess(workspaceId, userId) : null;

        return {
          success: true,
          status: (access?.status ?? "active_paid") as string,
          workspaceId,
          onboardingCompleted: ws?.onboardingCompleted ?? false,
        };
      } catch (error: any) {
        console.error("[verifyCheckout] Error:", error.message);
        return { success: false, error: error.message, status: "error" as const };
      }
    }),

  /**
   * getAccessStatus — returns the current access state for the authenticated user's workspace.
   */
  getAccessStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { allowed: true, status: "admin_bypass" as const };
    const userId = ctx.user.id;
    const [ws] = await db.select().from(workspaces).where(eq(workspaces.ownerId, userId)).limit(1);
    if (!ws) return { allowed: false, status: "no_access" as const, reason: "No workspace" };
    return evaluateAccess(ws.id, userId);
  }),

  /**
   * startTrial — grant trial_active access to a workspace (called during onboarding).
   */
  startTrial: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { success: false, error: "Database not available" };
    const userId = ctx.user.id;
    const [ws] = await db.select().from(workspaces).where(eq(workspaces.ownerId, userId)).limit(1);
    if (!ws) return { success: false, error: "No workspace found" };
    await updateAccessState(ws.id, "trial_active", "Trial started during onboarding", userId);
    await logBillingAudit(ws.id, "trial_started", userId, "Trial started during onboarding");
    return { success: true };
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
      try { await logAudit(workspaceId, ctx.user.id, "create", "templates", 0, input); } catch {}
      return { id: getInsertId(result) };
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
      try { await logAudit(workspaceId, ctx.user.id, "update", "templates", 0, input); } catch {}
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(templates).where(and(eq(templates.id, input.id), eq(templates.workspaceId, workspaceId)));
      try { await logAudit(workspaceId, ctx.user.id, "delete", "templates", input.id, null); } catch {}
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
      try { await logAudit(workspaceId, ctx.user.id, "delete", "templates", 0, null); } catch {}
      return { id: getInsertId(result) };
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

      const blockers = await db
        .select()
        .from(closeoutBlockingItems)
        .where(and(eq(closeoutBlockingItems.closeoutId, record.id), eq(closeoutBlockingItems.workspaceId, workspaceId)))
        .orderBy(desc(closeoutBlockingItems.createdAt));

      const evidence = await db
        .select()
        .from(closeoutEvidence)
        .where(and(eq(closeoutEvidence.closeoutId, record.id), eq(closeoutEvidence.workspaceId, workspaceId)));

      const completedCount = items.filter((i) => i.completed).length;
      const totalCount = items.length;
      const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
      const requiredItems = items.filter((i) => i.required);
      const requiredCompleted = requiredItems.filter((i) => i.completed).length;
      const unresolvedBlockers = blockers.filter((b) => b.status === "open");
      const canComplete = requiredCompleted === requiredItems.length && unresolvedBlockers.length === 0;

      return { ...record, items, blockers, evidence, completedCount, totalCount, completionPercentage, requiredCompleted, requiredTotal: requiredItems.length, unresolvedBlockers: unresolvedBlockers.length, canComplete };
    }),

  initiate: protectedProcedure
    .input(z.object({ contractId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify the contract belongs to the active workspace before creating or returning closeout data.
      const [contract] = await db
        .select({ id: contracts.id })
        .from(contracts)
        .where(and(eq(contracts.id, input.contractId), eq(contracts.workspaceId, workspaceId), isNull(contracts.deletedAt)))
        .limit(1);
      if (!contract) throw new Error("Contract not found in this workspace");

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
        initiatedBy: ctx.user?.id || null,
      });

      const closeoutId = getInsertId(record);

      // Create default checklist items (FAR 4.804 compliant)
      const defaultItems = [
        { label: "Final Deliverable Verification", description: "Verify all contract deliverables have been submitted and accepted by the government.", category: "Deliverables", required: true },
        { label: "Final Invoice Submission", description: "Submit the final invoice including all remaining billable work and any outstanding costs.", category: "Financial", required: true },
        { label: "Government Property Disposition", description: "Account for and return or dispose of all government-furnished property (GFP) and equipment.", category: "Property", required: true },
        { label: "Subcontractor Closeout", description: "Ensure all subcontractors have completed their work, submitted final invoices, and released claims.", category: "Subcontracts", required: true },
        { label: "Patent and Royalty Clearance", description: "File required patent reports and resolve any royalty obligations under the contract.", category: "IP/Legal", required: false },
        { label: "Final Compliance Review", description: "Conduct final review of all compliance requirements including FAR/DFARS clauses.", category: "Compliance", required: true },
        { label: "Release of Claims", description: "Prepare and submit the contractor release of claims document to the Contracting Officer.", category: "Legal", required: true },
        { label: "Final Audit Preparation", description: "Prepare documentation for potential DCAA audit of contract costs and billing.", category: "Audit", required: false },
        { label: "Record Retention Plan", description: "Establish record retention schedule per FAR 4.703 (minimum 3 years after final payment).", category: "Records", required: true },
        { label: "Lessons Learned Documentation", description: "Document lessons learned, performance metrics, and recommendations for future contracts.", category: "Knowledge", required: false },
      ];

      for (let i = 0; i < defaultItems.length; i++) {
        await db.insert(closeoutChecklistItems).values({
          closeoutId,
          label: defaultItems[i].label,
          description: defaultItems[i].description,
          category: defaultItems[i].category,
          required: defaultItems[i].required,
          sortOrder: i + 1,
        });
      }

      try { await logAudit(workspaceId, ctx.user.id, "create", "closeout", closeoutId, { contractId: input.contractId }); } catch {}
      return { id: closeoutId, alreadyExists: false };
    }),

  toggleItem: protectedProcedure
    .input(z.object({ itemId: z.number(), completed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [ownedItem] = await db
        .select({ id: closeoutChecklistItems.id })
        .from(closeoutChecklistItems)
        .innerJoin(closeoutRecords, eq(closeoutChecklistItems.closeoutId, closeoutRecords.id))
        .where(and(eq(closeoutChecklistItems.id, input.itemId), eq(closeoutRecords.workspaceId, workspaceId)))
        .limit(1);
      if (!ownedItem) throw new Error("Closeout checklist item not found in this workspace");

      await db
        .update(closeoutChecklistItems)
        .set({
          completed: input.completed,
          status: input.completed ? "completed" : "not_started",
          completedAt: input.completed ? new Date() : null,
          completedBy: input.completed ? ctx.user?.id || null : null,
        })
        .where(eq(closeoutChecklistItems.id, input.itemId));

      return { success: true };
    }),

  updateItem: protectedProcedure
    .input(z.object({
      itemId: z.number(),
      status: z.enum(["not_started", "in_progress", "completed", "blocked"]).optional(),
      owner: z.string().optional(),
      dueDate: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [ownedItem] = await db
        .select({ id: closeoutChecklistItems.id })
        .from(closeoutChecklistItems)
        .innerJoin(closeoutRecords, eq(closeoutChecklistItems.closeoutId, closeoutRecords.id))
        .where(and(eq(closeoutChecklistItems.id, input.itemId), eq(closeoutRecords.workspaceId, workspaceId)))
        .limit(1);
      if (!ownedItem) throw new Error("Closeout checklist item not found in this workspace");
      const { itemId, dueDate, status, ...rest } = input;
      const setData: any = { ...rest };
      if (status) {
        setData.status = status;
        setData.completed = status === "completed";
        setData.completedAt = status === "completed" ? new Date() : null;
        setData.completedBy = status === "completed" ? ctx.user?.id || null : null;
      }
      if (dueDate !== undefined) {
        setData.dueDate = dueDate ? new Date(dueDate) : null;
      }
      await db.update(closeoutChecklistItems).set(setData).where(eq(closeoutChecklistItems.id, itemId));
      return { success: true };
    }),

  addItem: protectedProcedure
    .input(z.object({
      closeoutId: z.number(),
      label: z.string(),
      description: z.string().optional(),
      required: z.boolean().optional(),
      category: z.string().optional(),
      owner: z.string().optional(),
      dueDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [ownedCloseout] = await db
        .select({ id: closeoutRecords.id })
        .from(closeoutRecords)
        .where(and(eq(closeoutRecords.id, input.closeoutId), eq(closeoutRecords.workspaceId, workspaceId)))
        .limit(1);
      if (!ownedCloseout) throw new Error("Closeout record not found in this workspace");
      const [result] = await db.insert(closeoutChecklistItems).values({
        closeoutId: input.closeoutId,
        label: input.label,
        description: input.description || null,
        required: input.required ?? true,
        category: input.category || null,
        owner: input.owner || null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        sortOrder: 99,
      });
      return { id: getInsertId(result) };
    }),

  // ===== BLOCKERS =====
  addBlocker: protectedProcedure
    .input(z.object({
      closeoutId: z.number(),
      title: z.string(),
      description: z.string().optional(),
      severity: z.enum(["low", "medium", "high", "critical"]).optional(),
      blockerType: z.string().optional(),
      owner: z.string().optional(),
      dueDate: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [ownedCloseout] = await db
        .select({ id: closeoutRecords.id })
        .from(closeoutRecords)
        .where(and(eq(closeoutRecords.id, input.closeoutId), eq(closeoutRecords.workspaceId, workspaceId)))
        .limit(1);
      if (!ownedCloseout) throw new Error("Closeout record not found in this workspace");
      const [result] = await db.insert(closeoutBlockingItems).values({
        closeoutId: input.closeoutId,
        workspaceId,
        title: input.title,
        blockerType: input.blockerType || "general",
        description: input.description || null,
        severity: input.severity || "medium",
        owner: input.owner || null,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      });
      try { await logAudit(workspaceId, ctx.user.id, "create", "closeoutBlocker", getInsertId(result), { title: input.title }); } catch {}
      return { id: getInsertId(result) };
    }),

  resolveBlocker: protectedProcedure
    .input(z.object({ blockerId: z.number(), resolutionNotes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(closeoutBlockingItems).set({
        status: "resolved",
        resolutionNotes: input.resolutionNotes || null,
        resolvedAt: new Date(),
        resolvedBy: ctx.user?.id || null,
      }).where(and(eq(closeoutBlockingItems.id, input.blockerId), eq(closeoutBlockingItems.workspaceId, workspaceId)));
      try { await logAudit(workspaceId, ctx.user.id, "update", "closeoutBlocker", input.blockerId, { action: "resolved" }); } catch {}
      return { success: true };
    }),

  waiveBlocker: protectedProcedure
    .input(z.object({ blockerId: z.number(), resolutionNotes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(closeoutBlockingItems).set({
        status: "waived",
        resolutionNotes: input.resolutionNotes || null,
        resolvedAt: new Date(),
        resolvedBy: ctx.user?.id || null,
      }).where(and(eq(closeoutBlockingItems.id, input.blockerId), eq(closeoutBlockingItems.workspaceId, workspaceId)));
      try { await logAudit(workspaceId, ctx.user.id, "update", "closeoutBlocker", input.blockerId, { action: "waived" }); } catch {}
      return { success: true };
    }),

  // ===== EVIDENCE =====
  addEvidence: protectedProcedure
    .input(z.object({
      closeoutId: z.number(),
      linkedItemType: z.enum(["checklist_item", "blocker"]),
      linkedItemId: z.number(),
      title: z.string(),
      url: z.string().optional(),
      fileId: z.number().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const [ownedCloseout] = await db
        .select({ id: closeoutRecords.id })
        .from(closeoutRecords)
        .where(and(eq(closeoutRecords.id, input.closeoutId), eq(closeoutRecords.workspaceId, workspaceId)))
        .limit(1);
      if (!ownedCloseout) throw new Error("Closeout record not found in this workspace");

      if (input.linkedItemType === "checklist_item") {
        const [ownedItem] = await db
          .select({ id: closeoutChecklistItems.id })
          .from(closeoutChecklistItems)
          .innerJoin(closeoutRecords, eq(closeoutChecklistItems.closeoutId, closeoutRecords.id))
          .where(and(
            eq(closeoutChecklistItems.id, input.linkedItemId),
            eq(closeoutChecklistItems.closeoutId, input.closeoutId),
            eq(closeoutRecords.workspaceId, workspaceId),
          ))
          .limit(1);
        if (!ownedItem) throw new Error("Closeout checklist item not found in this workspace");
      } else {
        const [ownedBlocker] = await db
          .select({ id: closeoutBlockingItems.id })
          .from(closeoutBlockingItems)
          .where(and(
            eq(closeoutBlockingItems.id, input.linkedItemId),
            eq(closeoutBlockingItems.closeoutId, input.closeoutId),
            eq(closeoutBlockingItems.workspaceId, workspaceId),
          ))
          .limit(1);
        if (!ownedBlocker) throw new Error("Closeout blocker not found in this workspace");
      }

      if (input.fileId) {
        const [ownedFile] = await db
          .select({ id: files.id })
          .from(files)
          .where(and(eq(files.id, input.fileId), eq(files.workspaceId, workspaceId), isNull(files.deletedAt)))
          .limit(1);
        if (!ownedFile) throw new Error("Evidence file not found in this workspace");
      }

      const [result] = await db.insert(closeoutEvidence).values({
        workspaceId,
        closeoutId: input.closeoutId,
        linkedItemType: input.linkedItemType,
        linkedItemId: input.linkedItemId,
        title: input.title,
        url: input.url || null,
        fileId: input.fileId || null,
        description: input.description || null,
        uploadedBy: ctx.user?.id || null,
      });
      try { await logAudit(workspaceId, ctx.user.id, "create", "closeoutEvidence", getInsertId(result), { title: input.title }); } catch {}
      return { id: getInsertId(result) };
    }),

  removeEvidence: protectedProcedure
    .input(z.object({ evidenceId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(closeoutEvidence).where(and(eq(closeoutEvidence.id, input.evidenceId), eq(closeoutEvidence.workspaceId, workspaceId)));
      return { success: true };
    }),

  // ===== SUMMARY =====
  generateSummary: protectedProcedure
    .input(z.object({ closeoutId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Fetch closeout data to generate summary
      const [record] = await db.select().from(closeoutRecords).where(and(eq(closeoutRecords.id, input.closeoutId), eq(closeoutRecords.workspaceId, workspaceId)));
      if (!record) throw new Error("Closeout record not found");

      const items = await db.select().from(closeoutChecklistItems).where(eq(closeoutChecklistItems.closeoutId, record.id));
      const blockers = await db.select().from(closeoutBlockingItems).where(and(eq(closeoutBlockingItems.closeoutId, record.id), eq(closeoutBlockingItems.workspaceId, workspaceId)));

      const totalItems = items.length;
      const completedItems = items.filter(i => i.completed).length;
      const requiredItems = items.filter(i => i.required);
      const requiredCompleted = requiredItems.filter(i => i.completed).length;
      const openBlockers = blockers.filter(b => b.status === "open");
      const resolvedBlockers = blockers.filter(b => b.status === "resolved");
      const waivedBlockers = blockers.filter(b => b.status === "waived");
      const blockedItems = items.filter(i => i.status === "blocked");

      const summaryLines: string[] = [
        `## Closeout Summary`,
        ``,
        `**Status:** ${(record.status || "in_progress").replace(/_/g, " ")}`,
        `**Progress:** ${completedItems}/${totalItems} items completed (${totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0}%)`,
        `**Required Items:** ${requiredCompleted}/${requiredItems.length} completed`,
        ``,
        `### Blockers`,
        `- Open: ${openBlockers.length}`,
        `- Resolved: ${resolvedBlockers.length}`,
        `- Waived: ${waivedBlockers.length}`,
        ``,
      ];

      if (openBlockers.length > 0) {
        summaryLines.push(`### Open Blockers`);
        openBlockers.forEach(b => summaryLines.push(`- **${b.title}** (${b.severity}) — ${b.description || "No description"}`));
        summaryLines.push(``);
      }

      if (blockedItems.length > 0) {
        summaryLines.push(`### Blocked Items`);
        blockedItems.forEach(i => summaryLines.push(`- ${i.label}`));
        summaryLines.push(``);
      }

      const incompleteRequired = requiredItems.filter(i => !i.completed);
      if (incompleteRequired.length > 0) {
        summaryLines.push(`### Remaining Required Items`);
        incompleteRequired.forEach(i => summaryLines.push(`- ${i.label} (${(i.status || "not_started").replace(/_/g, " ")})`));
        summaryLines.push(``);
      }

      if (requiredCompleted === requiredItems.length && openBlockers.length === 0) {
        summaryLines.push(`### \u2705 Ready for Completion`);
        summaryLines.push(`All required items are complete and no open blockers remain.`);
      } else {
        summaryLines.push(`### \u26a0\ufe0f Not Ready for Completion`);
        if (requiredCompleted < requiredItems.length) summaryLines.push(`- ${requiredItems.length - requiredCompleted} required item(s) still incomplete`);
        if (openBlockers.length > 0) summaryLines.push(`- ${openBlockers.length} open blocker(s) must be resolved or waived`);
      }

      const summary = summaryLines.join("\n");
      await db.update(closeoutRecords).set({ summary }).where(eq(closeoutRecords.id, input.closeoutId));
      try { await logAudit(workspaceId, ctx.user.id, "update", "closeout", input.closeoutId, { action: "generateSummary" }); } catch {}
      return { summary };
    }),

  // ===== STATUS + COMPLETION =====
  updateStatus: protectedProcedure
    .input(z.object({ closeoutId: z.number(), status: z.enum(["not_started", "in_progress", "pending_review", "completed"]) }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [ownedCloseout] = await db
        .select({ id: closeoutRecords.id })
        .from(closeoutRecords)
        .where(and(eq(closeoutRecords.id, input.closeoutId), eq(closeoutRecords.workspaceId, workspaceId)))
        .limit(1);
      if (!ownedCloseout) throw new Error("Closeout record not found in this workspace");

      // If trying to complete, enforce blocker check
      if (input.status === "completed") {
        const items = await db.select().from(closeoutChecklistItems).where(eq(closeoutChecklistItems.closeoutId, input.closeoutId));
        const requiredItems = items.filter(i => i.required);
        const requiredIncomplete = requiredItems.filter(i => !i.completed);
        if (requiredIncomplete.length > 0) {
          throw new Error(`Cannot complete closeout: ${requiredIncomplete.length} required item(s) are still incomplete.`);
        }

        const blockers = await db.select().from(closeoutBlockingItems).where(and(eq(closeoutBlockingItems.closeoutId, input.closeoutId), eq(closeoutBlockingItems.workspaceId, workspaceId)));
        const openBlockers = blockers.filter(b => b.status === "open");
        if (openBlockers.length > 0) {
          throw new Error(`Cannot complete closeout: ${openBlockers.length} unresolved blocker(s) remain. Resolve or waive them first.`);
        }
      }

      await db
        .update(closeoutRecords)
        .set({
          status: input.status,
          completedAt: input.status === "completed" ? new Date() : null,
          completedBy: input.status === "completed" ? ctx.user?.id || null : null,
        })
        .where(and(eq(closeoutRecords.id, input.closeoutId), eq(closeoutRecords.workspaceId, workspaceId)));

      if (input.status === "completed") {
        const [closeoutRecord] = await db.select({ contractId: closeoutRecords.contractId }).from(closeoutRecords)
          .where(and(eq(closeoutRecords.id, input.closeoutId), eq(closeoutRecords.workspaceId, workspaceId))).limit(1);
        if (closeoutRecord?.contractId) {
          const lessonTaskTitle = "Capture lessons learned before final contract closure";
          const [existingLessonTask] = await db.select({ id: tasks.id }).from(tasks).where(and(
            eq(tasks.workspaceId, workspaceId),
            eq(tasks.linkedRecordType, "contract"),
            eq(tasks.linkedRecordId, closeoutRecord.contractId),
            eq(tasks.title, lessonTaskTitle),
          )).limit(1);
          if (!existingLessonTask) {
            await db.insert(tasks).values({
              workspaceId,
              title: lessonTaskTitle,
              description: "Closeout is complete. Review performance, subcontractor execution, compliance, billing, communication, risks, and reusable improvements. Record lessons before marking the contract Closed.",
              linkedRecordType: "contract",
              linkedRecordId: closeoutRecord.contractId,
              priority: "medium",
              status: "todo",
            });
          }
        }
      }

      try { await logAudit(workspaceId, ctx.user.id, "update", "closeout", input.closeoutId, { status: input.status }); } catch {}
      return { success: true };
    }),

  updateNotes: protectedProcedure
    .input(z.object({ closeoutId: z.number(), notes: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.update(closeoutRecords).set({ notes: input.notes }).where(and(eq(closeoutRecords.id, input.closeoutId), eq(closeoutRecords.workspaceId, workspaceId)));
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
      lessonType: z.string().optional(),
      impactLevel: z.string().optional(),
      status: z.string().optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) return [];

      let results = await db
        .select()
        .from(lessonsLearned)
        .where(eq(lessonsLearned.workspaceId, workspaceId))
        .orderBy(desc(lessonsLearned.createdAt));

      // Apply filters in memory for flexibility
      if (input?.contractId) {
        results = results.filter(r => r.contractId === input.contractId);
      }
      if (input?.lessonType && input.lessonType !== "all") {
        results = results.filter(r => r.lessonType === input.lessonType);
      }
      if (input?.impactLevel && input.impactLevel !== "all") {
        results = results.filter(r => r.impactLevel === input.impactLevel);
      }
      if (input?.impact && input.impact !== "all") {
        results = results.filter(r => r.impact === input.impact);
      }
      if (input?.status && input.status !== "all") {
        results = results.filter(r => (r as any).lessonStatus === input.status || r.status === input.status);
      }
      if (input?.category && input.category !== "all") {
        results = results.filter(r => r.category === input.category);
      }
      if (input?.search) {
        const s = input.search.toLowerCase();
        results = results.filter(r =>
          r.title.toLowerCase().includes(s) ||
          (r.description || "").toLowerCase().includes(s) ||
          (r.recommendation || "").toLowerCase().includes(s) ||
          (r.rootCause || "").toLowerCase().includes(s) ||
          (r.tags || "").toLowerCase().includes(s)
        );
      }
      return results;
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
      title: z.string().min(1),
      contractId: z.number().optional(),
      proposalId: z.number().optional(),
      category: z.string().optional(),
      lessonType: z.string().optional(),
      description: z.string().optional(),
      impact: z.enum(["positive", "negative", "neutral"]).optional(),
      impactLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
      severity: z.enum(["low", "medium", "high", "critical"]).optional(),
      rootCause: z.string().optional(),
      recommendation: z.string().optional(),
      whatHappened: z.string().optional(),
      whatWorked: z.string().optional(),
      whatDidNotWork: z.string().optional(),
      actionTaken: z.string().optional(),
      preventionSteps: z.string().optional(),
      linkedRecordType: z.enum(["contract", "proposal", "opportunity"]).optional(),
      linkedRecordId: z.number().optional(),
      linkedRecordTitle: z.string().optional(),
      status: z.enum(["draft", "active", "archived", "applied"]).optional(),
      visibility: z.enum(["workspace", "team", "private"]).optional(),
      tags: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      if ((input.linkedRecordType && !input.linkedRecordId) || (!input.linkedRecordType && input.linkedRecordId)) {
        throw new Error("Linked record type and linked record ID must be provided together.");
      }

      if (input.contractId) {
        const [ownedContract] = await db.select({ id: contracts.id }).from(contracts)
          .where(and(eq(contracts.id, input.contractId), eq(contracts.workspaceId, workspaceId), isNull(contracts.deletedAt)))
          .limit(1);
        if (!ownedContract) throw new Error("Contract not found in this workspace");
      }
      if (input.proposalId) {
        const [ownedProposal] = await db.select({ id: proposals.id }).from(proposals)
          .where(and(eq(proposals.id, input.proposalId), eq(proposals.workspaceId, workspaceId), isNull(proposals.deletedAt)))
          .limit(1);
        if (!ownedProposal) throw new Error("Proposal not found in this workspace");
      }
      if (input.linkedRecordType && input.linkedRecordId) {
        if (input.linkedRecordType === "contract") {
          const [owned] = await db.select({ id: contracts.id }).from(contracts)
            .where(and(eq(contracts.id, input.linkedRecordId), eq(contracts.workspaceId, workspaceId), isNull(contracts.deletedAt))).limit(1);
          if (!owned) throw new Error("Linked contract not found in this workspace");
        } else if (input.linkedRecordType === "proposal") {
          const [owned] = await db.select({ id: proposals.id }).from(proposals)
            .where(and(eq(proposals.id, input.linkedRecordId), eq(proposals.workspaceId, workspaceId), isNull(proposals.deletedAt))).limit(1);
          if (!owned) throw new Error("Linked proposal not found in this workspace");
        } else if (input.linkedRecordType === "opportunity") {
          const [owned] = await db.select({ id: opportunities.id }).from(opportunities)
            .where(and(eq(opportunities.id, input.linkedRecordId), eq(opportunities.workspaceId, workspaceId), isNull(opportunities.deletedAt))).limit(1);
          if (!owned) throw new Error("Linked opportunity not found in this workspace");
        }
      }

      const [result] = await db.insert(lessonsLearned).values({
        workspaceId,
        title: input.title,
        contractId: input.contractId || null,
        proposalId: input.proposalId || null,
        category: input.category || null,
        lessonType: input.lessonType || "other",
        description: input.description || null,
        impact: input.impact || "neutral",
        impactLevel: input.impactLevel || "medium",
        severity: input.severity || "medium",
        rootCause: input.rootCause || null,
        recommendation: input.recommendation || null,
        whatHappened: input.whatHappened || null,
        whatWorked: input.whatWorked || null,
        whatDidNotWork: input.whatDidNotWork || null,
        actionTaken: input.actionTaken || null,
        preventionSteps: input.preventionSteps || null,
        linkedRecordType: input.linkedRecordType || null,
        linkedRecordId: input.linkedRecordId || null,
        linkedRecordTitle: input.linkedRecordTitle || null,
        status: input.status || "active",
        visibility: input.visibility || "workspace",
        authorId: ctx.user.id,
        tags: input.tags || null,
      });
      try { await logAudit(workspaceId, ctx.user.id, "create", "lessonsLearned", 0, input); } catch {}
      return { id: getInsertId(result) };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      category: z.string().optional(),
      lessonType: z.string().optional(),
      description: z.string().optional(),
      impact: z.enum(["positive", "negative", "neutral"]).optional(),
      impactLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
      severity: z.enum(["low", "medium", "high", "critical"]).optional(),
      rootCause: z.string().optional(),
      recommendation: z.string().optional(),
      whatHappened: z.string().optional(),
      whatWorked: z.string().optional(),
      whatDidNotWork: z.string().optional(),
      actionTaken: z.string().optional(),
      preventionSteps: z.string().optional(),
      linkedRecordType: z.enum(["contract", "proposal", "opportunity"]).optional(),
      linkedRecordId: z.number().nullable().optional(),
      linkedRecordTitle: z.string().nullable().optional(),
      status: z.enum(["draft", "active", "archived", "applied"]).optional(),
      visibility: z.enum(["workspace", "team", "private"]).optional(),
      tags: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;

      if (input.linkedRecordType !== undefined || input.linkedRecordId !== undefined) {
        const [existingLesson] = await db.select({
          linkedRecordType: lessonsLearned.linkedRecordType,
          linkedRecordId: lessonsLearned.linkedRecordId,
        }).from(lessonsLearned)
          .where(and(eq(lessonsLearned.id, id), eq(lessonsLearned.workspaceId, workspaceId)))
          .limit(1);
        if (!existingLesson) throw new Error("Lesson not found.");

        const nextType = input.linkedRecordType ?? existingLesson.linkedRecordType;
        const nextId = input.linkedRecordId ?? existingLesson.linkedRecordId;
        if (nextType && nextId) {
          if (nextType === "contract") {
            const [owned] = await db.select({ id: contracts.id }).from(contracts)
              .where(and(eq(contracts.id, nextId), eq(contracts.workspaceId, workspaceId), isNull(contracts.deletedAt))).limit(1);
            if (!owned) throw new Error("Linked contract not found in this workspace");
          } else if (nextType === "proposal") {
            const [owned] = await db.select({ id: proposals.id }).from(proposals)
              .where(and(eq(proposals.id, nextId), eq(proposals.workspaceId, workspaceId), isNull(proposals.deletedAt))).limit(1);
            if (!owned) throw new Error("Linked proposal not found in this workspace");
          } else if (nextType === "opportunity") {
            const [owned] = await db.select({ id: opportunities.id }).from(opportunities)
              .where(and(eq(opportunities.id, nextId), eq(opportunities.workspaceId, workspaceId), isNull(opportunities.deletedAt))).limit(1);
            if (!owned) throw new Error("Linked opportunity not found in this workspace");
          }
        }
      }

      // Remove undefined keys
      const updateData: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(data)) {
        if (v !== undefined) updateData[k] = v;
      }
      await db.update(lessonsLearned).set(updateData).where(and(eq(lessonsLearned.id, id), eq(lessonsLearned.workspaceId, workspaceId)));
      try { await logAudit(workspaceId, ctx.user.id, "update", "lessonsLearned", 0, input); } catch {}
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(lessonsLearned).where(and(eq(lessonsLearned.id, input.id), eq(lessonsLearned.workspaceId, workspaceId)));
      try { await logAudit(workspaceId, ctx.user.id, "delete", "lessonsLearned", input.id, null); } catch {}
      return { success: true };
    }),

  // Apply lesson to a template
  applyToTemplate: protectedProcedure
    .input(z.object({
      lessonId: z.number(),
      templateId: z.number(),
      appendContent: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      // Verify lesson belongs to workspace
      const [lesson] = await db.select().from(lessonsLearned)
        .where(and(eq(lessonsLearned.id, input.lessonId), eq(lessonsLearned.workspaceId, workspaceId)));
      if (!lesson) throw new Error("Lesson not found.");
      // Verify template belongs to workspace
      const [template] = await db.select().from(templates)
        .where(and(eq(templates.id, input.templateId), eq(templates.workspaceId, workspaceId)));
      if (!template) throw new Error("Template not found.");
      // Append lesson content to template
      const lessonContent = input.appendContent || `\n\n---\n**Lesson Learned:** ${lesson.title}\n${lesson.recommendation || lesson.description || ""}`;
      const newContent = (template.content || "") + lessonContent;
      await db.update(templates).set({ content: newContent }).where(eq(templates.id, input.templateId));
      // Mark lesson as applied
      await db.update(lessonsLearned).set({ appliedToTemplateId: input.templateId, status: "applied" })
        .where(eq(lessonsLearned.id, input.lessonId));
      try { await logAudit(workspaceId, ctx.user.id, "update", "lessonsLearned", input.lessonId, { action: "applyToTemplate", templateId: input.templateId }); } catch {}
      return { success: true };
    }),

  // Create a task from a lesson
  createTask: protectedProcedure
    .input(z.object({
      lessonId: z.number(),
      taskTitle: z.string().min(1),
      taskDescription: z.string().optional(),
      dueDate: z.date().optional(),
      priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      // Verify lesson belongs to workspace
      const [lesson] = await db.select().from(lessonsLearned)
        .where(and(eq(lessonsLearned.id, input.lessonId), eq(lessonsLearned.workspaceId, workspaceId)));
      if (!lesson) throw new Error("Lesson not found.");
      // Create the task
      const [taskResult] = await db.insert(tasks).values({
        workspaceId,
        title: input.taskTitle,
        description: input.taskDescription || `Task created from lesson: ${lesson.title}`,
        dueDate: input.dueDate || null,
        priority: input.priority || "medium",
        status: "todo",
        linkedRecordType: "lesson",
        linkedRecordId: lesson.id,
      });
      // Link task back to lesson
      await db.update(lessonsLearned).set({ createdTaskId: getInsertId(taskResult) })
        .where(eq(lessonsLearned.id, input.lessonId));
      try { await logAudit(workspaceId, ctx.user.id, "create", "tasks", Number(getInsertId(taskResult)), { source: "lesson", lessonId: input.lessonId }); } catch {}
      return { success: true, taskId: getInsertId(taskResult) };
    }),

  // Get stats/counts for the lessons page header
  stats: protectedProcedure.query(async ({ ctx }) => {
    const workspaceId = await requireWorkspaceId(ctx.user.id);
    const db = await getDb();
    if (!db) return { total: 0, positive: 0, negative: 0, neutral: 0, applied: 0 };
    const all = await db.select().from(lessonsLearned)
      .where(eq(lessonsLearned.workspaceId, workspaceId));
    return {
      total: all.length,
      positive: all.filter(l => l.impact === "positive").length,
      negative: all.filter(l => l.impact === "negative").length,
      neutral: all.filter(l => l.impact === "neutral").length,
      applied: all.filter(l => l.status === "applied" || l.appliedToTemplateId).length,
    };
  }),

  // Get linkable records for the linking UI
  linkableRecords: protectedProcedure
    .input(z.object({ recordType: z.string() }))
    .query(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) return [];
      switch (input.recordType) {
        case "contract":
          return (await db.select({ id: contracts.id, title: contracts.title }).from(contracts)
            .where(and(eq(contracts.workspaceId, workspaceId), isNull(contracts.deletedAt)))).map(r => ({ id: r.id, title: r.title }));
        case "proposal":
          return (await db.select({ id: proposals.id, title: proposals.title }).from(proposals)
            .where(and(eq(proposals.workspaceId, workspaceId), isNull(proposals.deletedAt)))).map(r => ({ id: r.id, title: r.title }));
        case "opportunity":
          return (await db.select({ id: opportunities.id, title: opportunities.title }).from(opportunities)
            .where(and(eq(opportunities.workspaceId, workspaceId), isNull(opportunities.deletedAt)))).map(r => ({ id: r.id, title: r.title }));
        default:
          return [];
      }
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
      try { await logAudit(workspaceId, ctx.user.id, "create", "capability", 0, input); } catch {}
      return { id: getInsertId(result) };
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
      try { await logAudit(workspaceId, ctx.user.id, "update", "capability", 0, input); } catch {}
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.delete(capabilityStatements).where(and(eq(capabilityStatements.id, input.id), eq(capabilityStatements.workspaceId, workspaceId)));
      try { await logAudit(workspaceId, ctx.user.id, "delete", "capability", input.id, null); } catch {}
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

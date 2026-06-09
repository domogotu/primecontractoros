// @ts-nocheck
/**
 * Platform Health Router
 * Provides system health checks, integration status, notification template management,
 * security/audit log queries, and launch readiness checklist management.
 */
import { z } from "zod";
import { adminProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import {
  systemErrors,
  webhookDeliveries,
  platformTaskRuns,
  loginEvents,
  platformAuditLog,
  workspaces,
  emailTemplates,
  launchReadinessItems,
  notificationTemplates,
  integrationTestResults,
} from "../drizzle/schema";
import { eq, desc, and, sql, count, gte } from "drizzle-orm";

// ==================== ENV VAR CHECKS (never expose values) ====================
const REQUIRED_ENV_VARS = [
  { key: "DATABASE_URL", label: "Database", category: "database" },
  { key: "OAUTH_SERVER_URL", label: "OAuth/Auth Server", category: "auth" },
  { key: "JWT_SECRET", label: "JWT Secret", category: "auth" },
  { key: "VITE_APP_ID", label: "App ID", category: "auth" },
  { key: "OWNER_OPEN_ID", label: "Platform Owner ID", category: "auth" },
  { key: "STRIPE_SECRET_KEY", label: "Stripe Secret Key", category: "stripe" },
  { key: "STRIPE_PUBLISHABLE_KEY", label: "Stripe Publishable Key", category: "stripe" },
  { key: "STRIPE_WEBHOOK_SECRET", label: "Stripe Webhook Secret", category: "stripe" },
  { key: "SAM_GOV_API_KEY", label: "SAM.gov API Key", category: "sam_gov" },
  { key: "OPENAI_API_KEY", label: "OpenAI API Key", category: "openai" },
  { key: "RESEND_API_KEY", label: "Resend (Email) API Key", category: "email" },
  { key: "AWS_ACCESS_KEY_ID", label: "AWS Access Key", category: "file_storage" },
  { key: "AWS_SECRET_ACCESS_KEY", label: "AWS Secret Key", category: "file_storage" },
  { key: "AWS_S3_BUCKET", label: "S3 Bucket Name", category: "file_storage" },
  { key: "AWS_REGION", label: "AWS Region", category: "file_storage" },
];

function checkEnvVars() {
  return REQUIRED_ENV_VARS.map((v) => ({
    key: v.key,
    label: v.label,
    category: v.category,
    configured: !!process.env[v.key] && process.env[v.key]!.length > 0,
  }));
}

function getIntegrationStatuses(envVars: ReturnType<typeof checkEnvVars>) {
  const byCategory = (cat: string) => envVars.filter((v) => v.category === cat);
  const allConfigured = (cat: string) => byCategory(cat).every((v) => v.configured);
  const someConfigured = (cat: string) => byCategory(cat).some((v) => v.configured);

  return [
    {
      name: "Database",
      key: "database",
      status: allConfigured("database") ? "configured" : "not_configured",
      requiredVars: byCategory("database"),
    },
    {
      name: "Authentication",
      key: "auth",
      status: allConfigured("auth") ? "configured" : someConfigured("auth") ? "partial" : "not_configured",
      requiredVars: byCategory("auth"),
    },
    {
      name: "Stripe (Billing)",
      key: "stripe",
      status: allConfigured("stripe") ? "configured" : someConfigured("stripe") ? "partial" : "not_configured",
      requiredVars: byCategory("stripe"),
    },
    {
      name: "SAM.gov",
      key: "sam_gov",
      status: allConfigured("sam_gov") ? "configured" : "not_configured",
      requiredVars: byCategory("sam_gov"),
    },
    {
      name: "OpenAI / AI",
      key: "openai",
      status: allConfigured("openai") ? "configured" : "not_configured",
      requiredVars: byCategory("openai"),
    },
    {
      name: "Email Provider (Resend)",
      key: "email",
      status: allConfigured("email") ? "configured" : "not_configured",
      requiredVars: byCategory("email"),
    },
    {
      name: "File Storage (S3)",
      key: "file_storage",
      status: allConfigured("file_storage") ? "configured" : someConfigured("file_storage") ? "partial" : "not_configured",
      requiredVars: byCategory("file_storage"),
    },
  ];
}

// ==================== PLATFORM HEALTH ROUTER ====================
export const platformHealthRouter = router({
  // --- System Health ---
  runHealthCheck: adminProcedure.mutation(async () => {
    const envVars = checkEnvVars();
    const integrations = getIntegrationStatuses(envVars);

    // Check database connectivity
    let dbConnected = false;
    let dbError: string | null = null;
    try {
      const db = await getDb();
      if (db) {
        await db.execute(sql`SELECT 1`);
        dbConnected = true;
      } else {
        dbError = "Database not initialized (DATABASE_URL may be missing)";
      }
    } catch (e: any) {
      dbError = e.message || "Unknown database error";
    }

    return {
      timestamp: new Date().toISOString(),
      database: { connected: dbConnected, error: dbError },
      envVars,
      integrations,
    };
  }),

  getHealthStatus: adminProcedure.query(async () => {
    const envVars = checkEnvVars();
    const integrations = getIntegrationStatuses(envVars);

    let dbConnected = false;
    let dbError: string | null = null;
    try {
      const db = await getDb();
      if (db) {
        await db.execute(sql`SELECT 1`);
        dbConnected = true;
      } else {
        dbError = "Database not initialized";
      }
    } catch (e: any) {
      dbError = e.message || "Unknown database error";
    }

    return {
      timestamp: new Date().toISOString(),
      database: { connected: dbConnected, error: dbError },
      envVars,
      integrations,
    };
  }),

  getRecentErrors: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(systemErrors).orderBy(desc(systemErrors.createdAt)).limit(50);
  }),

  markErrorReviewed: adminProcedure
    .input(z.object({ id: z.number(), resolution: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.update(systemErrors).set({
        status: "resolved",
        resolution: input.resolution || "Reviewed by admin",
        resolvedAt: new Date(),
      }).where(eq(systemErrors.id, input.id));
      return { success: true };
    }),

  getRecentWebhookDeliveries: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(webhookDeliveries).orderBy(desc(webhookDeliveries.deliveredAt)).limit(50);
  }),

  getFailedTaskRuns: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(platformTaskRuns)
      .where(eq(platformTaskRuns.status, "failed"))
      .orderBy(desc(platformTaskRuns.createdAt))
      .limit(50);
  }),

  // --- Integrations ---
  getIntegrationStatus: adminProcedure.query(async () => {
    const envVars = checkEnvVars();
    const integrations = getIntegrationStatuses(envVars);

    // Get latest test results
    const db = await getDb();
    let testResults: any[] = [];
    if (db) {
      testResults = await db.select().from(integrationTestResults)
        .orderBy(desc(integrationTestResults.testedAt))
        .limit(20);
    }

    return { integrations, testResults };
  }),

  testConnection: adminProcedure
    .input(z.object({ integrationKey: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const envVars = checkEnvVars();
      const integrations = getIntegrationStatuses(envVars);
      const integration = integrations.find((i) => i.key === input.integrationKey);

      if (!integration) {
        return { success: false, message: "Unknown integration" };
      }

      let status: "pass" | "fail" | "warning" = "fail";
      let message = "";

      if (integration.status === "not_configured") {
        message = `Required environment variables not configured for ${integration.name}`;
        status = "fail";
      } else if (input.integrationKey === "database") {
        try {
          const db = await getDb();
          if (db) {
            await db.execute(sql`SELECT 1`);
            status = "pass";
            message = "Database connection successful";
          } else {
            message = "Database not initialized";
          }
        } catch (e: any) {
          message = e.message || "Database connection failed";
        }
      } else if (input.integrationKey === "stripe") {
        // Check if Stripe key is present (don't make actual API call for safety)
        if (process.env.STRIPE_SECRET_KEY) {
          status = "pass";
          message = "Stripe API key configured. Connectivity assumed (key present).";
        } else {
          message = "STRIPE_SECRET_KEY not set";
        }
      } else if (input.integrationKey === "sam_gov") {
        if (process.env.SAM_GOV_API_KEY) {
          status = "pass";
          message = "SAM.gov API key configured.";
        } else {
          message = "SAM_GOV_API_KEY not set";
        }
      } else if (input.integrationKey === "openai") {
        if (process.env.OPENAI_API_KEY) {
          status = "pass";
          message = "OpenAI API key configured.";
        } else {
          message = "OPENAI_API_KEY not set";
        }
      } else if (input.integrationKey === "email") {
        if (process.env.RESEND_API_KEY) {
          status = "pass";
          message = "Resend email API key configured.";
        } else {
          message = "RESEND_API_KEY not set";
        }
      } else if (input.integrationKey === "file_storage") {
        const s3Vars = envVars.filter((v) => v.category === "file_storage");
        const allSet = s3Vars.every((v) => v.configured);
        if (allSet) {
          status = "pass";
          message = "S3 file storage credentials configured.";
        } else {
          const missing = s3Vars.filter((v) => !v.configured).map((v) => v.label).join(", ");
          message = `Missing: ${missing}`;
          status = "warning";
        }
      } else if (input.integrationKey === "auth") {
        const authVars = envVars.filter((v) => v.category === "auth");
        const allSet = authVars.every((v) => v.configured);
        if (allSet) {
          status = "pass";
          message = "Authentication configuration complete.";
        } else {
          const missing = authVars.filter((v) => !v.configured).map((v) => v.label).join(", ");
          message = `Missing: ${missing}`;
          status = "warning";
        }
      } else {
        message = `Integration '${input.integrationKey}' check not implemented`;
        status = "warning";
      }

      // Store test result
      const db = await getDb();
      if (db) {
        await db.insert(integrationTestResults).values({
          integrationName: input.integrationKey,
          status,
          message,
          testedBy: ctx.user.id,
        });
      }

      return { success: status === "pass", status, message };
    }),

  // --- Notification Templates ---
  getNotificationTemplates: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(notificationTemplates).orderBy(desc(notificationTemplates.updatedAt));
  }),

  createNotificationTemplate: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      type: z.string().min(1),
      subject: z.string().min(1),
      body: z.string().min(1),
      active: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.insert(notificationTemplates).values(input);
      return { success: true };
    }),

  updateNotificationTemplate: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      type: z.string().optional(),
      subject: z.string().optional(),
      body: z.string().optional(),
      active: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const { id, ...data } = input;
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.subject !== undefined) updateData.subject = data.subject;
      if (data.body !== undefined) updateData.body = data.body;
      if (data.active !== undefined) updateData.active = data.active;
      await db.update(notificationTemplates).set(updateData).where(eq(notificationTemplates.id, id));
      return { success: true };
    }),

  deleteNotificationTemplate: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.delete(notificationTemplates).where(eq(notificationTemplates.id, input.id));
      return { success: true };
    }),

  sendTestNotification: adminProcedure
    .input(z.object({ templateId: z.number() }))
    .mutation(async ({ input }) => {
      // Check if email provider is configured
      if (!process.env.RESEND_API_KEY) {
        return { success: false, message: "Email provider (Resend) not configured. Set RESEND_API_KEY to send test notifications." };
      }
      const db = await getDb();
      if (!db) return { success: false, message: "Database not available" };
      const [template] = await db.select().from(notificationTemplates).where(eq(notificationTemplates.id, input.templateId)).limit(1);
      if (!template) return { success: false, message: "Template not found" };
      // In production this would send via Resend; for now confirm provider is ready
      return { success: true, message: `Test notification prepared for template "${template.name}". Email provider is configured.` };
    }),

  // --- Security / Audit ---
  getSecurityLog: adminProcedure
    .input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
      eventType: z.string().optional(),
      actionType: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { loginEvents: [], auditLog: [], workspaceSummary: [] };

      // Login events
      const loginConditions: any[] = [];
      if (input.eventType) loginConditions.push(eq(loginEvents.eventType, input.eventType as any));
      const logins = await db.select().from(loginEvents)
        .where(loginConditions.length ? and(...loginConditions) : undefined)
        .orderBy(desc(loginEvents.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Platform audit log
      const auditConditions: any[] = [];
      if (input.actionType) auditConditions.push(eq(platformAuditLog.action, input.actionType));
      const auditLog = await db.select().from(platformAuditLog)
        .where(auditConditions.length ? and(...auditConditions) : undefined)
        .orderBy(desc(platformAuditLog.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      // Workspace summary (count by status)
      const workspaceSummary = await db.select({
        status: workspaces.status,
        count: count(),
      }).from(workspaces).groupBy(workspaces.status);

      return { loginEvents: logins, auditLog, workspaceSummary };
    }),

  markAuditReviewed: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      // Platform audit log doesn't have a "reviewed" column, so we add metadata
      const db = await getDb();
      if (!db) return { success: false };
      const [entry] = await db.select().from(platformAuditLog).where(eq(platformAuditLog.id, input.id)).limit(1);
      if (!entry) return { success: false };
      const existingMeta = entry.metadata ? JSON.parse(entry.metadata) : {};
      existingMeta.reviewed = true;
      existingMeta.reviewedAt = new Date().toISOString();
      await db.update(platformAuditLog).set({ metadata: JSON.stringify(existingMeta) }).where(eq(platformAuditLog.id, input.id));
      return { success: true };
    }),

  // --- Launch Readiness ---
  getLaunchChecklist: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(launchReadinessItems).orderBy(launchReadinessItems.category, launchReadinessItems.id);
  }),

  updateLaunchItem: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["not_started", "in_progress", "passed", "failed", "blocked"]).optional(),
      owner: z.string().optional(),
      notes: z.string().optional(),
      lastCheckedAt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      const { id, lastCheckedAt, ...data } = input;
      const updateData: any = { ...data };
      if (lastCheckedAt) updateData.lastCheckedAt = new Date(lastCheckedAt);
      if (data.status === "passed") updateData.lastCheckedAt = new Date();
      await db.update(launchReadinessItems).set(updateData).where(eq(launchReadinessItems.id, id));
      return { success: true };
    }),

  createLaunchItem: adminProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      category: z.string().min(1),
      status: z.enum(["not_started", "in_progress", "passed", "failed", "blocked"]).default("not_started"),
      owner: z.string().optional(),
      notes: z.string().optional(),
      relatedRoute: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      await db.insert(launchReadinessItems).values(input);
      return { success: true };
    }),

  seedLaunchChecklist: adminProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) return { success: false };

    // Check if already seeded
    const existing = await db.select({ count: count() }).from(launchReadinessItems);
    if (existing[0]?.count > 0) return { success: true, message: "Already seeded" };

    const items = [
      { category: "public_pages", title: "Home page loads correctly", relatedRoute: "/" },
      { category: "public_pages", title: "Features page complete", relatedRoute: "/features" },
      { category: "public_pages", title: "Pricing page shows plans", relatedRoute: "/pricing" },
      { category: "public_pages", title: "Help/FAQ page functional", relatedRoute: "/help" },
      { category: "public_pages", title: "Contact page sends messages", relatedRoute: "/contact" },
      { category: "signup_login", title: "Get Started flow works", relatedRoute: "/get-started" },
      { category: "signup_login", title: "Login redirects correctly", relatedRoute: "/login" },
      { category: "signup_login", title: "OAuth callback handles errors", relatedRoute: "/login" },
      { category: "checkout_billing", title: "Plan selection carries to checkout", relatedRoute: "/pricing" },
      { category: "checkout_billing", title: "Stripe checkout session creates", relatedRoute: "/app/billing" },
      { category: "checkout_billing", title: "Checkout success activates subscription", relatedRoute: "/checkout/success" },
      { category: "checkout_billing", title: "Billing page shows current plan", relatedRoute: "/app/billing" },
      { category: "workspace_creation", title: "Workspace created after payment", relatedRoute: "/app/dashboard" },
      { category: "workspace_creation", title: "Workspace isolation verified", relatedRoute: "/app/dashboard" },
      { category: "onboarding", title: "Onboarding wizard completes", relatedRoute: "/app/onboarding" },
      { category: "onboarding", title: "Business profile saves", relatedRoute: "/app/business-profile" },
      { category: "dashboard", title: "Dashboard loads real data", relatedRoute: "/app/dashboard" },
      { category: "dashboard", title: "Quick actions navigate correctly", relatedRoute: "/app/dashboard" },
      { category: "opportunities", title: "Create opportunity works", relatedRoute: "/app/opportunities" },
      { category: "opportunities", title: "Opportunity detail loads", relatedRoute: "/app/opportunities" },
      { category: "opportunities", title: "Convert to proposal works", relatedRoute: "/app/opportunities" },
      { category: "sam_gov_import", title: "SAM.gov search returns results", relatedRoute: "/app/sam-search" },
      { category: "sam_gov_import", title: "Import creates opportunity", relatedRoute: "/app/sam-search" },
      { category: "ai_workflows", title: "Contract scan creates findings", relatedRoute: "/app/contracts" },
      { category: "ai_workflows", title: "Approve finding creates live record", relatedRoute: "/app/contracts" },
      { category: "ai_workflows", title: "Reject/hold findings work", relatedRoute: "/app/contracts" },
      { category: "proposals", title: "Proposal CRUD works", relatedRoute: "/app/proposals" },
      { category: "proposals", title: "Proposal sections and AI draft", relatedRoute: "/app/proposals" },
      { category: "proposals", title: "Won proposal converts to contract", relatedRoute: "/app/proposals" },
      { category: "contracts", title: "Contract CRUD works", relatedRoute: "/app/contracts" },
      { category: "contracts", title: "CLINs/modifications/personnel", relatedRoute: "/app/contracts" },
      { category: "contract_hub", title: "Contract hub navigation works", relatedRoute: "/app/contract-hub" },
      { category: "contract_hub", title: "Hub tiles link to correct pages", relatedRoute: "/app/contract-hub" },
      { category: "files_document_control", title: "File upload works", relatedRoute: "/app/files" },
      { category: "files_document_control", title: "File list and detail load", relatedRoute: "/app/files" },
      { category: "invoices_payments", title: "Invoice CRUD with line items", relatedRoute: "/app/invoices" },
      { category: "invoices_payments", title: "Payment recording works", relatedRoute: "/app/payments" },
      { category: "invoices_payments", title: "Payment application to invoices", relatedRoute: "/app/payments" },
      { category: "finance", title: "Finance dashboard loads", relatedRoute: "/app/finance" },
      { category: "finance", title: "Reconciliation shows correctly", relatedRoute: "/app/finance" },
      { category: "reports", title: "Reports generate", relatedRoute: "/app/reports" },
      { category: "reports", title: "Export CSV/PDF works", relatedRoute: "/app/reports" },
      { category: "closeout", title: "Initiate closeout persists", relatedRoute: "/app/closeout" },
      { category: "closeout", title: "Checklist items persist", relatedRoute: "/app/closeout" },
      { category: "closeout", title: "Blockers prevent completion", relatedRoute: "/app/closeout" },
      { category: "customer_support", title: "Customer can create ticket", relatedRoute: "/app/support" },
      { category: "customer_support", title: "Customer can view/reply tickets", relatedRoute: "/app/support" },
      { category: "platform_admin", title: "Platform dashboard loads", relatedRoute: "/platform" },
      { category: "platform_admin", title: "Workspace management works", relatedRoute: "/platform/workspaces" },
      { category: "platform_admin", title: "Support inbox works", relatedRoute: "/platform/support" },
      { category: "system_health", title: "Health check runs", relatedRoute: "/platform/system-health" },
      { category: "system_health", title: "Env vars show configured/not", relatedRoute: "/platform/system-health" },
      { category: "integrations", title: "Integration status displays", relatedRoute: "/platform/integrations" },
      { category: "integrations", title: "Test connection works", relatedRoute: "/platform/integrations" },
      { category: "security", title: "Login events display", relatedRoute: "/platform/security" },
      { category: "security", title: "Audit log displays", relatedRoute: "/platform/security" },
      { category: "mobile_responsive", title: "Public pages responsive", relatedRoute: "/" },
      { category: "mobile_responsive", title: "App pages responsive", relatedRoute: "/app/dashboard" },
      { category: "mobile_responsive", title: "Platform pages responsive", relatedRoute: "/platform" },
      { category: "environment_variables", title: "All required env vars documented", relatedRoute: "/platform/system-health" },
      { category: "environment_variables", title: "No hardcoded secrets in code", relatedRoute: "/platform/system-health" },
      { category: "backups_export", title: "Backup export works", relatedRoute: "/platform/backups" },
      { category: "legal_pages", title: "Privacy policy accessible", relatedRoute: "/privacy" },
      { category: "legal_pages", title: "Terms of service accessible", relatedRoute: "/terms" },
      { category: "legal_pages", title: "Legal acceptance recorded", relatedRoute: "/terms" },
      { category: "final_route_test", title: "All public routes load", relatedRoute: "/" },
      { category: "final_route_test", title: "All app routes load", relatedRoute: "/app/dashboard" },
      { category: "final_route_test", title: "All platform routes load", relatedRoute: "/platform" },
      { category: "final_route_test", title: "404 handling works", relatedRoute: "/" },
    ];

    for (const item of items) {
      await db.insert(launchReadinessItems).values({
        title: item.title,
        category: item.category,
        relatedRoute: item.relatedRoute,
        status: "not_started",
      });
    }

    return { success: true, message: `Seeded ${items.length} launch readiness items` };
  }),

  generateLaunchReport: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { categories: [], summary: { total: 0, passed: 0, failed: 0, blocked: 0, inProgress: 0, notStarted: 0 } };

    const items = await db.select().from(launchReadinessItems).orderBy(launchReadinessItems.category, launchReadinessItems.id);

    const summary = {
      total: items.length,
      passed: items.filter((i) => i.status === "passed").length,
      failed: items.filter((i) => i.status === "failed").length,
      blocked: items.filter((i) => i.status === "blocked").length,
      inProgress: items.filter((i) => i.status === "in_progress").length,
      notStarted: items.filter((i) => i.status === "not_started").length,
    };

    // Group by category
    const categoryMap: Record<string, typeof items> = {};
    for (const item of items) {
      if (!categoryMap[item.category]) categoryMap[item.category] = [];
      categoryMap[item.category].push(item);
    }

    const categories = Object.entries(categoryMap).map(([name, catItems]) => ({
      name,
      total: catItems.length,
      passed: catItems.filter((i) => i.status === "passed").length,
      failed: catItems.filter((i) => i.status === "failed").length,
      items: catItems,
    }));

    return { categories, summary };
  }),
});

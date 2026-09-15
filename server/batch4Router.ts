// @ts-nocheck
import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { generatedDocuments, flowdownReviews, customerAdoption, businessProfiles, users, workspaceSettings, contracts } from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { enforcePermission } from "./rbacMiddleware";
import { logAudit } from "./featureRouter";

export const documentGenerationRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    return db.select().from(generatedDocuments).where(eq(generatedDocuments.workspaceId, wsId)).orderBy(desc(generatedDocuments.createdAt));
  }),
  create: protectedProcedure.input(z.object({ documentType: z.string(), title: z.string(), content: z.string().optional(), sourceRecordType: z.string().optional(), sourceRecordId: z.number().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const { wsId } = await enforcePermission(ctx.user.id, "write");
    await db.insert(generatedDocuments).values({ workspaceId: wsId, documentType: input.documentType, title: input.title, content: input.content || "", status: "draft", generatedBy: "ai", sourceRecordType: input.sourceRecordType, sourceRecordId: input.sourceRecordId, createdBy: ctx.user.id });
    try { await logAudit(wsId, ctx.user.id, "create", "documentGeneration", 0, input); } catch {}
    return { success: true };
  }),
  get: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ ctx, input }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    const rows = await db.select().from(generatedDocuments).where(and(eq(generatedDocuments.id, input.id), eq(generatedDocuments.workspaceId, wsId)));
    return rows[0] || null;
  }),
});

export const flowdownReviewsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    return db.select().from(flowdownReviews).where(eq(flowdownReviews.workspaceId, wsId)).orderBy(desc(flowdownReviews.createdAt));
  }),
  create: protectedProcedure.input(z.object({ contractId: z.number(), clauseReference: z.string(), clauseText: z.string().optional(), flowdownRequired: z.boolean().optional(), notes: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const { wsId } = await enforcePermission(ctx.user.id, "write");
    const [contract] = await db.select({ id: contracts.id }).from(contracts).where(and(eq(contracts.id, input.contractId), eq(contracts.workspaceId, wsId))).limit(1);
    if (!contract) throw new Error("Contract not found in this workspace");
    await db.insert(flowdownReviews).values({ contractId: input.contractId, workspaceId: wsId, clauseReference: input.clauseReference, clauseText: input.clauseText || null, flowdownRequired: input.flowdownRequired || false, notes: input.notes || null, reviewStatus: "pending", reviewedBy: ctx.user.id });
    try { await logAudit(wsId, ctx.user.id, "create", "flowdownReviews", 0, input); } catch {}
    return { success: true };
  }),
  update: protectedProcedure.input(z.object({ id: z.number(), reviewStatus: z.string().optional(), notes: z.string().optional(), flowdownRequired: z.boolean().optional() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const { wsId } = await enforcePermission(ctx.user.id, "write");
    const { id, ...data } = input;
    await db.update(flowdownReviews).set(data).where(and(eq(flowdownReviews.id, id), eq(flowdownReviews.workspaceId, wsId)));
    try { await logAudit(wsId, ctx.user.id, "update", "flowdownReviews", id, input); } catch {}
    return { success: true };
  }),
});

export const customerAdoptionRouter = router({
  getMetrics: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    const rows = await db.select().from(customerAdoption).where(eq(customerAdoption.workspaceId, wsId));
    // Aggregate metrics from rows
    const metrics: Record<string, string> = {};
    for (const row of rows) {
      metrics[row.metricKey] = row.metricValue || "";
    }
    return { metrics, totalMetrics: rows.length, lastChecked: rows[0]?.lastChecked || null };
  }),
  track: protectedProcedure.input(z.object({ featureName: z.string() })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    // Upsert a metric for this feature
    const existing = await db.select().from(customerAdoption).where(and(eq(customerAdoption.workspaceId, wsId), eq(customerAdoption.metricKey, `feature_${input.featureName}`)));
    if (existing.length === 0) {
      await db.insert(customerAdoption).values({ workspaceId: wsId, metricKey: `feature_${input.featureName}`, metricValue: "1", lastChecked: new Date(), status: "active" });
    } else {
      const count = parseInt(existing[0].metricValue || "0") + 1;
      await db.update(customerAdoption).set({ metricValue: String(count), lastChecked: new Date() }).where(eq(customerAdoption.id, existing[0].id));
    }
    return { success: true };
  }),
});

export const businessProfileRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const wsId = await requireWorkspaceId(ctx.user.id);
    const rows = await db.select().from(businessProfiles).where(eq(businessProfiles.workspaceId, wsId));
    return rows[0] || null;
  }),
  upsert: protectedProcedure.input(z.object({
    legalName: z.string().optional(),
    dba: z.string().optional(),
    businessStructure: z.string().optional(),
    stateOfIncorporation: z.string().optional(),
    businessSize: z.string().optional(),
    yearFounded: z.string().optional(),
    numberOfEmployees: z.string().optional(),
    website: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
    country: z.string().optional(),
    entityType: z.string().optional(),
    uei: z.string().optional(),
    cage: z.string().optional(),
    samStatus: z.enum(["active", "expired", "pending", "not_registered"]).optional(),
    samExpirationDate: z.string().optional(),
    samRegistrationDate: z.string().optional(),
    gsaScheduleNumber: z.string().optional(),
    gsaScheduleExpiration: z.string().optional(),
    naicsPrimary: z.string().optional(),
    naicsSecondary: z.string().optional(),
    naicsCodes: z.string().optional(),
    socioeconomicCerts: z.string().optional(),
    certifications: z.string().optional(),
    capabilities: z.string().optional(),
    coreCompetencies: z.string().optional(),
    keyPersonnel: z.string().optional(),
    pastPerformance: z.string().optional(),
    bankingInfo: z.string().optional(),
    bondingCapacity: z.string().optional(),
    insuranceSummary: z.string().optional(),
    annualRevenue: z.string().optional(),
    contractingModel: z.enum(["prime", "sub", "both"]).optional(),
    usesSubcontractors: z.boolean().optional(),
    defaultContactName: z.string().optional(),
    defaultContactEmail: z.string().optional(),
    defaultContactPhone: z.string().optional(),
  })).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    const { wsId } = await enforcePermission(ctx.user.id, "manage_settings");
    const existing = await db.select().from(businessProfiles).where(eq(businessProfiles.workspaceId, wsId));
    // Calculate completeness
    const fields = [input.legalName, input.email, input.phone, input.address, input.uei, input.cage, input.naicsPrimary || input.naicsCodes, input.certifications || input.socioeconomicCerts, input.capabilities, input.contractingModel, input.defaultContactName, input.defaultContactEmail];
    const filled = fields.filter(f => f && f.length > 0).length;
    const score = Math.round((filled / fields.length) * 100);
    const data: any = { ...input, profileCompletenessScore: score };
    // Convert date strings to Date objects
    if (input.samExpirationDate) data.samExpirationDate = new Date(input.samExpirationDate);
    else delete data.samExpirationDate;
    if (input.samRegistrationDate) data.samRegistrationDate = new Date(input.samRegistrationDate);
    else delete data.samRegistrationDate;
    if (input.gsaScheduleExpiration) data.gsaScheduleExpiration = new Date(input.gsaScheduleExpiration);
    else delete data.gsaScheduleExpiration;
    if (existing.length === 0) {
      await db.insert(businessProfiles).values({ workspaceId: wsId, ...data });
    } else {
      await db.update(businessProfiles).set(data).where(eq(businessProfiles.workspaceId, wsId));
    }
    try { await logAudit(wsId, ctx.user.id, "update", "businessProfile", 0, { completenessScore: score }); } catch {}
    return { success: true, completenessScore: score };
  }),
});

// ==================== USER PROFILE (SELF-UPDATE) ====================
export const userProfileRouter = router({
  /**
   * Get the current user's profile data.
   * Returns the user row plus any extended profile settings stored in workspaceSettings.
   */
  getSelf: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const [user] = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
    if (!user) return null;
    // Fetch extended profile settings (phone, jobTitle, bio, etc.)
    let wsId: number | null = null;
    try { wsId = await requireWorkspaceId(ctx.user.id); } catch {}
    const extSettings: Record<string, string | null> = {};
    const profilePrefix = `up.${ctx.user.id}.`;
    if (wsId) {
      const settings = await db.select().from(workspaceSettings)
        .where(eq(workspaceSettings.workspaceId, wsId));
      for (const s of settings) {
        if (s.settingKey.startsWith(profilePrefix)) {
          extSettings[s.settingKey] = s.settingValue;
        }
      }
    }
    return {
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
      accountStatus: user.accountStatus || 'active',
      createdAt: user.createdAt,
      // Extended settings
      jobTitle: extSettings[`${profilePrefix}jobTitle`] || '',
      phone: extSettings[`${profilePrefix}phone`] || '',
      bio: extSettings[`${profilePrefix}bio`] || '',
      linkedIn: extSettings[`${profilePrefix}linkedIn`] || '',
      guidancePreference: extSettings[`${profilePrefix}guidancePreference`] || 'detailed',
      reminderPreference: extSettings[`${profilePrefix}reminderPreference`] || 'daily',
      timezone: extSettings[`${profilePrefix}timezone`] || 'America/New_York',
      notifyOpportunities: extSettings[`${profilePrefix}notifyOpportunities`] !== 'false',
      notifyDeadlines: extSettings[`${profilePrefix}notifyDeadlines`] !== 'false',
      notifyCompliance: extSettings[`${profilePrefix}notifyCompliance`] !== 'false',
      notifyMarketing: extSettings[`${profilePrefix}notifyMarketing`] === 'true',
    };
  }),

  /**
   * Update the current user's personal profile.
   * Writes name to the users table and extended fields to workspaceSettings.
   */
  updateSelf: protectedProcedure
    .input(z.object({
      name: z.string().min(1).optional(),
      jobTitle: z.string().optional(),
      phone: z.string().optional(),
      bio: z.string().optional(),
      linkedIn: z.string().optional(),
      guidancePreference: z.enum(['minimal', 'standard', 'detailed']).optional(),
      reminderPreference: z.enum(['never', 'weekly', 'daily', 'realtime']).optional(),
      timezone: z.string().optional(),
      notifyOpportunities: z.boolean().optional(),
      notifyDeadlines: z.boolean().optional(),
      notifyCompliance: z.boolean().optional(),
      notifyMarketing: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      // Update name in users table if provided
      if (input.name !== undefined) {
        await db.update(users).set({ name: input.name }).where(eq(users.id, ctx.user.id));
      }
      // Upsert extended settings in workspaceSettings
      let wsId: number | null = null;
      try { wsId = await requireWorkspaceId(ctx.user.id); } catch {}
      if (wsId) {
        const profilePrefix = `up.${ctx.user.id}.`;
        const settingEntries: [string, string][] = [];
        if (input.jobTitle !== undefined) settingEntries.push([`${profilePrefix}jobTitle`, input.jobTitle]);
        if (input.phone !== undefined) settingEntries.push([`${profilePrefix}phone`, input.phone]);
        if (input.bio !== undefined) settingEntries.push([`${profilePrefix}bio`, input.bio]);
        if (input.linkedIn !== undefined) settingEntries.push([`${profilePrefix}linkedIn`, input.linkedIn]);
        if (input.guidancePreference !== undefined) settingEntries.push([`${profilePrefix}guidancePreference`, input.guidancePreference]);
        if (input.reminderPreference !== undefined) settingEntries.push([`${profilePrefix}reminderPreference`, input.reminderPreference]);
        if (input.timezone !== undefined) settingEntries.push([`${profilePrefix}timezone`, input.timezone]);
        if (input.notifyOpportunities !== undefined) settingEntries.push([`${profilePrefix}notifyOpportunities`, String(input.notifyOpportunities)]);
        if (input.notifyDeadlines !== undefined) settingEntries.push([`${profilePrefix}notifyDeadlines`, String(input.notifyDeadlines)]);
        if (input.notifyCompliance !== undefined) settingEntries.push([`${profilePrefix}notifyCompliance`, String(input.notifyCompliance)]);
        if (input.notifyMarketing !== undefined) settingEntries.push([`${profilePrefix}notifyMarketing`, String(input.notifyMarketing)]);

        for (const [key, value] of settingEntries) {
          const [existing] = await db.select().from(workspaceSettings)
            .where(and(eq(workspaceSettings.workspaceId, wsId), eq(workspaceSettings.settingKey, key)));
          if (existing) {
            await db.update(workspaceSettings).set({ settingValue: value }).where(eq(workspaceSettings.id, existing.id));
          } else {
            await db.insert(workspaceSettings).values({ workspaceId: wsId, settingKey: key, settingValue: value });
          }
        }
      }
      try {
        if (wsId) await logAudit(wsId, ctx.user.id, "update", "userProfile", ctx.user.id, { fields: Object.keys(input) });
      } catch {}
      return { success: true };
    }),
});

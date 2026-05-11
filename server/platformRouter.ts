import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { workspaces, plans, discounts, platformBilling, supportTickets, platformOverrides, users, loginEvents, platformNotes, platformAuditLog, workspaceMembers } from "../drizzle/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";

// ==================== WORKSPACE ROUTER ====================
export const workspaceRouter = router({
  // Get the current user's workspace (auto-create if none exists)
  getMyWorkspace: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const userId = ctx.user.id;
    // Find workspace owned by this user
    const [ws] = await db.select().from(workspaces).where(eq(workspaces.ownerId, userId)).limit(1);
    if (ws) return ws;
    // Auto-create workspace for new user
    const result = await db.insert(workspaces).values({
      name: ctx.user.name ? `${ctx.user.name}'s Workspace` : "My Workspace",
      ownerId: userId,
      onboardingCompleted: false,
    });
    const insertId = result[0].insertId;
    const [newWs] = await db.select().from(workspaces).where(eq(workspaces.id, insertId)).limit(1);
    return newWs;
  }),

  // Get onboarding status
  getOnboardingStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { completed: false };
    const userId = ctx.user.id;
    const [ws] = await db.select().from(workspaces).where(eq(workspaces.ownerId, userId)).limit(1);
    return { completed: ws?.onboardingCompleted ?? false };
  }),

  // Complete onboarding
  completeOnboarding: protectedProcedure
    .input(z.object({
      companyName: z.string().min(1),
      contractingModel: z.string().optional(),
      naicsCodes: z.string().optional(),
      certifications: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user.id;
      // Find or create workspace
      let [ws] = await db.select().from(workspaces).where(eq(workspaces.ownerId, userId)).limit(1);
      if (!ws) {
        const result = await db.insert(workspaces).values({
          name: input.companyName,
          ownerId: userId,
          onboardingCompleted: true,
          companyName: input.companyName,
          contractingModel: input.contractingModel || null,
          naicsCodes: input.naicsCodes || null,
          certifications: input.certifications || null,
        });
        return { success: true, workspaceId: result[0].insertId };
      }
      // Update existing workspace
      await db.update(workspaces)
        .set({
          name: input.companyName,
          onboardingCompleted: true,
          companyName: input.companyName,
          contractingModel: input.contractingModel || null,
          naicsCodes: input.naicsCodes || null,
          certifications: input.certifications || null,
        })
        .where(eq(workspaces.id, ws.id));
      return { success: true, workspaceId: ws.id };
    }),

  // Update workspace settings
  update: protectedProcedure
    .input(z.object({
      name: z.string().optional(),
      companyName: z.string().optional(),
      contractingModel: z.string().optional(),
      naicsCodes: z.string().optional(),
      certifications: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user.id;
      const [ws] = await db.select().from(workspaces).where(eq(workspaces.ownerId, userId)).limit(1);
      if (!ws) throw new Error("Workspace not found");
      await db.update(workspaces).set(input).where(eq(workspaces.id, ws.id));
      return { success: true };
    }),
});

// ==================== PLATFORM ADMIN ROUTER ====================
export const platformRouter = router({
  // --- Plans ---
  plans: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(plans).orderBy(plans.sortOrder);
    }),
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        monthlyPrice: z.string(),
        annualPrice: z.string().optional(),
        features: z.string().optional(),
        maxUsers: z.number().optional(),
        maxContracts: z.number().optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.insert(plans).values(input);
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        monthlyPrice: z.string().optional(),
        annualPrice: z.string().optional(),
        features: z.string().optional(),
        maxUsers: z.number().optional(),
        maxContracts: z.number().optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { id, ...data } = input;
        await db.update(plans).set(data).where(eq(plans.id, id));
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.delete(plans).where(eq(plans.id, input.id));
        return { success: true };
      }),
  }),

  // --- Discounts ---
  discounts: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(discounts).orderBy(desc(discounts.createdAt));
    }),
    create: adminProcedure
      .input(z.object({
        code: z.string().min(1),
        description: z.string().optional(),
        percentOff: z.number().optional(),
        amountOff: z.string().optional(),
        maxUses: z.number().optional(),
        applicablePlanId: z.number().optional(),
        isActive: z.boolean().optional(),
        expiresAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.insert(discounts).values(input);
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        description: z.string().optional(),
        percentOff: z.number().optional(),
        amountOff: z.string().optional(),
        maxUses: z.number().optional(),
        applicablePlanId: z.number().optional(),
        isActive: z.boolean().optional(),
        expiresAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { id, ...data } = input;
        await db.update(discounts).set(data).where(eq(discounts.id, id));
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.delete(discounts).where(eq(discounts.id, input.id));
        return { success: true };
      }),
  }),

  // --- Billing ---
  billing: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(platformBilling).orderBy(desc(platformBilling.createdAt));
    }),
    getByWorkspace: adminProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(platformBilling).where(eq(platformBilling.workspaceId, input.workspaceId));
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["trial", "active", "past_due", "cancelled", "expired"]).optional(),
        billingCycle: z.enum(["monthly", "annual"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { id, ...data } = input;
        await db.update(platformBilling).set(data).where(eq(platformBilling.id, id));
        return { success: true };
      }),
  }),

  // --- Support Tickets ---
  support: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
    }),
    get: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, input.id)).limit(1);
        return ticket || null;
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["open", "in_progress", "waiting_on_customer", "resolved", "closed"]).optional(),
        assignedTo: z.string().optional(),
        resolution: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { id, ...data } = input;
        const updateData: any = { ...data };
        if (data.status === "resolved") {
          updateData.resolvedAt = new Date();
        }
        await db.update(supportTickets).set(updateData).where(eq(supportTickets.id, id));
        return { success: true };
      }),
    // Customer-facing: create a support ticket
    create: protectedProcedure
      .input(z.object({
        subject: z.string().min(1),
        body: z.string().min(1),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const userId = ctx.user.id;
        // Find user's workspace
        const [ws] = await db.select().from(workspaces).where(eq(workspaces.ownerId, userId)).limit(1);
        await db.insert(supportTickets).values({
          workspaceId: ws?.id || null,
          userId: userId,
          subject: input.subject,
          body: input.body,
          priority: input.priority || "medium",
        });
        return { success: true };
      }),
  }),

  // --- Overrides ---
  overrides: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(platformOverrides).orderBy(desc(platformOverrides.createdAt));
    }),
    create: adminProcedure
      .input(z.object({
        workspaceId: z.number(),
        feature: z.string().min(1),
        value: z.string().min(1),
        reason: z.string().optional(),
        appliedBy: z.string().optional(),
        expiresAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.insert(platformOverrides).values(input);
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        feature: z.string().optional(),
        value: z.string().optional(),
        reason: z.string().optional(),
        isActive: z.boolean().optional(),
        expiresAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { id, ...data } = input;
        await db.update(platformOverrides).set(data).where(eq(platformOverrides.id, id));
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.delete(platformOverrides).where(eq(platformOverrides.id, input.id));
        return { success: true };
      }),
  }),

  // --- Workspaces (admin view all) ---
  workspaces: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(workspaces).orderBy(desc(workspaces.createdAt));
    }),
    get: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, input.id)).limit(1);
        return ws || null;
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        planId: z.number().optional(),
        onboardingCompleted: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { id, ...data } = input;
        await db.update(workspaces).set(data).where(eq(workspaces.id, id));
        return { success: true };
      }),
  }),

  // --- Users (admin view all) ---
  users: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(users).orderBy(desc(users.createdAt));
    }),
  }),

  // --- Stats (dashboard) ---
  stats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { totalUsers: 0, totalWorkspaces: 0, totalPlans: 0, openTickets: 0 };
    const [userRows] = await db.select().from(users);
    const allUsers = await db.select().from(users);
    const allWorkspaces = await db.select().from(workspaces);
    const allPlans = await db.select().from(plans);
    const openTicketsList = await db.select().from(supportTickets).where(eq(supportTickets.status, "open"));
    return {
      totalUsers: allUsers.length,
      totalWorkspaces: allWorkspaces.length,
      totalPlans: allPlans.length,
      openTickets: openTicketsList.length,
    };
  }),
});

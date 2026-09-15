import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb, getInsertId } from "./db";
import { workspaces, businessProfiles, plans, discounts, platformBilling, supportTickets, platformOverrides, users, loginEvents, platformNotes, platformAuditLog, workspaceMembers, planVersions, policyVersions, backupExports, platformTasks, platformTaskRuns, billingEvents, discountUsage, consentRecords, auditLogs } from "../drizzle/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { sendWelcomeEmail } from "./services/email";
import { getUserWorkspaceRole, getWorkspaceIdForUser, requireWorkspaceId as requireWsId } from "./workspaceMiddleware";
import { updateAccessState, evaluateAccess } from "./accessGating";
import { canManageTeam, getAssignableRoles } from "./permissions";

// ==================== WORKSPACE ROUTER ====================
export const workspaceRouter = router({
  // Get the current user's workspace.
  // Phase 2: No longer auto-creates for unauthenticated billing states.
  // Admin users always get a workspace. Regular users need a valid access state
  // OR an existing workspace (to avoid breaking existing users mid-session).
  getMyWorkspace: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const userId = ctx.user.id;

    // Prefer a workspace owned by this user.
    const [ws] = await db.select().from(workspaces).where(eq(workspaces.ownerId, userId)).limit(1);
    if (ws) return ws;

    // Invited members must resolve to the workspace they joined. Never create a
    // second personal workspace merely because they are not the workspace owner.
    const [membership] = await db
      .select({ workspaceId: workspaceMembers.workspaceId })
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, userId))
      .limit(1);
    if (membership) {
      const [memberWorkspace] = await db.select().from(workspaces)
        .where(eq(workspaces.id, membership.workspaceId)).limit(1);
      if (memberWorkspace) return memberWorkspace;
    }

    // Auto-create only for a genuinely new user with no owned or joined workspace.
    const result = await db.insert(workspaces).values({
      name: ctx.user.name ? `${ctx.user.name}'s Workspace` : "My Workspace",
      ownerId: userId,
      onboardingCompleted: false,
    });
    const insertId = getInsertId(result);
    const [newWs] = await db.select().from(workspaces).where(eq(workspaces.id, insertId)).limit(1);

    // For new workspaces, set initial access state to pending_setup
    // (will be updated to trial_active or active_paid after checkout/onboarding)
    try {
      await updateAccessState(insertId, "pending_setup", "Workspace created — awaiting checkout or trial activation", userId);
    } catch (e) {
      console.error("[getMyWorkspace] Failed to set initial access state:", e);
    }

    // Send welcome email asynchronously (don't block workspace creation)
    if (ctx.user.email && newWs) {
      sendWelcomeEmail(insertId, ctx.user.email, ctx.user.name || "there", newWs.name).catch(err =>
        console.error("[Email] Failed to send welcome email:", err)
      );
    }
    return newWs;
  }),

  // Get onboarding status
  getOnboardingStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { completed: false };
    const userId = ctx.user.id;
    const wsId = await getWorkspaceIdForUser(userId);
    if (!wsId) return { completed: false };
    const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, wsId)).limit(1);
    return { completed: ws?.onboardingCompleted ?? false };
  }),

  // Complete onboarding
  completeOnboarding: protectedProcedure
    .input(z.object({
      companyName: z.string().min(1),
      contractingModel: z.string().optional(),
      naicsCodes: z.string().optional(),
      certifications: z.string().optional(),
      uei: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user.id;
      const syncBusinessProfile = async (workspaceId: number) => {
        const profileData = {
          legalName: input.companyName,
          uei: input.uei?.trim() || null,
          naicsCodes: input.naicsCodes || null,
          certifications: input.certifications || null,
        };
        const [existingProfile] = await db.select({ id: businessProfiles.id })
          .from(businessProfiles)
          .where(eq(businessProfiles.workspaceId, workspaceId))
          .limit(1);
        if (existingProfile) {
          await db.update(businessProfiles).set(profileData)
            .where(eq(businessProfiles.workspaceId, workspaceId));
        } else {
          await db.insert(businessProfiles).values({ workspaceId, ...profileData });
        }
      };
      // Find or create workspace. A user who already belongs to another
      // workspace is a member, not a new workspace owner, and cannot run owner onboarding.
      let [ws] = await db.select().from(workspaces).where(eq(workspaces.ownerId, userId)).limit(1);
      if (!ws) {
        const [membership] = await db.select({ workspaceId: workspaceMembers.workspaceId })
          .from(workspaceMembers).where(eq(workspaceMembers.userId, userId)).limit(1);
        if (membership) {
          throw new Error("Workspace members cannot create a second workspace through onboarding.");
        }
        const result = await db.insert(workspaces).values({
          name: input.companyName,
          ownerId: userId,
          onboardingCompleted: true,
          companyName: input.companyName,
          contractingModel: input.contractingModel || null,
          naicsCodes: input.naicsCodes || null,
          certifications: input.certifications || null,
        });
        await syncBusinessProfile(getInsertId(result));
        return { success: true, workspaceId: getInsertId(result) };
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
      await syncBusinessProfile(ws.id);
      return { success: true, workspaceId: ws.id };
    }),

  // Get current user's workspace role
  getMyRole: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { role: "member" as const };
    const userId = ctx.user.id;
    // Find workspace
    const [ws] = await db.select({ id: workspaces.id }).from(workspaces).where(eq(workspaces.ownerId, userId)).limit(1);
    if (ws) return { role: "owner" as const };
    // Check membership
    const wsId = await requireWsId(userId);
    const role = await getUserWorkspaceRole(userId, wsId);
    return { role };
  }),

  // ==================== MEMBER MANAGEMENT ====================
  // List all members in the current user's workspace
  listMembers: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const userId = ctx.user.id;
    const wsId = await requireWsId(userId);
    const members = await db
      .select({
        id: workspaceMembers.id,
        userId: workspaceMembers.userId,
        role: workspaceMembers.role,
        joinedAt: workspaceMembers.joinedAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(workspaceMembers)
      .leftJoin(users, eq(workspaceMembers.userId, users.id))
      .where(eq(workspaceMembers.workspaceId, wsId));
    // Also include the workspace owner
    const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, wsId)).limit(1);
    if (ws) {
      const [ownerUser] = await db.select().from(users).where(eq(users.id, ws.ownerId)).limit(1);
      if (ownerUser && !members.find(m => m.userId === ownerUser.id)) {
        members.unshift({
          id: 0,
          userId: ownerUser.id,
          role: "owner" as const,
          joinedAt: ws.createdAt,
          userName: ownerUser.name,
          userEmail: ownerUser.email,
        });
      }
    }
    return members;
  }),

  // Invite a member by email (creates a pending membership — direct add for existing users)
  inviteMember: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      role: z.enum(["admin", "contract_manager", "finance_user", "member", "viewer"]).default("member"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user.id;
      const wsId = await requireWsId(userId);
      const userRole = await getUserWorkspaceRole(userId, wsId);
      // Only owner/admin can invite
      if (!canManageTeam(userRole)) {
        throw new Error("Only workspace owners and admins can invite members.");
      }
      // Find user by email
      const [invitee] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      if (!invitee) throw new Error("No user found with that email address. They must sign up first.");
      if (invitee.id === userId) throw new Error("You cannot invite yourself.");
      // Check if already a member
      const [existing] = await db.select().from(workspaceMembers)
        .where(and(eq(workspaceMembers.workspaceId, wsId), eq(workspaceMembers.userId, invitee.id)))
        .limit(1);
      if (existing) throw new Error("This user is already a member of your workspace.");
      // Add member
      await db.insert(workspaceMembers).values({
        workspaceId: wsId,
        userId: invitee.id,
        role: input.role,
        invitedBy: userId,
      });
      // Audit log
      try {
        await db.insert(auditLogs).values({
          workspaceId: wsId,
          userId,
          actionType: "member_added",
          targetType: "workspace_member",
          targetId: invitee.id,
          newValue: JSON.stringify({ email: input.email, role: input.role }),
        });
      } catch (e) { console.error("[Audit] member_added log failed:", e); }
      return { success: true, userName: invitee.name, email: invitee.email };
    }),

  // Update a member's role
  updateMemberRole: protectedProcedure
    .input(z.object({
      memberId: z.number(),
      role: z.enum(["admin", "contract_manager", "finance_user", "member", "viewer"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user.id;
      const wsId = await requireWsId(userId);
      const userRole = await getUserWorkspaceRole(userId, wsId);
      // Only owner/admin can change roles
      if (!canManageTeam(userRole)) {
        throw new Error("Only workspace owners and admins can change member roles.");
      }
      // Admins cannot promote to admin
      const assignable = getAssignableRoles(userRole);
      if (!assignable.includes(input.role as any)) {
        throw new Error(`You cannot assign the role: ${input.role}`);
      }
      // Get old role for audit
      const [member] = await db.select().from(workspaceMembers)
        .where(and(eq(workspaceMembers.id, input.memberId), eq(workspaceMembers.workspaceId, wsId)))
        .limit(1);
      if (!member) throw new Error("Member not found.");
      const oldRole = member.role;
      await db.update(workspaceMembers)
        .set({ role: input.role })
        .where(and(eq(workspaceMembers.id, input.memberId), eq(workspaceMembers.workspaceId, wsId)));
      // Audit log
      try {
        await db.insert(auditLogs).values({
          workspaceId: wsId,
          userId,
          actionType: "role_changed",
          targetType: "workspace_member",
          targetId: member.userId,
          oldValue: oldRole,
          newValue: input.role,
        });
      } catch (e) { console.error("[Audit] role_changed log failed:", e); }
      return { success: true };
    }),

  // Remove a member from the workspace
  removeMember: protectedProcedure
    .input(z.object({ memberId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const userId = ctx.user.id;
      const wsId = await requireWsId(userId);
      const userRole = await getUserWorkspaceRole(userId, wsId);
      // Only owner/admin can remove members
      if (!canManageTeam(userRole)) {
        throw new Error("Only workspace owners and admins can remove members.");
      }
      // Get member info for audit
      const [member] = await db.select().from(workspaceMembers)
        .where(and(eq(workspaceMembers.id, input.memberId), eq(workspaceMembers.workspaceId, wsId)))
        .limit(1);
      if (!member) throw new Error("Member not found.");
      // Cannot remove owner
      const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, wsId)).limit(1);
      if (ws && member.userId === ws.ownerId) {
        throw new Error("Cannot remove the workspace owner.");
      }
      // Admins cannot remove other admins
      if (userRole === "admin" && member.role === "admin") {
        throw new Error("Admins cannot remove other admins. Only the owner can.");
      }
      await db.delete(workspaceMembers)
        .where(and(eq(workspaceMembers.id, input.memberId), eq(workspaceMembers.workspaceId, wsId)));
      // Audit log
      try {
        await db.insert(auditLogs).values({
          workspaceId: wsId,
          userId,
          actionType: "member_removed",
          targetType: "workspace_member",
          targetId: member.userId,
          newValue: JSON.stringify({ role: member.role }),
        });
      } catch (e) { console.error("[Audit] member_removed log failed:", e); }
      return { success: true };
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

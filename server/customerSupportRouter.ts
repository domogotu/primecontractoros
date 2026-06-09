// @ts-nocheck
import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { supportTickets, supportMessages, users } from "../drizzle/schema";
import { eq, and, desc, ne } from "drizzle-orm";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { TRPCError } from "@trpc/server";

/**
 * Customer Support Router
 * Provides workspace-scoped support ticket management for logged-in customers.
 * Customers can only see their own workspace's tickets.
 * Internal notes (isInternalNote=true) are hidden from customers.
 */
export const customerSupportRouter = router({
  // List tickets for the current workspace only
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const wsId = await requireWorkspaceId(ctx.user.id);
    return db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.workspaceId, wsId))
      .orderBy(desc(supportTickets.createdAt));
  }),

  // Get a single ticket by ID (workspace-scoped)
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const wsId = await requireWorkspaceId(ctx.user.id);
      const [ticket] = await db
        .select()
        .from(supportTickets)
        .where(and(eq(supportTickets.id, input.id), eq(supportTickets.workspaceId, wsId)))
        .limit(1);
      if (!ticket) return null;
      return ticket;
    }),

  // Get messages for a ticket (excludes internal notes for customers)
  getMessages: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const wsId = await requireWorkspaceId(ctx.user.id);
      // Verify ticket belongs to this workspace
      const [ticket] = await db
        .select({ id: supportTickets.id })
        .from(supportTickets)
        .where(and(eq(supportTickets.id, input.ticketId), eq(supportTickets.workspaceId, wsId)))
        .limit(1);
      if (!ticket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }
      // Get messages excluding internal notes
      const messages = await db
        .select()
        .from(supportMessages)
        .where(
          and(
            eq(supportMessages.ticketId, input.ticketId),
            eq(supportMessages.isInternalNote, false)
          )
        )
        .orderBy(supportMessages.createdAt);
      return messages;
    }),

  // Create a new support ticket
  create: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(1, "Subject is required"),
        body: z.string().min(1, "Message is required"),
        priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const wsId = await requireWorkspaceId(ctx.user.id);
      const [result] = await db.insert(supportTickets).values({
        workspaceId: wsId,
        userId: ctx.user.id,
        subject: input.subject,
        body: input.body,
        priority: input.priority,
        category: input.category || null,
        status: "open",
      });
      const ticketId = result.insertId;
      // Also create the initial message from the ticket body
      await db.insert(supportMessages).values({
        ticketId: Number(ticketId),
        senderType: "customer",
        senderId: ctx.user.id,
        senderName: ctx.user.name || ctx.user.email || "Customer",
        content: input.body,
        isInternalNote: false,
      });
      return { success: true, ticketId: Number(ticketId) };
    }),

  // Add a reply to an existing ticket (customer)
  addReply: protectedProcedure
    .input(
      z.object({
        ticketId: z.number(),
        content: z.string().min(1, "Message is required"),
        attachmentFileId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const wsId = await requireWorkspaceId(ctx.user.id);
      // Verify ticket belongs to this workspace
      const [ticket] = await db
        .select()
        .from(supportTickets)
        .where(and(eq(supportTickets.id, input.ticketId), eq(supportTickets.workspaceId, wsId)))
        .limit(1);
      if (!ticket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }
      // Only allow replies on open/in_progress/waiting_on_customer tickets
      if (ticket.status === "closed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot reply to a closed ticket. Please reopen it first.",
        });
      }
      await db.insert(supportMessages).values({
        ticketId: input.ticketId,
        senderType: "customer",
        senderId: ctx.user.id,
        senderName: ctx.user.name || ctx.user.email || "Customer",
        content: input.content,
        isInternalNote: false,
        attachmentFileId: input.attachmentFileId || null,
      });
      // If ticket was waiting_on_customer, move it back to open
      if (ticket.status === "waiting_on_customer") {
        await db
          .update(supportTickets)
          .set({ status: "open" })
          .where(eq(supportTickets.id, input.ticketId));
      }
      return { success: true };
    }),

  // Reopen a resolved ticket
  reopen: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const wsId = await requireWorkspaceId(ctx.user.id);
      const [ticket] = await db
        .select()
        .from(supportTickets)
        .where(and(eq(supportTickets.id, input.ticketId), eq(supportTickets.workspaceId, wsId)))
        .limit(1);
      if (!ticket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }
      if (ticket.status !== "resolved") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only resolved tickets can be reopened.",
        });
      }
      await db
        .update(supportTickets)
        .set({ status: "open", resolvedAt: null, resolution: null })
        .where(eq(supportTickets.id, input.ticketId));
      return { success: true };
    }),

  // Close a ticket (customer can close their own resolved tickets)
  close: protectedProcedure
    .input(z.object({ ticketId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const wsId = await requireWorkspaceId(ctx.user.id);
      const [ticket] = await db
        .select()
        .from(supportTickets)
        .where(and(eq(supportTickets.id, input.ticketId), eq(supportTickets.workspaceId, wsId)))
        .limit(1);
      if (!ticket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }
      await db
        .update(supportTickets)
        .set({ status: "closed", closedAt: new Date() })
        .where(eq(supportTickets.id, input.ticketId));
      return { success: true };
    }),

  // ===== Platform Admin Methods =====
  // List ALL tickets across workspaces (admin only)
  adminList: adminProcedure
    .input(
      z.object({
        status: z.string().optional(),
        workspaceId: z.number().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions: any[] = [];
      if (input?.status) conditions.push(eq(supportTickets.status, input.status as any));
      if (input?.workspaceId) conditions.push(eq(supportTickets.workspaceId, input.workspaceId));
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const tickets = await db
        .select()
        .from(supportTickets)
        .where(whereClause)
        .orderBy(desc(supportTickets.createdAt));
      return tickets;
    }),

  // Get ticket detail for admin (includes all messages including internal notes)
  adminGetById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;
      const [ticket] = await db
        .select()
        .from(supportTickets)
        .where(eq(supportTickets.id, input.id))
        .limit(1);
      return ticket || null;
    }),

  // Get all messages for a ticket (admin sees internal notes too)
  adminGetMessages: adminProcedure
    .input(z.object({ ticketId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(supportMessages)
        .where(eq(supportMessages.ticketId, input.ticketId))
        .orderBy(supportMessages.createdAt);
    }),

  // Admin reply to a ticket (can be internal note or customer-visible)
  adminReply: adminProcedure
    .input(
      z.object({
        ticketId: z.number(),
        content: z.string().min(1),
        isInternalNote: z.boolean().default(false),
        attachmentFileId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      await db.insert(supportMessages).values({
        ticketId: input.ticketId,
        senderType: "admin",
        senderId: ctx.user.id,
        senderName: ctx.user.name || "Support Team",
        content: input.content,
        isInternalNote: input.isInternalNote,
        attachmentFileId: input.attachmentFileId || null,
      });
      // If not internal note and ticket is open, set to waiting_on_customer
      if (!input.isInternalNote) {
        const [ticket] = await db
          .select({ status: supportTickets.status })
          .from(supportTickets)
          .where(eq(supportTickets.id, input.ticketId))
          .limit(1);
        if (ticket && (ticket.status === "open" || ticket.status === "in_progress")) {
          await db
            .update(supportTickets)
            .set({ status: "waiting_on_customer" })
            .where(eq(supportTickets.id, input.ticketId));
        }
      }
      return { success: true };
    }),

  // Admin update ticket status/priority/assignment
  adminUpdate: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["open", "in_progress", "waiting_on_customer", "resolved", "closed"]).optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        assignedTo: z.string().optional(),
        resolution: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.status === "resolved") {
        updateData.resolvedAt = new Date();
      }
      if (data.status === "closed") {
        updateData.closedAt = new Date();
      }
      await db.update(supportTickets).set(updateData).where(eq(supportTickets.id, id));
      return { success: true };
    }),
});

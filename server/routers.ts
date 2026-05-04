import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
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
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    signup: publicProcedure
      .input(z.object({
        legalBusinessName: z.string(),
        dba: z.string().optional(),
        businessEmail: z.string().email(),
        phone: z.string().optional(),
        website: z.string().optional(),
        state: z.string().optional(),
        entityType: z.string().optional(),
        fullName: z.string(),
        loginEmail: z.string().email(),
        password: z.string().min(8),
        jobTitle: z.string().optional(),
        userPhone: z.string().optional(),
        accessChoice: z.enum(["trial", "limited", "paid"]),
      }))
      .mutation(async ({ input }) => {
        return {
          success: true,
          message: "Workspace created successfully",
          workspaceId: "ws_" + Math.random().toString(36).substr(2, 9),
        };
      }),
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        return {
          success: true,
          message: "Login successful",
          user: {
            id: "user_" + Math.random().toString(36).substr(2, 9),
            email: input.email,
            name: "User",
          },
        };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  opportunities: router({
    list: publicProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await listOpportunities(input.workspaceId);
        } catch (error) {
          console.error("Error listing opportunities:", error);
          return [];
        }
      }),
    get: publicProcedure
      .input(z.object({ id: z.number(), workspaceId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await getOpportunity(input.id, input.workspaceId);
        } catch (error) {
          console.error("Error getting opportunity:", error);
          return null;
        }
      }),
    create: publicProcedure
      .input(z.object({
        workspaceId: z.number(),
        title: z.string().min(1),
        agency: z.string().optional(),
        solicitation: z.string().optional(),
        naics: z.string().optional(),
        dueDate: z.date().optional(),
        type: z.string().optional(),
        sourceLink: z.string().optional(),
        summary: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          await createOpportunity(input);
          return { success: true };
        } catch (error) {
          console.error("Error creating opportunity:", error);
          throw error;
        }
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        workspaceId: z.number(),
        title: z.string().min(1).optional(),
        agency: z.string().optional(),
        solicitation: z.string().optional(),
        naics: z.string().optional(),
        dueDate: z.date().optional(),
        type: z.string().optional(),
        sourceLink: z.string().optional(),
        summary: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const { id, workspaceId, ...data } = input;
          await updateOpportunity(id, workspaceId, data);
          return { success: true };
        } catch (error) {
          console.error("Error updating opportunity:", error);
          throw error;
        }
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number(), workspaceId: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await deleteOpportunity(input.id, input.workspaceId);
          return { success: true };
        } catch (error) {
          console.error("Error deleting opportunity:", error);
          throw error;
        }
      }),
    updateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        workspaceId: z.number(),
        status: z.enum(["new", "in_review", "pursue", "hold", "no_pursue", "moved_to_proposal", "archived"]),
      }))
      .mutation(async ({ input }) => {
        try {
          await updateOpportunityStatus(input.id, input.workspaceId, input.status);
          return { success: true };
        } catch (error) {
          console.error("Error updating opportunity status:", error);
          throw error;
        }
      }),
  }),
  proposals: router({
    list: publicProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await listProposals(input.workspaceId);
        } catch (error) {
          console.error("Error listing proposals:", error);
          return [];
        }
      }),
    get: publicProcedure
      .input(z.object({ id: z.number(), workspaceId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await getProposal(input.id, input.workspaceId);
        } catch (error) {
          console.error("Error getting proposal:", error);
          return null;
        }
      }),
    create: publicProcedure
      .input(z.object({
        workspaceId: z.number(),
        title: z.string().min(1),
        opportunityId: z.number().optional(),
        framework: z.string().optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          await createProposal(input);
          return { success: true };
        } catch (error) {
          console.error("Error creating proposal:", error);
          throw error;
        }
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        workspaceId: z.number(),
        title: z.string().min(1).optional(),
        opportunityId: z.number().optional(),
        framework: z.string().optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const { id, workspaceId, ...data } = input;
          await updateProposal(id, workspaceId, data);
          return { success: true };
        } catch (error) {
          console.error("Error updating proposal:", error);
          throw error;
        }
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number(), workspaceId: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await deleteProposal(input.id, input.workspaceId);
          return { success: true };
        } catch (error) {
          console.error("Error deleting proposal:", error);
          throw error;
        }
      }),
    updateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        workspaceId: z.number(),
        status: z.enum(["draft", "in_progress", "under_review", "submitted", "won", "lost", "withdrawn", "archived"]),
      }))
      .mutation(async ({ input }) => {
        try {
          await updateProposalStatus(input.id, input.workspaceId, input.status);
          return { success: true };
        } catch (error) {
          console.error("Error updating proposal status:", error);
          throw error;
        }
      }),
  }),
  contracts: router({
    list: publicProcedure
      .input(z.object({ workspaceId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await listContracts(input.workspaceId);
        } catch (error) {
          console.error("Error listing contracts:", error);
          return [];
        }
      }),
    get: publicProcedure
      .input(z.object({ id: z.number(), workspaceId: z.number() }))
      .query(async ({ input }) => {
        try {
          return await getContract(input.id, input.workspaceId);
        } catch (error) {
          console.error("Error getting contract:", error);
          return null;
        }
      }),
    create: publicProcedure
      .input(z.object({
        workspaceId: z.number(),
        title: z.string().min(1),
        proposalId: z.number().optional(),
        contractNumber: z.string().optional(),
        agency: z.string().optional(),
        value: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          await createContract(input);
          return { success: true };
        } catch (error) {
          console.error("Error creating contract:", error);
          throw error;
        }
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        workspaceId: z.number(),
        title: z.string().min(1).optional(),
        proposalId: z.number().optional(),
        contractNumber: z.string().optional(),
        agency: z.string().optional(),
        value: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const { id, workspaceId, ...data } = input;
          await updateContract(id, workspaceId, data);
          return { success: true };
        } catch (error) {
          console.error("Error updating contract:", error);
          throw error;
        }
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number(), workspaceId: z.number() }))
      .mutation(async ({ input }) => {
        try {
          await deleteContract(input.id, input.workspaceId);
          return { success: true };
        } catch (error) {
          console.error("Error deleting contract:", error);
          throw error;
        }
      }),
    updateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        workspaceId: z.number(),
        status: z.enum(["setup", "active", "modification", "closeout", "closed", "suspended"]),
      }))
      .mutation(async ({ input }) => {
        try {
          await updateContractStatus(input.id, input.workspaceId, input.status);
          return { success: true };
        } catch (error) {
          console.error("Error updating contract status:", error);
          throw error;
        }
      }),
    updateHealth: publicProcedure
      .input(z.object({
        id: z.number(),
        workspaceId: z.number(),
        health: z.enum(["healthy", "at_risk", "warning"]),
      }))
      .mutation(async ({ input }) => {
        try {
          await updateContractHealth(input.id, input.workspaceId, input.health);
          return { success: true };
        } catch (error) {
          console.error("Error updating contract health:", error);
          throw error;
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;

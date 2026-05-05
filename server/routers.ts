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
  createAiRun,
  createAiSuggestion,
  getAiSuggestionsForRecord,
  dismissAiSuggestion,
  acceptAiSuggestion,
} from "./db";
import { invokeLLM } from "./_core/llm";
import {
  filesRouter, contactsRouter, messagesRouter, invoicesRouter, paymentsRouter,
  tasksRouter, alertsRouter, deliverablesRouter, deadlinesRouter, obligationsRouter,
  complianceRouter, notesRouter, capabilityStatementsRouter, templatesRouter,
  closeoutRouter, lessonsRouter, lossReviewsRouter
} from "./entityRouters";
import { workspaceRouter, platformRouter } from "./platformRouter";

export const appRouter = router({
  system: systemRouter,
  workspace: workspaceRouter,
  platform: platformRouter,
  files: filesRouter,
  contacts: contactsRouter,
  messages: messagesRouter,
  invoices: invoicesRouter,
  payments: paymentsRouter,
  tasks: tasksRouter,
  alerts: alertsRouter,
  deliverables: deliverablesRouter,
  deadlines: deadlinesRouter,
  obligations: obligationsRouter,
  compliance: complianceRouter,
  notes: notesRouter,
  capabilityStatements: capabilityStatementsRouter,
  templates: templatesRouter,
  closeout: closeoutRouter,
  lessons: lessonsRouter,
  lossReviews: lossReviewsRouter,
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
    convertToProposal: publicProcedure
      .input(z.object({
        opportunityId: z.number(),
        workspaceId: z.number(),
        proposalTitle: z.string().min(1),
        framework: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const opportunity = await getOpportunity(input.opportunityId, input.workspaceId);
          if (!opportunity) {
            throw new Error("Opportunity not found");
          }
          const proposal = await createProposal({
            workspaceId: input.workspaceId,
            title: input.proposalTitle,
            opportunityId: input.opportunityId,
            framework: input.framework,
            dueDate: opportunity.dueDate || undefined,
          });
          await updateOpportunityStatus(input.opportunityId, input.workspaceId, "moved_to_proposal");
          return { success: true, proposalId: proposal };
        } catch (error) {
          console.error("Error converting opportunity to proposal:", error);
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
    convertToContract: publicProcedure
      .input(z.object({
        proposalId: z.number(),
        workspaceId: z.number(),
        contractTitle: z.string().min(1),
        contractNumber: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const proposal = await getProposal(input.proposalId, input.workspaceId);
          if (!proposal) {
            throw new Error("Proposal not found");
          }
          const contract = await createContract({
            workspaceId: input.workspaceId,
            title: input.contractTitle,
            proposalId: input.proposalId,
            contractNumber: input.contractNumber || undefined,
          });
          await updateProposalStatus(input.proposalId, input.workspaceId, "won");
          return { success: true, contractId: contract };
        } catch (error) {
          console.error("Error converting proposal to contract:", error);
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
    convertFromProposal: publicProcedure
      .input(z.object({
        proposalId: z.number(),
        workspaceId: z.number(),
      }))
      .query(async ({ input }) => {
        try {
          const proposal = await getProposal(input.proposalId, input.workspaceId);
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
    generateGuidance: publicProcedure
      .input(z.object({
        workspaceId: z.number(),
        recordType: z.string(),
        recordId: z.number(),
        context: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          if (!ctx.user?.id) throw new Error("User not authenticated");
          
          // Create AI run
          await createAiRun({
            workspaceId: input.workspaceId,
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
          const suggestions = [];
          try {
            const parsed = JSON.parse(messageContent);
            if (Array.isArray(parsed)) {
              suggestions.push(...parsed);
            } else if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
              suggestions.push(...parsed.suggestions);
            }
          } catch {
            // If JSON parsing fails, extract suggestions from text
            suggestions.push({
              title: "AI Guidance",
              text: messageContent.substring(0, 500),
              priority: "medium",
            });
          }

          // Store suggestions
          for (const suggestion of suggestions) {
            await createAiSuggestion({
              workspaceId: input.workspaceId,
              aiRunId: 1, // Placeholder - would be actual run ID
              relatedRecordType: input.recordType,
              relatedRecordId: input.recordId,
              suggestionTitle: suggestion.title || "AI Suggestion",
              suggestionText: suggestion.text || messageContent,
              priority: suggestion.priority || "medium",
              suggestedAction: suggestion.action,
            });
          }

          return { success: true, suggestionsCount: suggestions.length };
        } catch (error) {
          console.error("Error generating guidance:", error);
          throw error;
        }
      }),
    getSuggestions: publicProcedure
      .input(z.object({
        workspaceId: z.number(),
        recordType: z.string(),
        recordId: z.number(),
      }))
      .query(async ({ input }) => {
        try {
          return await getAiSuggestionsForRecord(
            input.workspaceId,
            input.recordType,
            input.recordId
          );
        } catch (error) {
          console.error("Error fetching suggestions:", error);
          throw error;
        }
      }),
    dismissSuggestion: publicProcedure
      .input(z.object({
        id: z.number(),
        workspaceId: z.number(),
      }))
      .mutation(async ({ input }) => {
        try {
          await dismissAiSuggestion(input.id, input.workspaceId);
          return { success: true };
        } catch (error) {
          console.error("Error dismissing suggestion:", error);
          throw error;
        }
      }),
    acceptSuggestion: publicProcedure
      .input(z.object({
        id: z.number(),
        workspaceId: z.number(),
      }))
      .mutation(async ({ input }) => {
        try {
          await acceptAiSuggestion(input.id, input.workspaceId);
          return { success: true };
        } catch (error) {
          console.error("Error accepting suggestion:", error);
          throw error;
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;

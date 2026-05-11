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
} from "./db";
import { invokeLLM } from "./_core/llm";
import {
  filesRouter, contactsRouter, messagesRouter, invoicesRouter, paymentsRouter,
  tasksRouter, alertsRouter, deliverablesRouter, deadlinesRouter, obligationsRouter,
  complianceRouter, notesRouter, capabilityStatementsRouter, templatesRouter,
  closeoutRouter, lessonsRouter, lossReviewsRouter
} from "./entityRouters";
import { workspaceRouter, platformRouter } from "./platformRouter";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { clinsRouter, modificationsRouter, personnelRouter, complianceMatrixRouter, teamAssignmentsRouter, settingsRouter, financeRouter, findingsRouter, auditRouter } from "./featureRouter";
import { fileStorageRouter, emailRouter, billingRouter, reportsRouter, templatesRouter as intTemplatesRouter, closeoutRouter as intCloseoutRouter, lessonsLearnedRouter, capabilityRouter } from "./integrationsRouter";
import { guidanceRouter } from "./guidanceRouter";
import { platformAdminRouter } from "./platformAdminRouter";
import { pdfRouter } from "./pdfRouter";

export const appRouter = router({
  pdf: pdfRouter,
  system: systemRouter,
  workspace: workspaceRouter,
  platform: platformRouter,
  platformAdmin: platformAdminRouter,
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
          const wsId = await requireWorkspaceId(ctx.user.id);
          await createOpportunity({ ...input, workspaceId: wsId });
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
          const wsId = await requireWorkspaceId(ctx.user.id);
          const { id, ...data } = input;
          await updateOpportunity(id, wsId, data);
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
          const wsId = await requireWorkspaceId(ctx.user.id);
          await deleteOpportunity(input.id, wsId);
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
          const wsId = await requireWorkspaceId(ctx.user.id);
          await updateOpportunityStatus(input.id, wsId, input.status);
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
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const wsId = await requireWorkspaceId(ctx.user.id);
          const opportunity = await getOpportunity(input.opportunityId, wsId);
          if (!opportunity) {
            throw new Error("Opportunity not found");
          }
          const proposal = await createProposal({
            workspaceId: wsId,
            title: input.proposalTitle,
            opportunityId: input.opportunityId,
            framework: input.framework,
            dueDate: opportunity.dueDate || undefined,
          });
          await updateOpportunityStatus(input.opportunityId, wsId, "moved_to_proposal");
          return { success: true, proposalId: proposal };
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
          const wsId = await requireWorkspaceId(ctx.user.id);
          await createProposal({ ...input, workspaceId: wsId });
          return { success: true };
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
          const wsId = await requireWorkspaceId(ctx.user.id);
          const { id, ...data } = input;
          await updateProposal(id, wsId, data);
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
          const wsId = await requireWorkspaceId(ctx.user.id);
          await deleteProposal(input.id, wsId);
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
          const wsId = await requireWorkspaceId(ctx.user.id);
          await updateProposalStatus(input.id, wsId, input.status);
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
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const wsId = await requireWorkspaceId(ctx.user.id);
          const proposal = await getProposal(input.proposalId, wsId);
          if (!proposal) {
            throw new Error("Proposal not found");
          }
          const contract = await createContract({
            workspaceId: wsId,
            title: input.contractTitle,
            proposalId: input.proposalId,
            contractNumber: input.contractNumber || undefined,
          });
          await updateProposalStatus(input.proposalId, wsId, "won");
          return { success: true, contractId: contract };
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
          const wsId = await requireWorkspaceId(ctx.user.id);
          await createContract({ ...input, workspaceId: wsId });
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
          const wsId = await requireWorkspaceId(ctx.user.id);
          const { id, ...data } = input;
          await updateContract(id, wsId, data);
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
          const wsId = await requireWorkspaceId(ctx.user.id);
          await deleteContract(input.id, wsId);
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
          const wsId = await requireWorkspaceId(ctx.user.id);
          await updateContractStatus(input.id, wsId, input.status);
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
          const wsId = await requireWorkspaceId(ctx.user.id);
          await updateContractHealth(input.id, wsId, input.health);
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
  }),
});

export type AppRouter = typeof appRouter;

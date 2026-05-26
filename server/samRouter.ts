/**
 * SAM.gov Router — tRPC procedures for SAM.gov API integration
 */
import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { searchOpportunities, searchEntities, getOpportunityByNoticeId } from "./services/samGov";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { getDb } from "./db";
import { opportunities } from "../drizzle/schema";
import { logAudit } from "./featureRouter";

export const samRouter = router({
  searchOpportunities: protectedProcedure
    .input(z.object({
      keyword: z.string().optional(),
      naicsCode: z.string().optional(),
      setAside: z.string().optional(),
      postedFrom: z.string().optional(),
      postedTo: z.string().optional(),
      responseDeadlineFrom: z.string().optional(),
      responseDeadlineTo: z.string().optional(),
      status: z.string().optional(),
      limit: z.number().default(25),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return await searchOpportunities(input);
    }),

  searchEntities: protectedProcedure
    .input(z.object({
      ueiSAM: z.string().optional(),
      cageCode: z.string().optional(),
      legalBusinessName: z.string().optional(),
      stateCode: z.string().optional(),
      naicsCode: z.string().optional(),
      limit: z.number().default(10),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return await searchEntities(input);
    }),

  getOpportunity: protectedProcedure
    .input(z.object({ noticeId: z.string() }))
    .query(async ({ input }) => {
      return await getOpportunityByNoticeId(input.noticeId);
    }),

  importOpportunity: protectedProcedure
    .input(z.object({
      noticeId: z.string(),
      title: z.string(),
      agency: z.string().optional(),
      solicitationNumber: z.string().optional(),
      naicsCode: z.string().optional(),
      setAside: z.string().optional(),
      responseDeadline: z.string().optional(),
      description: z.string().optional(),
      sourceLink: z.string().optional(),
      type: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const wsId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(opportunities).values({
        workspaceId: wsId,
        title: input.title,
        agency: input.agency || null,
        solicitation: input.solicitationNumber || null,
        naics: input.naicsCode || null,
        setAside: input.setAside || null,
        dueDate: input.responseDeadline ? new Date(input.responseDeadline) : null,
        summary: input.description || null,
        sourceLink: input.sourceLink || null,
        type: input.type || "federal",
        status: "new",
      });

      try { await logAudit(wsId, ctx.user.id, "create", "opportunities", 0, { source: "sam.gov", noticeId: input.noticeId }); } catch {}
      return { success: true, id: (result as any)?.[0]?.insertId || 0 };
    }),
});

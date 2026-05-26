/**
 * Smart Search 3-Layer System Router
 * Layer 1: Local workspace search
 * Layer 2: External data enrichment (SAM.gov, NAICS, FAR)
 * Layer 3: AI interpretation
 */
import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { requireWorkspaceId } from "./workspaceMiddleware";
import { getDb } from "./db";
import {
  opportunities, proposals, contracts, files, contacts,
  invoices, tasks, payments
} from "../drizzle/schema";
import { eq, and, like, or, sql } from "drizzle-orm";
import { searchOpportunities } from "./services/samGov";
import { invokeLLM } from "./_core/llm";

export const searchRouter = router({
  /**
   * Layer 1: Local workspace search
   */
  local: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      types: z.array(z.string()).optional(),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const workspaceId = await requireWorkspaceId(ctx.user.id);
      const db = await getDb();
      if (!db) return { results: [] };

      const searchPattern = `%${input.query}%`;
      const results: Array<{
        type: string;
        id: number;
        title: string;
        subtitle?: string;
        status?: string;
        updatedAt?: Date;
      }> = [];

      const typesToSearch = input.types || ["opportunity", "proposal", "contract", "file", "contact", "invoice", "task"];

      // Search opportunities
      if (typesToSearch.includes("opportunity")) {
        const opps = await db.select().from(opportunities)
          .where(and(
            eq(opportunities.workspaceId, workspaceId),
            or(
              like(opportunities.title, searchPattern),
              like(opportunities.agency, searchPattern),
              like(opportunities.solicitation, searchPattern),
              like(opportunities.summary, searchPattern)
            )
          ))
          .limit(5);
        results.push(...opps.map(o => ({
          type: "opportunity",
          id: o.id,
          title: o.title,
          subtitle: o.agency || undefined,
          status: o.status || undefined,
          updatedAt: o.updatedAt,
        })));
      }

      // Search proposals
      if (typesToSearch.includes("proposal")) {
        const props = await db.select().from(proposals)
          .where(and(
            eq(proposals.workspaceId, workspaceId),
            like(proposals.title, searchPattern)
          ))
          .limit(5);
        results.push(...props.map(p => ({
          type: "proposal",
          id: p.id,
          title: p.title,
          subtitle: p.framework || undefined,
          status: p.status || undefined,
          updatedAt: p.updatedAt,
        })));
      }

      // Search contracts
      if (typesToSearch.includes("contract")) {
        const cons = await db.select().from(contracts)
          .where(and(
            eq(contracts.workspaceId, workspaceId),
            or(
              like(contracts.title, searchPattern),
              like(contracts.contractNumber, searchPattern),
              like(contracts.agency, searchPattern)
            )
          ))
          .limit(5);
        results.push(...cons.map(c => ({
          type: "contract",
          id: c.id,
          title: c.title,
          subtitle: c.contractNumber || c.agency || undefined,
          status: c.status || undefined,
          updatedAt: c.updatedAt,
        })));
      }

      // Search files
      if (typesToSearch.includes("file")) {
        const fls = await db.select().from(files)
          .where(and(
            eq(files.workspaceId, workspaceId),
            like(files.name, searchPattern)
          ))
          .limit(5);
        results.push(...fls.map(f => ({
          type: "file",
          id: f.id,
          title: f.name,
          subtitle: f.category || undefined,
          status: undefined,
          updatedAt: f.updatedAt,
        })));
      }

      // Search contacts
      if (typesToSearch.includes("contact")) {
        const cts = await db.select().from(contacts)
          .where(and(
            eq(contacts.workspaceId, workspaceId),
            or(
              like(contacts.firstName, searchPattern),
              like(contacts.lastName, searchPattern),
              like(contacts.organization, searchPattern),
              like(contacts.email, searchPattern)
            )
          ))
          .limit(5);
        results.push(...cts.map(c => ({
          type: "contact",
          id: c.id,
          title: `${c.firstName} ${c.lastName}`,
          subtitle: c.organization || undefined,
          status: undefined,
          updatedAt: c.updatedAt,
        })));
      }

      // Search invoices
      if (typesToSearch.includes("invoice")) {
        const invs = await db.select().from(invoices)
          .where(and(
            eq(invoices.workspaceId, workspaceId),
            or(
              like(invoices.invoiceNumber, searchPattern),
              like(invoices.description, searchPattern)
            )
          ))
          .limit(5);
        results.push(...invs.map(i => ({
          type: "invoice",
          id: i.id,
          title: `Invoice ${i.invoiceNumber}`,
          subtitle: `$${i.amount}`,
          status: i.status || undefined,
          updatedAt: i.updatedAt,
        })));
      }

      // Search tasks
      if (typesToSearch.includes("task")) {
        const tks = await db.select().from(tasks)
          .where(and(
            eq(tasks.workspaceId, workspaceId),
            or(
              like(tasks.title, searchPattern),
              like(tasks.description, searchPattern)
            )
          ))
          .limit(5);
        results.push(...tks.map(t => ({
          type: "task",
          id: t.id,
          title: t.title,
          subtitle: undefined,
          status: t.status || undefined,
          updatedAt: t.updatedAt,
        })));
      }

      return { results };
    }),

  /**
   * Layer 2: External data enrichment
   */
  external: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      sources: z.array(z.string()).optional(),
    }))
    .query(async ({ input }) => {
      const results: Array<{
        source: string;
        type: string;
        title: string;
        description?: string;
        url?: string;
        metadata?: Record<string, unknown>;
      }> = [];

      const sources = input.sources || ["sam_gov", "naics", "far"];

      // SAM.gov opportunities search
      if (sources.includes("sam_gov")) {
        try {
          const samResults = await searchOpportunities({
            keyword: input.query,
            limit: 5,
            offset: 0,
          });
          const opps = (samResults as any)?.opportunitiesData || [];
          if (Array.isArray(opps)) {
            results.push(...opps.slice(0, 5).map((o: any) => ({
              source: "sam_gov",
              type: "opportunity",
              title: o.title || o.solicitationNumber || "SAM.gov Opportunity",
              description: o.description?.substring(0, 200),
              url: o.uiLink || `https://sam.gov/opp/${o.noticeId}`,
              metadata: { noticeId: o.noticeId, naics: o.naicsCode, agency: o.department },
            })));
          }
        } catch (e) {
          // SAM.gov search failed silently
        }
      }

      // NAICS code lookup
      if (sources.includes("naics")) {
        const naicsData = lookupNAICS(input.query);
        results.push(...naicsData);
      }

      // FAR clause lookup
      if (sources.includes("far")) {
        const farData = lookupFAR(input.query);
        results.push(...farData);
      }

      return { results };
    }),

  /**
   * Layer 3: AI interpretation
   */
  aiInterpret: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      context: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const prompt = `You are a government contracting assistant. The user searched for: "${input.query}"
${input.context ? `Context: ${input.context}` : ""}

Provide a brief interpretation of what they might be looking for. Include:
1. What they likely need (1-2 sentences)
2. Suggested actions (2-3 bullet points)
3. Related terms they might also search for

Keep response concise and actionable.`;

        const response = await invokeLLM({
          messages: [{ role: "user", content: prompt }],
          max_tokens: 300,
        });

        const content = response?.choices?.[0]?.message?.content;
        const textContent = typeof content === "string" ? content : "Unable to interpret query";

        return {
          interpretation: textContent,
          suggestions: [
            `Search your records for "${input.query}"`,
            `Check SAM.gov for related opportunities`,
            `Review FAR clauses related to "${input.query}"`,
          ],
        };
      } catch (e) {
        return {
          interpretation: `Searching for "${input.query}" - check local records and SAM.gov for matches`,
          suggestions: [
            `Search your records for "${input.query}"`,
            `Check SAM.gov for related opportunities`,
          ],
        };
      }
    }),
});

// NAICS code reference data
function lookupNAICS(query: string): Array<{ source: string; type: string; title: string; description?: string; url?: string; metadata?: Record<string, unknown> }> {
  const naicsData: Record<string, { title: string; description: string }> = {
    "541512": { title: "Computer Systems Design Services", description: "Custom computer programming, systems integration, and design services" },
    "541511": { title: "Custom Computer Programming Services", description: "Writing, modifying, testing, and supporting software" },
    "541519": { title: "Other Computer Related Services", description: "Computer disaster recovery, software installation, microfilm recording" },
    "541330": { title: "Engineering Services", description: "Applying physical laws and principles of engineering" },
    "541611": { title: "Administrative Management Consulting", description: "Administrative management and general management consulting" },
    "541612": { title: "Human Resources Consulting", description: "Human resource consulting services" },
    "541613": { title: "Marketing Consulting", description: "Marketing consulting services" },
    "541614": { title: "Process, Physical Distribution, and Logistics Consulting", description: "Logistics and supply chain consulting" },
    "541620": { title: "Environmental Consulting", description: "Environmental consulting services" },
    "561210": { title: "Facilities Support Services", description: "Operating and maintaining facilities" },
  };

  const results: Array<{ source: string; type: string; title: string; description?: string; url?: string; metadata?: Record<string, unknown> }> = [];
  const queryLower = query.toLowerCase();

  for (const [code, data] of Object.entries(naicsData)) {
    if (code.includes(query) || data.title.toLowerCase().includes(queryLower) || data.description.toLowerCase().includes(queryLower)) {
      results.push({
        source: "naics",
        type: "reference",
        title: `NAICS ${code}: ${data.title}`,
        description: data.description,
        url: `https://www.census.gov/naics/?input=${code}`,
        metadata: { code },
      });
    }
  }

  return results.slice(0, 5);
}

// FAR clause reference data
function lookupFAR(query: string): Array<{ source: string; type: string; title: string; description?: string; url?: string; metadata?: Record<string, unknown> }> {
  const farClauses: Array<{ clause: string; title: string; description: string }> = [
    { clause: "52.212-1", title: "Instructions to Offerors—Commercial Products", description: "Standard instructions for commercial item acquisitions" },
    { clause: "52.212-4", title: "Contract Terms and Conditions—Commercial Products", description: "Standard terms for commercial contracts" },
    { clause: "52.219-1", title: "Small Business Program Representations", description: "Small business size standard representations" },
    { clause: "52.222-26", title: "Equal Opportunity", description: "Equal opportunity clause for federal contractors" },
    { clause: "52.222-35", title: "Equal Opportunity for Veterans", description: "Affirmative action for veterans" },
    { clause: "52.222-36", title: "Equal Opportunity for Workers with Disabilities", description: "Affirmative action for workers with disabilities" },
    { clause: "52.225-1", title: "Buy American—Supplies", description: "Buy American Act requirements for supplies" },
    { clause: "52.232-33", title: "Payment by Electronic Funds Transfer", description: "EFT payment requirements" },
    { clause: "52.244-6", title: "Subcontracts for Commercial Products", description: "Flow-down clauses for subcontracts" },
    { clause: "52.204-7", title: "System for Award Management", description: "SAM registration requirements" },
  ];

  const queryLower = query.toLowerCase();
  return farClauses
    .filter(f =>
      f.clause.includes(query) ||
      f.title.toLowerCase().includes(queryLower) ||
      f.description.toLowerCase().includes(queryLower)
    )
    .slice(0, 5)
    .map(f => ({
      source: "far",
      type: "reference",
      title: `FAR ${f.clause}: ${f.title}`,
      description: f.description,
      url: `https://www.acquisition.gov/far/${f.clause.replace("52.", "part-52#FAR_")}`,
      metadata: { clause: f.clause },
    }));
}

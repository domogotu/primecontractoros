/**
 * Training/Walkthrough System Router
 * Manages training modules and completion tracking
 */
import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { trainingModules, trainingCompletions } from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

// Default training modules seeded on first access
const DEFAULT_MODULES = [
  {
    title: "Welcome to PrimeContractorOS",
    description: "Learn the basics of navigating the platform",
    targetPage: "dashboard",
    steps: JSON.stringify([
      { title: "Welcome!", content: "PrimeContractorOS helps you manage government contracts from opportunity to closeout.", target: ".dashboard-header", position: "bottom" },
      { title: "Navigation", content: "Use the sidebar to navigate between different sections of the platform.", target: ".sidebar-nav", position: "right" },
      { title: "Quick Actions", content: "Create new records, search, and access common actions from the top bar.", target: ".top-nav", position: "bottom" },
      { title: "Command Palette", content: "Press Cmd+K (or Ctrl+K) anytime to open the command palette for quick navigation.", target: "body", position: "center" },
    ]),
    orderIndex: 0,
  },
  {
    title: "Managing Opportunities",
    description: "Learn how to track and manage contracting opportunities",
    targetPage: "opportunities",
    steps: JSON.stringify([
      { title: "Opportunity Pipeline", content: "Track all your government contracting opportunities in one place.", target: ".page-header", position: "bottom" },
      { title: "Create Opportunities", content: "Use Smart Intake to create opportunities manually, from SAM.gov, or by pasting descriptions.", target: ".create-button", position: "bottom" },
      { title: "Status Tracking", content: "Move opportunities through stages: New → In Review → Pursue → Proposal.", target: ".status-badges", position: "top" },
      { title: "Guidance Questions", content: "The Guidance Panel shows relevant questions and checks for each opportunity.", target: ".guidance-panel", position: "left" },
    ]),
    orderIndex: 1,
  },
  {
    title: "Working with Proposals",
    description: "Learn the proposal creation and management workflow",
    targetPage: "proposals",
    steps: JSON.stringify([
      { title: "Proposal Management", content: "Create and manage proposals linked to opportunities.", target: ".page-header", position: "bottom" },
      { title: "Frameworks", content: "Choose a proposal framework to structure your response.", target: ".framework-selector", position: "bottom" },
      { title: "Compliance Matrix", content: "Track compliance requirements and ensure all are addressed.", target: ".compliance-section", position: "left" },
      { title: "Submission", content: "Track due dates and submission status for each proposal.", target: ".due-date", position: "top" },
    ]),
    orderIndex: 2,
  },
  {
    title: "Contract Management",
    description: "Learn how to manage active contracts",
    targetPage: "contracts",
    steps: JSON.stringify([
      { title: "Contract Hub", content: "Manage all your active contracts with health monitoring.", target: ".page-header", position: "bottom" },
      { title: "Health Status", content: "Monitor contract health - green (healthy), amber (at risk), red (warning).", target: ".health-indicators", position: "left" },
      { title: "Deliverables & Deadlines", content: "Track deliverables, deadlines, and obligations for each contract.", target: ".deliverables-section", position: "top" },
      { title: "Invoicing", content: "Create and track invoices linked to contracts.", target: ".invoice-section", position: "left" },
    ]),
    orderIndex: 3,
  },
  {
    title: "File Management",
    description: "Learn how to organize and manage documents",
    targetPage: "files",
    steps: JSON.stringify([
      { title: "Document Library", content: "Store and organize all your contracting documents.", target: ".page-header", position: "bottom" },
      { title: "Categories", content: "Classify files as governing, supporting, deliverable, or correspondence.", target: ".category-filter", position: "right" },
      { title: "Linking", content: "Link files to specific opportunities, proposals, or contracts.", target: ".link-button", position: "top" },
      { title: "AI Analysis", content: "Use AI to scan and analyze contract documents for key terms.", target: ".ai-scan-button", position: "left" },
    ]),
    orderIndex: 4,
  },
  {
    title: "Invoice & Payment Tracking",
    description: "Learn the invoicing and payment workflow",
    targetPage: "invoices",
    steps: JSON.stringify([
      { title: "Invoice Management", content: "Create, submit, and track invoices for your contracts.", target: ".page-header", position: "bottom" },
      { title: "Status Workflow", content: "Track invoices from draft → submitted → approved → paid.", target: ".status-column", position: "left" },
      { title: "Rate Parity", content: "The system automatically checks that invoice rates match contract rates.", target: ".parity-indicator", position: "top" },
      { title: "Payment Tracking", content: "Record payments received and reconcile with invoices.", target: ".payment-section", position: "left" },
    ]),
    orderIndex: 5,
  },
  {
    title: "SAM.gov Integration",
    description: "Learn how to search and import from SAM.gov",
    targetPage: "sam_search",
    steps: JSON.stringify([
      { title: "SAM.gov Search", content: "Search for federal contracting opportunities directly from the platform.", target: ".page-header", position: "bottom" },
      { title: "Filters", content: "Filter by keyword, NAICS code, set-aside type, and agency.", target: ".filter-section", position: "right" },
      { title: "Import", content: "One-click import opportunities from SAM.gov into your pipeline.", target: ".import-button", position: "left" },
      { title: "Auto-Fetch", content: "Paste a SAM.gov URL to automatically fetch all opportunity details.", target: ".url-input", position: "bottom" },
    ]),
    orderIndex: 6,
  },
  {
    title: "Onboarding Your Business",
    description: "Set up your business profile and certifications",
    targetPage: "onboarding",
    steps: JSON.stringify([
      { title: "Business Setup", content: "Configure your company profile for government contracting.", target: ".page-header", position: "bottom" },
      { title: "NAICS Codes", content: "Add your NAICS codes to match with relevant opportunities.", target: ".naics-section", position: "right" },
      { title: "Certifications", content: "Record your small business certifications (8(a), HUBZone, SDVOSB, etc.).", target: ".cert-section", position: "right" },
      { title: "SAM Registration", content: "Ensure your SAM.gov registration is current and verified.", target: ".sam-section", position: "bottom" },
    ]),
    orderIndex: 7,
  },
];

export const trainingRouter = router({
  /**
   * Get training modules for a specific page
   */
  getModulesForPage: protectedProcedure
    .input(z.object({ targetPage: z.string() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        // Return in-memory modules
        const module = DEFAULT_MODULES.find(m => m.targetPage === input.targetPage);
        if (!module) return null;
        return {
          ...module,
          id: DEFAULT_MODULES.indexOf(module) + 1,
          isCompleted: false,
          steps: JSON.parse(module.steps),
        };
      }

      // Check if modules exist, seed if not
      const existing = await db.select().from(trainingModules)
        .where(eq(trainingModules.targetPage, input.targetPage))
        .limit(1);

      if (existing.length === 0) {
        // Seed this module
        const defaultModule = DEFAULT_MODULES.find(m => m.targetPage === input.targetPage);
        if (!defaultModule) return null;

        const [inserted] = await db.insert(trainingModules).values({
          title: defaultModule.title,
          description: defaultModule.description,
          steps: defaultModule.steps,
          targetPage: defaultModule.targetPage,
          orderIndex: defaultModule.orderIndex,
          isActive: true,
        }).$returningId();

        // Check completion
        const completions = await db.select().from(trainingCompletions)
          .where(and(
            eq(trainingCompletions.userId, ctx.user.id),
            eq(trainingCompletions.moduleId, inserted.id)
          ));

        return {
          id: inserted.id,
          title: defaultModule.title,
          description: defaultModule.description,
          steps: JSON.parse(defaultModule.steps),
          targetPage: defaultModule.targetPage,
          isCompleted: completions.length > 0,
        };
      }

      const module = existing[0];

      // Check if user has completed this module
      const completions = await db.select().from(trainingCompletions)
        .where(and(
          eq(trainingCompletions.userId, ctx.user.id),
          eq(trainingCompletions.moduleId, module.id)
        ));

      return {
        id: module.id,
        title: module.title,
        description: module.description,
        steps: JSON.parse(module.steps),
        targetPage: module.targetPage,
        isCompleted: completions.length > 0,
      };
    }),

  /**
   * Mark a training module as complete
   */
  markComplete: protectedProcedure
    .input(z.object({ moduleId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { success: true };

      // Check if already completed
      const existing = await db.select().from(trainingCompletions)
        .where(and(
          eq(trainingCompletions.userId, ctx.user.id),
          eq(trainingCompletions.moduleId, input.moduleId)
        ));

      if (existing.length === 0) {
        await db.insert(trainingCompletions).values({
          userId: ctx.user.id,
          moduleId: input.moduleId,
        });
      }

      return { success: true };
    }),

  /**
   * Reset training progress for a user
   */
  resetProgress: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { success: true };

    await db.delete(trainingCompletions)
      .where(eq(trainingCompletions.userId, ctx.user.id));

    return { success: true };
  }),

  /**
   * Get all modules with completion status
   */
  getAllModules: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return DEFAULT_MODULES.map((m, idx) => ({
        id: idx + 1,
        ...m,
        steps: JSON.parse(m.steps),
        isCompleted: false,
      }));
    }

    const modules = await db.select().from(trainingModules)
      .where(eq(trainingModules.isActive, true));

    if (modules.length === 0) {
      // Return defaults
      return DEFAULT_MODULES.map((m, idx) => ({
        id: idx + 1,
        ...m,
        steps: JSON.parse(m.steps),
        isCompleted: false,
      }));
    }

    const completions = await db.select().from(trainingCompletions)
      .where(eq(trainingCompletions.userId, ctx.user.id));

    const completedIds = new Set(completions.map(c => c.moduleId));

    return modules.map(m => ({
      id: m.id,
      title: m.title,
      description: m.description,
      steps: JSON.parse(m.steps),
      targetPage: m.targetPage,
      isCompleted: completedIds.has(m.id),
    }));
  }),
});

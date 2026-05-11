import { getDb } from "../../server/db";
import { 
  suggestedNextActions, 
  opportunities, 
  proposals, 
  contracts, 
  tasks,
  invoices,
  workspaceMembers,
  files,
  contacts
} from "../../drizzle/schema";
import { eq, and, isNull, lt, gte, desc } from "drizzle-orm";

export interface GuidanceContext {
  workspaceId: number;
  userId: number;
}

export interface NextAction {
  id?: number;
  category: string;
  title: string;
  description: string;
  actionType: string;
  priority: "low" | "medium" | "high" | "critical";
  reason: string;
  rationale?: string;
  estimatedMinutes: number;
}

/**
 * Rule-based guidance engine that analyzes workspace state
 * and suggests next actions WITHOUT AI
 */
export class GuidanceEngine {
  async analyzeWorkspace(ctx: GuidanceContext): Promise<NextAction[]> {
    const db = await getDb();
    if (!db) return [];

    const actions: NextAction[] = [];

    // Get workspace data
    const [oppCount, propCount, contractCount, taskCount, invoiceCount, teamCount, fileCount, contactCount] = await Promise.all([
      db.select({ count: opportunities.id }).from(opportunities).where(eq(opportunities.workspaceId, ctx.workspaceId)),
      db.select({ count: proposals.id }).from(proposals).where(eq(proposals.workspaceId, ctx.workspaceId)),
      db.select({ count: contracts.id }).from(contracts).where(eq(contracts.workspaceId, ctx.workspaceId)),
      db.select({ count: tasks.id }).from(tasks).where(eq(tasks.workspaceId, ctx.workspaceId)),
      db.select({ count: invoices.id }).from(invoices).where(eq(invoices.workspaceId, ctx.workspaceId)),
      db.select({ count: workspaceMembers.id }).from(workspaceMembers).where(eq(workspaceMembers.workspaceId, ctx.workspaceId)),
      db.select({ count: files.id }).from(files).where(eq(files.workspaceId, ctx.workspaceId)),
      db.select({ count: contacts.id }).from(contacts).where(eq(contacts.workspaceId, ctx.workspaceId)),
    ]);

    // Rule 1: No opportunities yet - suggest creating first opportunity
    if (!oppCount || oppCount.length === 0 || oppCount[0].count === 0) {
      actions.push({
        category: "opportunity",
        title: "Create Your First Opportunity",
        description: "Start tracking a government contracting opportunity to build your pipeline.",
        actionType: "create",
        priority: "high",
        reason: "No opportunities found in your workspace. Start by tracking potential opportunities.",
        estimatedMinutes: 10,
      });
    }

    // Rule 2: Opportunities without proposals - suggest creating proposal
    const oppWithoutProposals = await db
      .select({ id: opportunities.id, title: opportunities.title })
      .from(opportunities)
      .where(and(
        eq(opportunities.workspaceId, ctx.workspaceId),
        isNull(opportunities.deletedAt)
      ))
      .limit(1);

    if (oppWithoutProposals.length > 0) {
      actions.push({
        category: "proposal",
        title: `Create Proposal for "${oppWithoutProposals[0].title}"`,
        description: "Convert this opportunity into a proposal to track your response.",
        actionType: "create",
        priority: "high",
        reason: `You have an opportunity "${oppWithoutProposals[0].title}" without a proposal yet.`,
        estimatedMinutes: 30,
      });
    }

    // Rule 3: Proposals without contracts - suggest tracking award
    const propWithoutContracts = await db
      .select({ id: proposals.id, title: proposals.title })
      .from(proposals)
      .where(and(
        eq(proposals.workspaceId, ctx.workspaceId),
        isNull(proposals.deletedAt)
      ))
      .limit(1);

    if (propWithoutContracts.length > 0) {
      actions.push({
        category: "contract",
        title: `Update Proposal Status for "${propWithoutContracts[0].title}"`,
        description: "Mark if this proposal was won or lost, or track it as awarded.",
        actionType: "update",
        priority: "medium",
        reason: "You have proposals that may be ready to transition to contracts.",
        estimatedMinutes: 5,
      });
    }

    // Rule 4: Contracts without invoices - suggest creating invoice
    const contractWithoutInvoices = await db
      .select({ id: contracts.id, title: contracts.title })
      .from(contracts)
      .where(and(
        eq(contracts.workspaceId, ctx.workspaceId),
        isNull(contracts.deletedAt)
      ))
      .limit(1);

    if (contractWithoutInvoices.length > 0) {
      actions.push({
        category: "finance",
        title: `Create Invoice for "${contractWithoutInvoices[0].title}"`,
        description: "Track your billing for this active contract.",
        actionType: "create",
        priority: "medium",
        reason: "You have active contracts. Set up invoicing to track payments.",
        estimatedMinutes: 15,
      });
    }

    // Rule 5: Overdue tasks - suggest reviewing
    const overdueTasks = await db
      .select({ count: tasks.id })
      .from(tasks)
      .where(and(
        eq(tasks.workspaceId, ctx.workspaceId),
        lt(tasks.dueDate, new Date()),
        isNull(tasks.deletedAt)
      ));

    if (overdueTasks.length > 0 && overdueTasks[0].count > 0) {
      actions.push({
        category: "compliance",
        title: `Review ${overdueTasks[0].count} Overdue Task(s)`,
        description: "You have tasks past their due date. Review and update their status.",
        actionType: "review",
        priority: "critical",
        reason: "Overdue tasks need attention to maintain compliance.",
        estimatedMinutes: 10,
      });
    }

    // Rule 6: No team members - suggest adding team
    if (teamCount.length === 0 || teamCount[0].count <= 1) {
      actions.push({
        category: "team",
        title: "Invite Team Members",
        description: "Add colleagues to your workspace for better collaboration.",
        actionType: "create",
        priority: "low",
        reason: "Working alone? Invite team members to collaborate.",
        estimatedMinutes: 5,
      });
    }

    // Rule 7: No contacts - suggest adding key contacts
    if (contactCount.length === 0 || contactCount[0].count === 0) {
      actions.push({
        category: "compliance",
        title: "Add Key Contacts",
        description: "Add government agency contacts and key personnel to your workspace.",
        actionType: "create",
        priority: "medium",
        reason: "Maintain a contact list for better opportunity tracking.",
        estimatedMinutes: 10,
      });
    }

    // Rule 8: No files uploaded - suggest uploading documents
    if (fileCount.length === 0 || fileCount[0].count === 0) {
      actions.push({
        category: "compliance",
        title: "Upload Key Documents",
        description: "Store capability statements, past performance, and certifications.",
        actionType: "create",
        priority: "medium",
        reason: "Organize your documents for quick reference during proposals.",
        estimatedMinutes: 20,
      });
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return actions;
  }

  /**
   * Get the single most important next action
   */
  async getNextBestAction(ctx: GuidanceContext): Promise<NextAction | null> {
    const actions = await this.analyzeWorkspace(ctx);
    return actions.length > 0 ? actions[0] : null;
  }
}

export const guidanceEngine = new GuidanceEngine();

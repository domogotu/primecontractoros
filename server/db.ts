import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, opportunities, proposals, contracts } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

// Opportunities
export async function createOpportunity(data: {
  workspaceId: number;
  title: string;
  agency?: string;
  solicitation?: string;
  naics?: string;
  dueDate?: Date;
  type?: string;
  sourceLink?: string;
  summary?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(opportunities).values({
    workspaceId: data.workspaceId,
    title: data.title,
    agency: data.agency,
    solicitation: data.solicitation,
    naics: data.naics,
    dueDate: data.dueDate,
    type: data.type,
    sourceLink: data.sourceLink,
    summary: data.summary,
    status: "new",
  });

  return result;
}

export async function getOpportunity(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(opportunities)
    .where(and(eq(opportunities.id, id), eq(opportunities.workspaceId, workspaceId)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function listOpportunities(workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.workspaceId, workspaceId));
}

export async function updateOpportunity(
  id: number,
  workspaceId: number,
  data: Partial<{
    title: string;
    agency: string;
    solicitation: string;
    naics: string;
    dueDate: Date;
    type: string;
    sourceLink: string;
    summary: string;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(opportunities)
    .set(data)
    .where(and(eq(opportunities.id, id), eq(opportunities.workspaceId, workspaceId)));
}

export async function deleteOpportunity(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(opportunities)
    .where(and(eq(opportunities.id, id), eq(opportunities.workspaceId, workspaceId)));
}

export async function updateOpportunityStatus(
  id: number,
  workspaceId: number,
  status: "new" | "in_review" | "pursue" | "hold" | "no_pursue" | "moved_to_proposal" | "archived"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(opportunities)
    .set({ status })
    .where(and(eq(opportunities.id, id), eq(opportunities.workspaceId, workspaceId)));
}

// Proposals
export async function createProposal(data: {
  workspaceId: number;
  opportunityId?: number;
  title: string;
  framework?: string;
  dueDate?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(proposals).values({
    workspaceId: data.workspaceId,
    opportunityId: data.opportunityId,
    title: data.title,
    framework: data.framework,
    dueDate: data.dueDate,
    status: "draft",
  });

  return result;
}

export async function getProposal(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(proposals)
    .where(and(eq(proposals.id, id), eq(proposals.workspaceId, workspaceId)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function listProposals(workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(proposals)
    .where(eq(proposals.workspaceId, workspaceId));
}

export async function updateProposal(
  id: number,
  workspaceId: number,
  data: Partial<{
    opportunityId: number;
    title: string;
    framework: string;
    dueDate: Date;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(proposals)
    .set(data)
    .where(and(eq(proposals.id, id), eq(proposals.workspaceId, workspaceId)));
}

export async function deleteProposal(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(proposals)
    .where(and(eq(proposals.id, id), eq(proposals.workspaceId, workspaceId)));
}

export async function updateProposalStatus(
  id: number,
  workspaceId: number,
  status: "draft" | "in_progress" | "under_review" | "submitted" | "won" | "lost" | "withdrawn" | "archived"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(proposals)
    .set({ status })
    .where(and(eq(proposals.id, id), eq(proposals.workspaceId, workspaceId)));
}

// Contracts
export async function createContract(data: {
  workspaceId: number;
  proposalId?: number;
  title: string;
  contractNumber?: string;
  agency?: string;
  value?: number;
  startDate?: Date;
  endDate?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(contracts).values({
    workspaceId: data.workspaceId,
    proposalId: data.proposalId,
    title: data.title,
    contractNumber: data.contractNumber,
    agency: data.agency,
    value: data.value ? data.value.toString() : undefined,
    startDate: data.startDate,
    endDate: data.endDate,
    status: "setup",
    health: "healthy",
  });

  return result;
}

export async function getContract(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(contracts)
    .where(and(eq(contracts.id, id), eq(contracts.workspaceId, workspaceId)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function listContracts(workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(contracts)
    .where(eq(contracts.workspaceId, workspaceId));
}

export async function updateContract(
  id: number,
  workspaceId: number,
  data: Partial<{
    proposalId: number;
    title: string;
    contractNumber: string;
    agency: string;
    value: number;
    startDate: Date;
    endDate: Date;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: Record<string, unknown> = { ...data };
  if (data.value !== undefined) {
    updateData.value = data.value.toString();
  }

  await db
    .update(contracts)
    .set(updateData)
    .where(and(eq(contracts.id, id), eq(contracts.workspaceId, workspaceId)));
}

export async function deleteContract(id: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(contracts)
    .where(and(eq(contracts.id, id), eq(contracts.workspaceId, workspaceId)));
}

export async function updateContractStatus(
  id: number,
  workspaceId: number,
  status: "setup" | "active" | "modification" | "closeout" | "closed" | "suspended"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(contracts)
    .set({ status })
    .where(and(eq(contracts.id, id), eq(contracts.workspaceId, workspaceId)));
}

export async function updateContractHealth(
  id: number,
  workspaceId: number,
  health: "healthy" | "at_risk" | "warning"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(contracts)
    .set({ health })
    .where(and(eq(contracts.id, id), eq(contracts.workspaceId, workspaceId)));
}

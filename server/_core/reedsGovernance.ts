import crypto from "node:crypto";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

export type ReedsModelGovernanceContext = {
  workspaceId?: number;
  ownerId?: number;
  projectId?: string;
  actorId?: string;
  purpose?: string;
  sensitivity?: "public" | "internal" | "confidential" | "restricted" | "critical";
  requestedCapability?: string;
};

export type ReedsModelRun = { eventId: string; runId: string; correlationId: string; startedAt: Date };
const id = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;
const hash = (value: unknown) => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");

/** Central lifecycle hook beneath every shared LLM invocation. */
export async function beginReedsModelRun(params: unknown, context: ReedsModelGovernanceContext = {}): Promise<ReedsModelRun> {
  const eventId = id("evt");
  const runId = id("run");
  const correlationId = id("corr");
  const now = new Date();
  const contentHash = hash(params);
  const sensitivity = context.sensitivity || "internal";
  const db = await getDb();

  if (!db) {
    if (process.env.REEDS_GOVERNANCE_REQUIRED === "true") throw new Error("Reeds governance database is required but unavailable");
    return { eventId, runId, correlationId, startedAt: now };
  }

  try {
    await db.execute(sql`
      INSERT INTO reeds_events (
        event_id, correlation_id, causation_id, event_type, schema_version,
        occurred_at, received_at, owner_id, workspace_id, project_id,
        actor_type, actor_id, authenticated, source_system, source_channel,
        source_adapter, sensitivity, contains_pii, contains_secret,
        retention_class, idempotency_key, content_hash, signature_verified,
        requested_capability, payload
      ) VALUES (
        ${eventId}, ${correlationId}, NULL, 'model.invocation.requested', '1.0',
        ${now}, ${now}, ${context.ownerId ?? null}, ${context.workspaceId ?? null}, ${context.projectId ?? null},
        'system_llm_gateway', ${context.actorId ?? null}, ${Boolean(context.actorId)},
        'primecontractoros', 'internal', 'llm_gateway', ${sensitivity}, false, false,
        'governance', ${eventId}, ${contentHash}, false,
        ${context.requestedCapability || 'model.invoke'},
        ${JSON.stringify({ purpose: context.purpose || 'llm invocation' })}
      )
    `);

    await db.execute(sql`
      INSERT INTO reeds_runs (
        run_id, event_id, correlation_id, owner_id, workspace_id, project_id,
        actor_id, purpose, state, current_stage, risk_level
      ) VALUES (
        ${runId}, ${eventId}, ${correlationId}, ${context.ownerId ?? null}, ${context.workspaceId ?? null}, ${context.projectId ?? null},
        ${context.actorId ?? null}, ${context.purpose || 'LLM invocation'}, 'executing', 5,
        ${sensitivity === 'critical' || sensitivity === 'restricted' ? 'high' : 'medium'}
      )
    `);
  } catch (error) {
    if (process.env.REEDS_GOVERNANCE_REQUIRED === "true") throw error;
  }

  return { eventId, runId, correlationId, startedAt: now };
}

export async function finishReedsModelRun(run: ReedsModelRun, result: unknown): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    const now = new Date();
    const resultHash = hash(result);
    // The model response is not success-complete until independent verification passes.
    await db.execute(sql`
      UPDATE reeds_runs
      SET state = 'verifying', current_stage = 11, updated_at = ${now},
          status_reason = ${`Model response received; result hash ${resultHash}; awaiting verification`}
      WHERE run_id = ${run.runId}
    `);
    await db.execute(sql`
      INSERT INTO reeds_audit_events (
        audit_id, correlation_id, run_id, event_id, actor_id, actor_type,
        event_type, risk_level, reason, result, final_state
      ) VALUES (
        ${id('audit')}, ${run.correlationId}, ${run.runId}, ${run.eventId}, NULL,
        'system_llm_gateway', 'model.invocation.completed', 'medium',
        'LLM response returned to governed application layer',
        ${JSON.stringify({ resultHash })}, 'verifying'
      )
    `);
  } catch (error) {
    if (process.env.REEDS_GOVERNANCE_REQUIRED === "true") throw error;
  }
}

export async function failReedsModelRun(run: ReedsModelRun, error: unknown): Promise<void> {
  const db = await getDb();
  if (!db) return;
  try {
    const now = new Date();
    const message = error instanceof Error ? error.message : String(error);
    await db.execute(sql`
      UPDATE reeds_runs
      SET state = 'failed', current_stage = 11, completed_at = ${now}, updated_at = ${now}, status_reason = ${message.slice(0, 2000)}
      WHERE run_id = ${run.runId}
    `);
    await db.execute(sql`
      INSERT INTO reeds_audit_events (
        audit_id, correlation_id, run_id, event_id, actor_id, actor_type,
        event_type, risk_level, reason, final_state
      ) VALUES (
        ${id('audit')}, ${run.correlationId}, ${run.runId}, ${run.eventId}, NULL,
        'system_llm_gateway', 'model.invocation.failed', 'high', ${message.slice(0, 2000)}, 'failed'
      )
    `);
  } catch (auditError) {
    if (process.env.REEDS_GOVERNANCE_REQUIRED === "true") throw auditError;
  }
}

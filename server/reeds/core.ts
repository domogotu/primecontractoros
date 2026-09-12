import { createHash, randomUUID } from "node:crypto";

export const REEDS_SCHEMA_VERSION = "1.0" as const;

export type RiskLevel = "low" | "medium" | "high" | "critical";
export type RunState =
  | "RECEIVED" | "IDENTIFIED" | "CONTEXTUALIZED" | "PLANNED" | "ROUTED"
  | "SPECIALIST_WORK" | "SUPERVISED" | "POLICY_CHECK" | "AWAITING_APPROVAL"
  | "APPROVED" | "EXECUTING" | "VERIFYING" | "VERIFIED" | "MEMORIZED"
  | "LEARNING" | "COMPLETE" | "BLOCKED" | "DENIED" | "EXPIRED" | "FAILED"
  | "RECOVERY" | "CANCELLED" | "SUPERSEDED";

export interface ReedsEventEnvelope {
  event_id: string; correlation_id: string; causation_id: string | null;
  event_type: string; schema_version: typeof REEDS_SCHEMA_VERSION;
  occurred_at: string; received_at: string;
  source: { system: string; channel: string; adapter: string };
  actor: { actor_type: string; actor_id: string | null; authenticated: boolean };
  owner_scope: { owner_id: string; organization_id: string; project_id: string | null };
  classification: { sensitivity: string; contains_pii: boolean; contains_secret: boolean; retention_class: string };
  integrity: { idempotency_key: string; content_hash: string; signature_verified: boolean };
  requested_capability: string; payload: unknown; attachments: Array<{ id: string; name?: string; sha256?: string }>;
}

export interface ExecutionContext {
  ownerId: string; organizationId: string; projectId: string | null;
  actorId: string | null; actorType: string; authenticated: boolean;
  roles: string[]; permissions: string[]; dataClassifications: string[];
  policySet: string; budgetRef: string | null; correlationId: string;
}

export interface ReedsAction {
  actionId: string; runId: string; toolId: string; operation: string;
  actionClass: "read" | "internal_write" | "external_message" | "spending" | "credential_change" | "production_change" | "destructive" | "physical" | "emergency";
  actorId: string | null; ownerId: string; organizationId: string; projectId: string | null;
  destination: string | null; parameters: Record<string, unknown>;
  credentialRef: string | null; expectedCost: number; reversible: boolean;
  requestedAt: string; correlationId: string; causationId: string | null;
}

const transitions: Record<RunState, readonly RunState[]> = {
  RECEIVED:["IDENTIFIED","BLOCKED"], IDENTIFIED:["CONTEXTUALIZED","BLOCKED"], CONTEXTUALIZED:["PLANNED","BLOCKED"],
  PLANNED:["ROUTED","BLOCKED"], ROUTED:["SPECIALIST_WORK","BLOCKED"], SPECIALIST_WORK:["SUPERVISED","RECOVERY","BLOCKED"],
  SUPERVISED:["POLICY_CHECK","RECOVERY","BLOCKED"], POLICY_CHECK:["APPROVED","AWAITING_APPROVAL","DENIED","BLOCKED"],
  AWAITING_APPROVAL:["APPROVED","DENIED","EXPIRED","BLOCKED"], APPROVED:["EXECUTING","CANCELLED"],
  EXECUTING:["VERIFYING","FAILED","RECOVERY"], VERIFYING:["VERIFIED","FAILED","RECOVERY"], VERIFIED:["MEMORIZED","RECOVERY"],
  MEMORIZED:["LEARNING","COMPLETE"], LEARNING:["COMPLETE","RECOVERY"], RECOVERY:["POLICY_CHECK","FAILED","CANCELLED"],
  COMPLETE:[], BLOCKED:[], DENIED:[], EXPIRED:[], FAILED:[], CANCELLED:[], SUPERSEDED:[],
};

export function canTransition(from: RunState, to: RunState): boolean { return transitions[from].includes(to); }

export function assertTransition(from: RunState, to: RunState): void {
  if (!canTransition(from, to)) throw new Error(`Invalid Reeds run transition: ${from} -> ${to}`);
}

export function sha256(value: unknown): string {
  const serialized = typeof value === "string" ? value : JSON.stringify(value);
  return createHash("sha256").update(serialized ?? "null").digest("hex");
}

export function createEventEnvelope(input: {
  eventType: string; source: ReedsEventEnvelope["source"]; actor: ReedsEventEnvelope["actor"];
  ownerScope: ReedsEventEnvelope["owner_scope"]; classification: ReedsEventEnvelope["classification"];
  idempotencyKey: string; requestedCapability: string; payload: unknown;
  causationId?: string | null; correlationId?: string; attachments?: ReedsEventEnvelope["attachments"];
  signatureVerified?: boolean;
}): ReedsEventEnvelope {
  const now = new Date().toISOString();
  const correlationId = input.correlationId ?? randomUUID();
  return {
    event_id: `evt_${randomUUID()}`, correlation_id: correlationId, causation_id: input.causationId ?? null,
    event_type: input.eventType, schema_version: REEDS_SCHEMA_VERSION, occurred_at: now, received_at: now,
    source: input.source, actor: input.actor, owner_scope: input.ownerScope, classification: input.classification,
    integrity: { idempotency_key: input.idempotencyKey, content_hash: sha256(input.payload), signature_verified: input.signatureVerified ?? false },
    requested_capability: input.requestedCapability, payload: input.payload, attachments: input.attachments ?? [],
  };
}

export function sanitizeForModel(value: unknown): unknown {
  const secretPattern = /(password|passwd|secret|api[_-]?key|access[_-]?token|refresh[_-]?token|private[_-]?key|client[_-]?secret|authorization)/i;
  const walk = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) out[k] = secretPattern.test(k) ? "[REDACTED]" : walk(val);
      return out;
    }
    return v;
  };
  return walk(value);
}

# REEDS TECHNOLOGY — MASTER WIRING SPECIFICATION v1.0

Status: FOUNDATION BATCH 1 IMPLEMENTED IN REPOSITORY CONTRACTS
Authority: Dominique / owner-governed architecture

## Purpose

This specification converts the Reeds ecosystem picture into an implementation contract. Every production request must follow:

INPUT → EVENT → IDENTITY → SCOPED CONTEXT → MEMORY → MISSION → ROUTER → SPECIALIST → SUPERVISOR → POLICY → APPROVAL → TOOL → EXECUTION → VERIFICATION → AUDIT → MEMORY → LEARNING.

The data plane may not bypass the control plane, and the control plane may not silently erase the evidence plane.

## Planes

### Data plane
Events, documents, messages, API results, model requests/responses, tool results and evidence.

### Control plane
Identity, authorization, policies, budgets, approvals, tool capability, credentials-by-reference, retries, rate limits, emergency controls and release state.

### Evidence plane
Audit, execution traces, approvals, receipts, hashes, versioned artifacts, backups, restore tests, verification and correction history.

## Canonical lifecycle

1. Universal Event Intake — validate, normalize, assign IDs, classify, deduplicate.
2. Identity & Context — resolve actor, owner, organization/workspace, project, role, permissions, consent and policy set.
3. Scoped Memory Retrieval — retrieve only authorized, current, provenance-backed context.
4. Goal & Mission Planner — define objective, success criteria, tasks, dependencies, budget, risk and stop conditions.
5. Model & Agent Router — prefer deterministic code; otherwise select provider/model by data policy, modality, quality, latency, health and budget.
6. Specialist Work — limited agent, limited context, limited tools, structured output.
7. Executive Supervisor — inspect conflicts, evidence gaps, scope expansion and policy-sensitive output.
8. Deterministic Policy Gate — allow, deny or require approval using fixed rules.
9. Human Approval — exact action hash, parameters, destination, cost, rollback, verification and expiration.
10. Scoped Tool Execution — registered capability only; credential reference only; timeout and idempotency enforced.
11. Independent Verification — prove actual state, not merely HTTP success.
12. Governed Memory & Audit — only verified facts become durable fact-memory; all important actions are auditable.
13. Outcome Learning — propose changes; never directly modify production.
14. Release Governance — sandbox, tests, security review, independent review, owner approval, canary, verification and rollback.

## Run state machine

RECEIVED → IDENTIFIED → CONTEXTUALIZED → PLANNED → ROUTED → SPECIALIST_WORK → SUPERVISED → POLICY_CHECK → (AWAITING_APPROVAL → APPROVED | DENIED | EXPIRED) → EXECUTING → VERIFYING → VERIFIED → MEMORIZED → LEARNING → COMPLETE.

Failure branches: BLOCKED, FAILED, RECOVERY, CANCELLED, SUPERSEDED.

No terminal state may transition back to execution.

## Non-negotiable boundaries

- Models never receive root authority.
- Models never receive unrestricted tools.
- Secrets never enter model context, memory, logs, exports or source control.
- Agents receive credential references, not credential values.
- External messaging, spending, credential changes, production changes, destructive actions and physical actions are approval/safety controlled.
- Physical commands require a separate device gateway and local safety interlock.
- Learning outputs are versioned change proposals, not autonomous production changes.
- Audit history is append-oriented and corrections are preserved rather than silently rewriting history.

## Current repository alignment

The repository currently uses Drizzle with MySQL2. The foundation migration therefore uses MySQL 8-compatible tables rather than pretending the existing deployment is PostgreSQL. PostgreSQL/pgvector remains a future architecture option and is not introduced by this batch.

Existing workspace isolation remains the application-level boundary for current records. The new Reeds contracts add owner/workspace/project/correlation fields so the lifecycle can be wired without discarding existing application data.

## Batch 1 additions

- Canonical event envelope contract.
- Universal correlation and idempotency contract.
- Explicit lifecycle state machine.
- Deterministic action policy evaluator.
- Structured agent handoff contract.
- Durable event/run/handoff/policy/approval/tool/verification/evidence/audit/idempotency/change-proposal storage migration.
- Secret redaction before model use.

## Next wiring batch

Wire the existing AI engine/router and live mutations to these contracts. Specifically:

1. Create a canonical event/run before every AI operation.
2. Attach correlation_id to every AI run and downstream record.
3. Route AI output through supervisor → deterministic policy before any live mutation.
4. Convert approval actions into durable approval records bound to action hashes.
5. Route every live mutation through registered tool capabilities.
6. Add independent read-back verification.
7. Write audit/evidence records for every decision and action.
8. Add governed memory writes only after verification.
9. Preserve current UI behavior while replacing implicit execution with explicit lifecycle state.

## Verification target

A single request must be traceable from source to final state using one correlation_id, with no execution path that bypasses policy, approval, tool registry, verification or audit.

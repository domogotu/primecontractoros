# Reeds Technology — Wiring Progress

This file is the persistent implementation ledger for the Owner-Governed Intelligence Ecosystem wiring work. Completed items are not to be repeated; subsequent batches must build on them and self-review for newly discovered omissions before being marked complete.

## Batch 1 — Governance foundation
Status: implemented in repository.

- Universal Event Envelope persistence
- correlation_id / causation_id / event_id / idempotency / content hash
- durable Reeds run lifecycle storage
- policy-version and policy-decision storage
- approval request/decision storage with action hash
- tool registry and tool execution storage
- verification and evidence storage
- audit event storage
- change-proposal/release-governance storage
- migration 0023 using the repository's current MySQL/Drizzle dialect

Primary migration: `drizzle/0023_reeds_governance.sql`

## Batch 2 — Central model lifecycle wiring
Status: implemented in repository; live deployment still requires the runtime/database environment.

- Added `server/_core/reedsGovernance.ts`
- Every call through the shared `invokeLLM()` gateway now creates a Reeds event/run/correlation lifecycle record before provider execution.
- Model completion transitions the Reeds run to `verifying` stage 11 rather than falsely marking it complete.
- Model failures transition to `failed` and create an audit record.
- Input is hashed for correlation/integrity without storing the model request body in the governance event payload.
- `InvokeParams` now accepts optional Reeds governance context for callers that have owner/workspace/project identity.
- Existing callers remain compatible while identity-aware context is wired into their call paths in a later batch.

## Important current gap discovered during Batch 2
The shared LLM gateway now provides universal lifecycle correlation, but many legacy AI callers still invoke it without explicit owner/workspace/project context. Therefore those calls are currently attributed to the central system gateway rather than falsely claiming a user identity. This is intentional and must be corrected by wiring request identity/context into the AI engine and request middleware next.

## Next batch
### Batch 3 — Identity/context propagation and policy boundary
Wire authenticated request identity, owner/workspace/project scope, sensitivity classification, capability, budget and approval requirements into the Reeds model gateway and execution path. No consequential tool execution should bypass the deterministic policy boundary.

## Required final lifecycle
`INPUT → EVENT → IDENTITY → MEMORY → MISSION → ROUTER → SPECIALIST → SUPERVISOR → POLICY → HUMAN APPROVAL → TOOL EXECUTION → VERIFICATION → AUDIT/EVIDENCE → GOVERNED MEMORY → LEARNING/RELEASE GOVERNANCE`

## Rules for future batches
1. Inspect existing implementation before changing it.
2. Add the largest safe batch possible.
3. Self-review the batch after implementation and add corrections discovered during review before reporting completion.
4. Never mark a layer complete when only its database tables exist but its live execution path still bypasses it.
5. Never expose or store raw credentials in model context, memory or audit payloads.
6. Verification precedes success/completion.
7. Production self-modification is prohibited; changes require sandbox/testing/review/owner approval/canary/rollback controls.
8. Keep the current application dialect/runtime compatible unless a deliberate infrastructure migration is separately approved.

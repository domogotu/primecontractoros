# Reeds Wiring Progress

## Source of truth
- Reeds owner-governed intelligence ecosystem blueprint.
- Reeds AI Agent Governance and Memory Operating Manual.
- Reeds architecture/pasted markdown implementation plan.
- Current repository: `domogotu/primecontractoros`.

## Completed — Batch 1: Governance foundation contracts
- [x] Canonical Universal Event Envelope contract.
- [x] Universal correlation ID and content hashing.
- [x] Explicit run lifecycle/state machine.
- [x] Deterministic action policy evaluator.
- [x] Action hashing for approval binding.
- [x] Structured agent handoff packet.
- [x] Model-input secret redaction helper.
- [x] Durable MySQL governance migration for events, runs, handoffs, policy versions/decisions, approvals, tool registry/executions, verification, evidence, audit, idempotency and controlled change proposals.
- [x] Unit tests for the foundation contracts.
- [x] Master wiring specification.

## Not yet marked complete
The foundation contracts are present, but the live application is not yet fully routed through them. Do not claim the ecosystem is fully wired until these are completed and verified.

## Next batch — Live AI lifecycle wiring
1. Create canonical event/run records before each AI engine operation.
2. Propagate correlation_id through AI runs and downstream records.
3. Add explicit supervisor/policy boundary before any live mutation.
4. Replace implicit approval behavior with durable action-hash-bound approvals.
5. Register live mutation capabilities in the tool registry.
6. Add independent read-back verification for live mutations.
7. Emit audit/evidence records at every lifecycle boundary.
8. Add governed memory writes after verification.
9. Preserve existing UI behavior while exposing actual run state and blocked/waiting/failed/recovery states.
10. Add tests proving prompt injection, parameter changes, retries and alternate routes cannot bypass policy.

## Later batches
- Digital/business adapter wiring.
- Model router/provider abstraction including Claude as governed optional provider.
- Memory/temporal knowledge implementation.
- Queue/resilience/observability.
- Controlled self-improvement/release governance.
- Physical gateway/Reeds Protocol only after digital foundation is stable.

## Important implementation note
The current repository uses Drizzle/MySQL2. The architecture documents describe PostgreSQL/pgvector as the target governance backbone, but this batch intentionally does not pretend the current repository is PostgreSQL. Any later database migration must be deliberate and verified rather than silently mixing dialects.

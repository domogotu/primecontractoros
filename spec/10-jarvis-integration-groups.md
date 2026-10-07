# JARVIS Integration Groups — Build Map

## Purpose
This document locks the remaining Microsoft-JARVIS-compatible integration boundaries into the Unified AI Ecosystem without activating them.

## Sequence
1. Group 03 — Intent Classification and Task Planning
2. Group 04 — Model Router
3. Group 11 — Tool and Function Gateway
4. Group 14 — Response Validation and Grounding
5. Group 16 — Error Recovery and Model Fallback
6. Group 18 — Background Job Manager
7. Group 23 — System Health Monitoring
8. Group 24 — Audit and Execution Logging
9. Group 25 — Administrative Control
10. Group 26 — Provider Testing

## Required contract
Every group preserves requestId, traceId, sessionId, jobId when applicable, taskId, selected provider/model/tool, permission state, approval state, resource decision, status, timing, and retry/fallback history.

## Group 03
The JARVIS task planner converts the request into normalized tasks, dependencies, capability requirements, complexity/risk, and execution mode. It must never directly execute an external action.

Implemented artifact:
- workflows/03-model-router/03.01-jarvis-intent-task-planner.json

## Group 04
The model router receives normalized tasks and eligible provider/model metadata. Selection must account for capability fit, readiness, permissions, resource state, latency/cost policy, and local-versus-remote policy. It returns candidates/selection only; execution remains downstream.

Existing integrated artifact:
- workflows/02-master-orchestrator/02.02-jarvis-model-provider-selector.json

## Group 11
The common gateway remains the only execution boundary. JARVIS execution envelopes may request dispatch, but the gateway must enforce permission, approval, resource, tool registration, normalized results, retry, fallback, and audit hooks.

Existing execution boundary:
- workflows/02-master-orchestrator/02.03-jarvis-task-execution-coordinator.json

## Group 14
Result provenance and execution claims must be validated before final response authorization. Missing provider/model/tool provenance on an executed result is invalid. Fabricated execution claims are rejected.

Handoff:
- workflows/02-master-orchestrator/02.04-jarvis-result-collector.json
- workflows/02-master-orchestrator/02.05-jarvis-response-synthesis-handoff.json

## Group 16
Failures are classified into retryable, fallback-eligible, or safe-stop states. Recovery cannot bypass permission, approval, scheduling, or gateway controls. Context reduction is allowed only when policy permits.

## Group 18
Long-running JARVIS jobs require job IDs, progress, cancellation, duplicate prevention, dependency state, and resumable lifecycle state.

## Group 23
Health monitoring covers the JARVIS integration, provider readiness, repeated execution failures, queue pressure, scheduler state, and degraded/disabled conditions.

## Group 24
Audit records cover planning, selection, execution dispatch, results, validation, recovery, approvals, and final outcome. Secrets and unrestricted raw prompts/responses are not persisted by default.

## Group 25
Administrative control exposes enable/disable, routing priority, provider eligibility, maintenance/read-only mode, and safe shutdown. Configuration changes require the existing authorization path.

## Group 26
Provider testing performs safe read-only adapter/readiness checks. It must never create mock accounts, fake results, or perform uncontrolled external actions.

## Cross-cutting JARVIS runtime connections

### Resource-aware scheduler/watchdog
Every executable task must carry a resource decision. The scheduler evaluates CPU, memory, disk, network, power, workload priority, estimated demand, and concurrent JARVIS work. Under pressure it may queue, downgrade, route remotely when permitted, or defer. The watchdog must stop or downgrade unsafe work rather than bypassing policy.

### Temporal memory
Task lifecycle transitions are emitted as structured events: created, planned, selected, started, completed, partial, failed, retry, fallback, approval requested/received, cancelled, and final outcome. Store state references and permitted summaries rather than secrets or unrestricted raw prompts/responses.

### Voice
Voice is an input adapter into the existing router. It does not invoke the JARVIS orchestration path directly. The router decides whether the request enters the JARVIS-compatible planner.

### UI status/control
Expose enabled state, current task, stage, provider/model, resource state, queue, approval state, fallback state, readiness, errors, and warnings. Administrative controls remain behind the existing authorization path.

### Runtime execution path
The final connected path is:
voice/UI/request → existing router → task planner → model/provider selection → capability/tool gateways → resource scheduler → execution → result collection → validation/grounding → temporal memory and audit → response/UI.

## Activation rule
All artifacts remain inactive until the complete runtime path is connected. Final verification is deferred until all remaining groups are implemented.

## Hardware rule
Do not install the full Microsoft JARVIS local expert-model stack on the current laptop. The production integration uses the JARVIS orchestration pattern, not the research repository as an active local model server.

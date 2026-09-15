# Unified AI Ecosystem — Part 4: Memory, AI Security, Observability, and Evaluation

## Required memory systems

Include all:

1. Mem0
2. Zep
3. Letta
4. LangGraph Memory
5. Redis
6. PostgreSQL
7. Neo4j
8. Chroma

Do not remove or merge systems because capabilities overlap. Create one unified Memory Router. Do not write every memory item to every system by default; support selection, fallback, explicit mirroring, and specialized routing.

## Exact memory workflow names

- 09.01 — Mem0 Adapter
- 09.02 — Zep Adapter
- 09.03 — Letta Adapter
- 09.04 — LangGraph Memory Adapter
- 09.05 — Redis Memory Adapter
- 09.06 — PostgreSQL Memory Adapter
- 09.07 — Neo4j Memory Adapter
- 09.08 — Chroma Memory Adapter
- 09.09 — Memory Provider Registry
- 09.10 — Memory Capability Resolver
- 09.11 — Memory Provider Selection
- 09.12 — Memory Read Controller
- 09.13 — Memory Write Controller
- 09.14 — Memory Update Controller
- 09.15 — Memory Delete Controller
- 09.16 — Memory Search Controller
- 09.17 — Memory Summarization Controller
- 09.18 — Memory Expiration Controller
- 09.19 — Memory Consent Controller
- 09.20 — Memory Permission Controller
- 09.21 — Memory Sensitivity Classifier
- 09.22 — Memory Deduplication
- 09.23 — Memory Conflict Resolver
- 09.24 — Memory Provider Fallback
- 09.25 — Memory Mirror Controller
- 09.26 — Memory Migration Controller
- 09.27 — Memory Health Check
- 09.28 — Memory Provider Test
- 09.29 — Memory Usage Logger

Support current-message, short-term, long-term user, episodic, semantic, working, task, agent state, workflow state, checkpoints, tool-result, retrieval-result, graph, vector, administrative, configuration, preference, evaluation, and recovery memory categories. Each category has configurable retention, permission, sensitivity, and deletion policies.

## Memory item schema

```json
{
  "memoryId":"",
  "requestId":"",
  "traceId":"",
  "sessionId":"",
  "userId":"",
  "tenantId":"",
  "agentId":"",
  "memoryType":"",
  "content":"",
  "structuredContent":{},
  "summary":"",
  "source":"",
  "sourceReference":"",
  "createdAt":"",
  "updatedAt":"",
  "expiresAt":"",
  "retentionPolicy":"",
  "sensitivityClassification":"",
  "permissions":[],
  "consentStatus":"",
  "confidence":0,
  "version":1,
  "contentHash":"",
  "deleted":false,
  "metadata":{}
}
```

Do not store secrets unless explicitly authorized and protected. Prefer references/redacted summaries over full sensitive tool outputs.

Memory requests must support read/write/update/delete/search/summarize/expire/export with user/session/tenant/agent/provider/type/filter/limit/consent/permission context. Responses normalize status/items/count/summary/latency/warnings/errors.

Route memory using type, provider preference, user/session/tenant/agent identity, sensitivity, retention, consent, search capability, graph/vector needs, latency, durability, checkpoints, health/availability, residency, admin rules, and fallback order. Defaults may use Redis for low-latency temporary state, PostgreSQL for durable structured state, Neo4j for relationships, Chroma for vector memory, LangGraph Memory for graph checkpoints, and Mem0/Zep/Letta for configured user/agent memory services.

Memory must be isolated by user/session/tenant/workspace/agent/source/sensitivity/permission. Do not expose another user's memory without authorization.

Before memory writes: confirm enabled, determine whether storage is appropriate, classify type, check consent/sensitivity, remove unnecessary secrets, dedupe, select provider, apply expiration/retention, write, verify, log. Do not automatically save every user message permanently.

Support exact/session/user semantic/keyword/metadata/time/graph/state/checkpoint/recent/relevance/sensitivity/permission retrieval. Return minimum necessary memory.

Updates must support versioning, source/confidence comparison, contradiction detection, user/admin correction priority, merge/superseded states, audit history. Never silently overwrite conflicting long-term memory.

Deletion/expiration must support by memory/session/user/tenant/type/expiry, soft/permanent deletion when authorized, export-before-delete when requested, audit, and propagation to mirrors. Do not claim deletion without provider confirmation.

Mirroring/migration disabled by default; validate authorization, consent, source/destination, classification, retention, ownership, field compatibility, encryption, duplicate behavior, cost, and approval. Never copy sensitive memory into weaker controls.

For the starter, use simple n8n-compatible session memory; advanced systems remain registered and disabled until configured.

## Required AI security systems

Include all:

1. NVIDIA NeMo Guardrails
2. Guardrails AI
3. Microsoft Presidio
4. Lakera Guard
5. Prompt Security
6. Protect AI
7. Azure AI Content Safety
8. AWS Bedrock Guardrails

Create one unified AI Security Pipeline with provider adapters and common policy/result contracts.

Exact workflows:

- 13.01 — NVIDIA NeMo Guardrails Adapter
- 13.02 — Guardrails AI Adapter
- 13.03 — Microsoft Presidio Adapter
- 13.04 — Lakera Guard Adapter
- 13.05 — Prompt Security Adapter
- 13.06 — Protect AI Adapter
- 13.07 — Azure AI Content Safety Adapter
- 13.08 — AWS Bedrock Guardrails Adapter
- 13.09 — AI Security Provider Registry
- 13.10 — Security Policy Resolver
- 13.11 — Input Security Screening
- 13.12 — Prompt Injection Detection
- 13.13 — Jailbreak Detection
- 13.14 — Secret Detection
- 13.15 — PII Detection
- 13.16 — PII Redaction
- 13.17 — Sensitive Data Classifier
- 13.18 — File Risk Screening
- 13.19 — URL Risk Screening
- 13.20 — Tool Call Security Check
- 13.21 — Database Query Security Check
- 13.22 — Filesystem Security Check
- 13.23 — Repository Action Security Check
- 13.24 — External Action Security Check
- 13.25 — Output Security Screening
- 13.26 — Structured Output Security Validation
- 13.27 — Security Provider Fallback
- 13.28 — Security Parallel Evaluation
- 13.29 — Security Decision Aggregator
- 13.30 — Security Incident Logger
- 13.31 — AI Security Health Check
- 13.32 — AI Security Provider Test

### Three required security stages

**Stage 1 — Before orchestration:** authentication, authorization, input validation, prompt injection, jailbreak, secrets, PII, sensitive content, malicious links/attachments, data classification, allowed capabilities.

**Stage 2 — Before tool/external action:** MCP/database/filesystem/repository/messaging/publishing/automation/paid API/external writes/deletions; validate tool authorization, operation, read/write, approval, inputs, data exposure, secret leakage, query/path/destination safety, cost.

**Stage 3 — Before final response:** unsafe output, PII/secret leakage, unsupported claims, fabricated tool use/citations, policy violations, malformed structured output, unauthorized source disclosure.

Standard security request includes request/trace/session/user/tenant, stage, content type, content/structured content, provider/policy/action/tool/operation/destination, permissions, approval, classification, metadata.

Standard security response includes provider/stage/status (`allow|allow_with_redaction|allow_with_warning|block|approval_required|configuration_required`), risk, detections, redactions, violations, required actions, safe content, latency, warnings/errors. Blocked requests return structured results rather than disappearing.

Detect prompt/indirect prompt injection, jailbreaks, system-prompt extraction, secrets/credentials/API keys, PII, sensitive data, exfiltration, malicious tool calls, unauthorized writes, unsafe URLs/files, path traversal, destructive SQL, command injection, repository risk, unauthorized messaging, unsafe outputs, unsupported certainty, fabricated citations/tool use/model identity.

Presidio specifically supports PII analysis/redaction, entity/language/confidence configuration, allow/deny lists, replacement strategy, hosted/self-hosted modes, health checks, and safe processing logs.

When multiple security providers are enabled, support sequential, parallel, primary/fallback, highest-risk-wins, policy-weighted, and admin-defined aggregation. Critical block from an authoritative provider blocks; approval pauses; redaction happens before downstream use when allowed; failed security evaluation is not the same as safe.

All tools/actions must pass user/agent permissions, allow/deny lists, operation classification, destination restrictions, data classification, cost/approval/rate/idempotency/audit rules. Agent frameworks may not bypass central security.

Database actions default read-only; validate query type, block destructive statements, row/time/schema/table/column limits, prevent multi-statement injection and unauthorized export, require approval for writes, use transactions when appropriate.

Filesystem actions restrict base directories, normalize paths, prevent traversal, protect secret files, restrict extensions/sizes, default read-only, require approval for writes/deletes, audit.

Repository actions restrict repos/branches, default read-only, require approval for commits/pushes/issue/PR changes, screen secrets, prevent credential commits, record action IDs.

Security-provider failures must be recorded and may fall back; missing evaluation is not approval. High-risk external actions stop if security cannot evaluate.

## Required observability/evaluation systems

Include all:

1. LangSmith
2. Langfuse
3. Arize Phoenix
4. Weights & Biases Weave
5. TruLens
6. Ragas
7. Promptfoo
8. Helicone

Create a unified Observability and Evaluation Gateway. Export telemetry only to configured/enabled/permitted providers.

Exact workflows:

- 15.01 — LangSmith Adapter
- 15.02 — Langfuse Adapter
- 15.03 — Arize Phoenix Adapter
- 15.04 — Weights and Biases Weave Adapter
- 15.05 — TruLens Adapter
- 15.06 — Ragas Adapter
- 15.07 — Promptfoo Adapter
- 15.08 — Helicone Adapter
- 15.09 — Observability Provider Registry
- 15.10 — Trace Event Normalizer
- 15.11 — Trace Export Controller
- 15.12 — Prompt Version Logger
- 15.13 — Model Usage Logger
- 15.14 — Tool Usage Logger
- 15.15 — Retrieval Usage Logger
- 15.16 — Memory Usage Logger
- 15.17 — Security Event Logger
- 15.18 — Cost Metadata Logger
- 15.19 — Latency Metrics Logger
- 15.20 — Error Metrics Logger
- 15.21 — User Feedback Logger
- 15.22 — Evaluation Request Router
- 15.23 — Answer Relevance Evaluation
- 15.24 — Faithfulness Evaluation
- 15.25 — Groundedness Evaluation
- 15.26 — Retrieval Quality Evaluation
- 15.27 — Citation Accuracy Evaluation
- 15.28 — Tool Call Accuracy Evaluation
- 15.29 — Structured Output Evaluation
- 15.30 — Hallucination Risk Evaluation
- 15.31 — Regression Test Controller
- 15.32 — Prompt Test Controller
- 15.33 — Provider Comparison Report
- 15.34 — Observability Health Check
- 15.35 — Observability Provider Test

Trace events must capture correlation IDs, workflow/node/provider/model/framework/agent/RAG/embedding/vector/memory/tool/operation/status/timing/usage/cost/security/evaluation/error metadata, while excluding raw secrets and unnecessary sensitive content.

Record total/model/retrieval/tool/memory/security latency, providers/models/frameworks/agents, prompt+agent versions, tools, documents/sources, memory, usage/cost, errors/retries/fallbacks, security/evaluation, feedback, final status.

Before telemetry export: check configuration and sharing policy, remove secrets, redact PII as needed, minimize content, support metadata-only logging, respect retention/user/tenant restrictions, record export status. Do not send full conversations to every observability provider by default.

Evaluations include answer relevance, factual consistency, faithfulness, groundedness, retrieval precision/recall/context relevance, citation correctness/coverage, tool selection/output use, structured output validity, security compliance, latency/cost/retry/fallback counts, user rating, task completion, handoff quality, consensus quality, hallucination risk.

Modes: on-demand, sampled, dataset, regression, provider comparison, prompt comparison, agent comparison, RAG comparison. Expensive evaluation modes are not automatic in normal chat unless configured.

Track prompt ID/name/version/agent/model/framework assignment, create/modify time, active state, change summary, test/evaluation result, rollback reference. Never overwrite a production prompt without version history.

User feedback supports positive/negative/numeric rating, corrections/comments, flagged answers, citation/tool/retrieval/safety issues, tied to requestId/traceId. Do not permanently alter routing from a single feedback item.

For the starter: use session memory, central security, basic input/output validation, local n8n execution logging, and only configured observability providers. Do not delay basic answers by running every evaluation platform.
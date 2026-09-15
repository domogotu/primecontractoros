# Unified AI Ecosystem — Part 5: Automation, Documents, Real-Time Data, Tools, and Background Execution

## Required automation platforms

Include all:

1. n8n
2. Zapier
3. Make
4. Microsoft Power Automate
5. Temporal
6. Apache Airflow
7. Prefect
8. Kestra
9. Pipedream

Use n8n as the primary visual orchestration/integration layer. Create a common Automation Platform Gateway. Do not invoke all automation platforms for every task and do not mark external systems operational before credentials/endpoints are configured and tested.

## Exact automation workflows

- 12.01 — n8n Automation Adapter
- 12.02 — Zapier Adapter
- 12.03 — Make Adapter
- 12.04 — Microsoft Power Automate Adapter
- 12.05 — Temporal Adapter
- 12.06 — Apache Airflow Adapter
- 12.07 — Prefect Adapter
- 12.08 — Kestra Adapter
- 12.09 — Pipedream Adapter
- 12.10 — Automation Platform Registry
- 12.11 — Automation Capability Resolver
- 12.12 — Automation Platform Selection
- 12.13 — Automation Request Normalizer
- 12.14 — Automation Response Normalizer
- 12.15 — Automation Job Starter
- 12.16 — Automation Job Status Poller
- 12.17 — Automation Job Cancellation
- 12.18 — Automation Job Completion Handler
- 12.19 — Automation Webhook Receiver
- 12.20 — Automation Retry Controller
- 12.21 — Automation Idempotency Controller
- 12.22 — Automation Approval Controller
- 12.23 — Automation Error Handler
- 12.24 — Automation Platform Fallback
- 12.25 — Automation Health Check
- 12.26 — Automation Provider Test
- 12.27 — Automation Usage Logger

Each automation provider registry entry tracks enabled/configured state, connection type, credentials/base URL/webhook URL, workflow trigger/job status/cancellation/webhooks/long-running/scheduling/retries/idempotency/human-approval capability flags, external deployment status, timeout/retries/priority/fallback/health/setup requirements.

Standard automation request: request/trace/session/user IDs, platform, workflowId, operation, input, schedule, callback URL, idempotency key, permissions, approval ID, timeout, metadata. Standard response: platform/workflow/job/status (`queued|running|waiting|completed|partial|failed|cancelled|approval_required|configuration_required`), output/progress/timestamps/latency/warnings/errors.

Jobs must track unique job ID, correlation, platform/workflow/operation/input/status/progress/times/output/errors/retry/idempotency/approval/callback/cancellation. Never report long jobs complete before external confirmation.

Support direct, async, callback, polling, sequential, parallel, fallback, manual-approval modes. Avoid expensive parallel execution by default.

Connection expectations:
- n8n: native execution, Execute Sub-workflow, Call n8n Workflow Tool, webhook, Chat Trigger, Schedule Trigger, Error Trigger, Wait/Resume, execution logs.
- Zapier: webhook/Zap invocation and callback where supported.
- Make: webhook/scenario execution with scenario ID.
- Power Automate: HTTP-triggered flows, tenant/environment/flow endpoint/cloud credentials/approvals.
- Temporal: endpoint/namespace/workflow type/task queue/workflow+run IDs/status/cancel/long-running state; external deployment unless cloud configured.
- Airflow: REST API, DAG/run IDs, trigger/read status, cancellation limitations; external deployment.
- Prefect: API/deployment/flow-run IDs/start/read/cancel; cloud or external deployment.
- Kestra: API/namespace/flow/execution IDs/trigger/read/kill where supported.
- Pipedream: workflow/event source endpoint/auth/trigger/callback/status limitations.

Before external automation: validate user/agent permissions, classify side effects, approval, destination, idempotency, cost, pre-tool security, start/log/track/validate. Require approval for messages, publishing, third-party modifications/deletions, paid resources/high-cost jobs, destructive workflows, production writes, system config.

Handle missing/invalid credentials/endpoints/workflow/job IDs, auth, trigger/callback failure, timeout/rate-limit/outage/duplicates/invalid output/partial completion/cancel failure/approval expiration. No infinite polling.

## File and document ingestion

Support PDF, text, Markdown, HTML, Word, CSV, JSON, common spreadsheets, images via OCR/vision adapter, web pages via approved retrieval, cloud-drive files, restricted filesystem files, API content.

Exact workflows:

- 19.01 — File Intake Gateway
- 19.02 — File Type Detector
- 19.03 — File Security Screening
- 19.04 — File Malware Adapter Placeholder
- 19.05 — File Size Validator
- 19.06 — MIME Type Validator
- 19.07 — File Hash Generator
- 19.08 — Duplicate File Detector
- 19.09 — PDF Text Extractor
- 19.10 — Plain Text Extractor
- 19.11 — Markdown Extractor
- 19.12 — HTML Extractor
- 19.13 — Microsoft Word Extractor
- 19.14 — CSV Extractor
- 19.15 — JSON Extractor
- 19.16 — Spreadsheet Extractor
- 19.17 — Image OCR Router
- 19.18 — Vision Document Router
- 19.19 — Unstructured Processing Router
- 19.20 — Document Metadata Extractor
- 19.21 — Document Language Detector
- 19.22 — Document Cleaner
- 19.23 — Document Chunking Router
- 19.24 — Document Deduplication
- 19.25 — Document Access Policy Resolver
- 19.26 — Document Version Manager
- 19.27 — Document Ingestion Status
- 19.28 — Document Ingestion Error Handler
- 19.29 — Document Ingestion Report
- 20.01 — Knowledge Indexing Controller
- 20.02 — Embedding Generation Controller
- 20.03 — Vector Compatibility Check
- 20.04 — Vector Insert Orchestrator
- 20.05 — Index Metadata Writer
- 20.06 — Index Verification
- 20.07 — Index Rollback Controller
- 20.08 — Knowledge Source Registry
- 20.09 — Knowledge Index Health Check
- 20.10 — Knowledge Index Test

File intake requests must contain correlation/user/tenant/source/file fields, access/sensitivity, and processing options for extract text/tables/images/OCR/vision/Unstructured/chunk/embed/index. Responses must report document/version/status/MIME/hash/duplicate/extraction flags/chunk count/embedding/vector/index/warnings/errors. Never claim unsupported or unprocessed files succeeded.

Pipeline: receive → IDs → permission → size/MIME → security → malware adapter if configured → hash → duplicate detection → extraction method → text/metadata → OCR/vision only if required/configured → clean → language → version → access policy → chunk → dedupe → embedding selection → vector selection → dimension validation → vector insertion → verification → source registration → report.

File security checks size/MIME/extension mismatch/suspicious types/scripts/password/encryption/archive/path-traversal/duplicates/malicious URL/sensitive content/PII/secrets/tenant+user access/storage. Blocked files are not extracted/indexed.

OCR/vision are explicit separate operations with provider/model/language/pages/resolution/file/image limits/timeout/cost/approval/security/confidence configuration. Do not claim image text was read unless OCR/vision actually ran. If unavailable, mark configuration required and preserve file record.

Document versioning: stable ID, new version, previous-version reference, hash/ingestion/source modification time, active/superseded/index/reindex/deletion state. Never silently overwrite old indexed versions.

Before indexing validate document/chunk permission, embedding provider/model/dimensions, vector collection/namespace/tenant/version/duplicates/retention. Partial failure must identify failed chunks, preserve successful refs, support retry/rollback, and not claim full completion.

Knowledge source registry tracks source ID/name/type/location/enabled/tenant/owner/access/sensitivity/RAG/embedding/vector/index/namespace/document+chunk counts/last index/health/metadata.

## Real-time data capability

Distinguish model reasoning, conversation memory, long-term memory, indexed knowledge, uploaded files, external tool results, real-time information, and user-provided facts. Time-sensitive questions must not rely only on stored model knowledge.

Exact workflows:

- 11.20 — Real-Time Tool Gateway
- 11.21 — Real-Time Need Detector
- 11.22 — Search Provider Registry
- 11.23 — Search Request Normalizer
- 11.24 — Search Response Normalizer
- 11.25 — External Data API Registry
- 11.26 — External Data Request Router
- 11.27 — Current Data Freshness Validator
- 11.28 — Source Timestamp Validator
- 11.29 — Real-Time Source Attribution
- 11.30 — Real-Time Citation Builder
- 11.31 — Real-Time Tool Fallback
- 11.32 — Real-Time Tool Health Check
- 11.33 — Real-Time Tool Test

Real-time request contains query/data type (`search|news|weather|finance|sports|time|public_api|custom_api`), provider/location/date/freshness/domain controls/max results/permissions. Response contains provider/data type/status/retrievedAt/results/sources/freshnessValidated/latency/warnings/errors.

Rules: detect time sensitivity, select approved provider, check health/permissions/security, retrieve, record time, validate source timestamps, normalize, attribute/cite, return to orchestrator, clearly distinguish retrieved facts from reasoning. Never fabricate live data or citations. If no provider is configured, say real-time access is unavailable.

## Central Tool and Function Gateway

Every native n8n, HTTP, MCP, database, file, code, search, and automation tool uses the common tool contracts and central security/audit layer.

Exact workflows:

- 11.17 — Tool Registry
- 11.18 — Tool Capability Resolver
- 11.19 — Tool Selection Controller
- 11.34 — Tool Request Validator
- 11.35 — Tool Permission Controller
- 11.36 — Tool Approval Controller
- 11.37 — Tool Execution Controller
- 11.38 — Tool Response Validator
- 11.39 — Tool Output Sanitizer
- 11.40 — Tool Result Cache
- 11.41 — Tool Retry Controller
- 11.42 — Tool Fallback Controller
- 11.43 — Tool Error Handler
- 11.44 — Tool Health Check
- 11.45 — Tool Test
- 11.46 — Tool Usage Logger

Tool registry tracks tool/provider/category/enabled/configured/connection/credentials/base URL/operations/read/write/destructive/approval-required operations/allowed+denied agents+users/timeout/retries/health/setup.

Before execution validate request/tool/config/support/permissions/read-write-destructive class/approval/idempotency/security/timeout; execute; validate/sanitize output; record sources; log. Never execute tools directly from unrestricted model text.

Code execution is disabled by default until a secured runtime is configured with language/runtime/sandbox/CPU/memory/time/filesystem/network/package/input/output/approval/audit controls. No unrestricted shell or host secrets.

Database tools default read-only, parameterize where possible, restrict schemas/tables/columns/rows/time, block destructive statements, require approval for writes, audit, normalize errors.

## Background Job Manager

Exact workflows:

- 18.01 — Background Job Intake
- 18.02 — Background Job Queue
- 18.03 — Background Job Worker Router
- 18.04 — Background Job Status Reader
- 18.05 — Background Job Progress Update
- 18.06 — Background Job Result Writer
- 18.07 — Background Job Retry Controller
- 18.08 — Background Job Cancellation
- 18.09 — Background Job Timeout Handler
- 18.10 — Background Job Notification Adapter
- 18.11 — Background Job Cleanup
- 18.12 — Background Job Health Check

Use background jobs for large ingestion, batch embeddings/vector insertions, long research, multi-agent/provider benchmarks, large analysis, external automation, long-running frameworks, graph builds, migrations, and bulk evaluations. Return a job ID instead of holding chat open indefinitely.

## Conversation management

Exact workflows:

- 21.01 — Conversation Session Creator
- 21.02 — Conversation Session Reader
- 21.03 — Conversation Session Updater
- 21.04 — Conversation Session Closer
- 21.05 — Conversation Message Writer
- 21.06 — Conversation History Reader
- 21.07 — Conversation History Summarizer
- 21.08 — Conversation Context Builder
- 21.09 — Conversation Token Budget Manager
- 21.10 — Conversation Memory Sync
- 21.11 — Conversation Export
- 21.12 — Conversation Deletion
- 21.13 — Conversation Health Check

Session schema tracks session/user/tenant/times/status/title/active provider+model+framework/memory/message count/summary/permissions/metadata. Context building preserves relevant recent messages, summarizes older content, respects token limits/deletions/permissions, removes unnecessary secrets, includes only relevant tool/retrieval results, records strategy, and never claims full history if not used.

For the starter: n8n is the active automation layer, Chat Trigger is used, response is synchronous unless a background job is needed, external automation adapters stay disabled until configured, document retrieval and real-time tools are optional, configuration-required states are explicit, and actual tool/data usage is logged.
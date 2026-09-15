# Unified AI Ecosystem — Multipart Intake Instructions

These instructions govern how an AI builder should interpret the Part 1–8 specification.

1. Treat Parts 1 through 8 as one continuous master specification.
2. Preserve every requirement from every part.
3. Do not redesign, rename, simplify, shorten, replace, merge away, consolidate away, or silently omit any component.
4. Some tools and frameworks overlap. Keep every listed tool anyway.
5. Make overlapping products interoperable through standardized request/response schemas, provider adapters, HTTP APIs, webhooks, MCP clients/servers, callable n8n sub-workflows, queues, shared registries, shared auth/permissions, normalized errors, and normalized observability events.
6. Do not claim an external product is connected, installed, deployed, authenticated, configured, healthy, or operational unless it actually is.
7. When a product cannot be built directly inside n8n, create a clearly named adapter, standardized input/output schema, credential and endpoint placeholders, health checks, retry/timeout/error handling, disabled/unconfigured status, setup requirements, and future enablement path.
8. Never create fake credentials, fake API keys, fake endpoints, fake database connections, fake provider responses, fake health results, fake citations, fake successful tests, or fake completion states.
9. Use native n8n nodes where supported. Otherwise use HTTP Request, Webhook, MCP Client Tool, MCP Server Trigger, Code, Execute Sub-workflow, Call n8n Workflow Tool, database/queue/error/switch/merge/wait/approval patterns as appropriate.
10. Build as multiple organized workflows and sub-workflows, not one unmanageable canvas.
11. Preserve exact workflow names and shared schemas.
12. Correlate requests with requestId, sessionId, userId when available, jobId when applicable, and traceId when applicable.
13. Every external action supports permission checking, audit logging, timeout, error handling, duplicate prevention, and human approval when appropriate.
14. If the system cannot be completed in one generation, complete the largest safe coherent batch, preserve unfinished requirements, do not claim whole-system completion, and provide one exact continuation command.
15. Classify build state accurately: Built and Working; Built but Unconfigured; Adapter Created; Credential Required; Endpoint Required; External Deployment Required; Not Yet Created; Test Passed; Test Failed; Blocked.
16. The final component created is `Unified AI Ecosystem — Real-Time Q&A Starter`.
17. Do not require every external provider to be configured before the starter can later be tested.
18. Use OpenAI only as the first default model for the starter; the full ecosystem must support every model provider in the specification.
19. Only interrupt architecture construction for a missing decision that would permanently change architecture or destroy existing work.
20. Current priority is **build everything first, configure credentials and external services afterward**.
21. Current known build position is **Phase 4**; preserve Phases 1–3 and continue forward rather than restarting.

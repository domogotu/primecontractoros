# Unified AI Ecosystem — Part 8: Real-Time Q&A Starter and Final Build Instructions

## Purpose

The complete specification across Parts 1–8 defines the **Unified AI Ecosystem**, a separate, general-purpose AI operating system. It must support real-time conversation, multi-model routing, multi-agent orchestration, RAG, memory, vector search, MCP, tool execution, automation, security, observability, evaluation, background jobs, human approvals, and administration.

Every provider, adapter, registry, workflow, router, and subsystem in Parts 1–7 remains represented.

## Final starter workflow

Create exactly:

**27 — Unified AI Ecosystem — Real-Time Q&A Starter**

This is the final architecture component and must be immediately testable once at least one chat model credential is configured.

### Required starter path

Chat Trigger
→ Request Validation
→ Generate requestId
→ Generate traceId
→ Session Memory
→ Initial Security Check
→ Master Orchestrator
→ Model Router
→ OpenAI Adapter (first default active provider when configured)
→ Optional RAG Retrieval
→ Optional MCP Client Tool
→ Optional Real-Time Tool Gateway
→ Response Validator
→ Output Security Check
→ Save Session Memory
→ Execution Logger
→ Audit Logger
→ Return Response

Enable streaming where supported by the selected model and n8n chat interface.

## Starter capabilities

The starter must support:
- Conversation
- Session memory
- Centralized logging
- Centralized security
- Common request schema
- Common response schema
- Request and trace identifiers
- Provider registry
- Provider health/readiness
- Error handling
- Bounded retries
- Response validation
- Audit logging
- Optional retrieval
- Optional MCP/tools
- Optional current/real-time retrieval

It must **not** require advanced external systems such as Redis, Neo4j, Mem0, Zep, Letta, Pinecone, Weaviate, Milvus, Qdrant, GraphRAG, CrewAI, AutoGen, Temporal, Airflow, or other external deployments before basic chat testing. Those integrations remain registered and disabled/unconfigured until added.

## Starter model behavior

Use the n8n AI Agent as the initial Master Agent if available. Use OpenAI as the first default active model provider only when credentials are configured. Do not hardcode an outdated model ID; expose the model ID through configuration/registry. All unconfigured model routes remain disabled.

Model routes must exist for:
- OpenAI GPT
- Anthropic Claude
- Google Gemini
- Meta Llama
- Mistral AI
- Cohere
- Hugging Face
- Ollama
- vLLM

Failures use the configured fallback path. If no model is available, return a clear configuration-required response.

## Master Agent starter instruction

> You are the initial conversational entry point for the Unified AI Ecosystem. Understand the user’s question, identify the intent, and provide a clear and accurate answer. Use available memory to preserve conversational context. Use retrieval when indexed documents are relevant. Use approved tools for current or external information. Never claim to have used a tool, source, framework, model, database, memory system, or real-time service that was not actually used. When information is unavailable, say what is missing. Return a direct user-facing answer plus structured execution metadata for internal logging.

## Starter logging

Record, where available:
- Question
- Request ID
- Trace ID
- Session ID
- Selected provider
- Selected model
- Selected agent/framework
- Memory used
- Retrieval used
- Tools used
- Sources
- Response
- Latency
- Retries/fallbacks
- Errors
- Security result
- Final status

Do not store secrets or unnecessary sensitive prompt content.

## Starter tests

The starter should successfully handle, after one model is configured:

1. `Hello`
2. `What can you do?`
3. `What model are you currently using?`
4. `What providers are currently configured?`
5. `What providers are currently unavailable?`
6. `What is artificial intelligence, and how can multiple AI agents work together?`
7. `Which model, memory system, retrieval framework, and tools did you actually use to answer my previous question?`
8. `What information can you retrieve in real time right now, and which integrations still require configuration?`

The answer to usage/configuration questions must be based on actual execution metadata and registry state, not fabricated descriptions.

## Build-first execution rule

The architecture is built **before** credentials and external services are configured.

Do not stop architecture construction to request API keys, OpenAI credentials, databases, provider endpoints, or external deployments. For missing integrations, create their complete adapter structure, common schemas, credential/endpoint placeholders, health checks, tests, retries, error handling, setup requirements, and accurate disabled/unconfigured readiness status. Continue through the remaining phases.

Do not simplify, merge away, rename, or omit components due to overlap or missing credentials.

Do not prioritize making the starter live before the rest of the architecture is represented. Build the starter as the final architecture component, then produce the configuration/activation checklist.

## Current build continuation rule

Known n8n build progress reached **Phase 4 — Knowledge Layer** before AI Builder credits were exhausted.

When resuming:
1. Continue from the current Phase 4 state.
2. Do not restart/recreate/redesign Phases 1–3.
3. Audit existing Phase 4 work.
4. Preserve completed Phase 4 workflows.
5. Build only missing Phase 4 components.
6. Continue automatically through Phase 5 and every remaining phase.
7. Do not stop for credentials/configuration.
8. Build the Real-Time Q&A Starter only after the remaining architecture is represented.

If a response/generation limit is reached, finish the largest coherent batch, identify the exact last completed workflow, list remaining work, provide one exact continuation prompt, and do not ask for Parts 1–8 again.

## Final build command

Use the following command when the builder is ready to resume:

```text
BEGIN FULL BUILD

Using every preserved instruction from Parts 1 through 8, continue constructing the Unified AI Ecosystem from the current build state at Phase 4.

Do not restart or redesign completed work.
Do not stop for credentials, API keys, endpoints, databases, or external deployments.
Create complete adapters and placeholders for anything not configured.
Mark those components accurately as unconfigured, credential required, endpoint required, or external deployment required.
Do not fabricate operational status or test success.
Continue through every remaining phase in the defined dependency order.
Build actual n8n workflows and sub-workflows rather than only describing the architecture.
Use the shared schemas, registries, routers, security, approvals, observability, logging, health, and error recovery layers defined in this specification.
When the generation limit is reached, finish a coherent batch, report the exact last completed workflow, preserve all remaining requirements, and output one exact continuation command.
Build “Unified AI Ecosystem — Real-Time Q&A Starter” as the final architecture component.
After the architecture is complete, return the complete credentials/endpoints/databases/external-deployment/manual-configuration/activation/testing checklist.
```

## Final success conditions

The build is only architecturally complete when:
- Every required workflow exists
- Every adapter exists
- Every provider is represented
- Every registry/router exists
- Every health check exists
- Every provider test exists
- Every logging/security/approval/evaluation workflow exists
- Every memory/vector/RAG/automation/MCP component is represented
- The Master Orchestrator connects the subsystems
- The Real-Time Q&A Starter exists
- Missing external configuration is accurately classified rather than fabricated

Operational completion is separate: an integration is Operational only after its real credential/endpoint/deployment is configured and its health/provider tests pass.
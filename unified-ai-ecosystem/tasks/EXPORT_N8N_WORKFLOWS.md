# TASK: Export All n8n Workflows to Git

**Status:** IN PROGRESS — 1 of 67 exported
**Priority:** Do this BEFORE any Phase 5+ implementation work.
**Owner:** Claude Code (local, with n8n API access)

---

## Why this task exists

67 fully-built Unified AI Ecosystem workflows currently exist **only inside the n8n instance**. They are not in Git. The n8n AI Builder is paused (credits exhausted), which means this implementation work is currently unbacked and at risk.

This was verified by direct inspection of the live n8n instance on 2026-08-07. The workflows are real implementations, not stubs — e.g. `00.03 — Provider Registry` contains a complete 90-provider registry in JavaScript with credential types, endpoint/deployment flags, readiness states, priorities, and fallback ordering, with inline citations to spec sections.

**Until this export is complete, Phase 5+ work should not begin**, because Phase 5 must build on the Phase 1–4 foundation that currently exists only in n8n.

## Why it must be scripted, not manual

An earlier attempt exported workflow `00.01` by hand-transcribing JSON through a chat interface. That succeeded, but the method does not scale and is not lossless-safe: workflows contain large embedded JavaScript blocks with nested quotes, escapes, and newlines, where manual retyping risks silent corruption.

**Export must be done programmatically via the n8n API so the JSON is byte-for-byte accurate.**

---

## Destination structure

```
unified-ai-ecosystem/workflows/
  00-foundation/
  04-llm/
  05-agents/
  06-rag/
  07-embeddings/
  08-vector-databases/
  27-realtime-qa/
  WORKFLOW_MANIFEST.md
  workflow-manifest.json
```

Filenames: derived from the exact n8n workflow name, sanitized only as needed for the filesystem. Do **not** rename workflows themselves.

Example: `00.03 — Provider Registry` → `00-foundation/00.03-provider-registry.json`

---

## Export requirements

For every workflow, retrieve the complete definition from the n8n API and preserve:

- workflow name, workflow ID, versionId
- nodes, node parameters, node types, node typeVersions, node positions, node IDs
- connections
- settings
- metadata, nodeGroups, parentFolderId
- sticky notes
- disabled nodes
- expressions
- **Code node JavaScript (verbatim — this is the highest-risk field)**
- webhook configuration
- error handling
- sub-workflow references
- tags
- createdAt / updatedAt timestamps

**Rules:**

1. Do not strip implementation details.
2. Do not replace credentials with fake credentials.
3. Preserve credential references only in the safe form exposed by n8n (id + name, never secret values).
4. **Never commit API keys, tokens, passwords, or OAuth secrets.** Scan each file before committing.
5. Do not modify the workflow during export.
6. Do not "clean up" or refactor.
7. Do not rebuild from the specification — export the actual current n8n definition.

---

## Complete workflow inventory (67 total)

Verified against the live n8n instance on 2026-08-07. All are currently `active: false`.

### 00-foundation (13)

| n8n ID | Workflow Name | Target filename |
|---|---|---|
| `KpnVybT0BRJ4YozT` | 00.01 — Common Request Schema | `00.01-common-request-schema.json` ✅ **DONE** |
| `o6jnjBDU2fL8aXJV` | 00.02 — Common Response Schema | `00.02-common-response-schema.json` |
| `sWFMzRBC5bJpeqFQ` | 00.03 — Provider Registry | `00.03-provider-registry.json` |
| `45Cnx7tom4xqSqqq` | 00.04 — Global Configuration | `00.04-global-configuration.json` |
| `hP9dREBXlJkXRCDQ` | 00.05 — Audit Logging | `00.05-audit-logging.json` |
| `3ySil4uti8hTJau6` | 00.06 — Execution Logging | `00.06-execution-logging.json` |
| `MClBymOLLpxYZuzW` | 00.07 — Error Normalization | `00.07-error-normalization.json` |
| `WyTLw6OdxSdYFC9U` | 00.08 — Health Framework | `00.08-health-framework.json` |
| `LJRxy4dVrucVsjxO` | 00.09 — Credential Registry | `00.09-credential-registry.json` |
| `qqJHUkEsqBqQ8XNI` | 00.10 — Permission System | `00.10-permission-system.json` |
| `Tz6EqTZCasDVKXFC` | 00.11 — Approval Framework | `00.11-approval-framework.json` |
| `eRebmLo9LebzgRDY` | 00.12 — Correlation IDs | `00.12-correlation-ids.json` |
| `eZoRXTJnI88GJh51` | 00.13 — Background Job Framework | `00.13-background-job-framework.json` |

### 04-llm (10)

| n8n ID | Workflow Name | Target filename |
|---|---|---|
| `Qt1pI91TW8M4Pi8l` | 04.00 — LLM Model Router | `04.00-llm-model-router.json` |
| `vGDopZulAJjKx7x3` | 04.01 — OpenAI GPT Adapter | `04.01-openai-gpt-adapter.json` |
| `vOVc4fBDv4vBtHml` | 04.02 — Anthropic Claude Adapter | `04.02-anthropic-claude-adapter.json` |
| `BJhvqXxid0L8bU3k` | 04.03 — Google Gemini Adapter | `04.03-google-gemini-adapter.json` |
| `J2grS6XaIa6FD0E6` | 04.04 — Meta Llama Adapter | `04.04-meta-llama-adapter.json` |
| `CWPBfqYQIXj9sIYc` | 04.05 — Mistral AI Adapter | `04.05-mistral-ai-adapter.json` |
| `WjMkkwTECWUZcPrB` | 04.06 — Cohere Adapter | `04.06-cohere-adapter.json` |
| `sMUH35c1smgO1wEb` | 04.07 — Hugging Face Adapter | `04.07-hugging-face-adapter.json` |
| `BxfMj5ItTRyafWOR` | 04.08 — Ollama Adapter | `04.08-ollama-adapter.json` |
| `qSXRUlfLoxhm7ntb` | 04.09 — vLLM Adapter | `04.09-vllm-adapter.json` |

### 05-agents (16)

| n8n ID | Workflow Name | Target filename |
|---|---|---|
| `ahaDw76EJmjQpl4n` | 05.00 — Agent Router | `05.00-agent-router.json` |
| `rLVPP8SNEN0U1D1q` | 05.01 — LangGraph Adapter | `05.01-langgraph-adapter.json` |
| `cpUyyPiG7yP5EpgX` | 05.02 — CrewAI Adapter | `05.02-crewai-adapter.json` |
| `FGhxB35V9pIDj5Fc` | 05.03 — Microsoft AutoGen Adapter | `05.03-microsoft-autogen-adapter.json` |
| `C6NPyQYRtaHMtMnc` | 05.04 — Microsoft Agent Framework Adapter | `05.04-microsoft-agent-framework-adapter.json` |
| `22kRGgywjzbQ3qwa` | 05.05 — LlamaIndex Workflows Adapter | `05.05-llamaindex-workflows-adapter.json` |
| `Pqe6JzlawBy04yDa` | 05.06 — AWS Strands Agents Adapter | `05.06-aws-strands-agents-adapter.json` |
| `KpRqGwrFh7YbWPJN` | 05.07 — CAMEL Adapter | `05.07-camel-adapter.json` |
| `nGmaBpqHtaHUm8af` | 05.08 — Agno Adapter | `05.08-agno-adapter.json` |
| `odf93Gnh6gFyRaPY` | 05.09 — OpenAI Agents SDK Adapter | `05.09-openai-agents-sdk-adapter.json` |
| `vZKVJFyZuEMYBVb6` | 05.10 — LangChain Agents Adapter | `05.10-langchain-agents-adapter.json` |
| `YBgXBTLusRJaVfuI` | 05.11 — PydanticAI Adapter | `05.11-pydanticai-adapter.json` |
| `naM5MpzZDdkowEbM` | 05.12 — Semantic Kernel Adapter | `05.12-semantic-kernel-adapter.json` |
| `QbRny2SyxLbu7KvS` | 05.13 — Google ADK Adapter | `05.13-google-adk-adapter.json` |
| `mLhfySAq61ZaJKqZ` | 05.14 — AWS Bedrock Agents Adapter | `05.14-aws-bedrock-agents-adapter.json` |
| `5xfKLXCKa2PuWCQo` | 05.15 — Azure AI Foundry Agents Adapter | `05.15-azure-ai-foundry-agents-adapter.json` |

### 06-rag (9)

| n8n ID | Workflow Name | Target filename |
|---|---|---|
| `pJO1xZoV2WPUHV8Y` | 06.00 — RAG Router | `06.00-rag-router.json` |
| `j5RAdbQXFv6IaWLm` | 06.01 — LangChain RAG Adapter | `06.01-langchain-rag-adapter.json` |
| `07iwJ3dZ4wgXDc5S` | 06.02 — LlamaIndex RAG Adapter | `06.02-llamaindex-rag-adapter.json` |
| `BJrhv7tNHuKPoBEf` | 06.03 — Haystack Adapter | `06.03-haystack-adapter.json` |
| `UEHzBCwLvzebmWYF` | 06.04 — DSPy Adapter | `06.04-dspy-adapter.json` |
| `8xTQf1l495Mc7hLn` | 06.05 — RAGFlow Adapter | `06.05-ragflow-adapter.json` |
| `HEwGClt9aABDCfCd` | 06.06 — GraphRAG Adapter | `06.06-graphrag-adapter.json` |
| `3oCFmKoaclcvHrXv` | 06.07 — Unstructured Adapter | `06.07-unstructured-adapter.json` |
| `PiLKYu7Q0M6q7Opc` | 06.08 — EmbedChain Adapter | `06.08-embedchain-adapter.json` |

### 07-embeddings (8)

| n8n ID | Workflow Name | Target filename |
|---|---|---|
| `khcBRvVNhSVL7AHT` | 07.00 — Embedding Router | `07.00-embedding-router.json` |
| `9RJNHqcmHhhIyylo` | 07.01 — OpenAI Embeddings Adapter | `07.01-openai-embeddings-adapter.json` |
| `f7OTKxzQBZfsPcLB` | 07.02 — Cohere Embed Adapter | `07.02-cohere-embed-adapter.json` |
| `tJvF4z8eqEHySVky` | 07.03 — Voyage AI Adapter | `07.03-voyage-ai-adapter.json` |
| `iLDARlT7I1h9jv8u` | 07.04 — Sentence Transformers Adapter | `07.04-sentence-transformers-adapter.json` |
| `Ko3hBIV561hC4fRj` | 07.05 — BGE Adapter | `07.05-bge-adapter.json` |
| `bMANZGGv0iiP5YYE` | 07.06 — Google Vertex AI Embeddings Adapter | `07.06-google-vertex-ai-embeddings-adapter.json` |
| `0TKH2lhUKNsM3n47` | 07.07 — Azure OpenAI Embeddings Adapter | `07.07-azure-openai-embeddings-adapter.json` |

### 08-vector-databases (10)

| n8n ID | Workflow Name | Target filename |
|---|---|---|
| `myvS0eCyEX1iOkaq` | 08.00 — Vector DB Router | `08.00-vector-db-router.json` |
| `SSEoXszJlBl56bCV` | 08.01 — Pinecone Adapter | `08.01-pinecone-adapter.json` |
| `puugbj5Tg4FuyFy0` | 08.02 — Weaviate Adapter | `08.02-weaviate-adapter.json` |
| `tO77LNmdzZUA8Nhf` | 08.03 — Qdrant Adapter | `08.03-qdrant-adapter.json` |
| `g73pLk9CUx6oLAQk` | 08.04 — Milvus Adapter | `08.04-milvus-adapter.json` |
| `pXlMpfd9CXYWhSmg` | 08.05 — Chroma Adapter | `08.05-chroma-adapter.json` |
| `3iqnzgfJT4RE6cMC` | 08.06 — pgvector Adapter | `08.06-pgvector-adapter.json` |
| `3rfAgA0Yxn1haQWE` | 08.07 — Elasticsearch Adapter | `08.07-elasticsearch-adapter.json` |
| `wUj1VhAOzC5Ds5CT` | 08.08 — Redis Vector Adapter | `08.08-redis-vector-adapter.json` |
| `VBK7esGPAlpuGIBD` | 08.09 — MongoDB Atlas Vector Search Adapter | `08.09-mongodb-atlas-vector-search-adapter.json` |

### 27-realtime-qa (1)

| n8n ID | Workflow Name | Target filename |
|---|---|---|
| `5ph0wGnVo4vnE0y1` | Unified AI Ecosystem — Real-Time Q&A Starter | `unified-ai-ecosystem-realtime-qa-starter.json` |

**Note:** series 01, 02, 03 do not exist as workflow prefixes in n8n. Numbering starts at 00 (foundation) and jumps to 04. Do not assume missing series indicate missing work — confirm against the spec during gap analysis.

---

## Manifests to produce

### `WORKFLOW_MANIFEST.md` (human-readable)

For all 67: exact workflow name, n8n workflow ID, series, GitHub file path, active/inactive state, node count, trigger type, major dependencies, credential references required, external endpoint requirements, last updated timestamp, export status, validation status.

### `workflow-manifest.json` (machine-readable)

```json
{
  "workflowId": "",
  "workflowName": "",
  "series": "",
  "path": "",
  "active": false,
  "nodeCount": 0,
  "triggerTypes": [],
  "dependencies": [],
  "credentialTypes": [],
  "externalEndpoints": [],
  "exportedAt": "",
  "validationStatus": ""
}
```

---

## Validation (per file, after writing)

1. Parse as JSON — must succeed.
2. Workflow name matches n8n exactly.
3. Workflow ID matches n8n exactly.
4. Node count matches the API response.
5. Connections object is present and non-empty (where the source has connections).
6. Every Code node's `jsCode` is present and non-empty.
7. No secret values committed — scan for patterns like `sk-`, `re_`, `ghp_`, `Bearer `, `password`, `apiKey` with literal values.

Record the result per workflow in both manifests.

---

## After export: correct BUILD_STATUS.md

`BUILD_STATUS.md` currently states Phase 4 is the continuation point and implies Phase 4 needs building. **Inspection of n8n contradicts this.** Series 06 (RAG), 07 (Embeddings), and 08 (Vector Databases) — 27 workflows — already exist, and those are precisely what `BUILD_STATUS.md` defines as the Phase 4 knowledge layer.

Update `BUILD_STATUS.md` to record the **evidence-based** state:

- Phase 1 — Foundation: substantially/fully built (13 workflows, series 00)
- Phase 2 — LLM layer: substantially/fully built (10 workflows, series 04)
- Phase 3 — Agent layer: substantially/fully built (16 workflows, series 05)
- Phase 4 — Knowledge layer: substantially/fully built (27 workflows, series 06/07/08)
- Real-Time Q&A Starter: built
- Phase 5+ (Memory, MCP, Security, Observability, Automation, Documents, Tool Gateway, Orchestrator): **no corresponding workflow series found in n8n**

**Do not mark any phase "complete" from workflow names alone.** Determine completeness by comparing exported workflow contents against the authoritative spec under `unified-ai-ecosystem/spec/`.

---

## After export: gap analysis

Create `unified-ai-ecosystem/docs/IMPLEMENTATION_GAP_ANALYSIS.md`.

Compare actual exported workflows against `unified-ai-ecosystem/spec/`. For every phase, classify each requirement as:

- Implemented and verified
- Implemented but untested
- Partially implemented
- Adapter only
- Missing
- External configuration required
- Credential required

Cross-reference `COMPONENT_INVENTORY.md` — every listed provider/framework must remain represented, and the inventory's ~75 providers plus 28 cross-cutting services define the completeness bar.

---

## Commit batches

1. Export 00.xx foundation workflows
2. Export 04.xx LLM workflows
3. Export 05.xx agent workflows
4. Export 06.xx RAG workflows
5. Export 07.xx embedding workflows
6. Export 08.xx vector database workflows
7. Export Real-Time Q&A Starter
8. Add manifests, corrected BUILD_STATUS.md, and gap analysis

Do not modify unrelated PrimeContractorOS files. See the workstream boundary at the top of the root `CLAUDE.md`.

---

## Completion report

Report:

- Workflows found in n8n
- Workflows successfully exported
- Workflows that failed export
- Workflows that failed validation
- Exact Git paths
- Updated phase status
- Missing Phase 5+ implementation
- Any credentials or external dependencies discovered

---

## Do not begin Phase 5 implementation until this export and gap analysis are finished.

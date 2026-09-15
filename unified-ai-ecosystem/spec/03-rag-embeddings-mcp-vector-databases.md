# Unified AI Ecosystem — Part 3: RAG, Embeddings, MCP, and Vector Databases

## Required RAG frameworks

Include all:

1. LangChain
2. LlamaIndex
3. Haystack
4. DSPy
5. RAGFlow
6. GraphRAG
7. Unstructured
8. EmbedChain

Do not remove or merge any framework due to overlap. All connect through a shared RAG and Knowledge Gateway with common request, retrieval, source, security, and response contracts. Do not invoke all RAG frameworks for every request; support selection, fallback, parallel comparison, benchmark, and specialized routing.

## Exact RAG workflow names

- 06.01 — LangChain RAG Adapter
- 06.02 — LlamaIndex RAG Adapter
- 06.03 — Haystack Adapter
- 06.04 — DSPy Adapter
- 06.05 — RAGFlow Adapter
- 06.06 — GraphRAG Adapter
- 06.07 — Unstructured Document Adapter
- 06.08 — EmbedChain Adapter
- 06.09 — RAG Framework Registry
- 06.10 — RAG Capability Resolver
- 06.11 — RAG Framework Selection
- 06.12 — RAG Request Normalizer
- 06.13 — RAG Response Normalizer
- 06.14 — Document Retrieval Controller
- 06.15 — Semantic Retrieval
- 06.16 — Keyword Retrieval
- 06.17 — Hybrid Retrieval
- 06.18 — Graph Retrieval
- 06.19 — Metadata Filter Controller
- 06.20 — Access-Control Retrieval Filter
- 06.21 — Retrieval Reranker
- 06.22 — Context Compression
- 06.23 — Context Window Builder
- 06.24 — Retrieval Deduplication
- 06.25 — Source Attribution Builder
- 06.26 — Citation Builder
- 06.27 — Retrieval Confidence Evaluator
- 06.28 — Empty Retrieval Handler
- 06.29 — RAG Framework Fallback
- 06.30 — RAG Parallel Comparison
- 06.31 — RAG Benchmark
- 06.32 — RAG Health Check
- 06.33 — RAG Provider Test

Each RAG framework registry entry must track enabled/configured state, connection type (`native|http|webhook|mcp|subworkflow|local_service`), credential/base URL/health endpoint, ingestion/parsing/chunking/semantic/keyword/hybrid/graph/rerank/metadata/access/context/source/evaluation/streaming capability metadata, external deployment status, timeout/retries, priority/fallback order, health, setup requirements, and notes.

## Standard RAG request

```json
{
  "requestId":"",
  "traceId":"",
  "sessionId":"",
  "userId":"",
  "query":"",
  "framework":"",
  "knowledgeSources":[],
  "collectionIds":[],
  "documentIds":[],
  "namespace":"",
  "tenantId":"",
  "retrievalMode":"semantic|keyword|hybrid|graph|automatic",
  "topK":5,
  "minimumScore":null,
  "rerank":false,
  "rerankProvider":"",
  "metadataFilters":{},
  "accessFilters":{},
  "contextTokenLimit":null,
  "includeSources":true,
  "includeMetadata":true,
  "includeScores":true,
  "securityContext":{},
  "metadata":{}
}
```

## Standard RAG response

Normalize to status, query, retrieval mode, result records containing result/document/chunk IDs, source name/type/location, content, score, rerank score, metadata, accessVerified; plus sources, assembled context, token estimate, retrieval count, latency, warnings, errors, metadata. Never fabricate sources, titles, locations, scores, or inaccessible documents.

## Unified retrieval pipeline

Query normalization → retrieval need detection → security/permission check → knowledge source selection → RAG framework selection → vector DB selection → embedding compatibility → metadata/access filters → retrieval → dedupe → optional rerank → context compression → context-window construction → source attribution → citation construction → evaluation → normalized context to orchestrator. Bypass RAG when retrieval is unnecessary.

Support semantic, keyword, hybrid, graph, metadata-filtered, access-controlled, multi-source, parallel comparison, and fallback retrieval.

## Document and chunk metadata

Documents must track stable document ID/version, source name/type/location, title/author, source creation/modification and ingestion times, content hash, language/MIME, tenant/owner, access policy, sensitivity, embedding provider/model/dimensions, vector database, collection, namespace, metadata. Chunks must track chunk/document IDs, version, index, content/hash/token estimate, page/section/heading path/table/image/source references, embedding provider/model/dimensions, creation time, metadata.

Support configurable fixed-character, token, paragraph, sentence, heading-aware, Markdown-aware, HTML-aware, page-aware, table-aware, semantic, recursive, provider-specific, and document-type-specific chunking, with size/overlap/min/max, heading/page/table/source preservation, dedupe, and empty-chunk rejection.

## Unstructured

Provide local or hosted API modes, base URL, credentials, partition strategy, document type, table extraction, page breaks, metadata extraction, language detection, OCR dependency, timeout/retry/health. Never claim Unstructured processed a document unless invoked.

## GraphRAG

Support entity and relationship extraction, graph construction, cluster/community metadata where available, local/global graph search, source-document references, graph DB selection, graph versioning/rebuild status/health. Return configuration-required if no compatible graph database exists. Do not replace GraphRAG with ordinary vector retrieval.

## Reranking

Create one rerank interface supporting Cohere reranking when configured, model-based reranking, cross-encoder, provider-specific rerank APIs, no-rerank, admin-selected, and automatic eligible reranker. Requests include query/documents/provider/model/topN. Responses include ranked documents/status/latency/warnings/errors.

## Required embedding providers

Include separately:

1. OpenAI Embeddings
2. Cohere Embed
3. Voyage AI
4. Sentence Transformers
5. BGE
6. Google Vertex AI Embeddings
7. Azure OpenAI Embeddings

Exact workflows:

- 07.01 — OpenAI Embeddings Adapter
- 07.02 — Cohere Embed Adapter
- 07.03 — Voyage AI Embeddings Adapter
- 07.04 — Sentence Transformers Adapter
- 07.05 — BGE Embeddings Adapter
- 07.06 — Google Vertex AI Embeddings Adapter
- 07.07 — Azure OpenAI Embeddings Adapter
- 07.08 — Embedding Provider Registry
- 07.09 — Embedding Capability Resolver
- 07.10 — Embedding Provider Selection
- 07.11 — Embedding Request Normalizer
- 07.12 — Embedding Response Normalizer
- 07.13 — Embedding Batch Controller
- 07.14 — Embedding Dimension Validator
- 07.15 — Embedding Compatibility Resolver
- 07.16 — Embedding Provider Fallback
- 07.17 — Embedding Health Check
- 07.18 — Embedding Provider Test
- 07.19 — Embedding Usage Logger

Embedding configuration tracks credentials/base URL/default+available+allowed models, dimensions/max input by model, batching/task-type/multilingual/local-hosting capabilities, timeout/retries/priority/fallback/health/external deployment/setup requirements.

Embedding requests contain provider/model/inputs/inputType/dimensions/normalize/batch size/timeout/metadata. Responses contain provider/model/status/dimensions/vector list with input hashes/usage/latency/warnings/errors. Never expose huge vectors in ordinary chat or logs.

### Dimension safety

Never insert incompatible vectors. Validate provider/model/dimensions/distance metric/collection/namespace/document version/index metadata first. On mismatch, stop, return structured error, suggest compatible index or explicit re-embedding. Never truncate/pad vectors silently.

## Required MCP ecosystem

Include all:

1. MCP SDK
2. FastMCP
3. MCP Registry
4. GitHub MCP Server
5. Slack MCP Server
6. PostgreSQL MCP Server
7. Google Drive MCP Server
8. Filesystem MCP Server

Exact workflows:

- 10.01 — MCP SDK Adapter
- 10.02 — FastMCP Adapter
- 10.03 — MCP Registry Adapter
- 10.04 — GitHub MCP Server Adapter
- 10.05 — Slack MCP Server Adapter
- 10.06 — PostgreSQL MCP Server Adapter
- 10.07 — Google Drive MCP Server Adapter
- 10.08 — Filesystem MCP Server Adapter
- 10.09 — MCP Server Registry
- 10.10 — MCP Client Gateway
- 10.11 — MCP Server Gateway
- 10.12 — MCP Tool Discovery
- 10.13 — MCP Resource Discovery
- 10.14 — MCP Prompt Discovery
- 10.15 — MCP Capability Cache
- 10.16 — MCP Permission Controller
- 10.17 — MCP Tool Allowlist
- 10.18 — MCP Tool Denylist
- 10.19 — MCP Read Action Controller
- 10.20 — MCP Write Action Controller
- 10.21 — MCP Approval Controller
- 10.22 — MCP Request Normalizer
- 10.23 — MCP Response Normalizer
- 10.24 — MCP Error Handler
- 10.25 — MCP Health Check
- 10.26 — MCP Provider Test

MCP server registry must track server name/type, enabled/configured, transport (`stdio|sse|streamable_http|websocket|other`), URL/command/arguments, credential/auth type, tools/resources/prompts/sampling capabilities, allow/deny lists, read/write rules, approvals for writes, path/database/repo/channel restrictions, timeout/retries, health/discovery times/setup requirements.

Normalize MCP requests by server/operation type/name/arguments/read-or-write/permissions/approval/timeout; normalize responses with status/content/structured content/resources/tools/prompts/sources/latency/warnings/errors.

### MCP security

Enforce user auth, permissions, server/tool/resource allow+deny lists, read/write separation, approval for writes, repository/branch/database/schema/table/channel/Drive/filesystem path restrictions, SQL validation, path-traversal prevention, secret redaction, input/output validation, audit, timeout/rate controls. Defaults are read-only for sensitive systems.

GitHub MCP: repository/file/issue/PR/commit/search reads, optional approved writes, repo/branch allowlists, approval+audit for writes.

Slack MCP: workspace/channel-scoped reads/search/threads and optional approved sends; no automatic sending by default.

PostgreSQL MCP: read-only default, schema/table discovery, approved SELECTs, row/time limits, sensitive-column restrictions, optional approved writes, block destructive queries unless authorized.

Google Drive MCP: list/search/read metadata/docs with folder/shared-drive/user scope restrictions; approval for edits/uploads/moves/deletes.

Filesystem MCP: restricted base directories, read-only default, path validation/traversal prevention, extension/size/hidden/secret restrictions, approval for writes/deletes; never root access.

## Required vector databases

Include all:

1. Pinecone
2. Weaviate
3. Qdrant
4. Milvus
5. Chroma
6. pgvector
7. Elasticsearch
8. Redis
9. MongoDB Atlas Vector Search

Exact workflows:

- 08.01 — Pinecone Adapter
- 08.02 — Weaviate Adapter
- 08.03 — Qdrant Adapter
- 08.04 — Milvus Adapter
- 08.05 — Chroma Adapter
- 08.06 — pgvector Adapter
- 08.07 — Elasticsearch Vector Adapter
- 08.08 — Redis Vector Adapter
- 08.09 — MongoDB Atlas Vector Search Adapter
- 08.10 — Vector Database Registry
- 08.11 — Vector Database Capability Resolver
- 08.12 — Vector Database Selection
- 08.13 — Vector Collection Manager
- 08.14 — Vector Insert Controller
- 08.15 — Vector Update Controller
- 08.16 — Vector Delete Controller
- 08.17 — Vector Search Controller
- 08.18 — Vector Metadata Filter
- 08.19 — Vector Namespace Controller
- 08.20 — Vector Dimension Validator
- 08.21 — Vector Database Fallback
- 08.22 — Vector Replication Controller
- 08.23 — Vector Migration Controller
- 08.24 — Vector Comparison Mode
- 08.25 — Vector Database Health Check
- 08.26 — Vector Database Test
- 08.27 — Vector Usage Logger

Each vector DB registry tracks connection type/credential/base URL/host/port/database/index/namespace+tenant strategy/embedding provider+model/dimensions/distance metric/capabilities/local hosting/external deployment/timeout/retries/priority/fallback/health/setup.

Support create/read-config/validate-dimensions/insert/batch/update/delete/delete-by-metadata/semantic-search/metadata+namespace filters/tenant separation/health/logging where available. Clearly mark unsupported features.

Modes: primary, fallback, mirror, migration, comparison, provider-specific. Mirror/migration/comparison are disabled by default. Validate authorization, approval, provider/model/dimensions/metric/metadata/namespace/tenant/counts/duplicates/retention/cost before replication; never copy restricted data to weaker destinations.

## Initial RAG testing

The starter may use a simple n8n-supported vector store or Chroma-compatible placeholder with one configured embedding provider. Retrieval remains optional. Other RAG/vector providers stay registered and disabled until configured, and the system must clearly report when no indexed documents are available.
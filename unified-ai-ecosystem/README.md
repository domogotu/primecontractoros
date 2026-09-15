# Unified AI Ecosystem

This directory contains the specification and build-control documents for a separate general-purpose Unified AI Ecosystem project. It is intentionally isolated from PrimeContractorOS even though it is currently stored in this repository.

## Goal

Build a modular AI operating system that connects multiple LLM providers, agent frameworks, RAG systems, embedding providers, MCP servers, memory systems, vector databases, security tools, observability tools, and automation platforms through normalized adapters and centralized routing.

## Core rules

- Build architecture first; configure credentials and external services afterward.
- Do not remove overlapping tools or frameworks.
- Do not fabricate credentials, endpoints, provider responses, health results, citations, or test results.
- Unconfigured services must remain represented as adapters and be marked unconfigured/disabled until ready.
- Preserve shared request/response schemas, correlation IDs, centralized security, audit logging, permissions, retries, and health checks.
- Continue from the current build state; do not restart completed phases.

## Current build state

The n8n build reached Phase 4 before AI Builder credits were exhausted. When AI Builder credits are available again, continue from Phase 4 and preserve Phases 1 through 3.

## Structure

- `BUILD_STATUS.md` — current state and continuation instructions
- `COMPONENT_INVENTORY.md` — exact tool/provider inventory from the reference architecture
- `prompts/CONTINUATION_FROM_PHASE_4.md` — next n8n AI Builder continuation prompt
- `prompts/FULL_BUILD_CONTROL.md` — build-first/configure-later control prompt
- `prompts/REALTIME_QA_STARTER.md` — final starter workflow requirements


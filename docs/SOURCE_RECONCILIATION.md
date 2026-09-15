# Source Reconciliation and Evidence Ledger

## Purpose

This ledger prevents old designs, generated manuals, and historical runtime reports from being mistaken for current implementation evidence.

## Source classification

| Source | Classification | Use |
|---|---|---|
| Latest user repository rule | Binding | V2 only; production untouched until explicit promotion approval. |
| Current V2 `CLAUDE.md` | Binding engineering control | Workstream separation, migration process, security, and quality gates. |
| Current V2 code | Implementation evidence | Proves only what the present files implement. |
| Production code | Read-only migration baseline | Compare and mirror; never modify during V2 work. |
| Master Specification | Authoritative intended behavior | Acceptance target, not proof of completion. |
| Uploaded May 2026 handoff/audit PDFs | Historical evidence | Re-verify every finding against current production after mirror. |
| Employee/owner manuals | Intended user behavior | Convert into tested behavior and update only after implementation. |
| Legal documentation package | Draft legal source | Requires attorney and infrastructure verification before publication. |
| Historical Flask/Python notes | Superseded lineage | Do not apply to the current React/tRPC/Drizzle architecture. |
| Screenshots | Visual evidence only | Useful for layout/flow; cannot prove persistence, security, or backend behavior. |

## Confirmed current state

1. V2 is public even though its README labels the code private/proprietary.
2. V2 is not a complete runnable PrimeContractorOS mirror.
3. PrimeContractorOS code currently preserved in V2 consists of `drizzle/schema.ts`, `server/platformAdminRouter.ts`, and `client/src/pages/PlatformOnboarding.tsx`, plus documentation.
4. Those three files cannot be validated as a system because required project dependencies and source files are absent.
5. The Unified AI Ecosystem has a separate 67-workflow export task: 1 exported and 66 pending. Phase 5 is blocked until export, validation, manifests, status correction, and gap analysis pass.

## Historical findings requiring code re-verification

| Area | Historical finding | Verification target |
|---|---|---|
| Database | Drizzle relational queries initialized without schema in one code path. | Current `server/db.ts` and all `db.query.*` usages. |
| Inserts | Inconsistent `insertId` handling. | All create operations and target database driver return shapes. |
| Plans | Platform form fields did not match `plans` schema. | Current form input, tRPC input/output, schema, and persistence test. |
| Discounts | Platform form fields did not match `discounts` schema. | Current form/router/schema contract test. |
| Billing | UI referenced non-existent/renamed subscription fields. | Current billing view model and query. |
| Overrides | UI called procedures under the wrong router and expected wrong fields. | Current route, procedure namespace, schema, CRUD behavior. |
| Platform tasks | Nullable due date passed directly to `new Date`. | Current null-state rendering test. |
| Proposal frameworks | Procedures were historically public. | Current protected procedure and negative authorization test. |
| Navigation | Help and global AI-confirmation links were incorrect; sidebar omitted major routes. | Current route registry, sidebar, mobile nav, and automated link crawl. |
| SAM import | Success callback was a no-op. | Import result persistence, list invalidation/refetch, duplicate behavior. |
| Placeholder pages | Multiple detail/admin/system pages were stubs. | Page-by-page record load, actions, empty/error states, and linked records. |
| Secrets | Resend key was exposed twice; database URL rotation remained unconfirmed. | Environment-only code scan, provider rotation record, history remediation decision. |

## Superseded/conflicting facts

- Python/Flask/Jinja/SQLite route and schema failures describe an older build and are not actionable against the TypeScript V2 stack.
- Historical table counts (26, 80+, 95, 108) are snapshots. `drizzle/schema.ts` after the mirror is the source of truth.
- Historical pricing sets conflict. No price, trial, or grandfathering rule is authoritative until approved in the platform plan source of truth.
- Historical route naming conflicts (`/app/lessons` vs `/app/lessons-learned`, `/app/subscription` vs `/app/billing`) must be resolved through one canonical route registry with redirects where needed.
- Claims that public pages/auth/core CRUD/database are “working” are historical and require current end-to-end evidence.

## Legal and compliance hold points

Before legal/publication approval, verify:

1. Official business records and branding consistently use `Reeds Solutions LLC`.
2. Hosting locations, backup locations, encryption at rest/in transit, and deletion behavior.
3. CUI/ITAR/DFARS handling boundaries and explicit prohibition or supported scope.
4. Subprocessor inventory and data-processing agreements.
5. California privacy/CCPA requirements current at release.
6. AI provider retention/training settings and disclosure.
7. Liability, indemnity, dispute, cancellation, refund, and data-retention terms.
8. Consent versioning, record retention, and re-consent behavior.

No legal draft is represented as attorney-approved by this repository.

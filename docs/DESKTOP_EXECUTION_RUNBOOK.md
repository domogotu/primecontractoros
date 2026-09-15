# Desktop Execution Runbook

## A. Complete the n8n evidence export first

Follow `unified-ai-ecosystem/tasks/EXPORT_N8N_WORKFLOWS.md`. Keep `N8N_API_KEY` only in the terminal environment. Do not begin Unified AI Ecosystem Phase 5 until its seven-part gate passes.

## B. Build the complete PrimeContractorOS V2 mirror

Use two separate local directories. Never change or push production.

```bash
git clone https://github.com/domogotu/primecontractoros.git primecontractoros-production-reference
git clone https://github.com/domogotu/-primecontractoros-v2.git primecontractoros-v2
```

Create a V2 branch:

```bash
cd primecontractoros-v2
git switch -c agent/complete-v2-mirror
```

Before copying, inventory both trees and read root `CLAUDE.md`. Preserve these V2-only assets:

- `CLAUDE.md`
- `MIGRATION_REGISTER.md`
- `docs/`
- `unified-ai-ecosystem/`
- The already-modernized versions of `drizzle/schema.ts`, `server/platformAdminRouter.ts`, and `client/src/pages/PlatformOnboarding.tsx`

Copy production source without `.git`, dependencies, outputs, caches, local databases, uploads, `.env*`, or credentials. Reconcile overlapping files intentionally; do not overwrite the three modernized files blindly.

## C. Required baseline report

Before fixing features, produce:

- Full file inventory and production-to-V2 diff.
- Detected Node and pnpm versions from repository files.
- Dependency-install result.
- Typecheck, lint, tests, and build result.
- Database migration dry-run/staging result.
- Generated route, router, schema-table, environment-variable, integration, and job inventories.
- Secret-scan result.
- Updated migration register.

## D. Implementation prompt

> Read root CLAUDE.md, docs/AUTHORITATIVE_REQUIREMENTS_REGISTER.md, docs/SOURCE_RECONCILIATION.md, docs/V2_EXECUTION_BACKLOG.md, docs/ACCEPTANCE_TRACEABILITY_MATRIX.md, and MIGRATION_REGISTER.md. Active workstream: PrimeContractorOS only. Treat domogotu/primecontractoros as a read-only production reference and never push, branch, PR, merge, configure, or deploy it. First complete a safe full-tree mirror into this V2 branch while preserving V2-only documentation, unified-ai-ecosystem/, and the three already-modernized files through an intentional three-way reconciliation. Exclude secrets, customer data, uploads, local databases, dependencies, caches, and build outputs. Then run and record baseline install/typecheck/lint/test/build/migration checks and generate code-grounded route/schema/API/integration inventories. Update MIGRATION_REGISTER.md. Do not begin feature remediation until the complete mirror and baseline evidence are committed. Do not begin Unified AI Ecosystem Phase 5.

## E. Completion checkpoint

Return:

1. V2 branch, commit, and draft PR link.
2. Exact production commit used as the read-only baseline.
3. File counts and excluded paths.
4. Overlap decisions for the three modernized files.
5. Install/typecheck/lint/test/build/migration results.
6. Secret-scan result.
7. Generated inventories and updated migration register.
8. Every blocker with exact command/error evidence.

Only after this checkpoint passes should Gate 3 onward in `V2_EXECUTION_BACKLOG.md` begin.

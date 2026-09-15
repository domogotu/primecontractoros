# PrimeContractorOS V2 Controlled Execution Backlog

## Gate 0 - Repository safety

- [ ] Make V2 private or explicitly approve a public-safe-only policy.
- [ ] Confirm production remains read-only and no automation targets it.
- [ ] Create branch protection and required review/check rules for V2 `main`.
- [ ] Run repository and history secret scanning.
- [ ] Verify Resend and database credential rotation status without recording secret values.

Exit: repository controls documented and no exposed active secrets.

## Gate 1 - Complete development mirror (highest priority)

- [ ] Clone production locally as read-only reference.
- [ ] Clone V2 separately.
- [ ] Copy the complete production tree into a new V2 migration branch while preserving V2-only documentation and `unified-ai-ecosystem/`.
- [ ] Exclude `.git`, dependencies, build outputs, caches, local databases, uploads, `.env*`, and secrets.
- [ ] Reconcile the three already-modernized V2 files instead of overwriting them blindly.
- [ ] Produce a file inventory and production-to-V2 diff.
- [ ] Update `MIGRATION_REGISTER.md` for the full baseline.

Exit: V2 contains a complete coherent application tree and no customer data/secrets.

## Gate 2 - Baseline build and architecture verification

- [ ] Install with the lockfile-declared Node/pnpm versions.
- [ ] Run typecheck, lint, unit/integration tests, and production build.
- [ ] Inventory routes, tRPC procedures, tables, migrations, environment variables, scheduled/background jobs, external integrations, and storage paths from code.
- [ ] Record failures as baseline evidence without changing unrelated behavior.
- [ ] Create local/staging database safely and apply migrations.

Exit: reproducible baseline report with exact commands and results.

## Gate 3 - Critical security and tenancy

- [ ] Confirm every customer procedure requires authentication and workspace authorization.
- [ ] Confirm child-record access cannot cross workspaces by guessing IDs.
- [ ] Add missing finance and contract-manager role semantics; validate invited-user workflow.
- [ ] Verify platform-admin boundary, impersonation/support-access controls, reason capture, and audits.
- [ ] Remove hardcoded secret fallbacks; scan history and dependencies.
- [ ] Test file authorization, signed URL expiry, upload type/size controls, and malware-scanning strategy.
- [ ] Verify session/cookie settings, OAuth redirects, CSRF/state behavior, rate limits, and error redaction.

Exit: negative authorization tests and secret scan pass.

## Gate 4 - Schema/API/UI contract repair

- [ ] Re-verify and repair Drizzle schema initialization.
- [ ] Normalize insert/create result handling for the deployed database driver.
- [ ] Align Plans, Discounts, Billing, Overrides, Platform Tasks, and onboarding invites end to end.
- [ ] Confirm proposal-framework procedures are protected.
- [ ] Add migration checks, foreign keys/indexes, and rollback/recovery notes.
- [ ] Test idempotency for signup, Stripe webhooks, SAM imports, and AI approval actions.

Exit: schema/API/UI contract tests pass with persistence verified.

## Gate 5 - Route, page, and action completeness

- [ ] Generate canonical route registry from current code.
- [ ] Fix broken links, missing sidebar/mobile navigation, and context-free detail routes.
- [ ] Replace every customer-facing placeholder/no-op/fake response.
- [ ] Complete Contacts, Payments, Messages, Files, Invoices, AI Runs/Suggestions, Audit Log, Notifications, Users, Clients, external viewers, and other historically stubbed pages.
- [ ] For every action verify validation, API call, record mutation, audit event, refresh/navigation, empty/loading/error state, permission state, and mobile behavior.
- [ ] Add automated internal-link crawl and route smoke tests.

Exit: no visible dead actions or blank/stub pages.

## Gate 6 - Lifecycle and Carry Forward

- [ ] Complete Opportunity Intake Queue and universal SAM.gov input.
- [ ] Verify staged versus active opportunity separation and duplicate/amendment handling.
- [ ] Carry approved opportunity data into proposal with provenance.
- [ ] Promote an awarded proposal into a contract idempotently.
- [ ] Confirm governing contract/modification hierarchy and AI review queue.
- [ ] Create live requirements, obligations, deliverables, deadlines, compliance items, tasks, and alerts only after authorized approval.
- [ ] Verify active operations, evidence, subcontractor/team records, QASP, acceptance, and performance reporting.
- [ ] Verify closeout blockers, final invoice, property/evidence, lessons, loss review, and template improvement loop.

Exit: one seeded workspace completes the entire lifecycle without re-entry or broken lineage.

## Gate 7 - Finance and platform billing separation

- [ ] Keep customer contract invoices/payments separate from platform subscriptions.
- [ ] Verify invoice/payment many-to-many allocations and status history.
- [ ] Implement proper-invoice evidence/readiness based on governing source terms.
- [ ] Verify Stripe checkout, webhook signatures, replay handling, plan limits, discounts, grandfathering, activation, recovery, cancellation/refund policy, and owner revenue reporting.

Exit: contract-finance and SaaS-billing tests cannot contaminate each other.

## Gate 8 - AI and government-rule controls

- [ ] Separate Guidance AI from Source-linked Analysis AI in contracts and audit records.
- [ ] Require source location, source version, confidence/uncertainty, and review status for extracted findings.
- [ ] Test approve/edit/reject, superseding modifications, conflicts, retries, provider outage, and cost/rate controls.
- [ ] Verify current FAR/DFARS/SAM references before release; retain source version/timestamp.
- [ ] Prevent legal/compliance claims from becoming final truth automatically.

Exit: AI can fail safely and cannot silently alter governing obligations.

## Gate 9 - Legal, privacy, operations, and documentation

- [ ] Attorney review and approval of terms/privacy/refund/AUP/AI/CUI-ITAR language.
- [ ] Verify every infrastructure and subprocessor claim.
- [ ] Implement consent versioning/re-consent and deletion/export workflows.
- [ ] Update employee, owner, and user manuals from tested current behavior.
- [ ] Complete support/runbook, backup/restore, incident response, monitoring, and ownership recovery tests.

Exit: legal approvals recorded and manuals match released behavior.

## Gate 10 - Release candidate

- [ ] Typecheck, lint, unit, integration, browser E2E, accessibility, mobile, security, migration, backup/restore, and production build pass.
- [ ] Staging smoke test covers signup -> onboarding -> opportunity -> proposal -> contract -> invoice/payment -> closeout.
- [ ] No secrets, customer data, placeholders, no-op handlers, broken routes, or cross-workspace access.
- [ ] Produce release evidence and rollback plan.
- [ ] Obtain explicit owner approval before any production promotion.

Exit: V2 is eligible for a separately authorized production-promotion task.

## Separate Unified AI Ecosystem gate

No Phase 5+ implementation until all are true:

- [ ] 67/67 workflows exported.
- [ ] 67/67 parse as valid JSON and match IDs/names/node counts.
- [ ] Code nodes and connections preserved.
- [ ] Secret scan passes.
- [ ] Human and machine manifests exist.
- [ ] `BUILD_STATUS.md` is corrected from exported evidence.
- [ ] Implementation gap analysis is complete.

This gate does not authorize coupling Unified AI Ecosystem code into PrimeContractorOS.

# PrimeContractorOS V2 - Authoritative Requirements Register

Status: Active control document  
Owner: Reeds Solutions LLC  
Development repository: `domogotu/-primecontractoros-v2`  
Protected production reference: `domogotu/primecontractoros`

## 1. Authority and conflict order

When sources disagree, use this order:

1. The user's latest explicit instruction.
2. Current verified V2 and production code.
3. `CLAUDE.md` repository boundaries and engineering rules.
4. This register and `docs/MASTER_SPECIFICATION.md`.
5. Current audit evidence.
6. Older manuals, screenshots, handoffs, and build reports.

No document may prove that a feature works. A feature is complete only after current code, persistence, permissions, failure handling, and end-to-end tests all pass.

## 2. Repository and release controls

| ID | Requirement | Acceptance evidence |
|---|---|---|
| GOV-001 | Never modify `domogotu/primecontractoros` during V2 development. | No commits, branches, PRs, merges, settings changes, or deployments to production. |
| GOV-002 | All PrimeContractorOS development occurs in V2. | Changes appear only on reviewed V2 branches/PRs. |
| GOV-003 | Promote V2 only after explicit owner approval. | Signed release checkpoint plus explicit instruction. |
| GOV-004 | Preserve working behavior and the current visual system unless a change is explicitly approved or required for correctness/accessibility. | Before/after regression evidence and screenshot review. |
| GOV-005 | Never commit credentials, connection strings, private keys, tokens, or customer data. | Secret scan passes; environment-only configuration. |
| GOV-006 | V2 must become a complete runnable mirror before modernization implementation. | Full tree present; install, typecheck, tests, and build executed. |
| GOV-007 | Update `MIGRATION_REGISTER.md` for every migrated production file. | Path, classification, dependencies, verification, and commit recorded. |
| GOV-008 | Keep PrimeContractorOS and `unified-ai-ecosystem/` as separate workstreams. | No cross-folder requirements or implementation leakage. |

## 3. Product identity and system layers

PrimeContractorOS is a workspace-based government-contracting operating system owned by Reeds Solutions LLC. It serves prime contractors, subcontractors, and teams across:

`Opportunity -> Proposal -> Awarded Contract -> Active Operations -> Finance -> Closeout -> Lessons Learned`

It has three strictly separated layers:

1. Public entry: Home, Features, Pricing, Get Started, Login, Help, Glossary, Support, and legal pages.
2. Customer workspace: business operations scoped to one workspace.
3. Platform owner: customer, access, subscription, pricing, support, recovery, monitoring, and platform-business controls.

## 4. Cross-cutting non-negotiables

| ID | Requirement | Required behavior |
|---|---|---|
| SYS-001 | Workspace-first tenancy | Every customer operational read/write is scoped through an authorized workspace or a child record whose parent is scoped. |
| SYS-002 | Role enforcement | Owner, admin, member, viewer, finance, and contract-manager capabilities are explicit and least-privilege. Contractors see only assigned work; clients see only authorized client-facing records. |
| SYS-003 | Platform separation | Platform admins cannot silently operate as customers. Customer-data access requires permission, reason, confirmation where sensitive, and audit logging. |
| SYS-004 | Real persistence | No customer-facing fake records, placeholder responses, non-persistent forms, or no-op success states. |
| SYS-005 | Functional navigation | Every visible action works, is intentionally disabled with a reason, or is removed. No blank pages or dead-end routes. |
| SYS-006 | Carry Forward | Approved data preserves lineage from opportunity through proposal, contract, operations, finance, closeout, lessons, and template improvement without unnecessary re-entry. |
| SYS-007 | Auditability | Sensitive actions capture actor, workspace, action, target, before/after state or meaningful summary, reason where required, timestamp, and correlation ID. |
| SYS-008 | Failure safety | Errors do not fabricate success, leak data, or leave partial records without recovery/idempotency. |
| SYS-009 | Search and source linkage | Search combines workspace records with authorized external sources; imported/extracted facts retain source links and timestamps. |
| SYS-010 | Mobile usability | Core onboarding, navigation, review, approvals, and lifecycle actions work on mobile layouts. |

## 5. Public entry and signup

Required public routes: `/`, `/features`, `/pricing`, `/get-started`, `/login`, `/help`, `/glossary`, `/support`, `/terms`, `/privacy`, `/refund`, `/acceptable-use`, and AI disclaimer/legal hub routes as finalized.

The accepted paid signup sequence is:

`Pricing -> Choose Plan -> Checkout -> Payment Success -> Create Workspace -> Owner Membership -> Business Profile Shell -> Subscription/Access -> Onboarding State -> Initial Tasks/Alerts -> Onboarding -> Dashboard`

Signup must be resumable and idempotent. It must not create duplicate workspaces, memberships, subscriptions, or checkout consequences after refresh/retry.

Workspace creation captures legal business name, display name, business email, phone, website, primary contact, optional address, owner identity, and plan confirmation. Get Started may not bypass required plan/access selection.

Public pricing, trial, product claims, and domain links must have one approved source of truth. Conflicting historical price sets are not authoritative.

## 6. Onboarding and business readiness

Onboarding supports owner, invited user, not-ready/free-profile, and preview paths. It is mobile-friendly, saved, resumable, and routes each user to the correct first action.

It captures and validates:

- Legal identity, UEI, CAGE, SAM status and renewal date.
- NAICS, certifications, capabilities, geography, and capability-statement data.
- Prime/subcontractor/both operating model and subcontractor usage.
- Team, billing/admin contacts, preferences, and starting goal.

Missing readiness data produces explainable guidance, tasks, and alerts rather than unsupported legal conclusions.

## 7. Opportunity Intelligence and SAM.gov intake

The Opportunity Intelligence Center/SAM.gov Intake Center is the main work-starting engine.

It accepts SAM.gov detail URLs, result URLs, solicitation/notice numbers, keywords, NAICS, PSC, agency, and mixed bulk input. It searches the workspace first, then authorized SAM.gov sources. Bulk results enter a separate scrollable, filterable, selectable Intake Queue and do not clutter active Opportunities.

Each staged/imported opportunity stores a structured category profile, source references, notice/amendment relationships, duplicate checks, attachments, deadlines, contacts, set-aside, NAICS/PSC, place of performance, and analysis state.

AI creates review-first readiness, fit, risk, urgency, missing-information, partner/vendor-source, compliance-warning, and next-action suggestions with reasons and source links. Users can correct categories; decisions and outcomes inform future recommendations.

## 8. Proposal, award, and contract operations

Proposal workspaces include source-linked requirements, instructions, formatting constraints, due dates, pricing, team assignments, checklists, and versioned files. Creating a proposal carries selected opportunity data with lineage.

After award, the awarded contract and modifications govern. The system must support:

- Governing-file confirmation and modification precedence.
- AI confirmation queue with approve/reject/edit and source location.
- CLIN/SLIN data, requirements, deliverables, deadlines, obligations, compliance items, QASP, COR/CO contacts, period of performance, flowdowns, consent-to-subcontract awareness, limitations on subcontracting, subcontracting-plan awareness, SCLS/wage mapping where applicable, and risk register.
- Active-operation tasks, alerts, evidence, deliverable acceptance, invoice readiness, subcontractor records, performance reporting, and rate-parity checks.

AI never silently turns an extraction into a live obligation. Approval creates or updates live contract objects and records provenance.

## 9. Files, contacts, communications, and finance

Files, contacts, messages, tasks, and alerts link to their correct lifecycle records and workspace. Files support versions, categories, source identity, integrity metadata, and retention controls.

Contract finance and PrimeContractorOS subscription billing are separate domains. Invoices and payments are separate records with explicit allocation/linking. Proper-invoice support is contract/clause-driven and review-first. Closeout remains blocked by unresolved final invoice, payment, evidence, property, modification, or acceptance items as applicable.

Subscription payments route to the platform owner, Reeds Solutions LLC, through configured platform billing.

## 10. Platform-owner controls

Required controls include Dashboard, Workspace/Customer Summary, Plans, Discounts, Billing/Activation, Overrides, Support Inbox, Pricing History/Grandfathering, Ownership Recovery, Demo Workspaces, Platform Tasks, System Health, Integrations/API Configuration, Notifications/Email Templates, Security Alerts, Revenue/Subscription Reporting, and Launch Readiness.

Plans, discounts, billing, overrides, onboarding invites, and platform tasks must use schema-aligned contracts. Platform actions require explicit authorization and auditing.

## 11. AI operating model

Guidance AI supports setup, readiness, recommendations, tasks, reports, and template improvement. Source-linked Analysis AI supports solicitation/award/modification/clause/payment review.

All AI output is review-first, source-linked where source analysis is involved, update-aware, explainable, permission-aware, and capable of graceful degradation. The product does not claim to replace legal counsel, contracting officer direction, or final compliance review.

## 12. Government-contracting rule awareness

The product must organize, explain, and track rule-relevant data for SAM/UEI/CAGE, FAR/DFARS and solicitation clauses, NAICS/PSC, set-asides, subcontracting/team arrangements, flowdowns, awarded-contract obligations, modifications, deliverables, deadlines, evidence, proper invoices, payments, and closeout.

Rule content is versioned and source-linked. Applicability determinations remain review-first. Legal text and regulatory references must be verified against current authoritative sources before release.

## 13. Security, privacy, and legal controls

- HTTPS/TLS, protected environment secrets, encryption appropriate to the deployed services, secure storage, least privilege, audit logging, backups, and recovery testing are required.
- CUI, ITAR, DFARS, geographic hosting, encryption, retention, deletion, subprocessor, and compliance claims may not be marketed as certified facts without verified infrastructure and legal approval.
- Legal documents are drafts until attorney review and approval are recorded.
- Terms/privacy changes require date/version changes, re-consent behavior, and consent-record verification.
- The previously exposed Resend and database credentials require verified rotation/history-remediation status before production promotion.

## 14. Definition of done

A feature is done only when its page, route, API, validation, schema, workspace/role enforcement, persistence, audit behavior, background effects, failure handling, mobile/accessibility behavior, and tests pass. Documentation and migration records must match the implementation. No Phase or page is complete from screenshots, names, or generated reports alone.

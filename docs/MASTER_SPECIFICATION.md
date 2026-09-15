# PrimeContractorOS — Master Specification

> Full engineering specification. Assembled from the PrimeContractorOS Comprehensive Master Reference Document (last updated May 2026) plus current-state corrections from production audit reports. This is the authoritative technical reference — `README.md` explains the project to a new developer; `CLAUDE.md` tells Claude Code how to work on it; this document specifies exactly how the platform is supposed to function.

## 1. Executive Summary

PrimeContractorOS is a guided operating system for government contracting, built and owned by Reed's Solutions LLC. It is a complete contract-completion management system that helps prime contractors, subcontractors, and teams manage the full contracting lifecycle — from opportunity identification through proposal development, contract execution, and closeout.

**Prime directive: help contracts get completed successfully.** Every page, button, form, workflow, AI suggestion, task, alert, file, contractor/subcontractor record, invoice, payment, closeout step, and platform-owner control connects back to this goal.

The platform operates as SaaS: customers (government contractors) subscribe to workspace-based tools, while Reed's Solutions LLC retains full platform ownership. The system must be functional, not merely visual — every button has a purpose, every form saves data correctly, every workflow carries information forward, every page shows correct data.

Key differentiators: AI-powered contract analysis with human-in-the-loop approval; a rule-based guidance engine that suggests next actions without AI; a structured guidance question bank; three-layer smart search with SAM.gov/NAICS/FAR integration; a scalable contributor/subcontractor management system with performance tracking and payment oversight.

## 2. Architecture Overview

- **Owner:** Reed's Solutions LLC (Dominique Reed)
- **Repository (production):** `github.com/domogotu/primecontractoros`
- **Repository (development, authoritative):** `github.com/domogotu/-primecontractoros-v2`

### Three-Layer Architecture

| Layer | Purpose | Access |
|---|---|---|
| Layer 1 — Public Entry | Explain the product, build trust, allow workspace creation, allow contributor applications | Anyone (unauthenticated) |
| Layer 2 — Customer Workspace | Run the actual contracting operation | Authenticated workspace members |
| Layer 3 — Platform-Owner Controls | Run PrimeContractorOS as a business | Platform owner/admin only |

**Critical separation rule:** Customer workspace pages are for customer operations. Platform-owner controls are for running the platform business. These must never be mixed. Customer users cannot access platform-owner functions. Platform-owner pages cannot casually edit customer operational records without logging, reason, and permission checks.

### Technology Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 19 with TypeScript 5.9 |
| Styling | Tailwind CSS 4 with shadcn/ui (Radix primitives) |
| Routing | wouter 3.3 (client-side) |
| State/Data | TanStack React Query + tRPC client |
| Charts | Recharts 2.15 |
| Animation | Framer Motion 12 |
| Backend | Express 4 with tRPC 11 |
| ORM | Drizzle ORM 0.44 |
| Database | MySQL (better-sqlite3 fallback for development) |
| Validation | Zod 4 |
| AI | OpenAI API (gpt-4.1-mini, gemini-2.5-flash) |
| Email | Resend |
| Payments | Stripe |
| File Storage | AWS S3 with presigned URLs |
| Authentication | Manus OAuth with JWT sessions |
| PDF Generation | PDFKit |
| Build Tool | Vite 7 + esbuild |
| Testing | Vitest + Playwright |
| Package Manager | pnpm 10.4 |

The application deploys as a single Node.js process serving both the API and the static frontend bundle. Vite builds the client bundle, esbuild builds the server bundle. Production build outputs to `dist/` and starts with `node dist/index.js`.

**Current known-good status (per the most recent full-system remediation, Jun 11 2026):** 103/103 tests passing across 13 test files, 0 TypeScript errors, production build succeeds, no hardcoded `re_`/`sk-`/`ghp_` secrets in the codebase at that time. **Since then, a Resend API key has been re-exposed via `server/services/email.ts` on two further occasions (Jul 20 and Aug 5, 2026)** — see `CLAUDE.md` → Known Technical Debt for current status. As of the last direct check, both `server/_core/env.ts` and `server/services/email.ts` on production `main` read exclusively from `process.env` with no hardcoded fallback.

## 3. Route Map

### Public Routes (Layer 1)

| Route | Component | Purpose |
|---|---|---|
| `/` | Home | Public landing page |
| `/features` | Features | System coverage and capabilities |
| `/pricing` | Pricing | Plans, trial, promo logic |
| `/get-started` | GetStarted | Create workspace, first owner/admin, access path, promo code |
| `/login` | Login | Sign in, route by workspace/access/onboarding status |
| `/help` | Help | Search help content |
| `/glossary` | Glossary | Government contracting terminology |
| `/support` | Support | Submit/track support requests |
| `/about`, `/contact`, `/documentation` | — | Company info, contact form, technical docs |
| `/legal`, `/terms`, `/privacy`, `/security`, `/platform-compliance` | — | Legal information hub |
| `/404` | NotFound | 404 error page |

### Customer Workspace Routes (Layer 2) — all prefixed `/app/`, require auth + workspace membership

**Core Navigation & Setup:** `/app/dashboard`, `/app/onboarding`, `/app/business-profile`, `/app/profile`, `/app/settings`, `/app/team`, `/app/users`, `/app/billing`, `/app/notification-preferences`, `/app/export`, `/app/handbook`

**Opportunity & Proposal Pipeline:** `/app/opportunities`, `/app/opportunities/:id`, `/app/proposals`, `/app/proposals/:id`, `/app/proposals/:id/loss-review`, `/app/proposal-frameworks`

**Contract Management:** `/app/contracts`, `/app/contracts/:id`, `/app/contracts/:id/hub`, `/app/contracts/:id/ai-confirmation`, `/app/contracts/:id/closeout`, `/app/contract-hub` (global), `/app/change-management`

**AI & Analysis:** `/app/ai-contract-review`, `/app/ai-findings`, `/app/ai-runs`, `/app/ai-suggestions`, `/app/flowdown-review`

**Contract Objects:** `/app/obligations`, `/app/deliverables`, `/app/deadlines`, `/app/compliance`, `/app/requirements`, `/app/far-reference`

**Files & Documents:** `/app/files`, `/app/files/:id`, `/app/document-generation`, `/app/document-versions`

**Contacts & Communication:** `/app/contacts`, `/app/contacts/:id`, `/app/messages`, `/app/messages/:id`, `/app/communication-log`, `/app/clients`

**Finance:** `/app/invoices`, `/app/invoices/:id`, `/app/payments`, `/app/payments/:id`, `/app/finance`

**Alerts, Tasks & Reporting:** `/app/alerts`, `/app/tasks`, `/app/alerts-tasks`, `/app/notifications`, `/app/reports`, `/app/audit-log`

**Closeout & Lessons:** `/app/closeout` (global), `/app/lessons-learned`

**Templates & Capability:** `/app/capability-statements`, `/app/templates`

**Subcontractors & Vendors:** `/app/subcontractors`, `/app/vendors`, `/app/invites`

**System & Configuration:** `/app/webhooks`, `/app/email-templates`, `/app/plan-features`, `/app/consistency-check`, `/app/diagnostics`, `/app/demo-mode`, `/app/external-viewers`, `/app/customer-adoption`

### Platform Admin Routes (Layer 3)

`/platform/login`, `/platform`, `/platform/*` — provides Workspace Directory, Plans, Discounts, Billing, Support Inbox, Overrides, Pricing History/Grandfathering, Ownership Recovery, Demo Workspaces, Platform Tasks, Contributor Application Review, Contractor/Subcontractor Pool, Contributor Performance Review, Contributor Payment Oversight.

**Known route/nav gaps as of last audit** (see `CLAUDE.md` for current status): Contract Hub, AI Contract Review, Compliance Matrix, Closeout, Lessons Learned, Reports, and Alerts & Tasks all exist as routes but were missing from sidebar navigation. No dedicated Requirements or FAR/DFARS Reference page existed at audit time despite routes being planned.

## 4. Database Schema Reference

The schema is defined in `drizzle/schema.ts` using Drizzle ORM with MySQL dialect. The Master Reference document (May 2026) describes 108 tables; the Render deployment guide (Jun 2026) references 95 tables across 23 migrations; the table scoping analysis found 80+ tables with `workspaceId`. Table count has changed release to release — treat `drizzle/schema.ts` in the actual repo as the source of truth, not any single document.

### Domain groups

- **Core Identity & Access:** `users`, `workspaces`, `workspaceMembers`, `workspace_roles`, `access_states`, `loginEvents`, `onboarding_progress`, `legal_acceptances`, `consent_records`
- **Business Profile:** `business_profiles`
- **Opportunities & Proposals:** `opportunities`, `proposals`, `proposal_sections`, `proposal_frameworks`, `proposal_team_assignments`, `lossReviews`
- **Contracts & Operations:** `contracts`, `contractClins`, `contractModifications`, `keyPersonnel`, `contract_requirements`, `deliverables`, `deadlines`, `obligations`, `complianceItems`, `complianceMatrix`, `change_orders`
- **AI System:** `aiRuns`, `aiSuggestions`, `aiFindings`, `aiFindingHistory`, `ai_extracted_obligations`, `ai_prompts`, `ai_usage_logs`
- **Files & Documents:** `files`, `file_links`, `file_versions`, `document_versions`, `generated_documents`, `flowdown_reviews`
- **Contacts & Communication:** `contacts`, `contact_links`, `messages`, `followups`
- **Finance:** `invoices`, `payments`, `invoice_payment_links`, `invoice_status_history`, `finance_notes`
- **Tasks & Alerts:** `tasks`, `alerts`, `notifications`, `emailNotifications`
- **Guidance System:** `guidancePreferences`, `suggestedNextActions`, `guidanceEvents`
- **Templates & Capability:** `capabilityStatements`, `capability_statement_versions`, `templates`, `template_versions`
- **Closeout & Lessons:** `closeoutRecords`, `closeoutChecklistItems`, `closeout_blocking_items`, `lessonsLearned`
- **Subcontractors & Vendors:** `subcontractors`, `vendors`, `invites`
- **Platform Administration:** `plans`, `plan_features`, `plan_versions`, `subscriptions`, `discounts`, `discount_usage`, `platformBilling`, `billing_events`, `supportTickets`, `support_messages`, `platformOverrides`, `platformNotes`, `platformAuditLog`, `platform_activity_log`, `platform_tasks`, `platform_task_runs`, `admin_tasks`, `policy_versions`, `backup_exports`
- **System & Infrastructure:** `workspaceSettings`, `auditLog`, `audit_logs`, `record_timeline`, `record_notes`, `webhooks`, `webhook_deliveries`, `email_preferences`, `email_templates`, `workspace_health_flags`, `customer_adoption`, `system_errors`, `migrations_log`, `notes`

### Workspace scoping rules (per `table_scoping_analysis.md`, current as of audit)

- **80 tables** correctly carry `workspaceId` for tenant isolation.
- Tables **without** `workspaceId` fall into three legitimate categories, not gaps:
  1. **Platform-global reference data** — `plans`, `planFeatures`, `discounts`, `platformAuditLog`, `platformTasks`, `platformTaskRuns`, `adminTasks`, `farDfarsClauses`, `helpArticles`, `glossaryTerms`, `notificationTemplates`, `integrationTestResults`, `launchReadinessItems`, `trainingModules`, `migrationsLog`, `workspaces`, `users`, `checkoutSessions`, `policyVersions`, `planVersions`, `systemErrors`.
  2. **User-level data** (scoped by `userId`) — `loginEvents`, `legalAcceptances`, `emailPreferences`, `trainingCompletions`, `autosaveDrafts`, `recentRecords`, `consentRecords`, `discountUsage`, `backupExports`.
  3. **Record-level data** (scoped by parent record, which itself carries `workspaceId`) — e.g. `aiFindingHistory` (child of `aiFindings`), `contractClins`/`contractModifications`/`contractRequirements`/`keyPersonnel` (child of `contracts`), `complianceMatrix`/`proposalSections`/`proposalTeamAssignments` (child of `proposals`), `invoiceLineItems`/`invoiceChecklistItems`/`invoiceIssues`/`invoiceStatusHistory`/`invoicePaymentLinks` (child of `invoices`), `paymentApplications` (child of `payments`), `closeoutChecklistItems`/`closeoutBlockingItems` (child of `closeoutRecords`), `contactLinks`/`followups`/`financeNotes` (junction/child tables), `fileVersions`, `capabilityStatementVersions`, `templateVersions`, `webhookDeliveries`, `supportMessages`, `aiExtractedObligations`, plus system-wide reference tables `aiPrompts`, `guidanceQuestions`, `proposalFrameworks`, `contextualHelpItems`.

**Conclusion of that audit: no additional workspace scoping is needed.** The parent-record chain ensures tenant isolation for every table without a direct `workspaceId` column.

## 5. Server Architecture

**Entry point:** `server/_core/index.ts` — initializes Express, mounts tRPC middleware, configures static file serving for the Vite-built frontend, starts the HTTP server.

| Area | Key files |
|---|---|
| Core infra | `server/_core/index.ts`, `trpc.ts`, `context.ts`, `env.ts`, `cookies.ts` |
| Auth & OAuth | `server/_core/oauth.ts`, `types/manusTypes.ts`, `types/cookie.d.ts` |
| AI & Intelligence | `server/_core/llm.ts`, `server/aiEngine.ts`, `server/aiRouter.ts`, `server/services/guidanceEngine.ts` |
| Database | `server/db.ts`, `server/entityDb.ts` |
| Routers | `server/entityRouters.ts`, `guidanceRouter.ts`, `exportRouter.ts`, `featureRouter.ts`, `integrationsRouter.ts`, `batch1Router.ts`–`batch4Router.ts`, `allBatchRouters.ts` — plus (confirmed present in the current codebase but not in the original Master Reference) `customerSupportRouter.ts`, `efficiencyRouter.ts`, `farDfarsRouter.ts`, `guidanceQuestionRouter.ts`, `inviteRouter.ts`, `pdfRouter.ts`, `phase35Router.ts`, `platformAdminRouter.ts`, `platformBusinessRouter.ts`, `platformHealthRouter.ts`, `platformRouter.ts`, `rateParityRouter.ts` |
| Services | `server/services/billing.ts` (Stripe), `email.ts` (Resend), `fileStorage.ts` (S3), `guidanceEngine.ts`, `pdfExport.ts` (PDFKit), `webhookDispatch.ts`, `webhookRetry.ts`, `scheduledEmailScans.ts` |
| Middleware | `server/middleware/security.ts` — headers, CORS, rate limiting, input sanitization |
| Permissions | `server/permissions.ts`, `server/accessGating.ts` |

## 6. Authentication & Authorization

**OAuth flow (Manus OAuth):**
1. User clicks "Sign In" → redirected to Manus OAuth portal.
2. After auth, redirected back to `/api/oauth/callback`.
3. Server validates the OAuth token, creates/retrieves the user record.
4. JWT session cookie (`app_session_id`, one-year expiration) is set — cookie name defined as `COOKIE_NAME = "app_session_id"` in `shared/const.ts`, signed via `JWT_SECRET` using the `jose` library.
5. User routed to onboarding (first time) or dashboard (returning).

**Platform owner identification:** via `OWNER_OPEN_ID` env var matched against the user's OAuth identity. Admin access is `user.role === 'admin'` in the database; promoting a user requires updating the `role` field directly.

### Roles & Permission Matrix

| Role | Access Level |
|---|---|
| Platform Owner | Full system |
| Workspace Admin | Full workspace |
| Trusted Admin | Extended — manage records, run AI, approve findings |
| Standard User | Create/edit own records, run AI scans |
| Read Only | View shared records only |

| Permission | Platform Owner | Workspace Admin | Trusted Admin | Standard User | Read Only |
|---|---|---|---|---|---|
| View records | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create/Edit records | ✓ | ✓ | ✓ | ✓ | — |
| Delete/archive | ✓ | ✓ | ✓ | — | — |
| Upload files | ✓ | ✓ | ✓ | ✓ | — |
| Mark governing | ✓ | ✓ | ✓ | — | — |
| Run AI scans | ✓ | ✓ | ✓ | ✓ | — |
| Approve AI findings | ✓ | ✓ | ✓ | — | — |
| Create invoices | ✓ | ✓ | ✓ | — | — |
| Manage users | ✓ | ✓ | ✓ | — | — |
| Manage billing | ✓ | ✓ | — | — | — |
| Platform admin | ✓ | — | — | — | — |

**Access states:** No Access, Pending Approval, Limited Access, Training Required, Agreement Required, Assigned-Only Access, Workspace User Access, Admin Access, Platform Owner Access, Suspended, Archived.

**Error codes:** `UNAUTHED_ERR_MSG`: "Please login (10001)"; `NOT_ADMIN_ERR_MSG`: "You do not have required permission (10002)".

Enforcement in code: `protectedProcedure`/`adminProcedure` at the tRPC layer; `requireWorkspaceId` middleware for tenant isolation; `enforcePermission`/`enforceAction` in entity routers.

**Known gap (per Full-System Report audit):** `proposalFrameworksRouter.list` and `.get` were found using `publicProcedure` instead of `protectedProcedure`, exposing proposal frameworks without authentication. A later remediation report claims this was fixed by switching to `protectedProcedure` — verify current state against `server/entityRouters.ts` before relying on this being resolved.

## 7. Contracting Lifecycle

**Workflow spine:** Opportunity → Proposal → Awarded Contract → Active Operations → Closeout → Lessons Learned. This is a real, functional carry-forward chain — not just descriptive. Each stage carries information to the next, with **user control over what transfers** (the system never blindly copies everything).

**Stage 1 — Opportunity.** Fields: title, agency/buyer, solicitation/notice number, opportunity type, NAICS, PSC, set-aside type, source link, due date, status, linked files/contacts, AI fit review, tasks, alerts, notes, decision reason. Statuses: New → In Review → Pursue/Hold/No Pursue → Moved to Proposal → Archived.

**Stage 2 — Proposal.** Statuses: Draft → In Progress → Under Review → Submitted → Won/Lost/Withdrawn/No Award → Archived. Key actions: Add/Open/Edit Proposal, Add/Edit/Reorder Section, Add File/Contact, Assign Contributor, Review Readiness, Mark Submitted/Won/Lost, Convert to Contract, Open Loss Review. Carries forward from Opportunity: selected source files, contacts, notes, AI suggestions/history, tasks/alerts, opportunity context, due dates, solicitation identifiers.

**Stage 3 — Awarded Contract.** Begins only when work is actually awarded — contracts are live governed work, treated differently from proposals. Fields include contract title/number, agency/client, linked proposal/opportunity, value, start/end date, period of performance, status, governing awarded file, modification files, key contacts, assigned owner/contributors, requirements, deliverables, deadlines, compliance items, invoices, payments, closeout status, AI confirmation status, health band, open alerts/tasks. Statuses: Setup Incomplete → In Review → Active → Modification Pending Review / Finance Attention / Closeout Review → Closed → Archived. Carries forward from Proposal: selected proposal files, contacts, notes, AI history, solicitation and opportunity context.

**Stage 4 — Active Operations (Contract Hub).** The operational center for a live contract: source files/modifications, requirements tracking, deliverables (due dates + acceptance), deadlines/milestones, compliance items, tasks/alerts, contributors/subcontractors, finance (invoices/payments), closeout readiness assessment.

**Stage 5 — Closeout.** Follows FAR 4.804:

| Step | Title | FAR Reference |
|---|---|---|
| 1 | Final Invoice Submission | FAR 4.804-1 |
| 2 | Deliverables Verification | FAR 4.804-2 |
| 3 | Financial Reconciliation | FAR 4.804-3 |
| 4 | Records Disposition | FAR 4.804-4 |
| 5 | Final Release | FAR 4.804-5 |

Closeout does not mark complete unless required items are complete or skipped with a documented reason. Readiness is calculated automatically; blockers are surfaced.

**Stage 6 — Lessons Learned.** After closeout (or a loss), the system prompts capture of lessons learned, which feed back into templates, workflows, and future proposal/contract improvements.

## 8. AI System

PrimeContractorOS uses AI in two fundamentally different ways.

### AI Type 1 — Guidance AI
Purpose: setup help, page explanations, recommendations, missing-info prompts, readiness prompts, task suggestions, template improvements, reports, contributor assignment suggestions, performance insights, finance follow-up, closeout readiness suggestions. Output: **AI Suggestions** — informational workflow helpers that do not require approval and do not create official records.

### AI Type 2 — Source-Linked Analysis AI
Purpose: awarded contract confirmation, modification review, clause/obligation extraction, billing/payment term review, compliance-item extraction, deadline/deliverable/requirement extraction, comparison of proposal assumptions vs. awarded contract. Output: **AI Findings** — source-linked, review-first, update-aware data that must be approved before becoming live records.

**AI engine (`server/aiEngine.ts`)** uses OpenAI structured output (JSON mode). Each **finding** includes: `category` (requirement/deliverable/deadline/billing_term/compliance/risk/missing_info/flowdown), `title`, `sourceLocation`, `sourceExcerpt`, `plainLanguageMeaning`, `practicalMeaning`, `confidenceScore` (0.0–1.0), `riskLevel` (low/medium/high/critical). Each **obligation** includes: `obligationType`, `title`, `description`, `dueDate`, `recurrence`, `evidenceNeeded`, `suggestedOwner`.

**Core principle:** AI reads, organizes, compares, and suggests. The user reviews and approves. The app tracks the approved work.

**What AI can do:** scan documents for obligations/deadlines/requirements; generate next-step suggestions; compare contract versions; build proposal outlines and compliance matrices; identify missing information; review billing terms and payment matching.

**What AI cannot do:** make final legal conclusions; declare compliance status; override user review decisions; silently create official contract obligations; replace contracting officer direction; substitute for legal advice or human judgment.

**Finding review states:** New → Reviewed → Approved / Held / Needs Manual Review / Superseded / Stale.

**Approval rules:** only users with `approve_ai_findings` permission can approve. Approved findings can generate tasks, requirements, deliverables, deadlines, compliance items, alerts. Rejected findings are archived with reason. Held findings remain visible but create nothing. Bulk approval is available for trusted admins+. Re-scanning after modifications marks old findings "Superseded." **Unapproved AI findings must never become live contract truth.**

## 9. Guidance Engine & Question Bank

### Rule-Based Guidance Engine (no AI)
`GuidanceEngine` class (`server/services/guidanceEngine.ts`) analyzes workspace state and suggests next actions by querying record counts/states and applying rules — no LLM call. Counts opportunities, proposals, contracts, tasks, invoices, team members, files, contacts; returns prioritized `NextAction[]` (category, title, description, actionType, priority, reason, estimatedMinutes). Example rules: no opportunities → "Create Your First Opportunity" (high); opportunities without proposals → "Create a Proposal" (medium); contracts without governing files → "Upload Governing Document" (high); overdue tasks → "Review Overdue Tasks" (critical).

### The 70,000-Answer Guidance Question Bank (future system — not yet implemented)
Formula: **2,000 guidance words × 6 core question dimensions = 12,000 structured questions.** Each question receives 5 required base answer outcomes = 60,000 base answer outcomes. High-risk categories receive 10,000 additional advanced answer outcomes. **Total target: 70,000 structured answer outcomes.**

Guidance words are the system's vocabulary (examples: Authorized, Required, Funded, In Scope, Submitted, Accepted, Rejected, Overdue, Missing, Compliant, Modified, Closed, Skipped, Approved, Pending, Active, Inactive, Expired, Sensitive, Restricted).

**Six core dimensions:** WHO, WHAT, WHEN, WHERE, WHY, HOW. **Extended dimensions** for sensitive contexts: AUTHORITY, SCOPE, FUNDING, COMPLIANCE, EVIDENCE, REVIEW, RISK, CONSEQUENCE, NEXT_ACTION.

**Base answer family:** Complete/Confirmed, Incomplete/Missing, Not Applicable, Needs Review, Unknown/Unclear — each drives specific system behavior (mark complete / create task+block / allow skip with logged reason / assign reviewer / flag for clarification).

**Risk answer family:** Low, Medium, High, Critical, Risk Accepted, Risk Mitigated, Risk Resolved — each drives escalation behavior up to blocking sensitive workflow transitions and creating audit entries.

**Data model:** `guidance_words`, `guidance_questions`, `record_guidance_instances`, `record_guidance_answers`, `guidance_tasks`, `guidance_alerts`, `guidance_audit_history`.

**Operating formula:** `Guidance Word + Record Type + Page Context + Who/What/When/Where/Why/How + Authority/Scope/... = triggered question set`.

**Product rule: no guidance question should be a dead-end.** Every question must have structured answer outcomes, and every answer must cause the system to do something.

## 10. Smart Search System

**Three-layer architecture, always in this order:**

1. **Layer 1 — Local Workspace Search.** Runs first, always — checks opportunities, proposals, contracts, contract hub objects, requirements/deliverables/deadlines/compliance/modifications, AI findings/suggestions, files, contacts, companies, agencies, messages, invoices, payments, finance records, tasks, alerts, capability statements, templates, closeout records, loss reviews, lessons learned, contributor/subcontractor profiles, support requests, and platform-owner records (where permitted).
2. **Layer 2 — AI-Assisted Interpretation.** Determines whether the query is a contract number, solicitation number, notice ID, NAICS/PSC code, UEI, CAGE code, agency/company name, FAR clause, task/deadline/finance-related search, or general keyword. Returns interpreted query type, likely intent, suggested filters, related records, external sources to check, next action.
3. **Layer 3 — External Data Lookup.** SAM.gov Contract Opportunities, SAM.gov Entity Data, SAM.gov Exclusions, NAICS Reference, PSC Reference, Acquisition.gov/FAR, Agency/Buyer Reference. Fallback message when unconfigured: *"External SAM.gov lookup is not currently configured. Internal records were searched. You can add a source link manually or configure SAM.gov API access in settings."*

**Global smart search** supports text/exact/fuzzy/semantic search, AI interpretation, external lookup, saved/recent searches, role-aware results, source labels, result grouping, import/link actions, task creation. Result groups: Internal Opportunities/Contracts/Files/Contacts, SAM.gov Opportunities/Entities, NAICS Reference, FAR Reference, AI Suggested Matches. Actions: Open, Link to Existing Record, Import as Opportunity, Import Entity Data, Create Task, Save to Watchlist, Run AI Fit Review, Compare to Business Profile, Add Contact, Assign Contributor.

**SAM.gov integration:** designed to search by NAICS, set-aside type, agency, keywords, posted date, response deadline, place of performance. External data never overwrites internal records automatically — imports create draft/reviewable records. *(SAM.gov API key has been obtained; full integration is on the roadmap — see §17.)*

## 11. Billing & Subscription System

| Plan | Contracts | Proposals | Opportunities | Team Members | Price |
|---|---|---|---|---|---|
| Starter | 5 | 10 | 25 | 2 | Monthly/Annual |
| Growth | 25 | 50 | 100 | 10 | Monthly/Annual |
| Advanced | Unlimited | Unlimited | Unlimited | Unlimited | Monthly/Annual |
| Development | Unlimited | Unlimited | Unlimited | Unlimited | Free (no Stripe) |

When Stripe isn't configured (dev mode), all features unlock unlimited. When configured, workspaces without an active subscription default to Starter limits.

**Access levels:** 7-Day Trial (full access), Limited Access (core features only, unlimited duration), Starter/Growth/Advanced Plan (per-plan limits or full+priority AI/advanced reporting).

**Billing rules:** one 7-day trial per workspace; trial discount available for 30 days after trial start; Limited Access = no trial or trial discount; paid activation gives immediate full access; subscription changes take effect next billing cycle.

**Stripe integration (`server/services/billing.ts`):** `checkPlanLimit()` validates record creation against plan limits; `createCheckoutSession()` creates Stripe Checkout sessions (`mode: "subscription"`, monthly recurring). Keys configurable at platform level (`STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` env vars) or workspace level (`workspaceSettings` table).

## 12. Contributor/Subcontractor System

Separate from customer workspace users — contributors work on contracts under Reed's Solutions LLC's direction.

**Types:** Independent Contractor, Subcontractor, Teaming Partner, Employee Candidate.

**Status flow:** Applicant → Submitted → Needs More Information → In Review → Approved → Approved with Limits → Active → Trusted → Preferred → Limited → Needs Review → Suspended → Rejected → Archived.

**Public application** collects: full legal name, email, phone, business name, entity type, applying-as type, skills/services, work categories, NAICS codes, certifications/licenses, past performance, availability, service area, resume/capability statement, W-9 status, insurance status, SAM status, UEI, CAGE, conflict-of-interest disclosures, data handling acknowledgment, agreement acknowledgments, notes.

**Required agreements before real work:** Independent Contractor Agreement, Subcontractor Agreement, NDA/Confidentiality, Platform Terms of Use, Data/Privacy Acknowledgment, Government-Contracting Compliance Acknowledgment, Source-File Handling Acknowledgment, Conflict-of-Interest Disclosure, Invoice/Payment Terms Acknowledgment, Reed's Solutions Payment Clause Acknowledgment, Work Assignment Terms, Task-Specific SOW Acknowledgment.

**Standard payment clause:** *"Subcontractor will invoice Reed's Solutions, LLC monthly for approved work performed. Reed's Solutions will remit payment within thirty (30) days of receiving payment from the Government, less agreed-upon management/administrative fees."*

Access is blocked/limited if required agreements are missing.

**Work assignment statuses:** Draft → Assigned → Accepted/Declined → In Progress → Submitted for Review → Changes Requested/Approved/Rejected → Completed → Canceled → Archived.

**Performance tracking metrics:** star rating, on-time delivery rate, quality score, rework rate, communication responsiveness, compliance adherence, documentation completeness, availability reliability, task completion rate, issue escalation frequency. Feeds into: future assignment recommendations, contributor status changes, payment priority, platform-owner oversight reports.

**One-time training/walkthrough system** (page-by-page, button-by-button, role-aware, completed once unless reset). Statuses: Not Started, In Progress, Completed, Required Again/Reset, Skipped by Admin, Required Before Access.

## 13. Finance System

**Three separate financial streams — must never be mixed in one table/page:**

| Stream | Description | Managed In |
|---|---|---|
| A. Customer Subscription Billing | What customers pay PrimeContractorOS for app access | Platform-owner billing pages |
| B. Government Contract Finance | What the contractor bills/receives under a contract | Workspace finance pages |
| C. Contributor/Subcontractor Payments | What Reed's Solutions owes contributors | Contributor payment pages |

**Invoices** link to a specific contract: invoice number, contract reference, amount, date, status, support files, line items, payment matching status.

**Payments** match to one or more invoices, tracking amount, date, source, matching status (matched/partial/unmatched), reconciliation notes.

**Payment terms** (`shared/govContracting.ts`): NET_30/45/60/90, PROMPT_PAYMENT (FAR 32.905, interest accrues if delayed), MILESTONE, MONTHLY, UPON_DELIVERY.

## 14. Files, Alerts, Tasks & Reporting

**Files** stored in AWS S3, metadata in `files` table, linked to any record via `file_links`. Can be marked "governing" (the authoritative source for AI contract analysis). Re-scanning after modification marks old findings "Superseded." Missing governing files generate alerts.

**Alert triggers include:** setup incomplete, missing Business Profile data (UEI/CAGE/SAM), opportunity due soon, missing source file, incomplete proposal readiness, contract missing governing file, AI confirmation needed, modification pending review, stale AI findings, overdue deliverable/compliance item/invoice, unmatched payment, contributor work overdue/agreement missing/training incomplete, closeout blocker, waiting support request, billing/subscription issue.

**Tasks** can be created from virtually any context (alerts, AI suggestions, search results, any record type, contributor assignments). Statuses: Draft, Open, Assigned, In Progress, Waiting, Submitted, Completed, Canceled, Archived.

**Reports answer specific operational questions**, not random charts: What is healthy? At risk? Incomplete? Needs attention now? What contracts are active? Proposals due? Invoices overdue? Payments unmatched? Files missing? Closeout blockers remain? Which contributors are reliable? Which templates need improvement? Report types: executive summary, contract health, finance, tasks/alerts, files/contact coverage, contributor performance, closeout readiness, platform-owner business status.

## 15. Email, Notifications & Webhooks

Email via Resend (`server/services/email.ts`, `RESEND_API_KEY`), templates in `email_templates` table, customizable per workspace. **Never hardcode this key as a fallback — see CLAUDE.md Known Technical Debt.**

Notifications delivered via: in-app (`notifications` table), email (`emailNotifications` table via Resend), push (`server/_core/notification.ts`). User preferences via `email_preferences` table and `/app/notification-preferences`. Scheduled scans (`server/services/scheduledEmailScans.ts`) identify conditions (overdue items, upcoming deadlines) that should trigger notifications.

**Webhooks:** outbound, configured in `webhooks` table (URL, event types, signing secret, active status) via `/app/webhooks`. Dispatch via `server/services/webhookDispatch.ts`, logged in `webhook_deliveries`. Failed deliveries retried with exponential backoff (`server/services/webhookRetry.ts`).

## 16. Design System

**Color philosophy:** Primary Deep Blue `#1e40af` (trust/authority — headers, primary buttons); Accent Amber `#f59e0b` (attention/action — CTAs, warnings); Neutral slate grays (backgrounds); Green/Yellow/Red/Blue for active/pending/alert/informational status respectively.

**Typography:** Display 32px Geist bold (headlines/key metrics); Heading 24px Geist bold (sections); Subheading 18px Inter (subsections); Body 16px Inter; Caption 14px Inter (labels/helper text).

**Layout:** Public pages use asymmetric layouts with hero sections and varied feature-card arrangements. Dashboard uses sidebar nav + card-based content. Forms use clean single-column layouts with clear field grouping.

**Component defaults:** button radius 8px, card radius 12px, soft multi-layer shadows, 8px spacing base unit (8/16/24/32/40/48px).

**Animation:** page transitions fade-in 200ms; button hover scale 1.02x + shadow; card hover slight lift; loading = gentle pulse/spinner; alerts slide-in from top, fade-out on dismiss.

**Guided experience components on every lifecycle page:** `LifecycleProgress` (where the user is in the contracting lifecycle), `AIStatusPanel` (AI scan status/recent findings), `WhatsNext` (next best action), `ValidationWarnings` (missing/incomplete info highlighted).

**Accessibility:** WCAG AA minimum contrast, mobile-first responsive, overflow-x-auto wrappers on all data tables, no excessive/distracting animation.

## 17. Government Contracting Reference Data

Centralized in `shared/govContracting.ts` for dropdowns, validation, and guidance.

**Contract types:** FFP (Firm-Fixed-Price), CPFF (Cost-Plus-Fixed-Fee), CPIF (Cost-Plus-Incentive-Fee), CPAF (Cost-Plus-Award-Fee), T&M (Time-and-Materials), LH (Labor-Hour), IDIQ, BPA (Blanket Purchase Agreement), BOA (Basic Ordering Agreement).

**Set-aside types (with FAR references):** TOTAL_SB (FAR 19.5), 8A (FAR 19.8), WOSB (FAR 19.15), EDWOSB (FAR 19.15), SDVOSB (FAR 19.14), HUBZONE (FAR 19.13), SDB (FAR 19.11), UNRESTRICTED (FAR 6.1).

**NAICS codes pre-loaded:** engineering, computer programming/systems design/facilities management, IT consulting, management/HR/marketing/process/environmental/scientific-technical consulting, R&D (physical/engineering/life sciences, social sciences/humanities), construction (commercial/institutional, highway/street/bridge, electrical), facilities support, security guards/patrol.

**Modification types:** BILATERAL, UNILATERAL, ADMINISTRATIVE, OPTION_EXERCISE, CHANGE_ORDER.

**Deliverable types (CDRL references):** REPORT (A001), SOFTWARE (A002), DOCUMENTATION (A003), TRAINING (A004), DATA (A005), HARDWARE (A006), SERVICES (A007), TESTING (A008).

**Key FAR/DFARS references:** FAR Part 4 (Administrative Matters), Part 15 (Contracting by Negotiation), Part 16 (Types of Contracts), Part 19 (Small Business Programs), Part 32 (Contract Financing); DFARS Part 200 (General), Part 252 (Clauses).

**SAM.gov registration requirements:** UEI, CAGE code, business type/size, set-asides, certifications, point of contact, banking info, FAR/DFARS compliance certifications.

## 18. Environment Variables

**Required:** `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY` (for AI features), `OWNER_OPEN_ID`, `NODE_ENV`. Optional: `PORT` (default 3000/10000 depending on host).

**Service-optional:** `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`/`VITE_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`.

**Platform (Manus-issued, may expire independently):** `VITE_APP_ID`, `OAUTH_SERVER_URL`, `BUILT_IN_FORGE_API_KEY`, `BUILT_IN_FORGE_API_URL`.

**Rule, no exceptions:** none of the above may ever have a hardcoded fallback value in source. Workspace-level overrides for Stripe/Resend keys live in the `workspaceSettings` table (key-value), not in code.

## 19. Testing & Quality

Vitest for unit/integration, Playwright for end-to-end. Scripts: `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm check` (TypeScript, no emit), `pnpm test`, `pnpm format`, `pnpm db:push`, `pnpm db:seed`.

**Status varies by snapshot in time** — different reports in this project's history have recorded 92/92, 103/103, and other totals as the codebase grew. Always run `pnpm test` and `npx tsc --noEmit` yourself rather than trusting a cached number from an old report.

## 20. Future Roadmap

Features specified but not yet fully implemented as of the last full audit:

- **SAM.gov API integration** — key obtained; needs server-side calling with caching, opportunity import as drafts, entity lookup, exclusion checking.
- **Smart Search implementation** — the three-layer system (§10) needs to be built across all pages: global search bar, AI query interpretation, external lookup, result grouping, import/link actions.
- **Contributor/Subcontractor system** — full lifecycle needs implementation: public application routes (`/work-with-us`, `/contractor-apply`, `/subcontractor-apply`, `/partner-apply`), application review workflow, agreement tracking/enforcement, work assignment acceptance/review/approval flow, performance ratings, contributor payment tracking separate from contract finance.
- **Training/Walkthrough system** — one-time page-by-page role-aware training, per-user per-page progress tracking, required-before-access enforcement, reset capability.
- **70,000-answer guidance question bank** (§9) — `guidance_words` populated with 2,000+ terms, `guidance_questions` with 6+ dimensions per word, answer-outcome processing that creates tasks/alerts/blocks, per-record guidance instance tracking, full audit trail.
- **Additional platform-owner controls** — Pricing History/Grandfathering, Ownership Recovery workflow, Demo Workspace management, Contributor Application Review dashboard, Contractor/Subcontractor Pool management, Contributor Performance Review, Contributor Payment Oversight.
- **Cross-cutting integrations** — email preferences respected in scheduled scans, webhook retry heartbeat auto-scheduling, team invitation emails via Resend, full audit logging for all state changes.

See `CLAUDE.md` → Known Technical Debt for the current, code-verified list of gaps (stub pages, dead links, schema/frontend mismatches) as distinct from this forward-looking roadmap.

## Disclaimers

**AI:** AI can help identify likely issues, obligations, and missing information, but does not replace legal advice, contracting officer direction, or human review. All AI-generated findings should be verified against source documents before approval.

**Compliance:** PrimeContractorOS provides tools to help track compliance requirements but does not guarantee compliance with any specific regulation, contract clause, or government requirement. Users are responsible for verifying all compliance determinations.

**Financial:** Financial features (invoicing, payment tracking) are management tools only — not accounting advice. Users should consult qualified professionals for tax, accounting, and financial decisions.

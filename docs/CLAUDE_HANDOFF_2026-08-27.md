# PrimeContractorOS V2 Claude Handoff

Date: 2026-08-27
Prepared for: Claude / next engineering agent
Owner: Dominique Reed, Reeds Solutions LLC
Active staging repo: `domogotu/-primecontractoros-v2`
Production repo: `domogotu/primecontractoros`

## Read This First

You are taking over PrimeContractorOS v2. The immediate job is not to redesign the product from scratch. Continue the existing staging work, verify it in a real repo environment, fix remaining blockers, and only then help prepare a safe promotion path to production.

Important operating rules:

- Do not modify `domogotu/primecontractoros` unless Dominique explicitly asks you to. Treat that repository as live production.
- Use `domogotu/-primecontractoros-v2` for current fixes, staging validation, and release preparation.
- Preserve existing product direction, brand, and workflows unless a change is needed to fix a real bug or production-readiness gap.
- Do not remove large feature areas just because they are incomplete. Either finish them, clearly mark them as coming soon, or hide unsafe/unusable controls.
- Do not present the app as FedRAMP-authorized, CUI-ready, ITAR-ready, classified-ready, or a legal/accounting/contracting-officer substitute.
- AI features must remain review-first, source-linked where possible, and require human approval for consequential action.
- Keep tenant isolation, workspace boundaries, audit logging, and role permissions central to every backend change.

## Business Context

PrimeContractorOS is Dominique Reed's GovCon operations platform under Reeds Solutions LLC. The business plan is to support government contractors, especially prime contractors managing subcontractors, opportunities, proposals, awards, files, compliance tasks, invoices, payments, and operational closeout.

The product is intended to feel like an operating system for federal contracting work, not just a document repository. The main business workflow is:

1. Find or import an opportunity.
2. Qualify the opportunity.
3. Build and review a proposal.
4. Convert a won proposal into an awarded contract.
5. Manage active contract operations, subcontractors, deliverables, files, invoices, and payments.
6. Close out the contract.
7. Capture lessons learned and reusable evidence for the next bid.

The platform should support both the customer-facing SaaS experience and the platform-owner/admin business that Dominique runs behind it.

## Product Layers

PrimeContractorOS has three main layers.

### 1. Public / Entry Layer

Purpose: explain the product, route users to sign in, and create a credible commercial front door.

Expected public areas include marketing pages, login/auth, onboarding, and general product positioning. Public pages must not overpromise compliance status, government approval, legal authority, or AI autonomy.

### 2. Customer Workspace Layer

Purpose: give each customer or company a secure workspace for GovCon operations.

Core workspace concepts:

- Companies / organizations
- Workspaces
- Users and roles
- Opportunities
- Proposals
- Contracts
- Subcontractors
- Files / attachments
- Invoices / payments
- Guidance / AI review
- Tasks / closeout / lessons learned
- Audit trail and permission-aware activity

The customer workspace must enforce separation between companies and users. A user should never be able to reach another company or workspace through IDs, router gaps, query filters, or unscoped admin endpoints.

### 3. Platform Owner / Admin Layer

Purpose: let Dominique operate the SaaS business.

Important platform routes to test:

- `/platform/plans`
- `/platform/discounts`
- `/platform/billing`
- `/platform/overrides`
- `/platform/tasks`
- `/platform/support`
- `/platform/ownership-recovery`

Platform Admin has historically been a risk area because documentation said some buttons were broken or wired to stale fields. Current v2 code already has many fixes, but the screens still need runtime testing. Every visible button must either work, show a clear coming-soon/guidance message, or be removed/hidden.

## Current Tech Stack

Based on the v2 repo and handoff documents:

- Frontend: React 19, Vite, Wouter, Tailwind CSS 4, shadcn/ui style components
- Backend: Express 4, tRPC 11, TypeScript
- Database: MySQL/TiDB via Drizzle ORM
- Auth / platform integration: Manus OAuth style flow using `VITE_APP_ID` and `OAUTH_SERVER_URL`
- Tests: Vitest
- Package managers present: `pnpm-lock.yaml` and `package-lock.json`; use the repo's intended scripts carefully
- Deployment hints: `render.yaml` exists
- External services expected: OpenAI, SAM.gov API, Stripe, S3-compatible storage

## Repositories And Live Status

### Production Repo

Repository: `domogotu/primecontractoros`

Status: treat as live production. Do not push here until staging v2 passes verification and Dominique explicitly approves promotion.

### V2 / Staging Repo

Repository: `domogotu/-primecontractoros-v2`

Status: active staging/development repo. This is where the latest fixes have been applied.

Current known latest commit at handoff time:

- `c2782b9e72d4c1773a89207c53e87813dcca002a` - `Finish insert ID cleanup`

Recent fixes were committed directly to `main` in the v2 repo using GitHub file updates because local package installation was blocked in the ChatGPT environment.

## What Was Already Fixed

### 1. Drizzle Schema Initialization

Problem: `server/db.ts` initialized Drizzle without the schema object, which could break typed relational queries and table helpers.

Fix applied in v2:

- `server/db.ts` now imports `schema` from `../shared/schema`.
- `drizzle(process.env.DATABASE_URL, { schema })` is used.

Related commit:

- `7eac126` - `Fix Drizzle schema initialization`

### 2. Shared Insert ID Helper

Problem: backend create flows used inconsistent insert ID extraction patterns, including direct `result[0].insertId` and `result.insertId`. Depending on the database driver result shape, create flows could randomly fail or return `0`/undefined.

Fix applied in v2:

- `server/db.ts` now exports `getInsertId(result: unknown): number`.
- The helper supports both array-shaped results and object-shaped results.
- It throws if it cannot extract a valid insert ID, instead of silently returning a bad ID.

Important files now using the shared helper include:

- `server/entityDb.ts`
- `server/platformRouter.ts`
- `server/farDfarsRouter.ts`
- `server/integrationsRouter.ts`
- `server/platformBusinessRouter.ts`
- `server/samRouter.ts`
- `server/aiEngine.ts`
- `server/webhookRouter.ts`
- `server/services/email.ts`
- `server/services/guidanceQuestionEngine.ts`
- `server/phase35Router.ts`
- `server/routers.ts`
- `server/customerSupportRouter.ts`
- `server/financeCloseoutRouter.ts`

Related commits:

- `8224c68` - initial `entityDb.ts` safer insert handling
- `c826e9a` - added shared `getInsertId`
- commit chain ending at `c2782b9` - finished insert ID cleanup

Static recheck after fresh clone found no unsafe direct create-flow `result[0].insertId` / `result.insertId` usage left outside the shared helper and harmless tests/variable names.

### 3. Platform Tasks Due Date Crash

Problem: `client/src/pages/PlatformTasks.tsx` could send or render blank/null due dates in a way that crashed or created bad date output.

Fix applied in v2:

- Blank due dates are sent as `undefined`.
- Missing due dates render as `No due date`.

Related commit:

- `cbebf50` - `Fix platform task due date handling`

## What Still Needs To Be Done

### Immediate Step 1: Verify The Repo In A Real Environment

Run these from a fresh clone of `domogotu/-primecontractoros-v2`:

```bash
pnpm install
pnpm check
pnpm test
pnpm build
```

Goal: confirm the GitHub fixes do not create TypeScript, test, or build errors.

Important note: This could not be completed in ChatGPT's current environment because network/package access was blocked. A full install was not available, and offline install was missing cached package metadata for `@esbuild/linux-x64@0.25.10`. Treat verification as still open.

If `pnpm install` fails because of lockfile/package-manager mismatch, inspect `package.json`, `pnpm-lock.yaml`, and `package-lock.json` before changing anything. Do not casually regenerate all dependency metadata unless that is clearly the intended repo policy.

### Immediate Step 2: Runtime Test Platform Admin

The static code check suggests many older PDF-reported field mismatches are already fixed. That is not enough. Claude should run the app locally or in a safe staging deployment and manually test:

- `/platform/plans`
- `/platform/discounts`
- `/platform/billing`
- `/platform/overrides`
- `/platform/tasks`
- `/platform/support`
- `/platform/ownership-recovery`

For each page, verify:

- Page loads without auth/router/runtime crashes.
- Data queries resolve correctly.
- Create/update/delete buttons work when they appear to be real.
- Buttons that are not implemented say a clear `coming soon`, `Stripe integration required`, or similar honest message.
- No visible button silently does nothing.
- No field sends undefined/null data that crashes the API.
- Platform-only actions are protected from ordinary workspace users.

Known likely guidance-only actions in current code:

- Plan detail view appears to show a toast with plan info rather than a complete edit/detail flow.
- Override creation may direct users to workspace detail.
- Workspace detail plan change may state Stripe integration is required.
- Workspace detail ownership transfer may direct users to Ownership Recovery.

Those are acceptable only if the message is clear and the UI is not misleading.

### Immediate Step 3: Confirm Required Environment Variables

Before deploying v2 to a safe test environment, confirm these exist and are correct:

```bash
DATABASE_URL
JWT_SECRET
VITE_APP_ID
OAUTH_SERVER_URL
OPENAI_API_KEY
SAM_GOV_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
S3_BUCKET
S3_REGION
S3_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY
```

Do not print secret values into logs, tickets, commits, screenshots, or chat. Confirm presence, target environment, and whether each feature depending on it is enabled or intentionally disabled.

### Immediate Step 4: Deploy V2 To A Safe Test Environment

Do not push straight to live production. Deploy v2 separately first.

Minimum smoke test list:

- Login
- Workspace creation
- Dashboard load
- Opportunity create/import
- Proposal create
- Contract create
- File upload/download
- Invoices/payments
- Platform Admin
- AI review flow
- Billing/Stripe flow
- SAM.gov lookup/import flow
- Basic mobile/responsive check for core pages

### Immediate Step 5: Only Then Promote To Production

After v2 passes build/tests/staging smoke tests, prepare the promotion path into `domogotu/primecontractoros` or the production deployment.

Before promotion:

- Summarize all v2 commits being promoted.
- Confirm no staging-only env vars or URLs are hardcoded.
- Confirm database migrations are production-safe.
- Confirm rollback plan.
- Ask Dominique for explicit approval before touching production.

## External Services And Business Setup Still Needed

The app has feature areas that will look broken if external services are not configured. Confirm these with Dominique before calling something a code bug:

### Database

Need a valid `DATABASE_URL` for MySQL/TiDB-compatible Drizzle usage. Confirm schema migrations and seed/demo data expectations.

### Auth / OAuth

Need `VITE_APP_ID` and `OAUTH_SERVER_URL`. Verify login flow and workspace identity mapping.

### OpenAI / AI Review

Need `OPENAI_API_KEY`. AI output must stay review-first and should not pretend to be legal, accounting, contracting officer, or compliance authority.

### SAM.gov

Need `SAM_GOV_API_KEY`. Test opportunity/entity lookup/import paths.

### Stripe

Need `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`. Billing and plan-changing flows should not appear finished unless Stripe is configured and tested.

### S3-Compatible Storage

Need `S3_BUCKET`, `S3_REGION`, `S3_ACCESS_KEY_ID`, and `S3_SECRET_ACCESS_KEY`. Test upload, download, permissions, and file isolation by workspace.

### Domain / DNS

Verify the live domain and the `www` variant before final launch claims. Prior notes suggested the root domain may have worked while the `www` variant needed attention, but treat that as needing fresh verification.

## Legal, Compliance, And Evidence Boundaries

The business has legal documentation and founder/evidence concerns, but the app itself must not overclaim.

Claude should preserve these boundaries:

- Do not claim FedRAMP authorization unless it exists.
- Do not claim the app can store CUI, ITAR, classified, export-controlled, or DFARS-covered sensitive materials unless the correct authorization, controls, and hosting posture are confirmed.
- Do not make AI-generated determinations binding or autonomous.
- Do not remove disclaimers that keep AI as assistance/review.
- Preserve audit trails and human approval requirements.

Business/legal evidence still to collect or organize, based on prior planning:

- Raw chat exports and build history proving project authorship/direction
- PowerShell or terminal records from development work, if available
- Backup hashes or archive timestamps
- Apple/iCloud/App Store style receipts if relevant to app ownership evidence
- Manus or AI-tool contract terms and usage records
- Contributor assignment or contractor agreements, if anyone else contributed
- Open-source and AI-generated material inventory
- Trademark/domain/company records
- Capability statement and business profile materials
- W-9 and vendor onboarding documents if selling services to customers

This is not a substitute for legal advice. It is the evidence and readiness folder Claude should help Dominique organize.

## Business Operating Plan To Preserve

PrimeContractorOS is not only a software repo. It is part of Dominique's broader Reeds Solutions LLC plan.

The plan includes:

- A GovCon SaaS platform for primes and subcontractor management.
- Owner/operator controls for plans, discounts, billing, support, overrides, and recovery.
- A path to real customer use without overstating compliance posture.
- A safe staging-to-production release process.
- Documentation for owners, employees, legal posture, database/schema, routes/components, readiness, bugs, and master reference.
- A future path for service offerings, federal contracting readiness, and business development.

Do not collapse this into a generic SaaS. The product language, features, and workflows need to remain specifically GovCon-oriented.

## Available Reference Materials

Dominique has provided a large reference package in prior work. In the ChatGPT handoff environment these were available as uploaded/scratch files, and equivalent materials may also be present in the repo under root docs, `references/`, or uploaded archives.

Known reference documents from the handoff package:

- PrimeContractorOS Employee Guide
- PrimeContractorOS Instructions Manual
- PrimeContractorOS Owners Manual
- PrimeContractorOS Legal Documentation Package
- PrimeContractorOS Database Schema Analysis
- PrimeContractorOS Master Developer Handoff
- PrimeContractorOS Route & Component Map
- PrimeContractorOS Production Readiness Assessment
- PrimeContractorOS Bugs & Completion Gaps
- PrimeContractorOS Master Reference
- Handoff spec text
- Source zip / repo export

When uncertain, prefer source code and live repo state over old PDF claims. The PDFs are useful for finding risks, but some issues have already been fixed in v2.

## Exact Claude Start Instructions

Claude, start here:

1. Clone or open `domogotu/-primecontractoros-v2`.
2. Confirm latest `main` is at or after `c2782b9e72d4c1773a89207c53e87813dcca002a`.
3. Read this file, `CLAUDE.md`, `README.md`, `RELEASE_READINESS.md`, `RELEASE_CHECKLIST.md`, `FINAL_VERIFICATION_REPORT.md`, and `fix-notes.md`.
4. Run:

```bash
pnpm install
pnpm check
pnpm test
pnpm build
```

5. If there are failures, fix the smallest real issue first. Prioritize failures caused by the recent database/insert ID/due date changes.
6. Search for any remaining unsafe insert ID usage:

```bash
rg "result\[0\]\.insertId|result\.insertId|insertId" server
```

7. Confirm no create flow directly depends on one driver-specific insert result shape outside `getInsertId` or a wrapper calling `getInsertId`.
8. Run the app locally or deploy v2 to a safe staging environment.
9. Test all Platform Admin routes and every visible button/action.
10. Verify required environment variables exist in staging without exposing secret values.
11. Smoke test the main customer workflow from login through opportunity/proposal/contract/files/billing/AI.
12. Report exactly what passed, what failed, what was fixed, and what still needs Dominique's decision.
13. Do not promote to `domogotu/primecontractoros` until Dominique approves after staging passes.

## Current Highest Priority

The next real engineering step is verification. The insert ID cleanup is believed complete by static search, but it still needs TypeScript, test, build, and runtime validation.

Recommended next action for Claude:

```bash
git clone https://github.com/domogotu/-primecontractoros-v2.git
cd -primecontractoros-v2
pnpm install
pnpm check
pnpm test
pnpm build
```

Then fix any failures and continue with Platform Admin runtime testing.

## Short Status For Dominique

What you have now:

- A production repo that should be treated as live.
- A v2 staging repo with the database schema init fix, Platform Tasks due date fix, and backend insert ID cleanup committed.
- A broad product/business reference package.
- A clear staged release plan.
- Platform Admin pages that look closer than the old PDF suggested, but still need runtime verification.

What you still need before live promotion:

- Successful install/check/test/build in a real environment.
- Runtime Platform Admin testing.
- Staging deployment.
- Environment variables configured.
- Storage, Stripe, SAM.gov, auth, and OpenAI flows verified.
- Production rollback plan.
- Explicit approval before touching live production.


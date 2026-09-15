# PrimeContractorOS V2

**Current production codebase and controlled modernization repository for PrimeContractorOS**

PrimeContractorOS is a government-contracting operating system owned by **Reeds Solutions LLC**. It is designed to support the full contracting lifecycle from opportunity intake through proposal, award, active contract operations, finance, closeout, and lessons learned.

## Current production status

PrimeContractorOS V2 is now the codebase connected to the live Render service.

- Production application domain: `https://primecontractoros.com`
- Render fallback domain: `https://primecontractoros.onrender.com`
- Production repository: `domogotu/-primecontractoros-v2`
- Production branch: `main`
- Hosting: Render
- Database: TiDB Cloud / MySQL-compatible persistence
- ORM: Drizzle ORM
- Authentication: Manus OAuth

The older `domogotu/primecontractoros` repository remains an important historical/reference source, but it is no longer the repository currently deployed by the Render production service.

## Account and ownership model

PrimeContractorOS intentionally separates **platform ownership** from **customer/workspace administration**.

### Platform Owner

`dominiquereed35@gmail.com`

This is the canonical PrimeContractorOS Platform Owner identity. It is intended to have exclusive platform-level authority, including Platform Admin access, workspace/customer management, plans, billing controls, overrides, support administration, system health, integrations, security, ownership recovery, platform tasks, and other global owner functions.

No ordinary customer or workspace account should receive equivalent platform-owner authority.

### Reeds Solutions LLC business workspace

`reedssolutionsllc@gmail.com`

This account is intended to operate **Reeds Solutions LLC as a customer/business inside PrimeContractorOS**. It should own or administer the Reeds Solutions workspace and use the normal application for opportunities, proposals, contracts, subcontractors, vendors, files, invoices, payments, finance, closeout, and other contracting work.

It should **not** be treated as a second PrimeContractorOS Platform Owner.

Both internal accounts are intended to be usable without purchasing a customer subscription from PrimeContractorOS:

- the Platform Owner account through the platform-owner bypass;
- the Reeds Solutions LLC account through an internal-business workspace bypass.

These two bypasses must remain logically separate from platform-owner permissions.

## Current known production issue

As of the current production checkpoint, the custom domain is working and the Platform Owner can reach Platform Admin, but the Reeds Solutions LLC business account is still being shown the **Subscription Required** gate in the customer application.

Multiple access-gating patches have been deployed, including removal of the legacy workspace-owner dependency from the Reeds Solutions internal bypass. Because the subscription gate still appears, the next investigation should trace the **actual authenticated session identity and workspace mapping returned at runtime** before additional billing logic is changed.

Do not treat the current subscription screen for the internal Reeds Solutions account as evidence that the account should purchase a plan.

## Production architecture

The current application is a TypeScript system centered on:

- React
- Express
- tRPC
- Drizzle ORM
- MySQL/TiDB-compatible persistence
- Vite
- pnpm
- Vitest
- Render hosting
- Manus OAuth authentication

Render currently deploys the `main` branch of `domogotu/-primecontractoros-v2`.

## Lifecycle target

`Opportunity -> Proposal -> Awarded Contract -> Active Operations -> Finance -> Closeout -> Lessons Learned`

Core product requirements include:

- strict workspace isolation;
- role and permission enforcement;
- real persisted customer data;
- complete auditability;
- functional navigation and actions;
- no blank, fake, or dead-end customer pages;
- review-first AI with source evidence;
- approved-data carry-forward across the lifecycle;
- separate contract finance and SaaS subscription billing;
- invoices and payments as separate records;
- platform-owner controls separated from customer workspace controls;
- production behavior tied to the latest approved code.

## SAM.gov / Opportunity Engine direction

The Opportunity Intelligence Center / SAM.gov Intake flow remains a priority work-starting engine. The intended system supports URLs, notice or solicitation numbers, keywords, NAICS, PSC, agencies, and bulk mixed input; staged intake separate from active opportunities; AI readiness and risk analysis; attachment intelligence; duplicate detection; amendment tracking; and carry-forward into proposal and contract workspaces.

## Repository rules

- `domogotu/-primecontractoros-v2` is the current active development and production repository.
- Production changes should be made through controlled branches and pull requests when practical, then merged to `main` for Render deployment.
- Preserve working features and the current design unless a change is required for correct functionality.
- Never copy `.git`, dependencies, build outputs, caches, local databases, uploads, `.env*`, credentials, tokens, private connection strings, or customer data into source control.
- Never hardcode production secrets or API keys as source-code fallbacks.
- Do not weaken workspace isolation or platform-owner exclusivity to work around legacy data.
- Legacy users/workspaces should be reconciled deliberately rather than deleted blindly.
- Keep PrimeContractorOS and `unified-ai-ecosystem/` as separate workstreams unless an integration is explicitly approved.

## Required reading

Before making significant PrimeContractorOS changes, review the current versions of:

1. `CLAUDE.md`
2. `docs/AUTHORITATIVE_REQUIREMENTS_REGISTER.md`
3. `docs/SOURCE_RECONCILIATION.md`
4. `docs/V2_EXECUTION_BACKLOG.md`
5. `docs/ACCEPTANCE_TRACEABILITY_MATRIX.md`
6. `docs/MASTER_SPECIFICATION.md`
7. `MIGRATION_REGISTER.md`

Historical reports, screenshots, audit notes, and prior repositories are useful evidence, but any reported defect or requirement should be checked against the current production source and current decisions before being treated as authoritative.

## Current operational checkpoint

Completed or verified recently:

1. V2 is deployed on Render and opens through `primecontractoros.com`.
2. TiDB Cloud is connected as the MySQL-compatible production database.
3. Production migrations and application startup are succeeding on Render.
4. The custom domain is routed to Render.
5. Platform Admin access for the canonical Platform Owner has been restored.
6. Platform Owner and Reeds Solutions workspace-admin identities have been explicitly separated in the access model.
7. The Reeds Solutions internal no-subscription bypass has been added and deployed, but runtime identity/workspace resolution still requires investigation because the subscription gate remains visible.

### Next immediate technical step

Trace the authenticated runtime identity and workspace mapping used by `billing.getAccessStatus` / `evaluateAccess` for the Reeds Solutions session. Confirm the exact user ID, email, OpenID, resolved workspace ID, and access decision reason before applying another production patch.

After account/access reconciliation is stable, continue the full post-login audit of Dashboard, onboarding, Opportunities/SAM intake, Proposals, Contracts, Contract Hub, AI confirmation, Files, Contacts, Messages, Invoices, Payments, Finance, Closeout, Lessons Learned, Templates, Support, and Platform Admin controls.

## Separate Unified AI Ecosystem workstream

`unified-ai-ecosystem/` is a separate project. Its specifications, build status, workflow exports, and phase gates must not be interpreted as PrimeContractorOS application requirements unless explicitly approved as a cross-project integration.

## License

Private/proprietary — **Reeds Solutions LLC. All rights reserved.**

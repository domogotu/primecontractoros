# PrimeContractorOS Audit Gaps

## Priority 1: Placeholder pages that need full rebuilds (under 35 lines)
- Handbook.tsx (34 lines) - needs search, sections, generate/update
- DemoMode.tsx (31 lines) - placeholder
- Diagnostics.tsx (29 lines) - needs real health checks
- InvoiceDetail.tsx (26 lines) - needs full detail view
- FileDetail.tsx (26 lines) - needs full detail view with linked records
- CustomerAdoption.tsx (23 lines) - needs real adoption metrics
- ContactDetail.tsx (22 lines) - needs full detail with linked records
- PaymentDetail.tsx (20 lines) - needs full detail view
- MessageDetail.tsx (20 lines) - needs full detail view
- DocumentVersions.tsx (19 lines) - needs version history table
- AuditLog.tsx (18 lines) - needs real audit log table
- AISuggestions.tsx (18 lines) - placeholder
- AIRuns.tsx (18 lines) - placeholder
- NotificationsCenter.tsx (17 lines) - placeholder

## Priority 2: Small pages needing significant expansion (35-70 lines)
- Vendors.tsx (56 lines) - needs full CRUD, link to contracts
- EmailTemplates.tsx (52 lines) - needs real template management
- ExternalViewer.tsx (50 lines) - placeholder
- Users.tsx (49 lines) - needs invite/role management
- Clients.tsx (48 lines) - may be duplicate of Contacts
- PlanFeatures.tsx (41 lines) - needs locked feature display
- ConsistencyCheck.tsx (62 lines) - needs real consistency checks
- Subcontractors.tsx (70 lines) - needs full CRUD

## Priority 3: Pages missing PageGuide (need guided top sections)
All major pages except the 13 that already have it need PageGuide added:
- Dashboard, Opportunities, Proposals, Contracts, Finance, Files, Contacts
- Messages, Invoices, Subcontractors, Vendors, Compliance, Onboarding
- BusinessProfile, Settings, Users, Tasks, Alerts, ContractDetail
- OpportunityDetail, ProposalDetail, Templates, CapabilityStatements

## Priority 4: Missing pages/routes from spec
- /app/contracts/:id/ai-confirmation - AI Confirmation per contract (NEW)
- /app/contracts/:id/hub - Contract Hub per contract (currently global)
- /app/contracts/:id/closeout - Closeout per contract (currently global)

## Priority 5: Platform Admin pages needing expansion
- PlatformOnboarding - currently just sends email, needs monitoring dashboard
- PlatformPricingHistory (16 lines in PlatformPages) - placeholder
- PlatformOwnershipRecovery (16 lines) - placeholder
- PlatformDemoWorkspaces (16 lines) - placeholder
- PlatformTasks (23 lines) - placeholder

## Backend: All routers exist and are registered
Schema has 60+ tables covering all needed data models.

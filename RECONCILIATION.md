# PrimeContractorOS Reconciliation Notes

## Key Findings

### Schema Issues
1. `emailTemplates` table has no `workspaceId`, no `name`, no `category` columns - router tries to filter by workspaceId and insert name/category
2. `customerAdoption` table has different structure than what batch4Router expects (metricKey/metricValue vs loginCount/featuresUsed/etc)
3. `generatedDocuments` table uses `documentType` not `templateType`, has no `parameters` field
4. `businessProfileRouter` upsert accepts `samRenewalDate` but schema has `samExpirationDate` - mismatch
5. `flowdownReviews` uses `reviewStatus` not `status` in schema, and `clauseText` not `clauseContent`
6. No `clients` table exists - Clients page is purely static placeholder

### Pages Without tRPC (Static/Placeholder):
- About, Clients, ContactPage, DemoMode, Documentation, FarReference, Features, GetStarted, Glossary, Handbook, Help, Home, LegalPages, Login, NotFound, PlatformBackups, PlatformCompliance, PlatformLogin, PlatformRouter, Pricing, Privacy, Security, Support, Terms, WorkspaceExport

### Public pages (OK to be static): About, ContactPage, Features, GetStarted, Glossary, Help, Home, LegalPages, Login, NotFound, Pricing, Privacy, Security, Support, Terms

### Pages that NEED tRPC wiring:
- Clients (needs contacts-based client list or dedicated table)
- PlatformBackups (needs real backup export functionality)
- WorkspaceExport (needs real export functionality)
- Documentation/Handbook/FarReference (OK as static reference)

### Missing Features:
1. SAM.gov API integration (search opportunities, entity lookup)
2. Clients page has no backend (can use contacts with role filter)
3. AI Confirmation page uses hardcoded findings instead of real AI data
4. Business Profile router field mismatch with schema

### Backend Issues to Fix:
1. batch3Router emailTemplatesRouter uses wrong field names (name vs templateKey, body vs htmlBody)
2. batch4Router customerAdoptionRouter references non-existent columns
3. batch4Router businessProfileRouter accepts samRenewalDate but schema has samExpirationDate
4. batch4Router flowdownReviewsRouter uses `status` but schema has `reviewStatus`

## Implementation Plan
1. Fix schema mismatches in routers (align field names)
2. Add SAM.gov service
3. Wire up Clients page with contacts
4. Wire up WorkspaceExport with real export
5. Connect AI Confirmation to real aiWorkflow router
6. Fix all remaining field mismatches

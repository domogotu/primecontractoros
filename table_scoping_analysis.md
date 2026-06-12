# Table Scoping Analysis

## Tables WITH workspaceId (properly tenant-isolated): 80 tables
These tables correctly include workspaceId for tenant isolation.

## Tables WITHOUT workspaceId - Classification:

### Platform-Global (correct - no workspaceId needed):
- `plans` - subscription plan definitions (platform-wide)
- `planFeatures` - feature matrix for plans (platform-wide)
- `discounts` - discount codes (platform-wide)
- `platformAuditLog` - platform admin audit trail
- `platformTasks` - platform admin scheduled tasks
- `platformTaskRuns` - platform task execution history
- `adminTasks` - platform admin task queue
- `farDfarsClauses` - FAR/DFARS reference data (shared knowledge base)
- `helpArticles` - help content (platform-wide)
- `glossaryTerms` - glossary (platform-wide)
- `notificationTemplates` - system notification templates
- `integrationTestResults` - platform integration tests
- `launchReadinessItems` - platform launch checklist
- `trainingModules` - training content (platform-wide)
- `migrationsLog` - database migration history
- `workspaces` - workspace definitions themselves
- `users` - user accounts (linked to workspaces via workspaceMembers)
- `checkoutSessions` - Stripe checkout (linked to user)
- `policyVersions` - platform policy versions
- `planVersions` - plan version history
- `systemErrors` - system error log

### User-Level (scoped by userId, correct):
- `loginEvents` - user login history (has userId)
- `legalAcceptances` - user legal acceptances (has userId)
- `emailPreferences` - user email prefs (has userId)
- `trainingCompletions` - user training progress (has userId)
- `autosaveDrafts` - user draft saves (has userId)
- `recentRecords` - user recent records (has userId)
- `consentRecords` - user consent records (has userId)
- `discountUsage` - discount redemption (has userId)
- `backupExports` - user-initiated exports (has userId)

### Record-Level (scoped by parent record, correct):
- `aiFindingHistory` - child of aiFindings (has findingId)
- `contractClins` - child of contracts (has contractId)
- `contractModifications` - child of contracts (has contractId)
- `contractRequirements` - child of contracts (has contractId)
- `keyPersonnel` - child of contracts (has contractId)
- `complianceMatrix` - child of proposals (has proposalId)
- `proposalSections` - child of proposals (has proposalId)
- `proposalTeamAssignments` - child of proposals (has proposalId)
- `proposalFrameworks` - reference data for proposals (system-wide)
- `invoiceLineItems` - child of invoices (has invoiceId)
- `invoiceChecklistItems` - child of invoices (has invoiceId)
- `invoiceIssues` - child of invoices (has invoiceId)
- `invoiceStatusHistory` - child of invoices (has invoiceId)
- `invoicePaymentLinks` - junction table (has invoiceId + paymentId)
- `paymentApplications` - child of payments (has paymentId)
- `closeoutChecklistItems` - child of closeoutRecords (has closeoutId)
- `closeoutBlockingItems` - child of closeoutRecords (has closeoutId)
- `contactLinks` - junction table (has contactId + recordId)
- `followups` - child of records (has recordType + recordId)
- `financeNotes` - child of records (has recordType + recordId)
- `fileVersions` - child of files (has fileId)
- `capabilityStatementVersions` - child of capStatements (has statementId)
- `templateVersions` - child of templates (has templateId)
- `contextualHelpItems` - reference data (has contextKey)
- `webhookDeliveries` - child of webhooks (has webhookId)
- `supportMessages` - child of supportTickets (has ticketId)
- `aiExtractedObligations` - child of aiRuns (has runId)
- `aiPrompts` - AI prompt templates (system-wide reference)
- `guidanceQuestions` - guidance question templates (system-wide)
- `emailTemplates` - workspace email templates (has workspaceId in router enforcement)

### Needs Review (potentially needs workspace scoping):
- `opportunityImportRuns` - has workspaceId in schema ✓ (already in correct list)

## Conclusion:
All tables without workspaceId are correctly classified as either:
1. Platform-global reference data
2. User-level data (scoped by userId)
3. Record-level data (scoped by parent record which itself has workspaceId)

No additional workspace scoping is needed. The parent record chain ensures tenant isolation.

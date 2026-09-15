# PrimeContractorOS Acceptance Traceability Matrix

Use one row per page/workflow during implementation. “Present” is not a completion status.

| Capability | UI | Route/API | Persistence | Security | Background effects | Minimum acceptance test |
|---|---|---|---|---|---|---|
| Signup/workspace | Pricing/Get Started/Success | checkout, callback, create/resume | workspace, owner membership, profile shell, subscription, onboarding | identity, replay, workspace ownership | audit, tasks, alerts | Refresh/retry creates exactly one coherent workspace. |
| Onboarding | adaptive steps | onboarding read/write/complete | progress, profile, preferences | member and path authorization | readiness tasks, first-route decision | Resume on another session and finish correct path. |
| SAM intake | universal input + queue | parse/search/import/stage/activate | source, attachments, categories, relationships | workspace scope, input/URL controls | analysis, duplicates, amendments | Bulk import remains staged; selected records activate once. |
| Opportunity | list/detail/review | CRUD/status/create proposal | opportunity and source links | role/workspace | alerts, readiness, audit | Correction persists and proposal receives approved data. |
| Proposal | workspace/detail | CRUD/version/submit/award | sections, pricing, files, requirements | assignment and role checks | due alerts, audit | Submission version freezes; award promotion is idempotent. |
| Contract | detail/hub/AI review | import/confirm/modify | governing files, mods, live objects | contract manager/approval | tasks, alerts, history | Modification supersedes affected items without deleting history. |
| Subcontractors | people/team/performance | invite/assign/review | team, flowdown, consent/limits notes | assignment visibility | reminders, audit | Assigned subcontractor sees only authorized scope. |
| Files | list/detail/version | upload/download/link/version | metadata, versions, links | object and workspace authorization | scan/index/audit | Cross-workspace ID and URL access are denied. |
| Contacts/messages | list/detail/compose | CRUD/send/log | linked records, delivery state | workspace/recipient permissions | notification, follow-up | Sent/logged status is truthful and failures recoverable. |
| Invoices | list/detail/readiness | create/submit/status | invoice, support, status history | finance role | alerts, audit | Proper-invoice checklist derives from approved contract terms. |
| Payments | list/detail/allocation | create/import/match | payment and allocations | finance role | reconciliation, audit | Partial payment allocation updates balances correctly. |
| Closeout | global/contract checklist | readiness/complete/reopen | checklist, evidence, signoff | contract manager/owner | blocker alerts, lessons | Completion blocked by unresolved required items. |
| Platform plans | admin forms/list | CRUD/publish/archive | plans and limits | platform admin | pricing history/audit | UI/API/schema fields match and historical customers retain rules. |
| Platform billing | admin dashboard | Stripe/admin procedures | subscriptions/events | platform admin, webhook verification | activation/recovery/audit | Duplicate webhook cannot double-activate or double-record. |
| Platform support | inbox/detail | assign/respond/resolve | tickets/history | platform admin with controlled access | notifications/audit | Customer data access reason and action are recorded. |
| AI guidance | panels/suggestions | generate/dismiss/approve task | suggestion/history | role/workspace | task/report improvements | Provider outage leaves app usable and reports truthful state. |
| Source-linked AI | finding review | analyze/approve/edit/reject | run, finding, source, versions | permission and approval | live objects after approval | No unapproved finding becomes a contract obligation. |

## Per-page verification template

For every route record:

1. Page and canonical route.
2. User roles and workspace conditions.
3. Visible data and source query.
4. Each button/action and disabled state.
5. Input fields and validation.
6. API procedure and schema objects.
7. Created/updated/deleted/archived records.
8. Files, AI, tasks, alerts, messages, and audits triggered.
9. Redirect/refetch result and exact user-visible success state.
10. Empty, loading, permission-denied, not-found, validation, integration, and server-error states.
11. Mobile, keyboard, screen-reader, and contrast checks.
12. Automated test IDs and evidence link.

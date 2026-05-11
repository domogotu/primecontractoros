# PrimeContractorOS Phase 1 TODO

## Backend Foundation
- [x] Express server setup on port 3000
- [x] SQLite database schema with all 18 tables
- [x] JWT authentication (signup, login, token verification)
- [x] tRPC API routes for auth operations
- [x] Database query helpers

## Public Pages
- [x] Home/Landing page (/) with hero and CTAs
- [x] Features page (/features) with capability cards
- [x] Pricing page (/pricing) with plan details
- [x] Help Center page (/help)
- [x] Get Started / Signup (/get-started) - 4-step form
- [x] Login page (/login)

## Post-Login Features
- [x] AppRouter for authenticated routes
- [x] Dashboard page (/app/dashboard)
- [x] Dashboard showing workspace status, alerts, tasks
- [x] User profile display in header
- [x] Sign out functionality

## Integration & Testing
- [x] Frontend-backend integration via tRPC
- [x] Signup flow end-to-end testing
- [x] Login flow testing
- [x] Dashboard accessibility after login
- [x] Professional UI with Tailwind CSS
- [x] Responsive design

## Deployment Ready
- [x] Save checkpoint
- [x] Deploy to production
- [x] Verify live URL access


## Phase 2: Core Contracting Workflow

### Opportunities Management
- [x] Opportunities list page (/app/opportunities)
- [x] Opportunity detail page (/app/opportunities/:id)
- [x] Add/edit/delete opportunity operations
- [x] Opportunity status workflow (New → In Review → Pursue/Hold/No Pursue)

### Proposals Management
- [x] Proposal Framework Selector (/app/proposal-frameworks)
- [x] Proposals list page (/app/proposals)
- [x] Proposal workspace (/app/proposals/:id)
- [x] Proposal status workflow (Draft → In Progress → Submitted → Won/Lost)

### Contracts Management
- [x] Contracts list page (/app/contracts)
- [x] Contract overview page (/app/contracts/:id)
- [x] Contract Hub (/app/contracts/:id/hub)
- [x] Contract status and health tracking

### Workspace Navigation
- [x] Sidebar navigation for authenticated workspace
- [x] Navigation routing for all workflow pages
- [x] Active page highlighting

### Testing & Deployment
- [x] End-to-end workflow testing
- [x] Save Phase 2 checkpoint
- [x] Deploy Phase 2 to production


## Phase 7: CRUD Operations & Detail Pages

### Opportunities CRUD
- [x] Implement Drizzle-backed create/update/delete mutations with database persistence
- [x] Implement status transition mutations with workflow validation
- [x] Add/Edit Opportunity forms
- [x] Opportunity list page connected to real database queries
- [x] Opportunity Detail page with all sections
- [x] Convert to Proposal button
- [ ] Vitest coverage for opportunity CRUD operations

### Proposals CRUD
- [x] Implement Drizzle-backed create/update/delete mutations with database persistence
- [x] Implement status transition mutations with workflow validation
- [x] Add/Edit Proposal forms
- [x] Proposal list page connected to real database queries
- [x] Proposal Workspace page with all sections
- [x] Convert to Contract button
- [ ] Vitest coverage for proposal CRUD operations

### Contracts CRUD
- [x] Implement Drizzle-backed create/update/delete mutations with database persistence
- [x] Implement status transition mutations with workflow validation
- [x] Add/Edit Contract forms
- [x] Contract list page connected to real database queries
- [x] Contract Overview page with all sections
- [ ] Vitest coverage for contract CRUD operations

### Conversion Workflows
- [x] Opportunity → Proposal conversion with data carry-forward
- [x] Proposal → Contract conversion with data carry-forward

### Onboarding & User Setup
- [x] Onboarding page with 4-step setup flow
- [x] Business Profile page with company info and registration
- [x] User Profile page with personal info and preferences
- [x] Settings page with workspace and notification preferences
- [x] Subscription Summary page with plan details

### AI System Integration
- [x] AI database tables (aiRuns, aiSuggestions, aiFindings, aiFindingHistory)
- [x] AI tRPC procedures (generateGuidance, getSuggestions, dismissSuggestion, acceptSuggestion)
- [x] AIGuidancePanel reusable component
- [x] OpenAI API integration (gpt-4.1-mini model)
- [x] AI panel integrated on Dashboard
- [x] AI panels on Opportunities, Proposals, Contracts pages
- [ ] Source-linked findings implementation
- [ ] AI Confirmation Workspace page (/app/ai-confirmation)
- [ ] AI runs list with source files and finding counts
- [ ] Findings table with category, summary, source, location, confidence, status
- [ ] Finding detail view with extracted text and source reference
- [ ] Approve/Hold/Reject/Needs Manual Review actions
- [ ] Batch actions for multiple findings
- [ ] Audit trail of AI runs and finding state changes

### Platform Admin Pages
- [x] Platform owner authentication (/platform/login)
- [x] Platform admin dashboard (/platform)
- [x] Workspace Directory (/platform/workspaces)
- [x] Plans Management (/platform/plans)
- [x] Discounts & Promo Codes (/platform/discounts)
- [x] Billing & Activation (/platform/billing)
- [x] Support Inbox (/platform/support)
- [x] Owner Overrides (/platform/overrides)
- [x] Pricing History (/platform/pricing-history)
- [x] Ownership Recovery (/platform/ownership-recovery)
- [x] Demo Workspaces (/platform/demo-workspaces)
- [x] Platform sidebar navigation

### Testing & Deployment
- [ ] End-to-end CRUD testing (forms validated with tRPC integration)
- [ ] Status workflow testing (mutations connected)
- [ ] Vitest coverage for all CRUD operations
- [ ] AI system end-to-end testing
- [ ] Platform admin pages end-to-end testing
- [ ] Save Phase 7 checkpoint
- [ ] Deploy Phase 7

### UI Overhaul (Design Reference Implementation)
- [x] Top horizontal navigation (2 rows) replacing sidebar
- [x] Dark navy gradient background throughout app
- [x] Dashboard redesigned with quick-access grid and count cards
- [x] Contracts page redesigned with inline form and card grid
- [x] Created placeholder pages for all navigation items
- [x] All navigation uses wouter Link components for SPA routing
- [x] All pages tested and routing correctly
- [x] Fixed production SPA routing bug (serveStatic path)
- [x] All platform admin pages updated with dark navy design
- [x] Footer added to all pages with Reed Solutions LLC branding
- [x] Deployed to production

### Professional Page Design System (Navy/White/Silver)
- [x] Fixed broken AIConfirmationWorkspace.tsx and Support.tsx
- [x] Stable build with no TypeScript errors
- [x] Contract Hub page - reference standard with 8 sections
- [x] Dashboard redesign with welcome, stats, activity
- [x] Opportunities list and detail pages
- [x] Proposals list and detail pages
- [x] Contracts list page
- [x] Applied pattern to 30+ pages (list, detail, settings, platform)
- [x] Tested all pages with new design
- [x] Deployed design system update to production

### Remaining Work
- [ ] Vitest coverage for opportunity CRUD
- [ ] Vitest coverage for proposal CRUD
- [ ] Vitest coverage for contract CRUD
- [ ] Source-linked findings implementation
- [ ] AI Confirmation Workspace page
- [ ] End-to-end CRUD testing
- [ ] Status workflow testing
- [ ] AI system end-to-end testing
- [ ] Platform admin pages end-to-end testing

## Phase 8: Real Backend Implementation

### Database Schema Expansion
- [x] Add files table with workspace_id
- [x] Add contacts table with workspace_id
- [x] Add messages table with workspace_id
- [x] Add invoices table with workspace_id
- [x] Add payments table with workspace_id
- [x] Add tasks table with workspace_id
- [x] Add alerts table with workspace_id
- [x] Add capability_statements table with workspace_id
- [x] Add templates table with workspace_id
- [x] Add closeout_records table with workspace_id
- [x] Add lessons_learned table with workspace_id
- [x] Add loss_reviews table with workspace_id
- [x] Add deliverables table with workspace_id
- [x] Add deadlines table with workspace_id
- [x] Add obligations table with workspace_id
- [x] Add compliance_items table with workspace_id
- [x] Add notes table with workspace_id
- [x] Run database migrations

### tRPC Procedures
- [x] CRUD procedures for files
- [x] CRUD procedures for contacts
- [x] CRUD procedures for messages
- [x] CRUD procedures for invoices
- [x] CRUD procedures for payments
- [x] CRUD procedures for tasks
- [x] CRUD procedures for alerts
- [x] CRUD procedures for deliverables
- [x] CRUD procedures for deadlines
- [x] CRUD procedures for obligations
- [x] CRUD procedures for compliance_items
- [x] CRUD procedures for notes

### Forms & Data Wiring
- [ ] Wire up list pages to pull real data via tRPC
- [ ] Wire up Add/Create forms to save via tRPC
- [ ] Wire up Edit forms to update via tRPC
- [ ] Wire up Delete buttons to remove via tRPC

### Record Linking
- [ ] Link proposals to opportunities
- [ ] Link contracts to proposals
- [ ] Link files/contacts/invoices/payments to opportunities/proposals/contracts

### Workspace Separation
- [ ] All queries filter by workspace_id
- [ ] Users only see records in their workspace


## Phase 9: Complete All 22 Required Features

### Scope Clarification - First Working Version Must Include:
- [x] 1. Public pages (Home, Features, Pricing, Help, Support, Glossary)
- [x] 2. Signup/Login (real auth, password hashing, JWT)
- [x] 3. Workspace creation (auto-created on signup)
- [x] 4. Onboarding (4-step setup flow)
- [x] 5. Dashboard (with real data from workspace)
- [x] 6. Business Profile (editable, saves to DB)
- [x] 7. Users/Roles (invite users, assign roles, enforce permissions)
- [x] 8. Opportunities (full CRUD, status workflow, linked records)
- [x] 9. Proposals (full CRUD, status workflow, linked to opportunities)
- [x] 10. Contracts (full CRUD, status workflow, linked to proposals)
- [x] 11. Contract Hub (governing file, live tracking sections)
- [ ] 12. Files (upload, categorize, link to records) - wiring list page
- [ ] 13. Contacts (CRUD, link to records) - wiring list page
- [ ] 14. Messages (CRUD, link to contacts/records) - wiring list page
- [ ] 15. Invoices (CRUD, status workflow, link to contracts) - wiring list page
- [ ] 16. Payments (CRUD, status workflow, match to invoices) - wiring list page
- [ ] 17. Finance Summary (aggregated view) - create page
- [ ] 18. Alerts/Tasks (CRUD, link to records, due dates) - wiring list pages
- [ ] 19. AI Suggestions (database structure, display on pages, dismiss/convert to task)
- [ ] 20. AI Findings (database structure, review workflow: New→Reviewed→Approved/Held/Rejected)
- [x] 21. Platform-owner workspace directory (/platform/workspaces)
- [ ] 22. Plans/Discounts/Billing/Overrides/Support structure (pages, forms, database tables)

### Wire Remaining List Pages to tRPC
- [ ] Files list page with upload form
- [ ] Messages list page with create form
- [ ] Deliverables list page with create form
- [ ] Deadlines list page with create form
- [ ] Obligations list page with create form
- [ ] Compliance list page with create form
- [ ] Notes list page with create form
- [ ] Templates list page with create form
- [ ] CapabilityStatements list page with create form
- [ ] Invoices list page with status workflow
- [ ] Payments list page with status workflow
- [ ] Finance Summary page with aggregated data
- [ ] Alerts list page with severity levels
- [ ] Tasks list page with due dates and status

### Record Linking Implementation
- [ ] Link files to opportunities/proposals/contracts
- [ ] Link contacts to opportunities/proposals/contracts
- [ ] Link messages to contacts/records
- [ ] Link invoices to contracts
- [ ] Link payments to invoices
- [ ] Link tasks/alerts to records

### AI System Completion
- [ ] AI Findings review workflow (New→Reviewed→Approved/Held/Rejected)
- [ ] AI Findings create live contract objects when approved
- [ ] AI Confirmation Workspace page with findings table
- [ ] Batch actions for findings
- [ ] Audit trail for findings

### Testing & Deployment
- [ ] Vitest coverage for all CRUD operations
- [ ] End-to-end testing of all 22 features
- [ ] Save Phase 9 checkpoint
- [ ] Deploy Phase 9 to production


## Data Policy Implementation

### Default System Data (No Fake Customer Data)
- [ ] Create default platform owner account (dominiquereed35@gmail.com / admin123)
- [ ] Create default plans: Starter, Growth, Advanced
- [ ] Create default statuses for all entities (per spec)
- [ ] Create default roles: Owner Admin, Trusted Admin, Standard User, Specialized User, Read Only (customer); Platform Owner, Platform Admin, Platform Support (platform)
- [ ] Create seed data script for system initialization
- [ ] Verify no fake customer data in production workspaces

### Empty States & User Guidance
- [ ] Implement empty state on all list pages with helpful text and action buttons
- [ ] Files page empty state
- [ ] Contacts page empty state
- [ ] Messages page empty state
- [ ] Invoices page empty state
- [ ] Payments page empty state
- [ ] Tasks page empty state
- [ ] Alerts page empty state
- [ ] Deliverables page empty state
- [ ] Deadlines page empty state
- [ ] Obligations page empty state
- [ ] Compliance page empty state
- [ ] Notes page empty state
- [ ] Templates page empty state
- [ ] CapabilityStatements page empty state

### Demo Workspace Data
- [ ] Create demo workspace creation flow (/platform/demo-workspaces)
- [ ] Populate demo workspaces with sample data (opportunities, proposals, contracts, etc.)
- [ ] Mark demo workspaces as clearly identifiable
- [ ] Prevent accidental demo data in real customer workspaces


## Content Fixes (Phase 10)
- [x] Create About page with Reed Solutions LLC info
- [x] Create Contact page with accurate info (no fake phone numbers)
- [x] Create Privacy Policy page with real content
- [x] Create Terms of Service page with real content
- [x] Create Documentation page with real content
- [x] Create Compliance page (platform compliance info)
- [x] Create Security page (platform security info)
- [x] Fix Help page "Learn More" buttons to navigate to real article pages
- [x] Expand Glossary to 36 government contracting terms
- [x] Fix all footer links to point to real working pages
- [x] Fix Support page with accurate contact info
- [x] Ensure Reed Solutions LLC branding with reedssolutionsllc.org links
- [x] Remove any placeholder or nonsense content
- [x] Register all new routes in App.tsx
- [x] Verify clean compilation
- [ ] Redeploy to primecontractor-bk79t4ta.manus.space (in progress)


## Phase 11: Auth Flow, Navigation, Platform Admin

### Authentication & Onboarding
- [x] Mandatory onboarding for new users before dashboard access
- [x] Redirect new users to /app/onboarding after first login
- [x] Track onboarding completion status in database (workspaces.onboardingCompleted)
- [x] Persistent login state across all pages (Manus OAuth session cookie)

### Navigation Separation
- [x] Logged-in users see only app sidebar navigation (no public marketing nav)
- [x] Public pages show marketing navigation for visitors
- [x] AppRouter checks auth state and redirects appropriately
- [x] AppShell wraps all /app/* routes with sidebar + auth check
- [x] Home page redirects authenticated users to /app/dashboard

### Platform Admin CRUD
- [x] Workspace directory with real CRUD operations
- [x] Plans management with real CRUD operations
- [x] Discounts management with real CRUD operations
- [x] Billing management with real CRUD operations
- [x] Support inbox with real CRUD operations
- [x] Overrides with real CRUD operations
- [x] Platform admin uses Manus OAuth admin role (not localStorage)
- [x] Platform router with adminProcedure protection

### Deploy
- [ ] Save checkpoint
- [ ] Redeploy to primecontractor-bk79t4ta.manus.space


## Phase 12: Priority Gap Implementation

### 1. Dynamic Workspace Context
- [x] Fix hardcoded workspaceId=1 throughout codebase
- [x] After login, detect user's workspace from database
- [x] If user has no workspace, redirect to workspace creation
- [x] Use workspace context throughout all tRPC procedures

### 2. Wire Remaining Forms
- [x] Business Profile page saves to database via tRPC
- [x] Settings page saves to database via tRPC
- [x] User Profile page saves to database via tRPC

### 3. Record Linking (Opportunity → Proposal → Contract)
- [x] Proposals link to source opportunity
- [x] Contracts link to source proposal
- [x] Show relationships in detail pages (breadcrumbs, linked records)
- [x] Conversion workflows carry data forward

### 4. Detail Page Enhancements
- [x] Contract Detail: modifications, CLINs, key personnel, period of performance, deliverables
- [x] Opportunity Detail: NAICS, set-aside type, due date countdown, agency info
- [x] Proposal Detail: compliance matrix, team assignments, review status, submission tracking

### 5. Finance Summary
- [x] Aggregate real invoice/payment data
- [x] Show totals, outstanding, paid amounts by contract
- [x] Finance dashboard with charts/summaries

### 6. Contract Hub with Real Data
- [x] Pull real contract data instead of static structure
- [x] Show active contracts with status, upcoming deadlines, recent activity

### 7. AI Configuration
- [x] Allow user to enter OpenAI API key in Settings
- [x] If no key configured, show "AI Disabled" across all AI panels
- [x] If configured, enable AI suggestion panels

### 8. AI Findings Workflow
- [x] AI findings go into review queue
- [x] User can Confirm (becomes task/action), Reject (dismissed), Defer (review later)
- [x] Track finding history and state changes

### 9. Role-Based Access Enforcement
- [x] Enforce roles (owner, admin, member, viewer) on tRPC procedures
- [x] Viewers can't create/edit (protectedProcedure on all mutations)
- [x] Members can create but not delete (role helpers implemented)
- [x] Admins can do everything
- [x] Owners can manage users

### 10. Audit Logging
- [x] Create audit_log table
- [x] Log all create/update/delete operations
- [x] Track userId, action, entity, entityId, timestamp, changes

### 11. Soft Delete
- [x] Add deletedAt field to entity tables
- [x] Filter out deleted records by default
- [x] Soft delete (set deletedAt) instead of permanent delete

### 12. Onboarding Wizard Content
- [x] Step 1: Workspace setup (name, company info)
- [x] Step 2: Business profile basics (NAICS, certifications)
- [x] Step 3: How to track opportunities
- [x] Step 4: How the contract lifecycle works
- [x] Step 5: How to use the dashboard

### Deploy
- [x] Save checkpoint
- [x] Deploy to primecontractor-bk79t4ta.manus.space with public visibility


## Phase 13: External Integrations & Advanced Features

### 1. File Storage (S3 Integration)
- [ ] Settings page for AWS credentials (access key, secret, bucket, region)
- [ ] S3 upload/download/preview with presigned URLs
- [ ] "File Storage Not Configured" fallback when credentials missing
- [ ] Wire Files page to use S3 storage

### 2. Email Notifications
- [ ] Resend integration with configurable API key
- [ ] Welcome email on signup
- [ ] Deadline reminder emails (3 days before)
- [ ] Invoice alert emails
- [ ] Database-only fallback when email not configured
- [ ] Email templates system

### 3. Stripe Payment Processing
- [ ] Stripe integration for subscription billing
- [ ] Billing page (view plan, upgrade/downgrade, invoices)
- [ ] Platform owner manages plans and pricing
- [ ] Plan limits enforcement (Starter: 5, Growth: 25, Advanced: unlimited)
- [ ] Development mode (all unlocked) when Stripe not configured

### 4. Reports Generation
- [ ] Contract Summary Report (PDF)
- [ ] Financial Report by period (PDF)
- [ ] Proposal Win/Loss Analysis (PDF)
- [ ] Compliance Status Report (PDF)
- [ ] Reports page with generation UI

### 5. Capability Statement Builder
- [ ] Wizard/form pulling from business profile
- [ ] Sections: overview, competencies, past performance, NAICS, certs, contact
- [ ] Export as PDF

### 6. Template Library
- [ ] Pre-built templates: Proposal outline, Contract checklist, Closeout checklist, Capability Statement, Past Performance
- [ ] Browse, preview, and use templates
- [ ] Template management UI

### 7. Closeout Workflow
- [ ] Checklist-driven closeout process
- [ ] Standard items: final invoice, deliverables accepted, property returned, sub payments, final report
- [ ] Track completion percentage
- [ ] Trigger on contract status change to closeout

### 8. Lessons Learned
- [ ] Structured post-contract review form
- [ ] Fields: what went well, what didn't, recommendations, tags
- [ ] Searchable/filterable list
- [ ] Link to specific contracts

### Deploy
- [ ] Save checkpoint
- [ ] Deploy to primecontractor-bk79t4ta.manus.space with public visibility

## Phase 14: Rule-Based Guidance System

### Backend
- [x] GuidanceEngine service created (server/services/guidanceEngine.ts)
- [x] guidanceRouter.ts created with all tRPC procedures
- [x] guidanceRouter registered in appRouter (server/routers.ts)
- [x] TypeScript errors resolved (0 errors)
- [x] guidancePreferences and guidanceEvents tables in schema

### Frontend
- [x] GuidancePanel React component created (client/src/components/GuidancePanel.tsx)
- [x] GuidancePanel integrated into Dashboard page
- [x] GuidancePanel integrated into OpportunityDetail page (compact mode)
- [x] GuidancePanel integrated into ProposalDetail page (compact mode)
- [x] GuidancePanel integrated into ContractDetail page (compact mode)

### Tests
- [x] Vitest tests created for GuidanceEngine (server/guidance.test.ts)

### Deployment
- [x] Checkpoint saved
- [x] Deploy to primecontractor-bk79t4ta.manus.space (public visibility)

## URGENT: Fix Modal/Dialog Forms

- [x] Fix Dialog component to have solid white background instead of transparent
- [x] Fix Dialog overlay to have semi-transparent dark backdrop
- [x] Fix Dialog content to be centered with proper padding, border, rounded corners, shadow
- [x] Fix form fields to have clear labels, borders, and spacing
- [x] Fix close/cancel button visibility
- [x] Fix submit button styling
- [x] Verify fix applies to ALL create/edit forms across all pages
- [x] Deploy fix to primecontractor-bk79t4ta.manus.space (public)

## URGENT: Scrollable Form Modals

- [x] Fix DialogContent to have max-height (85vh) with scrollable body
- [x] Fixed header (title) at top of modal
- [x] Fixed footer (buttons) at bottom of modal
- [x] Scrollable form fields in between
- [x] Visible scrollbar indicator
- [x] Convert all 13 inline card forms to Dialog modals
- [ ] Deploy scrollable modal fix to primecontractor-bk79t4ta.manus.space (public)

## Phase 15: Platform-Owner Visibility for Signups, Users, and Login Activity

### Database Schema
- [x] Add login_events table (user_id, workspace_id, event_type, success, timestamp, ip, device, failed_count, suspicious_flag)
- [x] Add platform_notes table (workspace_id, user_id, note, created_by, created_at)
- [x] Add audit_log table (action, target_type, target_id, performed_by, reason, timestamp, metadata)
- [x] Run database migrations

### tRPC Procedures (Platform Admin Only)
- [x] platform.workspaces.list - all workspaces with owner/admin, plan, status, onboarding, billing
- [x] platform.workspaces.get - single workspace summary with users, billing, notes, audit
- [x] platform.workspaces.suspend - suspend workspace with reason (audit logged)
- [x] platform.workspaces.reactivate - reactivate workspace with reason (audit logged)
- [x] platform.users.list - all users with workspace, role, status, last login
- [x] platform.users.get - single user detail
- [x] platform.users.disable - disable user with reason (audit logged)
- [x] platform.activity.list - login events with filters
- [x] platform.notes.create - add platform note to workspace
- [x] platform.audit.list - audit log entries

### Frontend Pages
- [x] /platform/workspaces - Workspace Directory with all required columns and action buttons
- [x] /platform/workspaces/:id - Workspace Summary with users, billing, notes, audit timeline
- [x] /platform/users - Platform Users list with all required columns and action buttons
- [x] /platform/activity - Login Events / Activity page with all required columns

### Security
- [x] Platform admin role check on all platform procedures
- [x] Customer users cannot access platform routes
- [x] No passwords or secrets exposed
- [x] Login activity audit logged
- [x] Failed login attempts visible only to platform admins
- [x] Suspend/reactivate/disable require confirmation dialog and audit log reason

### Acceptance Criteria
- [x] Can log into /platform
- [x] Can open /platform/workspaces and see all signed-up workspaces
- [x] Can open /platform/users and see all registered users by workspace
- [x] Can open workspace summary with owner/admin, users, plan, onboarding, billing, activity
- [x] Can see last login and signup date
- [x] Can see failed login events for security review
- [x] Can suspend/reactivate workspace with audit log
- [x] Deploy to primecontractor-bk79t4ta.manus.space (public)

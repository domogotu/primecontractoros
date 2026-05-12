# PrimeContractorOS — Business Owner Handbook

> **Version:** 1.0 (Foundation)  
> **Last Updated:** May 2026  
> **Platform:** Reed's Solutions LLC — PrimeContractorOS

---

## 1. System Overview

PrimeContractorOS is a guided operating system for government contracting. It helps prime contractors, subcontractors, and teams manage the full contracting lifecycle — from opportunity identification through proposal, contract execution, and closeout.

### Core Modules

| Module | Purpose |
|--------|---------|
| Dashboard | Central hub showing workspace health, tasks, and AI suggestions |
| Opportunities | Track and evaluate government contracting opportunities |
| Proposals | Build, review, and submit proposals with AI assistance |
| Contracts | Manage active contracts, modifications, and compliance |
| Files | Document management with governing file designation |
| Contacts | Manage client, agency, and team contacts |
| Messages | Internal communication and collaboration |
| Finance | Invoicing, payments, and financial reporting |
| AI Findings | Review AI-extracted obligations, deadlines, and requirements |
| AI Suggestions | View AI-generated guidance and recommendations |
| AI Runs | Track all AI analysis history and usage |
| Audit Log | Full system activity trail |
| Notifications | Alerts for deadlines, compliance, and system events |

---

## 2. User Roles

| Role | Access Level | Description |
|------|-------------|-------------|
| Platform Owner | Full system | Owner of the PrimeContractorOS platform instance |
| Workspace Admin | Full workspace | Owner/admin of a specific workspace |
| Trusted Admin | Extended | Can manage records, run AI, approve findings |
| Standard User | Standard | Can create/edit own records, run AI scans |
| Read Only | View only | Can only view shared records |

### Permission Matrix

| Permission | Platform Owner | Workspace Admin | Trusted Admin | Standard User | Read Only |
|-----------|:---:|:---:|:---:|:---:|:---:|
| View records | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create records | ✓ | ✓ | ✓ | ✓ | — |
| Edit records | ✓ | ✓ | ✓ | ✓ | — |
| Delete/archive | ✓ | ✓ | ✓ | — | — |
| Upload files | ✓ | ✓ | ✓ | ✓ | — |
| Mark governing | ✓ | ✓ | ✓ | — | — |
| Run AI scans | ✓ | ✓ | ✓ | ✓ | — |
| Approve AI findings | ✓ | ✓ | ✓ | — | — |
| Create invoices | ✓ | ✓ | ✓ | — | — |
| Manage users | ✓ | ✓ | ✓ | — | — |
| Manage billing | ✓ | ✓ | — | — | — |
| Platform admin | ✓ | — | — | — | — |

---

## 3. Workflow Stages

### Contracting Lifecycle

```
Opportunity → Proposal → Award → Contract → Execution → Closeout
```

1. **Opportunity Identification** — Find and evaluate government opportunities
2. **Proposal Development** — Build compliant proposals with AI assistance
3. **Contract Award** — Receive and process contract awards
4. **Contract Execution** — Manage deliverables, compliance, and modifications
5. **Closeout** — Complete final deliverables, audits, and documentation

### AI Workflow

```
AI Scan → Findings Generated → User Review → Approve/Hold/Reject → Live Records Created
```

---

## 4. AI Rules

### Core Principle

> AI reads, organizes, compares, and suggests. The user reviews and approves. The app tracks the approved work.

### What AI Can Do

- Scan documents for obligations, deadlines, and requirements
- Generate suggestions for next steps and workflow guidance
- Compare contract versions to identify changes
- Build proposal outlines and compliance matrices
- Identify missing information and potential issues
- Review billing terms and payment matching

### What AI Cannot Do

- Make final legal conclusions
- Declare compliance status
- Override user review decisions
- Silently create official contract obligations
- Replace contracting officer direction
- Substitute for legal advice or human judgment

### AI Output Types

| Type | Purpose | Requires Approval |
|------|---------|:-:|
| Suggestions | Guidance, next steps, recommendations | No (informational) |
| Findings | Source-linked extracted data | Yes (before becoming records) |
| Obligations | Extracted contract requirements | Yes (before becoming tasks) |

### Review Statuses

| Status | Meaning |
|--------|---------|
| New | AI-generated, awaiting review |
| Reviewed | User has seen but not decided |
| Approved | User confirmed — can create live records |
| Held | Paused for later review |
| Needs Manual Review | AI flagged as uncertain |
| Superseded | Replaced by newer finding |
| Stale | Outdated — source document changed |

---

## 5. Billing & Access Rules

### Access Levels

| Level | Duration | Features |
|-------|----------|----------|
| 7-Day Trial | 7 days from workspace creation | Full access |
| Limited Access | Unlimited | Core features only |
| Starter Plan | Monthly/Annual | Full access, 1 workspace |
| Growth Plan | Monthly/Annual | Full access, multiple workspaces |
| Advanced Plan | Monthly/Annual | Full access, priority AI, advanced reporting |

### Rules

- One 7-day trial per workspace
- Trial discount available for 30 days after trial start
- Limited access means no trial or trial discount
- Paid activation gives immediate full access
- Subscription changes take effect at next billing cycle

---

## 6. Support Rules

- Support requests tracked in-app
- Response time based on plan level
- Platform owner can view all support tickets
- Users can only view their own tickets
- Status flow: Open → In Progress → Resolved → Closed

---

## 7. Contract Scan Rules

- AI scans require a governing document to be designated
- Scans extract: obligations, deadlines, deliverables, compliance items, payment terms
- All findings are tagged with source document and page/section reference
- Findings do not become official records until approved
- Re-scanning after modifications marks old findings as "Superseded"
- Users should review all findings before approval

---

## 8. Approval Rules

- Only users with `approve_ai_findings` permission can approve
- Approved findings can generate: tasks, requirements, deliverables, deadlines, compliance items, alerts
- Rejected findings are archived with reason
- Held findings remain visible but do not create records
- Bulk approval is available for trusted admins and above

---

## 9. Platform Owner Controls

The platform owner has access to:

- **Platform Admin Panel** — Manage all workspaces, users, plans, and activity
- **Global Audit Log** — View all system activity across workspaces
- **User Management** — Suspend/reactivate users, change roles
- **Workspace Management** — Edit workspace details, send onboarding emails
- **Plan Management** — Configure access plans and features
- **System Health** — Monitor errors, performance, and usage
- **AI Usage** — Track token consumption and costs across all workspaces

---

## 10. Troubleshooting

| Issue | Resolution |
|-------|-----------|
| Can't access workspace | Check if workspace is suspended or trial expired |
| AI scan not working | Verify OpenAI API key is configured in Settings |
| File upload failed | Check file size (max 25MB) and type restrictions |
| Missing permissions | Contact workspace admin to update your role |
| Stale AI findings | Re-run scan after document modifications |
| Payment failed | Check billing settings and card on file |
| 404 on admin pages | Ensure you have platform_owner role |

---

## Disclaimers

> **AI Disclaimer:** AI can help identify likely issues, obligations, and missing information, but it does not replace legal advice, contracting officer direction, or human review. All AI-generated findings should be verified against source documents before approval.

> **Compliance Disclaimer:** PrimeContractorOS provides tools to help track compliance requirements, but it does not guarantee compliance with any specific regulation, contract clause, or government requirement. Users are responsible for verifying all compliance determinations.

> **Financial Disclaimer:** Financial features (invoicing, payment tracking) are management tools only. They do not constitute accounting advice or replace professional financial services. Users should consult qualified professionals for tax, accounting, and financial decisions.

---

*This handbook will be expanded as the system evolves. For questions, contact the platform owner or submit a support request through the app.*

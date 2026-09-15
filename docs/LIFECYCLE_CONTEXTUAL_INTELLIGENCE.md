# PrimeContractorOS Lifecycle-First Contextual Intelligence

## Purpose

PrimeContractorOS must organize the user experience around the government contracting lifecycle, not around isolated tools. Dedicated pages may remain for global history, bulk management, cross-record reporting, administration, and advanced review, but capabilities that are useful while working a record must also be available directly inside that record's lifecycle workspace.

The core product rule is:

> Users work the lifecycle. PrimeContractorOS works the tools.

The system must make the user's work easier to understand, not more complicated.

## UX Non-Negotiables

1. **Keep pages calm and readable.** Do not place every tool on the screen at once.
2. **Show what matters now.** Each lifecycle workspace should answer: Where am I? What needs attention? What should I do next?
3. **Use progressive disclosure.** Advanced tools belong in tabs, expandable groups, drawers, or a clearly labeled More Tools area.
4. **Avoid duplicate mental models.** A normal user should not need to understand separate AI Runs, AI Findings, AI Suggestions, Requirements, Consistency Check, and similar infrastructure just to complete one task.
5. **Keep results in context.** Analysis performed for an opportunity, proposal, contract, invoice, file, or closeout record must remain associated with that record.
6. **Explain why.** Guidance should state what was detected, why it matters, and the recommended next action.
7. **Review-first for consequential actions.** AI may read, extract, compare, organize, monitor, and recommend. It must not silently change governing data, pursuit decisions, pricing commitments, submissions, approvals, invoices, contract acceptance, or closeout status.
8. **Mobile and desktop must remain usable.** Contextual capabilities must not create oversized pages or horizontal navigation dependence.
9. **No fake controls.** Every visible action must perform a real record-aware function or be removed/disabled until implemented.
10. **Reuse existing capabilities.** Do not rebuild existing dedicated tools as duplicate systems. Expose the same underlying services contextually.

## Three Intelligence Levels

### Level 1 — Background checks

Run automatically when relevant record data changes. Routine successful checks stay quiet. Exceptions surface only when useful.

Examples:
- missing or conflicting source information
- due-date and amendment changes
- newly added solicitation or contract files
- requirement extraction and change detection
- NAICS/PSC/set-aside consistency
- missing contacts or governing documents
- business-profile fit checks
- subcontracting/teaming considerations
- pricing/supporting-document inconsistencies
- deliverable and obligation deadlines
- invoice readiness

Display pattern:

**Record Health: Good**

18 checks completed automatically · 2 items need attention

Do not display 18 green cards.

### Level 2 — Guidance

When a user is about to make a decision or a material issue is discovered, provide concise guidance:

- what happened
- why it matters
- recommended action
- user choices

Example:

**Before you continue**

One solicitation attachment has not been analyzed and may contain additional requirements.

Recommended: Review it before starting the proposal.

Actions: Review attachment | Continue anyway

### Level 3 — Human approval

Human review is required for consequential actions including:
- Pursue / Hold / No Pursue
- accepting extracted requirements as governing
- changing contract authority or governing terms
- pricing commitments
- proposal submission
- invoice approval/submission
- contract modification acceptance
- consequential subcontractor decisions
- closeout completion

## Lifecycle Workspace Pattern

Every major lifecycle record should use the same understandable structure rather than exposing the implementation architecture.

### 1. Record Header
- title / identifier
- agency / customer
- lifecycle status
- critical deadline
- record health
- primary next action

### 2. Needs Attention
Only unresolved material exceptions. Do not show routine successful checks.

### 3. Core Work
Information and controls required for the current lifecycle stage.

### 4. Contextual Intelligence
A compact group of the highest-value actions for the current stage. Advanced actions go under More Tools.

### 5. Related Work
Files, contacts, tasks, communications, financial records, compliance records, and team resources filtered to this record.

### 6. Next Step
A single clear transition or recommended action whenever possible.

## Opportunity Workspace

The Opportunity experience is the first implementation target.

### Primary page purpose
Discover, import, understand, evaluate, and decide whether to pursue an opportunity.

### Visible high-value capabilities
- SAM.gov search/import
- source refresh / amendment awareness
- opportunity summary
- deadline and urgency
- business fit/readiness
- missing-information check
- requirement and attachment review
- pursue / hold / no-pursue decision
- team/subcontractor considerations
- proposal readiness / Create Proposal

### Contextual intelligence actions
Keep the visible set small. Recommended primary actions:

1. **Analyze Opportunity**
   - analyze current opportunity and attached/source documents
   - extract requirements, dates, contacts, set-aside, NAICS/PSC, place of performance, major risks
   - save results to the opportunity

2. **Check What Is Missing**
   - check source completeness, required files, critical decision information
   - return specific missing items, not a duplicate generic opportunity review

3. **Assess Fit & Risk**
   - compare against Business Profile, capabilities, geography, socio-economic status, operating model, teaming needs, timing, and known constraints
   - explain why each material fit/risk factor matters

4. **Recommend Decision**
   - produce Pursue / Hold / No Pursue recommendation with rationale and confidence
   - recommendation never changes the actual user decision

Advanced/global AI history may remain available through AI Findings / AI Suggestions / AI Runs, but users should not be forced to leave the Opportunity record to understand or act on its intelligence.

### Background opportunity checks
Automatically re-run relevant checks when:
- opportunity is imported
- source data is refreshed
- an attachment is added or replaced
- an amendment is detected
- due date changes
- user changes pursuit status
- business profile materially changes
- subcontractor/partner information changes

### Opportunity page cleanliness
Do not stack separate full-size cards for lifecycle progress, AI status, What's Next, guidance questions, training, SAM import, warnings, and every other helper before the actual opportunity list/work area.

Use a compact hierarchy:

1. Pipeline header + summary
2. Needs Attention (only when needed)
3. Find / Import Opportunity
4. Opportunity list
5. Secondary guidance in collapsible/help areas

Training and explanatory material should not permanently push the work below the fold after the user understands the page.

## Proposal Workspace

Carry forward approved opportunity data, source documents, requirements, deadlines, contacts, findings, risks, and pursuit rationale.

Contextual capabilities:
- proposal outline
- compliance matrix
- requirement coverage
- pricing workspace
- source evidence links
- writing assistance
- consistency check
- formatting/instruction validation
- submission readiness

Background checks:
- uncovered requirements
- amendment changes
- inconsistent pricing
- missing proposal sections
- due-date risk
- unsupported claims / missing evidence

## Awarded Contract / Operations Workspace

After award, the awarded contract and modifications become governing authority. Pre-award assumptions must not silently override awarded terms.

Contextual capabilities:
- governing-document review
- obligations and deliverables
- QASP/performance requirements
- FAR/DFARS and flowdowns
- limitations on subcontracting
- SCLS/wage mapping when applicable
- subcontractor/vendor management
- tasks/deadlines
- changes/modifications
- evidence/files
- invoice readiness
- performance reporting

Background checks:
- new modification impact
- overdue obligations/deliverables
- rate mismatches
- missing evidence
- flowdown/compliance gaps
- invoice-support gaps

## Invoice / Payment Workspace

Automatically use relevant contract terms, accepted deliverables, rates, supporting evidence, invoicing instructions, prior invoices, and payments.

Contextual capabilities:
- billing-term check
- supporting-document completeness
- rate/amount consistency
- duplicate/overlap checks
- invoice readiness
- payment matching

Invoice and Payment remain separate records.

## Closeout / Lessons Learned

Contextual capabilities:
- closeout readiness
- final invoice check
- outstanding deliverables/obligations
- property/document disposition
- unresolved changes/claims
- final evidence collection
- lessons learned capture

Approved lessons should improve future templates, opportunity reviews, proposal work, and operating guidance without automatically rewriting governing records.

## Dedicated Page Role

Dedicated pages remain useful for:
- cross-record AI Findings
- AI run history
- global suggestions queue
- global compliance/reference tools
- all-workspace task views
- all-workspace files and contacts
- bulk management
- reporting
- administration
- diagnostics

They are not mandatory detours for performing record-specific work.

## Implementation Rule for Reusable Actions

A contextual action must receive the current record ID and operate on that record's data. Its output must be persisted with appropriate workspace/record scoping. A button with a specialized label may not simply call the same generic mutation unless the backend explicitly accepts an action type and produces action-specific behavior/output.

Current example to correct: Opportunity AI actions such as opportunity review, missing-source check, and decision recommendation must become semantically distinct operations rather than differently labeled buttons that all perform the same generic review.

## Rollout Order

1. Opportunity list + Opportunity detail
2. Proposal workspace
3. Contract / Contract Hub / Operations
4. Invoice + Payment
5. Closeout + Lessons Learned
6. Global page/sidebar cleanup after contextual coverage is verified

Do not remove dedicated pages prematurely. First prove that their useful capabilities are available contextually and functioning.

## Acceptance Standard

A lifecycle page is not complete until a user can:
- understand the page without training
- see the most important current status quickly
- know the next useful action
- access relevant tools without leaving the record
- understand why guidance is being shown
- review AI/background findings without being overwhelmed
- move to the next lifecycle stage with approved data carrying forward
- use the page successfully on mobile and desktop

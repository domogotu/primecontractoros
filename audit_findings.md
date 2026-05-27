# UI Audit Findings

## Issue 1: TopNavigation.tsx - Dead link to /app/help
- File: client/src/components/TopNavigation.tsx:40
- Problem: Link to '/app/help' - route does not exist in App.tsx
- Fix: Change to '/help' (which exists)

## Issue 2: TopNavigation.tsx - Dead link to /app/ai-confirmation  
- File: client/src/components/TopNavigation.tsx:37
- Problem: Link to '/app/ai-confirmation' - this route is actually '/app/contracts/:id/ai-confirmation' (requires contract ID)
- Fix: Remove this nav item or link to a valid page

## Issue 3: Opportunities.tsx - Empty onImportSuccess handler
- File: client/src/pages/Opportunities.tsx:279
- Problem: `<SamImportPanel onImportSuccess={() => {}} />` - should refetch opportunities list
- Fix: Pass a refetch function

## Issue 4: ComponentShowcase.tsx - href="#" links
- File: client/src/pages/ComponentShowcase.tsx:742, 752, 765
- Problem: href="#" links (dead links in breadcrumb showcase)
- Fix: These are in a component showcase page, acceptable but should note they're examples

## Issue 5: ComponentShowcase.tsx - href="/components" breadcrumb
- File: client/src/pages/ComponentShowcase.tsx:854
- Problem: Link to '/components' - route does not exist
- Fix: This is a showcase page, not user-facing. Low priority.

## Still need to check:
- All page buttons systematically
- tRPC procedure existence verification

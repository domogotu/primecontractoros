# Fix Notes: Schema vs Frontend Mismatches

## Router Structure
- `trpc.platformAdmin.*` → server/platformAdminRouter.ts
- `trpc.platform.*` → server/platformRouter.ts (has support.list, support.get, support.update, support.create, overrides.list/create/update/delete)
- `trpc.platformBusiness.*` → server/platformBusinessRouter.ts (has planVersions, discountUsage, billingEvents, consentRecords, backupExports, platformTasks, policyVersions)

## PlatformPages.tsx Issues

### Plans (line ~11-234)
- Frontend sends `internalCode`, `setupFee`, `trialAllowed`, `discountAllowed`, `maxOpportunities`, `maxProposals`, `storageGb`, `aiScanLimit`, `supportLevel`, `exportAccess`, `reportingLevel` — NONE of these exist in the plans table
- Plans table has: id, name, description, monthlyPrice(decimal→string), annualPrice(decimal→string), features(text), maxUsers, maxContracts, isActive, sortOrder, createdAt, updatedAt
- Backend router tries `db.query.plans.findMany()` but db.query is not available (no schema passed to drizzle)
- Backend insert uses `...input` spread which includes fields not in schema
- monthlyPrice is decimal (string), frontend sends number

### Discounts (line ~236-433)
- Frontend sends `discountType`, `value`, `name`, `appliesToAllPlans`, `newCustomersOnly`, `usageLimit`, `startDate`, `expirationDate` — NONE match schema
- Discounts table has: id, code, description, percentOff(int), amountOff(decimal), maxUses, currentUses, applicablePlanId, isActive, expiresAt, createdAt, updatedAt
- Backend router tries `db.query.discounts.findMany()` but db.query is not available
- Frontend shows `discount.discountType`, `discount.value`, `discount.name`, `discount.expirationDate` — none exist

### Billing (line ~435-574)
- Frontend references `b.billingStatus` — doesn't exist, field is `status`
- Frontend references `b.planName` — doesn't exist
- Frontend references `b.trialEndDate` — should be `trialEndsAt`
- Frontend references `b.renewalDate` — doesn't exist, closest is `currentPeriodEnd`

### Overrides (line ~577-676)
- Frontend uses `trpc.platformAdmin.overrides.list` — but overrides router only has mutations (resetOnboarding, changePlan, transferOwnership, resetTrial), NO list/delete
- The `platform.overrides` router (platformRouter.ts) has list/create/update/delete
- Frontend references `o.overrideType` — schema has `feature`
- Frontend references `o.oldValue`, `o.newValue` — schema has `value`

### PlatformTasks.tsx
- `new Date(t.dueDate)` — dueDate is `Date | null`, need null check

## Placeholder Pages to Build
1. PlatformSupport — use `trpc.platform.support.list/get/update`
2. PlatformPricingHistory — use `trpc.platformBusiness.planVersions.list` + `trpc.platformBusiness.billingEvents.list`
3. PlatformOwnershipRecovery — use `trpc.platformAdmin.overrides.transferOwnership` + workspace lookup

## Backend Fixes Needed
1. Plans router: use `db.select().from(plans)` instead of `db.query.plans.findMany()`
2. Discounts router: use `db.select().from(discounts)` instead of `db.query.discounts.findMany()`
3. Plans create: fix input schema to match actual table fields, convert monthlyPrice to string
4. Discounts create: fix input schema to match actual table fields
5. All `insertId` references: use `(result as any)[0]?.insertId` or just remove
6. Overrides: frontend needs to use `trpc.platform.overrides` not `trpc.platformAdmin.overrides`

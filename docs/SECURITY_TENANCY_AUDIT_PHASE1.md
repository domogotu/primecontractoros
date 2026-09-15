# Phase 1 Security / Tenancy Static Audit

This is a candidate inventory generated from the current modernization branch. A match is not automatically a defect; each candidate must be traced to its schema and parent ownership before remediation.

## Known child-record helper call sites

| File | Line | Helper | Arguments |
|---|---:|---|---|
| `server/entityRouters.ts` | 271 | `getInvoiceStatusHistory` | `input.invoiceId)` |
| `server/entityRouters.ts` | 278 | `getPaymentLinksForInvoice` | `input.invoiceId)` |
| `server/entityRouters.ts` | 936 | `getContactLinksForRecord` | `wsId, input.linkedRecordType, input.linkedRecordId)` |
| `server/entityRouters.ts` | 977 | `listFileVersions` | `input.fileId, wsId)` |
| `server/entityRouters.ts` | 944 | `createContactLink` | `{ workspaceId: wsId, contactId: input.contactId, recordType: input.linkedRecordType, recordId: input.linkedRecordId, role: input.role })` |
| `server/entityRouters.ts` | 287 | `linkPaymentToInvoice` | `input)` |
| `server/entityDb.ts` | 523 | `getInvoiceStatusHistory` | `invoiceId: number) {` |
| `server/entityDb.ts` | 507 | `getPaymentLinksForInvoice` | `invoiceId: number) {` |
| `server/entityDb.ts` | 539 | `getContactLinksForRecord` | `workspaceId: number, recordType: string, recordId: number) {` |
| `server/entityDb.ts` | 630 | `listFileVersions` | `fileId: number, workspaceId: number) {` |
| `server/entityDb.ts` | 531 | `createContactLink` | `data: { workspaceId: number` |
| `server/entityDb.ts` | 499 | `linkPaymentToInvoice` | `data: { invoiceId: number` |
| `server/childRecordWorkspaceIsolation.test.ts` | 11 | `getContactLinksForRecord` | `workspaceId: number, recordType: string, recordId: number)")` |
| `server/childRecordWorkspaceIsolation.test.ts` | 13 | `getContactLinksForRecord` | `wsId, input.linkedRecordType, input.linkedRecordId)")` |
| `server/childRecordWorkspaceIsolation.test.ts` | 19 | `listFileVersions` | `fileId: number, workspaceId: number)")` |
| `server/childRecordWorkspaceIsolation.test.ts` | 22 | `listFileVersions` | `input.fileId, wsId)")` |

## Router callbacks accepting input without ctx

| File | Line | Callback |
|---|---:|---|
| `server/entityRouters.ts` | 998 | `.query(async ({ input }) => {` |
| `server/searchRouter.ts` | 203 | `.query(async ({ input }) => {` |
| `server/searchRouter.ts` | 262 | `.mutation(async ({ input }) => {` |
| `server/efficiencyRouter.ts` | 86 | `.mutation(async ({ input }) => {` |
| `server/customerSupportRouter.ts` | 218 | `.query(async ({ input }) => {` |
| `server/customerSupportRouter.ts` | 236 | `.query(async ({ input }) => {` |
| `server/customerSupportRouter.ts` | 250 | `.query(async ({ input }) => {` |
| `server/customerSupportRouter.ts` | 310 | `.mutation(async ({ input }) => {` |
| `server/systemInfraRouter.ts` | 71 | `.query(async ({ input }) => {` |
| `server/systemInfraRouter.ts` | 97 | `.query(async ({ input }) => {` |
| `server/systemInfraRouter.ts` | 113 | `.mutation(async ({ input }) => {` |
| `server/systemInfraRouter.ts` | 122 | `.mutation(async ({ input }) => {` |
| `server/systemInfraRouter.ts` | 131 | `.mutation(async ({ input }) => {` |
| `server/systemInfraRouter.ts` | 149 | `.query(async ({ input }) => {` |
| `server/systemInfraRouter.ts` | 205 | `.query(async ({ input }) => {` |
| `server/systemInfraRouter.ts` | 263 | `.query(async ({ input }) => {` |
| `server/systemInfraRouter.ts` | 445 | `.mutation(async ({ input }) => {` |
| `server/systemInfraRouter.ts` | 509 | `.query(async ({ input }) => {` |
| `server/systemInfraRouter.ts` | 545 | `.query(async ({ input }) => {` |
| `server/samRouter.ts` | 39 | `.query(async ({ input }) => {` |
| `server/samRouter.ts` | 53 | `.query(async ({ input }) => {` |
| `server/samRouter.ts` | 59 | `.query(async ({ input }) => {` |
| `server/platformBusinessRouter.ts` | 35 | `.query(async ({ input }) => {` |
| `server/platformBusinessRouter.ts` | 76 | `.query(async ({ input }) => {` |
| `server/platformBusinessRouter.ts` | 103 | `.query(async ({ input }) => {` |
| `server/platformBusinessRouter.ts` | 151 | `.query(async ({ input }) => {` |
| `server/platformBusinessRouter.ts` | 210 | `.query(async ({ input }) => {` |
| `server/platformBusinessRouter.ts` | 253 | `.query(async ({ input }) => {` |
| `server/platformBusinessRouter.ts` | 289 | `.query(async ({ input }) => {` |
| `server/platformRouter.ts` | 340 | `.mutation(async ({ input }) => {` |
| `server/platformRouter.ts` | 359 | `.mutation(async ({ input }) => {` |
| `server/platformRouter.ts` | 368 | `.mutation(async ({ input }) => {` |
| `server/platformRouter.ts` | 394 | `.mutation(async ({ input }) => {` |
| `server/platformRouter.ts` | 412 | `.mutation(async ({ input }) => {` |
| `server/platformRouter.ts` | 421 | `.mutation(async ({ input }) => {` |
| `server/platformRouter.ts` | 438 | `.query(async ({ input }) => {` |
| `server/platformRouter.ts` | 450 | `.mutation(async ({ input }) => {` |
| `server/platformRouter.ts` | 468 | `.query(async ({ input }) => {` |
| `server/platformRouter.ts` | 482 | `.mutation(async ({ input }) => {` |
| `server/platformRouter.ts` | 533 | `.mutation(async ({ input }) => {` |
| `server/platformRouter.ts` | 548 | `.mutation(async ({ input }) => {` |
| `server/platformRouter.ts` | 557 | `.mutation(async ({ input }) => {` |
| `server/platformRouter.ts` | 574 | `.query(async ({ input }) => {` |
| `server/platformRouter.ts` | 587 | `.mutation(async ({ input }) => {` |
| `server/aiRouter.ts` | 167 | `.query(async ({ input }) => {` |
| `server/aiRouter.ts` | 179 | `.query(async ({ input }) => {` |
| `server/aiRouter.ts` | 258 | `.query(async ({ input }) => {` |
| `server/aiRouter.ts` | 274 | `.query(async ({ input }) => {` |
| `server/aiRouter.ts` | 378 | `.mutation(async ({ input }) => {` |
| `server/aiRouter.ts` | 395 | `.query(async ({ input }) => {` |
| `server/aiRouter.ts` | 414 | `.mutation(async ({ input }) => {` |
| `server/aiRouter.ts` | 434 | `.query(async ({ input }) => {` |
| `server/aiRouter.ts` | 481 | `.mutation(async ({ input }) => {` |
| `server/aiRouter.ts` | 528 | `.query(async ({ input }) => {` |
| `server/aiRouter.ts` | 553 | `.mutation(async ({ input }) => {` |
| `server/platformHealthRouter.ts` | 167 | `.mutation(async ({ input }) => {` |
| `server/platformHealthRouter.ts` | 325 | `.mutation(async ({ input }) => {` |
| `server/platformHealthRouter.ts` | 341 | `.mutation(async ({ input }) => {` |
| `server/platformHealthRouter.ts` | 357 | `.mutation(async ({ input }) => {` |
| `server/platformHealthRouter.ts` | 366 | `.mutation(async ({ input }) => {` |
| `server/platformHealthRouter.ts` | 387 | `.query(async ({ input }) => {` |
| `server/platformHealthRouter.ts` | 420 | `.mutation(async ({ input }) => {` |
| `server/platformHealthRouter.ts` | 448 | `.mutation(async ({ input }) => {` |
| `server/platformHealthRouter.ts` | 469 | `.mutation(async ({ input }) => {` |
| `server/platformAdminRouter.ts` | 99 | `.query(async ({ input }) => {` |
| `server/platformAdminRouter.ts` | 255 | `.query(async ({ input }) => {` |
| `server/platformAdminRouter.ts` | 397 | `.mutation(async ({ input }) => {` |
| `server/platformAdminRouter.ts` | 514 | `.query(async ({ input }) => {` |
| `server/platformAdminRouter.ts` | 591 | `.query(async ({ input }) => {` |
| `server/platformAdminRouter.ts` | 691 | `.query(async ({ input }) => {` |
| `server/platformAdminRouter.ts` | 728 | `.query(async ({ input }) => {` |
| `server/platformAdminRouter.ts` | 861 | `.query(async ({ input }) => {` |
| `server/platformAdminRouter.ts` | 912 | `.query(async ({ input }) => {` |
| `server/platformAdminRouter.ts` | 932 | `.mutation(async ({ input }) => {` |
| `server/platformAdminRouter.ts` | 972 | `.query(async ({ input }) => {` |
| `server/platformAdminRouter.ts` | 992 | `.mutation(async ({ input }) => {` |
| `server/platformAdminRouter.ts` | 1057 | `.query(async ({ input }) => {` |
| `server/platformAdminRouter.ts` | 1311 | `.query(async ({ input }) => {` |
| `server/platformAdminRouter.ts` | 1534 | `.query(async ({ input }) => {` |
| `server/phase35Router.ts` | 39 | `.query(async ({ input }) => {` |
| `server/phase35Router.ts` | 298 | `.query(async ({ input }) => {` |
| `server/phase35Router.ts` | 320 | `.query(async ({ input }) => {` |
| `server/inviteRouter.ts` | 369 | `.query(async ({ input }) => {` |
| `server/_core/systemRouter.ts` | 23 | `.mutation(async ({ input }) => {` |

## Interpretation

- Global/platform reference data may legitimately omit workspace context.
- Tenant-owned or child records must be scoped directly by `workspaceId` or validated through a tenant-scoped parent before read/write.
- This report is an aid for source review; tests and schema tracing govern final classification.

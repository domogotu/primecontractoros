# PrimeContractorOS — Migration & Modernization Register

This register tracks the production-to-V2 mirror and every verified modernization batch. Production (`domogotu/primecontractoros`) remains the read-only reference; active development occurs in `domogotu/-primecontractoros-v2`.

## Baseline mirror

- Complete production application tree mirrored into V2 from production commit `8b85cb876d2b1937e7c0d6a55a2dc77249fc5cda`.
- Credential-bearing `.project-config.json`, `.env*`, Git metadata, dependencies, caches, build outputs, uploads, local databases, and Manus database/query artifacts were excluded.
- Baseline verification passed: dependency install, ephemeral MySQL migrations, TypeScript check, 103 tests across 13 files, and production build.
- Mirror PR #2 merged to V2 `main` as `de6a8cd83b277647a5dc251067edf07a644a1340`.

| # | Original Path | V2 Path | Classification | Status | Verification | Commit |
|---|---|---|---|---|---|---|
| 1 | `drizzle/schema.ts` | `drizzle/schema.ts` | Improve | Mirrored; preserved prior V2 modernization | Baseline TypeScript/tests/build passed | V2 baseline |
| 2 | `server/platformAdminRouter.ts` | `server/platformAdminRouter.ts` | Improve | Mirrored; preserved prior V2 modernization | Baseline TypeScript/tests/build passed | V2 baseline |
| 3 | `client/src/pages/PlatformOnboarding.tsx` | same | Improve | Mirrored; preserved prior V2 modernization | Baseline TypeScript/tests/build passed | V2 baseline |
| 4 | `server/entityRouters.ts` | same | Improve — invoice/payment workspace isolation and audit semantics | Verified modernization | TypeScript, full test suite, production build passed | `c1721bd` |
| 5 | `server/entityRouters.ts` | same | Improve — contact-link/file-version parent validation | Verified modernization | TypeScript, full test suite, production build passed | `e70a9be` |
| 6 | `server/entityDb.ts` | same | Improve — contact links and file versions scoped by `workspaceId` | Verified modernization | TypeScript, full test suite, production build passed | `e70a9be` |
| 7 | — | `server/invoiceWorkspaceIsolation.test.ts` | Add regression coverage | Verified | Passed with full suite | `c1721bd` |
| 8 | — | `server/childRecordWorkspaceIsolation.test.ts` | Add regression coverage | Verified | Passed with full suite | `e70a9be` |
| 9 | `README.md` | `README.md` | Improve — synchronize repository state | Updated | Documentation review | `1bb77a0` |

## Historical findings already verified closed

The current mirrored source shows that several older audit findings were already repaired before this modernization branch:

- Top navigation Help routes to `/help` rather than the obsolete `/app/help` path.
- The invalid global `/app/ai-confirmation` navigation entry is not present in the current top navigation.
- Successful SAM.gov imports refetch the opportunity list rather than using a no-op callback.
- Proposal framework list/get procedures are protected rather than public.
- Platform plan and discount UI fields currently match the corresponding platform-admin API/schema contract.

These findings should not be reopened unless a later regression is demonstrated.

## Active modernization branch

`agent/v2-modernization-phase1`

Current priority is security and tenancy correctness, followed by schema/API/UI contract reconciliation. Every historical finding must be re-verified against current source before it is treated as open. Each code batch must pass TypeScript, tests, and production build before it is committed.

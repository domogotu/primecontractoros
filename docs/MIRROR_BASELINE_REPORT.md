# PrimeContractorOS V2 Mirror Baseline

Production reference: `domogotu/primecontractoros`  
Production branch: `main`  
Production commit: `8b85cb876d2b1937e7c0d6a55a2dc77249fc5cda`  
Production file count before exclusions: `479`

## Preserved V2-only assets

- `CLAUDE.md`
- `MIGRATION_REGISTER.md`
- `README.md`
- `docs/`
- `unified-ai-ecosystem/`
- `.github/`
- `drizzle/schema.ts`
- `server/platformAdminRouter.ts`
- `client/src/pages/PlatformOnboarding.tsx`

## Excluded from production mirror

Git metadata, Manus database/query artifacts, `.project-config.json` because it contains a credential-bearing database URL, environment files, dependencies, build outputs, caches, coverage, uploads, and local database files.

This commit establishes the runnable-source mirror baseline. Build/typecheck/test results must be recorded separately and failures must be treated as baseline evidence rather than silently repaired.

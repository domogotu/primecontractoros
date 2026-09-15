# PrimeContractorOS V2 Release Readiness

## Status

Phase 16 final release gate passed on branch `agent/phase16-release-readiness` after validating production invariants, database migrations, TypeScript, the full test suite, and the production build.

## Verified in code

- Render health check targets `/api/health`.
- Production startup runs database migrations before `node dist/index.js`.
- Production owner identity is pinned to `dominiquereed35@gmail.com`.
- Platform-wide administration is protected by `platformOwnerProcedure`; ordinary workspace admins are not equivalent to the platform owner.
- Browser authentication requires the configured OAuth portal and server endpoints.
- Checkout success requires a completed Stripe Checkout Session and verified payment state.
- Checkout activation verifies workspace ownership, persists the Stripe subscription, links the selected plan, and only then grants workspace access.
- Onboarding persists business-profile data including UEI to the correct database record.
- Workspace access resolves invited members to their joined workspace and fails closed when access cannot be verified.
- Critical public, customer-app, onboarding, checkout-success, dashboard, and platform-owner routes are present.
- Database migrations, TypeScript validation, full automated tests, and production build passed together in the final release gate.

## External production requirements

The repository is code-ready, but the live deployment still depends on external services and secrets being configured correctly in the hosting environment.

Required production configuration includes:

- `DATABASE_URL`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `OPENAI_API_KEY`
- `SAM_GOV_API_KEY`
- `BUILT_IN_FORGE_API_KEY` if the Manus Forge fallback/storage integration remains enabled
- `VITE_FRONTEND_FORGE_API_KEY` if the frontend Forge integration remains enabled

The Render blueprint currently points OAuth to Manus (`https://api.manus.im` and `https://manus.im`). The production OAuth application must authorize the final PrimeContractorOS production callback/domain. If Manus OAuth cannot support the production domain independently, authentication must be migrated to another provider before launch.

Stripe must also have its production webhook endpoint configured with the same secret supplied as `STRIPE_WEBHOOK_SECRET`.

## Platform owner

The sole top-level PrimeContractorOS platform-owner account is:

`dominiquereed35@gmail.com`

Workspace/customer administrators may administer their own workspace but must never receive platform-owner authority.

## Deployment handoff

Once the required production secrets and OAuth/webhook settings are present in Render, the next operational step is to deploy the current `main` branch and perform a live-browser smoke test covering:

1. Public home/pricing/login pages.
2. Platform-owner login and owner-only controls.
3. Customer signup and Stripe checkout.
4. Checkout success and durable subscription activation.
5. Workspace creation/onboarding persistence.
6. Dashboard access after onboarding.
7. Opportunity → proposal → contract → operations → finance → closeout lifecycle navigation.
8. Logout/login persistence and workspace isolation between separate customer accounts.

No release should be declared complete until those external configuration and live-environment checks pass.
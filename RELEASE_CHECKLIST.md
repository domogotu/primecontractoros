# PrimeContractorOS — Release Checklist

Use this checklist before every production deployment to ensure nothing is missed.

---

## Pre-Deploy Checklist

### Code Quality
- [ ] `pnpm test` passes with no failures
- [ ] `npx tsc --noEmit` reports zero errors
- [ ] `pnpm build` completes successfully

### Database
- [ ] Any new schema changes have been pushed with `pnpm db:push`
- [ ] Migrations have been reviewed and tested in staging

### Environment & Secrets
- [ ] All required secrets are set in Settings → Secrets (or via `webdev_request_secrets`)
- [ ] Stripe keys are correct for the target environment (test vs. live)

---

## Legal & Consent Policy Changes

> **⚠️ REQUIRED whenever `/terms` or `/privacy` content is updated**

When you edit the Terms of Service (`client/src/pages/Terms.tsx`) or Privacy Policy (`client/src/pages/Privacy.tsx`):

1. **Update the "Last Updated" date** at the top of the legal document to today's date.
2. **Increment `CONSENT_VERSION`** in `client/src/components/ConsentBanner.tsx`:
   ```ts
   // Example: change "1.0" → "1.1" or use a date string like "2026-07"
   export const CONSENT_VERSION = "1.1";
   ```
   This forces **all users** (including those who previously accepted) to see and respond to the updated policy banner.
3. **Verify the consent banner** appears on a fresh browser session (open an incognito window and visit the site).
4. **Optionally notify users** by email that the policy has changed — especially for material changes to data handling or billing terms.
5. **Deploy** and confirm the new version appears in Platform Admin → Consent Records after the first user acceptance.

---

## Post-Deploy Verification

- [ ] Site loads without errors in browser console
- [ ] Login / OAuth flow works end-to-end
- [ ] Consent banner appears for new/incognito sessions
- [ ] Platform Admin → Consent Records shows new entries after acceptance
- [ ] Stripe checkout flow works (use test card `4242 4242 4242 4242`)
- [ ] Key user flows tested: Onboarding → Dashboard → Contracts → Invoices

---

## Stripe Go-Live Checklist

When switching from test to live Stripe keys:

- [ ] Claim the Stripe sandbox at the URL provided during setup
- [ ] Complete Stripe KYC verification
- [ ] Replace test keys with live keys in Settings → Payment
- [ ] Test with a real card using the 99% discount promo code
- [ ] Verify webhooks are firing in Stripe Dashboard → Developers → Webhooks
- [ ] Confirm subscription activation updates workspace access state correctly

---

## GitHub Push

- [ ] `git add -A && git commit -m "Release: <description>"` 
- [ ] `git push` to the configured remote

---

*Last updated: May 12, 2026*

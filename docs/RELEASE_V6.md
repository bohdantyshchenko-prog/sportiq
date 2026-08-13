# NOVIQ 6.1 Pre-Launch Release Policy

## Release channels

- `prelaunch`: first-user closed beta with optional cloud identity and durable cloud sync.
- `local-preview`: closed-beta fallback with device-only product data.
- `development`: local engineering builds.

The active release target is `prelaunch`. Local Preview remains available until the cloud stack is configured and verified.

## Required gates

A pre-launch release cannot merge unless all applicable checks pass:

- frontend dependency audit at high severity;
- backend dependency audit at high severity;
- structural smoke tests;
- production runtime budgets;
- Prisma schema validation;
- production migrations against PostgreSQL;
- backend TypeScript build and contract tests;
- backend container build;
- Chromium persisted decision loop;
- WebKit persisted decision loop;
- identity gate and Local Preview persistence;
- Profile and Sports Memory render after Replay;
- real mobile screenshot render;
- service-worker asset and network-only auth/API coverage.

## Cloud launch checklist

Before enabling cloud accounts for first external users:

1. Create the Supabase project and enable email/password authentication.
2. Set the production Site URL and explicitly allow the deployed NOVIQ redirect URL used by signup and password recovery.
3. Configure production SMTP for confirmation and recovery email delivery.
4. Deploy PostgreSQL and run `prisma migrate deploy`.
5. Deploy the Fastify API with `APP_ORIGIN` equal to the exact frontend origin.
6. Set `SUPABASE_URL`, `SUPABASE_JWT_ISSUER`, and `SUPABASE_JWT_AUDIENCE` on the backend.
7. Set only the public Supabase URL/publishable or anon key in browser runtime configuration; never expose a secret/service-role key.
8. Set the deployed API base URL in `runtime-config.js`. If the API is cross-origin, add that exact origin to the production CSP instead of widening `connect-src` to arbitrary HTTPS.
9. Verify signup, email confirmation, sign-in, refresh, sign-out, password recovery, local-to-cloud sync, profile update, and cloud-data deletion with test accounts.
10. Re-run Chromium and WebKit tests against the deployed environment before inviting users.

Sports provider, server AI, and push keys are optional for this beta and must not block identity/data deployment.

## Rollback

Revert the merge commit and redeploy static assets/API. Browser domain state remains on schema 7 and the existing 5.2 storage key. Database changes in the 6.1 migration are additive; do not drop columns during an emergency frontend rollback.

## Performance budgets

- complete static runtime: 520 KB maximum;
- JavaScript: 340 KB maximum;
- CSS: 170 KB maximum;
- HTML: 22 KB maximum.

Any budget increase requires an architectural note in the pull request.

## Privacy

Local telemetry and optional beta feedback remain bounded on the device and are not sent to an analytics endpoint. Cloud Account mode synchronizes only the product/profile records documented in `privacy.html`. Authentication requests and API responses are never service-worker cached.
# Security Policy

## Supported version

NOVIQ 6.1 Pre-Launch is the supported closed-beta browser/API release.

## Reporting

Do not publish sensitive findings in a public issue. Provide the affected file, reproduction steps, impact, and suggested remediation to the repository owner through a private GitHub security advisory.

## Browser security boundaries

- The browser bundle contains only public runtime configuration. Secret/service-role credentials are prohibited.
- Supabase passwords are never stored by NOVIQ product state.
- Authentication and `/v1` API traffic are network-only and excluded from the service-worker cache.
- Authentication requests use `no-store`, and API responses return `Cache-Control: no-store`.
- Local telemetry is bounded, redacts email-like values, and has no network analytics endpoint.
- Backup imports are validated before state replacement.
- Native `alert`, `confirm`, dynamic code execution, arbitrary external analytics, and wildcard HTTPS CSP connectivity are prohibited.
- Production CSP must allow only the exact NOVIQ API and Supabase origins required by the deployed environment.

## API and database boundaries

- Every protected request requires a Supabase JWT whose subject parses as a UUID.
- Product Profile, Thesis, Replay, Memory, and PushDevice records are scoped to the authenticated user.
- Local-to-cloud Thesis and Replay sync uses unique client IDs and rejects cross-user identifier conflicts.
- The browser is not trusted to author shared Match records. Closed-beta demo match IDs are resolved from a server-curated allowlist; real provider matches are written by the provider adapter.
- CORS allows only the configured application origin and does not use credentialed cookies.
- Rate limits apply globally and more strictly to sync, AI, and push-test endpoints.
- `trustProxy` is disabled by default and must only be enabled behind a trusted reverse proxy.
- Sports, AI, and push integrations are optional and fail closed with explicit unavailable responses when credentials are absent.

## Session model

The client stores the Supabase session needed for persistent sign-in in browser storage. Because browser-managed tokens are exposed to same-origin script execution, XSS prevention is a critical boundary: keep CSP restrictive, do not introduce third-party scripts, do not use unsafe dynamic evaluation, and escape untrusted product text before HTML insertion.

## Dependency policy

Frontend test dependencies and backend dependencies are audited in CI. Pull requests fail when `npm audit --audit-level=high` reports a high or critical vulnerability.

## Launch requirement

Before inviting external cloud users, verify the deployed Supabase redirect allowlist, production SMTP, JWT issuer/audience, exact CORS origin, production CSP, PostgreSQL migration state, password recovery, session refresh, ownership isolation, local-to-cloud sync, and cloud-data deletion.
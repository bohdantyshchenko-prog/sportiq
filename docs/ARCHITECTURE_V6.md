# NOVIQ 6 Architecture

NOVIQ 6 preserves the validated 5.2 state schema while adding a separate production platform layer.

## Runtime order

1. `polyfills-v52.js` — compatibility.
2. `data.js` — curated offline sports content.
3. `core-v52.js` — domain, storage, migration, AI rules and Sports IQ.
4. `platform-v6.js` — release metadata, feature flags, local telemetry, crash capture and performance marks.
5. `app-v52.js` — product UI and interaction orchestration.
6. `a11y-v52.js` — focus, inert and keyboard accessibility.

## Boundaries

The domain runtime never depends on telemetry. The platform layer observes runtime behavior but cannot mutate Thesis, Replay or Sports IQ. Telemetry is local-only, redacted, capped and never transmitted.

## State compatibility

NOVIQ 6 uses the existing `noviq-v5.2-state` domain storage key. Platform diagnostics use `noviq-v6-platform`. This avoids a destructive migration for a release that does not change the domain schema.

## Extension adapters

Future online integrations must implement adapters behind the current boundaries:

- Sports Provider Adapter
- AI Provider Adapter
- Authentication Adapter
- Analytics Adapter
- Remote Configuration Adapter
- Payments Adapter

No adapter may bypass domain validation, local backup or privacy controls.

## Quality gates

Every pull request must pass structural checks, dependency audit, runtime size budgets, Chromium E2E, WebKit E2E and mobile screenshot rendering.

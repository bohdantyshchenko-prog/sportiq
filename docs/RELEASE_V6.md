# NOVIQ 6 Release Policy

## Release channels

- `offline-production`: stable autonomous product.
- `beta`: user-testing builds only.
- `development`: local engineering builds.

The active release is `offline-production`.

## Required gates

A release cannot merge unless all checks pass:

- dependency audit at high severity;
- structural smoke tests;
- production runtime budgets;
- Chromium persisted decision loop;
- WebKit persisted decision loop;
- real mobile screenshot render;
- service-worker asset coverage.

## Rollback

Revert the merge commit and redeploy static assets. Domain state remains compatible because NOVIQ 6 does not alter schema 7 or the 5.2 storage key.

## Performance budgets

- complete static runtime: 420 KB maximum;
- JavaScript: 260 KB maximum;
- CSS: 130 KB maximum;
- HTML: 20 KB maximum.

Any budget increase requires an architectural note in the pull request.

## Privacy

Local telemetry is opt-in by architecture, remains on the device, redacts email-like values and stores a bounded number of events and errors. NOVIQ 6 contains no network analytics endpoint.

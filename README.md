# NOVIQ 1.4 — Real-Data-Ready Sports Intelligence

NOVIQ develops football reasoning through one measurable loop:

**Dynamic Briefing → Match Thesis → Decision Lock → Live Tracking → Decision Replay → Sports IQ → Sports Memory → Recommendation**

## What 1.4 adds

- hardened migration from NOVIQ 1.0, 1.1 and 1.2 local state
- resilient API client with timeout, retry and structured errors
- configurable remote sports and AI endpoints
- automatic demo fallback when the backend is unavailable
- explicit runtime status for remote, fallback and demo modes
- service-worker isolation for API requests
- safer dynamic HTML rendering and local persistence handling
- automated GitHub Actions smoke checks

## Product capabilities

- personal Daily Intelligence Brief
- Match Center with date, search and purpose filters
- Dynamic AI Briefing with facts, signals and unknowns
- Match Thesis V2 with Quick/Expert modes, sources, risk, alternatives and confidence
- immutable Decision Lock
- Live Thesis Tracking with separate private notes
- Decision Replay V2 and required reflection
- Confidence Lab V2
- Sports Memory V3 with evidence
- Recommendation Engine V1
- Weekly Intelligence Report V2
- Dark Elite / Light Elite, RU / UA / EN navigation
- PWA install, offline shell, local migration and JSON export

## Runtime configuration

`runtime-config.js` controls whether the client uses demo data or a remote backend:

```js
window.NOVIQ_RUNTIME_CONFIG = {
  demoMode: false,
  apiBaseUrl: 'https://api.example.com',
  provider: 'NOVIQ Sports API',
  requestTimeoutMs: 8000
};
```

Expected endpoints:

- `GET /v1/health`
- `GET /v1/matches`
- `GET /v1/matches/:id`
- `POST /v1/matches/:id/briefing`
- `POST /v1/ai/thesis-review`
- `POST /v1/ai/ask`

Do not place provider or OpenAI secrets in `runtime-config.js`. All secrets belong on the server.

## Truthful product status

NOVIQ 1.4 is a functional front-end prototype and an integration-ready client. The repository does not include paid sports-provider credentials, a deployed backend, real authentication, cloud sync or production push notifications. When a backend is not configured or becomes unavailable, the interface clearly falls back to demo data.

## Run locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Quality checks

```bash
node tests/smoke.mjs
```

GitHub Actions runs the same smoke checks on pull requests and pushes to `main`.

## Deploy

GitHub Pages deploys automatically from `main` through `.github/workflows/pages.yml` after Pages is configured to use **GitHub Actions**.

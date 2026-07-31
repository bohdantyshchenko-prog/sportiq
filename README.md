# NOVIQ 1.2 — Live Intelligence & Retention

NOVIQ is a mobile-first sports intelligence product built around one core loop:

**Dynamic Briefing → Match Thesis → Decision Lock → Live Tracking → Decision Replay → Sports IQ → Sports Memory**

## What works in this public build

- personal Daily Intelligence Brief
- explainable Match of the Day selection
- Dynamic AI Briefing UI with facts, signals, unknowns and changes
- Match Thesis V2 with Quick/Expert modes, sources, risk, alternative scenario, confidence and immutable local lock
- simulated Live Intelligence timeline with private observations stored separately from the original thesis
- Decision Replay V2, reflection and Sports IQ updates
- Confidence Lab V2, Sports Memory V3 and Weekly Intelligence Report V2
- Match Center search, date filters and personalised buckets
- local guest account shell, settings, JSON export and 1.0/1.1 state migration
- Dark Elite / Light Elite, responsive layout, safe areas, PWA install and offline app shell

## Honest limitations

This repository is a functional front-end prototype. It does **not** currently connect:

- official or live sports data
- server-side AI
- real authentication or cloud sync
- browser push notifications
- friends or verified reputation

All match events and AI outputs in this build are labelled demo/simulated. API secrets must never be placed in this public repository.

## Run locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Architecture

- `config.js` — runtime feature and endpoint configuration
- `data.js` — bundled fallback dataset
- `services.js` — sports-feed and AI adapters
- `compat.js` — migration from 1.0/1.1 browser state
- `app-core.js` — state, rendering and shared UI
- `app-thesis.js` — Briefing, Thesis and AI Review
- `app-live.js` — Live Tracking and Decision Replay
- `app-intelligence.js` — calibration, memory, lessons and reports
- `app-shell.js` — event routing, account shell, settings and boot

See `docs/INTEGRATION_GUIDE.md` before connecting external services.

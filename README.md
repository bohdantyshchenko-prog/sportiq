# NOVIQ 1.1 — First Intelligence Loop

NOVIQ is a mobile-first Sports Intelligence product that helps a fan build, review, remember and improve football decisions.

## Core loop

**Adaptive Diagnostic → AI Briefing → Match Thesis V2 → AI Review V2 → Decision Replay V2 → Learning Loop → Sports Memory V2**

## What is interactive in 1.1

- 10-step adaptive Sports IQ diagnostic with confidence input
- five skill scores and evidence-confidence levels
- Match Thesis V2 with Quick/Expert modes, sources, versions, risk, alternative scenario and falsification trigger
- AI Thesis Review V2 with specificity, causality, evidence, risk and bias checks
- immutable Decision Lock with timestamp
- Decision Replay V2 with timeline, score breakdown and required reflection
- Confidence Lab and calibration ranges
- personal missions, lessons and control questions
- Sports Memory V2 with evidence-backed patterns
- Match Center filters, AI Core demo, notifications, RU/UA/EN and Dark/Light Elite
- local persistence, JSON export, PWA install and offline shell

## Important product status

This is a functional front-end prototype. Sports data, AI answers, live events, friends and cloud accounts are demo/local implementations. Real data providers, server-side AI, authentication and sync are not yet connected.

## Run locally

Serve the folder with any static server, for example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Public build

GitHub Pages deploys automatically from `main` using `.github/workflows/pages.yml`.

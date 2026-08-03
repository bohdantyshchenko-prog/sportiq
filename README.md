# NOVIQ 5.1 — Sports Decision Intelligence

NOVIQ trains sports reasoning through one clear loop:

**Diagnostic → AI Briefing → Match Thesis → Decision Replay → Sports IQ**

## Current edition

NOVIQ 5.1 is a complete offline-first product edition. It runs without external accounts, paid sports feeds, cloud storage or server AI.

The bundled matches and signals are curated demonstration content. The local AI rules engine challenges evidence, confidence and alternative scenarios; it does not present predictions as facts.

## Product capabilities

- concise first-run onboarding
- one daily decision on Home
- Match Center with purpose filters
- AI Briefing separating facts, signals and unknowns
- Match Thesis with scenario, evidence, risk and confidence
- Decision Replay focused on decision quality rather than luck
- Sports IQ, calibration and personal patterns
- structured AI Core answers with confidence and source labels
- RU / UA / EN localization
- Dark and Light themes
- validated local persistence and version migration
- JSON export and validated import
- offline PWA installation and cache
- keyboard navigation, focus trapping, skip link and reduced-motion support

## Architecture

The active browser runtime is intentionally small:

- `runtime-config.js`
- `config.js`
- `bootstrap-v5.js`
- `data.js`
- `services.js`
- `app-v5.js`
- `styles-v5.css`

Older experimental UI files remain in repository history but are not loaded by the application.

## Run locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Quality gates

```bash
node tests/smoke.mjs
```

Pull requests also run:

- NOVIQ Quality — syntax, runtime assets, migration and product constraints
- NOVIQ Screenshot — real mobile Chromium render
- NOVIQ E2E — onboarding → diagnostic → briefing → thesis → replay → AI

## Product boundary

NOVIQ 5.1 does not claim live scores, real provider data, cloud sync, push delivery or server-generated AI. Those systems can be connected later through isolated adapters without changing the current offline product loop.

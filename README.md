# NOVIQ 1.0 — Unique MVP

NOVIQ is a mobile-first Sports Intelligence product built around one defensible loop:

**AI Briefing → Match Thesis → AI Review → Decision Replay → Sports IQ → Sports Memory**

## Live product scope

Version 1.0 is an interactive front-end product prototype, not a static mockup. It includes:

- Dark Elite and Light Elite themes
- RU / UA / EN localization
- Sports IQ diagnostic
- Match Center and Live Intelligence states
- Match Thesis form with risk, confidence and decision lock
- AI Thesis Review
- Decision Replay and Sports IQ updates
- Sports Memory patterns and decision timeline
- Sports Twin, Future Self, Geo Intelligence, Community Pulse and Weekly Wrapped demos
- Local persistence through `localStorage`
- JSON data export
- PWA manifest and offline cache
- Responsive mobile layout, safe areas, reduced-motion support and accessible controls

## Important limitations

This build uses demo data and local simulated AI. Real sports feeds, server-side AI, authentication, cloud sync, push notifications and verified social reputation are not connected yet.

## Run locally

Open `index.html`, or serve the repository with any static server.

```bash
python -m http.server 8080
```

## Deploy

GitHub Pages deploys automatically from `main` via `.github/workflows/pages.yml`.

## Product rule

NOVIQ does not promise guaranteed match predictions. It measures and develops the quality of sports reasoning.

# NOVIQ 4.0 Offline Production

This is the complete standalone edition of NOVIQ that works without external accounts, API keys, sports providers, AI services or push infrastructure.

## Included

- installable mobile-first PWA
- dark and light themes
- curated match dataset
- local AI briefing and thesis-review rules engine
- Sports IQ, diagnostic, Match Thesis, live notes, Decision Replay and Sports Memory
- local profile and preferences
- automatic state migration from NOVIQ 1.x–3.3
- validated local persistence with a rolling backup
- JSON export and import
- safe reset flow
- local health diagnostics
- offline cache for every active runtime asset
- reduced-motion and keyboard accessibility support
- automated syntax, asset, cache and mobile-render checks

## Truthful product boundaries

The bundled matches and intelligence signals are demonstration content. The application does not claim live scores, confirmed lineups, medical information or server-generated AI. These boundaries are visible inside the product.

## Data model

User state is stored under `noviq-v4-state`. A second copy is kept under `noviq-v4-backup`. An exported backup contains product, version, schema version, export timestamp and state. Import rejects files that do not contain the required NOVIQ state structure.

## Release gate

A release is acceptable only when:

1. NOVIQ Quality passes.
2. NOVIQ Screenshot passes on the mobile viewport.
3. Every active script and stylesheet exists and is cached.
4. Migration from `noviq-v3.3-state` remains covered.
5. Export, import, reset and local health checks remain present.
6. No UI text claims that bundled data is live.

The backend folder remains available for a future connected edition but is not loaded by the NOVIQ 4.0 client runtime.
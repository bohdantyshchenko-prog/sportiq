# NOVIQ 1.2 Integration Guide

## Sports data

The browser calls an adapter, not a third-party provider directly. Production should expose server endpoints such as:

- `GET /matches`
- `GET /matches/:id`
- `GET /matches/:id/timeline`
- `GET /matches/:id/lineups`

The server should normalise provider responses, cache shared match data, record freshness and keep provider credentials secret.

## AI

Replace `DemoAIService` with authenticated server functions for:

- briefing generation
- thesis review
- replay summary
- pattern detection
- weekly report

Every response should include source references, generated-at time, confidence and limitations. Shared match briefings should be cached; personal reasoning should remain private.

## Authentication and sync

Recommended path:

1. Supabase Auth with guest-to-account migration.
2. Row Level Security on every user-owned table.
3. Server timestamp for Decision Lock.
4. Append-only thesis versions after lock.
5. Separate public profile data from private reasoning.
6. Export and account deletion flows before public launch.

## Push

Browser push and native notifications require a server scheduler. Never treat local notification toggles as proof that delivery is active.

# NOVIQ 3.3 Production Deployment

## Required services

- HTTPS frontend hosting with support for `_headers`
- PostgreSQL 17+
- Supabase Auth project
- Football-Data API token
- OpenAI API key
- VAPID key pair
- HTTPS backend hosting capable of running the production Dockerfile

## Backend environment

Copy `backend/.env.example` and set every value. Never expose `DATABASE_URL`, `FOOTBALL_DATA_TOKEN`, `OPENAI_API_KEY`, or `VAPID_PRIVATE_KEY` to the browser.

## Frontend runtime configuration

Set `runtime-config.js` during deployment:

- `demoMode: false`
- `apiBaseUrl`: production backend origin
- `supabaseUrl`: Supabase project URL
- `supabaseAnonKey`: public anonymous key only
- `vapidPublicKey`: public VAPID key

The runtime config must be served with `Cache-Control: no-store`.

## Release sequence

1. Back up PostgreSQL.
2. Build the backend image.
3. Run `prisma migrate deploy` as a one-off release command.
4. Deploy the backend and verify `/health` and `/ready`.
5. Configure frontend runtime values.
6. Deploy frontend assets.
7. Verify sign-up, sign-in, token refresh, matches, AI briefing, thesis creation, push subscription, offline startup, and service-worker update.
8. Test on physical iPhone Safari and Android Chrome before public traffic.

## Rollback

- Frontend: redeploy the previous immutable build and update `runtime-config.js`.
- Backend: redeploy the previous image. Do not reverse a database migration unless a reviewed down-migration exists.
- Provider outage: switch frontend to demo mode and keep the backend health endpoint available.
- AI outage: disable AI actions in runtime configuration or feature flags; never replace unavailable AI output with fabricated content.

## Launch gates

Production launch is blocked unless:

- all GitHub workflows pass;
- secrets are stored in the hosting secret manager;
- database backups and restore have been tested;
- TLS is valid;
- Supabase redirect URLs match the production domain;
- CORS allows only the production frontend origin;
- real-device tests pass;
- privacy policy, terms, deletion, and data-export processes exist.

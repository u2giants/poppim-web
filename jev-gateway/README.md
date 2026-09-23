# jev-gateway

Minimal Jev-OFF Node ESM scaffold for the activity-triage provider boundary.
This process is the **only** future TypeSafe caller. It is not wired to the SPA.

## Status

Scaffold only. `JEV_ACTIVITY_TRIAGE_ENABLED` defaults to `false`.
`POST /v1/triage` returns `503 jev_disabled` and never calls TypeSafe.
No provider client, no real comments, no secrets in source.

## Runtime rules

- **Single replica.** Do not scale this service horizontally.
- **Fail closed.** Unknown env names, missing required keys (when enabled), and any service-role credential refuse startup.
- **TypeSafe stays server-side.** `TYPESAFE_API_KEY` must never appear in `src/`, `.env.example`, or any browser bundle.

## Env allowlist

| Name | Required | Notes |
|---|---|---|
| `JEV_ACTIVITY_TRIAGE_ENABLED` | no (default `false`) | Feature flag; `false` keeps triage off |
| `TYPESAFE_API_KEY` | when flag on | Server-only provider credential |
| `JEV_COMPLETION_HMAC_KEY` | when flag on | Completion envelope HMAC |
| `JEV_COMPLETION_HMAC_KEY_VERSION` | when flag on | Key version label |
| `JEV_INPUT_HMAC_KEY` | when flag on | Input digest HMAC |
| `JEV_INPUT_HMAC_KEY_VERSION` | when flag on | Key version label |
| `SUPABASE_URL` | no | Public project URL only |
| `SUPABASE_ANON_KEY` | no | Publishable anon key only |
| `PORT` | no (default `3000`) | Listen port |

**Never** accept `SUPABASE_SERVICE_ROLE_KEY`, any `service_role` credential, database passwords, or JWT-signing secrets. Supabase URL + anon only.

Any `JEV_*`, `TYPESAFE_*`, or `SUPABASE_*` name outside this table refuses startup.

## Endpoints

- `GET /healthz` — liveness; reports flag state only.
- `POST /v1/triage` — `503 jev_disabled` while the flag is off (fail closed).

## Test

```bash
npm run test:jev-gateway
```

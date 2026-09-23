# Jev gateway scaffold

Status date: 2026-06 (phase 0 deploy-transport worktree).

## What exists

- `shared/jev-activity-triage/qualityManifest.mjs` — `writeQualityManifest`, `qualityManifestFromFile`, write-time SHA-256 of the shared modules + `golden-vectors.json`. Digest is `qualityReleaseDigest` (canonical JSON). No US-dollar fields.
- `scripts/jev-activity-triage/build-quality-manifest.mjs` — writes `docs/verification/jev-activity-triage/quality-manifest.json` and prints `JEV_RELEASE_DIGEST`.
- `scripts/jev-activity-triage/qualityManifest.test.mjs` — digest stability, module-byte hash binding (temp copy), no `$`/cost keys.
- `jev-gateway/` — Node ESM, Jev-OFF:
  - `src/config.mjs` env allowlist (TypeSafe key, feature flag, HMAC keys, Supabase URL+anon, `PORT`). Unknown `JEV_*`/`TYPESAFE_*`/`SUPABASE_*` names and any service-role name refuse load. Flag defaults `false`.
  - `src/server.mjs` — `GET /healthz`, `POST /v1/triage` → `503 jev_disabled` when flag off. No provider call.
  - `test/gate.test.mjs` — flag-off 503, unknown env rejected, healthz ok, `TYPESAFE_API_KEY` absent from `src/` and `.env.example`.
- `package.json` — `test:jev-gateway` folded into `npm test`.

## Locked rules (unchanged)

Admin-only v1; four feature flags default OFF; no real comments; no secrets; no `$` ceilings; TypeSafe key stays server-side.

## Waiting on shared-db #3298

Issue **#3298** (shared-db, **orchestrator work** — database structure) is still OPEN. Until its DB contract lands, this scaffold cannot:

- bind triage rows / claim / completion envelopes to real tables or RPCs
- load processor Auth identity or signed work envelopes
- replace the `dictionary_version_uuid` placeholder or attach a production dictionary commitment
- turn `JEV_ACTIVITY_TRIAGE_ENABLED` on for any real comment path

Next step after #3298: wire the gateway to the governed DB contract, then a separate provider path. Do not enable the flag before that.

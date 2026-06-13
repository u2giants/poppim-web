# HANDOFF.md — poppim-web continuation state (2026-06-12)

Required reading to continue this app without prior chat context. Read `AGENTS.md` first. Delete this file when the open continuation items below are resolved or moved into regular issue tracking.

## CI/CD + Build Metadata

Status:
partial

Status: done (2026-06-12) — the pipeline now deploys end-to-end and production serves the pushed SHA.

Done:
- GitHub Actions release path is `verify -> publish -> deploy`.
- **Deploy now PATCHes the service `docker_compose_raw` (base64) to the `:sha-<commit>` tag, then `GET /services/{uuid}/restart`** (see `docs/cicd.md §QUIRK-3`). Plain restart on `:main` reuses the *cached* image and silently serves the old bundle — this was the root cause of a full day where pushes "weren't going live."
- A blocking ESLint error (ternary used as a statement in `PipelinePage.tsx`) had been failing every CI run at the `verify` step, so no deploy had ever succeeded; fixed.
- The old `/api/v1/deploy?uuid=...` path was confirmed wrong for this Coolify *service* (HTTP 200, no effect).
- `/version.json` is intercepted by Coolify's Caddy SPA fallback, so deploy verification greps the served HTML for the `build-sha` meta tag.

Risks / watchouts:
- Do not reintroduce raw SSH/docker deploys.
- Do not revert deploy to a plain restart on `:main` or to `/api/v1/deploy?uuid=...`.
- `docker_compose_raw` MUST be base64-encoded in the PATCH body (plain text → HTTP 422).
- Keep `npm run lint` clean of *errors* — `verify` gates the whole pipeline (warnings are allowed).

## Product App Work

Status:
partial

Done:
- Scaffold, auth, app shell, board, drag-to-stage, task detail, collaboration CRUD, production deploy, CI/Coolify release path.
- **Server-side search/filter/pagination** (2026-06-12): the pipeline queries Directus with `_icontains`/`licensor._in` filters + a parallel `aggregate` count; there are 15,228 staged products, so the old 500-row client cap was hiding ~97%. See `src/features/pipeline/api.ts`.
- **Projects page** added for the 651 imported ClickUp project records (`src/features/projects/`).
- **`?item=<uuid>` deep-linking** to the pipeline task modal via `history.replaceState`.
- **Cover images on cards**, PI Req pill fix, dead board-code cleanup.
- **Durable images → DigitalOcean Spaces** (cross-repo; migration in the `directus` repo `pm-system/migration/clickup-to-spaces.mjs`). **Complete:** 3,747 covers moved to Spaces (originals + thumbs), 0 ClickUp URLs remain. Cards load the Spaces thumbnail (`coverThumbUrl` derived in `adapter.ts`); the opened modal loads the full original.

Next action:
Remaining backlog: board scale controls, List/Timeline views, real-tenant Microsoft SSO round-trip confirmation, cleanup of unused Vite-template assets, and the non-blocking `react-hooks/set-state-in-effect` + `no-explicit-any` lint warnings.

Risks / watchouts:
- `react-router-dom` is installed but the app still uses a simple auth gate rather than routes.

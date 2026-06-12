# CI/CD rules — poppim-web

The org's full CI/CD operating rules apply; this file records **how they're implemented for this app** and the **one normal release path**. Read `AGENTS.md` and `docs/deployment.md` alongside this.

## System of truth (§2)
| Concern | Owner |
|---|---|
| Code, `Dockerfile`, `nginx.conf`, the workflow | **GitHub** (`u2giants/poppim-web`, `main`) |
| Built production image | **GHCR** — `ghcr.io/u2giants/poppim-web` |
| Runtime: domain, env, restart policy, which image runs | **Coolify** (service `poppim-web`, uuid `ysvdyj3t7d5tyh5ogrvlka4y`) |
| The VPS | runtime host only — **not** a config source |

## The one normal release path (§5/§6/§26)
```
push to main
  → GitHub Actions (.github/workflows/deploy.yml)
       verify   : npm ci → lint → build (tsc + vite)   [gate]
       publish  : docker build → push ghcr.io/u2giants/poppim-web:main  + :sha-<commit>
       deploy   : GET /api/v1/services/{uuid}/restart  (Coolify service restart — see §QUIRK-1)
       verify   : poll https://pm.designflow.app/?_v=<sha> for the commit SHA in the HTML (see §QUIRK-2)
  → Coolify pulls the new :main image and runs it
  → VPS runs the container
```
Jobs use native `needs` (`verify → publish → deploy`) — deploy never runs unless verify + publish pass (§7/§8/§12.1). GitHub Actions **never SSHes into the server or runs docker on it** (§3/§10).

The Docker build bakes the commit SHA into `index.html` via `<meta name="build-sha" content="%VITE_BUILD_GIT_SHA%">` (Vite substitutes `VITE_BUILD_GIT_SHA` at build time). The deploy job polls the live HTML and greps for that SHA to confirm the new image is running (hard fail if not confirmed within 5 min — see §QUIRK-2).

### 2026-06-12 build metadata badge

What changed:
The workflow passes `VCS_REF`, `COMMIT_DATE`, and `BUILD_RUN` into the Docker build. The build stage exposes those as `VITE_BUILD_GIT_SHA`, `VITE_BUILD_COMMIT_DATE`, and `VITE_BUILD_RUN`; `vite.config.ts` supplies local git fallbacks for dev builds.

Why:
The top bar needs to show which commit is running and when that commit was made. The same build metadata also gives CI an auditable production verification target.

Future sessions should:
Keep build metadata as build-time data. The top bar formats the commit timestamp in `America/New_York`; do not move this into runtime env or Directus data.

## Branch policy (§4)
Single-branch: `main` is the only release branch. No staging/promotion model.

## Image tags (§6.2/§18)
- `sha-<commit-sha>` — immutable audit + rollback tag.
- `main` — mutable convenience pointer (what Coolify pulls).

## Rollback (§6.3)
Redeploy a prior immutable tag through Coolify — point the service image at `ghcr.io/u2giants/poppim-web:sha-<previous-sha>` and redeploy (Coolify API/UI). Do **not** roll back by editing the server, raw `docker run`, or pushing unreviewed code.

## Secrets (§8.1/§15)
| Stored in | What | Why |
|---|---|---|
| GitHub Secrets | `COOLIFY_TOKEN` (Coolify API token) | deploy trigger |
| GitHub (automatic) | `GITHUB_TOKEN` w/ `packages: write` | push to GHCR — **no PAT needed** |
| Coolify | runtime env (none secret here; `VITE_*` is build-time) | runtime config |
No production SSH keys are stored in GitHub (none are used by the deploy path — §10).

## Build vs runtime (§19)
`VITE_DIRECTUS_URL` is **build-time** (baked into the static bundle by the `publish` job). There is no runtime app env. Domain/restart/health are Coolify-owned.

## Coolify direct-action (§20/§21)
AI/operators **may** change in Coolify directly: the service's domain binding, restart policy, health checks, and (if any were added) runtime env. AI **must not** change code/Dockerfile/workflow in Coolify — those live in GitHub.

## Docs-only + speed (§27/§29)
- `concurrency: cancel-in-progress` — a newer commit cancels an in-flight run.
- `paths-ignore` skips the production build for docs-only changes (`**/*.md`, `docs/**`, ignore files). Narrow on purpose — never skips runtime-relevant files.
- Docker layer caching via `type=gha`.

## §QUIRK-1 — Coolify service vs application (deploy endpoint)

`poppim-web` is a Coolify **service** (a docker-compose stack), not a Coolify **application** (a Git/Dockerfile resource built by Coolify). These are different resource types with different API endpoints:

| Resource type | Correct deploy trigger | What the wrong endpoint does |
|---|---|---|
| Coolify *application* | `GET /api/v1/deploy?uuid=<uuid>` | n/a |
| Coolify *service* (compose) | `GET /api/v1/services/<uuid>/restart` | `/api/v1/deploy?uuid=` silently returns HTTP 200 and **does nothing** |

The workflow uses `GET /api/v1/services/ysvdyj3t7d5tyh5ogrvlka4y/restart`. Do **not** switch to the `/deploy` endpoint — it will no-op.

## §QUIRK-2 — Caddy intercepts `/version.json` (and all static paths)

Coolify's Caddy reverse-proxy layer applies `try_files={path} /index.html /index.php` in its service labels. This intercepts **all** requests — including requests for real static files like `/version.json` — before they reach the nginx container. `https://pm.designflow.app/version.json` always returns the SPA shell (HTTP 200, Content-Type: text/html).

**Workaround:** the commit SHA is baked into `index.html` itself via `<meta name="build-sha" content="%VITE_BUILD_GIT_SHA%">` (Vite substitutes the value at build time from `VITE_BUILD_GIT_SHA` which the Dockerfile sets to the git commit SHA). Since Caddy *always* serves `index.html`, polling `/?_v=<sha>` for the SHA in the HTML response is reliable. The deploy verify step uses this and **hard-fails** if production does not serve the new SHA within 5 minutes.

Do **not** attempt to fix this by reconfiguring Caddy labels — the Caddy config is Coolify-managed and must not be edited directly (§20).

## Coolify topology to recreate (§17)
- Platform: **Coolify** at `http://178.156.180.212:8000`, server `onwp0kd7w1w74w9yeotnoihp`, project **POP PIM** (`jdq36h5dq74o6ddhich9l796`).
- Service: **`poppim-web`** uuid **`ysvdyj3t7d5tyh5ogrvlka4y`** — a compose service running `image: ghcr.io/u2giants/poppim-web:main`, port 80.
- Domain: `pm.designflow.app`. Bound via the Coolify sub-app `fqdn` (`service_applications.fqdn = https://<host>:80`) — the §11 quirk documented in the `directus` repo AGENTS.md.
- Deploy trigger (in the workflow): `GET {COOLIFY_URL}/api/v1/services/ysvdyj3t7d5tyh5ogrvlka4y/restart` (see §QUIRK-1 — **not** `/api/v1/deploy?uuid=...`).

## 2026-06-12 stale deploy incident

GitHub Actions run `27414801292` pushed `ghcr.io/u2giants/poppim-web:main` for commit `727a69bc` and the Coolify call returned HTTP 200. Production still served old assets (`index-Cff-badt.js`).

**Root cause:** the workflow called `GET /api/v1/deploy?uuid=ysvdyj3t7d5tyh5ogrvlka4y`. That endpoint only works for Coolify *application* resources. `poppim-web` is a *service* (docker-compose). The endpoint silently returned 200 with no effect — Coolify never restarted the container.

**Recovery:** manually called `GET /api/v1/services/ysvdyj3t7d5tyh5ogrvlka4y/stop` then `/start`, forcing a fresh pull of `:main`.

**Permanent fix:** workflow updated to use `GET /api/v1/services/{uuid}/restart` (see §QUIRK-1). A second discovery: `/version.json` is intercepted by Caddy (see §QUIRK-2), so the workflow now verifies by polling the HTML for the commit SHA baked into `<meta name="build-sha">`.

## Status — live (2026-06-12)

`git push` to `main` is the only release path: verify → build → push to GHCR → `GET /api/v1/services/{uuid}/restart` → Coolify pulls `:main` + runs. The GHCR package is **public**, so Coolify pulls anonymously (no registry credential needed).

- **Production:** `pm.designflow.app`, `pm-dev.designflow.app`, and `pm-ci.designflow.app` all point at Coolify service `ysvdyj3t7d5tyh5ogrvlka4y` running `ghcr.io/u2giants/poppim-web:main`.
- **Legacy raw-docker removed:** the old hand-run `poppim-web` container (Traefik labels) was deleted at cutover (2026-06-11). Do not reintroduce raw `docker run` (§10/§23). `docs/deployment.md` documents that retired path for historical context only.

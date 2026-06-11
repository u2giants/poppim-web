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
       deploy   : curl Coolify deploy API (needs: publish)
  → Coolify pulls the published image and runs it
  → VPS runs the container
```
Jobs use native `needs` (`verify → publish → deploy`) — deploy never runs unless verify + publish pass (§7/§8/§12.1). GitHub Actions **never SSHes into the server or runs docker on it** (§3/§10).

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

## Coolify topology to recreate (§17)
- Platform: **Coolify** at `http://178.156.180.212:8000`, server `onwp0kd7w1w74w9yeotnoihp`, project **POP PIM** (`jdq36h5dq74o6ddhich9l796`).
- Service: **`poppim-web`** uuid **`ysvdyj3t7d5tyh5ogrvlka4y`** — a compose service running `image: ghcr.io/u2giants/poppim-web:main`, port 80.
- Domain (production target): `pm.designflow.app` (currently validating on `pm-ci.designflow.app`). Domain is bound via the Coolify sub-app `fqdn` (the §11 quirk in the `directus` repo AGENTS.md): `service_applications.fqdn = https://<host>:80`.
- Deploy trigger: `GET {COOLIFY_URL}/api/v1/deploy?uuid=ysvdyj3t7d5tyh5ogrvlka4y` with the Coolify bearer token.

## ⚠ Status & the one remaining setup step
The pipeline is built and **verify → build → push → trigger all pass**, but Coolify cannot yet **pull** the image because the **GHCR package is private** (`u2giants` is a personal account + private repo → private package; `docker pull` returns `denied`).

**To finish the cutover, the owner must do ONE of these (one-time):**
1. **Make the GHCR package public** (recommended; the bundle is already served publicly, so nothing secret leaks): GitHub → your profile → **Packages** → `poppim-web` → **Package settings** → **Change visibility → Public**. Then the pipeline is fully automatic.
2. **Or** give Coolify a pull credential: create a GitHub PAT with `read:packages` and add it to Coolify as a Docker-registry credential for `ghcr.io`.

Until then, **production stays on the legacy raw-docker deploy** (see `docs/deployment.md`) — which is the path this pipeline replaces and which will be retired immediately after the Coolify path serves `pm.designflow.app`.

## Legacy path being retired (§10/§23)
The temporary raw-`docker run` deploy (a `poppim-web` container with hand-written Traefik labels) is **not** a sanctioned normal path. It is kept only until the Coolify pipeline above is serving production, then removed so it can't be reintroduced as a fallback.

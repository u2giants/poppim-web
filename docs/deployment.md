# Deployment — poppim-web

> **The live deploy path is the CI pipeline — see [`docs/cicd.md`](./cicd.md).** A `git push` to `main` builds the image (GHCR) and Coolify pulls + runs it at `pm.designflow.app`. This file is kept for **history**: it documents the temporary raw-docker path that was used before the pipeline, and which was **removed at cutover (2026-06-11)**. Do not reintroduce it.

**One permanent fact from the cutover:** `pm.designflow.app` was moved off the Directus backend — the backend dropped `pm` from its Coolify sub-app `fqdn` (`service_applications` id=16, now `data.designflow.app` only) and `pm` is in `AUTH_MICROSOFT_REDIRECT_ALLOW_LIST`. Directus Data Studio now lives only at `data.designflow.app`.

---

## (Historical) the retired raw-Docker process
The text below describes the temporary path used before the CI pipeline. It is **no longer in use.**

**Why it existed:** before the CI/Coolify cutover, GHCR publishing and the Coolify service were not wired up yet. This deviated from the org standard and has since been retired.

## Build + deploy the preview
```bash
# 1. build the image (multi-stage node→nginx; nginx.conf = SPA fallback)
npm run build
docker build -t poppim-web:latest .

# 2. (re)run the container on Coolify's proxy network with Traefik labels
docker rm -f poppim-web 2>/dev/null
docker run -d --name poppim-web --restart unless-stopped --network coolify \
  --label "traefik.enable=true" \
  --label 'traefik.http.routers.poppimweb-http.entryPoints=http' \
  --label 'traefik.http.routers.poppimweb-http.rule=Host(`pm.designflow.app`) || Host(`pm-dev.designflow.app`)' \
  --label 'traefik.http.routers.poppimweb-http.service=poppimweb' \
  --label 'traefik.http.routers.poppimweb-https.entryPoints=https' \
  --label 'traefik.http.routers.poppimweb-https.rule=Host(`pm.designflow.app`) || Host(`pm-dev.designflow.app`)' \
  --label 'traefik.http.routers.poppimweb-https.tls=true' \
  --label 'traefik.http.routers.poppimweb-https.tls.certresolver=letsencrypt' \
  --label 'traefik.http.routers.poppimweb-https.service=poppimweb' \
  --label 'traefik.http.services.poppimweb.loadbalancer.server.port=80' \
  poppim-web:latest
```
Traefik (the `coolify-proxy` container) routes `pm-dev.designflow.app` to it and issues a Let's Encrypt cert (HTTP challenge). DNS `pm-dev` → the VPS is a Cloudflare A record (DNS-only).

## Runtime config
`VITE_*` is baked at build time (static SPA) — there is no runtime env. To change the backend URL, rebuild.

## Rollback
Use the live CI/Coolify path documented in [`docs/cicd.md`](./cicd.md): point the Coolify service at a prior immutable `ghcr.io/u2giants/poppim-web:sha-<commit>` tag and redeploy through Coolify.

## SSH / direct-docker
Raw `docker run` on the host is **not** the current deploy path. It is documented here only as historical context; do not use it for routine deploys.

## Current deploy path
Use [`docs/cicd.md`](./cicd.md). The live path is GitHub Actions → GHCR → Coolify service restart.

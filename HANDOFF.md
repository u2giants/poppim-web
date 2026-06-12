# HANDOFF.md — poppim-web continuation state (2026-06-12)

Required reading to continue this app without prior chat context. Read `AGENTS.md` first. Delete this file when the open continuation items below are resolved or moved into regular issue tracking.

## CI/CD + Build Metadata

Status:
partial

Done:
- GitHub Actions release path is `verify -> publish -> deploy`; deploy triggers Coolify service restart via `GET /api/v1/services/ysvdyj3t7d5tyh5ogrvlka4y/restart`.
- The old `/api/v1/deploy?uuid=...` path was identified as wrong for this Coolify service; it can return HTTP 200 while doing nothing.
- `/version.json` was found to be intercepted by Coolify's Caddy SPA fallback, so deploy verification now greps the served HTML for the `build-sha` meta tag.
- Docker/Vite build metadata now includes commit SHA, commit date, and build run; the top bar displays short SHA + commit time in `America/New_York`.

Next action:
Push the workflow/app changes through the normal `main` pipeline and verify the GitHub Actions deploy job hard-confirms the new SHA from `https://pm.designflow.app/?_v=<sha>`.

Risks / watchouts:
- Do not reintroduce raw SSH/docker deploys.
- Do not switch the workflow back to `/api/v1/deploy?uuid=...`; `poppim-web` is a Coolify service, not an application.
- Do not rely on `/version.json` over the public domain for deploy verification unless Coolify routing is changed through Coolify-owned config and documented.

## Product App Work

Status:
partial

Done:
- Scaffold, auth, app shell, board, drag-to-stage, toolbar filters, task detail, collaboration CRUD, production Coolify deploy, and CI/Coolify release path are live or implemented in repo.

Next action:
Continue the remaining product backlog as needed: server-side filtering/pagination, board scale controls, List/Timeline views, URL deep-linking, durable image storage, real-tenant Microsoft SSO confirmation, and cleanup of unused Vite-template assets.

Risks / watchouts:
- Board filters are client-side over the loaded page only.
- `cover_url` still points at ClickUp CDN URLs.
- `react-router-dom` is installed but the app still uses a simple auth gate rather than routes.

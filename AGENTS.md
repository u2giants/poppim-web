# AGENTS.md — poppim-web

Canonical operating guide for **poppim-web**. Read this first; it routes you to everything else.

## 1. Project summary
`poppim-web` is the **PIM (product/project management) frontend** for POP Creations — a React single-page app that is the human UI for the product-development pipeline, replacing the ClickUp board. **Users:** internal staff (designers, sales, licensing, management). It stores **no data of its own**; every read/write goes through the **shared Directus backend** at `https://data.designflow.app` (backend repo: `u2giants/directus`). The outcome that matters: a fast, tailored Kanban + task-detail app on the company's shared "super-app" database, so PIM data interlinks with the future CRM/DAM. Sibling frontends (separate repos): `popcmr-web` (CRM), `popdam-web` (DAM).

**Live in production:** `https://pm.designflow.app` (the permanent human URL; admins use `data.designflow.app` for Directus Data Studio). Preview aliases `pm-dev` and `pm-ci` serve the same Coolify service. Deploy via `git push main` — see §13 and `docs/cicd.md`.

## Multi-model AI note

There is no universal ignore-file standard across AI coding tools.

`.claudeignore` works for Claude Code.

When using any other AI tool, paste this file as your first message and follow the instructions in the "What to ignore" section.

## Documentation map: what to read for each task

Always start with:

- `AGENTS.md`

Then load additional docs only when relevant:

| Task / question | Read these docs | Usually do not need |
|---|---|---|
| Quick repo orientation | `README.md`, `AGENTS.md` | `docs/` deep dives |
| Modify a screen / app behavior (board, task detail, login) | `AGENTS.md`, `docs/architecture.md` | `docs/deployment.md` unless deploy changes |
| Add/change env vars, config, the backend URL | `AGENTS.md`, `docs/configuration.md`, `docs/deployment.md` if runtime/CORS affected | architecture docs |
| Change local setup, scripts, lint, shadcn components, tooling | `AGENTS.md`, `docs/development.md` | `docs/deployment.md` |
| Change Docker, hosting, the deploy/preview flow, rollback | `AGENTS.md`, `docs/deployment.md`, `docs/configuration.md` | local-only dev docs |
| Change CI/CD, the release pipeline, GitHub Actions, registry, deploy trigger | `AGENTS.md`, **`docs/cicd.md`**, `.github/workflows/deploy.yml` | local-only dev docs |
| Change how data is read/written (collections, fields, the SDK) | `AGENTS.md`, `docs/architecture.md`, **the `directus` repo's `AGENTS.md`** (backend schema is there) | deployment docs |
| Investigate a bug/incident | `AGENTS.md` §11 + §14, `HANDOFF.md` if present | unrelated docs |
| Continue unfinished work | `AGENTS.md` §15, **`HANDOFF.md`** (required reading when present) | docs outside the handoff scope |
| Claude Code session | `CLAUDE.md`, then `AGENTS.md` | other docs unless needed |
| Documentation-only cleanup | `AGENTS.md`, `README.md`, affected `docs/` | source except to verify accuracy |

## 4. Repository structure

| Path | What | Ownership |
|---|---|---|
| `src/lib/` | `directus.ts` (SDK client + SSO helper), `types.ts` (typed slice of backend schema), `utils.ts` (`cn`, shadcn-generated) | owned (`utils.ts` generated) |
| `src/auth/auth.tsx` | `AuthProvider` + `useAuth()` — session check, login, SSO redirect, logout | owned |
| `src/pages/LoginPage.tsx` | login screen | owned |
| `src/components/AppShell.tsx` | top bar + user menu | owned |
| `src/components/ui/` | **shadcn/ui components — GENERATED** (Radix/new-york). Re-add/update via `npx shadcn@latest add <name>`; hand-edits get overwritten | generated (vendored) |
| `src/features/board/` | the app's substance: `BoardPage`, `TaskCard`, `TaskDetailSheet`, `Collaboration.tsx`, `api.ts`, `collab.ts`, `stageColor.ts` | owned |
| `src/App.tsx`, `src/main.tsx`, `src/index.css` | root gate/providers, entry, theme tokens (`index.css` holds the Design-provided OKLCH theme) | owned |
| `index.html`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `components.json` | build/tooling config | owned |
| `Dockerfile`, `nginx.conf`, `.dockerignore` | container build (multi-stage node→nginx, SPA fallback) | owned |
| `.env`, `.env.example` | `VITE_DIRECTUS_URL` (not secret) | owned |
| `src/assets/pop-logo.png` | app logo used in Topbar | owned |
| `node_modules/`, `dist/` | install / build artifacts | ignore (§10) |

No third-party framework source is vendored or modified (React/Radix/etc. are npm deps).

## 5. Prime Directive: custom-code boundary

Our custom code lives here:

- `src/features/` — app features (the board + task detail)
- `src/auth/`, `src/pages/`, `src/components/AppShell.tsx` — app shell + auth
- `src/lib/directus.ts`, `src/lib/types.ts` — backend access
- `src/index.css` — theme tokens (from Claude Design)
- `docs/`, `AGENTS.md`, `README.md`, `CLAUDE.md`
- `Dockerfile`, `nginx.conf`, future `.github/workflows/`

Everything else requires justification before touching — especially **`src/components/ui/` (generated shadcn)**: change those via the shadcn CLI, not by hand, or upgrades overwrite your edits.

## 6. Core modification inventory

No files **outside project-owned areas** were modified — no third-party/framework source is vendored here. The only "generated" code in-tree is the shadcn `src/components/ui/*` + `src/lib/utils.ts`, managed by the shadcn CLI.

| File | Change made | Why it was necessary | Risk during upgrades |
|---|---|---|---|
| `tsconfig.json`, `tsconfig.app.json` | Added `paths` `@/*` → `src/*` (no `baseUrl` — deprecated in TS7) | shadcn/import alias | re-check if shadcn CLI rewrites tsconfig |
| `vite.config.ts` | Added `@tailwindcss/vite` plugin + `@` alias | Tailwind v4 + alias | low |
| `components.json` | `style: "new-york"` (Radix), not the CLI default `base-nova` (Base UI) | see §11 | re-adding components uses this style |

## 7. Task-to-file navigation: what to edit for common changes

| Task | Files to touch | Files not to touch |
|---|---|---|
| Change the board (columns, cards, drag) | `src/features/board/BoardPage.tsx`, `TaskCard.tsx`, `stageColor.ts` | `src/components/ui/*` by hand |
| Change the task-detail panel | `src/features/board/TaskDetailSheet.tsx`, `Collaboration.tsx` | — |
| Change what data is fetched/written | `src/features/board/api.ts`, `collab.ts`, `src/lib/types.ts` | the backend schema (edit in the `directus` repo) |
| Change auth/login | `src/auth/auth.tsx`, `src/pages/LoginPage.tsx`, `src/lib/directus.ts` | — |
| Add a shadcn component | `npx shadcn@latest add <name>` (writes `src/components/ui/`) | hand-writing UI primitives |
| Change brand theme/tokens | `src/index.css` (`:root`/`.dark` OKLCH blocks) | component files for colors |
| Add an env var | `.env.example`, `src/lib/directus.ts`, `docs/configuration.md` | committing real `.env` |
| Change the deploy/container | `Dockerfile`, `nginx.conf`, `docs/deployment.md` | prod containers directly |

## 8. Data model and external identifiers

This app only **reads/writes** the backend; the schema is defined in the `directus` repo. Identifiers it depends on:

| Entity/System | Identifier | Where defined | Notes |
|---|---|---|---|
| Backend API | `https://data.designflow.app` | `src/lib/directus.ts` (`VITE_DIRECTUS_URL`) | shared Directus; **never** the human URL |
| This app (production) | `https://pm.designflow.app` | Coolify service `ysvdyj3t7d5tyh5ogrvlka4y` (GHCR image) | **live** — permanent human URL |
| This app (aliases) | `https://pm-dev.designflow.app`, `https://pm-ci.designflow.app` | same Coolify service | preview / CI-validation |
| GHCR image | `ghcr.io/u2giants/poppim-web` | GitHub Actions | **public** package; tags `:main` + `:sha-<commit>` |
| Repo | `u2giants/poppim-web` | GitHub | |
| Container | `poppim-web` | raw `docker run` on the `coolify` network | §9 |
| Backend collections read | `product`, `stage`, `retailer` | `directus` repo `pm-system/apply-schema.mjs` | board data |
| Collaboration collections | `checklist_item`, `subtask`, `product_assignee` (M2M), native `directus_comments` | `directus` repo `pm-system/add-collaboration-model.mjs` | task-detail |
| Image field | `product.cover_url` | `directus` repo `pm-system/migration/clickup-images.mjs` | public ClickUp CDN URL (see §11) |

Do not rename these identifiers casually — both repos depend on them.

## 9. Container and service inventory

| Container/service | Purpose | Managed by | App/project ID | Image/source |
|---|---|---|---|---|
| `poppim-web-ysvdyj3t7d5tyh5ogrvlka4y` | This frontend (prod) — pulls the CI image | **Coolify** | service uuid `ysvdyj3t7d5tyh5ogrvlka4y`, project `jdq36h5dq74o6ddhich9l796` | `ghcr.io/u2giants/poppim-web:main` |
| `directus-app` / `directus-db` | The backend this app calls | Coolify service `directus` (`nzli85mk3luzb6u7cnq5fidu`) | see `directus` repo | `directus/directus:11` + `postgres:16-alpine` |

## 10. What to ignore

Do not load these into AI context: `node_modules/`, `dist/`, `.env`, `*.local`, `.cache/`, `coverage/`. Matches `.claudeignore` / `.cursorignore`.

## 11. Intentional quirks and non-obvious decisions

### shadcn uses the `new-york` (Radix) style, not the CLI default
Looks like: `components.json` has `style: "new-york"` and components import from `radix-ui`, even though `npx shadcn init` now defaults to `base-nova` (Base UI).
Actually: we deliberately switched to the Radix-based `new-york` style.
Why: Base UI uses a `render` prop instead of Radix's `asChild`, and most shadcn docs/examples assume Radix — for an AI-assisted, docs-driven workflow that mismatch caused friction (and an unused-`React`-import build error).
Do not change because: reverting to Base UI breaks every `asChild` usage and diverges from the examples future sessions will copy.

### Auth is session/cookie mode, not token mode
Looks like: `directus.ts` uses `authentication('session', { credentials: 'include' })` and there's no token in `localStorage`.
Actually: the frontend (`pm-dev`/`pm`) and API (`data`) are sibling subdomains, so auth uses a session cookie scoped to `.designflow.app`. This is what makes Microsoft SSO return into the SPA.
Why: cross-subdomain SSO needs the cookie domain + CORS credentials set on the backend (see `directus` repo AGENTS.md §11).
Do not change because: switching to token/`json` mode breaks SSO return and the cross-subdomain session.

### `TaskCard` needs `shrink-0`
Looks like: a stray `shrink-0` on the card.
Actually: cards are flex children in a fixed-height column; without `shrink-0` they get squeezed by flex-shrink to ~2px and the column won't scroll.
Why/Do not change: removing it collapses every card (this exact bug shipped once — see §14).

### `cover_url` points at ClickUp's CDN (not our storage)
Looks like: product images load from `*.clickup-attachments.com`.
Actually: the importer stores ClickUp's public thumbnail URL directly on `product.cover_url` (no download/storage).
Why: fast, no storage volume needed for the preview.
Do not change without: knowing these URLs die if ClickUp is cancelled — durable storage (copy to DAM/R2) is a planned follow-up (§15).

### Pipeline filters are server-side (Directus API)
Search and licensor filters are pushed to Directus via `_icontains` / `name._in`. The pipeline loads 300 products unfiltered, 500 when any filter is active. A parallel `aggregate` count query surfaces the true total; a toast / table footer shows "Showing first N of M" when truncated. Search is debounced 300 ms; stale fetch results are discarded via an incrementing ref.
Do not assume: all 15K+ products are loaded at once — they aren't.

### No client-side router
The app uses a simple auth gate in `App.tsx`, not routes. Deep-linking is done with `history.replaceState` + `URLSearchParams` (`?item=<uuid>`). `react-router-dom` is installed but not used — don't add route components without a clear reason.

## 12. Credentials and environment

The frontend holds **no secrets** (it's a browser app; all auth is via the backend session cookie).

| Variable | Purpose | Stored where | Required in dev | Required in prod |
|---|---|---|---|---|
| `VITE_DIRECTUS_URL` | Backend API base URL (build-time) | `.env` / `.env.example` (defaults to `https://data.designflow.app` in `src/lib/directus.ts`) | optional | optional (baked at build) |
| `VITE_BUILD_GIT_SHA`, `VITE_BUILD_COMMIT_DATE`, `VITE_BUILD_RUN` | Build metadata displayed in the top bar and used for deploy verification | Set by Docker build args in CI; local fallback in `vite.config.ts` | no | set by workflow |

**Backend-side env this app depends on** (set on the `directus` Coolify service, NOT here): this app's origin must be in `CORS_ORIGIN` and `AUTH_MICROSOFT_REDIRECT_ALLOW_LIST`, with `CORS_CREDENTIALS=true` and the `.designflow.app` session-cookie settings. See `directus` repo AGENTS.md §11/§12.

## 13. Deployment

**LIVE pipeline (the only deploy path — see `docs/cicd.md`):** push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) verify → build → push `ghcr.io/u2giants/poppim-web:main`+`:sha-<commit>` → trigger Coolify (service `poppim-web`, uuid `ysvdyj3t7d5tyh5ogrvlka4y`) → Coolify pulls + runs. Actions never touches the server. **A `git push` to `main` is the entire deploy.** The GHCR package is **public**, so Coolify pulls anonymously (no registry cred).

- **Production:** `pm.designflow.app` is served by the Coolify service (container `poppim-web-ysvdyj3t7d5tyh5ogrvlka4y`); `pm-dev`/`pm-ci` point at the same service. Domains bound via the Coolify sub-app `fqdn` (`service_applications` id=17).
- **Rollback:** redeploy a prior `:sha-<commit>` image tag via Coolify (`docs/cicd.md`).
- **Retired:** the legacy raw-`docker run` deploy was removed at cutover (2026-06-11). `docs/deployment.md` documents it for history only — do not reintroduce raw docker.
- Data Studio (Directus) is at `data.designflow.app`; this app is the human URL `pm.designflow.app`.
- **Runtime env:** `VITE_*` is **baked at build time** (static SPA) — there is no runtime env to change; rebuild to change the backend URL.
- **§QUIRK-1 — service vs application:** `poppim-web` is a Coolify *service* (docker-compose), not a Coolify *application*. The alternative `/api/v1/deploy?uuid=` endpoint silently no-ops on services (returns HTTP 200, does nothing). See `docs/cicd.md §QUIRK-1`.
- **§QUIRK-3 — restart does NOT pull `:main`:** `GET /services/{uuid}/restart` reuses the locally-cached image, so pushing a new `:main` and restarting kept serving the OLD bundle (this caused a full day of "my changes aren't live"). The workflow now `PATCH`es the service `docker_compose_raw` (base64-encoded — plain text returns 422) to the immutable `:sha-<commit>` tag, **then** restarts; a never-cached SHA tag forces a GHCR pull. Do not revert to restart-on-`:main`. See `docs/cicd.md §QUIRK-3`.
- **§QUIRK-2 — Caddy intercepts `/version.json`:** Coolify's Caddy layer applies `try_files` before nginx, so `https://pm.designflow.app/version.json` returns the SPA shell — it cannot be polled to confirm a deploy. The CI verify step checks the `build-sha` meta tag in the served HTML instead. See `docs/cicd.md §QUIRK-2`.
- **Top-bar build badge:** `src/components/Topbar.tsx` displays the short commit SHA and commit timestamp in `America/New_York`, sourced from `src/lib/buildInfo.ts`. Do not turn this into runtime config; it is intentionally baked into the static build for auditability.

## 14. Critical incidents

### 2026-06-11 — Cards collapsed to 2px on the board
What happened: after the Prompt-B board rework, all task cards rendered ~2px tall (only the border), content hidden.
Impact: board unusable (caught in preview before anyone relied on it).
Root cause: cards are flex children in a fixed-height, scrollable column; default `flex-shrink:1` compressed them to fit instead of overflowing.
Recovery: added `shrink-0` to `TaskCard` so cards keep natural height and the column scrolls.
Rule added: see §11 "TaskCard needs `shrink-0`" — don't remove it.

### 2026-06-11 — Image importer crashed (backend, but affected this app's images)
What happened: the ClickUp image importer (in the `directus` repo) died at ~800 products; image counts stalled.
Root cause: its periodic re-login sent the already-expired token, so the re-login itself 401'd.
Recovery: fixed to clear the token before re-login + retry; documented here because this app surfaces those images.

No production incidents (the app is preview-only so far).

## 15. Pending work

| Status | Item | Owner/next action |
|---|---|---|
| in-progress | ClickUp image backfill | Importer running in the `directus` repo (`pm-system/migration/clickup-images.mjs`); ~thousands remaining, fills `product.cover_url` |
| done | CI/Coolify pipeline + cutover | `git push main` → Actions → GHCR → Coolify (`ysvdyj3t7d5tyh5ogrvlka4y`) serving `pm.designflow.app`; legacy raw-docker removed; GHCR package public; 2026-06-11. See `docs/cicd.md`. |
| done | Server-side filtering/pagination | Search + licensor pushed to Directus `_icontains`/`_in`; parallel count query; debounced 300ms; table prev/next pagination; truncation badge; 2026-06-12 |
| done | Wire PipelinePage to real Directus data | `pipeline/adapter.ts` + `pipeline/api.ts`; real products/stages/licensors; drag-to-stage with optimistic updates; 2026-06-12 |
| done | Wire TaskDetailModal to real Directus data | Comments and assignees loaded from Directus via `board/collab.ts`; mock comments removed; 2026-06-12 |
| done | Cover images on PimTaskCard | `cover_url` fetched and rendered as top banner when present; 2026-06-12 |
| done | Delete leftover Vite-template assets + dead board files | `src/assets/*`, `public/icons.svg`, and 7 unreachable `features/board/` files removed; 2026-06-12 |
| done | Production deploy at `pm.designflow.app` | live via Coolify service `ysvdyj3t7d5tyh5ogrvlka4y`; SSO + cert verified; raw-docker retired 2026-06-11 |
| open | List / Timeline views | Table view exists; Timeline tab is a placeholder |
| done | URL deep-linking (`?item=`) for the detail panel | `history.replaceState` + `URLSearchParams`; auto-opens on page load; 2026-06-12 |
| open | Durable image storage | Move `cover_url` off ClickUp's CDN into the DAM/R2 (§11) |
| open | Confirm end-to-end Microsoft SSO from a real tenant login | Redirect chain verified; full round-trip unconfirmed |
| done | Board + task detail + collaboration (assignees/checklist/subtasks/comments) | live |
| done | Design theme (Prompt A), board layout (Prompt B), task-detail layout (Prompt C) | applied |
| done | `@dnd-kit` drag-to-change-stage | live |

See `HANDOFF.md` (when present) for the live continuation state.

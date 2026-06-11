# AGENTS.md — poppim-web

Canonical operating guide for **poppim-web**. Read this first; it routes you to everything else.

## 1. Project summary
`poppim-web` is the **PIM (product/project management) frontend** for POP Creations — a React single-page app that is the human UI for the product-development pipeline, replacing the ClickUp board. **Users:** internal staff (designers, sales, licensing, management). It stores **no data of its own**; every read/write goes through the **shared Directus backend** at `https://data.designflow.app` (backend repo: `u2giants/directus`). The outcome that matters: a fast, tailored Kanban + task-detail app on the company's shared "super-app" database, so PIM data interlinks with the future CRM/DAM. Sibling frontends (separate repos): `popcmr-web` (CRM), `popdam-web` (DAM).

**Live preview:** `https://pm-dev.designflow.app` (temporary — see §13). **Permanent home at launch:** `pm.designflow.app`.

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
| `src/assets/` (`react.svg`, `vite.svg`, `hero.png`), `public/icons.svg` | **leftover Vite-template assets, unused** — safe to delete | dead |
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
| This app (preview) | `https://pm-dev.designflow.app` | Traefik labels on the `poppim-web` container | temporary (§13) |
| This app (launch) | `pm.designflow.app` | planned | permanent human URL (per `directus` domain plan) |
| Repo | `u2giants/poppim-web` | GitHub | |
| Container | `poppim-web` | raw `docker run` on the `coolify` network | §9 |
| Backend collections read | `product`, `stage`, `retailer` | `directus` repo `pm-system/apply-schema.mjs` | board data |
| Collaboration collections | `checklist_item`, `subtask`, `product_assignee` (M2M), native `directus_comments` | `directus` repo `pm-system/add-collaboration-model.mjs` | task-detail |
| Image field | `product.cover_url` | `directus` repo `pm-system/migration/clickup-images.mjs` | public ClickUp CDN URL (see §11) |

Do not rename these identifiers casually — both repos depend on them.

## 9. Container and service inventory

| Container/service | Purpose | Managed by | App/project ID | Image/source |
|---|---|---|---|---|
| `poppim-web` | This frontend (nginx serving the Vite build) | **raw `docker run`** on the `coolify` Docker network (NOT a Coolify app yet) | n/a | local image `poppim-web:latest` (built from this repo's `Dockerfile`) |
| `directus-app` / `directus-db` | The backend this app calls | Coolify service `directus` (`nzli85mk3luzb6u7cnq5fidu`) | see `directus` repo | `directus/directus:11` + `postgres:16-alpine` |

## 10. What to ignore

Do not load these into AI context: `node_modules/`, `dist/`, `.env`, `*.local`, `.cache/`, `coverage/`, the leftover Vite-template assets (`src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png`, `public/icons.svg`). Matches `.claudeignore` / `.cursorignore`.

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

### Toolbar filters are visual placeholders
Looks like: Assignee/Licensor/Due/Sort buttons in the board toolbar.
Actually: only **search** works; those filter triggers are disabled placeholders matching Design's Prompt B layout.
Do not change assuming they work: wiring them is open work (§15).

### `react-router-dom` is installed but unused
The app uses a simple auth gate in `App.tsx`, not routes. Router is a dep for the planned deep-link/URL routing (Prompt C `?item=` deep links). Don't assume routing exists yet.

## 12. Credentials and environment

The frontend holds **no secrets** (it's a browser app; all auth is via the backend session cookie).

| Variable | Purpose | Stored where | Required in dev | Required in prod |
|---|---|---|---|---|
| `VITE_DIRECTUS_URL` | Backend API base URL (build-time) | `.env` / `.env.example` (defaults to `https://data.designflow.app` in `src/lib/directus.ts`) | optional | optional (baked at build) |

**Backend-side env this app depends on** (set on the `directus` Coolify service, NOT here): this app's origin must be in `CORS_ORIGIN` and `AUTH_MICROSOFT_REDIRECT_ALLOW_LIST`, with `CORS_CREDENTIALS=true` and the `.designflow.app` session-cookie settings. See `directus` repo AGENTS.md §11/§12.

## 13. Deployment

**Current reality (a temporary preview, not the standard Coolify/CI path):**
- **Build:** `npm run build` → `dist/`, then `docker build -t poppim-web:latest .` (multi-stage node→nginx; `nginx.conf` has the SPA fallback).
- **Run:** `docker rm -f poppim-web` then `docker run -d --name poppim-web --network coolify --label …` with Traefik labels (entrypoints `http`/`https`, `certresolver=letsencrypt`, host `pm-dev.designflow.app`, service port 80). This reuses Coolify's existing Traefik proxy for routing + TLS. The exact `docker run` is documented in the `directus` repo AGENTS.md §11.
- **No GitHub Actions / CI yet. No registry push** (the `gh` token lacks `write:packages`, so GHCR is unavailable; the image is local-only).
- **Runtime env:** `VITE_*` is **baked at build time** (static SPA) — there is no runtime env to change; rebuild to change the backend URL.
- **Rollback:** rebuild from a prior commit and re-run, or `docker run` a prior image tag.
- **SSH/raw-docker:** currently raw `docker run` on the host **IS** the deploy path — this is an **exceptional, temporary** deviation from the org standard (deploy via Coolify + CI). Replacing it with a proper Coolify app at `pm.designflow.app` is open work (§15).

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
| open | Wire board toolbar filters (Assignee/Licensor/Due/Sort) | Currently disabled placeholders (§11); make functional |
| open | Production deploy at `pm.designflow.app` | Replace the raw-docker `pm-dev` preview with a Coolify app + CI (needs a GHCR token or Coolify git build) |
| open | Board "load more past 50 / collapse columns" (Prompt B) | Not yet implemented; board loads a capped page |
| open | List / Timeline views | Tabs exist as placeholders in the board header |
| open | URL deep-linking (`?item=`) for the detail panel (Prompt C) | `react-router-dom` installed but unused |
| open | Durable image storage | Move `cover_url` off ClickUp's CDN into the DAM/R2 (§11) |
| open | Confirm end-to-end Microsoft SSO from a real tenant login | Redirect chain verified; full round-trip unconfirmed |
| open | Delete leftover Vite-template assets | `src/assets/*`, `public/icons.svg` are unused |
| done | Board + task detail + collaboration (assignees/checklist/subtasks/comments) | live |
| done | Design theme (Prompt A), board layout (Prompt B), task-detail layout (Prompt C) | applied |
| done | `@dnd-kit` drag-to-change-stage | live |

See `HANDOFF.md` (when present) for the live continuation state.

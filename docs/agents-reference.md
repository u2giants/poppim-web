---
summary: Detail moved out of the AGENTS.md router — repository structure, task-to-file map, identifiers, services, env/credentials, deploy QUIRKs, pending work.
kind: living
status: current
read-when: AGENTS.md points here for a table, identifier, env var or deploy detail
---

# AGENTS reference — poppim-web

Everything below moved out of `AGENTS.md` so that file stays a small router.
Section numbers keep their historical meaning; `AGENTS.md` links here by topic.

## Shared DB Gatekeeper (full text)

Repository-local task routing is declared in `.ai-devops/task-gates.json` and
verified by `scripts/test-task-gates.sh`. Protected browser, authorization,
deployment, and shared-database paths require their full declared treatment;
acknowledgement never bypasses a database-route refusal.

This repo shares the Supabase backend project `qsllyeztdwjgirsysgai` with the other POP apps. **All** database/schema changes for that shared backend must be authored in the canonical repo [`u2giants/shared-db`](https://github.com/u2giants/shared-db): branch + PR + timestamped migration, preview-first, and the AI merges it before any dependent app code lands here.

Never make app-side DDL in this repo: no inline/startup migrations, no dashboard SQL, no one-off `execute_sql`, no local `supabase/migrations/` folder, and no schema-changing SQL outside the vendored `shared-db/` mirror. The CI workflow `.github/workflows/shared-db-guard.yml` enforces this on `push` and `pull_request`. Legitimate emergency override is explicit only: PR label `db-change-approved`, or `[db-change-approved]` in a commit message.

### Shared query and search performance contract

The production AI-tagging timeout remediation is the reference pattern for
large shared-Supabase lists and searches. Read the auto-synced canonical note at
`shared-db/docs/app-migration-notes/ai-tagging-keyset-timeout-20260714.md`
before changing a high-volume PM query. The DAM-only
`get_ai_tag_candidates(...)` RPC and its indexes are private worker
infrastructure; PM must not call or copy them.

For PM/PIM grids, product/project/order lists, and cross-domain asset pickers:
prefer bounded keyset pagination with a deterministic ID tie-breaker, keep
cursors opaque, select only required columns, and separate optional totals from
list data so a count failure cannot blank the screen. Audit `.range()`, exact
counts, client-side filtering of broad reads, N+1 joins, and nonunique ordering.
Any new view/RPC/index belongs in canonical `shared-db`, must be proven with
representative `EXPLAIN (ANALYZE, BUFFERS)` evidence, and must pass preview
before app code lands. If PM needs DAM discovery, use a purpose-specific,
authorized `api.*` contract rather than direct DAM tables or service-role RPCs.

## Shared-backend startup/shutdown hygiene

Why this exists:
`poppim-web`, `popcrm-web`, and `popdam3` all depend on the same Supabase backend.
An unfinished migration or dirty canonical `u2giants/shared-db` checkout can block
unrelated app commits or, worse, ship a database change without the right preview
checks. Future AI sessions must keep shared-db work isolated and leave the
workspace clean enough for the next vibe-coding session.

Startup checklist:

1. Run `git status --short` in this repo before editing.
2. If the task may touch Supabase schema, RLS, API views/RPCs, generated database
   types, or cross-app data contracts, also run `git status --short` in
   `/worksp/shared-db` before editing.
3. Treat `shared-db/` inside this repo as a read-only mirror. Do not create or
   edit migrations there; use canonical `/worksp/shared-db`.
4. If `/worksp/shared-db` has untracked migrations or unrelated dirty files, stop
   and report them before creating new database work. Do not mix another
   session's shared-db changes into this app's commit.
5. Before creating a shared-db migration, create/switch to a dedicated
   `/worksp/shared-db` branch named for the database change. App repos commit to
   `main`; shared-db uses branch + PR.

Shutdown checklist:

1. Run `git status --short` in this repo and, if touched or inspected for backend
   work, in `/worksp/shared-db`.
2. No untracked shared-db migration may remain. Every shared-db migration must be
   committed on its own branch, stashed with a clear name, or removed if
   abandoned.
3. If shared-db work is incomplete, leave durable handoff text that names the
   branch/stash, migration file, preview/prod apply status, and the next exact
   action.
4. Final reports must separate app commits from shared-db status so the owner can
   keep vibe-coding without becoming the git janitor.

## Repository structure

| Path | What | Ownership |
|---|---|---|
| `src/lib/` | `supabase.ts` (Supabase browser client + OAuth helper), `supabaseQuery.ts` (schema helpers), `database.types.ts` (generated schema types), `types.ts` (app-facing model types), `appState.tsx` (screen/filter/view state), `buildInfo.ts`, `utils.ts` (`cn`, shadcn-generated) | owned (`utils.ts` generated) |
| `src/domain/` | frontend domain adapters/presentation/rollups; converts raw backend records into business UI models such as `ProductSummary` | owned |
| `src/auth/auth.tsx` | `AuthProvider` + `useAuth()` — session check, login, SSO redirect, logout | owned |
| `src/pages/LoginPage.tsx` | login screen | owned |
| `src/components/Sidebar.tsx`, `src/components/Topbar.tsx`, `src/components/PimTaskCard.tsx`, `src/components/TaskDetailModal.tsx` | core app shell, product card, and product detail/workflow modal | owned |
| `src/components/ui/` | **shadcn/ui components — GENERATED** (Radix/new-york). Re-add/update via `npx shadcn@latest add <name>`; hand-edits get overwritten | generated (vendored) |
| `src/features/pipeline/`, `src/features/control-room/`, `src/features/mywork/`, `src/features/projects/`, `src/features/designs/`, `src/features/submissions/`, `src/features/samples/`, `src/features/revisions/`, `src/features/orders/`, `src/features/accounts/`, `src/features/reports/`, `src/features/settings/`, `src/features/operating/` | business screens and PM operating-record APIs over real Supabase data | owned |
| `src/features/board/` | lower-level product/collaboration API helpers (`api.ts`, `collab.ts`) kept for product cards/details | owned |
| `src/App.tsx`, `src/main.tsx`, `src/index.css` | root gate/providers, entry, theme tokens (`index.css` holds the Design-provided OKLCH theme) | owned |
| `index.html`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `components.json` | build/tooling config | owned |
| `Dockerfile`, `nginx.conf`, `.dockerignore` | container build (multi-stage node→nginx, SPA fallback) | owned |
| `.env`, `.env.example` | `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (publishable, not secret) | owned |
| `src/assets/pop-logo.png` | app logo used in Topbar | owned |
| `node_modules/`, `dist/` | install / build artifacts | ignore |

No third-party framework source is vendored or modified (React/Radix/etc. are npm deps).

## Prime Directive: custom-code boundary

Our custom code lives here:

- `src/features/` — app features and business workflow screens
- `src/domain/` — business-facing adapters and presentation logic
- `src/auth/`, `src/pages/`, `src/components/AppShell.tsx` — app shell + auth
- `src/lib/supabase.ts`, `src/lib/supabaseQuery.ts`, `src/lib/types.ts` — backend access
- `src/index.css` — theme tokens (from Claude Design)
- `docs/`, `AGENTS.md`, `README.md`, `CLAUDE.md`
- `Dockerfile`, `nginx.conf`, `.github/workflows/`

Everything else requires justification before touching — especially **`src/components/ui/` (generated shadcn)**: change those via the shadcn CLI, not by hand, or upgrades overwrite your edits.

## Core modification inventory

No files **outside project-owned areas** were modified — no third-party/framework source is vendored here. The only "generated" code in-tree is the shadcn `src/components/ui/*` + `src/lib/utils.ts`, managed by the shadcn CLI.

| File | Change made | Why it was necessary | Risk during upgrades |
|---|---|---|---|
| `tsconfig.json`, `tsconfig.app.json` | Added `paths` `@/*` → `src/*` (no `baseUrl` — deprecated in TS7) | shadcn/import alias | re-check if shadcn CLI rewrites tsconfig |
| `vite.config.ts` | Added `@tailwindcss/vite` plugin + `@` alias | Tailwind v4 + alias | low |
| `components.json` | `style: "new-york"` (Radix), not the CLI default `base-nova` (Base UI) | see `docs/quirks.md` | re-adding components uses this style |

## Task-to-file navigation: what to edit for common changes

| Task | Files to touch | Files not to touch |
|---|---|---|
| Change the product pipeline board | `src/features/pipeline/PipelinePage.tsx`, `src/components/PimTaskCard.tsx`, `src/features/pipeline/api.ts`, `src/domain/products/*` | `src/components/ui/*` by hand |
| Change the product-detail modal | `src/components/TaskDetailModal.tsx`, `src/features/board/collab.ts`, `src/features/workflow/api.ts` | — |
| Change workflow screens/actions | `src/features/workflow/api.ts`, `src/features/submissions/`, `src/features/samples/`, `src/features/revisions/`, `src/features/mywork/` | backend schema in canonical `shared-db` |
| Change dependencies, decision records, reminders, or workflow templates | `src/features/operating/api.ts`, `src/components/TaskDetailModal.tsx`, `src/features/mywork/`, `src/features/settings/`, `src/features/reports/` | backend schema in canonical `shared-db` |
| Change what data is fetched/written | feature `api.ts` files, `src/domain/products/*`, `src/lib/types.ts` | the backend schema (edit in canonical `shared-db`) |
| Change auth/login | `src/auth/auth.tsx`, `src/pages/LoginPage.tsx`, `src/lib/supabase.ts` | — |
| Add a shadcn component | `npx shadcn@latest add <name>` (writes `src/components/ui/`) | hand-writing UI primitives |
| Change brand theme/tokens | `src/index.css` (`:root`/`.dark` OKLCH blocks) | component files for colors |
| Add an env var | `.env.example`, `src/lib/supabase.ts`, `docs/configuration.md` | committing real `.env` |
| Change the deploy/container | `Dockerfile`, `nginx.conf`, `docs/cicd.md` | prod containers directly |

## Data model and external identifiers

This app only **reads/writes** the backend; canonical schema, RLS, realtime, and migration rules live in `u2giants/shared-db`. Identifiers it depends on:

| Entity/System | Identifier | Where defined | Notes |
|---|---|---|---|
| Backend API | `https://qsllyeztdwjgirsysgai.supabase.co` | Supabase project config (`VITE_SUPABASE_URL`) | shared Supabase.com backend; **never** the human URL |
| This app (production) | `https://pm.designflow.app` | Coolify service `ysvdyj3t7d5tyh5ogrvlka4y` (GHCR image) | **live** — permanent human URL |
| This app (aliases) | `https://pm-dev.designflow.app`, `https://pm-ci.designflow.app` | same Coolify service | preview / CI-validation |
| GHCR image | `ghcr.io/u2giants/poppim-web` | GitHub Actions | **public** package; tags `:main` + `:sha-<commit>` |
| Repo | `u2giants/poppim-web` | GitHub | |
| Backend tables/views read | `api.pm_product_board`, `pim.product`, `pim.project`, `pim.design`, `pim.design_collection`, `pim.product_submission`, `pim.product_sample`, `pim.revision_request`, `pim.customer_order`, `core.*` lookup tables | `u2giants/shared-db` | business screens |
| Collaboration tables | `pim.checklist_item`, `pim.product_assignee`, `pim.product_file`, `pim.product_update`, `pim.product_tag`, `pim.product_field`, `pim.product_link`, `pim.product_time_entry`, `app.comment`, `app.activity` | `u2giants/shared-db` | task-detail |
| PM operating records | `app.activity` for dependencies/decisions, `app.notification` for reminders, `pim.saved_view` for workflow-template config | `u2giants/shared-db` | Product modal Operations tab, My Work reminders, Settings templates, Reports operating metrics |
| Image field | `pim.product.cover_url` | `u2giants/shared-db`; historical data migrated from ClickUp/Spaces | DigitalOcean Spaces original; thumbnails/auto-cover fallbacks are derived in `src/domain/products/*` |
| ClickUp board mirror fields | `pim.product.clickup_parent_id`, `pim.product.clickup_status`, and ClickUp list/order metadata in `pim.product.metadata` / `api.pm_product_board` | `u2giants/shared-db` | Used by the pipeline to mirror ClickUp top-level open board cards |
| Saved views | `pim.saved_view` and `pim.view_pref` | `u2giants/shared-db` | Sidebar Space=department → Master + views; `src/features/views/api.ts`. See `docs/quirks.md` |

Do not rename these identifiers casually — both repos depend on them.

## Container and service inventory

| Container/service | Purpose | Managed by | App/project ID | Image/source |
|---|---|---|---|---|
| `poppim-web-ysvdyj3t7d5tyh5ogrvlka4y` | This frontend (prod) — pulls the CI image | **Coolify** | service uuid `ysvdyj3t7d5tyh5ogrvlka4y`, project `jdq36h5dq74o6ddhich9l796` | `ghcr.io/u2giants/poppim-web:main` |
| Supabase project `qsllyeztdwjgirsysgai` | Shared PM/CRM/DAM/PLM backend this app calls | Supabase.com | canonical schema repo: `u2giants/shared-db` | Supabase hosted Postgres/API |

## Credentials and environment

The frontend holds **no secrets** (it's a browser app; Supabase anon keys are publishable, but service-role keys and backend secrets must never be exposed).

| Variable | Purpose | Stored where | Required in dev | Required in prod |
|---|---|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL (build-time) | `.env` / `.env.example` | yes | yes (baked at build) |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable anon key (build-time) | `.env` / `.env.example` / CI build env | yes | yes (baked at build; never use service-role keys) |
| `VITE_BUILD_GIT_SHA`, `VITE_BUILD_COMMIT_DATE`, `VITE_BUILD_RUN` | Build metadata displayed in the top bar and used for deploy verification | Set by Docker build args in CI; local fallback in `vite.config.ts` | no | set by workflow |

**Backend-side config this app depends on:** shared schema, RLS, realtime, and migrations live in `u2giants/shared-db` and are applied to the Supabase.com project. Do not expose service-role keys through frontend env.

**Shared-db migration credential:** the direct Postgres migration password is stored in 1Password, vault `vibe_coding`, item `Supabase DB Password - shared POP database`, field `password`. Use it as `SUPABASE_DB_PASSWORD` for `supabase db push --dry-run` / `supabase db push`; never print or commit the value. Verified on 2026-06-22/23: `supabase link --project-ref qsllyeztdwjgirsysgai` and `SUPABASE_DB_PASSWORD=... supabase db push --dry-run` succeeded and reported the remote database up to date.

## Deployment (full detail)

**LIVE pipeline (the only deploy path — see `docs/cicd.md`):** push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) verify → build → push `ghcr.io/u2giants/poppim-web:main`+`:sha-<commit>` → trigger Coolify (service `poppim-web`, uuid `ysvdyj3t7d5tyh5ogrvlka4y`) → Coolify pulls + runs. Actions never touches the server. **A merge to `main` is the entire deploy.** `main` is protected (2026-10-30): PR + approval by code owner `u2giants` required; Albert's admin account can still bypass. The GHCR package is **public**, so Coolify pulls anonymously (no registry cred).

- **Production:** `pm.designflow.app` is served by the Coolify service (container `poppim-web-ysvdyj3t7d5tyh5ogrvlka4y`); `pm-dev`/`pm-ci` point at the same service. Domains bound via the Coolify sub-app `fqdn` (`service_applications` id=17).
- **Rollback:** redeploy a prior `:sha-<commit>` image tag via Coolify (`docs/cicd.md`).
- **Retired:** the legacy raw-`docker run` deploy was removed at cutover (2026-06-11). `docs/deployment.md` documents it for history only — do not reintroduce raw docker.
- Supabase.com is the backend owner; this app's human URL is `pm.designflow.app`.
- **Runtime env:** `VITE_*` is **baked at build time** (static SPA) — there is no runtime env to change; rebuild to change the backend URL.
- **§QUIRK-1 — service vs application:** `poppim-web` is a Coolify *service* (docker-compose), not a Coolify *application*. The alternative `/api/v1/deploy?uuid=` endpoint silently no-ops on services (returns HTTP 200, does nothing). See `docs/cicd.md` §QUIRK-1.
- **§QUIRK-3 — restart does NOT pull `:main`:** `GET /services/{uuid}/restart` reuses the locally-cached image, so pushing a new `:main` and restarting kept serving the OLD bundle (this caused a full day of "my changes aren't live"). The workflow now `PATCH`es the service `docker_compose_raw` (base64-encoded — plain text returns 422) to the immutable `:sha-<commit>` tag, **then** restarts; a never-cached SHA tag forces a GHCR pull. Do not revert to restart-on-`:main`. See `docs/cicd.md` §QUIRK-3.
- **§QUIRK-2 — Caddy intercepts `/version.json`:** Coolify's Caddy layer applies `try_files` before nginx, so `https://pm.designflow.app/version.json` returns the SPA shell — it cannot be polled to confirm a deploy. The CI verify step checks the `build-sha` meta tag in the served HTML instead. See `docs/cicd.md` §QUIRK-2.
- **Top-bar build badge:** `src/components/Topbar.tsx` displays the short commit SHA and commit timestamp in `America/New_York`, sourced from `src/lib/buildInfo.ts`. Do not turn this into runtime config; it is intentionally baked into the static build for auditability.

## Pending work

| Status | Item | Owner/next action |
|---|---|---|
| open | List / Timeline views | Table view exists; Timeline tab is a placeholder |
| partial | Durable storage for product-file attachments | Backend copied 20,234 / 20,281 imported `product_file` rows to Spaces on 2026-06-14. Follow-ups recovered additional reachable rows; as of 2026-06-26 the retired source had 20,245 / 20,291 stored and 46 remaining ClickUp source URLs returning 403/404/416 or no useful bytes even with token. Recover those source bytes from old exports/NAS/user uploads if required. |
| open | Confirm end-to-end Microsoft SSO from a real tenant login | Redirect chain verified; full round-trip unconfirmed |

Continuation work in flight lives in `HANDOFF.d/` (see the `HANDOFF.md` pointer), not in this table.

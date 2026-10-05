# AGENTS.md — poppim-web

Canonical operating guide for **poppim-web**. Read this first; it routes you to everything else.

## 1. Project summary
`poppim-web` is the **PIM (product/project management) frontend** for POP Creations — a React single-page app that is the human UI for the product-development pipeline, replacing the ClickUp board. **Users:** internal staff (designers, sales, licensing, management). It stores **no data of its own**; every read/write goes through the **shared Supabase.com backend** at `https://qsllyeztdwjgirsysgai.supabase.co` (shared schema repo: `u2giants/shared-db`). The outcome that matters: a fast, tailored Kanban + task-detail app on the company's shared "super-app" database, so PIM data interlinks with CRM/DAM. Sibling frontends (separate repos): `popcmr-web` (CRM), `popdam-web` (DAM).

**Live in production:** `https://pm.designflow.app` (the permanent human URL). Preview aliases `pm-dev` and `pm-ci` serve the same Coolify service. Deploy via `git push main` — see §13 and `docs/cicd.md`.

**Backend direction:** this app is now on the shared **Supabase.com** backend (one DB for PM/CRM/DAM/PLM). For schema, RLS, realtime, migration, or cross-app changes, read `shared-db/AGENTS.md` first and update the canonical `u2giants/shared-db` repo; this repo should not carry app-only permanent DDL.

## Shared DB Gatekeeper

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

## AI tool notes

Claude Code uses .claudeignore. Other tools follow **What to ignore** below.

## Documentation map: what to read for each task

Business logic is companywide and organized by topic, not by application. Start at
[companywide application and task map](https://github.com/u2giants/shared-db/blob/main/docs/business-rules/application-map.md)
and load only the topics the task touches. This repo documents PM/PIM implementation; it
must not maintain a competing copy of a business rule.

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
| Change CI/CD, the release pipeline, GitHub Actions, registry, deploy trigger | `AGENTS.md`, **`docs/cicd.md`**, `.github/workflows/deploy.yml`; also update `u2giants/albert-standards` infrastructure docs if the change affects shared server/operations standards | local-only dev docs |
| Change how data is read/written (tables/views, fields, Supabase client calls) | `AGENTS.md`, `docs/architecture.md`, **`shared-db/AGENTS.md`** if schema/RLS/view changes are involved | deployment docs |
| Touch the shared Supabase database, schema/migrations, or any cross-app work | **`shared-db/AGENTS.md`** (read first — the cross-app coordination playbook: main-only here, branch+PR in `shared-db`, the four anti-collision rules, and the merge protocol) | app-screen-only docs |
| Investigate a bug/incident | `AGENTS.md` §11 + §14, `HANDOFF.md` if present | unrelated docs |
| Continue unfinished work | `AGENTS.md` §15, **`HANDOFF.md`** (required reading when present) | docs outside the handoff scope |
| Product scope / "what's built vs. missing" / roadmap | **`gaps.md`** — reconciled current-state: every gap re-checked against the live code on 2026-06-21 and tagged DONE/PARTIAL/OPEN with file evidence (authoritative for what exists). `docs/architecture-update-implementation-plan.md` is the original aspirational roadmap/spec, kept for historical reference only | day-to-day screen/deploy docs |
| Implement the Jev activity-triage pilot | **`plan_jev_activity_triage.md`** — read its STATUS table first; issue #9 owns the open work. Also read `bugs.md` for the audited fit/no-fit reasoning. | unrelated roadmap/history docs |
| Pull secrets from 1Password (MCP server or `op` CLI), service-account tokens, `op://` references | **`docs/1password.md`** | unrelated app/deploy docs |
| Set up or use ClickUp MCP for migration audits, or revise the PM gap-review PDF | **`docs/clickup-mcp.md`**, `docs/1password.md`, `docs/clickup-poppim-gap-review.html` (source), `docs/clickup-poppim-gap-review.pdf` (output) | deployment docs |
| Surprising behavior | `AGENTS.md`, [`docs/quirks.md`](docs/quirks.md) | Incident history |
| Claude Code session | `CLAUDE.md`, then `AGENTS.md` | other docs unless needed |
| Documentation-only cleanup | `AGENTS.md`, `README.md`, affected `docs/` | source except to verify accuracy |

## Shared infrastructure standards

The cross-project infrastructure/server operating reference lives in [`u2giants/albert-standards`](https://github.com/u2giants/albert-standards), especially [`infrastructure/README.md`](https://github.com/u2giants/albert-standards/blob/main/infrastructure/README.md), [`infrastructure/CLAUDE.md`](https://github.com/u2giants/albert-standards/blob/main/infrastructure/CLAUDE.md), and [`.ai/AI_INFRASTRUCTURE_GUIDE.md`](https://github.com/u2giants/albert-standards/blob/main/.ai/AI_INFRASTRUCTURE_GUIDE.md). When this repo changes non-code infrastructure, hosting, server topology, deploy mechanics, runtime ownership, domains, or operations decisions that apply beyond one source file, update those standards docs in the same session.

## Host/server boundary

This repo is app-layer only. Durable host/OS changes belong in the canonical Ansible repo at `/worksp/ansible` / [`u2giants/ansible`](https://github.com/u2giants/ansible): packages, users, firewall, SSH/sudo, Docker engine or daemon config, systemd units/timers, cron, `/etc`, `/usr/local/bin`, `/usr/local/sbin`, Cloudflare Tunnel 1, Coolify host glue, and backup/DNS watchdogs.

Do not SSH, sudo, or edit the host directly for durable infrastructure changes. Make a PR in `/worksp/ansible` and let GitHub Actions apply it. App code and app-owned config still change here and deploy through this repo's normal pipeline/Coolify. Break-glass direct host repair is allowed only when explicitly called out, and must be followed by an Ansible PR that captures or reconciles the drift.

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

## 4. Repository structure

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
| `node_modules/`, `dist/` | install / build artifacts | ignore (§10) |

No third-party framework source is vendored or modified (React/Radix/etc. are npm deps).

## 5. Prime Directive: custom-code boundary

Our custom code lives here:

- `src/features/` — app features and business workflow screens
- `src/domain/` — business-facing adapters and presentation logic
- `src/auth/`, `src/pages/`, `src/components/AppShell.tsx` — app shell + auth
- `src/lib/supabase.ts`, `src/lib/supabaseQuery.ts`, `src/lib/types.ts` — backend access
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
| Change the product pipeline board | `src/features/pipeline/PipelinePage.tsx`, `src/components/PimTaskCard.tsx`, `src/features/pipeline/api.ts`, `src/domain/products/*` | `src/components/ui/*` by hand |
| Change the product-detail modal | `src/components/TaskDetailModal.tsx`, `src/features/board/collab.ts`, `src/features/workflow/api.ts` | — |
| Change workflow screens/actions | `src/features/workflow/api.ts`, `src/features/submissions/`, `src/features/samples/`, `src/features/revisions/`, `src/features/mywork/` | backend schema in canonical `shared-db` |
| Change dependencies, decision records, reminders, or workflow templates | `src/features/operating/api.ts`, `src/components/TaskDetailModal.tsx`, `src/features/mywork/`, `src/features/settings/`, `src/features/reports/` | backend schema in canonical `shared-db` |
| Change what data is fetched/written | feature `api.ts` files, `src/domain/products/*`, `src/lib/types.ts` | the backend schema (edit in canonical `shared-db`) |
| Change auth/login | `src/auth/auth.tsx`, `src/pages/LoginPage.tsx`, `src/lib/supabase.ts` | — |
| Add a shadcn component | `npx shadcn@latest add <name>` (writes `src/components/ui/`) | hand-writing UI primitives |
| Change brand theme/tokens | `src/index.css` (`:root`/`.dark` OKLCH blocks) | component files for colors |
| Add an env var | `.env.example`, `src/lib/supabase.ts`, `docs/configuration.md` | committing real `.env` |
| Change the deploy/container | `Dockerfile`, `nginx.conf`, `docs/deployment.md` | prod containers directly |

## 8. Data model and external identifiers

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
| Saved views | `pim.saved_view` and `pim.view_pref` | `u2giants/shared-db` | Sidebar Space=department → Master + views; `src/features/views/api.ts`. See §11 quirks |

Do not rename these identifiers casually — both repos depend on them.

## 9. Container and service inventory

| Container/service | Purpose | Managed by | App/project ID | Image/source |
|---|---|---|---|---|
| `poppim-web-ysvdyj3t7d5tyh5ogrvlka4y` | This frontend (prod) — pulls the CI image | **Coolify** | service uuid `ysvdyj3t7d5tyh5ogrvlka4y`, project `jdq36h5dq74o6ddhich9l796` | `ghcr.io/u2giants/poppim-web:main` |
| Supabase project `qsllyeztdwjgirsysgai` | Shared PM/CRM/DAM/PLM backend this app calls | Supabase.com | canonical schema repo: `u2giants/shared-db` | Supabase hosted Postgres/API |

## 10. What to ignore

Do not load these into AI context: `node_modules/`, `dist/`, `.env`, `*.local`, `.cache/`, `coverage/`, and the leftover Vite-template assets (`src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png`, `public/icons.svg`). Matches `.claudeignore` / `.cursorignore`.

`shared-db/` is a **read-only synced mirror** of the canonical `u2giants/shared-db` repo (auto-overwritten on each push). For cross-app/Supabase work read only `shared-db/AGENTS.md` (and the named migration plan) — do **not** bulk-load `shared-db/supabase/` or `shared-db/docs/`, and never hand-edit anything under `shared-db/` (edit the canonical repo instead).

## 11. Intentional quirks and non-obvious decisions

Full text lives in [docs/quirks.md](docs/quirks.md). Load it when a board, filter, saved view, ClickUp sync, or permission path behaves surprisingly.

## 12. Credentials and environment

The frontend holds **no secrets** (it's a browser app; Supabase anon keys are publishable, but service-role keys and backend secrets must never be exposed).

| Variable | Purpose | Stored where | Required in dev | Required in prod |
|---|---|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL (build-time) | `.env` / `.env.example` | yes | yes (baked at build) |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable anon key (build-time) | `.env` / `.env.example` / CI build env | yes | yes (baked at build; never use service-role keys) |
| `VITE_BUILD_GIT_SHA`, `VITE_BUILD_COMMIT_DATE`, `VITE_BUILD_RUN` | Build metadata displayed in the top bar and used for deploy verification | Set by Docker build args in CI; local fallback in `vite.config.ts` | no | set by workflow |

**Backend-side config this app depends on:** shared schema, RLS, realtime, and migrations live in `u2giants/shared-db` and are applied to the Supabase.com project. Do not expose service-role keys through frontend env.

**Shared-db migration credential:** the direct Postgres migration password is stored in 1Password, vault `vibe_coding`, item `Supabase DB Password - shared POP database`, field `password`. Use it as `SUPABASE_DB_PASSWORD` for `supabase db push --dry-run` / `supabase db push`; never print or commit the value. Verified on 2026-06-22/23: `supabase link --project-ref qsllyeztdwjgirsysgai` and `SUPABASE_DB_PASSWORD=... supabase db push --dry-run` succeeded and reported the remote database up to date.

## 13. Deployment

**LIVE pipeline (the only deploy path — see `docs/cicd.md`):** push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) verify → build → push `ghcr.io/u2giants/poppim-web:main`+`:sha-<commit>` → trigger Coolify (service `poppim-web`, uuid `ysvdyj3t7d5tyh5ogrvlka4y`) → Coolify pulls + runs. Actions never touches the server. **A `git push` to `main` is the entire deploy.** The GHCR package is **public**, so Coolify pulls anonymously (no registry cred).

- **Production:** `pm.designflow.app` is served by the Coolify service (container `poppim-web-ysvdyj3t7d5tyh5ogrvlka4y`); `pm-dev`/`pm-ci` point at the same service. Domains bound via the Coolify sub-app `fqdn` (`service_applications` id=17).
- **Rollback:** redeploy a prior `:sha-<commit>` image tag via Coolify (`docs/cicd.md`).
- **Retired:** the legacy raw-`docker run` deploy was removed at cutover (2026-06-11). `docs/deployment.md` documents it for history only — do not reintroduce raw docker.
- Supabase.com is the backend owner; this app's human URL is `pm.designflow.app`.
- **Runtime env:** `VITE_*` is **baked at build time** (static SPA) — there is no runtime env to change; rebuild to change the backend URL.
- **§QUIRK-1 — service vs application:** `poppim-web` is a Coolify *service* (docker-compose), not a Coolify *application*. The alternative `/api/v1/deploy?uuid=` endpoint silently no-ops on services (returns HTTP 200, does nothing). See `docs/cicd.md §QUIRK-1`.
- **§QUIRK-3 — restart does NOT pull `:main`:** `GET /services/{uuid}/restart` reuses the locally-cached image, so pushing a new `:main` and restarting kept serving the OLD bundle (this caused a full day of "my changes aren't live"). The workflow now `PATCH`es the service `docker_compose_raw` (base64-encoded — plain text returns 422) to the immutable `:sha-<commit>` tag, **then** restarts; a never-cached SHA tag forces a GHCR pull. Do not revert to restart-on-`:main`. See `docs/cicd.md §QUIRK-3`.
- **§QUIRK-2 — Caddy intercepts `/version.json`:** Coolify's Caddy layer applies `try_files` before nginx, so `https://pm.designflow.app/version.json` returns the SPA shell — it cannot be polled to confirm a deploy. The CI verify step checks the `build-sha` meta tag in the served HTML instead. See `docs/cicd.md §QUIRK-2`.
- **Top-bar build badge:** `src/components/Topbar.tsx` displays the short commit SHA and commit timestamp in `America/New_York`, sourced from `src/lib/buildInfo.ts`. Do not turn this into runtime config; it is intentionally baked into the static build for auditability.

## 14. Critical incidents

Full text lives in [docs/critical-incidents.md](docs/critical-incidents.md).

## 15. Pending work

| Status | Item | Owner/next action |
|---|---|---|
| open | List / Timeline views | Table view exists; Timeline tab is a placeholder |
| partial | Durable storage for product-file attachments | Backend copied 20,234 / 20,281 imported `product_file` rows to Spaces on 2026-06-14. Follow-ups recovered additional reachable rows; as of 2026-06-26 the retired source had 20,245 / 20,291 stored and 46 remaining ClickUp source URLs returning 403/404/416 or no useful bytes even with token. Recover those source bytes from old exports/NAS/user uploads if required. |
| open | Confirm end-to-end Microsoft SSO from a real tenant login | Redirect chain verified; full round-trip unconfirmed |

Create `HANDOFF.md` only for an active, unresolved continuation item.
<!-- ansible-host-policy: managed rollout from u2giants/ansible -->
## Host / server changes — do NOT make them here

The `hetz` server's host/OS layer is managed by **Ansible** in **[`u2giants/ansible`](https://github.com/u2giants/ansible)**.
To change the server (packages, users, firewall, DNS, Docker *engine* config, system cron,
systemd units, Cloudflare Tunnel 1, the backup watchdog), **open a PR there** and let CI apply
it — **never** SSH into the box and hand-edit it. Manual changes are drift and get reverted by
the next apply. See [`u2giants/ansible/AGENTS.md`](https://github.com/u2giants/ansible/blob/main/AGENTS.md).

This repo is **not** the host layer. Its own changes belong here and deploy through their normal
pipeline (e.g. Coolify). Don't put host-level changes here, and don't manage this service's
container with Ansible. Scope boundary: **Ansible owns the host; Coolify owns the apps.**

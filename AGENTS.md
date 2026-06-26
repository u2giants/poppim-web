# AGENTS.md — poppim-web

Canonical operating guide for **poppim-web**. Read this first; it routes you to everything else.

## 1. Project summary
`poppim-web` is the **PIM (product/project management) frontend** for POP Creations — a React single-page app that is the human UI for the product-development pipeline, replacing the ClickUp board. **Users:** internal staff (designers, sales, licensing, management). It stores **no data of its own**; every read/write goes through the **shared Supabase.com backend** at `https://qsllyeztdwjgirsysgai.supabase.co` (shared schema repo: `u2giants/shared-db`). The outcome that matters: a fast, tailored Kanban + task-detail app on the company's shared "super-app" database, so PIM data interlinks with CRM/DAM. Sibling frontends (separate repos): `popcmr-web` (CRM), `popdam-web` (DAM).

**Live in production:** `https://pm.designflow.app` (the permanent human URL). Preview aliases `pm-dev` and `pm-ci` serve the same Coolify service. Deploy via `git push main` — see §13 and `docs/cicd.md`.

**Backend direction:** this app is now on the shared **Supabase.com** backend (one DB for PM/CRM/DAM/PLM). For schema, RLS, realtime, migration, or cross-app changes, read `shared-db/AGENTS.md` first and update the canonical `u2giants/shared-db` repo; this repo should not carry app-only permanent DDL.

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
| Change CI/CD, the release pipeline, GitHub Actions, registry, deploy trigger | `AGENTS.md`, **`docs/cicd.md`**, `.github/workflows/deploy.yml`; also update `u2giants/albert-standards` infrastructure docs if the change affects shared server/operations standards | local-only dev docs |
| Change how data is read/written (tables/views, fields, Supabase client calls) | `AGENTS.md`, `docs/architecture.md`, **`shared-db/AGENTS.md`** if schema/RLS/view changes are involved | deployment docs |
| Touch the shared Supabase database, schema/migrations, or any cross-app work | **`shared-db/AGENTS.md`** (read first — the cross-app coordination playbook: main-only here, branch+PR in `shared-db`, the four anti-collision rules, and the merge protocol) | app-screen-only docs |
| Investigate a bug/incident | `AGENTS.md` §11 + §14, `HANDOFF.md` if present | unrelated docs |
| Continue unfinished work | `AGENTS.md` §15, **`HANDOFF.md`** (required reading when present) | docs outside the handoff scope |
| Product scope / "what's built vs. missing" / roadmap | **`gaps.md`** — reconciled current-state: every gap re-checked against the live code on 2026-06-21 and tagged DONE/PARTIAL/OPEN with file evidence (authoritative for what exists). `docs/architecture-update-implementation-plan.md` is the original aspirational roadmap/spec, kept for historical reference only | day-to-day screen/deploy docs |
| Pull secrets from 1Password (MCP server or `op` CLI), service-account tokens, `op://` references | **`docs/1password.md`** | unrelated app/deploy docs |
| Claude Code session | `CLAUDE.md`, then `AGENTS.md` | other docs unless needed |
| Documentation-only cleanup | `AGENTS.md`, `README.md`, affected `docs/` | source except to verify accuracy |

## Shared infrastructure standards

The cross-project infrastructure/server operating reference lives in [`u2giants/albert-standards`](https://github.com/u2giants/albert-standards), especially [`infrastructure/README.md`](https://github.com/u2giants/albert-standards/blob/main/infrastructure/README.md), [`infrastructure/CLAUDE.md`](https://github.com/u2giants/albert-standards/blob/main/infrastructure/CLAUDE.md), and [`.ai/AI_INFRASTRUCTURE_GUIDE.md`](https://github.com/u2giants/albert-standards/blob/main/.ai/AI_INFRASTRUCTURE_GUIDE.md). When this repo changes non-code infrastructure, hosting, server topology, deploy mechanics, runtime ownership, domains, or operations decisions that apply beyond one source file, update those standards docs in the same session.

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

### Supabase is the backend API/database, not the frontend runtime
What changed:
The 2026-06-22/23 migration removed the old backend SDK client from this repo and rewired the React app to use `@supabase/supabase-js` against `https://qsllyeztdwjgirsysgai.supabase.co`.

Why:
The frontend is still the custom React/TypeScript SPA in this repo, built by GitHub Actions and served by Coolify/nginx at `pm.designflow.app`. Supabase owns auth, API, database schema, RLS, realtime, and storage; it is not where the SPA is hosted.

Future sessions should:
When describing or changing this app, say "frontend data/auth layer uses Supabase" rather than "frontend runs on Supabase." Frontend runtime/deploy issues belong in this repo/Coolify; schema/RLS/migration issues belong in canonical `u2giants/shared-db`.

### shadcn uses the `new-york` (Radix) style, not the CLI default
Looks like: `components.json` has `style: "new-york"` and components import from `radix-ui`, even though `npx shadcn init` now defaults to `base-nova` (Base UI).
Actually: we deliberately switched to the Radix-based `new-york` style.
Why: Base UI uses a `render` prop instead of Radix's `asChild`, and most shadcn docs/examples assume Radix — for an AI-assisted, docs-driven workflow that mismatch caused friction (and an unused-`React`-import build error).
Do not change because: reverting to Base UI breaks every `asChild` usage and diverges from the examples future sessions will copy.

### Auth uses Supabase Auth in the browser
`src/lib/supabase.ts` creates the browser client with `persistSession`, `autoRefreshToken`, and `detectSessionInUrl`. Microsoft sign-in goes through `supabase.auth.signInWithOAuth({ provider: 'azure' })`, and `src/auth/auth.tsx` resolves the app profile through `api.current_user_profile`.
Do not reintroduce an app-owned token store or a legacy backend SSO URL. Supabase Auth owns the session lifecycle.

### `PimTaskCard` needs `shrink-0`
Looks like: a stray `shrink-0` on the card.
Actually: cards are flex children in a fixed-height column; without `shrink-0` they get squeezed by flex-shrink to ~2px and the column won't scroll.
Why/Do not change: removing it collapses every card (this exact bug shipped once — see §14).

### `cover_url` points at Spaces originals; thumbnails are derived
Looks like: the frontend only reads `product.cover_url`, but cards show a smaller thumbnail.
Actually: `cover_url` is the DigitalOcean Spaces original uploaded by the backend migration. `src/domain/products/adapters.ts` derives `covers/<product-id>_thumb.webp` for cards when the original URL is in the Spaces `covers/` prefix; `TaskDetailModal` opens the original.
Why: the user explicitly wanted originals stored without resizing, while cards need fast thumbnails.
Do not change because: replacing `cover_url` with a resized file would lose the original. If a thumb 404s, `PimTaskCard` falls back to the original once.

### Runtime app code no longer uses mock tasks
What changed:
The generic `MockTask` layer and `src/lib/mockData.ts` were removed from runtime code. `ProductSummary` in `src/domain/products/types.ts` is now the board/detail view model, and raw backend data is adapted in `src/domain/products/adapters.ts`.

Why:
The app is no longer a ClickUp-board demo; it now works from real business objects and workflow tables in Supabase.

Future sessions should:
Do not reintroduce generic task-shaped mock data into real screens. Use Supabase-backed feature APIs and add isolated fixtures only for tests/stories if those are introduced later.

### Workflow search filters must be collection-specific
What changed:
`src/features/workflow/api.ts` uses separate search filters for submissions, samples, and revisions.

Why:
The backend rejects filters on fields that do not exist on the target table/view. A shared workflow search filter looked convenient but queried fields like `body` on samples and `portal_reference` on revisions.

Future sessions should:
When adding fields to search, confirm the field exists on that collection or relation before adding it to the `_or` filter.

### Pipeline filters are server-side (Supabase)
Search and licensor filters are pushed to the backend. The pipeline loads a bounded product set for the active department, with count/truncation UI when applicable. Search is debounced 300 ms; stale fetch results are discarded via an incrementing ref.
Do not assume: all 15K+ products are loaded at once — they aren't.

### Departments are hard-separated, not optional filters
What changed:
The app-level departments are `Licensed`, `Generic`, and `Software`. `Licensed` maps to legacy backend values `POP` / `POP Creations`; `Generic` maps to `Spruce` / `Spruce Line`; `Software` maps to `Software`.

Why:
The user explicitly rejected a mixed `All` board/filter model. These departments should never mix in the live app.

Future sessions should:
Do not reintroduce an `All` department tab or treat department as a casual filter. If backend values are renamed later, update the alias logic in `src/domain/products/adapters.ts` and each feature API's department clause.

### Pipeline departments mirror live ClickUp top-level open cards
What changed:
The product pipeline has three hard-separated departments: `Licensed`, `Generic`, and `Software`. Each department excludes ClickUp subtasks via `clickup_parent_id _null`, excludes closed/done ClickUp statuses via `clickup_status_type _in ['open', 'custom']`, and sorts by `-clickup_updated_at`. It is intentionally not limited to the old `Licensing Management` list because the backend parity pass imports all live ClickUp lists into department-specific product rows.

Why:
ClickUp's Board views showed top-level open tasks sorted by "Date updated"; Poppim was previously mixing departments, hiding non-`Licensing Management` lists, subtasks, closed/done historical records, and unsorted rows.

Future sessions should:
If cards or counts drift from ClickUp, first verify `business_unit`, `clickup_parent_id`, `clickup_status_type`, `clickup_list_name`, and `clickup_updated_at` in Supabase before changing frontend grouping. A 2026-06-14 backend audit matched 17,859 live ClickUp task ids to 17,859 Poppim external ids with 0 missing and 0 extra.

### No client-side router
The app uses a simple auth gate in `App.tsx`, not routes. Deep-linking is done with `history.replaceState` + `URLSearchParams` (`?item=<uuid>`). `react-router-dom` is installed but not used — don't add route components without a clear reason.

### Department switch clears the List filter via the topbar tab onClick, NOT a reactive effect
What changed:
Switching department (Licensed/Generic/Software) clears `filterListNames`. This is done in the `BUSINESS_UNITS` button `onClick` in `Topbar.tsx`, not in a `useEffect` watching `businessUnit`.
Why:
A reactive effect (`if prevBusinessUnit !== businessUnit → clear`) was tried first and clobbered the sidebar Spaces tree: clicking a list sets department + list filter together, and the effect fired on the department change and wiped the just-set filter. Lists are department-specific, so a stale filter must clear on an *explicit* tab switch only.
Future sessions should:
Do not move this back into a `useEffect`. If you add another way to switch department, clear `filterListNames` in that same explicit handler.

### ClickUp orderindex is a string; sort numerically, and it truncates past 5,000
What changed:
`clickup_orderindex` is stored as a 32-decimal varchar (exceeds float64). `adapters.ts` parses it with `Number()` into `ProductSummary.clickupOrderindex`; `PipelinePage` sorts cards within each kanban column / table group by it (`byOrderindex`, nulls last).
Why:
Lexical string sort is wrong ("10" < "5"). Ordering is only *exact* within a single list; across lists in one stage column it's a stable secondary order. The pipeline caps at 5,000 loaded rows, so the only list exceeding that (`Licensing Management`, ~11,575) is still order-exact only on the loaded subset even when filtered to it.
Future sessions should:
Never sort orderindex lexically. Don't claim "exact ClickUp order" globally — it holds per-list, and not for lists over the 5,000 load cap.

### ClickUp time estimate is sparse — render only when set
What changed:
`clickup_time_estimate_ms` is populated for only ~123 of 17,859 products (ClickUp returns null when unset, not 0). The modal shows a "Time estimate" field only when the value is non-null (`formatDuration`).
Future sessions should:
Treat null as "no estimate." Do not add it to cards or default it to 0 — it would be blank noise on ~99% of products.

### Do not display `product.code` — it's an internal ClickUp-style id
What changed:
`product.code` holds a ClickUp-task-style string (e.g. `8688wgqth`), not a human SKU. It was being prepended to product titles (`code · title`) and was removed from every display surface (2026-06-17/18): pipeline card + table, Control Room, My Work, Projects, Orders, Samples, Submissions, Revisions, Reports, and the modal's linked-product label. Surfaces now show the title alone.
Why:
Users read it as "random characters." It crept in across ~10 components because the `[x.code, x.title].filter(Boolean).join(' · ')` idiom was copy-pasted.
Future sessions should:
When rendering a product/summary label, show `title` (or `name`) only — do not reintroduce `code` into list/card labels. If a genuine human-facing SKU exists later, add a dedicated field; don't repurpose `code`.

### Saved Views: Space = department, per-user prefs live in pm_view_pref
What changed:
The sidebar is a saved-views model, not a literal ClickUp tree. Each department (Licensed/Generic/Software) is a "Space" with a virtual Master view ("All") pinned first, then `pm_saved_view` rows (company-`shared` ∪ the user's `personal`). Applying a view writes its `filters_json` + `business_unit` into appState. Per-user reorder/recolor/hide of *any* view (including shared/seeded) is stored in a separate `pm_view_pref` row — the view record itself is never mutated by a non-owner.
Why:
A shared view is one record seen by many users, so per-user order/color/hidden cannot live on it. `pm_view_pref` (one row per user+view) holds the overrides. "Deleting" a shared/seeded view sets `pm_view_pref.hidden=true` (per-user); only the owner can hard-`deleteView`.
Future sessions should:
There is **no composite-unique (user, view)** at the DB layer — `upsertViewPref` does read-then-write. Don't assume DB-enforced uniqueness. Seeded list views are `origin='clickup_list'`, color `#8C9BB5`; re-running `seed-clickup-list-views.mjs` is idempotent (skips by name+business_unit).

### pm_saved_view / pm_view_pref permissions are wildcard; scoping is in the query
What changed:
Legacy note: both saved-view collections previously granted wildcard CRUD with no row filter across the app policies. In the Supabase-backed app, verify current RLS/policies in `shared-db` before assuming view isolation behavior.
Why:
This matches how `pm_saved_view` already worked before this feature; tightening it was out of scope and risked breaking existing saved views.
Future sessions should:
Treat view isolation as client-enforced until verified in `shared-db`. If true row-level security is needed later, add it in canonical `u2giants/shared-db` — don't assume it exists today.

### Inline field edits are optimistic and fail silently
What changed:
Editable fields in `TaskDetailModal` keep a `local` override object layered over the `task` prop; `applyLocal` updates state then calls `updateProduct` (`collab.ts`), reverting the override on error with no toast.
Why:
Matches the existing drag-to-stage / checklist optimistic pattern.
Future sessions should:
If a "field didn't save" bug is reported, check Supabase write/RLS permissions and the network response — the UI gives no error signal, so a silent revert (value snaps back) is the symptom.

### PM operating records are Supabase tables, not local UI state
What changed:
Dependencies, decisions, reminders, and reusable workflow templates live in Supabase and are surfaced through `src/features/operating/api.ts`. Product detail has an Operations tab; My Work lists reminders assigned to the signed-in user; Settings lists/creates workflow templates; Reports counts open dependencies/reminders, decisions, and active templates.

Why:
The PM system needs durable operational records for blockers, approvals/decisions, follow-ups, and repeatable stage/checklist patterns. A frontend-only implementation would lose the audit trail and would not be available to Reports/My Work.

Future sessions should:
Add schema fields in canonical `shared-db` first, then update `src/lib/types.ts` and `src/features/operating/api.ts`. External notification delivery is not implemented in this frontend; reminders are in-app records until a backend worker/automation is added.

### `retailer`/`buyer` are curated customer tables; the raw CRM dump lives in `ingested_*`
What it is:
Legacy CRM ingestion separated curated customers from raw ingested domains before the shared Supabase migration. Current app customer pickers should use the shared `api.customer_list` view; buyer/contact reads use `core.contact` / `core.contact_company` data exposed by the shared schema. Historical end state:
- **`retailer`** = curated real customers only (`customer_status` active/potential), ~102 rows, editable. Safe to read directly as a picker.
- **`buyer`** = curated buyers (contacts at customers + any referenced by live PIM work), ~747 rows.
- **`ingested_domains`** = the old `retailer` (all ~3,740 ingested companies); the email worker writes here for dedup. **Not for app pickers.**
- **`ingested_contact`** = the old `buyer` (all ~8,649 ingested email contacts).
Customers are **copied** (kept in both `ingested_domains` and `retailer` with the same IDs) so the worker still sees "domain already ingested" and so `crm_*` relations stay on the `ingested_*` tables. PIM relations (`product`/`project`/`order`/`design.first_offered_to`/`design_collection.account_specific_for` and the buyer links) point at the curated tables.
Why:
The product owner's rule: apps must only ever see real customers (active/potential), never a table that is ~97% ingested garbage (e.g. "1kms" = `OTHER`).
Future sessions should:
Read curated customer/contact data through `fetchCustomers()` / `fetchBuyers(retailerId)` in `features/board/collab.ts`. `fetchCustomers()` must read the shared `api.customer_list` view, not a raw customer table. Never point an app picker at raw ingested-domain/contact tables.

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

### 2026-06-11 — Cards collapsed to 2px on the board
What happened: after the Prompt-B board rework, all task cards rendered ~2px tall (only the border), content hidden.
Impact: board unusable (caught in preview before anyone relied on it).
Root cause: cards are flex children in a fixed-height, scrollable column; default `flex-shrink:1` compressed them to fit instead of overflowing.
Recovery: added `shrink-0` to the product card so cards keep natural height and the column scrolls.
Rule added: see §11 "`PimTaskCard` needs `shrink-0`" — don't remove it.

### 2026-06-11 — Image importer crashed (backend, but affected this app's images)
What happened: the historical ClickUp image importer died at ~800 products; image counts stalled.
Root cause: its periodic re-login sent the already-expired token, so the re-login itself 401'd.
Recovery: fixed to clear the token before re-login + retry; documented here because this app surfaces those images.

No production incidents since the app moved to `pm.designflow.app`.

## 15. Pending work

| Status | Item | Owner/next action |
|---|---|---|
| done | **Supabase backend migration** | App is now on the shared Supabase.com backend. Future schema/RLS/realtime changes belong in canonical `u2giants/shared-db`; keep this repo's frontend env/docs in sync. |
| done | ClickUp image backfill | Historical migration completed; covers moved to Spaces originals + thumbs, 0 ClickUp URLs remain. |
| done | CI/Coolify pipeline + cutover | `git push main` → Actions → GHCR → Coolify (`ysvdyj3t7d5tyh5ogrvlka4y`) serving `pm.designflow.app`; legacy raw-docker removed; GHCR package public; 2026-06-11. See `docs/cicd.md`. |
| done | Server-side filtering/pagination | Search + licensor are backend-filtered; count/truncation UI; debounced 300ms; table prev/next pagination; 2026-06-12 |
| done | Wire PipelinePage to real backend data | `src/domain/products/adapters.ts` + `pipeline/api.ts`; real products/stages/licensors; drag-to-stage with optimistic updates; 2026-06-14 |
| done | Wire TaskDetailModal to real backend data | Comments, assignees, checklist, subtasks, files, imported fields, activity, and create-submission/sample/revision actions load/write through the backend; mock comments removed; 2026-06-14 |
| done | Cover images on PimTaskCard | `cover_url` fetched and rendered as top banner when present; 2026-06-12 |
| done | Business workflow screens | Control Room, My Work, Projects/Offers, Design Library, Design Collections, Submissions, Samples, Reviews/Revisions, Orders, Accounts, Reports, and Settings now use real backend data; 2026-06-14 |
| done | PM operating model | Dependencies, decision records, reminders, workflow templates, ownership/evidence gaps, bulk pipeline actions, My Work reminders, Settings templates, and Reports operating metrics are backend-backed; 2026-06-22 |
| done | Delete leftover Vite-template assets + dead board files | `src/assets/*`, `public/icons.svg`, and 7 unreachable `features/board/` files removed; 2026-06-12 |
| done | Production deploy at `pm.designflow.app` | live via Coolify service `ysvdyj3t7d5tyh5ogrvlka4y`; SSO + cert verified; raw-docker retired 2026-06-11 |
| open | List / Timeline views | Table view exists; Timeline tab is a placeholder |
| done | ClickUp space/folder/list hierarchy in the UI | 2026-06-16: backend (Supabase 45af984) backfilled space/folder/list + creator/time_estimate/orderindex; frontend added topbar List filter, group-by List/Folder, sidebar Spaces tree, card/modal breadcrumbs, time-estimate field, orderindex sort. See §11 quirks. Deployed (`e487955`); not driven on the live site (SSO gate) — see HANDOFF. |
| done | Inline-editable product fields + image lightbox/cover | 2026-06-16: title/stage/licensor/due/product-type/lifecycle/next-action/waiting-on/risk editable in `TaskDetailModal` via optimistic `updateProduct`; images open in-modal lightbox; right-click sets `cover_url`. Topbar search icon now expands an inline search bar (was a DOM-focus hack). Internal `product.code` removed from all list/card titles (2026-06-18, 10 surfaces — see §11 quirk). |
| done (frontend) | Saved Views sidebar (Space=department → Master + views) | 2026-06-17: replaced the literal ClickUp tree with saved views — shared+personal, per-user drag-reorder/recolor/hide, topbar "Save view", 15 seeded list-views. Current implementation reads/writes `pim.saved_view` / `pim.view_pref` in the shared Supabase schema. |
| done | URL deep-linking (`?item=`) for the detail panel | `history.replaceState` + `URLSearchParams`; auto-opens on page load; 2026-06-12 |
| done | Durable image storage for product covers | DigitalOcean Spaces originals + thumbs; future DAM can supersede this, but ClickUp CDN is no longer the source. |
| partial | Durable storage for product-file attachments | Backend copied 20,234 / 20,281 imported `product_file` rows to Spaces on 2026-06-14. Remaining 47 ClickUp source URLs return 404 or 0 bytes even with token; recover those source bytes from old exports/NAS/user uploads if required. |
| open | Confirm end-to-end Microsoft SSO from a real tenant login | Redirect chain verified; full round-trip unconfirmed |
| done | Board + task detail + collaboration (assignees/checklist/subtasks/comments) | live |
| done | Design theme (Prompt A), board layout (Prompt B), task-detail layout (Prompt C) | applied |
| done | `@dnd-kit` drag-to-change-stage | live |
| done | ClickUp work-data import | 2026-06-14: backend importer hydrated live ClickUp files/comments/custom fields/checklists/tags/links for 17,859 product external ids; ClickUp activity/time APIs still returned 0 records and are tracked in `HANDOFF.md`. |

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

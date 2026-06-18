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
| `src/lib/` | `directus.ts` (SDK client + SSO helper), `types.ts` (typed slice of backend schema), `appState.tsx` (screen/filter/view state), `buildInfo.ts`, `utils.ts` (`cn`, shadcn-generated) | owned (`utils.ts` generated) |
| `src/domain/` | frontend domain adapters/presentation/rollups; converts raw Directus records into business UI models such as `ProductSummary` | owned |
| `src/auth/auth.tsx` | `AuthProvider` + `useAuth()` — session check, login, SSO redirect, logout | owned |
| `src/pages/LoginPage.tsx` | login screen | owned |
| `src/components/Sidebar.tsx`, `src/components/Topbar.tsx`, `src/components/PimTaskCard.tsx`, `src/components/TaskDetailModal.tsx` | core app shell, product card, and product detail/workflow modal | owned |
| `src/components/ui/` | **shadcn/ui components — GENERATED** (Radix/new-york). Re-add/update via `npx shadcn@latest add <name>`; hand-edits get overwritten | generated (vendored) |
| `src/features/pipeline/`, `src/features/control-room/`, `src/features/mywork/`, `src/features/projects/`, `src/features/designs/`, `src/features/submissions/`, `src/features/samples/`, `src/features/revisions/`, `src/features/orders/`, `src/features/accounts/`, `src/features/reports/`, `src/features/settings/` | business screens over real Directus data | owned |
| `src/features/board/` | lower-level product/collaboration API helpers (`api.ts`, `collab.ts`) kept for product cards/details | owned |
| `src/App.tsx`, `src/main.tsx`, `src/index.css` | root gate/providers, entry, theme tokens (`index.css` holds the Design-provided OKLCH theme) | owned |
| `index.html`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `components.json` | build/tooling config | owned |
| `Dockerfile`, `nginx.conf`, `.dockerignore` | container build (multi-stage node→nginx, SPA fallback) | owned |
| `.env`, `.env.example` | `VITE_DIRECTUS_URL` (not secret) | owned |
| `src/assets/pop-logo.png` | app logo used in Topbar | owned |
| `node_modules/`, `dist/` | install / build artifacts | ignore (§10) |

No third-party framework source is vendored or modified (React/Radix/etc. are npm deps).

## 5. Prime Directive: custom-code boundary

Our custom code lives here:

- `src/features/` — app features and business workflow screens
- `src/domain/` — business-facing adapters and presentation logic
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
| Change the product pipeline board | `src/features/pipeline/PipelinePage.tsx`, `src/components/PimTaskCard.tsx`, `src/features/pipeline/api.ts`, `src/domain/products/*` | `src/components/ui/*` by hand |
| Change the product-detail modal | `src/components/TaskDetailModal.tsx`, `src/features/board/collab.ts`, `src/features/workflow/api.ts` | — |
| Change workflow screens/actions | `src/features/workflow/api.ts`, `src/features/submissions/`, `src/features/samples/`, `src/features/revisions/`, `src/features/mywork/` | backend schema in the `directus` repo |
| Change what data is fetched/written | feature `api.ts` files, `src/domain/products/*`, `src/lib/types.ts` | the backend schema (edit in the `directus` repo) |
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
| Backend collections read | `product`, `project`, `design`, `design_collection`, `product_submission`, `product_sample`, `revision_request`, `order`, lookup collections | `directus` repo `pm-system/apply-schema.mjs` + `pm-system/add-workflow-model.mjs` | business screens |
| Collaboration collections | `checklist_item`, `subtask`, `product_assignee` (M2M), native `directus_comments` | `directus` repo `pm-system/add-collaboration-model.mjs` | task-detail |
| Image field | `product.cover_url` | `directus` repo `pm-system/migration/clickup-to-spaces.mjs` | DigitalOcean Spaces original; thumbnail derived in `src/domain/products/adapters.ts` |
| ClickUp board mirror fields | `product.clickup_list_name`, `clickup_parent_id`, `clickup_status_type`, `clickup_updated_at` | `directus` repo `pm-system/add-clickup-work-model.mjs` + `pm-system/migration/clickup-work-import.mjs` | Used by the Licensed pipeline to mirror ClickUp top-level open board cards |
| ClickUp hierarchy/metadata fields | `product.clickup_space_id/name`, `clickup_folder_id/name`, `clickup_list_id`, `clickup_creator_id/name`, `clickup_time_estimate_ms`, `clickup_orderindex` | `directus` repo commit `45af984` (`add-clickup-hierarchy-fields.mjs` + `backfill-clickup-hierarchy.mjs`) | List filter + group-by-list, creator, time estimate, manual ordering. See §11 quirks for sparse/string caveats |
| Saved views | `pm_saved_view` (+ `visibility`, `origin`, `color`, `sort_order`) and `pm_view_pref` (per-user `sort_order`/`color`/`hidden`) | `directus` repo `pm-system/add-saved-views-model.mjs` + `pm-system/migration/seed-clickup-list-views.mjs` (authored 2026-06-17; **commit pending in directus repo** — see HANDOFF) | Sidebar Space=department → Master + views; `src/features/views/api.ts`. See §11 quirks |

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
The generic `MockTask` layer and `src/lib/mockData.ts` were removed from runtime code. `ProductSummary` in `src/domain/products/types.ts` is now the board/detail view model, and raw Directus data is adapted in `src/domain/products/adapters.ts`.

Why:
The app is no longer a ClickUp-board demo; it now works from real business objects and workflow collections in Directus.

Future sessions should:
Do not reintroduce generic task-shaped mock data into real screens. Use Directus-backed feature APIs and add isolated fixtures only for tests/stories if those are introduced later.

### Workflow search filters must be collection-specific
What changed:
`src/features/workflow/api.ts` uses separate search filters for submissions, samples, and revisions.

Why:
Directus rejects filters on fields that do not exist on the target collection. A shared workflow search filter looked convenient but queried fields like `body` on samples and `portal_reference` on revisions.

Future sessions should:
When adding fields to search, confirm the field exists on that collection or relation before adding it to the `_or` filter.

### Pipeline filters are server-side (Directus API)
Search and licensor filters are pushed to Directus via `_icontains` / `name._in`. The pipeline loads up to 5,000 products for the active department. A parallel `aggregate` count query surfaces the true total; a toast / table footer shows "Showing first N of M" when truncated. Search is debounced 300 ms; stale fetch results are discarded via an incrementing ref.
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
If cards or counts drift from ClickUp, first verify `business_unit`, `clickup_parent_id`, `clickup_status_type`, `clickup_list_name`, and `clickup_updated_at` in Directus before changing frontend grouping. A 2026-06-14 backend audit matched 17,859 live ClickUp task ids to 17,859 Poppim external ids with 0 missing and 0 extra.

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
Both collections grant wildcard CRUD with no row filter across the app policies (the new `pm_view_pref` mirrors `pm_saved_view`'s existing grants). Per-user/visibility scoping (`user = me OR visibility = 'shared'`) is enforced in the frontend `fetchViews`/`fetchViewPrefs` queries, not by Directus policies.
Why:
This matches how `pm_saved_view` already worked before this feature; tightening it was out of scope and risked breaking existing saved views.
Future sessions should:
Treat view isolation as client-enforced. If true row-level security is needed later, add `permissions` filters in the directus repo for both collections — don't assume they exist today.

### Inline field edits are optimistic and fail silently
What changed:
Editable fields in `TaskDetailModal` keep a `local` override object layered over the `task` prop; `applyLocal` updates state then calls `updateProduct` (`collab.ts`), reverting the override on error with no toast.
Why:
Matches the existing drag-to-stage / checklist optimistic pattern.
Future sessions should:
If a "field didn't save" bug is reported, check the Directus write/role permission and the network response — the UI gives no error signal, so a silent revert (value snaps back) is the symptom.

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
Recovery: added `shrink-0` to the product card so cards keep natural height and the column scrolls.
Rule added: see §11 "`PimTaskCard` needs `shrink-0`" — don't remove it.

### 2026-06-11 — Image importer crashed (backend, but affected this app's images)
What happened: the ClickUp image importer (in the `directus` repo) died at ~800 products; image counts stalled.
Root cause: its periodic re-login sent the already-expired token, so the re-login itself 401'd.
Recovery: fixed to clear the token before re-login + retry; documented here because this app surfaces those images.

No production incidents since the app moved to `pm.designflow.app`.

## 15. Pending work

| Status | Item | Owner/next action |
|---|---|---|
| done | ClickUp image backfill | Complete in the `directus` repo via `pm-system/migration/clickup-to-spaces.mjs`; 3,747 covers moved to Spaces originals + thumbs, 0 ClickUp URLs remain. |
| done | CI/Coolify pipeline + cutover | `git push main` → Actions → GHCR → Coolify (`ysvdyj3t7d5tyh5ogrvlka4y`) serving `pm.designflow.app`; legacy raw-docker removed; GHCR package public; 2026-06-11. See `docs/cicd.md`. |
| done | Server-side filtering/pagination | Search + licensor pushed to Directus `_icontains`/`_in`; parallel count query; debounced 300ms; table prev/next pagination; truncation badge; 2026-06-12 |
| done | Wire PipelinePage to real Directus data | `src/domain/products/adapters.ts` + `pipeline/api.ts`; real products/stages/licensors; drag-to-stage with optimistic updates; 2026-06-14 |
| done | Wire TaskDetailModal to real Directus data | Comments, assignees, checklist, subtasks, files, imported fields, activity, and create-submission/sample/revision actions load/write through Directus; mock comments removed; 2026-06-14 |
| done | Cover images on PimTaskCard | `cover_url` fetched and rendered as top banner when present; 2026-06-12 |
| done | Business workflow screens | Control Room, My Work, Projects/Offers, Design Library, Design Collections, Submissions, Samples, Reviews/Revisions, Orders, Accounts, Reports, and Settings now use Directus data; 2026-06-14 |
| done | Delete leftover Vite-template assets + dead board files | `src/assets/*`, `public/icons.svg`, and 7 unreachable `features/board/` files removed; 2026-06-12 |
| done | Production deploy at `pm.designflow.app` | live via Coolify service `ysvdyj3t7d5tyh5ogrvlka4y`; SSO + cert verified; raw-docker retired 2026-06-11 |
| open | List / Timeline views | Table view exists; Timeline tab is a placeholder |
| done | ClickUp space/folder/list hierarchy in the UI | 2026-06-16: backend (directus 45af984) backfilled space/folder/list + creator/time_estimate/orderindex; frontend added topbar List filter, group-by List/Folder, sidebar Spaces tree, card/modal breadcrumbs, time-estimate field, orderindex sort. See §11 quirks. Deployed (`e487955`); not driven on the live site (SSO gate) — see HANDOFF. |
| done | Inline-editable product fields + image lightbox/cover | 2026-06-16: title/stage/licensor/due/product-type/lifecycle/next-action/waiting-on/risk editable in `TaskDetailModal` via optimistic `updateProduct`; images open in-modal lightbox; right-click sets `cover_url`. Topbar search icon now expands an inline search bar (was a DOM-focus hack). Internal `product.code` removed from all list/card titles (2026-06-18, 10 surfaces — see §11 quirk). |
| done (frontend) | Saved Views sidebar (Space=department → Master + views) | 2026-06-17: replaced the literal ClickUp tree with saved views — shared+personal, per-user drag-reorder/recolor/hide, topbar "Save view", 15 seeded list-views. Frontend deployed (`0e4e61c`). **Backend scripts authored + already RUN against prod but NOT yet committed to the directus repo** (git perms) — see HANDOFF. Not live-verified (SSO gate). |
| done | URL deep-linking (`?item=`) for the detail panel | `history.replaceState` + `URLSearchParams`; auto-opens on page load; 2026-06-12 |
| done | Durable image storage for product covers | DigitalOcean Spaces originals + thumbs; future DAM can supersede this, but ClickUp CDN is no longer the source. |
| partial | Durable storage for product-file attachments | Backend copied 20,234 / 20,281 imported `product_file` rows to Spaces on 2026-06-14. Remaining 47 ClickUp source URLs return 404 or 0 bytes even with token; recover those source bytes from old exports/NAS/user uploads if required. |
| open | Confirm end-to-end Microsoft SSO from a real tenant login | Redirect chain verified; full round-trip unconfirmed |
| done | Board + task detail + collaboration (assignees/checklist/subtasks/comments) | live |
| done | Design theme (Prompt A), board layout (Prompt B), task-detail layout (Prompt C) | applied |
| done | `@dnd-kit` drag-to-change-stage | live |
| done | ClickUp work-data import | 2026-06-14: backend importer hydrated live ClickUp files/comments/custom fields/checklists/tags/links for 17,859 product external ids; ClickUp activity/time APIs still returned 0 records and are tracked in `HANDOFF.md`. |

Create `HANDOFF.md` only for an active, unresolved continuation item.

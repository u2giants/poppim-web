# Architecture — poppim-web

See `AGENTS.md` first. This doc covers system design and data flow.

## Shape
A **React 19 + Vite SPA** that is a pure client of the shared **Directus** API. It holds no data and no business database — Directus owns the schema, auth, permissions, and storage.

```
Browser (pm-dev / pm.designflow.app)
  └─ poppim-web (this repo, static SPA served by nginx)
        └─ HTTPS + session cookie ──▶ data.designflow.app  (Directus API)
                                          └─ Postgres (shared: PIM + future CRM/DAM)
```

## Stack
- React 19 + Vite + TypeScript (strict).
- Tailwind CSS v4 + shadcn/ui (`new-york`/Radix — see AGENTS.md §11).
- `@directus/sdk` for all data + auth.
- `@dnd-kit/core` for board drag.
- `lucide-react` icons; `sonner` toasts; `@fontsource-variable/geist` font.
- Path alias `@/*` → `src/*`.

## Data flow
- **Client:** `src/lib/directus.ts` builds the SDK client (`authentication('session', {credentials:'include'})` + `rest`). `DIRECTUS_URL` = `VITE_DIRECTUS_URL` or the hardcoded prod default.
- **Types:** `src/lib/types.ts` is a hand-maintained typed slice of the backend collections this app reads.
- **Domain layer:** `src/domain/products/*` converts raw Directus `product` rows into `ProductSummary` view models, derives card thumbnails from Spaces originals, centralizes stage/category presentation, and hydrates rollups for assignees/checklist/comments/files.
- **Departments:** the app presents hard-separated departments: `Licensed`, `Generic`, and `Software`. For compatibility with current backend data, `Licensed` maps to legacy `POP` / `POP Creations`, `Generic` maps to `Spruce` / `Spruce Line`, and `Software` maps to `Software`.
- **Pipeline:** `src/features/pipeline/api.ts` fetches `stage`, `product`, and related lookup context. `PipelinePage` groups products by stage into droppable columns; `@dnd-kit` drag -> `setProductStage` (optimistic, reverts on error). The board has hard-separated `Licensed`, `Generic`, and `Software` departments; each department queries top-level open/custom ClickUp tasks (`clickup_parent_id` null, `clickup_status_type` open/custom) sorted by `clickup_updated_at` descending. It is not scoped only to `Licensing Management`; the backend parity import maps all live ClickUp lists into department-specific `product` rows. Within each column/group, cards are re-sorted client-side by `clickup_orderindex` to match ClickUp's manual in-list order.
- **ClickUp hierarchy filtering:** `product` carries `clickup_space_name` / `clickup_folder_name` / `clickup_list_name` (backfilled by the `directus` repo, commit 45af984). The topbar has a server-side **List** filter (`clickup_list_name _in`, options + counts from `fetchListFacets`) and group-by gains List/Folder.
- **Saved Views (sidebar):** the sidebar is a **Space = department** model, not a literal ClickUp tree. Each department (Licensed/Generic/Software) holds a pinned virtual **Master view** ("All", clears filters) then **views** from `pm_saved_view` (company-`shared` + the user's `personal`). `src/features/views/api.ts` reads views (own ∪ shared) and per-user prefs; applying a view sets `businessUnit` + `filters_json` (`{search,licensorIds,listNames,groupBy,colorBy}`) into appState (`activeViewId` tracks the selection). Per-user **reorder/recolor/hide** of any view (incl. shared/seeded) is stored in `pm_view_pref` (read-then-upsert; there is no composite-unique at the DB layer). The topbar "Save view" writes a new `personal`/`shared` view and bumps `viewsRefreshKey` to refresh the sidebar. Seeded views (`origin='clickup_list'`, one per live list, color `#8C9BB5`) are deletable per-user (hidden via pref). Space→department mapping lives in `spaceToBusinessUnit` (`src/domain/products/adapters.ts`).
- **Product detail:** `src/components/TaskDetailModal.tsx` reads collaboration/history via `src/features/board/collab.ts`, writes workflow records via `src/features/workflow/api.ts` (`product_submission`, `product_sample`, `revision_request`), and surfaces PM operating records via `src/features/operating/api.ts` (`pm_dependency`, `pm_decision`, `pm_reminder`). Core product fields (title, stage, licensor, due, product type, lifecycle, next action, waiting on, risk) are **inline-editable** via local optimistic override state + `updateProduct` in `collab.ts` (reverts silently on failure). Images open in an in-modal lightbox (not a new tab); right-click offers "View full size" / "Set as cover image" (writes `cover_url`).
- **Business screens:** feature APIs under `src/features/*/api.ts` read Directus collections for Control Room, My Work, projects/offers, designs, design collections, submissions, samples, revisions, orders, accounts, reports, and settings.
- **PM operating layer:** `pm_dependency`, `pm_decision`, `pm_reminder`, and `pm_workflow_template` were added by the backend script `pm-system/add-operating-model.mjs` in the `directus` repo. The frontend uses them for the product modal Operations tab, assigned reminders in My Work, workflow-template management in Settings, and operating health metrics in Reports. Reminders are in-app Directus records; no external email/Teams notification delivery exists in this frontend yet.
- **Saved views and templates:** `src/features/settings/api.ts` writes `pm_saved_view`; `src/features/operating/api.ts` writes `pm_workflow_template`. The frontend stores screen/filter/group/color/search state for saved views, while Directus remains the source of truth.
- **Auth:** `src/auth/auth.tsx` (`AuthProvider`/`useAuth`) checks the session via `readMe`, supports email/password `login` and a Microsoft SSO redirect (`microsoftLoginUrl` → backend `/auth/login/microsoft`). `App.tsx` gates: loading → `LoginPage` → the app shell and current screen.
- **Build metadata:** CI passes the commit SHA, commit timestamp, and GitHub run id into the Vite build. `src/lib/buildInfo.ts` exposes that metadata, `Topbar` displays the short SHA + New York commit time, and `index.html` embeds `build-sha` for production deploy verification.

## Constraints
- **Cross-subdomain auth:** depends on backend session-cookie + CORS config (AGENTS.md §11/§12); the frontend can't fix auth alone.
- **Backend is the source of truth:** to add a field/collection, change the **`directus`** repo schema first, then surface it here.
- **Static build:** `VITE_*` is baked at build time; no runtime config. Build metadata is intentionally static, not fetched from Directus.
- **Workflow filters:** keep Directus search filters collection-specific. Do not add an `_or` search field unless that field exists on the queried collection or relation.
- **No runtime mocks:** real screens use Directus-backed APIs and `ProductSummary`; do not reintroduce generic task-shaped mock data into production paths.
- **ClickUp status/parent fields:** Directus exposes `clickup_status`, `clickup_status_type`, `clickup_status_color`, `clickup_status_order`, `clickup_parent_id`, and `clickup_top_level_parent_id` as first-class fields. Do not depend on filtering nested `clickup_raw` JSON from the frontend.
- **ClickUp hierarchy/metadata fields (added 2026-06-16, directus 45af984):** `clickup_space_id/name`, `clickup_folder_id/name`, `clickup_list_id` (list_name already existed), `clickup_creator_id/name`, `clickup_time_estimate_ms` (bigint), `clickup_orderindex` (varchar). Two caveats: (1) `clickup_time_estimate_ms` is sparse — only ~123 of 17,859 products have one; treat null as "no estimate" and only render when present. (2) `clickup_orderindex` is a 32-decimal string stored as text on purpose; sort with `Number()` (frontend) or `::numeric` (SQL), never lexically. Folderless lists store `clickup_folder_name = null` (154 products).
- **ClickUp file previews:** `TaskDetailModal` prefers `product_file.thumbnail_url`, then `stored_url` for images, then the original ClickUp preview/source URL as a fallback. As of the 2026-06-14 backend pass, 20,234 / 20,281 imported `product_file` rows are stored in Spaces; the remaining 47 ClickUp source URLs return 404 or 0 bytes even with token.

## Where the backend lives
Backend schema, roles, SSO, and migrations are in `u2giants/directus` (`pm-system/`). Read that repo's `AGENTS.md` for collections, the role model, and the domain plan.

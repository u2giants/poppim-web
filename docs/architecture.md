# Architecture — poppim-web

See `AGENTS.md` first. This doc covers system design and data flow.

## Shape
A **React 19 + Vite SPA** that is a pure client of the shared **Supabase** API. It holds no data and no business database — Supabase owns the schema, auth, permissions, and storage.

The SPA does **not** run on Supabase. It is still built from this repository, published as a GHCR image, and served by the Coolify/nginx service at `pm.designflow.app`; Supabase is the backend API/database/auth target the browser calls.

```
Browser (pm-dev / pm.designflow.app)
  └─ poppim-web (this repo, static SPA served by nginx)
        └─ HTTPS + Supabase Auth ──▶ qsllyeztdwjgirsysgai.supabase.co  (Supabase API)
                                      └─ Postgres (shared: PIM + CRM + DAM + PLM)
```

## Stack
- React 19 + Vite + TypeScript (strict).
- Tailwind CSS v4 + shadcn/ui (`new-york`/Radix — see AGENTS.md §11).
- `@supabase/supabase-js` for data and auth.
- `@dnd-kit/core` for board drag.
- `lucide-react` icons; `sonner` toasts; Plus Jakarta Sans variable font.
- Path alias `@/*` → `src/*`.

## Data flow
- **Client:** `src/lib/supabase.ts` builds the Supabase browser client from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **Types:** `src/lib/types.ts` is a hand-maintained typed slice of the backend collections this app reads.
- **Domain layer:** `src/domain/products/*` converts shared Supabase product rows/views into `ProductSummary` view models, derives card thumbnails from Spaces originals, auto-chooses an image cover from product files when `cover_url` is absent, centralizes stage/category presentation, and hydrates rollups for assignees/checklist/comments/files.
- **Departments:** the app presents hard-separated departments: `Licensed`, `Generic`, and `Software`. For compatibility with current backend data, `Licensed` maps to legacy `POP` / `POP Creations`, `Generic` maps to `Spruce` / `Spruce Line`, and `Software` maps to `Software`.
- **Pipeline:** `src/features/pipeline/api.ts` calls the authenticated
  `api.pm_pipeline_page` keyset contract. Department and top-level/open/custom
  eligibility, search, list, licensor, and lifecycle filters are applied by the
  database before the bounded page limit. `PipelinePage` merges pages by product
  ID, exposes continuation, and loads the optional exact count and department
  list facets independently so either supporting call can fail without blanking
  cards. Stage changes use the transactional `api.pm_set_product_stage` contract;
  metadata-backed edits use `api.pm_patch_product_metadata`.
- **ClickUp hierarchy filtering:** ClickUp list/folder metadata is returned by the
  pipeline contract. Department list facets are stable navigation and
  deliberately do not disappear when transient search/licensor/lifecycle filters
  change.
- **Saved Views (sidebar):** the sidebar is a **Space = department** model, not a literal ClickUp tree. Each department (Licensed/Generic/Software) holds a pinned virtual **Master view** ("All", clears filters) then views from `pim.saved_view`. `src/features/views/api.ts` reads views and per-user prefs from `pim.view_pref`; applying a view sets `businessUnit` + saved filters into appState (`activeViewId` tracks the selection).
- **Product detail:** `src/components/TaskDetailModal.tsx` is the modal shell;
  domain panels and editors live under `src/features/product-detail/`. The panels
  read collaboration/history via `src/features/board/collab.ts`, write workflow
  records through `src/features/workflow/api.ts`, and surface PM operating
  records from `src/features/operating/api.ts`. Required loads render retryable
  errors; optional loads warn without replacing primary content. Optimistic
  mutations use the shared rollback/toast helper and metadata version conflicts
  produce an explicit reload/retry message.
- **Business screens:** feature APIs under `src/features/*/api.ts` use
  department-scoped server aggregates or bounded deterministic pages for Control
  Room, My Work, projects, designs, collections, workflow records, orders,
  accounts, reports, schedule, notes, and people. The durable exact/paged/window
  semantics are listed in `docs/secondary-screen-accuracy-contracts.md`.
- **PM operating layer:** dependencies and decisions are represented as `app.activity`; reminders are `app.notification`; reusable workflow templates are stored as scoped `pim.saved_view` config rows until canonical first-class PM operating tables are added to `shared-db`.
- **Saved views and templates:** `src/features/settings/api.ts` writes `pim.saved_view`; `src/features/operating/api.ts` writes workflow-template rows to `pim.saved_view`. The frontend stores screen/filter/group/color/search state for saved views, while Supabase remains the source of truth.
- **Auth:** `src/auth/auth.tsx` (`AuthProvider`/`useAuth`) distinguishes signed
  out, profile loading, valid mapped profile, no mapped profile, and transient
  profile-resolution failure. An auth UUID is never substituted for an
  application profile UUID. `App.tsx` keeps profile failures outside the shell
  and provides retry/logout actions.
- **Build metadata:** CI passes the commit SHA, commit timestamp, and GitHub run id into the Vite build. `src/lib/buildInfo.ts` exposes that metadata, `Topbar` displays the short SHA + New York commit time, and `index.html` embeds `build-sha` for production deploy verification.

## Constraints

Detailed completeness, pagination, ordering, and truncation rules for reports
and secondary screens are fixed in
[`secondary-screen-accuracy-contracts.md`](secondary-screen-accuracy-contracts.md).
- **Auth/RLS:** depends on Supabase Auth, app profiles, exposed schemas/views, and RLS policies in `shared-db`; the frontend cannot fix schema/RLS alone.
- **Backend is the source of truth:** to add a field/table/view/policy, change canonical **`u2giants/shared-db`** first, then surface it here.
- **Static build:** `VITE_*` is baked at build time; no runtime config. Build metadata is intentionally static, not fetched from Supabase.
- **Workflow filters:** keep Supabase search filters collection-specific. Do not add an `_or` search field unless that field exists on the queried collection or relation.
- **No runtime mocks:** real screens use Supabase-backed APIs and `ProductSummary`; do not reintroduce generic task-shaped mock data into production paths.
- **Pipeline verification:** pipeline fixes must be checked in an authenticated browser, not just by source grep or unauthenticated page load. The 2026-06-30 incident had layered failures: stale bundle/schema-cache suspicion, overlong `pm_product_board` enrichment URLs, `pim.product.select('*')` statement timeouts, `app.comment` RLS denial for optional comment counts, and empty first-viewport columns from reference-stage ordering. Verify by opening `Product pipeline`, confirming visible cards, checking current console/network errors, and checking the production `build-sha`.
- **ClickUp status/parent fields:** Supabase exposes `clickup_status`, `clickup_status_type`, `clickup_status_color`, `clickup_status_order`, `clickup_parent_id`, and `clickup_top_level_parent_id` as first-class fields. Do not depend on filtering nested `clickup_raw` JSON from the frontend.
- **ClickUp hierarchy/metadata fields (added 2026-06-16, Supabase 45af984):** `clickup_space_id/name`, `clickup_folder_id/name`, `clickup_list_id` (list_name already existed), `clickup_creator_id/name`, `clickup_time_estimate_ms` (bigint), `clickup_orderindex` (varchar). Two caveats: (1) `clickup_time_estimate_ms` is sparse — only ~123 of 17,859 products have one; treat null as "no estimate" and only render when present. (2) `clickup_orderindex` is a 32-decimal string stored as text on purpose; sort with `Number()` (frontend) or `::numeric` (SQL), never lexically. Folderless lists store `clickup_folder_name = null` (154 products).
- **ClickUp file previews:** `TaskDetailModal` prefers `product_file.thumbnail_url`, then `stored_url` for images, then the original ClickUp preview/source URL as a fallback. As of the 2026-06-26 follow-up, the retired source had 20,245 / 20,291 imported `product_file` rows stored in Spaces; the remaining 46 ClickUp source URLs return 403/404/416 or no useful bytes even with token.

## Where the backend lives
Backend schema, roles, RLS, realtime, and migrations are in `u2giants/shared-db`; the local `shared-db/` folder is a read-only synced mirror. Read `shared-db/AGENTS.md` before any database change.

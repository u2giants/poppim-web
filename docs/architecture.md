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
- **Pipeline:** `src/features/pipeline/api.ts` fetches `stage`, `product`, and related lookup context. `PipelinePage` groups products by stage into droppable columns; `@dnd-kit` drag -> `setProductStage` (optimistic, reverts on error).
- **Product detail:** `src/components/TaskDetailModal.tsx` reads collaboration/history via `src/features/board/collab.ts` and writes workflow records via `src/features/workflow/api.ts` (`product_submission`, `product_sample`, `revision_request`).
- **Business screens:** feature APIs under `src/features/*/api.ts` read Directus collections for Control Room, My Work, projects/offers, designs, design collections, submissions, samples, revisions, orders, accounts, reports, and settings.
- **Saved views:** `src/features/settings/api.ts` writes `pm_saved_view`; the frontend stores screen/filter/group/color/search state, while Directus remains the source of truth.
- **Auth:** `src/auth/auth.tsx` (`AuthProvider`/`useAuth`) checks the session via `readMe`, supports email/password `login` and a Microsoft SSO redirect (`microsoftLoginUrl` → backend `/auth/login/microsoft`). `App.tsx` gates: loading → `LoginPage` → the app shell and current screen.
- **Build metadata:** CI passes the commit SHA, commit timestamp, and GitHub run id into the Vite build. `src/lib/buildInfo.ts` exposes that metadata, `Topbar` displays the short SHA + New York commit time, and `index.html` embeds `build-sha` for production deploy verification.

## Constraints
- **Cross-subdomain auth:** depends on backend session-cookie + CORS config (AGENTS.md §11/§12); the frontend can't fix auth alone.
- **Backend is the source of truth:** to add a field/collection, change the **`directus`** repo schema first, then surface it here.
- **Static build:** `VITE_*` is baked at build time; no runtime config. Build metadata is intentionally static, not fetched from Directus.
- **Workflow filters:** keep Directus search filters collection-specific. Do not add an `_or` search field unless that field exists on the queried collection or relation.
- **No runtime mocks:** real screens use Directus-backed APIs and `ProductSummary`; do not reintroduce generic task-shaped mock data into production paths.

## Where the backend lives
Backend schema, roles, SSO, and migrations are in `u2giants/directus` (`pm-system/`). Read that repo's `AGENTS.md` for collections, the role model, and the domain plan.

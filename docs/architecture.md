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
- **Board:** `src/features/board/api.ts` fetches `stage` (sorted) + `product` (capped page, with `cover_url`). `BoardPage` groups products by stage into droppable columns; `@dnd-kit` drag → `setProductStage` (optimistic, reverts on error).
- **Task detail:** `TaskDetailSheet` (720px two-column slide-over) + `Collaboration.tsx` + `collab.ts` read/write `checklist_item`, `subtask`, `product_assignee` (M2M), and native `directus_comments`.
- **Auth:** `src/auth/auth.tsx` (`AuthProvider`/`useAuth`) checks the session via `readMe`, supports email/password `login` and a Microsoft SSO redirect (`microsoftLoginUrl` → backend `/auth/login/microsoft`). `App.tsx` gates: loading → `LoginPage` → `AppShell` + `BoardPage`.
- **Build metadata:** CI passes the commit SHA, commit timestamp, and GitHub run id into the Vite build. `src/lib/buildInfo.ts` exposes that metadata, `Topbar` displays the short SHA + New York commit time, and `index.html` embeds `build-sha` for production deploy verification.

## Constraints
- **Cross-subdomain auth:** depends on backend session-cookie + CORS config (AGENTS.md §11/§12); the frontend can't fix auth alone.
- **Backend is the source of truth:** to add a field/collection, change the **`directus`** repo schema first, then surface it here.
- **Static build:** `VITE_*` is baked at build time; no runtime config. Build metadata is intentionally static, not fetched from Directus.

## Where the backend lives
Backend schema, roles, SSO, and migrations are in `u2giants/directus` (`pm-system/`). Read that repo's `AGENTS.md` for collections, the role model, and the domain plan.

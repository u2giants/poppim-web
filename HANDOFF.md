# HANDOFF.md — poppim-web continuation state (2026-06-11)

Required reading to continue this app without prior chat context. Read `AGENTS.md` first. Delete this file when the items below are resolved.

## What's being built and why
The PIM frontend (this repo) replacing the ClickUp board, on the shared Directus backend. Slice 1 = **Task Board + Task Detail**. Claude Design produced three specs (Prompt A tokens, B board, C task detail) — all three are applied.

## Fully done
- Scaffold (React/Vite/TS/Tailwind v4/shadcn `new-york`), `@directus/sdk` client, session/cookie auth (email/password + Microsoft SSO redirect), app shell + login.
- **Board** (`src/features/board/`): products grouped by stage columns, **`@dnd-kit` drag-to-change-stage** (optimistic + persist + revert), working **search**, stage color accents, cover images, Prompt-B header/tabs/toolbar/geometry.
- **Task detail** (`TaskDetailSheet` + `Collaboration.tsx`): Prompt-C 720px two-column slide-over — fields + checklist + subtasks (left), activity feed + comment composer (right). Assignees (M2M), checklist, subtasks, comments all CRUD against the backend.
- Brand theme (Prompt A OKLCH tokens) in `src/index.css`.
- Deployed as a **temporary raw-docker preview** at `https://pm-dev.designflow.app` (TLS via Coolify's Traefik) — see `docs/deployment.md`.

## In progress (live, not finished)
- **ClickUp image backfill** is *running* in the `directus` repo (`pm-system/migration/clickup-images.mjs`), filling `product.cover_url` with public ClickUp thumbnail URLs. Resumable; ~thousands remaining. Check progress: count `product` where `cover_url` is non-empty. This app already renders them on cards.

## Not started / open (exact next actions)
1. **Wire the board toolbar filters** — Assignee/Licensor/Due/Sort are disabled placeholders in `BoardPage.tsx` (AGENTS.md §11). Make them filter the loaded products (and/or server-side). Search already works as the pattern.
2. **Production deploy** — replace the raw-docker `pm-dev` preview with a Coolify app at `pm.designflow.app` (GHCR image + GitHub Actions, or Coolify git-build). Blocker: the build host's `gh` token lacks `write:packages`; needs a token with package write or a Coolify git source. Then add `.github/workflows/` and update `docs/deployment.md`.
3. **Board scale (Prompt B):** "load more past 50 cards" + "collapse columns" not implemented; board currently loads a capped page via `fetchProducts(limit)`.
4. **List / Timeline views** — header tabs are placeholders.
5. **URL deep-linking (Prompt C `?item=`)** — `react-router-dom` is installed but unused; the app uses a gate in `App.tsx`.
6. **Durable images** — `cover_url` points at ClickUp's CDN (dies if ClickUp is cancelled); plan to copy into the DAM/R2.
7. **Confirm end-to-end Microsoft SSO** from a real tenant login (redirect chain verified; full round-trip unconfirmed).
8. **Cleanup** — delete unused Vite-template assets (`src/assets/*`, `public/icons.svg`).

## Decisions made (and why)
- shadcn **`new-york` (Radix)** not the CLI default `base-nova` (Base UI) — `asChild` + docs consistency (AGENTS.md §11).
- **Session/cookie auth** not token mode — required for cross-subdomain SSO.
- Images stored as **ClickUp CDN URLs** (not downloaded) — fast for the preview; durability is a known tradeoff.
- Full board *components* are custom; only the drag *engine* is a dependency (`@dnd-kit`) — deliberately avoided a full "kanban component" that would own rendering/theme.

## Risks / unknowns
- The `pm-dev` deploy is unmanaged raw-docker (not in Coolify UI) — survives reboots via `--restart unless-stopped` but isn't visible in Coolify.
- Backend CORS/SSO env must keep this app's origin allow-listed (lives on the `directus` Coolify service).
- Image import depends on ClickUp API availability + rate limits.

# AGENTS.md — poppim-web

Canonical guide for **poppim-web**, the **PIM frontend** for POP Creations. Read this first.

## 1. What this is
A React single-page app — the human UI for project/product management — that talks to the **shared Directus backend** (`data.designflow.app`). It stores **no data of its own**; everything is read/written through the Directus API. Backend schema, roles, and automation live in the separate **`directus`** repo (`u2giants/directus`). Sibling frontends will be `popcmr-web` (CRM) and `popdam-web` (DAM), each its own repo, all on the same backend.

Permanent home: **`pm.designflow.app`** (currently still points at the backend's Data Studio; rebinds to this app at launch — see the `directus` repo AGENTS.md "Domain plan").

## 2. Stack
- **React 19 + Vite + TypeScript** (strict)
- **Tailwind CSS v4** + **shadcn/ui** (`new-york` style, Radix primitives via the `radix-ui` package) — `asChild` works as in the shadcn docs
- **@directus/sdk** for the API; **lucide-react** icons
- Path alias `@/*` → `src/*`

## 3. Commands
```bash
npm install
npm run dev      # local dev server
npm run build    # tsc -b && vite build  (must stay green)
npm run preview  # serve the production build
```
`VITE_DIRECTUS_URL` (in `.env`, default `https://data.designflow.app`) points the SDK at the backend.

## 4. Structure
| Path | What |
|---|---|
| `src/lib/directus.ts` | Directus SDK client (auth + rest), `microsoftLoginUrl()`, `assetUrl()` |
| `src/lib/types.ts` | Minimal typed slice of the backend schema this app reads |
| `src/auth/auth.tsx` | `AuthProvider` + `useAuth()` — session check, email/password login, Microsoft SSO redirect, logout |
| `src/pages/LoginPage.tsx` | Login (Microsoft SSO + email/password) |
| `src/components/AppShell.tsx` | Top bar + user menu |
| `src/components/ui/` | shadcn components (generated — re-add with `npx shadcn@latest add <name>`) |
| `src/features/board/` | **Slice 1**: `BoardPage` (products grouped by stage), `TaskCard`, `TaskDetailSheet`, `api.ts` |

## 5. Current state (slice 1 = Task board + task detail)
- ✅ Auth shell, login, app shell, board grouped by stage, task-detail drawer with core fields — **builds & runs against the live backend**.
- ✅ **Collaboration wired & functional** (`src/features/board/collab.ts` + `Collaboration.tsx`): assignees (M2M), checklist, subtasks, and comments (native `directus_comments`) — all CRUD round-trips to the backend. Backend model added via the `directus` repo's `pm-system/add-collaboration-model.mjs`.
- ⏳ **Visual refinement pending Claude Design Prompt B (board) + C (task detail)** — current styling is functional-clean shadcn, not yet the final design.
- ⏳ Drag-to-change-stage not wired yet; board still loads a capped page (no filters/pagination yet).
- ⏳ Not yet deployed publicly; runs via `npm run dev`/`preview`. SSO-from-the-frontend (cross-subdomain) not yet wired — login currently works via email/password (token mode); the Microsoft button redirects but full SSO return needs backend session-cookie config.

## 6. Backend dependencies (must be set on `directus` before this runs against real data)
- **CORS**: the backend must allow this app's origin (`CORS_ENABLED=true`, origin allow-list) — set in Coolify on the `directus` service.
- **SSO redirect allow-list**: this app's URL must be in the Microsoft provider's redirect allow-list for SSO to return here.
- Auth currently uses token (`json`) mode in `localStorage`; revisit session-cookie mode for production SSO.

## 7. Deploy (planned, not yet done)
Per the POP standard: GitHub Actions → build image → registry → Coolify app **`poppim-web`**. Not set up yet; this repo is scaffold-only so far.

## 8. What to ignore
`node_modules/`, `dist/`, `.env`. See `.claudeignore`.

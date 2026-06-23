# Development — poppim-web

See `AGENTS.md` first.

## Prerequisites
- Node 20+ and npm. (Build verified on Node 20.20.)

## Setup
```bash
npm install
cp .env.example .env   # optional; defaults to the prod backend
```

## Run / build / lint
```bash
npm run dev       # Vite dev server (http://localhost:5173)
npm run build     # tsc -b && vite build  → dist/   (MUST stay green; strict TS)
npm run preview   # serve the production build (http://localhost:4173)
npm run lint      # eslint
```

`build` runs `tsc -b` first, so type errors fail the build. `noUnusedLocals`/`noUnusedParameters` are on — keep imports/params used.

## Backend connection
`VITE_SUPABASE_URL` (in `.env`) points the SDK at the backend; use `https://qsllyeztdwjgirsysgai.supabase.co` for the shared production project. Local browser auth depends on the Supabase project's site URL / redirect URL configuration.

## shadcn/ui components
UI primitives in `src/components/ui/` are **generated**. Add/update them with the CLI, not by hand:
```bash
npx shadcn@latest add <component>            # e.g. dialog, popover, calendar
npx shadcn@latest add <component> --overwrite
```
`components.json` pins `style: "new-york"` (Radix). Do not switch to `base-nova` (see AGENTS.md §11). Theme tokens live in `src/index.css`.

## Conventions
- App code under `src/features/`, `src/auth/`, `src/pages/`, `src/lib/`, `src/components/AppShell.tsx`.
- Import via the `@/` alias.
- Keep `src/lib/types.ts` in sync with the backend collections you query.

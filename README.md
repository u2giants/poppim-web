# poppim-web

PIM (product/project management) **frontend** for POP Creations — a React + Vite + TypeScript + Tailwind v4 + shadcn/ui SPA on the shared **Supabase.com** backend (`https://qsllyeztdwjgirsysgai.supabase.co`). It's the human UI replacing the ClickUp board; it stores no data of its own.

Live app: **https://pm.designflow.app** · Preview aliases: `pm-dev` / `pm-ci` · Shared backend schema repo: `u2giants/shared-db` · Siblings: `popcrm-web` (CRM), `popdam-web` (DAM).

Shared infrastructure/server standards: [`u2giants/albert-standards`](https://github.com/u2giants/albert-standards). Update that repo too when this app's hosting, deploy, runtime ownership, or operating-environment decisions change.

## Start here
- **[`AGENTS.md`](./AGENTS.md)** — canonical operating guide + documentation map (read first).
- [`docs/architecture.md`](./docs/architecture.md) · [`docs/development.md`](./docs/development.md) · [`docs/configuration.md`](./docs/configuration.md) · [`docs/deployment.md`](./docs/deployment.md)

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
```
Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` for local Supabase-backed development.

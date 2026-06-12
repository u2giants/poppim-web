# poppim-web

PIM (product/project management) **frontend** for POP Creations — a React + Vite + TypeScript + Tailwind v4 + shadcn/ui SPA on the shared **Directus** backend (`https://data.designflow.app`). It's the human UI replacing the ClickUp board; it stores no data of its own.

Live preview: **https://pm-dev.designflow.app** · Backend repo: `u2giants/directus` (local backend schema: `/worksp/directus/pm-system`) · Siblings: `popcrm-web` (CRM), `popdam-web` (DAM).

## Start here
- **[`AGENTS.md`](./AGENTS.md)** — canonical operating guide + documentation map (read first).
- [`docs/architecture.md`](./docs/architecture.md) · [`docs/development.md`](./docs/development.md) · [`docs/configuration.md`](./docs/configuration.md) · [`docs/deployment.md`](./docs/deployment.md)
- [`HANDOFF.md`](./HANDOFF.md) — current in-progress state (when present).

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
```
Set `VITE_DIRECTUS_URL` in `.env` (defaults to the prod backend).

# CLAUDE.md — poppim-web (Claude Code notes only)

**Read `AGENTS.md` first** — it's the canonical guide (architecture, identifiers, deployment, quirks, pending work). This file only adds Claude-specific notes; it does not duplicate AGENTS.md.

## Shared database / cross-app
Before any shared Supabase database, schema, migration, or cross-app change, read and follow `shared-db/AGENTS.md` (the cross-app coordination playbook): app code here is `main`-only (no branches); `shared-db` changes use branch+PR and the AI owns the merge.

## Ignore
`.claudeignore` is honored by Claude Code. For other AI tools, paste `AGENTS.md` first and follow its "What to ignore" (§10). Don't load `node_modules/`, `dist/`, `.env`, or the leftover Vite-template assets (`src/assets/*`, `public/icons.svg`).

## Build before claiming done
`npm run build` (`tsc -b && vite build`) must pass — strict TS with `noUnusedLocals`/`noUnusedParameters`. shadcn UI primitives in `src/components/ui/` are generated; change them via `npx shadcn@latest add` (style `new-york`), not by hand.

## Deploy
Deploy = **`git push` to `main`**. The pipeline (`.github/workflows/deploy.yml`, `docs/cicd.md`) runs Actions → GHCR → Coolify (service `ysvdyj3t7d5tyh5ogrvlka4y`) which pulls + runs the image at `pm.designflow.app`. Do **not** SSH into the server or `docker run` on it as a deploy — the legacy raw-docker path was removed. Runtime config (domain, env, restart) belongs in Coolify, not shell.

## Commit style
Short imperative subject (`add`/`fix`/`update`/`remove`), no trailing period; body only for non-obvious rationale. Commit + push on `main` (no force push). Git author must be `Albert Hazan <u2giants@users.noreply.github.com>` — GitHub blocks the gmail address.

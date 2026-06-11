# CLAUDE.md — poppim-web (Claude Code notes only)

**Read `AGENTS.md` first** — it's the canonical guide (architecture, identifiers, deployment, quirks, pending work). This file only adds Claude-specific notes; it does not duplicate AGENTS.md.

## Ignore
`.claudeignore` is honored by Claude Code. For other AI tools, paste `AGENTS.md` first and follow its "What to ignore" (§10). Don't load `node_modules/`, `dist/`, `.env`, or the leftover Vite-template assets (`src/assets/*`, `public/icons.svg`).

## Build before claiming done
`npm run build` (`tsc -b && vite build`) must pass — strict TS with `noUnusedLocals`/`noUnusedParameters`. shadcn UI primitives in `src/components/ui/` are generated; change them via `npx shadcn@latest add` (style `new-york`), not by hand.

## Deploy
The intended path is the **GitHub Actions → GHCR → Coolify** pipeline (`.github/workflows/deploy.yml`, `docs/cicd.md`). It's built; one owner step (make the GHCR package public) remains before cutover. Until then, production is on a **legacy raw-docker** container (`docs/deployment.md`) being retired. Do not SSH into the server or `docker run` on it as a normal deploy — that's the path we're removing. Runtime config (domain, env) belongs in Coolify, not in shell.

## Commit style
Short imperative subject (`add`/`fix`/`update`/`remove`), no trailing period; body only for non-obvious rationale. Commit + push on `main` (no force push). Git author must be `Albert Hazan <u2giants@users.noreply.github.com>` — GitHub blocks the gmail address.

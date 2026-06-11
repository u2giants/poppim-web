# CLAUDE.md — poppim-web (Claude Code notes only)

**Read `AGENTS.md` first** — it's the canonical guide (architecture, identifiers, deployment, quirks, pending work). This file only adds Claude-specific notes; it does not duplicate AGENTS.md.

## Ignore
`.claudeignore` is honored by Claude Code. For other AI tools, paste `AGENTS.md` first and follow its "What to ignore" (§10). Don't load `node_modules/`, `dist/`, `.env`, or the leftover Vite-template assets (`src/assets/*`, `public/icons.svg`).

## Build before claiming done
`npm run build` (`tsc -b && vite build`) must pass — strict TS with `noUnusedLocals`/`noUnusedParameters`. shadcn UI primitives in `src/components/ui/` are generated; change them via `npx shadcn@latest add` (style `new-york`), not by hand.

## Deploy
There is **no CI yet**. The live preview is a raw `docker build` + `docker run` with Traefik labels — see `docs/deployment.md`. This is a temporary, exceptional path (the org standard is Coolify + CI). Don't invent an SSH/CI flow that doesn't exist.

## Commit style
Short imperative subject (`add`/`fix`/`update`/`remove`), no trailing period; body only for non-obvious rationale. Commit + push on `main` (no force push). Git author must be `Albert Hazan <u2giants@users.noreply.github.com>` — GitHub blocks the gmail address.

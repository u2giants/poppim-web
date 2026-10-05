# CLAUDE.md — poppim-web (Claude Code notes only)

**Read `AGENTS.md` first** — it's the canonical guide (architecture, identifiers,
deployment, quirks, pending work). This file only adds Claude-specific notes.

- `.claudeignore` is honored by Claude Code. Other tools follow `AGENTS.md` →
  AI tool notes / What to ignore.
- **Shared DB, host, secrets, quirks, and incidents** live behind the pointers
  in `AGENTS.md` (`docs/quirks.md`, `docs/critical-incidents.md`). Do not
  restate them here.
- **Build before claiming done:** `npm run build` must pass.
- **Deploy:** push to `main` → Actions → GHCR → Coolify. No SSH deploy path.
- **Commit style:** short imperative subject; author
  `Albert Hazan <u2giants@users.noreply.github.com>`. Push to `main` (no force).

# Configuration — poppim-web

See `AGENTS.md` first. The frontend has **no secrets** (browser app; Supabase publishable anon keys are client-safe, but service-role keys must never be exposed).

Shared infrastructure/environment standards live in [`u2giants/albert-standards`](https://github.com/u2giants/albert-standards). If backend URLs, CORS/cookie/SSO expectations, runtime ownership, or environment handling change in a way future operators need to know, update the relevant standards docs there too.

## Frontend env vars
| Variable | Purpose | Where | Notes |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL | `.env` / `.env.example` | Build-time only (baked into the static bundle). Production project: `https://qsllyeztdwjgirsysgai.supabase.co`. |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable anon key | `.env` / `.env.example` | Build-time only. Client-safe publishable key; never use a service-role key in the frontend. |
| `VITE_BUILD_GIT_SHA` | Commit SHA shown in the top bar and embedded in `index.html` as `build-sha` | CI Docker build args; local fallback in `vite.config.ts` | Build-time only. Do not set as runtime env. |
| `VITE_BUILD_COMMIT_DATE` | Commit timestamp shown in the top bar | CI Docker build args; local fallback in `vite.config.ts` | Formatted in the UI using `America/New_York`. |
| `VITE_BUILD_RUN` | GitHub Actions run id/debug marker | CI Docker build args; local fallback `local` | Used for traceability/debugging. |

`.env` is git-ignored; `.env.example` is the template.

## Config files
| File | Purpose |
|---|---|
| `vite.config.ts` | Vite + `@tailwindcss/vite` plugin + `@`→`src` alias + local git fallback for build metadata |
| `tsconfig.json` / `tsconfig.app.json` | strict TS; `paths` `@/*`→`src/*` (no `baseUrl`, deprecated in TS7) |
| `components.json` | shadcn config — `style: new-york`, base color neutral, css `src/index.css` |
| `eslint.config.js` | lint rules |
| `nginx.conf` | SPA fallback (`try_files … /index.html`) + asset caching for the container |
| `src/index.css` | Tailwind v4 import + the brand OKLCH theme tokens (`:root`/`.dark`, stage colors) |

## Backend-side config this app requires (NOT set here)
The backend is the shared Supabase.com project `qsllyeztdwjgirsysgai`. Shared schema, RLS, realtime, and migration decisions belong in `u2giants/shared-db`, then the frontend types/API are updated here. Supabase service-role keys and backend secrets must not be exposed through Vite env vars.

Supabase Auth URL configuration is shared across CRM, PM, DAM, SG, and master-data apps. The project's `site_url` is `https://crm.designflow.app`, so every non-CRM frontend must pass an explicit `redirectTo` and must be present in the project's `uri_allow_list`. PM requires:

- `https://pm.designflow.app`, `https://pm.designflow.app/`, `https://pm.designflow.app/**`
- `https://pm-dev.designflow.app`, `https://pm-dev.designflow.app/`, `https://pm-dev.designflow.app/**`
- `https://pm-ci.designflow.app`, `https://pm-ci.designflow.app/`, `https://pm-ci.designflow.app/**`

If Microsoft SSO from PM lands on CRM, check this Supabase Auth allowlist first.

## Shared-db migration password
Schema migrations are not run from this frontend repo. When a future session works in canonical `u2giants/shared-db`, the Supabase direct Postgres password is available from 1Password:

- Vault: `vibe_coding`
- Item: `Supabase DB Password - shared POP database`
- Field: `password`

Use it only as the `SUPABASE_DB_PASSWORD` environment variable for Supabase CLI migration validation/apply commands, for example `supabase db push --dry-run`. Do not print the password, add it to `.env`, or expose it through any `VITE_*` variable. Verified on 2026-06-22/23: linking to project `qsllyeztdwjgirsysgai` and running a dry run with that password succeeded and reported the remote database up to date.

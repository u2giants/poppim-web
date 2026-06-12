# Configuration — poppim-web

See `AGENTS.md` first. The frontend has **no secrets** (browser app; auth is the backend session cookie).

## Frontend env vars
| Variable | Purpose | Where | Notes |
|---|---|---|---|
| `VITE_DIRECTUS_URL` | Backend API base URL | `.env` / `.env.example` | Build-time only (baked into the static bundle). Default `https://data.designflow.app` is hardcoded in `src/lib/directus.ts`. |
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
These live on the **`directus`** Coolify service and must include this app's origin:
- `CORS_ORIGIN` must list this app's origin; `CORS_CREDENTIALS=true`.
- `AUTH_MICROSOFT_REDIRECT_ALLOW_LIST` must include this app's URL (for SSO return).
- Session/refresh cookie domain `.designflow.app`, `*_SECURE=true`, `*_SAME_SITE=lax`.

See `directus` repo `AGENTS.md` §11 (cross-subdomain SSO) and §12.

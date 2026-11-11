# AGENTS.md — poppim-web

The complete document index is [`docs/INDEX.md`](docs/INDEX.md), generated from document headers. Read it — or search it for your topic's keywords — before opening or searching any other document. Open a document only when its summary matches your task.

This file is a router: it routes, it does not contain. Tables, identifiers, env vars and deploy detail live in [`docs/agents-reference.md`](docs/agents-reference.md). `shared-db/` is a read-only synced mirror of `u2giants/shared-db` — never edit it here.

## Project summary

`poppim-web` is the **PIM (product/project management) frontend** for POP Creations — a React + Vite + TypeScript SPA that is the human UI for the product-development pipeline, replacing the ClickUp board. **Users:** internal staff (designers, sales, licensing, management). It stores **no data of its own**; every read/write goes through the **shared Supabase.com backend** at `https://qsllyeztdwjgirsysgai.supabase.co` (shared schema repo: `u2giants/shared-db`). Sibling frontends: `popcrm-web` (CRM), `popdam-web` (DAM). **Live:** `https://pm.designflow.app` (aliases `pm-dev`, `pm-ci`).

## Standing rules (never skip)

- **Deploy = merge to `main`.** `main` is protected (2026-10-30): PR + code-owner approval. Merge → Actions verify → GHCR image → Coolify (`ysvdyj3t7d5tyh5ogrvlka4y`) pulls + runs. Actions never touches the server. No SSH, no raw `docker run` — the legacy path is retired.
- **Shared database:** all schema/RLS/view/RPC changes are authored in canonical [`u2giants/shared-db`](https://github.com/u2giants/shared-db) (branch + PR + timestamped migration, preview-first, merged there before app code lands here). Never app-side DDL. `.github/workflows/shared-db-guard.yml` enforces; emergency override is explicit only (PR label `db-change-approved` or `[db-change-approved]` in a commit message).
- **Task routing** is declared in `.ai-devops/task-gates.json` and verified by `scripts/test-task-gates.sh`; acknowledgement never bypasses a database-route refusal.
- **Business rules are companywide by topic**, not per-app: start at the [companywide application and task map](https://github.com/u2giants/shared-db/blob/main/docs/business-rules/application-map.md) and load only the topics the task touches. This repo documents PM/PIM implementation only.
- **Host/server changes** belong in [`u2giants/ansible`](https://github.com/u2giants/ansible) PRs, never direct SSH. Scope boundary: Ansible owns the host; Coolify owns the apps.
- **New Markdown file** → open it with the four-key header (`summary` ≤160 chars, `kind`, `status`, `read-when`), then regenerate the index with `ai-doc-health --repo . --fix-index` (tool + rules: [`popcre/ai-devops` `docs/doc-health.md`](https://github.com/popcre/ai-devops/blob/main/docs/doc-health.md)). The advisory check is `.github/workflows/doc-health.yml`; it must never become a required check (owner ruling 2026-10-30).

<!-- ansible-host-policy: managed rollout from u2giants/ansible -->

## Multi-model AI note

There is no universal ignore-file standard across AI coding tools. `.claudeignore` works for Claude Code. When using any other AI tool, paste this file as your first message and follow the instructions in "What to ignore" below.

## Documentation map: what to read for each task

Always start with: `AGENTS.md` and [`docs/INDEX.md`](docs/INDEX.md).

Then load additional docs only when relevant:

| Task / question | Read these docs | Usually do not need |
|---|---|---|
| Quick repo orientation | `README.md`, `AGENTS.md` | `docs/` deep dives |
| Modify a screen / app behavior (board, task detail, login) | `docs/architecture.md`, tables in `docs/agents-reference.md` | `docs/cicd.md` unless deploy changes |
| Add/change env vars, config, the backend URL | `docs/configuration.md`, `docs/deployment.md` if runtime/CORS affected | architecture docs |
| Change local setup, scripts, lint, shadcn components, tooling | `docs/development.md` | deploy docs |
| Change CI/CD, the release pipeline, GitHub Actions, registry, deploy trigger, rollback | **`docs/cicd.md`**, `.github/workflows/deploy.yml`; also update `u2giants/albert-standards` infrastructure docs if shared standards are affected | local-only dev docs |
| Change how data is read/written (tables/views, fields, Supabase client calls) | `docs/architecture.md`, **`shared-db/AGENTS.md`** if schema/RLS/view changes are involved | deployment docs |
| Touch the shared Supabase database, schema/migrations, or any cross-app work | **`shared-db/AGENTS.md`** first (cross-app coordination playbook), plus the query-performance contract in `docs/agents-reference.md` for high-volume lists | app-screen-only docs |
| Investigate a bug/incident | `docs/quirks.md`, `docs/critical-incidents.md`, open files in `HANDOFF.d/` | unrelated docs |
| Continue unfinished work | `HANDOFF.md` pointer → open files in `HANDOFF.d/` (newest first) | docs outside the handoff scope |
| Surprising behavior | `docs/quirks.md` | incident history |
| Product scope / "what's built vs. missing" | **`gaps.md`** (reconciled current-state, tagged DONE/PARTIAL/OPEN with file evidence); `docs/architecture-update-implementation-plan.md` is the original aspirational spec, historical only | day-to-day screen/deploy docs |
| Implement the activity-triage pilot | **`plan_jev_activity_triage.md`** (read its STATUS table first; issue #9 owns the open work), `bugs.md` (fit/no-fit audit) | unrelated roadmap/history docs |
| Pull secrets from 1Password | `docs/1password.md` | unrelated app/deploy docs |
| ClickUp MCP, migration audits, or the PM gap-review PDF | `docs/clickup-mcp.md`, `docs/1password.md` | deployment docs |
| Run or change the jev-gateway service | `jev-gateway/README.md`, `docs/verification/jev-activity-triage/gateway-scaffold.md` | screen docs |
| Claude Code session | `CLAUDE.md`, then `AGENTS.md` | other docs unless needed |
| Documentation-only cleanup | `AGENTS.md`, `README.md`, affected `docs/` | source except to verify accuracy |

## Open plans (read the plan's STATUS first; never re-plan)

- [`plan_jev_activity_triage.md`](plan_jev_activity_triage.md) — human-confirmed activity-triage pilot; steps 4–12 open; [issue #9](https://github.com/u2giants/poppim-web/issues/9) owns the work (label: parked).
- [`docs/typesafe-input-deletion-request.md`](docs/typesafe-input-deletion-request.md) — DRAFT, unsent; blocked on the TypeSafe written deletion commitment recorded in #9.

Historical plans at the root (`fix_new_schema.md`, `fix_remove_account.md`) are finished; see the index for their summaries.

## Pointers

- Quirks and do-not-fix decisions → [`docs/quirks.md`](docs/quirks.md)
- Incident history → [`docs/critical-incidents.md`](docs/critical-incidents.md)
- Repository structure, task-to-file map, identifiers, services, env/credentials, deploy QUIRKs, pending work → [`docs/agents-reference.md`](docs/agents-reference.md)
- Shared infrastructure standards → [`u2giants/albert-standards`](https://github.com/u2giants/albert-standards) (update it in the same session when hosting/deploy/operating decisions change here)

## What to ignore

Do not load into AI context: `node_modules/`, `dist/`, `.env`, `*.local`, `.cache/`, `coverage/`, leftover Vite-template assets (`src/assets/react.svg`, `src/assets/vite.svg`, `src/assets/hero.png`, `public/icons.svg`), and everything under `shared-db/` except `shared-db/AGENTS.md` (read-only synced mirror — never bulk-load or hand-edit it). Matches `.claudeignore` / `.cursorignore`.

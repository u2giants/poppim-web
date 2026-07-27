# Handoff — Poppim codebase audit remediation landing gate

Date: 2026-07-27 (America/New_York)

Status: Phases 0–5 are implemented and verified. Shared-db PR #271 merged as
`db5bcea830297c5677f13bad82cdca57b5f8859c`; all 18 approved PM migrations are
applied and object-verified in preview and production. The shared-db consumer
sync landed on app `main` as `954c4ef`, production types were regenerated, and
all local gates plus final Grok review pass. App commit
`35a9e7bd004db834299d27f18031eefa8950bec4` was pushed; all three GitHub
workflows passed and production plus both aliases served that exact SHA.
Albert then authorized a dedicated production tester and authenticated smoke.
The final matrix exposed and fixed a Control Room concurrency timeout; build
`552b170ca46e05f934aea9d6eb06e42eae07be8b` is live and the repeated matrix
passes. One database correction remains production-pending: shared-db PR #273
merged the owner-scoped saved-view CRUD grant/policy migration after preview
proof, but it has not been applied to production because it requires a new
exact approval.

## 2026-07-27 authenticated preview gate update

- Dedicated preview Auth user: created through the canonical invitation +
  Supabase Auth trigger path; active canonical PM access and administrator role.
- Credential: 1Password `vibe_coding` item
  `Poppim preview test login - Codex (shared-db-schema-rehearsal)`, item ID
  `lf7ope4i5lxggzmjzo3b6oxmli`. Never use it against production.
- Passed before the blocker: email/password browser login; Licensed, Generic,
  and Software pipeline page/count/facet RPCs; invalid `All` department
  rejection; 15-screen navigation; preview Control Room/Pipeline/Reports
  desktop captures and Reports mobile capture.
- Blocker: authenticated `api.pm_department_report('Licensed')` returned
  `42501 permission denied for table activity`. Real browser invoker execution
  needs table grants in addition to function execute privilege and RLS.
- Correction:
  `/tmp/poppim-shared-landing/supabase/migrations/20260727200500_poppim_authenticated_app_record_grants.sql`.
  It grants only the `app.activity`, `app.comment`, and `app.notification`
  privileges already required by the new invoker functions and existing
  Poppim collaboration/operating writes, plus an own/admin notification insert
  policy.
- Proof without persistent mutation: a single rollback transaction temporarily
  applied the correction and successfully called all 13 secondary RPC groups
  as the dedicated authenticated user. It ended with `ROLLBACK`.
- Shared-db commit:
  `3dbc7d1ee3fde2bd8b2fa33c01a812b06950d25f`, pushed to
  `origin/codex/poppim-audit-remediation`; no PR opened.
- Collision discovered: preview ledger versions `20260727190000` and
  `20260727191000` belong to unmerged
  `origin/codex/dam-customer-forward-20260727` and are absent from current
  shared-db `main`. No repair, pull, `--include-all`, preview PM apply, PR,
  merge, or production mutation was performed.
- Exact resume order: serialize the DAM branch; approve the eighteenth Poppim
  correction; bounded preview apply; rerun the complete browser matrix; then
  resume PR/merge and bounded production landing.

### Subsequent completion and production landing

- DAM PR #269 and evidence PR #270 are merged; required Grok review passed with
  no Critical/High/Medium findings. Both DAM versions are in production and
  actual resolver/facet functions, trigger state, Rooms-to-Go links, and
  multi-customer null behavior were verified.
- PM migration `20260727200500` was the only file in the bounded preview dry
  run and was applied successfully.
- Final authenticated preview result: 16 screens, 26 API checks, zero console
  errors, zero failed network responses. The browser exposed and verified a
  narrow frontend fix: role slugs such as `administrator` are no longer sent to
  the UUID-only My Work role parameter.
- PM PR #271 merged as
  `db5bcea830297c5677f13bad82cdca57b5f8859c`; its validate check passed.
- Final PM Grok review passed with no Critical/High/Medium findings (session
  `019fa550-1b0e-70f0-bcec-260de4b2b94f`).
- The production migration guard built `/tmp/poppim-production-runner-18` from
  exact merged `main`, the complete production ledger, and the exact approved
  18-version allowlist. No unrelated pending migration remains in that runner.
  Albert explicitly authorized the narrow `--include-all` exception for that
  exact runner and exact allowlist. The dry run was machine-checked as
  `exact-18-verified`; the apply succeeded with no unrelated migration.
- Production verification: ledger 18/18; 19 `api.pm_*` functions; zero
  `SECURITY DEFINER`; authenticated execute 19/19; anonymous execute 0/19; all
  10 expected indexes; one `notification_insert_own` policy; required
  authenticated activity/comment/notification grants; one scoped My Work
  function.
- Consumer sync succeeded and app `main` fast-forwarded to `954c4ef` without
  disturbing local work. Production types were generated with
  `npm run types:production`.
- Final Grok review passed with no Critical/High/Medium findings, session
  `019fa559-a224-7af2-a348-3e62b9252319`.

### Authenticated production completion and saved-view follow-up

- Dedicated production tester:
  `Poppim production test login - Codex (pm.designflow.app)`, 1Password item
  `5loykmzdtc6lqbyd6gknpimecq`. Auth user
  `dd4539e7-a8a3-4de6-8b6b-875020c78c5e`, profile
  `5758b63f-ba0b-4634-9149-37e26a12e2c1`; active PM-only access and
  administrator role. Trigger-created CRM access is revoked. Retain this
  account for future approved production smoke tests.
- First production matrix exposed intermittent Licensed `pm_pipeline_page`
  statement timeouts when Control Room launched three overlapping PIM reads
  concurrently. Each call passed alone. App commit `552b170` serializes the
  Control Room snapshot calls; targeted test, lint, build, CI, deploy, and live
  SHA passed.
- Fixed-build production matrix: 16 screens, 26 API checks, all three
  departments, search/continuation contracts, Reports and Control Room
  isolation, all secondary pages, zero console errors, zero failed responses.
- Reversible production proof: an existing saved-view preference and one
  own-profile PM notification were created, verified, and removed. Cleanup
  queries returned zero rows. A real Licensed product opened and all five
  product-detail work tabs passed at desktop and mobile sizes.
- Only non-sensitive JSON evidence is committed:
  `.ai/evidence/phase5-production-browser-matrix-20260727.json` and
  `.ai/evidence/phase5-production-reversible-smoke-20260727.json`. Production
  screenshots containing business data were deliberately removed.
- Direct saved-view creation returned HTTP 403 because `authenticated` had only
  `SELECT` on `pim.saved_view`. Shared-db migration
  `20260727213000_poppim_saved_view_crud_grants.sql` grants CRUD and replaces
  generic policies with owner/shared-scoped rules. Preview rollback SQL and a
  genuine preview JWT create/read/update/delete/preference run pass with zero
  fixtures left.
- Shared-db PR #273 merged as
  `3f64638c5e14ee2e51f73892acce56f30af3cf97`. Grok review PASS, no
  Critical/High/Medium findings, session
  `019fa581-4042-7402-8f98-997b4380aeec`.
- **Production gate:** migration `20260727213000` is not applied to
  production. Obtain exact approval for this one migration, run bounded dry-run
  and apply, verify grants/policies with the production JWT, then regenerate
  production types only if the schema shape changed (this grants-only change
  should not alter generated types).

## 1. What this application is

`poppim-web` is POP Creations' internal product/project-management frontend and
ClickUp replacement. Designers, sales, licensing, and management use it for
product pipelines, projects, workflow records, reports, reminders, and product
details.

- App checkout: `/worksp/poppim-web`
- GitHub: `u2giants/poppim-web`, main-only
- Stack: React 19, TypeScript, Vite 8, Tailwind, shadcn/Radix
- Live app: `https://pm.designflow.app`
- Preview aliases: `pm-dev.designflow.app`, `pm-ci.designflow.app` (the same
  Coolify production service, not an isolated application environment)
- Shared backend: hosted Supabase project `qsllyeztdwjgirsysgai`
- Canonical schema checkout: `/worksp/shared-db`
- Shared-db rehearsal preview: `rjyboqwcdzcocqgmsyel`
- Shared-db remediation branch: `codex/poppim-audit-remediation`

The SPA stores no data. Browser reads, writes, auth, RLS, functions, and schema
come from the shared Supabase backend used by PM/CRM/DAM/PLM. The
`/worksp/poppim-web/shared-db/` directory is an auto-synced read-only mirror;
never edit it.

## 2. What we set out to do, and why

The 2026-07-26 whole-codebase audit found business-correctness failures:

- the pipeline filtered only after a capped read, hiding eligible products;
- saved-view keys and persistence behavior were inconsistent;
- stage/history and metadata mutations were non-atomic;
- auth profile failures could masquerade as a successful login;
- Reports, Control Room, and secondary screens mixed departments or presented
  bounded data as complete;
- important mutation/load failures were silent;
- `TaskDetailModal` was too large to change safely;
- tests, typing, dependency health, lint, and bundle size were weak.

The implementation goal was to correct those contracts in canonical shared-db,
adopt them in the frontend, protect behavior with tests, and land only after
preview and authenticated UI evidence. The executable specification remains
`plan_codebase_audit_remediation.md`; its status annotations are current.

## 3. Current state

### Application repository

- Branch: `main`, tracking `origin/main`
- Release commit: `35a9e7bd004db834299d27f18031eefa8950bec4`
- State: committed and pushed to `origin/main`
- Production, `pm-dev`, and `pm-ci` all served release SHA `35a9e7b` in
  `<meta name="build-sha">` on 2026-07-27.
- GitHub workflows all passed:
  deploy `30304699161`, shared-db guard `30304699311`, and Forbid Shared DB
  Bypass `30304699576`.

The local app worktree contains the complete Phase 0–4 bundle:

- pipeline paging/count/facets and atomic stage/metadata callers;
- saved-view scope normalization, atomic preference writes, rollback/toasts;
- explicit auth/profile states;
- exact/paged/window contracts for Reports, Control Room, Schedule, Notes,
  People, Accounts, Projects, My Work, workflow, designs, and orders;
- decomposed product-detail domains under `src/features/product-detail/`;
- shared required/optional error handling and mutation rollback helpers;
- lazy-loaded screens, dependency cleanup, bundle budget, and generated
  production database types;
- 13 test files covering 38 tests;
- durable accuracy rules in `docs/secondary-screen-accuracy-contracts.md`.

Every untracked application path is intentional:

- `.ai/evidence/`: Phase 0 baseline plus the four Phase 5 screenshots named
  below;
- `scripts/check-bundle.mjs`: entry-chunk regression gate;
- `docs/secondary-screen-accuracy-contracts.md`: durable data semantics;
- new `*.test.*`, `src/test/`, `src/lib/uiError*`,
  `src/lib/uiMutation*`, `src/auth/authRequestGuard.ts`, and
  `src/features/product-detail/`: implementation/tests from Phases 0–4.

The temporary `.playwright-mcp/` capture directory and local Vite process were
removed/stopped. There are no unknown database migrations or temporary files.

### Canonical shared-db repository

- Branch: `main`
- Merge SHA: `db5bcea830297c5677f13bad82cdca57b5f8859c`
- State: clean; validate and consumer-sync workflows passed
- PR: `https://github.com/u2giants/shared-db/pull/271`
- Production: all approved PM migrations applied and verified

The merged change contains exactly 18 PM migrations:

- Phase 1:
  `20260727013000_poppim_audit_remediation_contracts.sql`,
  `20260727013100_poppim_atomic_contract_dml_grants.sql`,
  `20260727013200_fix_pm_view_pref_conflict_target.sql`
- Phase 3: all 14 consecutive files from
  `20260727023000_poppim_secondary_screen_contracts.sql` through
  `20260727024300_scope_poppim_my_work_department.sql`
- Phase 5 correction:
  `20260727200500_poppim_authenticated_app_record_grants.sql`

All 18 are applied to rehearsal preview `rjyboqwcdzcocqgmsyel` and production
`qsllyeztdwjgirsysgai`.

### Verification evidence

Clean frontend verification on 2026-07-27:

- Node `v20.20.2`; npm `11.16.0`
- `npm ci`: passed; 534 packages added, 535 audited
- `npm test`: 13 files passed, 38/38 tests passed, 1.25 seconds
- `npm run lint -- --max-warnings=0`: passed with zero warnings
- `npm run build`: TypeScript + Vite + bundle gate passed
- Vite transformed 1,962 modules
- entry chunk: `372,227` bytes / `116.12` kB gzip, under the `500,000`-byte
  limit and about 55% smaller than the audited `827.62` kB baseline
- `git diff --check`: passed in both repositories
- shared-db `bash scripts/check-sql.sh`: static checks passed
- duplicate migration timestamp scan: no duplicates

Dependency audit:

- runtime `npm audit --omit=dev --json`: 0 advisories
- full audit: 4 dev-only advisories (2 moderate, 2 high, 0 critical)
- paths: `shadcn` → `@modelcontextprotocol/sdk` →
  `@hono/node-server` (moderate Windows static-path traversal);
  transitive `brace-expansion` (two high DoS advisories); transitive `postcss`
  (high source-map path disclosure)
- disposition: none ship in the nginx SPA runtime. Do not run
  `npm audit fix --force`; review patched compatible shadcn/tooling releases at
  the next dependency maintenance pass.

Broad-select/silent-catch audit:

- no `catch(console.error)`, `catch(() => {})`, or empty catch remains in owned
  source;
- remaining `select('*')` calls are confined to bounded/per-ID detail,
  collaboration, saved-view, operating-record, and small batched compatibility
  reads. The high-volume pipeline and all audited secondary lists use narrow
  server contracts. Do not reintroduce a broad `pim.product` list read.

Preview verification repeated in this Phase 5 pass:

- bounded dry-run excluding only the unrelated historical files
  `20260726190000_style_tracker_rows_restrict_writes.sql` and
  `20260726200000_style_tracker_rows_restore_open_writes.sql` reported
  `Remote database is up to date`;
- direct unbounded dry-run correctly refused because those two earlier local
  migrations are not in the preview ledger. `--include-all` was not used;
- `verify-preview.sql` inserted 12,050 rollback-only Licensed fixtures and
  passed deep paging/no-gap, beyond-cap search, invalid cursor/department,
  count/facet reconciliation, metadata merge/conflict/direct-key rejection,
  atomic preference merge, stage no-op/history/forced rollback, non-PM RLS,
  and anonymous-execute denial checks; transaction ended with `ROLLBACK`;
- ledger: all 18 PM migration versions present;
- current PM functions: 19 overloads, all `SECURITY INVOKER`, all executable by
  `authenticated`, all denied to `anon`;
- indexes: all 10 expected PM indexes present;
- only department-scoped My Work/revision/reminder signatures remain.

Fresh `EXPLAIN (ANALYZE, BUFFERS)` results under the 8-second preview timeout:

| Probe | Time |
|---|---:|
| Licensed first 50 | 3,048 ms |
| Licensed next 50 | 2,845 ms |
| Generic first 50 | 300 ms |
| Software first 50 | 213 ms |
| Licensed selective search | 514 ms |
| Licensed list filter | 2,598 ms |
| Licensed exact count | 181 ms |
| Licensed facets | 636 ms |
| Underlying keyset predicate/order | 171 ms |

The underlying plan used `pim_product_pipeline_keyset_idx` and a bounded 28 kB
top-N heapsort.

Authenticated preview evidence:

- `.ai/evidence/phase5-preview-control-room-desktop-20260727.png`
- `.ai/evidence/phase5-preview-pipeline-desktop-20260727.png`
- `.ai/evidence/phase5-preview-reports-desktop-20260727.png`
- `.ai/evidence/phase5-preview-reports-mobile-20260727.png`
- `.ai/evidence/phase5-preview-browser-matrix-20260727.json`

The final preview matrix covered 16 screens and 26 API checks with zero console
errors and zero failed responses. The production login page had also been
checked unauthenticated at desktop/mobile sizes. Authenticated production smoke
remains pending because no approved PM production tester exists.

## 4. Everything tried that did not work

### Running the ordinary preview dry-run from the full shared-db checkout

It appeared to be the normal final gate, but Supabase refused because two
unrelated older style-tracker migrations precede the current preview ledger.
Using `--include-all` would have expanded scope and was rejected. The safe
method was a temporary checkout that removed only those two exact unrelated
files; the bounded dry-run then reported the remote up to date.

### Local unauthenticated app reaching the login page

The combined local caller was pointed at production through the existing
`.env`. Production lacks the 17 new RPC migrations, so auth/profile startup did
not advance beyond loading during the capture. This is not evidence of a
frontend regression and must not be “fixed” by committing the caller early or
changing production. Use preview runtime values for the authenticated gate.

### First authenticated Poppim visual pass

The first attempt correctly stopped because no dedicated preview account
existed. A Poppim-specific preview user was then provisioned through the
canonical invitation/Auth-trigger path and stored in 1Password. The full matrix
subsequently passed. Sibling credentials were never borrowed.

### Zeroing the full npm audit with force

The remaining findings are transitive development-tooling paths and runtime
audit is clean. `npm audit fix --force` risks incompatible shadcn/tool changes,
so it was not run. This is an explicit reviewed exception, not a hidden failure.

### Earlier immutable migration corrections

Preview rehearsal exposed real issues; applied migrations were never edited:

1. stage mutation initially lacked underlying DML grants
   (`20260727013100` fixed it);
2. saved-view upsert conflict target was ambiguous (`20260727013200`);
3. report `p.*` materialization timed out (`20260727023100` narrowed it);
4. project page used historical `core.company`
   (`20260727023400` corrected to `core.customer`);
5. profile email `citext` disagreed with the return type
   (`20260727023500`);
6. report repeatedly detoasted metadata (`20260727023600`);
7. schedule UNION cursor columns were unnamed (`20260727023900`);
8. My Work supporting calls were not department-scoped
   (`20260727024300` replaced the overloads).

These failures and corrections are durable evidence in
`/worksp/shared-db/docs/app-migration-notes/poppim-audit-remediation-20260727.md`.

## 5. Root causes and key findings

- Browser-side caps cannot support complete search, counts, or filters. The new
  contracts apply mandatory department/eligibility predicates before bounded
  keyset limits.
- Counts/facets/supporting windows must fail independently from primary list
  data.
- Stage plus history and JSON metadata patching require database transactions,
  not sequential browser writes.
- Application ownership uses `app.profile.id`; `auth.users.id` is not a safe
  fallback.
- Department accuracy must be inherited through product/project relationships.
  Unattributable records are excluded, never mixed into the selected department.
- Production now has the complete approved PM migration set; the frontend can
  land through the normal GitHub Actions → GHCR → Coolify path.
- The rehearsal preview is production-like but its zero-row account/design/
  collection/order probes describe preview data only; they do not prove those
  domains are empty in production.
- The current licensor UUID column is null on legacy products. The typed
  licensor filter is correct but cannot match those rows until a separately
  governed reconciliation populates IDs.

## 6. Exact next steps

1. Obtain separately approved Poppim production test access, then repeat the
   critical authenticated smoke tests in production.
   - At minimum: three pipeline departments, continuation/search, one
     reversible saved-view preference, one authorized mutation, Reports/
     Control Room isolation, secondary-page continuation/window labels, every
     product-detail tab, console/network.
   - Do not create a production user or borrow CRM/DAM credentials without
     explicit authorization.
   - Verification gate: production evidence is recorded; then mark the final
     authenticated gate complete and remove this handoff if no work remains.

## 7. Constraints and gotchas

- App work is main-only. Shared-db uses branch + PR.
- Production/shared cloud is read-only without explicit approval. The exact
  18-migration PM production apply was explicitly authorized and is complete.
- Do not edit the app's `shared-db/` mirror.
- Never use `supabase db push --include-all` generally. The sole exception in
  this session was explicitly authorized for the exact guard-built 18-file
  runner after machine verification.
- Never edit an applied migration; add a new timestamped correction.
- Do not expose service-role credentials to the browser.
- Departments remain hard-separated; never add “All.”
- Do not display `product.code`.
- Preserve numeric ClickUp order semantics, `PimTaskCard`'s `shrink-0`, and
  original `cover_url`.
- Do not hand-edit generated shadcn primitives or database types.
- UI completion requires authenticated browser evidence.
- Counts/supporting calls cannot blank primary lists.
- Mutation failure must alert and rollback; no silent optimistic drift.
- The preview branch contains production-like data. Screenshots/logs must not
  expose customer or user data.

## 8. Access and environment

- GitHub CLI and Supabase CLI were exercised with real read calls.
- Supabase CLI version used: `2.98.2` (it reported `2.109.1` available; no
  system binary was replaced).
- 1Password vault: `vibe_coding`
- Preview credential item:
  `Supabase Preview Branch Credentials - shared POP database (shared-db-schema-rehearsal)`
- Production DB password item:
  `Supabase DB Password - shared POP database`
- Production PM tester item:
  `Poppim production test login - Codex (pm.designflow.app)`, item
  `5loykmzdtc6lqbyd6gknpimecq`
- Supabase PAT item: `Supabase CLI Personal Access Token`
- Secrets were injected at process runtime and never printed, written to repo
  files, or committed.
- Git author for commits:
  `Albert Hazan <u2giants@users.noreply.github.com>`
- Deploy ownership: GitHub Actions → GHCR
  `ghcr.io/u2giants/poppim-web` → Coolify service
  `ysvdyj3t7d5tyh5ogrvlka4y`

## 9. Open questions and risks

- Exact approval is required to promote only shared-db migration
  `20260727213000_poppim_saved_view_crud_grants.sql`. Until then, production
  create/rename/delete saved-view operations remain blocked by table grants;
  reading shared/own views and preference RPC writes work.
- Licensor UUIDs are currently null for legacy products, so the new filter
  contract needs a separate data-reconciliation decision before it is useful
  for those records.
- Preview's sparse secondary-domain data limits browser realism, but the
  authenticated production matrix now passes.
- Five dev-tool advisories remain. Owner: next dependency-maintenance session.
  Review date: 2026-08-27 or sooner if shadcn publishes compatible patched
  transitive versions. Runtime exposure is currently zero.
- The consumer-sync commit has already been reconciled without losing local
  work.

## Self-audit

Passed on 2026-07-27:

1. A newcomer can identify the app, repositories, branches, runtime, and
   backend without this chat.
2. The exact local/remote/preview/production state and remaining release gate
   are explicit.
3. Failed approaches and immutable migration corrections are recorded with
   reasons.
4. Every remaining next step has an executable verification gate.
5. Access item titles, URLs, SHAs, migration set, metrics, screenshots, and
   constraints are named without exposing secrets.

A fresh developer should be able to continue as effectively as this session
without asking what was done, what failed, or what must happen next.

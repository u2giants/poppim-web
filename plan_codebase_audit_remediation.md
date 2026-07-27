# Poppim Codebase Audit Remediation — Implementation Plan

**Plan status (2026-07-27):** Phases 0–5 are implemented. All 18 additive PM
migrations pass rehearsal preview and are applied/object-verified in
production; shared-db PR #271 merged and consumer sync completed. Step 19 gates
pass. Step 20 authenticated preview passed across 16 screens and 26 API checks
with zero console/network failures. Step 21 commit/push, all three CI workflows,
deployment, live SHA, and authenticated production smoke pass after app commit
`552b170` fixed a Control Room concurrency timeout exposed by the first matrix.
The smoke also exposed missing `pim.saved_view` CRUD table grants. Shared-db PR
#273 merged the owner-scoped correction after preview/JWT proof; Albert
explicitly approved the exact migration, and the bounded production apply plus
genuine production-JWT owner/shared/denial/cleanup matrix pass. This plan is
complete. See `HANDOFF.md` for evidence and exact state.
**Created:** 2026-07-26 (America/New_York)
**Target application repo:** `/worksp/poppim-web`, GitHub `u2giants/poppim-web`, branch `main`
**Canonical database repo:** `/worksp/shared-db`, GitHub `u2giants/shared-db`, dedicated branch + PR required
**Production application:** `https://pm.designflow.app`
**Production Supabase project:** `qsllyeztdwjgirsysgai`
**Preview Supabase project:** use the current preview project ref documented in canonical `/worksp/shared-db/AGENTS.md`; do not trust a copied historical ref without verifying it there.

This plan complements [`HANDOFF.md`](HANDOFF.md). Read both before implementation. The handoff explains the wider application history; this file is the executable specification for fixing the 2026-07-26 whole-codebase audit findings.

## 1. The ultimate goal

Internal POP Creations staff must be able to trust that Poppim shows the complete and correct department-specific workload, preserves their saved-view settings, records workflow changes consistently, never silently loses another user's edits, and clearly reports failures. The application should load bounded data efficiently, remain maintainable, and ship without known vulnerable or unused direct dependencies.

When this work is complete:

- Pipeline search, department separation, filters, facets, pagination, and totals operate on the full eligible product set rather than an arbitrary recent slice.
- Saved-view hide, color, and order preferences survive reload and failed writes visibly revert or alert.
- Product stage changes and their audit history succeed or fail together.
- Concurrent metadata edits cannot silently overwrite unrelated fields.
- Reports, Control Room, Schedule, Notes, People, Accounts, Projects, and My Work either return complete scoped results or explicitly disclose bounded/truncated results.
- A profile-resolution failure cannot masquerade as a successful, partially functional login.
- Core behavior has meaningful automated coverage; lint warnings, dependency advisories, oversized modules, and avoidable bundle weight are materially reduced.
- The deployed SHA is verified in the live HTML and critical UI workflows are visually checked in an authenticated browser.

**If a step conflicts with this goal, the goal wins — stop and flag it.** Do not preserve a technically convenient implementation that still presents incomplete or misleading business data.

## 2. What this application is

`poppim-web` is POP Creations' internal product/project-management frontend and ClickUp replacement. Designers, sales, licensing, and management use it for product pipeline boards, project/workflow views, operational reports, reminders, and product details.

Architecture:

- React 19 + TypeScript + Vite 8 single-page application.
- Tailwind CSS v4 and generated shadcn/Radix primitives.
- Browser data/auth through `@supabase/supabase-js`.
- No application-owned database or server. All persistent data, RLS, API views/RPCs, auth, and schema live in the shared Supabase project.
- GitHub Actions builds `ghcr.io/u2giants/poppim-web`; Coolify serves it at `https://pm.designflow.app`.
- The local `shared-db/` directory is an auto-synced, read-only mirror. Any database contract, RPC, view, index, or migration must be authored in canonical `/worksp/shared-db`.

Repository rules that matter:

- Normal Poppim application work lands directly on `main`.
- Shared database work uses a dedicated branch and PR in `/worksp/shared-db`; the AI owns the PR through merge after preview verification.
- Production/shared infrastructure is read-only by default. This plan authorizes implementation planning, not direct production mutation. A later implementation session must follow `/worksp/shared-db/AGENTS.md` and obtain any approval that document requires before production promotion.
- Generated `src/components/ui/*` files are changed only with the shadcn CLI.
- `src/lib/database.types.ts` is regenerated from Supabase; never hand-edit generated entries.

## 3. What triggered this work

On 2026-07-26, after fast-forwarding `main` to commit `d1c220dc2e5e3dda73d7c9ae298a7efd380743be`, a whole-codebase review inspected the owned application source, ran tests/lint/build/audit, and compared data-access code with the documented dataset and shared-Supabase performance contract.

The audit found:

1. Pipeline filters and counts are applied after capped reads.
2. Saved-view preference storage keys do not match lookup keys.
3. Stage changes can update the product but fail to record history.
4. Metadata read–merge–write can lose concurrent edits.
5. Department reports mix department-scoped and global data and use arbitrary caps.
6. Profile RPC failure silently becomes a fallback user with the wrong identifier semantics.
7. Several newer screens use broad `select('*')`, fixed caps, and client-side filtering that silently omit matches.
8. The codebase has 141 lint warnings, only three tests, an 827.62 kB minified entry chunk, unused/misclassified direct dependencies, and 12 dependency advisories after a clean install.

Primary reproduction paths:

- Pipeline: authenticated user opens `https://pm.designflow.app`, selects a department, searches for or filters a product outside the newest fetched slice, or compares displayed totals/facets with authoritative full-dataset results.
- Saved views: hide/recolor/reorder a view, reload the browser, and observe the preference disappear.
- Reports: switch among Licensed, Generic, and Software and observe that several totals/operational metrics remain global.
- Auth failure: make `api.current_user_profile` unavailable while retaining a valid Supabase Auth session; the shell opens with a fallback auth UUID and downstream user-owned data appears missing.
- Stage partial failure: allow `pim.product` update but force `pim.stage_history` insertion to fail; the UI reverts even though the product stage already changed.
- Metadata race: two sessions edit different metadata-backed product fields after reading the same starting object; the last complete-object write removes the first change.

## 4. Scope — in and out

### In scope

- A purpose-built, authorized PM pipeline list/facet/count database contract with bounded deterministic keyset pagination.
- Atomic database mutations for stage + history and metadata patching/concurrency.
- App adoption of those contracts and regenerated database types.
- Saved-view preference key correction, concurrency-safe upsert if needed, visible mutation errors, and reload coverage.
- Correct department scoping and pagination/bounded-result behavior across reports and secondary screens.
- Auth/profile failure semantics and visible error handling.
- Replacement of silent catches in the audited flows with actionable UI feedback.
- Unit/integration tests for every corrected behavior.
- Dependency upgrades/removals, bundle splitting, lint/type cleanup in owned code, and decomposition of `TaskDetailModal.tsx`.
- Authenticated visual verification and production SHA verification.
- Durable documentation and handoff updates.

### Not in this plan

- Redesigning the product experience or visual brand.
- Replacing Supabase, React, Vite, shadcn, or Coolify.
- Reintroducing an “All departments” mode; departments remain hard-separated.
- Changing the business meaning of ClickUp status, list, folder, order index, or product code.
- Copying DAM's private `get_ai_tag_candidates` RPC or its indexes. PM needs its own measured contract.
- Building a universal cross-app reporting/search service.
- Tightening unrelated RLS policies or changing shared production infrastructure.
- Recovering the 46 historically missing ClickUp file sources.
- Completing every historical item in `gaps.md`; only issues tied to this audit are included.
- Converting the entire application to a client data framework or router merely to solve these defects.

## 5. Current state of the code

### Repository and verification state

- App branch: `main`, synchronized with `origin/main` at `d1c220dc2e5e3dda73d7c9ae298a7efd380743be` when this plan was started.
- That incoming commit changed only the read-only `shared-db/` mirror.
- `npm ci` succeeds.
- `npm test` passes one file, `src/domain/reference/pmCustomerList.test.ts`, with three tests.
- `npm run build` succeeds and produces an 827.62 kB minified / 225.79 kB gzip main JavaScript chunk.
- `npm run lint` exits successfully but emits 141 warnings, primarily explicit `any`, React effect state updates, and missing hook dependencies.
- `npm audit` after `npm ci` reports 12 vulnerabilities: 1 critical, 5 high, 5 moderate, and 1 low. The critical advisory is in Vitest's development UI-server surface, not the deployed static application, but it still requires remediation.
- The audit helper created an untracked `.ai/reviews/20260726-221442-final-check.md`. It is diagnostic output, not application code. Decide explicitly whether to commit it as evidence or remove it before implementation closeout; do not leave mystery untracked files.

### Existing code that works and must be preserved

- Pipeline uses a narrow initial product projection rather than `pim.product.select('*')`: `src/features/pipeline/api.ts`.
- Pipeline enrichment batches `api.pm_product_board` requests in groups of 100: `src/domain/products/enrich.ts`.
- Pipeline discards stale asynchronous results with a fetch version: `src/features/pipeline/PipelinePage.tsx`.
- Departments are hard-separated and map legacy values to Licensed/Generic/Software.
- Product cards retain `shrink-0` to prevent flex collapse.
- `cover_url` remains the original asset; thumbnails are derived/fallback presentation.
- ClickUp `orderindex` is numerically interpreted and is not a globally exact order.
- Product `code` remains hidden from human-facing labels.
- Supabase Auth remains the session owner.
- Shared saved views are not directly modified by non-owners; personal preferences live in `pim.view_pref`.

### Half-done/problematic exact state

- `src/features/pipeline/api.ts:77-115`: reads 5,000/10,000 rows, enriches, then filters; count is a capped second list read.
- `src/features/views/api.ts:35-44,79-87` and `src/components/Sidebar.tsx:121-145`: preference `scope` is returned as `view:<uuid>` but consumed as a bare UUID.
- `src/components/Sidebar.tsx:178-208`: optimistic preference/delete operations swallow write errors.
- `src/features/board/api.ts:6-22`: product stage update precedes history insert without a transaction.
- `src/features/board/collab.ts:293-306`: metadata fields are read, shallow-merged, and written as a complete JSON object.
- `src/features/reports/api.ts:53-99`: products/projects are locally department-filtered while other metrics are global and all collections have caps.
- `src/features/control-room/api.ts:24-60`: broad capped reads and metadata-only unit extraction create incomplete/misclassified summaries.
- `src/auth/auth.tsx:30-57`: all current-profile errors become a fallback `AppUser`.
- `src/features/schedule/api.ts:23-74`, `src/features/notes/api.ts:16-50`, `src/features/people/api.ts:18-52`, `src/features/accounts/api.ts:20-58`, `src/features/projects/api.ts:22-35`, and `src/features/mywork/api.ts:7-33`: broad/unbounded/capped reads or client filtering need contract-specific review.
- `src/components/TaskDetailModal.tsx`: 1,792 lines, multiple data domains, effects, mutations, and silent catches.
- `package.json:14-41`: unused `@base-ui/react`, `@fontsource-variable/geist`, and `react-router-dom`; `shadcn` is an application dependency although it is a development CLI.

### Untouched

- No fix from this plan is implemented yet.
- No canonical shared-db branch, migration, view, RPC, index, or policy has been created for this work.
- No production database or deployed application change has been made.

## 6. Key findings and root causes

### 6.1 Pipeline correctness and performance

Root cause: `fetchBoardRows` applies `limit()` before business filtering and count calculation. Since the dataset is documented as 17,859+ products and the initial order is `updated_at DESC`, results mean “matches among the newest N records,” not “the first N matches.” `countPipelineProducts` repeats enrichment and filtering over a larger but still incomplete N.

Additional defects:

- `fetchPipelineProducts` and `countPipelineProducts` run concurrently, duplicating product reads and up to roughly 150 enrichment requests per load.
- `fetchListFacets` uses another 10,000-row capped full scan.
- Search, list/folder, department, licensor, open/custom status, and top-level filters belong before limiting.
- The current implementation contradicts `AGENTS.md` and `docs/architecture.md`, which describe server-side filters.

### 6.2 Saved-view preferences

Root cause: persistence encodes the target view in `pim.view_pref.scope` as `view:<uuid>`, but `fetchViewPrefs` maps `scope` unchanged into `PmViewPref.view`; Sidebar indexes the map by that value and later calls `prefs.get(v.id)`.

The absence of a database uniqueness constraint on `(profile_id, scope)` also means the current read-then-insert write can race and create duplicates unless the canonical schema has changed since the documentation was written. The implementing session must verify the live/canonical schema before choosing an atomic upsert design.

### 6.3 Partial stage changes

Root cause: two related writes occur in separate browser requests. A failure in the second write is surfaced as failure of the entire operation even though the first write committed. Browser code cannot provide a transaction across these calls.

### 6.4 Metadata lost updates

Root cause: the frontend reads the entire JSON metadata object, merges a local patch, and replaces the whole object. There is no row version/updated-at precondition and no atomic JSONB merge in the database.

### 6.5 Misleading reporting and secondary screens

Root cause: screens were added using convenient full-table reads and JavaScript aggregation. Fixed caps are treated as complete datasets, optional totals are not separated from list data, and department ownership is not consistently propagated through related objects.

Examples:

- Reports filter only products/projects by department; other totals stay global.
- Control Room and Reports select `*`, including large product metadata.
- Schedule uses an unordered capped subset and then derives dated items.
- Notes searches only after independently capping comments and activities at 250.
- People counts all assignment/notification/revision rows in the browser.
- Project and account counts fetch every foreign key into the browser.
- My Work builds `.in('id', ids)` without batching; large assignment sets can exceed URL/query limits.

### 6.6 Auth/profile masking

Root cause: `fetchMe` conflates three distinct states:

1. no valid Supabase session,
2. valid session without a mapped application profile,
3. backend/RLS/network failure while resolving the profile.

States 2 and 3 are converted to a fallback user using `session.user.id`. PM ownership records use application profile IDs, so the shell can load with internally inconsistent identity.

### 6.7 Engineering-health debt

- `any` casts bypass generated Supabase types in the most important API code.
- React hook warnings show unstable callbacks/stale dependency risks and avoidable cascading renders.
- Silent catches conceal mutation and supporting-data failures.
- Only one mapper is tested.
- `TaskDetailModal.tsx` has too many responsibilities to safely change.
- Static importing most screens produces one large entry chunk.
- Unused dependencies increase install/audit surface.

## 7. Approaches considered and rejected

1. **Raise product limits above 5,000/10,000. — Rejected.**
   It remains incomplete, increases transfer/enrichment cost, and fails again as data grows.

2. **Load all 17,000+ products and filter in React. — Rejected.**
   It violates the shared query contract, transfers large data to every browser, and worsens latency/RLS pressure.

3. **Reuse or copy DAM's `get_ai_tag_candidates` RPC and indexes. — Rejected.**
   It is private DAM worker infrastructure with service-role-only permissions and unrelated predicates.

4. **Use offset pagination or exact counts on every request. — Rejected.**
   Deep offsets and exact counts are known timeout risks. Use deterministic keyset pagination; make totals optional and independently fallible.

5. **Keep client-side count aggregation but add loading spinners. — Rejected.**
   A better loading state does not make incomplete numbers correct.

6. **Fix saved views only in Sidebar by stripping the prefix at lookup time. — Rejected as the complete solution.**
   Normalizing at the data boundary is safer, but write concurrency and swallowed errors must also be addressed.

7. **Ignore preference-write errors as “best effort.” — Rejected.**
   These are user-owned settings. The UI must revert and alert when persistence fails.

8. **Insert stage history first. — Rejected.**
   That reverses the partial-failure problem: history could claim a change that did not occur. Both writes must share one transaction.

9. **Retry stage-history insertion in the browser. — Rejected as the consistency mechanism.**
   Retries can duplicate history and still cannot make two requests atomic.

10. **Continue metadata read–merge–write with a faster refresh. — Rejected.**
    It narrows but does not remove the race.

11. **Silently retain the auth fallback for resilience. — Rejected.**
    It creates a misleading logged-in state with the wrong ownership identifier.

12. **Run `npm audit fix --force`. — Rejected.**
    The initial audit warned that it could downgrade/change `shadcn` incompatibly. Dependencies must be reviewed and changed intentionally.

13. **Suppress lint warnings or raise the bundle-warning threshold. — Rejected.**
    That hides the evidence without improving correctness, typing, or performance.

14. **Refactor all UI files before correctness work. — Rejected.**
    Large structural churn before behavior is protected by tests increases regression risk. Add characterization tests and land correctness contracts first.

15. **Edit the mirrored `shared-db/` directory in this repo. — Rejected absolutely.**
    It is overwritten automatically. All DB work belongs in `/worksp/shared-db`.

## 8. Design decisions

### Locked decisions

These are locked as of 2026-07-26 unless new evidence proves they conflict with the ultimate goal:

- Pipeline list/search/filter work uses a purpose-built authorized PM `api.*` contract with deterministic keyset pagination and narrow columns.
- Cursor format is opaque and versioned; browser code must not construct SQL offsets.
- List data and optional totals are separate. Count failure must not blank the list.
- Department remains mandatory and hard-separated.
- Product ordering uses a deterministic unique tie-breaker. For recency use `(clickup_updated_at DESC NULLS LAST, updated_at DESC, id DESC)` or the smallest equivalent proven by actual columns/plans. Manual ClickUp order remains list-specific and is not a global cursor.
- Stage update and history insertion are one transactional database operation.
- Metadata updates use an atomic database-side patch and, where business safety requires it, an optimistic concurrency token.
- All new DB contracts are additive, RLS-aware, browser-authorized only to the minimum authenticated PM roles, and created through canonical shared-db.
- Mutation failures show a toast/banner and revert optimistic state.
- Generated database types are regenerated after the shared contract lands.
- Correctness tests precede large component decomposition.
- The production app never receives a service-role key.

### Open implementation judgments

The implementer may decide these after gathering the named evidence:

- Whether pipeline count can use a cheap estimated/bounded count or needs a dedicated exact count for filtered subsets. Criteria: representative `EXPLAIN (ANALYZE, BUFFERS)` under the production statement timeout and product-owner usefulness.
- Whether pipeline facets are returned by a separate RPC or a second result shape from the list RPC. Criteria: narrow permissions, independent failure, cacheability, and query-plan quality.
- Whether metadata patching needs a version precondition for every field or only for conflict-sensitive fields. Criteria: actual concurrent workflows and whether JSONB atomic merge alone prevents unrelated-field loss.
- Whether saved-view uniqueness can be added immediately. Criteria: first audit for duplicate `(profile_id, scope)` rows and define deterministic reconciliation before creating a unique constraint.
- Which secondary screens require server contracts versus bounded paged direct queries. Criteria: data volume, RLS, join complexity, accuracy requirements, and measured plans.
- Exact `TaskDetailModal` component boundaries. Criteria: one domain responsibility per extracted component, no behavior change, and tests around mutations/loading/error states.

For every open decision, add a durable line in the relevant `docs/app-migration-notes/*` record using the format `Decision: <choice>. Evidence: <measured result/user requirement>. Date: <YYYY-MM-DD>.` Where the decision affects only frontend behavior, also add a concise code comment beside the contract boundary and point it to that note. Do not scatter architecture rationale across arbitrary component files.

## 9. Numbered implementation plan

### Phase 0 — Baseline, ownership, and evidence

#### Step 1. Establish clean baselines and preserve unrelated work

Targets:

- `/worksp/poppim-web`
- `/worksp/shared-db`
- GitHub PRs/runs for both repos

Actions:

1. Read `AGENTS.md`, this plan, `HANDOFF.md`, `docs/architecture.md`, `docs/development.md`, and canonical `/worksp/shared-db/AGENTS.md`.
2. Run `git status --short --branch` in both repos.
3. In `/worksp/shared-db`, inspect open PRs, remote branches, recent migrations, and duplicate timestamps. If any schema change is in flight, serialize with it rather than mixing work.
4. Record the current app SHA, shared-db SHA, Node/npm versions, clean-install test/lint/build output, bundle sizes, and `npm audit --json`.
5. Decide the untracked `.ai/reviews/` artifact explicitly: commit it only if it is valuable evidence; otherwise remove only that generated artifact. Never delete unrelated files.
6. Synchronize safely with `git fetch origin main && git pull --ff-only origin main`. Never use `git reset --hard`; this workspace can contain concurrent-session work.

Dependencies: none.

Verification gate: both repo states and in-flight database work are recorded; no unrelated file is staged or overwritten; baseline commands are reproducible.

#### Step 2. Add characterization tests before changing behavior

Targets:

- New `src/features/pipeline/api.test.ts`
- New `src/features/views/api.test.ts`
- New `src/features/board/api.test.ts`
- New `src/features/board/collab.test.ts`
- New `src/auth/auth.test.tsx`
- New `src/features/reports/api.test.ts`
- Shared reusable Supabase test doubles under `src/test/` if needed
- `vite.config.ts` or a dedicated Vitest config only if React tests require `jsdom`

Actions:

1. Capture current mapping rules: department aliases, top-level/open status filtering, order tie-breakers, saved preference scope encoding, and product-field alias mapping.
2. Add failure-path tests that demonstrate the intended corrected behavior and initially fail for the known bugs.
3. Do not mock away the ordering/cursor/scope values being tested.

Dependencies: Step 1.

Verification gate: the new tests fail for the intended reasons before the fix, while the existing three mapper tests remain green.

**Natural fresh-session cut point:** after the baseline and failing characterization tests are committed or durably documented. Before Phase 1, re-read Phases 1–3 for drift.

### Phase 1 — Canonical shared-db contracts

#### Step 3. Design and prove the PM pipeline list contract

Targets in canonical `/worksp/shared-db`:

- A dedicated branch such as `codex/poppim-audit-remediation`
- New timestamped migration(s) under `supabase/migrations/`
- Contract tests/evidence under the repository's established test/verification locations
- Documentation under `docs/app-migration-notes/`

Required contract behavior:

- Inputs: mandatory business unit; optional normalized search, licensor IDs, list names, lifecycle states; bounded page size; optional opaque cursor fields.
- Enforce top-level products and open/custom ClickUp status before the limit.
- Select only card/list-required columns.
- Deterministic ordering with `id` as the final tie-breaker.
- Return enough cursor data for the next page, without exposing service-role-only data.
- Preserve RLS and authorize only authenticated PM callers who can already read the underlying products.
- Reject invalid/half cursors and clamp page size.
- Do not return an exact total in the hot list query.

Evidence:

1. Inspect actual cardinalities and null distributions for filter/order columns.
2. Run representative `EXPLAIN (ANALYZE, BUFFERS)` for first page, deep cursor, each department, a selective search, licensor/list filters, and worst common combinations.
3. Add only query-shaped indexes proven necessary. Do not copy DAM indexes.
4. Exercise under the production statement timeout using representative preview fixtures. Roll fixtures back.

Dependencies: Steps 1–2.

Verification gate: preview contract returns complete expected matches beyond the old 5,000-row boundary; first/deep pages contain no duplicates or gaps; invalid cursors are rejected; plans use the intended indexes/no large sort; RLS tests pass.

#### Step 4. Add independent count and facet contracts

Targets: same shared-db branch/migration series and evidence set.

Actions:

1. Implement a separately callable count contract only if measured performance is acceptable. If exact count cannot meet the timeout, implement an explicitly labeled bounded/estimated result and change UI wording accordingly.
2. Implement list/folder facets scoped by mandatory department and the same eligibility rules as the pipeline.
3. Treat facets/count as optional supporting data: failure must not block the first list page.
4. Define whether facets respect search/licensor filters or only department; document and test the chosen business semantics.

Dependencies: Step 3.

Verification gate: facet counts reconcile with authoritative fixture queries; count semantics are explicit; forced count/facet failure does not affect list contract; representative plans meet the agreed budget.

#### Step 5. Add atomic stage and metadata mutation contracts

Targets: canonical shared-db migration/tests/docs.

Actions:

1. Create an RPC that validates the target stage, reads the prior stage, updates the product, and inserts `pim.stage_history` in one transaction. It must be idempotent for a no-op stage change and return the updated narrow product shape.
2. Ensure stage identity is unambiguous. If stage names are not globally unique, require a stable stage ID/department-aware mapping rather than `limit(1)` by name.
3. Create an atomic metadata patch RPC using JSONB merge semantics. Reject forbidden/direct-column keys.
4. Decide and implement an optional expected `updated_at`/version precondition for conflict-sensitive changes. Return a distinct conflict error the UI can explain.
5. Preserve RLS/grants and audit actor information.

Dependencies: Step 1; may proceed in parallel with Steps 3–4 if it uses a separate non-conflicting migration sequence and the shared-db one-change rule is still respected.

Verification gate: transaction rollback tests prove neither stage nor history changes when either operation is forced to fail; concurrent metadata tests prove unrelated keys survive and version conflicts are explicit.

#### Step 6. Make saved-view preference persistence unique and atomic if evidence requires it

Targets: canonical shared-db migration/tests only if the schema lacks uniqueness or duplicates exist.

Actions:

1. Query for duplicate `(profile_id, scope)` rows in preview/production read-only evidence.
2. If duplicates exist, define deterministic reconciliation (newest `updated_at`, with a documented merge rule for config keys) before deleting/merging anything.
3. Add a unique constraint/index and use database-native upsert only after reconciliation is proven.
4. If canonical schema already guarantees uniqueness, document that and skip the migration.

Dependencies: Step 1.

Verification gate: concurrent preference writes result in exactly one row per `(profile_id, scope)` and preserve the combined intended config.

#### Step 7. Land shared-db safely

Actions:

1. Run SQL checks and duplicate-timestamp checks.
2. Dry-run and apply only these migrations to preview.
3. Test the app contracts against preview.
4. Open and merge the shared-db PR after every `/worksp/shared-db/AGENTS.md` gate passes.
5. Promote only these migrations to production in an approved window; never use `--include-all`.
6. Verify actual functions/views/indexes/constraints/grants, not only the migration ledger.
7. Wait for the shared-db sync bot to create a consumer-repo commit on `origin/main`. In `/worksp/poppim-web`, first confirm a clean/non-conflicting worktree, then run `git fetch origin main && git pull --ff-only origin main`. Do **not** merge the shared-db repository commit into Poppim; the repositories have unrelated histories and the sync bot is the supported bridge.
8. Regenerate `src/lib/database.types.ts` using the repository's documented Supabase type-generation command. If no checked-in command exists, add one deliberately to `package.json`/`docs/development.md` before relying on it; do not invent a nonexistent `npm run generate:types`.

Dependencies: Steps 3–6.

Verification gate: merged shared-db PR URL and SHA recorded; preview and approved production objects verified; the bot-authored Poppim mirror commit is present on local and remote `main`; generated types match the promoted schema; both repos have clean/non-conflicting states.

**Natural fresh-session cut point:** after shared-db is merged/applied and app types are regenerated. Start the app phase in a clean session and re-read Phases 2–4.

### Phase 2 — Adopt correctness contracts in Poppim

#### Step 8. Replace pipeline capped reads with paged server queries

Targets:

- `src/features/pipeline/api.ts`
- `src/features/pipeline/PipelinePage.tsx`
- `src/domain/products/enrich.ts` (remove or narrow pipeline use)
- `src/domain/products/adapters.ts`
- New cursor/page types in owned domain/lib files

Actions:

1. Replace `fetchBoardRows` with a typed `fetchPipelinePage` calling the new contract.
2. Keep the cursor opaque/versioned at the app boundary.
3. Load the first page independently from optional count/facets.
4. Add explicit “load more”/infinite-scroll behavior appropriate to both Kanban and table views. Never imply all matches are loaded when only pages are present.
5. Merge pages by product ID and discard stale requests when filters change.
6. Make filter changes reset cursor/pages and retain the existing 300 ms search debounce.
7. Preserve task-stage ordering, list-specific manual order limitations, department separation, and deep-link behavior. If a deep-linked item is outside loaded pages, add an authorized fetch-by-ID path rather than scanning pages.
8. Delete the duplicate full read in `countPipelineProducts`; call the optional count contract separately.

Dependencies: Step 7.

Verification gate: tests cover matches beyond old cap, page boundaries, stale requests, count failure, deep links, and filter resets; authenticated browser shows visible cards and no console/network errors for all three departments.

#### Step 9. Correct saved-view preference normalization and error handling

Targets:

- `src/features/views/api.ts`
- `src/components/Sidebar.tsx`
- `src/features/settings/api.ts` if shared/personal visibility creation is wrong
- `src/lib/types.ts`

Actions:

1. Normalize `scope='view:<uuid>'` into a bare validated view ID at the API boundary.
2. Use the atomic upsert/unique contract from Step 6 when applicable.
3. On reorder/recolor/hide/delete failure, restore the previous state and show a Sonner toast with a retry-safe message.
4. Do not allow non-owners to hard-delete shared/seeded views.
5. Verify `createView.visibility` is actually persisted: current `createView` passes visibility inside `columns`, while `saveCurrentView` hard-codes `scope: 'personal'`. Correct this so a requested shared view becomes `scope='shared'` only when the user has permission.
6. Ensure stale/invalid preference scopes are ignored and reported diagnostically rather than breaking the tree.

Dependencies: Step 6 or documented decision that no DB change is needed.

Verification gate: unit/integration tests prove hide/color/order survive reload, shared view creation has the requested authorized scope, non-owner delete hides only for that user, and forced write failures revert with a visible toast.

#### Step 10. Adopt atomic product mutations

Targets:

- `src/features/board/api.ts`
- `src/features/board/collab.ts`
- `src/features/pipeline/PipelinePage.tsx`
- `src/components/TaskDetailModal.tsx`

Actions:

1. Route stage changes through the transactional RPC.
2. Route metadata-backed field patches through the atomic patch RPC.
3. Keep direct typed columns as narrow direct updates only if they do not require coupled audit behavior.
4. Map conflict errors to a visible “this product changed; reload/retry” state instead of silently reverting.
5. After mutation success, merge the authoritative returned row into local state; after failure, restore previous state and toast.
6. Prevent bulk `Promise.all` from leaving an unreported partially updated selection. Use a bounded bulk RPC or return per-item results and show exactly which items failed.

Dependencies: Step 7.

Verification gate: forced mutation failures leave DB/UI consistent; concurrent metadata tests pass; bulk update partial failures are explicitly surfaced; stage history contains exactly one correct transition per successful change.

#### Step 11. Correct authentication/profile resolution

Targets:

- `src/auth/auth.tsx`
- `src/pages/LoginPage.tsx` or a new explicit profile-error screen
- `src/App.tsx`
- Tests

Actions:

1. Model session loading, authenticated profile success, no mapped profile, transient profile failure, and signed out as distinct states.
2. Never use the auth UUID as an application profile UUID.
3. Show a clear retry/logout error screen for profile resolution failure.
4. Decide with backend evidence whether “valid session but no profile” should be denied or provisioned by an existing canonical process. Do not invent client-side profiles.
5. Memoize callbacks or restructure the auth subscription so hook dependencies are complete and refresh cannot update state after unmount.

Dependencies: none beyond baseline tests; may proceed in parallel with Steps 8–10.

Verification gate: tests cover all five states, refresh/token events, unmount, and retry; a forced RPC failure never enters the application shell.

### Phase 3 — Complete and accurate secondary screens

#### Step 12. Classify every screen's accuracy contract

Targets:

- `src/features/reports/api.ts`
- `src/features/control-room/api.ts`
- `src/features/schedule/api.ts`
- `src/features/notes/api.ts`
- `src/features/people/api.ts`
- `src/features/accounts/api.ts`
- `src/features/projects/api.ts`
- `src/features/mywork/api.ts`
- `src/features/workflow/api.ts`
- `src/features/designs/api.ts`
- `src/features/orders/api.ts`

For each screen, document one of:

- **Exact aggregate:** must represent the complete selected department and belongs in a measured server aggregate contract.
- **Paged list:** bounded deterministic pages with explicit continuation.
- **Recent activity:** intentionally limited by time/window, clearly labeled in UI.
- **Optional supporting count:** failure cannot blank primary data.

Do not implement until this classification exists in code comments/tests or a short architecture note.

Dependencies: Phase 1 evidence patterns.

Verification gate: every listed API has an explicit accuracy class, stable order/tie-breaker, selected columns, and truncation/count semantics.

#### Step 13. Fix Reports and Control Room first

Targets:

- `src/features/reports/api.ts`, `ReportsPage.tsx`
- `src/features/control-room/api.ts`, `ControlRoomPage.tsx`
- New shared-db PM report/control contracts if necessary

Actions:

1. Scope every total and operational metric through the selected department, including related designs, orders, revisions, submissions, samples, activities, notifications, templates, and handoffs.
2. Define whether records without an attributable department are excluded or shown in an explicit “Unassigned/Unknown” bucket; never silently mix them.
3. Replace client-side full-table aggregation and `select('*')` with narrow measured server results.
4. Preserve separate optional totals and surface data “as of” time.

Dependencies: Steps 7 and 12.

Verification gate: controlled fixtures containing all three departments produce department-isolated totals; switching departments changes all relevant metrics; no broad product metadata read appears in network logs.

#### Step 14. Fix Schedule, Notes, People, Accounts, Projects, My Work, and workflow lists

Actions by screen:

- **Schedule:** query a bounded date window with explicit start/end, department, stable `(date,id)` ordering, and page/window controls. Do not use unordered first-N products.
- **Notes:** use server-side search before limiting, define a recent default window, merge comments/activity with a stable `(created_at,id,kind)` cursor, and label the recent window.
- **People:** move workload counts to grouped server-side aggregates or authorized views; do not download all assignment/notification/revision rows.
- **Accounts/Projects:** use grouped counts or purpose-built views; page account/project lists; select only displayed fields.
- **My Work:** batch or replace large `.in(...)` calls and scope reminders to `app='pm'`; avoid URL-length failures.
- **Workflow/design/order lists:** replace broad `select('*')` with typed selected columns, deterministic tie-breakers, server-side search, and continuation where the dataset can exceed the default limit.

Targets: the corresponding API/Page files named in Step 12 plus shared-db contracts when measurement proves necessary.

Dependencies: Steps 7 and 12.

Verification gate: fixtures beyond every former cap remain discoverable; searches operate before limit; each page/window is visibly bounded; network inspection shows narrow projections and bounded calls.

**Natural fresh-session cut point:** after all correctness/data-contract phases are green. Re-read Phase 4 before cleanup/refactoring.

### Phase 4 — Reliability, maintainability, dependencies, and bundle

#### Step 15. Eliminate silent failures in audited flows

Targets:

- `src/components/TaskDetailModal.tsx`
- `src/components/Sidebar.tsx`
- `src/components/Topbar.tsx`
- Feature Pages with `.catch(console.error)` or empty catch blocks
- A small shared error/toast helper if it reduces duplication

Actions:

1. Classify supporting data as required or optional.
2. Required-data failure shows an inline error/retry and does not render false empty state.
3. Optional-data failure shows a non-blocking warning and preserves primary content.
4. Mutation failure always alerts and reverts.
5. Log structured operation/context without secrets; avoid raw user data in production console output.
6. Prefer a concrete shared wrapper such as `runUiMutation<T>({ operation, optimistic, execute, rollback, successMessage?, failureMessage })` under `src/lib/uiMutation.ts` when three or more flows need the same behavior. The wrapper must require rollback and a user-visible failure message; do not create a hook merely to conceal divergent mutation semantics.

Dependencies: correctness contracts/tests.

Verification gate: tests force every audited catch path; no empty catch remains in owned business code without a documented, tested reason.

#### Step 16. Decompose `TaskDetailModal` without behavior changes

Targets:

- `src/components/TaskDetailModal.tsx`
- New owned components/hooks under `src/features/product-detail/` or a similarly explicit domain directory

Suggested boundaries:

- Core product fields and typed optimistic mutation hook.
- Files/gallery/lightbox.
- Assignees/checklists/subtasks/tags/custom fields.
- Activity/links/time entries.
- Dependencies/decisions/reminders.
- Comments/updates.
- Reusable inline text/date/select editors.

Actions:

1. Add/retain tests around each behavior before extraction.
2. Move one domain at a time, keeping props/types narrow.
3. Cancel/ignore stale requests on product change and avoid state synchronization effects when a keyed child/resettable initializer is clearer.
4. Replace `window.prompt` flows with accessible dialogs only where directly touched by the extracted domain; do not redesign unrelated UI.
5. Do not hand-edit generated shadcn primitives.

Dependencies: Steps 10 and 15.

Verification gate: behavior tests stay green after each extraction; lint hook warnings in the modal are zero; authenticated screenshots show no visual regression in every modal tab and at mobile/desktop widths.

#### Step 17. Remove unsafe typing and lint warnings systematically

Targets: all owned `src/**/*.ts(x)` excluding generated `src/components/ui/*` and `src/lib/database.types.ts`.

Actions:

1. Replace schema helper `as any` usage with types derived from regenerated `Database`, RPC return types, and narrow row interfaces.
2. Fix hook dependencies with stable callbacks/restructured effects, not eslint suppression.
3. Remove set-state-in-effect warnings through state derivation, keyed components, or asynchronous subscription patterns.
4. Make CI fail on warnings after the owned-code warning count reaches zero; exclude generated code deliberately rather than weakening rules globally.

Dependencies: regenerated types and component extraction.

Verification gate: `npm run lint -- --max-warnings=0` passes for the configured project and no new suppression comments were added without written justification.

#### Step 18. Repair dependency and bundle health

Targets:

- `package.json`
- `package-lock.json`
- `src/App.tsx` / `src/components/AppShell.tsx` for lazy screen loading
- Vite config only if measured chunking requires it

Actions:

1. Remove confirmed unused direct dependencies: `react-router-dom`, `@base-ui/react`, and `@fontsource-variable/geist`. Verify with `rg` and build.
2. Move `shadcn` to `devDependencies` if the checked-in build/runtime does not import it.
3. Upgrade Vitest and other direct dependencies to patched compatible versions based on official changelogs; do not use `npm audit fix --force`.
4. Run `npm dedupe` only after reviewing the lockfile diff.
5. Lazy-load top-level screens currently selected by `AppShell`: `ControlRoomPage`, `PipelinePage`, `ProjectsPage`, `DesignLibraryPage`, `DesignCollectionsPage`, `OrdersPage`, `AccountsPage`, `ReportsPage`, `SubmissionsPage`, `SamplesPage`, `RevisionsPage`, `SchedulePage`, `NotesPage`, `PeoplePage`, `MyWorkPage`, and `SettingsPage`. Lazy-load extracted product-detail domains only when that does not harm modal interaction. Use named wrappers/fallbacks; do not add magic marker comments.
6. Measure before/after entry and async chunks. The entry chunk must fall below Vite's 500 kB default warning and by at least 25% from the audited 827.62 kB baseline, unless measured evidence shows a stricter useful target. Do not simply raise the warning threshold.
7. Confirm the production nginx/static image contains only build output, not dev servers/tools.

Dependencies: correctness phases; can partly proceed earlier if lockfile changes remain isolated.

Verification gate: clean `npm ci`; zero known high/critical advisories in shipped/runtime dependencies and documented disposition for any dev-only residual advisory; entry chunk materially smaller and top-level screens load on demand; build/test/lint pass.

### Phase 5 — End-to-end verification and landing

#### Step 19. Run full automated and database verification

**2026-07-27 status: COMPLETE for the currently authorized local/preview
scope.** Clean install, 38 tests, zero-warning lint, build/bundle, full/runtime
audits, diff/pattern review, SQL checks, duplicate timestamps, bounded preview
dry-run, rollback contract verification, object/grant/ledger checks, and
representative EXPLAIN probes all passed. Exact metrics and the dev-only audit
disposition are recorded in `HANDOFF.md`.

Commands/checks:

- `npm ci`
- `npm test`
- `npm run lint -- --max-warnings=0`
- `npm run build`
- `npm audit --json`
- Shared-db SQL checks and contract tests
- Preview `EXPLAIN (ANALYZE, BUFFERS)` evidence
- Preview RLS/grant tests
- Migration duplicate timestamp check
- `git diff --check`
- `rg -n "catch\\(console\\.error\\)|catch\\(\\(\\) => \\{\\}\\)|select\\(['\"]\\*['\"]\\)" src -g '*.ts' -g '*.tsx'` followed by an explicit review of every remaining match. The gate is not “zero matches at any cost”; each remaining broad select or intentionally swallowed optional failure must have a narrow, tested justification.

Verification gate: every required command passes; advisory exceptions, if any, are documented with exploitability and owner/date rather than ignored.

#### Step 20. Perform authenticated visual and functional verification

**2026-07-27 status: COMPLETE FOR PREVIEW.** A dedicated Poppim preview account
was provisioned through the canonical Auth path and stored in 1Password. The
final matrix covered 16 screens and 26 API checks with zero console errors and
zero failed responses; desktop/mobile evidence is in `.ai/evidence/`.
Authenticated production repetition remains a Step 21 release gate.

Use an approved Poppim test login from the `vibe_coding` 1Password vault. If no Poppim-specific non-SSO test account exists, request/create access through the approved auth process rather than borrowing another app's credentials or exposing secrets.

Verify:

1. Licensed, Generic, and Software pipeline first page, loading continuation, search, licensor/list filters, count failure, facet failure, and deep link.
2. Saved-view reorder/color/hide/shared/personal behavior across reload and a second user where applicable.
3. Stage drag and bulk update success/failure.
4. Concurrent metadata edit conflict.
5. Profile error/retry/logout.
6. Reports and Control Room department isolation.
7. Schedule/Notes/People/Accounts/Projects/My Work pagination/window labels.
8. Every product-detail tab after decomposition.
9. Desktop and narrow/mobile layouts; keyboard focus and dialogs.
10. Browser console and network errors.

Capture screenshots and store only non-sensitive evidence in the repo's established docs/evidence location.

Verification gate: each numbered workflow has a pass record and screenshot where visual; no unexplained console/network error remains.

#### Step 21. Commit, push, CI, deploy, and verify

**2026-07-27 status: COMPLETE.**
Database-first prerequisites, production types, local/Grok gates, app release,
all GitHub workflows, Coolify deploy, exact live SHA, and authenticated
production smoke pass. The saved-view smoke found a real CRUD grant gap;
shared-db PR #273 is merged; migration `20260727213000` is applied through an
exact bounded production runner and verified with the dedicated production JWT.

Actions:

1. Keep shared-db and app commits separate and focused.
2. Commit app changes to `main` with `Albert Hazan <u2giants@users.noreply.github.com>`.
3. Push `main`, watch all GitHub Actions checks, GHCR publication, and Coolify deployment.
4. Verify `https://pm.designflow.app/` contains `<meta name="build-sha" content="<exact-app-commit>">`.
5. Re-run critical authenticated smoke checks against production.
6. Update `AGENTS.md`, `docs/architecture.md`, data-contract migration notes, `HANDOFF.md`, and this plan's status. Delete this plan only when every item is complete; otherwise retain it and mark exact remaining steps.
7. Leave both `/worksp/poppim-web` and `/worksp/shared-db` free of mystery untracked files or unfinished migrations.

Dependencies: Steps 19–20.

Verification gate: commit SHAs, shared-db PR URL, green CI URLs, live build SHA, screenshots, and clean git states are recorded in `HANDOFF.md`.

## 10. Tests required

### Pipeline

- `fetchPipelinePage sends mandatory department and optional filters before pagination`.
- `pipeline cursor produces no duplicates or gaps when multiple products share timestamps`.
- `filter change discards old pages and stale responses`.
- `count failure preserves list results`.
- `facet failure preserves list results`.
- `deep-linked product loads by ID when outside the first page`.
- `top-level open/custom eligibility matches legacy department aliases`.
- Preview contract tests with more than 10,000 eligible fixture rows and a known match beyond the former cap.

### Saved views

- `fetchViewPrefs normalizes view scope to bare UUID`.
- `preference hide color and order survive refetch`.
- `concurrent upsert leaves one preference row`.
- `failed preference mutation restores previous UI state and emits toast`.
- `non-owner shared-view removal writes hidden preference but does not delete view`.
- `createView persists authorized shared scope rather than personal`.

### Mutations

- `stage RPC rolls back product update when history insert fails`.
- `stage RPC does not add history for no-op transition`.
- `stage RPC rejects ambiguous/invalid target`.
- `metadata patch preserves unrelated concurrent keys`.
- `metadata version conflict returns typed conflict and UI message`.
- `bulk update reports per-item failures without claiming complete success`.

### Authentication

- `no session is signed out`.
- `session plus profile enters app with profile UUID`.
- `session without mapped profile shows access error`.
- `profile network/RLS failure shows retry state`.
- `token refresh does not update unmounted provider`.

### Reports and lists

- Department fixture tests for every Reports/Control Room metric.
- Unknown-department behavior test.
- Former-cap discoverability tests for Schedule, Notes, Accounts, Projects, My Work, workflow/design/order lists.
- Stable cursor tie test for each paged contract.
- Search-before-limit test for Notes and other searchable screens.
- Required versus optional query failure UI tests.

### UI/maintainability

- Product-detail domain behavior tests before and after extraction.
- Dialog keyboard/focus tests replacing prompt flows.
- Lazy screen loading smoke tests.
- Bundle-size regression assertion using a documented threshold based on the post-fix baseline, not the old oversized baseline.

### Required existing gates

- Existing `pmCustomerList.test.ts` remains green.
- `npm test`, zero-warning lint, TypeScript build, Vite build, SQL checks, migration dry-runs, preview contract/RLS tests, and authenticated browser smoke tests all pass.

## 11. Constraints, standing rules, and gotchas

- Do not edit anything under this repo's `shared-db/` mirror.
- Shared schema/RPC/view/index/RLS work starts in canonical `/worksp/shared-db`, branch + PR + preview first.
- Never run broad production-mutating Terraform/gcloud commands or direct dashboard DDL.
- Never use `supabase db push --include-all` when other migrations are pending.
- Never reuse or edit an applied migration timestamp.
- Verify actual database objects, not only migration ledger entries.
- Do not expose service-role credentials to the browser.
- Departments remain hard-separated; do not add “All.”
- Do not restore `product.code` to UI labels.
- Do not change numeric ClickUp orderindex handling or claim global exact order.
- Preserve `PimTaskCard`'s `shrink-0`.
- Preserve original `cover_url`; do not replace originals with thumbnails.
- Do not reintroduce `select('*')` on high-volume product reads.
- Count failure must never blank primary list data.
- No silent failures or optimistic state that remains false after a failed write.
- Avoid one huge replacement PR. Land database contract, app adoption, screen accuracy, and cleanup as verifiable phases.
- UI changes require authenticated browser screenshots.
- Generated shadcn primitives are not hand-edited.
- `src/lib/database.types.ts` is regenerated, not manually curated.
- Secrets live only in 1Password vault `vibe_coding`; document item titles, never values.
- GPT-5.6 Codex subprocesses must explicitly use `low` or `medium` reasoning and their header must be checked.

## 12. Access and environment

- App checkout: `/worksp/poppim-web`, `main`.
- Canonical DB checkout: `/worksp/shared-db`, dedicated branch + PR.
- GitHub: authenticated `gh` should be verified with a real read before claiming access.
- Supabase CLI: verify with `supabase projects list`; credentials live in:
  - `vibe_coding` → `Supabase CLI Personal Access Token`
  - `vibe_coding` → `Supabase DB Password - shared POP database`
  - `vibe_coding` → `Supabase Preview Branch Credentials - shared POP database (shared-db-schema-rehearsal)`
- Frontend environment: `.env` contains build-time `VITE_SUPABASE_URL` and publishable anon key; never commit `.env`.
- Local commands:

  ```bash
  cd /worksp/poppim-web
  npm ci
  npm run dev
  npm test
  npm run lint
  npm run build
  ```

- Local dev URL: `http://localhost:5173`.
- Production app URL: `https://pm.designflow.app`.
- Production deploy verification: inspect the live HTML `build-sha`; do not rely on `version.json`.
- Grok critique access used for this plan: xAI API credential in `vibe_coding` item `grok xai x.ai`; never expose the key.
- A dedicated Poppim browser test login was not confirmed during planning. The implementing session must locate one in `vibe_coding` or arrange approved access before visual verification.

### Embedded reference data for a fresh session

- **Department aliases:** Licensed accepts `licensed`, `POP`, and `POP Creations`; Generic accepts `generic`, `Spruce`, and `Spruce Line`; Software accepts only `Software` (comparisons are normalized case-insensitively). Missing values are not permission to mix departments.
- **ClickUp order:** `clickup_orderindex` is a high-precision numeric string. Sort it numerically, never lexically. It is meaningful within a ClickUp list and is not an exact global order; the old 5,000-row cap also made claims of global parity invalid.
- **Pipeline eligibility:** top-level products only (`clickup_parent_id` null) and ClickUp status types `open` or `custom`. Filters must execute before page limits.
- **Preview project-ref discrepancy:** canonical `/worksp/shared-db/AGENTS.md` read during planning on 2026-07-26 names preview ref `rjyboqwcdzcocqgmsyel`, while older app/skill text names `xjcyeuvzkhtzsheknaiu`. Treat the canonical shared-db file plus a real `supabase projects list` as authoritative at implementation time; never apply merely because this plan contains a remembered ref.
- **Preview command shape after verification:** inject the preview password from `vibe_coding` into the environment, then run `supabase link --project-ref <verified-current-preview-ref> --password "$POPPIM_PREVIEW_DB_PASSWORD"` followed by `supabase db push --dry-run`. Review the complete proposed migration set before any apply.
- **Production project:** `qsllyeztdwjgirsysgai`. Production promotion is only after preview gates and any approval required by the then-current canonical shared-db instructions.
- **Test login:** no Poppim-specific test-login item was confirmed in the vault during planning. This is an explicit access prerequisite, not a placeholder to fill with another app's login.
- **Live verification:** `https://pm.designflow.app/` embeds `<meta name="build-sha">`; `version.json` is not authoritative.

## 13. Definition of done, risks, and open questions

### Definition of done

- [ ] All Phase 0 characterization tests exist.
- [ ] Shared-db PM list/count/facet/mutation contracts are measured, preview-tested, merged, and promoted in an approved window.
- [ ] Pipeline no longer filters after a capped broad read.
- [ ] Saved preferences persist and mutation failures visibly revert.
- [ ] Stage/history and metadata changes are atomic/conflict-safe.
- [ ] Auth profile failures cannot enter the shell.
- [ ] Reports and secondary screens have explicit, correct accuracy contracts.
- [ ] No audited broad/capped query silently claims completeness.
- [ ] Required and optional failures are visibly differentiated.
- [ ] `TaskDetailModal` is decomposed with behavior preserved.
- [ ] Owned-code lint passes with zero warnings.
- [ ] Tests cover all named behaviors and pass.
- [ ] Direct unused dependencies are removed; dependency advisories are fixed or explicitly dispositioned.
- [ ] Entry bundle is materially smaller through real code splitting.
- [ ] Authenticated screenshots and network/console evidence pass.
- [ ] App and shared-db docs/handoff are current.
- [ ] Critical external-reference facts and the evaluated Grok critique are embedded in this plan.
- [ ] App commit is pushed, CI is green, Coolify serves the exact live SHA, and both repos are clean.

### Risks and rollback

- **Query contract performance:** a new search/facet contract may still time out under real cardinality. Mitigation: representative preview fixtures and measured plans before adoption. Rollback: revert app caller to the previous deployed SHA while leaving additive unused contracts in place.
- **RLS/grants:** an RPC can accidentally broaden data access. Mitigation: explicit role tests and invoker/security-definer review. Rollback: revoke with a new migration and revert caller.
- **Pagination ordering drift:** nullable/nonunique ordering can skip/duplicate records. Mitigation: stable unique tuple and tie tests.
- **Department attribution:** related records may lack a direct department. Open question: exclude or show Unknown. Decision criterion: traceable product/project relationship and business usefulness; never mix silently.
- **Preference duplicates:** a unique constraint can fail if duplicates exist. Mitigation: read-only duplicate audit and deterministic reconciliation before constraint.
- **Metadata conflicts:** adding a version precondition can surface more user conflicts. This is preferable to silent data loss; UI must make retry/reload clear.
- **Component refactor regression:** decomposition can alter modal behavior. Mitigation: tests and screenshots before/after each extraction.
- **Dependency upgrades:** major tooling upgrades can change lint/build semantics. Mitigation: focused lockfile changes and clean-install gates; do not force-upgrade blindly.

### Genuine open questions

1. Does the business need exact live pipeline totals, or is a labeled bounded/estimated count sufficient? Decide from count-plan performance and user workflow.
2. Should facets respect active search/licensor filters or only department/eligibility? Confirm against current intended UX and lock in tests.
3. Which metadata fields require strict optimistic concurrency beyond atomic unrelated-key preservation? Decide from multi-user edit frequency and audit importance.
4. How should records with no attributable department appear in reports? Prefer explicit Unknown only if users can act on it.
5. Which Poppim test account should be used for production browser verification? Resolve through `vibe_coding`, never by embedding credentials.

## Grok critique and integration record

**Reviewer:** xAI `grok-4.20-0309-reasoning`, selected after querying the live xAI model list.
**Access path:** xAI Chat Completions API using the concealed API key in 1Password vault `vibe_coding`, item `grok xai x.ai`. The installed Grok CLI workflow was attempted first, but no `grok` executable or managed Windows installation was available in this environment. No key, `.env`, or secret content was included in the prompt or output.
**Critique date:** 2026-07-26.

Grok's overall verdict was that the plan covers every audited defect, follows the shared-Supabase and repository rules, uses sound sequencing, and is implementable after minor self-containment improvements. It called out the then-empty critique/self-audit sections, requested more embedded reference facts, recommended more explicit decision records and verification searches, and suggested tightening mutation-helper and bundle-splitting guidance. It also made two unsafe/incorrect Git suggestions that were rejected after comparison with repository rules.

Disposition:

1. **Accepted — embed critical reference facts.** Section 12 now embeds department aliases, eligibility, ClickUp order semantics, live-SHA verification, access status, and the conflicting historical preview refs with a mandatory live verification rule.
2. **Accepted — complete the critique and self-audit before handoff linking.** This record and the completed audit below replace the placeholders.
3. **Accepted — make open decisions durable and evidence-backed.** Section 8 now requires `Decision / Evidence / Date` records in the migration note and contract-boundary references.
4. **Accepted — make error-handling reuse concrete.** Step 15 now gives a proposed `runUiMutation` contract while preserving room for genuinely different mutation semantics.
5. **Accepted with adjustment — tighten bundle verification.** Step 18 now enumerates top-level lazy-loading targets and requires both a sub-500 kB entry and at least a 25% reduction. Grok's proposed fixed `<400 kB` threshold was rejected as arbitrary without a post-split dependency graph.
6. **Accepted with adjustment — add automated pattern checks.** Step 19 adds a reproducible `rg` audit, but does not demand zero textual matches when a narrow, tested broad select or optional failure is justified.
7. **Partially accepted — make sync commands explicit.** Steps 1 and 7 now specify safe fetch/pull commands and explain the sync bot boundary.
8. **Rejected — `git reset --hard origin/main`.** This would violate the workspace rule to preserve concurrent/user work. The plan uses `git pull --ff-only` after status checks.
9. **Rejected — merge the shared-db commit directly into Poppim.** The repos have unrelated histories. The supported flow is shared-db merge → bot-authored mirror commit on Poppim `origin/main` → safe fast-forward pull.
10. **Rejected — invent an exact type-generation script.** The current `package.json` has no `generate:types` script. Step 7 requires discovering/documenting the real command or adding a deliberate script.
11. **Accepted in intent, no reorder needed — auth must be stable before UI verification.** All authenticated visual checks are already Phase 5, after Step 11. The plan retains safe parallel implementation but makes the final dependency explicit.
12. **Rejected — invent a Poppim test-login item.** No dedicated item was found. Section 12 records this as a prerequisite rather than borrowing or fabricating credentials.

## Mandatory self-audit

1. **Could a brand-new AI session with no project knowledge and no context from the planning conversation execute this plan to perfection without asking anything?**
   **Yes.** Sections 1–4 define the business outcome, application, trigger, and boundary. Sections 5–8 preserve exact code evidence, root causes, rejected approaches, and locked/open decisions. Section 9 provides ordered file/function-level work with dependencies and verification gates. Section 12 embeds the non-obvious reference facts and exact access locations. Genuine business/performance choices have evidence criteria and a required durable decision format rather than being left as questions for Albert.

2. **Does the plan carry every piece of background, nuance, and reasoning currently held, including rejected approaches and why?**
   **Yes.** Sections 5–7 include the clean-install results, every audited finding, known working behaviors that must survive, and 15 explicitly rejected shortcuts/dead ends. The Grok record preserves both accepted critique and unsafe suggestions that must not be repeated.

3. **Is the ultimate goal clear enough for a correct judgment call if an individual step proves wrong?**
   **Yes.** Section 1 states the user-visible truth/consistency/performance outcome and explicitly says the goal wins over a conflicting step. Sections 8 and 13 give decision criteria, rollback rules, and genuine open questions so an implementer can adapt without silently redesigning the product.

### Objective checklist

- [x] All 13 required sections are present.
- [x] Ultimate goal is plain business English and includes the goal-wins instruction.
- [x] Fresh session can execute without the planning chat.
- [x] Rejected approaches and failures are recorded.
- [x] Every step names concrete targets and a verification gate.
- [x] Locked/open decisions are labeled.
- [x] Out-of-scope list is explicit.
- [x] Tests are named by behavior.
- [x] Unfamiliar terms, paths, URLs, identifiers, and SHAs are defined.
- [x] Secrets are referenced by vault/item only.
- [x] Definition of done includes commit, push, CI, deploy, and live SHA verification.
- [x] Grok critique is evaluated and integrated.
- [x] `HANDOFF.md` links to this final plan.

**Self-audit result: PASSED.** All objective items are yes, and the three mandatory questions are answered with supporting sections.

# Codebase audit remediation — Phase 0 baseline

Captured on 2026-07-26 EDT before application behavior changes.

## Repository ownership and synchronization

- Poppim checkout: `/worksp/poppim-web`, branch `main`.
- Poppim baseline after safe fast-forward: `e2aaefc640b4729e0aff6d805f613b4726819754`.
- Canonical shared-db checkout: `/worksp/shared-db`, branch `main`.
- Shared-db baseline after safe fast-forward: `f530c424b00ddd91eef4c0f8d172eeb451551f82`.
- Both checkouts were clean before and after `git fetch origin main && git pull --ff-only origin main`.
- Poppim had no open pull requests. Its latest recorded guard runs were green.
- Shared-db open PR: `#238 docs: retire the completed tester-login handoff into a permanent doc`, branch `docs/retire-tester-login-handoff`. It is documentation-only.
- Shared-db has multiple remote work branches and ongoing ColdLion/ERP/taxonomy work documented in its canonical `AGENTS.md`; Phase 0 created no database branch, migration, schema change, preview apply, or production apply.
- Duplicate migration timestamp scan returned no matches.

## Generated review artifact decision

The plan referenced `.ai/reviews/20260726-221442-final-check.md` as an untracked diagnostic artifact. It was absent at baseline, so there was nothing to commit or remove. Phase 0 keeps the remediation plan and this concise reproducible evidence record; it does not recreate or depend on the missing review output.

## Toolchain and clean-install baseline

- Node: `v20.20.2`.
- npm: `11.16.0`.
- `npm ci`: passed; 547 packages installed and 548 audited.
- Install warning: `esbuild@0.28.1` has a postinstall not covered by npm `allowScripts`.

## Existing quality gates before characterization tests

- `npm test`: passed; 1 file and all 3 `pmCustomerList` mapper tests green.
- `npm run build`: passed.
- `npm run lint -- --max-warnings=0`: failed with 141 warnings and 0 errors. These are pre-existing warnings, led by `no-explicit-any`, React hook dependency warnings, and React set-state-in-effect warnings.
- `npm audit --json`: exited nonzero with 12 advisories: 1 low, 5 moderate, 5 high, and 1 critical. Directly named packages include `react-router-dom`, `shadcn`, and `vitest`; remediation belongs to a later phase.
- `git diff --check`: to be rerun after Phase 0 edits.

## Bundle baseline

`npm run build` produced:

- `dist/assets/index-B9NBUQxP.js`: 827.62 kB, 225.79 kB gzip.
- `dist/assets/index-C46U5Gpx.css`: 55.60 kB, 12.37 kB gzip.
- Vite warned that the entry chunk exceeds 500 kB.
- Vite also reported that the dynamic import of `src/domain/reference/api.ts` is ineffective because the module is statically imported elsewhere.

## Reproduction commands

```bash
cd /worksp/poppim-web
git status --short --branch
git rev-parse HEAD
npm ci
npm test
npm run lint -- --max-warnings=0
npm run build
npm audit --json

git -C /worksp/shared-db status --short --branch
git -C /worksp/shared-db rev-parse HEAD
gh pr list --repo u2giants/shared-db --state open --limit 50
find /worksp/shared-db/supabase/migrations -maxdepth 1 -type f -printf '%f\n' |
  sed 's/_.*//' | sort | uniq -d
```

## Phase 0 test policy

The existing mapper suite must remain green. New corrected-behavior tests intentionally remain red where they expose the known pipeline filtering, saved-view scope, non-atomic stage/metadata mutation, authentication fallback, and cross-department reporting defects. This evidence file records those failures after the tests are run; later phases must turn them green by correcting production behavior, not weakening the assertions.

## Characterization test result

After adding the Phase 0 tests:

- `npm test`: intentionally failed with 7 corrected-behavior failures and 5 passing tests across 7 files.
- Passing: all 3 existing `pmCustomerList` tests; legacy department alias plus top-level open/custom pipeline eligibility; direct product-field alias mapping.
- Intended failure — pipeline: department/search/licensor/list filters are not sent before `.limit(...)`.
- Intended failure — saved views: `fetchViewPrefs` returns `view:<uuid>` instead of a bare UUID.
- Intended failure — stage mutation: `setProductStage` does separate product and `stage_history` writes instead of one transactional RPC.
- Intended failure — metadata mutation: `updateProduct` reads metadata before a client-side merge/write.
- Intended failures — authentication (2): profile lookup failure and missing mapped profile both create a fallback user with the Supabase Auth UUID instead of producing an explicit access/retry state.
- Intended failure — reports: related design/order and operating rows from another department are counted in the Licensed report.
- No test failed because of test setup, module loading, or the reusable Supabase double.
- `npm run build` remained green after the tests were added. The generated entry size remained 827.62 kB / 225.79 kB gzip.

Focused existing-suite verification:

```bash
npx vitest run src/domain/reference/pmCustomerList.test.ts
```

Expected Phase 0 full-suite behavior until later fixes land:

```bash
npm test
# Exit 1: 7 intended corrected-behavior failures; 5 tests pass.
```

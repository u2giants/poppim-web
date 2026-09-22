---
issue: 9
status: OPEN
owner: claude/jev-phase0-deploy-transport
---

# Jev activity-triage — Phase 0 fail-closed done, Step 1 partial

Plan: [`../plan_jev_activity_triage.md`](../plan_jev_activity_triage.md)

Prior planning handoff (still present; write-once; do not edit): [`2026-09-20T1405Z-hetz-codex-jev-activity-triage.md`](2026-09-20T1405Z-hetz-codex-jev-activity-triage.md). This file records **post-planning execution** after Phase 0. Carry every open obligation below even if the predecessor also lists it.

Issue: [poppim-web#9](https://github.com/u2giants/poppim-web/issues/9)  
Shared structure: [u2giants/shared-db#3298](https://github.com/u2giants/shared-db/issues/3298) (`db-work` + `orchestrator` — structure only; external shared-db session)

## 0. ⚠️ DECISIONS ONLY THE OWNER CAN MAKE

Put this consolidated list to Albert in ONE message before the applicable phase. Do not ask one item at a time.

1. **Approve or reject sending deterministically minimized/redacted real product-comment text to TypeSafe** after reviewing the Master Customer Agreement, retention/deletion, training, subprocessors, DPA, and the perpetual Customer Data telemetry license (accept or reject that term). Also approve the staff pre-submit disclosure copy and version. Recommended copy: “Eligible internal comments may be minimized and sent to TypeSafe for optional AI triage. TypeSafe may derive and use telemetry under its customer agreement. No dependency, decision, or reminder is created without your review and confirmation.” **Blocks** real evaluation and any real send. Without it, synthetic only. TypeSafe must also give written account-scoped Input/subprocessor/backup deletion process + receipt; if not, synthetic only.
2. **Authorize creation/use of private secrets in vault `vibe_coding`:** `TypeSafe AI - Jev API`, `Poppim Jev deployer identity`, `Poppim Jev processor identity`, `Poppim Jev monitor identity`, `Poppim Jev emergency workflow trigger`, `Poppim Jev language runner identity`, `Poppim Jev evaluation runner identity`, `Poppim Jev analysis runner identity`, `Poppim Jev evaluation case key`, `Poppim Jev evaluation source HMAC`, `Poppim Jev evaluation sampling key`, `Poppim Jev analysis cluster key`, `Poppim Jev redaction dictionary`, `Poppim Jev dictionary commitment key`, `Poppim Jev production sampler`. Use `secrets-to-1password` before any secret item change. **Blocks** Steps 2–4 real paths and Step 5 gateway.
3. **Name an approved ordinary non-admin PM test profile** if docs do not already identify one. **Blocks** non-admin live proof.
4. **Authorize exact infrastructure/mutation:** (a) authorized Coolify control-plane **hostname** for `vars.COOLIFY_CONTROL_PLANE_URL` plus filling `COOLIFY_CONTROL_PLANE_HOST_PIN` in `deploy.yml` (empty pin keeps every deploy blocked — already live); (b) certificate-valid HTTPS or authenticated private tunnel + MITM/wrong-host proof in a transport-only follow-up; (c) isolated preview/production gateway/frontend services/domains (`pm-jev-preview`, `pm-jev-gateway-preview` — existing `pm-dev`/`pm-ci` are production aliases); (d) protected workflows may use the Supabase service-role key solely for named synthetic Auth Admin create/disable/delete then fixture create/delete after target proof; (e) protected alert channel + primary/backup humans (15-minute ack). **Blocks** any live deploy of Jev and all fixture/mutation work.
5. **Approve the exact role × action × business-unit matrix** for comment create, dependency/decision/reminder create/status, and Jev review. Until then preserve administrator-only writes. **Blocks** shared-db #3298 execution and non-admin launch acceptance.
6. **Name two English-fluent business labelers, one adjudicator, and one metadata-only coordinator** with language qualification, corpus window, audit owner, removal date. Coordinator never sees raw text or row-level labels. **Blocks** real labeling; synthetic only without this.
7. **Approve fixed non-transferable call/spend ceilings** (offline eval 2,000/2,000,000/US$10; preview+revalidation 500/500,000/US$5; prod validation 100/100,000/US$2; pilot 2,000/2,000,000/US$10 plus 50/50,000 per profile and 250/250,000 global per rolling 24h, concurrency 2). No borrowing across phases. **Blocks** any real provider use.
8. **After a completed pilot only:** approve or reject ongoing adoption under a new `adopted` phase. A passing pilot stays off until this decision. Deferred on purpose.

Already settled — do NOT re-ask: narrow comment triage only; no urgency v1; comment-first; human edit/confirm; no generated prose/due dates; no browser key; pinned evaluated model; shared schema only via #3298; disabled-by-default browser/gateway flags; Jev never auto-writes.

**Also needed (same list):** TypeSafe written deletion/receipt commitment (item 1). Infrastructure hostname pin is the first concrete unlock after item 4(a).

## 1. What this application is

`poppim-web` is POP Creations' internal React PIM frontend at `https://pm.designflow.app` (public GitHub repo `u2giants/poppim-web`). Static SPA; all data in shared Supabase project `qsllyeztdwjgirsysgai`. Canonical database shape: `u2giants/shared-db` (GitHub now serves `popcre/shared-db`; redirect does not override Poppim authority). App-owned deploy is GitHub Actions → GHCR → Coolify service `ysvdyj3t7d5tyh5ogrvlka4y`.

## 2. What we set out to do, and why

Continue the human-confirmed Jev activity-triage pilot from plan Phase 0 / Step 1. Goal: stop staff re-entering the same comment as dependency/decision/reminder. Jev may suggest one of five kinds; humans confirm. Trigger: plan + issue #9 after planning PR #10.

## 3. Current state — what is true now

**Landed and proven**
- Planning baseline `09c870bbe6e41e657ff585c11c5ffeb3e9939ec1` (15 test files / 50 tests).
- Phase 0 fail-closed deploy transport: **merged** PR [#11](https://github.com/u2giants/poppim-web/pull/11) → `38caa74e0a8e6f8245f06430f8963169e857964d`.
  - `.github/workflows/deploy.yml`: plaintext IP endpoint deleted; `deploy-transport-preflight` (no secrets) requires https + hostname form + exact `COOLIFY_CONTROL_PLANE_HOST_PIN` + TLS probe before any `COOLIFY_TOKEN` load.
  - `scripts/test-deploy-transport.sh` enforced in verify + preflight (13 checks; 5 unsafe workflows must fail the same checker).
  - `docs/cicd.md` §QUIRK-4 documents the gate.
  - Local proof: fixture 13/0, actionlint 1.7.7 clean, shellcheck 0.10.0 clean, npm 50 tests, lint clean.
  - Independent Codex security-review **APPROVE** `20260922T220045-352597-10499` (after fixing High pin-substitution and Medium fixture-not-enforced findings).
- Live main fail-closed proof (run `35790646692`, SHA `2ceeb7aa`): verify+publish success; preflight failed with `Deploy blocked: COOLIFY_CONTROL_PLANE_HOST_PIN is empty... COOLIFY_TOKEN cannot be loaded or sent.`; deploy job never started.
- Auth signing mode (2026-09-22, secret-free): **asymmetric_jwks ES256**. JWKS kid `89f266de-56b2-4fb7-90b9-25c580ec059a`. issuer `https://qsllyeztdwjgirsysgai.supabase.co/auth/v1`. `/auth/v1/user` without credentials → `UNAUTHORIZED_MISSING_API_KEY` over TLS+HSTS. Path: local pinned-JWKS verify + remote `/auth/v1/user` with caller JWT + publishable key — never import a JWT signing secret.
- Authority evidence posted to issue #9 (2026-09-22).

**Not started / blocked**
- Secure Coolify hostname pin + MITM proof (needs owner 4a).
- Steps 2–12 (harness, evaluation, shared contract, gateway, UI, pilot).
- Corpus feasibility aggregate query (needs owner 5 matrix first).
- shared-db #3298 (external orchestrator work — this Poppim session never authors/deploys it).

**Worktrees**
- `C:/repos/poppim-web-worktrees/jev-phase0-deploy-transport` branch `claude/jev-phase0-deploy-transport` (merged) and `claude/jev-step1-status-ledger` (plan STATUS docs).
- Stale unrelated: `issue-335-deploy-repair` (old GET→POST only; already on main), `issue-335-c391`, `issue-5-item-link-2714`.

## 4. Everything tried that did NOT work / rejected routes

Carry forward every predecessor §4 route (browser provider key, generic activity cache, root `supabase/functions/**`, gitignored corpus, light redaction as consent, one dataset for tune+approve, Accept/Dismiss-only metrics, auto-writes, unleased pending rows, etc.). New from this session:

- **Any HTTPS host as control plane** — Codex security-review High: a mutable `vars.COOLIFY_CONTROL_PLANE_URL` alone would send the bearer token to a substituted host. Fix: exact workflow-pinned `COOLIFY_CONTROL_PLANE_HOST_PIN` (empty = always blocked). Do not weaken the pin to a repository variable.
- **Fixture not enforced / weak negatives** — Codex Medium: tests that only assert some flags exist can miss a later plaintext token curl. Fix: one `check_workflow` function applied to the real file **and** to five unsafe mini-workflows that must fail; run the fixture from verify + preflight in `deploy.yml`.
- **Python/Node hybrid curl parser** — unnecessary complexity; replaced with awk-joined curl invocations + bash `case` matching.
- **bundle:check on Windows** — `scripts/check-bundle.mjs` builds `C:\C:\...` and ENOENT. Pre-existing Windows path bug; out of Phase 0 scope. `tsc` + `vite build` succeed. Do not “fix” it in a Jev transport PR.

## 5. Root causes and key findings

- Privacy/evaluation/authorization dominate cost; Jev price is irrelevant to safety.
- Durable idempotency/leases/acceptance need shared-db #3298, not browser inserts.
- `app.comment.created_by_profile_id` is nullable with no default; generic comment/activity/notification writes are admin-only; `app.activity` has no uniqueness contract.
- Deployment token exfiltration risk is host substitution, not only plaintext HTTP. Pin the hostname in reviewed code.
- Supabase Auth is already asymmetric ES256 — gateway can verify JWTs with public JWKS and validate sessions via `/auth/v1/user` without a signing secret.
- Poppim authority names `u2giants/shared-db`; live API is `popcre/shared-db`. Redirect ≠ authority change.
- Main `paths-ignore` skips pure-docs pushes; workflow/script changes **do** trigger deploy (intended, so the fail-closed gate is live-proven).

## 6. Exact next steps

1. **Present §0 items 1–7 to Albert in one message** (decision 8 stays deferred). **Worked when:** issue #9 has one dated gate decision covering the requested items (or explicit “synthetic only”).
2. **Owner 4a hostname pin transport-only PR:** set `vars.COOLIFY_CONTROL_PLANE_URL`, fill `COOLIFY_CONTROL_PLANE_HOST_PIN` to that exact hostname, prove MITM/wrong-host/wrong-certificate fail before token load, then one controlled deploy. **Worked when:** preflight passes and a no-op/controlled deploy uses encrypted server-authenticated transport without printing the token.
3. **TypeSafe contract/privacy re-check + written deletion/receipt commitment** (item 1). **Worked when:** recorded in #9 or synthetic-only is confirmed.
4. **Step 1.8 corpus feasibility** after owner 5 matrix — aggregate counts only. **Worked when:** ≥500 permission-qualified internal comments, 8 authors, 100 products, all business units, concentration within Step 3 limits; else block #3298/real eval.
5. **Steps 2–3 synthetic harness/protocol** only after secure transport handback (plan Step 2 prerequisite). **Worked when:** synthetic tests pass and no real text is fetched.
6. **shared-db #3298** stays external. Reconcile its scope to final Step 4 only after feasibility + owner 5. **Worked when:** that session’s handback names migration A and preserves live pre-RPC clients.
7. **Steps 5–12** per plan, starting with gateway under `jev-gateway/**` only after owner 4b/c and transport proof.

Natural cuts: after synthetic harness; after #3298 promotion; after UI preview. Update plan STATUS + #9 at each boundary. New `HANDOFF.d` only if this session’s successor stops unfinished.

## 7. Constraints and gotchas

- Dedicated worktree/branch/PR; implementer merges its own app PR; never push protected `main` directly.
- Database structure only via #3298 in a separately authorized shared-db session. Never edit `shared-db/**` mirror here. Never app-side DDL.
- Preserve root `supabase/**` as shared-db. App server runtime is `jev-gateway/**` later.
- No secret or real corpus content in repo, chat, args, logs, screenshots, or GitHub (public repo).
- `COOLIFY_TOKEN` never loads before preflight; never send over plaintext; hostname pin is code-reviewed, not a mutable variable.
- JWT verification stays enabled; no service-role key in app/gateway; no custom token issuer.
- Comment create is fail-open for Jev; no AI failure blocks a comment; no business write before atomic human confirm.
- `product.code` is internal — never show it. Departments stay hard-separated.
- Existing `pm-dev`/`pm-ci` are production aliases. Preview needs new names + owner 4.
- Feature-off manual Operations must use the governed RPCs from #3298, not admin-only table writes.
- Sign every GitHub body: `Posted by <Claude|Codex> chat <id> on <machine>` (`unknown` if id empty).
- Task gates: declare/check `deployment` before workflow/Docker/package; `ui-live-workflow` before `src/**`; `shared-db` only after #3298 promotion for type sync; `reviewer-safety` for plan/handoff/AGENTS.

## 8. Access and environment

- App repo worktree `C:/repos/poppim-web-worktrees/jev-phase0-deploy-transport`; canonical checkout `C:/repos/poppim-web` (landing-only). Schema mirror `shared-db/` is read-only. Live UI `https://pm.designflow.app`. Supabase `qsllyeztdwjgirsysgai`.
- `gh` authenticated. Node/npm available. Git Bash for bash scripts. Windows host `edge-dev`.
- Pinned local validators used this session (not committed): actionlint 1.7.7, shellcheck 0.10.0.
- Secrets location only: 1Password vault `vibe_coding` (names in §0 item 2). Never print values.
- Label/model store: private audited database tables/RPCs only (after #3298).

## 9. Open questions and risks

All owner questions live in §0. Technical risks from the predecessor still apply (wrong valid labels, semantic leakage, credential exposure, authz bypass, races, biased metrics, drift, outage, runaway calls). New: hostname-pin bypass if someone “helpfully” moves the pin to a repo variable; stale `issue-335-deploy-repair` worktree confusing deploy history; `check-bundle.mjs` Windows path bug masking CI-on-Windows only. Do not broaden beyond this pilot.

## Handoff self-audit

1. **Comprehensive for a newcomer? Yes.** §§1–3 name the app, goal, merged PR/SHAs, live run proof, Auth mode, and what is blocked; §6 is ordered with worked-when gates.
2. **As effective as this session? Yes.** §4 preserves the Codex High/Medium findings and fixes; §5 preserves authority/transport/Auth conclusions; predecessor §4–§5 remain for routes not re-tried.
3. **Every execution detail? Yes after reread.** §0 consolidates owner asks 1–8 plus TypeSafe deletion commitment; §7 has transport/shared-db/privacy/signature rules; §8 has paths and secret locations without values.
4. **If Albert reads only §0? Yes.** Sweep of §§1–9 finds owner needs only in §0 (privacy/telemetry, secrets, test profile, infrastructure+hostname pin, role matrix, labelers, budgets, deferred adoption, TypeSafe deletion receipt). No owner ask remains only in body sections.

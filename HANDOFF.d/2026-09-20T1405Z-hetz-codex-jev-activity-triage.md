---
issue: 9
status: OPEN
owner: codex/jev-implementation-plan
---

# Jev activity-triage implementation handoff

Plan: [`../plan_jev_activity_triage.md`](../plan_jev_activity_triage.md)

Audit: [`../bugs.md`](../bugs.md)
Shared structure: [shared-db#3298](https://github.com/u2giants/shared-db/issues/3298)

## 0. ⚠️ DECISIONS ONLY THE OWNER CAN MAKE

Put this consolidated list to Albert before the applicable phase. Do not ask one item at a time.

1. **Approve or reject sending deterministically minimized/redacted real product-comment text to TypeSafe after reviewing the current Master Customer Agreement, retention/deletion, training, subprocessors, DPA terms, and the pre-submit staff disclosure.** The agreement grants perpetual Customer Data processing to derive telemetry and unrestricted telemetry use; Albert must explicitly accept or reject that term. Recommendation: approve only a bounded pilot after the review and display this exact copy immediately above Submit in every Jev-on build: “Eligible internal comments may be minimized and sent to TypeSafe for optional AI triage. TypeSafe may derive and use telemetry under its customer agreement. No dependency, decision, or reminder is created without your review and confirmation.” Pattern redaction cannot guarantee removal of every semantic business name. Without contract/telemetry and copy approval, stop at synthetic evaluation.
2. **Authorize creation/use of private secrets in vault `vibe_coding`:** `TypeSafe AI - Jev API`, `Poppim Jev deployer identity`, `Poppim Jev processor identity`, `Poppim Jev monitor identity`, `Poppim Jev emergency workflow trigger`, `Poppim Jev language runner identity`, `Poppim Jev evaluation runner identity`, `Poppim Jev analysis runner identity`, `Poppim Jev evaluation case key`, `Poppim Jev evaluation source HMAC`, `Poppim Jev evaluation sampling key`, `Poppim Jev analysis cluster key`, `Poppim Jev redaction dictionary`, `Poppim Jev dictionary commitment key`, and `Poppim Jev production sampler`. The trigger starts only the pinned protected stop job and cannot access deployer/database credentials. Labels/results/mappings live only in the private audited database store, never 1Password. Business labelers never access the vault, runner, model output, or each other's labels. Language/model/analysis runner identities are short-lived, mutually isolated, and revoked after each dataset. Use `secrets-to-1password` before changing secret items.
3. **Name an approved ordinary non-admin PM test profile if repository documentation does not already identify one.** Administrator-only proof is insufficient for this feature.
4. **Authorize the exact isolated preview and production infrastructure/mutation after plan gates:** Phase 0 may change only the existing deploy workflow and its smallest validation fixture to make the plaintext token call unreachable before any other non-prose work. Then replace it with certificate-valid HTTPS or an authenticated encrypted private tunnel; all other non-prose implementation remains blocked until that handback passes. Afterward provision services/domains/redirects/secrets/config and deploy. Separately authorize bounded preview/production-validation workflows to use the target project's protected Supabase secret/service-role key solely for Auth Admin creation/disable/deletion of named synthetic users and service identities, then create/delete named profile/product/comment/Operations fixtures. Name the protected alert channel and primary/backup human recipients; primary acknowledgement is due within 15 minutes or backup escalation fires. That key never enters the app or gateway. The planning request authorizes none of those mutations.
5. **Approve the exact role × action × business-unit matrix.** Current writes are administrator-only. No plan step may grant sales, licensing, designers, or another role comment/Operations/Jev write authority until Albert approves the matrix; absent approval, preserve administrator-only behavior.
6. **Name and authorize two English-fluent business labelers and one English-fluent adjudicator for temporary one-case-at-a-time real-comment access, plus a coordinator restricted to metadata/hashes/aggregate results only.** Record language qualification, each corpus/window, audit owner, and removal date. The coordinator never sees raw text or row-level labels/model results. Without this, use synthetic data only.
7. **Approve the fixed, non-transferable call/spend ceilings:** offline evaluation 2,000 calls/2,000,000 tokens/US$10 (800 per candidate, maximum two; per-class metrics reuse the uniform holdout); preview plus revalidation per evaluated release 500/500,000/US$5; production validation 100/100,000/US$2; production pilot 2,000/2,000,000/US$10, additionally 50/50,000 per profile and 250/250,000 globally per rolling 24 hours with concurrency 2. Any ceiling stops sends; no phase borrows another's budget, and raising/replenishing needs a new owner decision and readiness.
8. **After the completed pilot only, approve or reject ongoing adoption under a new phase.** A passing pilot is merely adoption-eligible and remains off. Ongoing TypeSafe calls require new recurring request/token/US-dollar ceilings, operational credentials/key versions, dictionary lifecycle, current telemetry/contract approval, retention/deletion, monitor/on-call owner, review cadence, and rollback/SLA. Without that new decision, no call resumes and all pilot runtime material retires.

Already settled—do not re-ask: narrow comment triage only; no urgency in the first pilot; comment-first; human edit/confirm; no generated prose/due dates; no browser key; pinned evaluated model; shared schema through #3298; disabled-by-default browser/gateway flags.

## 1. What this application is

`poppim-web` is POP Creations' internal React PIM frontend at `https://pm.designflow.app`. It is a public repository and static browser app backed by the shared Supabase project. Current Poppim authority routes shared database shape to `u2giants/shared-db`; app-owned server runtime/deployment belongs here. Re-prove repository authority before external work and stop for Albert if current instructions, repository ownership, or redirects disagree.

## 2. What we set out to do, and why

The codebase audit found one strong use for cheap Jev decisions: classify a newly posted product comment as routine, blocker/dependency, decision, follow-up reminder, or unclear. The user may edit and confirm a structured record; Jev never writes automatically. The complete executable specification is the linked plan.

## 3. Current state — what is true now

- Planning baseline: `09c870bbe6e41e657ff585c11c5ffeb3e9939ec1`.
- Planning branch/worktree: `codex/jev-implementation-plan` at `/worksp/poppim-web-jev-plan`.
- Issue [poppim-web#9](https://github.com/u2giants/poppim-web/issues/9) is open.
- Required shared structure was routed as [shared-db#3298](https://github.com/u2giants/shared-db/issues/3298) with `db-work` label. Its execution scope must be reconciled against the final Step 4 contract before a separately authorized shared-db session starts; this Poppim session does not validate, direct, or run that work. Implementation also remains blocked on the owner-approved permissions matrix.
- Planning baseline passed 15 test files / 50 tests, lint, build, and `git diff --check`.
- No Jev API call, credential, corpus, gateway, shared migration, triage UI, isolated preview stack, production deploy, or live proof exists.
- Current direct comment insert does not set `created_by_profile_id`; generic comment/activity/notification writes are administrator-only; `app.activity` has no uniqueness contract. These facts require #3298 before app integration.

## 4. Everything tried that did NOT work / rejected routes

- Browser provider calls expose the credential.
- Generic `app.activity` caching fails non-admin authorization and atomic idempotency.
- Root `supabase/functions/**` is intentionally classified as shared-db work by repository gates.
- A gitignored `.private/` corpus inside the public checkout is not access control.
- Light redaction does not address credentials, IDs, URLs, paths, or semantic business names.
- One dataset for tuning and approval overfits; calibration and holdout must be separate.
- Accept/Dismiss alone misses false negatives from suppressed suggestions.
- Automatic writes remain unsafe even when the output type is valid.
- A pending row without a lease can strand forever; attempts need expiry, takeover, and old-worker rejection.
- A narrow background processor—not the browser—is capped at one provider attempt per logical row. Only pre-`provider_started_at` work may be reclaimed; every post-start ambiguity is terminal and reload shows unavailable rather than offering a resend.
- Jev-on comment creation atomically creates a queued eligibility row; modal close/crash cannot skip triage because the background worker claims it independently.
- Queue creation is fail-open for comments: a caught queue failure leaves the posted comment plus bounded eligibility metadata, monitoring, and requester-only repair rather than rolling back the comment.
- Comment writes use caller operation UUID uniqueness and replay the original result after a lost response. Server-owned pilot configuration—not a browser boolean—decides eligibility.
- Browser persistence contains only a server-issued opaque recovery handle plus version/time—never body, project, profile, product, comment, or operation IDs. Recovery is JWT-owned and returns an indistinguishable denial to another account/project.
- Recovery is owned by one authenticated app-shell coordinator, so login/session restore/account switch is handled even when no product modal has opened.
- Comment-operation reservation recovery is always on in both Jev-on and post-RPC Jev-off builds; only suggestion recovery is feature-gated, so rollback cannot strand an ambiguous comment submission.
- Recovery pages active suggestions first in bounded 20-row pages, lists reviewed history separately, and batch-loads comment context once per active page; reviewed volume cannot hide an older active card or cause an N+1 query pattern.
- Eligibility and triage queue rows also have a non-null operation-derived identity before any input digest exists; concurrent enqueue/repair returns that one row and cannot duplicate provider work.
- The server pilot switch is mutated only by an audited, optimistic-revision RPC used by a dedicated protected deployer identity. Its emergency generation is a database runtime fence checked at lease and immediately before provider send, so a late gateway deployment cannot outrun emergency stop.
- Deployment readiness uses its own versioned HMAC key in the protected workflow and Vault; gateway/input keys cannot sign readiness.
- One evaluated release digest binds code/vectors, exact model, prompt/choices, thresholds, input/token rules, and response schema; production cannot override those pieces independently.
- Every eligibility/result/label/acceptance binds the comment's monotonic body revision; editing expires unreviewed work instead of applying a stale suggestion.
- Minimal append-only eligibility tombstones survive source deletion; any unrepaired metadata blocks the statistical report, and deletion cannot erase an eligible failure.
- Comment reads expose safe enqueue metadata; repair returns queued state and wakes the gateway, so reload recovery works even when initial enqueue failed.
- Evaluation and gateway import the same shared canonicalization/redaction/contract modules and golden vectors; a contract hash binds evaluation, database, gateway, and deployment.
- Initial app merge is Jev-off and enablement is a protected later dispatch. Once a pilot is active, prose-only commits do not deploy; every runtime-affecting change blocks until protected preview/revalidation advances the validated SHA. There is no unrelated-runtime exception.
- User-visible urgency was removed because no independent quality threshold had been defined.
- Feature-off manual Operations cannot keep using administrator-only table writes; non-AI governed create/update RPCs are part of #3298 and remain independent of triage.
- The hosted Supabase function runtime is rejected because it receives a broad service credential. A separate Deno gateway gets public Supabase values, a narrow processor identity, TypeSafe/HMAC secrets, and bounded config. Claim/begin/fence/completion/failure use processor JWT plus canonical HMAC envelopes verified by least-privilege NOLOGIN definers.
- Private database workers require fixed safe search paths, explicit execute revocation from PUBLIC/anon/authenticated/service-role, and direct-call denial proof; wrapper access is exact.
- Stored input identity is a per-environment keyed HMAC with key version, never a raw comment hash.
- Activity/Operations reads move to bounded product-scoped RPCs; guessed/inaccessible products and cross-product cursors must not leak comments or operating records.
- Migration B cannot revoke a relation grant until catalog/source dependency proof covers Notes, People, Schedule, Reports/handoffs, Comments, Activity, Operations, My Work, rollups, and sibling consumers; ordinary-role browser regressions must pass for every named screen.
- Historical evaluation and pilot use the same permission-qualified, internal-visibility population. Labelers use only pseudonymous case IDs; comment/revision/HMAC mapping stays server-side.
- Provider response streams are content-type/encoding checked and capped before parsing; invalid-token floods hit pre-auth IP/global/concurrency limits before Supabase Auth.
- The pilot uses exactly one gateway replica with autoscaling disabled, duplicate-instance detection, and a 60-second no-Auth cold gate after restart; empty pre-auth buckets refill normally so restarts cannot multiply invalid-token traffic.
- The first release permanently binds all three action classes; sparse/failing classes fail the release rather than being switched off after measurement. A smaller set requires a new disjoint evaluation.
- The first release is English-only through one frozen offline language gate shared by evaluation and production. Unsupported/uncertain text is blocked, never labeled `unclear`; every action class needs its own precision and recall evidence.
- Provider IDs/errors/bodies/headers are never durable; only gateway-generated error enums and bounded numbers survive. App nginx owns one delivered, deployment-digested CSP header binding the exact gateway origin.
- Staff see owner-approved TypeSafe disclosure immediately above comment Submit in Jev-on builds; it is visible before posting and is not treated as hidden consent.
- Server triage additionally requires the exact owner-approved disclosure version carried by the build that rendered it. Cached off/old-copy tabs still post comments but create zero provider work until reloaded to the matching build.
- The disclosure links to a named signed-in `?notice=jev-activity-triage-v<version>` dialog owned in the Jev feature, with direct/login/accessibility/broken-link tests; this app does not need a router for it.
- Gateway builder/runtime bases are digest-pinned. Source locks and the final image receive fail-closed vulnerability and secret scans; a complete final-image SBOM plus SLSA provenance is signed for the exact digest and reverified before deployment. Waivers require Albert, a linked issue, expiry, compensating controls, and exact artifact binding.
- Frontend and gateway receive separate final-image SBOMs: frontend expects nginx/OS/static assets, while gateway expects Deno/OS and only its vendored Deno dependencies. Build-only npm packages must not be shipped in either runtime image.
- Every High/Critical vulnerability fails even when no fix exists unless Albert approves the exact expiring artifact-bound waiver; unfixable findings never pass silently.
- Provider/Auth/RPC requests validate exact HTTPS origin/path and use redirect-error behavior; downgrade and cross-origin 301/302/303/307/308 responses receive no second request or credential/body.
- The server atomically admits no more than 1,000 pilot comments and stops at the earlier 30-day boundary; cutoff drains and turns browser/gateway/server off before measurement. A passing result remains off pending owner decision 8.
- Authenticated Playwright proof stores no trace/video/HAR/storage state, uses an ephemeral protected auth file, scans its bounded screenshots, and cleans/ignores every generated artifact.
- Activity uses one chronological comment/update feed; Operations lists keep independent keyset cursors. All have accessible “Load older” controls, and refresh cannot discard older loaded records.
- Moving model aliases invalidate thresholds; pin the evaluated version.

## 5. Root causes and key findings

- Comments are free text while dependencies, decisions, and reminders are re-entered separately; that duplicate interpretation is the opportunity.
- Jev provides closed typed decisions, not prose. It may still confidently choose the wrong valid option.
- Privacy/evaluation/authorization dominate the implementation cost; inference price is not the safety criterion.
- Durable ownership, rate limits, expiring leases, idempotency, recovery, and exactly-once acceptance need a narrow table/RPC/RLS contract in shared-db.
- Acceptance rechecks active profile, PM app access, staff role, readable product/business unit, stored action kind, and field allowlist; comment ownership alone is never write authority.
- Begin/recovery/accept/dismiss are requester/comment-author only; other staff/admin profiles cannot act on leaked triage IDs. Manual dependency resolution is actor-or-admin and reminder completion is assignee-or-admin.
- The gateway's processor identity can claim only one queued comment body through the signed RPC; it has no table browse or business-write grants. Worker mutations are HMAC-bound to row/lease/environment, with no service-role key or custom token issuer.
- Claim is a short provisional exclusion with no attempt/budget; the server transactionally caps outstanding claims plus leases at concurrency 2 before returning raw text, and begin converts that exact claim into the provider lease. A crash before begin expires harmlessly, while a crash after begin follows lease recovery.
- The open UI polls only the exact comment until a terminal result (including hidden no-suggestion) or 60-second timeout; reload recovers durable state.
- Begin and the immediately-before-network fence are gateway-signed too; direct authenticated calls cannot consume a lease or budget. Stale queued rows alert after 10 minutes and count against the fixed processing-coverage gate.
- Real corpus mappings, splits, labels, adjudication, and model results belong only in private audited database tables/RPCs. Raw text stays in Supabase and protected one-case-at-a-time ephemeral `mktemp` memory/files only; validated startup/boot cleanup removes owner-marked stale directories left by SIGKILL, host failure, or reboot.
- Production identifiers and every re-linkable vault key/mapping/label/sampler artifact are retained only through the fixed pilot and 90-day audit window, then independently reconciled and deleted/scrubbed; only aggregate evidence remains.
- Evaluation uses a frozen multi-intent rubric, minimum agreement/kappa gates, cluster-sampled/time-isolated frames, separately sealed labels, and blind adjudication. Production measurement uses the union eligibility ledger, a committed sampler-key hash, private seed, and one uniform sample for overall and per-class metrics under the frozen 30-day/1,000-comment stopping rule. Deleted/inaccessible truth is never invented: it gets an unavailable bucket, worst-case bounds, and a 5% inconclusive gate.
- Historical comments pass the exact shared JavaScript language gate in a protected one-case-at-a-time runner before sampling; PostgreSQL never approximates it and an incomplete classification set cannot open.
- The same protected runner clusters exact/near-duplicate normalized/redacted comments with frozen keyed MinHash vectors before sampling; product/thread/template and cross-window components remain wholly in calibration or are excluded from later holdout, never leaked across splits.
- Clustered quality metrics run in a separate protected analysis runner over a complete one-time pseudonymous truth/prediction/requester-cluster/product-cluster stream. It emits aggregates only, destroys row-level memory, and exposes neither text nor identity mappings to the coordinator.
- Docker contexts explicitly exclude environment files, browser auth/test artifacts, traces/video/HAR/archives, coverage, private scratch, and AI review files; canaries prove none reaches BuildKit layers or cache.
- After aggregate volume passes, a separately authorized minimal feasibility slice—not the full runtime contract—uses at most 300 disjoint cases to require per-class truth/prediction prevalence and ≥80% clustered power before migration A or the full labeling corpus proceeds.
- Migration B waits for current-SHA owner receipts and authenticated/no-use proof from the canonical consumer list: at minimum `u2giants/popcrm-web`, `u2giants/popdam-web`, `u2giants/popdam3` for DB Data Admin, and all six named `popcre/designflow-*` repositories including `designflow-tracking`; newly discovered consumers are added rather than assumed absent. This Poppim session never coordinates those sibling sessions.
- Before real text, TypeSafe must commit in writing to an account/date-window Input-deletion process and receipt. Closeout records what Input/subprocessor/backups were deleted and what approved perpetual telemetry remains; missing confirmation is a privacy incident and blocks adoption.

## 6. Exact next steps

1. Reconcile `origin/main`, this handoff, the plan STATUS table, issue #9, and shared-db #3298. Re-run task classification. Execute only plan Phase 0's narrow deploy-workflow fail-closed repair; then obtain the secure Coolify transport handback before any other non-prose edit. Prove the production/preview Supabase Auth signing modes have the plan's secret-free validation path, and run the aggregate-only corpus feasibility gate before #3298 starts. **Worked when:** all references name current SHA/state, the old plaintext token call is unreachable, token-bearing deployment transport is encrypted/server-authenticated, Auth validation passes without a signing secret, and corpus counts/diversity/concentration pass or real/shared-contract work is stopped.
2. Clear §0 items 1–3 and 6–7 together. Re-check official TypeSafe contract/privacy facts and obtain its written Input/subprocessor/backup deletion process and receipt commitment. **Worked when:** issue #9 records one dated gate decision plus that operational vendor commitment; otherwise only synthetic work proceeds.
3. Implement Steps 2–3 with invented fixtures only: harness, redaction/rejection, frozen sampling/rubric/replacement/analysis protocol. Do not fetch real comments yet. **Worked when:** synthetic protocol/privacy tests pass.
4. Obtain §0 item 5's exact role/action/business-unit matrix before any shared-contract execution. After the aggregate gate, wait for a separately authorized shared-db session to land only #3298's temporary minimal feasibility slice; execute the disjoint 300-case prevalence/power gate and stop if any class fails. Only a pass allows that external session to build/promote migration A; do not author, direct, claim, preview, or deploy either stage from this Poppim session. Execute Step 4B real calibration/holdout only after the full additive handback. **Worked when:** item 5, per-class prevalence/power, shared contract evidence, agreement, clustered precision/recall, access revocation, and privacy gates pass.
5. After Step 1 has already proven secure Coolify control-plane transport, obtain the rest of §0 item 4's exact preview/infrastructure authorization. Then implement plan Steps 5–6 under `jev-gateway/`, including both discovered Supabase signing modes, pinned Deno config/lock/base images, non-root container, exact environment allowlist, single-replica/restart rate-limit controls, explicit task-gate classification, expiring lease/crash recovery, final-image SBOM/vulnerability/secret scans, signed provenance, and isolated preview deploy. **Worked when:** item 4 is recorded and format/lint/check/test, caller auth, redaction, cache/rate/retry/recovery, restart/flood, forbidden-credential, supply-chain/attestation, and separate preview target proof pass.
6. Implement Step 7 and deploy/prove the post-RPC Jev-off frontend while additive legacy access still works. Only then wait for separately governed Step 7B plus current-SHA authenticated/no-use receipts from CRM, DAM, and every named DesignFlow sibling; never coordinate, direct, or apply them here. After direct-bypass denial and all sibling proofs, implement Steps 8–9 for triage and human-confirmed UI. **Worked when:** compatible off/rollback images, cross-app direct-denial safety, comment independence, approved pre-submit disclosure, edit/confirm/dismiss, duplicate protection, stale guards, active-first batched reload recovery with separate reviewed history, accessibility, and visual proof pass.
7. Execute Steps 10–12: exact-head review, pre-pilot Jev-off deploy, authorized server enable, protected same-SHA Jev-on dispatch, pilot-aware later releases, signed-in live proof, fixed blinded production sample/stopping rule, rollback proof, issue closeout, and governed retirement of this workstream's handoff—do not create a new open closeout handoff for finished work. **Worked when:** every definition-of-done box has evidence.

Natural cuts: after held-out evaluation; after shared-db promotion/server preview; after UI preview. Update the plan/issue. Create a new write-once `HANDOFF.d` file only when a session actually stops unfinished; before a sequential successor adds one, use `close-old-session` to reconcile/retire the superseded workstream through its governed path. Leave root `HANDOFF.md` unchanged and never directly edit/delete another session's handoff.

## 7. Constraints and gotchas

- Dedicated worktree/branch/PR; stage only owned files; implementer merges its own app PR.
- Database structure is exclusively shared-db #3298 work in a separately authorized shared-db session.
- Preserve root `supabase/**` as shared-db. App runtime uses `jev-gateway/**` and adds an explicit deployment gate/test.
- No secret or real corpus content in repo, chat, arguments, logs, screenshots, or GitHub.
- Omit product title and unrelated state. Block suspected secrets/high-entropy tokens before network.
- Redaction is not consent; owner privacy approval remains required.
- JWT verification stays enabled. Caller-JWT reads app data; canonical HMAC wrappers close matching leased triage metadata through the least-privilege NOLOGIN owner.
- Gateway readiness comes before initial same-SHA Jev-on deployment. During the pilot, every runtime-affecting change blocks for preview/revalidation; normal rollback stops new eligibility, drains queued/active work, finalizes server-off, then disables browser/gateway.
- Before the pilot, main deploys are off. During an active pilot, prose-only commits do not deploy or advance runtime SHAs; all other changes require the protected pilot revalidation lane, so an ordinary release cannot silently change or hide suggestions.
- Live synthetic acceptance runs in a structurally separate validation cohort and is cleaned before the later pilot start time/version; validation rows can never enter production measurements.
- Emergency stop prevents new leases immediately, then stops gateway egress and waits out the provider timeout. A final-fence-to-network race can leave at most the frozen worker-concurrency number of already reserved in-flight calls; the plan does not claim an impossible instantaneous zero.
- Existing `pm-dev`/`pm-ci` aliases are production aliases, not preview. Use separately provisioned `pm-jev-preview` and `pm-jev-gateway-preview`; a separately authorized infrastructure session owns services/DNS/redirects and any Ansible work. A target-proven Poppim fixture workflow owns synthetic preview Auth/profile/role/product data and cleanup.
- App preview must use the exact preview Supabase ref/migration/contract/Vault proof handed back by #3298; `rjy...` is only a type-generation project unless that handback proves otherwise.
- Normal production releases share one non-cancelling lane. A separately reviewed pre-authorized emergency workflow latches/cancels/stops the gateway first; clearing it requires new owner authorization.
- Runtime/domain ownership changes require a separate `u2giants/albert-standards` worktree/PR. This Poppim session does not become an infrastructure or shared-db orchestrator.
- No AI failure may block or roll back a comment.
- No business write before editable confirmation through the atomic RPC.
- Use ordinary non-admin live proof and exact frontend/gateway image digests; CI/HTTP 200 are not acceptance.
- Production secret/function mutation needs current explicit authorization.

## 8. Access and environment

- App repo `/worksp/poppim-web`; schema repo `/worksp/shared-db`; live UI `https://pm.designflow.app`; Supabase project `qsllyeztdwjgirsysgai`.
- `gh` is authenticated. During planning, Supabase CLI 2.105.0, Node 20.20.2, npm 11.16.0, Docker, and 1Password CLI 2.34.1 were available.
- Proposed TypeSafe key location: `vibe_coding` / `TypeSafe AI - Jev API` / `credential`.
- Label/model/adjudication source of truth: private audited database tables/RPCs only; no 1Password label documents or row-level exports.
- No approved non-admin test identity is confirmed in scoped docs.
- Resolve protected project/environment values through existing private configuration without echoing them.

## 9. Open questions and risks

All eight owner questions are consolidated in §0; decision 8 remains deliberately deferred until the pilot is adoption-eligible. Principal technical risks are wrong valid labels, semantic data leakage, credential exposure, authorization bypass, race/duplicate writes, biased metrics, model drift, outage, and runaway calls. The plan assigns a measurable mitigation and rollback to each. Do not broaden to other Jev ideas until this pilot closes with measured value.

## Handoff self-audit

1. **Can a newcomer continue without chat context? Evidence-backed yes.** §§1–3 identify the app, objective, baseline, worktree, issues, external dependency, and everything that does not yet exist; §6 gives ordered executable next steps and pass conditions; §§8–9 give access facts and remaining risks.
2. **Can they continue as effectively as this session? Evidence-backed yes.** §4 preserves rejected routes and why they failed; §5 preserves the security, privacy, lease, measurement, and authorization conclusions; the linked plan owns the exact file/RPC/test/deployment specification. No chat-only decision is required.
3. **Is every execution detail present? Evidence-backed yes after final reread.** §0 consolidates all eight owner decisions, with post-pilot adoption intentionally deferred; §6 provides sequencing and worked-when gates; §7 records repository/database/infrastructure boundaries and the Phase 0/Step 1.6 plaintext Coolify-transport prerequisite, with Step 6 owning the transport tests; §8 names environments and secret locations without values. The final gap audit found no missing background, goal, current state, failed route, decision, constraint, risk, next action, or verification source.

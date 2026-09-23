# shared-db #3298 execution brief

Audience: a **separate shared-db orchestrator session** in
[`u2giants/shared-db`](https://github.com/u2giants/shared-db).

This Poppim session must **not** author migrations, apply schema, edit the
`shared-db/` mirror, or touch Supabase Vault structure. All structural work is
routed to the orchestrator.

- Structural issue: [shared-db#3298](https://github.com/u2giants/shared-db/issues/3298)
- Application return: [poppim-web#9](https://github.com/u2giants/poppim-web/issues/9)
- Plan: `plan_jev_activity_triage.md` Step 4
- Authz target: [`admin-only-matrix-v1.md`](admin-only-matrix-v1.md)

## Orchestrator (structure) vs non-orchestrator

**Orchestrator — structure (this brief owns only this list):**

- tables, indexes, constraints, triggers, RLS policies
- SECURITY DEFINER functions, grants/revocations, NOLOGIN worker roles
- generated database types (`generated_types: required`)
- branch + PR + timestamped migration in `u2giants/shared-db`
- preview migration, rollback rehearsal, and additive production promotion evidence

**Non-orchestrator — not shared-db, not this brief:**

- poppim-web frontend, `jev-gateway/**`, `shared/jev-activity-triage/**`, CI/workflows
- TypeSafe/provider calls, evaluation-harness execution, preview fixtures and application-row cleanup
- 1Password secret provisioning, Coolify/host/Ansible work
- owner decisions 1–8, TypeSafe written deletion commitment, corpus feasibility runs

## First promotion constraint (migration A)

**Additive only.** Migration A creates the Jev contract and must **preserve live
pre-RPC clients**:

- do **not** revoke current direct-table grants/RLS used by the live pre-RPC frontend
- do **not** include Step 7B tightening/revocations
- prove **old and new clients both work** in preview and in additive production promotion
- handback names migration A and its contract/migration hashes

Step 7B (tightening direct shared-table access) is a **separately governed
second migration**, only after the post-RPC Jev-off frontend is live and proven.

Before any structural claim, reconcile the exact object list against the current
plan and admin-only matrix v1 (shared-db#3298 qualification hold, 2026-09-22).
No role, migration version, preview, or production action is authorized by that
hold alone.

## Authorization target (RLS/RPC)

Implement **admin-only matrix v1** (`admin-only-matrix-v1.md`):

| Role | Comment create | Dependency/decision/reminder create | Dependency/reminder status | Jev accept/dismiss |
|---|---|---|---|---|
| administrator | allowed | allowed | allowed | allowed |
| sales / licensing / designer / viewer / vendor / anonymous | denied | denied | denied | denied |

The preliminary `administrator|sales|licensing|designer` list in issue #3298 is
a proposal only. **Do not grant non-admin roles in migration A.** Widening
requires a new evaluated release **and** a separate shared-db change.

Every governed RPC independently re-checks: active profile, PM app access,
admin-only matrix v1, and caller-readable product / business unit.

## Exact objects from issue #3298

### Writes (create)

| Object | Kind |
|---|---|
| `pim.ai_activity_triage` | table |
| `api.pm_add_product_comment` | function |
| `api.pm_begin_activity_triage` | function |
| `api.pm_complete_activity_triage` | function |
| `api.pm_fail_activity_triage` | function |
| `pim.pm_complete_activity_triage_worker` | function (private) |
| `pim.pm_fail_activity_triage_worker` | function (private) |
| `api.pm_get_activity_triage` | function |
| `api.pm_create_dependency` | function |
| `api.pm_create_decision` | function |
| `api.pm_create_reminder` | function |
| `api.pm_update_dependency_status` | function |
| `api.pm_update_reminder_status` | function |
| `api.pm_accept_activity_triage` | function |
| `api.pm_dismiss_activity_triage` | function |
| `pm_ai_activity_triage_select_own` | policy on `pim.ai_activity_triage` |
| `pm_ai_activity_triage_admin_audit` | policy on `pim.ai_activity_triage` |

### Reads (existing)

`app.comment`, `app.activity`, `app.notification`, `app.profile`, `pim.product`.

### Plan-required additive objects (reconcile into #3298 before structural claims)

The current Poppim plan expands past the preliminary `writes:` list. Migration A
must also cover at least:

- `app.comment.body_revision`
- `pim.ai_activity_triage_eligibility` (eligibility ledger)
- reservation / recovery / repair objects for comment operations
- HMAC envelope verification on begin/complete/fail/fence
- NOLOGIN worker ownership for the private complete/fail implementations
- Operations RPC field contracts that match today's dependency/decision/reminder
  shapes (no parallel Jev-only record shape)

## body_revision

Add a monotonic `body_revision` to `app.comment`:

- initialize to `1`
- increment **only** when the body changes
- increment via a trigger ordinary callers cannot bypass
- return it on every comment read/write
- bind every triage/eligibility row to the captured revision

A body edit atomically marks every unreviewed non-final triage row
(`queued`, provisional `claimed`, pre-provider `leased`, or actionable
`succeeded`) as `source_changed`, invalidates claim/lease, and prevents
fence/display/accept. Accept requires live `body_revision` equal to the captured
revision; mismatch expires the suggestion and creates no business record.

## Eligibility and triage tables

- `pim.ai_activity_triage_eligibility` — append-only-during-pilot ledger keyed by
  `(requester_profile_id, client_operation_id, eligibility_version)`. Carries
  immutable comment ID, captured body revision, cohort
  (`validation|pilot`), eligible time/version/product/requester/state. **No
  text, no title.** Survives source deletion for measurement/audit; raw
  identifiers follow the fixed 90-day retirement/deletion/scrubbing contract.
- `pim.ai_activity_triage` — unique eligibility ID; immutable scalar snapshot
  UUIDs (no FK/cascades) for eligibility comment, requester, product, and created
  business record; captured `source_body_revision`; nullable live references with
  `ON DELETE SET NULL` where a real FK is possible; keyed input digest/version;
  release/model/contract; state/results/usage/review metadata; first
  requester-visible impression time; allowlisted error code. **Never raw text.**
- Unique idempotency over `(comment_id, input_digest, input_key_version, model,
  contract_version)` plus non-null unique `eligibility_id` so a comment cannot
  queue twice before a digest exists.
- Narrow RLS: owner reads own triage rows; administrators audit. Direct browser
  insert/update/delete stays denied.

## HMAC envelopes

Signed canonical envelopes on claim / begin / runtime-fence / complete / fail:

- HMAC-SHA-256 over a versioned canonical envelope covering environment,
  requester, product, comment, eligibility row, captured body revision, claim or
  lease token, canonical disposition or outcome, input byte count, input digest
  and input-HMAC key version, exact model, contract version, quality release
  digest, target deployment digest, emergency generation, timestamp, and nonce.
- Nullable fields and lengths encode unambiguously; unknown fields reject.
- Verifier secret is environment-specific in Supabase Vault, readable only by
  the definer; short expiry and nonce replay protection.
- The input digest itself is HMAC-SHA-256 over the exact minimized
  payload/contract under `JEV_INPUT_HMAC_KEY` — a raw SHA of comment text is
  forbidden.
- Provider request IDs, error strings/bodies/headers, and prompt text are never
  envelope fields.

## NOLOGIN workers

- Private implementations `pim.pm_complete_activity_triage_worker` and
  `pim.pm_fail_activity_triage_worker` are owned by a **dedicated NOLOGIN role**
  with rights only on the triage table/functions.
- Public wrappers `api.pm_complete_activity_triage` / `api.pm_fail_activity_triage`
  are SECURITY DEFINER, require the exact processor `auth.uid()`, verify the HMAC
  envelope, then invoke the private workers.
- `GRANT EXECUTE` on public wrappers only to `authenticated`; revoke from
  `PUBLIC`, `anon`, `service_role`.
- Private workers revoke execute from `PUBLIC`, `anon`, `authenticated`,
  `service_role`; grant only the wrapper-owner relationship.
- Fixed minimal `search_path`, schema-qualified references.
- No service-role key, no LOGIN role, no custom token issuer.
- Stale takeover allowed only after at least two provider timeouts; a late
  completion from the old lease is rejected.

## Operations RPCs for Jev-off rollback

Jev-independent RPCs must work with the feature **on or off**, so rollback never
depends on a triage row:

- `api.pm_create_dependency`
- `api.pm_create_decision`
- `api.pm_create_reminder`
- `api.pm_update_dependency_status`
- `api.pm_update_reminder_status`

They enforce admin-only matrix v1 (until a wider matrix is approved) plus the
same active-profile / PM-access / readable-product checks and exact field
allowlists (dependency title 1–200, fixed `blocked_by/open`; decision type
1–100, notes ≤2,000, fixed `decided`; reminder title 1–200, valid optional
date-only due date, caller-assigned, fixed `open/follow_up`). Output rows must
preserve today's action names, `payload.kind`, product target fields,
notification shape, date-only `payload.due_at`, status/reminder type, and
report-visible timestamps consumed by My Work and `api.pm_department_report`.

## Preview acceptance list

Minimum preview evidence before handback:

1. Preview migration and rollback rehearsal pass; migration A is additive and
   preserves live pre-RPC clients (old and new both green).
2. Comment RPC rejects empty/whitespace, >4,000 characters, NUL/controls,
   invalid product, and oversized requests before insert.
3. Administrator can post through the RPC, owns `created_by_profile_id`, begins/
   retrieves its own triage row, and accepts/dismisses once on Licensed, Generic,
   and Software products.
4. `sales`, `licensing`, `designer`, `viewer`, `vendor`, and anonymous are denied
   create, Operations create/status, and Jev accept/dismiss (admin-only matrix v1).
5. A different signed-in user cannot read or mutate another user's triage row;
   product/business-unit access is rechecked at acceptance.
6. Concurrent begin calls produce one logical row / one active lease; stale
   takeover works after expiry; late old-worker completion fails; concurrent or
   retried accept produces exactly one business record.
7. Signed completion/failure rejects missing, malformed, expired, replayed,
   wrong-actor, wrong-lease, or wrong-environment envelopes.
8. The NOLOGIN worker cannot read or write unrelated application rows.
9. `body_revision` bump during queued/claimed/leased/succeeded marks
   `source_changed` and blocks accept; accept after edit creates no record.
10. Operations RPCs create/resolve dependency/decision/reminder records
    shape-compatible with My Work and `api.pm_department_report` while Jev is off.
11. Existing comment and operating-record behavior remains green for pre-RPC and
    RPC clients.
12. Generated database types sync through the governed path.

## Handback requirements

Return to poppim-web#9 (non-orchestrator follow-up in this app):

- preview Supabase project ref where migration A, new grants/RLS, private-function
  revocations, and the preview HMAC Vault verifier are applied
- migration A name and contract/migration hashes
- additive production promotion/version proof showing the pre-RPC app still works
- confirmation that Step 7B revocations were **not** included

App work stays blocked until admin-only matrix v1 and these additive proofs
exist and exact generated types are synced. Direct-access revocation stays
blocked until Step 7B.

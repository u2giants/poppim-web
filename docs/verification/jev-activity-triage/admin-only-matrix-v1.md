# Admin-only authorization matrix v1 (frozen)

Status: **frozen for pilot v1**.

Citation: **locked reviewer path 2026-09-23** (issue
[poppim-web#9](https://github.com/u2giants/poppim-web/issues/9),
`plan_jev_activity_triage.md` STATUS and owner decision 5, and the
shared-db#3298 qualification hold of 2026-09-22 that preserves current
administrator-only writes). This document is the resulting v1 freeze.

## Scope

Applies to pilot v1 RLS/RPC authorization for every governed write below:

| # | Action | RPC surface (shared-db#3298) |
|---|---|---|
| 1 | Comment create | `api.pm_add_product_comment` |
| 2 | Dependency create | `api.pm_create_dependency` |
| 3 | Decision create | `api.pm_create_decision` |
| 4 | Reminder create | `api.pm_create_reminder` |
| 5 | Dependency status change | `api.pm_update_dependency_status` |
| 6 | Reminder status change | `api.pm_update_reminder_status` |
| 7 | Jev accept | `api.pm_accept_activity_triage` |
| 8 | Jev dismiss | `api.pm_dismiss_activity_triage` |

Reservation/recovery/repair paths inherit the same role gate as comment create.

## Matrix v1

| Role | Comment create | Dependency / decision / reminder create | Dependency / reminder status | Jev accept / dismiss |
|---|---|---|---|---|
| administrator | **allowed** | **allowed** | **allowed** | **allowed** |
| sales | denied | denied | denied | denied |
| licensing | denied | denied | denied | denied |
| designer | denied | denied | denied | denied |
| viewer | denied | denied | denied | denied |
| vendor | denied | denied | denied | denied |
| anonymous | denied | denied | denied | denied |

## Rules

1. Pilot v1 is **administrator-only**. Every action in the table requires an
   active administrator profile, PM app access, and a caller-readable product
   (plus current business-unit access where the matrix names one).
2. `sales`, `licensing`, `designer`, `viewer`, and `vendor` are **denied** for
   every action in this matrix for v1. The preliminary
   `administrator|sales|licensing|designer` list in shared-db#3298 is a
   proposal only and is **not** authorized; do not implement it in the first
   promotion.
3. Direct browser table writes remain denied. All eight actions go only through
   the governed RPCs. Manual Operations uses the same RPCs whether Jev is on or
   off.
4. Jev accept/dismiss re-authorizes the stored action class independently of
   comment ownership at call time. Even an administrator cannot accept or
   dismiss another requester's suggestion.
5. A failed role check is a bounded denial with no existence leak and no
   business write.

## Widening the matrix

Any grant to `sales`, `licensing`, `designer`, or any new role requires **both**:

1. a **new evaluated release** — new quality manifest / release digest and a
   wholly new disjoint evaluation under the frozen protocol
   (`docs/verification/jev-activity-triage/protocol.md`), because class-specific
   display/creation authority is a quality-manifest input; **and**
2. a **separate governed shared-db change** — branch + PR + timestamped
   migration in `u2giants/shared-db` that updates the RLS policies and RPC
   checks to the newly approved role × action × business-unit matrix.

Until both land and pass preview, matrix v1 is authoritative. Do not widen
grants in migration A / the first #3298 promotion.

## Locked reviewer path (2026-09-23)

The administrator-only write boundary is the reviewed and locked pilot-v1
authorization target. Source path locked 2026-09-23 with issue
[poppim-web#9](https://github.com/u2giants/poppim-web/issues/9) and
`plan_jev_activity_triage.md` STATUS / owner decision 5. shared-db#3298's
qualification hold (2026-09-22) independently requires the owner-approved
role/action/business-unit matrix before any non-admin grant and preserves
current administrator-only writes until that decision. This file freezes that
boundary as **admin-only matrix v1**.

Companion execution brief:
[`shared-db-3298-brief.md`](shared-db-3298-brief.md).

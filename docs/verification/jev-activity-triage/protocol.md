# Jev real-evaluation protocol (frozen)

Protocol version: `poppim-jev-eval-protocol-v1`

Status: **frozen for synthetic proof only**. This document and
`shared/jev-activity-triage/protocol.mjs` define the real-evaluation protocol
that Step 4 must execute against the private shared-db store. No real comments
were read, labeled, or sent while freezing it. Invented fixtures only.

English-only: the first release admits `en` only. Unsupported, mixed, uncertain,
or too-short text is terminal `blocked_unsupported_language` and is never
relabeled `unclear`.

## Splits

Two time/group-disjoint frames: `calibration` and `natural_holdout`.

- Groups are formed by any shared `product`, `thread`, `template`, or `near_dup` key.
- Every group stays **wholly** in one split. A group is never split to meet counts.
- Group-to-split assignment is deterministic from a committed seed (`assignGroupsToSplits`).
- Calibration holds at least 120 older-window comments and is capped at 300
  provider calls per candidate.
- The later natural-holdout pool is keyed-randomly sampled (up to 500 uniformly,
  or all when 300–499).
- Exclusions are frozen and counted before sampling: synthetic/test IDs,
  deleted/inaccessible rows, null/system authors, non-`internal` visibility,
  non-product targets, language-gate failures, users lacking the full launch
  permission predicate (comment plus review/create for **all three** action
  classes), and non-human/imported rows.
- No filtering by keywords, predicted class, or model outcome.

## Replacement policy

- Cap: **10% of the target size** (`floor(target * 0.1)`). Exactly 10% is allowed;
  more than 10% is not.
- The next candidate must belong to the **same split**. Groups never move across
  splits.
- If a case is deleted/inaccessible/source-changed **before any label is
  submitted**, mark it unavailable and take the next same-split candidate.
- If any case changes **after either A/B label submission**, invalidate the
  **entire dataset version** and generate a new time window, manifest, case IDs,
  label submissions, and holdout. No partial relabel/reuse.
- Replacements above 10% also invalidate the entire dataset version.
- All skips/replacements are hashed and reported.

## Labeling rubric (frozen)

Primary-intent precedence:

1. `decision` — explicit recorded decision
2. `blocker_dependency` — explicit condition preventing progress
3. `follow_up_reminder` — explicit future follow-up/request
4. `routine_update` — routine progress update

`unclear` is used only when context is missing, no intent fits, **multiple
independent actionable intents** exist without an explicit primary, or no single
intent is explicitly primary. Two English-fluent business labelers label every
case in isolated sessions without model output or the other label. After both
sealed items freeze: raw agreement ≥85% and Cohen's κ ≥0.70 overall, plus
one-vs-rest κ ≥0.60 for each of the three action classes; failure means revise
the rubric and label a newly frozen corpus. A third reviewer adjudicates
disagreement/ambiguous cases only, identities removed, label order randomized.

## Confirmatory protocol (max two candidates)

- **At most two preregistered candidates** (`MAX_CONFIRMATORY_CANDIDATES = 2`).
  Candidate 1 runs once on holdout version 1. If it fails, reject it and allow
  one materially new candidate on a wholly new later window/manifest/labels.
  Candidate 2 is final; failure stops the pilot.
- **One send per holdout case. No retry**, no status lookup, no outcome-based
  replacement.
- Every case stays in the **denominator**. Pre-send local rejection is
  `blocked_sensitive_input`. Transport/timeout/429/5xx, ambiguous response,
  invalid schema/model/usage, or lost completion is `provider_failure`.
- Blocked / provider-failure / suppressed are **no-action predictions**:
  false negatives against actionable truth, true negatives otherwise.
- Candidate release **fails if provider failures are ≥2%** or any case is
  dropped/unresolved.
- Calibration may retry only under a separately logged calibration ID within its
  300-call cap; no calibration outcome enters confirmatory metrics.
- Family-wise false acceptance is controlled at 5% via one-sided 97.5% clustered
  lower bounds (Bonferroni across the maximum two looks). The aggregate report
  names both attempts, including failures.

## Metrics equations (frozen)

Actionable classes: `blocker_dependency | decision | follow_up_reminder`
(`ACTIONABLE_CLASSES`, order is part of the manifest).

No-action predictions: `routine_update | unclear | suppressed |
blocked_sensitive_input | blocked_unsupported_language | provider_failure`.

For each actionable class `c`:

- `TP_c` = count of `truth = c ∧ prediction = c`
- `FP_c` = count of `prediction = c ∧ truth ≠ c`
- `FN_c` = count of `truth = c ∧ prediction ≠ c` (includes all no-action predictions)
- `precision_c = TP_c / (TP_c + FP_c)` (null when denominator is 0)
- `recall_c = TP_c / (TP_c + FN_c)` (null when denominator is 0)

A wrong actionable class is one false positive for the predicted class and one
false negative for the true class.

Micro (summed over the three actionable classes):

- `precision_micro = ΣTP / (ΣTP + ΣFP)`
- `recall_micro = ΣTP / (ΣTP + ΣFN)`

Per-class precision **and** recall are reported only when the class has at least
**60 adjudicated true cases and 60 predictions** (`PER_CLASS_MIN_N = 60`).

Exact-label confusion: 5×N matrix, rows = adjudicated truth (`routine_update`,
`blocker_dependency`, `decision`, `follow_up_reminder`, `unclear`), columns =
prediction value (those five kinds plus `suppressed`,
`blocked_sensitive_input`, `blocked_unsupported_language`, `provider_failure`).
Exact-label match requires `truth === prediction` among kind labels.

Launch gates on the uniform natural holdout:

- micro precision ≥95% with clustered one-sided 97.5% lower bound ≥90%
- micro recall ≥75% with clustered 97.5% lower bound ≥65%
- for each of the three classes with ≥60 truths and ≥60 predictions:
  precision ≥95% / lower bound ≥90% and recall ≥75% / lower bound ≥65%

Ordinary Wilson intervals are descriptive only and never gate.

Clustered bootstrap (frozen): for each replicate draw one mean-one Poisson weight
per requester and one per product from the committed seed/domain; each comment's
weight is `requester_weight * product_weight`. Generate exactly **9,999**
non-degenerate replicates, advancing the counter past any zero metric
denominator.

Other measured quantities: abstention/coverage, schema-validity rate,
blocked-redaction rate, p50/p95 latency, input tokens, provider failures, and
projected cost at 100/1,000/10,000 comments (cost is projected from validated
usage and a pinned pricing snapshot; this protocol freezes **no US-dollar
ceilings** — owner waived them for the synthetic harness).

## Limits (no US-dollar ceilings)

| Limit | Value |
|---|---|
| Worker concurrency | 2 |
| Environment / 24h | 250 requests, 250,000 tokens |
| Profile / 24h | 50 requests, 50,000 tokens |
| Eligible comment limit | 1,000 comments **or** 30 days (whichever first) |

These match `buildQualityManifest()` in `shared/jev-activity-triage/contract.mjs`.

## What this freeze does **not** do

- No real comment corpus, IDs, labels, or model results are created or read.
- No provider/network call, credential, or secret.
- No shared-db schema/RPC/RLS work (Step 4 / shared-db#3298).
- Not pilot acceptance, privacy approval for real text, or authorization to deploy.

## How to verify

```bash
node --test scripts/jev-activity-triage/*.test.mjs
node scripts/jev-activity-triage/protocol-dry-run.mjs
```

Invented fixtures: `fixtures/jev-activity-triage/protocol-cases.jsonl` (rubric +
metrics + confirmatory) and `fixtures/jev-activity-triage/synthetic.jsonl` (Step 2).

Related: `docs/verification/jev-activity-triage/README.md`,
`plan_jev_activity_triage.md` Step 3.

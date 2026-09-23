# Jev activity-triage synthetic evaluation harness

Invented synthetic fixtures and pure Node ESM checks only.

## How to run

From the repository root:

```bash
node --test scripts/jev-activity-triage/*.test.mjs
```

or

```bash
npm run test:jev-contract
```

Synthetic dry-run (redact → language gate → optional mock decision → validate):

```bash
node scripts/jev-activity-triage/evaluate.mjs
```

Aggregate suite (Vitest app tests + this contract suite):

```bash
npm test
```

`evaluate.mjs` prints aggregate counts only and exits non-zero on any fixture failure.

## What is proven

- `shared/jev-activity-triage/contract.mjs` enforces the closed five-way kind labels,
  enabled action classes, strict decision schema (unknown keys/labels rejected),
  probability-sum tolerance, confidence in `[0,1]`, pinned model match, and consistent
  integer usage.
- `redact.mjs` deterministically replaces emails, URLs, UUIDs, phones (NA + international),
  UNC/Windows/Unix/cloud paths, account-like IDs, low-entropy long tokens, secrets, and
  configured business-name dictionary terms with typed placeholders.
- `detectBlockedSecret` rejects API key/password/bearer/PEM/connection-string patterns,
  hex API tokens, and high-entropy long tokens before any network path.
- `languageGate` returns only `english_eligible` or terminal `blocked_unsupported_language`
  (never relabeled `unclear`).
- `canonicalize.mjs` produces sorted-key canonical JSON, SHA-256 hex, HMAC-SHA-256
  length-prefixed input digests (never a raw text SHA), base64url HMAC evaluation case IDs,
  and the quality-release digest.
- `safeResponse.mjs` requires 2xx, `application/json` (+utf-8), identity/absent
  `Content-Encoding`, ≤16 KiB, duplicate-key-rejecting JSON parse, then decision
  validation. Failures map only to the local `ERROR_CODES` enum and never return raw
  provider bodies.
- Committed `golden-vectors.json` pins invented expected outputs for redaction, blocking,
  language, normalization, validation, canonicalization, digests, and case IDs.
- Each suite includes a broken-vector case that must fail, proving stale/wrong vectors are
  discovered rather than silently skipped.
- `fixtures/jev-activity-triage/synthetic.jsonl` covers all five kinds, blocked secrets,
  unsupported languages, and redaction targets (18 invented cases).

## What is NOT proven

- No real comment corpus, real IDs, real business names, or real customer text was read,
  labeled, or sent anywhere.
- No TypeSafe/provider network call is made. There is no credential, gateway, or live model.
- No shared-db schema, RPC, RLS, or migration work is included here (that is Step 4 in
  `u2giants/shared-db`).
- No production/preview deployment, Auth signing proof, rate-limit ledger, or UI review
  flow is exercised.
- Dollar ceilings are omitted from the quality manifest per the owner waiver for this
  synthetic harness; a production release manifest must still record owner-fixed ceilings
  before any real provider send.
- Language detection is a local English heuristic stand-in, not a pinned offline
  language-detector package/model hash.
- This evidence is not pilot acceptance, privacy approval for real text, or authorization
  to deploy.

## Related

- Implementation plan: `plan_jev_activity_triage.md` Step 2
- Planning baseline (pre-Jev): `docs/verification/jev-activity-triage/planning-baseline.md`

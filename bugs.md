# Jev opportunity audit

Audit date: 2026-09-20  
Repository baseline: `c140dfe`  
Scope: all 88 application-owned TypeScript/TSX files and all 17 application API modules. Generated UI, generated database types, build output, dependencies, and the read-only `shared-db` mirror were excluded.

## Verdict

Do not add Jev broadly to this application. There are no current AI/model calls to replace, and this repository is a browser-only React application with no safe place to keep a Jev API key. The app's exact rules, database queries, permissions, dates, counts, and state changes are better left as deterministic code.

Jev is worth a small shadow-mode pilot for one bounded classification task. The best business fit is to read a product comment or update and propose whether it represents an urgent issue, blocker/dependency, decision, reminder/follow-up, revision, approval, or routine update. Staff must confirm before any record is created or changed.

## What Jev is

Jev is TypeSafe AI's early-access “System One” decision model. It does not write prose. An application sends text or structured state plus closed questions; Jev returns a predefined Choice, Score, or yes/no probability with confidence information. This makes it suitable for fast classification, routing, scoring, and verification where the allowed answers are known in advance.

The vendor lists direct pricing at $0.042 per million input tokens with unmetered output. At that rate, 10,000 classifications averaging 1,000 input tokens would cost about $0.42. TypeSafe reports 70–500 ms latency and large speed/cost gains, but those are vendor-run results. Jev launched on 2026-09-15 and remains early access, so its stability and real accuracy need to be proven on POP's own examples.

“No hallucinations” means Jev cannot invent an answer outside the supplied schema. It can still confidently select the wrong valid answer. Confidence thresholds and human confirmation remain necessary.

Sources:

- [Official introduction](https://docs.typesafe.ai/introduction)
- [Choice, Score, and Noul primitives](https://docs.typesafe.ai/primitives)
- [Confidence guidance](https://docs.typesafe.ai/confidence)
- [Launch, performance claims, caveats, and pricing](https://typesafe.ai/blog/introducing-system-one-models-and-jev)
- [Official JavaScript/TypeScript SDK](https://github.com/typesafe-ai/typesafe-sdk-js)
- [Privacy policy](https://typesafe.ai/legal/privacy-policy)

## HIGH — a direct frontend integration would expose the credential

Evidence: `docs/architecture.md:5-14`, `src/lib/supabase.ts:4-16`, `package.json:17-37`  
Confidence: high

This repository builds a static browser application. The official SDK requires a secret `TYPESAFE_API_KEY` and Node 20 or newer; putting that key in Vite/browser code would expose it to every user. There is also no existing AI gateway or server runtime in this repository.

Any pilot therefore needs an authenticated server-side boundary such as a Supabase Edge Function or an existing protected worker. That boundary must verify the signed-in user, limit which fields leave Supabase, enforce timeouts/rate and spend limits, validate the returned shape, and fail without blocking the normal workflow. Persistent AI fields or a new database contract would be governed work in the canonical `shared-db` repository.

## MEDIUM — product activity can become proposed workflow actions

Evidence: `src/features/product-detail/ActivityFeed.tsx:52-120`, `src/features/product-detail/OperatingPane.tsx:35-70`, `src/features/operating/api.ts:45-85`  
Confidence: high

Comments and imported updates are unstructured text. Staff currently retype the same information separately as dependencies, decisions, or reminders. Jev could classify a new comment as one of:

- routine update
- urgent issue
- blocker/dependency
- decision
- follow-up/reminder
- revision request
- approval
- unclear / needs review

The UI could then offer a one-click proposed action with the model version, confidence, and source comment shown. It must never create the record automatically. This is the best value pilot because it reduces duplicate entry while preserving the existing authoritative write paths.

## MEDIUM — Control Room attention triage can use semantic signals

Evidence: `src/features/control-room/api.ts:45-55`, `src/domain/products/adapters.ts:173-180`, `src/domain/products/adapters.ts:189-196`  
Confidence: medium-high

The Control Room currently relies on explicit priority, blocker, waiting-on, owner, and evidence fields. Those exact fields should stay authoritative. Jev could separately flag descriptions or recent updates that appear urgent, blocked, waiting externally, missing a decision, or missing evidence even when the structured fields were not updated.

Use the result only as a “possible attention needed” suggestion. Measure precision against historical staff decisions before displaying it, and do not let Jev change priority, risk, owners, dates, or lifecycle state.

## MEDIUM — revision and submission intake can be routed into fixed buckets

Evidence: `src/features/workflow/api.ts:59-130`, `src/features/workflow/api.ts:149-159`, `src/features/workflow/api.ts:181-194`  
Confidence: medium-high

Revision bodies, submission response summaries, sample notes, and revision reasons are natural-language inputs with bounded operational outcomes. Jev could propose a revision type, responsible role, urgency band, or “waiting externally / ready for review / needs clarification” flag.

Status and assignment writes must remain manual. Jev cannot create a reliable free-form summary, resolution note, or due date.

## LOW — product category is a safe evaluation task, but low business value

Evidence: `src/domain/products/adapters.ts:74-92`, `src/domain/products/types.ts:5-15`, `src/domain/products/adapters.ts:212-213`  
Confidence: high

Product category is currently inferred by keyword rules into ten fixed display categories. Jev could classify ambiguous titles/product types into the same closed set. Because this category mainly affects presentation, it is the safest place to test accuracy, but it is not valuable enough to justify a live API call per card.

If used, run it as a server-side batch or one-time evaluation, cache the result, and retain `unknown` below the chosen confidence threshold. Do not call Jev while rendering the pipeline.

## LOW — stage or workflow-template suggestions are possible but riskier

Evidence: `src/features/product-detail/ProductDetailModal.tsx:266-274`, `src/features/operating/api.ts:101-113`  
Confidence: medium

Jev can choose among known stages or templates from a bounded product state. The suggestion may help a user, but stage movement affects the real workflow. Existing database rules and staff judgment must remain authoritative, with explicit confirmation and a visible explanation of the input used. This should not be the first pilot.

## Where Jev will not help

- Runtime validation and cursor decoding. Unchecked casts and decoded JSON in `src/lib/supabaseQuery.ts:70-80`, `src/components/Sidebar.tsx:160-166`, `src/auth/auth.tsx:63-70`, `src/features/notes/api.ts:23-25`, and `src/features/workflow/api.ts:42-45` need generated types or a deterministic schema validator, not AI.
- Database search, filters, keyset pagination, counts, date math, permissions, RLS, status transitions, and other exact rules.
- Prose generation: summaries, comments, next-action wording, decision notes, and resolution notes. Jev does not generate text.
- Autonomous writes or irreversible actions. A type-correct answer can still be wrong.
- Image or licensed-art analysis. Jev's present interface is text/structured state, and licensed/customer data needs contractual privacy clearance before it leaves POP systems.

## Recommended pilot and acceptance gates

1. Build an offline, labeled set of historical comments/updates with the seven proposed activity classes plus `unclear`. Remove secrets and minimize customer/licensor data.
2. Run Jev in shadow mode through a server-side harness. Pin the exact model version and record input hash, output probabilities, confidence, latency, and cost.
3. Choose thresholds from POP's own data. Require at least 95% precision for any class shown as a suggestion; send everything else to `unclear`. Track coverage separately so a safe but useless threshold is visible.
4. Complete vendor/security review first. TypeSafe says customer input is not used to train models, but it may process telemetry and retain data as reasonably necessary, with processing in the United States.
5. Only after the offline gate passes, add an optional suggestion beside a newly posted comment. Never block comment posting; never auto-create or auto-update a business record; preserve the normal app when Jev is unavailable.

Inference cost is negligible. The real cost is the secure backend boundary, representative labels, privacy review, monitoring, and ongoing calibration. That is why one measured pilot is justified, but a broad integration is not.

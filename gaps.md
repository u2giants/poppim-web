# Poppim Web Gaps — Reconciled Current State (2026-06-21)

> **This is the reconciled, current-state version of the gap analysis.** It began as an aspirational gap analysis of the app vs. the business's needs. On **2026-06-21** every item was re-checked **line-by-line against the live codebase** and tagged `DONE` / `PARTIAL` / `OPEN` / `OBSOLETE` with file-path evidence. Treat this as the authoritative "what's built vs. what's still missing" reference.
>
> - For the original aspirational roadmap/spec, see `docs/architecture-update-implementation-plan.md` (kept for historical reference; that doc points back here for current status).
> - Backend is migrating to a shared **Supabase** database — see `shared-db/AGENTS.md` and `AGENTS.md` §15.
>
> **Legend:** `DONE` = built & verified · `PARTIAL` = partially built · `OPEN` = not built · `OBSOLETE` = the premise no longer applies.

**Scope of the original analysis.** Compared the `poppim-web` frontend against what the business actually needs (offers/projects, SKUs/style numbers, designs, design collections, licensor submissions, buyer selections, samples, POs/orders, revisions, compliance artifacts, factories, account rules, lifecycle states), drawing on the codebase and the Directus backend docs.

**Headline (2026-06-21).** The app has moved decisively past the prototype the original doc critiqued: all mock data and the `MockTask` abstraction are gone, every production screen reads real Directus data through a domain-organized API layer, POP/Spruce are hard-separated, and first-class screens exist for projects, designs, collections, submissions, samples, revisions, orders, accounts, reports, control room, and My Work. Remaining work is mostly **architectural maturity** (router, modal decomposition, broader search/filter, server pagination, louder error handling) and the **automation/intelligence layer** (stage-history logging, SLA/stuck alerts, role-named cockpits, reuse/turnaround analytics), plus the looming Directus→Supabase migration.

---

## 1. Current Fit Summary

The fit summary is mostly historical narrative. Reconciling the few falsifiable claims:

### 1.1 What the current app already does well

Original: lists existing strengths (session auth, real pipeline/projects data, evidence-preserving modal, UI shell, builds).
**Status (2026-06-21):** DONE
**Evidence:** Session auth in `src/lib/directus.ts` (`authentication('session', …)`); real data in `src/features/pipeline/api.ts`, `src/features/projects/api.ts`; modal at `src/components/TaskDetailModal.tsx`. AGENTS.md §15 confirms build/deploy live at `pm.designflow.app`. Note: the lint "no errors" claim is stale — `npm run build` is the gate (`tsc -b && vite build`).

### 1.2 What the current app is primarily optimized for

Original: claims the app is optimized only for a thin "products by stage / search / drag" slice.
**Status (2026-06-21):** OBSOLETE
**Evidence:** Scope has expanded well beyond this slice — `src/features/` now has control-room, mywork, designs (library + collections), submissions, samples, revisions, orders, accounts, reports. The "only a slice" framing no longer holds.

### 1.3 What the real business needs instead

Original: enumerates the questions the system must answer (object type, business line, owner, evidence, lifecycle, reuse).
**Status (2026-06-21):** PARTIAL
**Evidence:** Object types, hard POP/Spruce (Licensed/Generic) separation, lifecycle/next-action/waiting-on, and a reusable design library are now modeled (`src/domain/products/types.ts`, `src/domain/products/adapters.ts`, `src/features/designs/`).
**Remaining:** "Required evidence to move" and role-driven "who acts now without a PM pushing" are not enforced — no stage gates, no SLA/staleness alerts.

---

## 2. Critical Product/Business Gaps

## 2.1 The app still flattens business objects into "tasks"

Original gap: real Directus rows were flattened into a generic `MockTask` via `pipeline/adapter.ts`, losing business-object shape.
**Status (2026-06-21):** DONE
**Evidence:** `MockTask` and `src/features/pipeline/adapter.ts` are gone (grep for `MockTask` across `src/` returns nothing). The board/detail view model is now `ProductSummary` in `src/domain/products/types.ts`, adapted from raw Directus in `src/domain/products/adapters.ts`. Distinct object models exist across feature areas. AGENTS.md §11 documents the removal.

## 2.2 POP and Spruce are not separated enough

Original gap: pipeline only filtered `stage _nnull` with no business-unit split; one mixed board.
**Status (2026-06-21):** DONE
**Evidence:** `BusinessUnit = 'Licensed' | 'Generic' | 'Software'` in `src/domain/products/types.ts`; hard-separated departments (no `All`) enforced via alias logic in `src/domain/products/adapters.ts` and each feature `api.ts`. Topbar tabs switch department and clear list filters (`src/components/Topbar.tsx`). AGENTS.md §11 ("Departments are hard-separated").

## 2.3 The design library is absent from the frontend

Original gap: `design` collection existed in backend but had no frontend nav/types/views/workflows.
**Status (2026-06-21):** PARTIAL
**Evidence:** `src/features/designs/DesignLibraryPage.tsx` + `api.ts`; sidebar "Design library" (`src/components/Sidebar.tsx`); status badges, grouping by status, `first_offered_to` shown, card view, search/views integration.
**Remaining:** No write actions — no "convert design to SKU/product," no "re-offer to another project/account," no restriction-flag flow; likely no full detail page with offered-to/picked-by history.

## 2.4 Design collections are absent from the frontend

Original gap: `design_collection` (Spruce) existed in backend but not exposed.
**Status (2026-06-21):** PARTIAL
**Evidence:** `src/features/designs/DesignCollectionsPage.tsx` + sidebar "Design collections" entry read `design_collection` from Directus.
**Remaining:** Conversion of selected designs into account projects / style-numbered products and account-specific branch/general-presentation views not confirmed (read-only listing observed); verify whether buyer-feedback and conversion-history are surfaced.

## 2.5 Lifecycle state is missing or under-modeled in the frontend

Original gap: only stage was shown as status; no lifecycle states.
**Status (2026-06-21):** PARTIAL
**Evidence:** `lifecycleState`, `closureReason` on `ProductSummary` (`src/domain/products/types.ts`); lifecycle rendered on cards (`src/components/PimTaskCard.tsx`) and editable in `src/components/TaskDetailModal.tsx`; closure-reason aggregation in `src/features/reports/api.ts`.
**Remaining:** No first-class lifecycle filters/badges, no active-vs-inventory boards, no cancellation/closure flow with reason-code capture, no parked/review-later queues, no dormant-concept alerts.

## 2.6 The app lacks role-specific operating views

Original gap: only generic nav; most role needs unrepresented.
**Status (2026-06-21):** PARTIAL
**Evidence:** Role-oriented screens exist: Control room (`src/features/control-room/ControlRoomPage.tsx`), My work (`src/features/mywork/MyWorkPage.tsx`), Submissions, Samples, Reviews/revisions, Orders, Accounts, Reports.
**Remaining:** These are general dashboards, not per-persona cockpits (Jessica/Liz/Jen/Adam, designers, sourcing, licensing, production). No login-role gating of views.

## 2.7 The main pipeline does not show true next action or owner

Original gap: cards showed only stage — no next owner/action/blocker/time-in-stage.
**Status (2026-06-21):** PARTIAL
**Evidence:** `PimTaskCard.tsx` renders `lifecycleState · nextAction · Waiting on {waitingOn}` and assignee avatars. `ProductSummary` carries `nextAction`, `waitingOn`, `blockerReason`, `riskLevel`.
**Remaining:** Cards do NOT show days-in-stage/elapsed time, blocker reason, last-meaningful-update, or SLA/risk badge. "Required evidence to move" not shown.

## 2.8 Stage movement has no business gates

Original gap: drag updates `product.stage` directly with no evidence checks.
**Status (2026-06-21):** OPEN
**Evidence:** `src/features/pipeline/PipelinePage.tsx` `onDragEnd` → optimistic write, reverting on error. No transition dialog, required-field check, soft warning/hard gate, or move-reason capture.
**Remaining:** Entire move-guard system — soft warnings, hard compliance gates, transition dialog with required fields, role-aware moves, reason capture, batch validation.

## 2.9 Stage history/SLA is not surfaced

Original gap: `stage_history` exists in backend but frontend shows no time-in-stage, history timeline, SLA, or projected completion.
**Status (2026-06-21):** PARTIAL
**Evidence:** `stage_history` is read in `src/features/reports/api.ts` and surfaced as "recent handoffs" (last 30, per business unit); `StageHistory` type in `src/lib/types.ts`.
**Remaining:** No days-in-current-stage, no per-item stage-history timeline in `TaskDetailModal.tsx`, no SLA targets / on-track-at-risk-overdue status, no projected completion, no bottleneck dashboard, no stage-aging filters.

## 2.10 Product detail omits many business-critical fields

Original gap: the product modal was a generic task modal missing SKU, project/offer link, retailer/buyer, season, property, product type, factory, BA/PI, samples, orders, pricing, etc.
**Status (2026-06-21):** PARTIAL
**Evidence:** `src/components/TaskDetailModal.tsx` renders/edits licensor, product type, retailer, buyer, PPS-requested date, lifecycle, next action, waiting-on, risk, plus `Factory` and `Brand Assurance / PI` fields, a department-aware header, and create-submission/sample/revision actions. Reference data fetched live.
**Remaining:** No first-class SKU/style-number field, project/offer link, season, packaging/put-up, BA PDF/licensing-sheet/packaging files, submission/response history, sample status, PO/order history, closure/reuse state, or role-gated pricing. Still a task-shaped panel.

## 2.11 Projects page is real but not operationally rich

Original gap: Projects showed only basic fields; missing buyer, season, owner, next action, risk, roll-ups, batch actions, notes.
**Status (2026-06-21):** PARTIAL
**Evidence:** `src/features/projects/ProjectsPage.tsx` + `api.ts` add Buyer and PPS columns, a Design Collection field, brief/restrictions in the modal, and linked products carrying stage/licensor/property/product_type/factory.
**Remaining:** Still missing season, licensor/property roll-up, owner, next action, risk, lifecycle, selection PDF, account rules, buyer feedback, project files/notes/comments, timeline, child-stage roll-ups, batch actions, CRM/order context, and project board/report views.

## 2.12 My Work is mock data

Original gap: `MyWorkPage` hardcoded a current user and filtered mock tasks.
**Status (2026-06-21):** DONE
**Evidence:** `src/features/mywork/MyWorkPage.tsx` reads the signed-in user via `useAuth()` and calls `fetchMyWorkProducts`/`fetchMyRevisionWork`. `src/features/mywork/api.ts` queries `product_assignee`, lifecycle-owned products, and assigned revisions — no mock data (`src/lib/mockData.ts` deleted).

## 2.13 Schedule is mock data

Original gap: `SchedulePage` used static week days and mock task lists.
**Status (2026-06-21):** PARTIAL (mock removed; real implementation not built)
**Evidence:** `src/features/schedule/SchedulePage.tsx` is a placeholder stating the mock calendar was removed and a real schedule will use shelf/PPS/sample/factory/follow-up/SLA dates.
**Remaining:** No real schedule yet — empty placeholder, not wired to any date sources.

## 2.14 Notes is mock data and should not become another silo

Original gap: `NotesPage` displayed static mock notes.
**Status (2026-06-21):** PARTIAL (mock removed; object-attached notes not built)
**Evidence:** `src/features/notes/NotesPage.tsx` is a placeholder explaining notes will become object-attached records.
**Remaining:** No object-attached notes implemented; page is informational only.

## 2.15 People page is mock data

Original gap: `PeoplePage` displayed fake people from `mockData`.
**Status (2026-06-21):** PARTIAL (mock removed; real version not built)
**Evidence:** `src/features/people/PeoplePage.tsx` is a placeholder noting mock cards were removed and the real view will use Directus users/roles/assignments.
**Remaining:** Not wired to real Directus users/roles/workload; still a placeholder.

## 2.16 Settings page is local-only and misleading

Original gap: Settings used mock licensors/customers and stored logos only in React state.
**Status (2026-06-21):** DONE (repurposed) / OBSOLETE as described
**Evidence:** `src/features/settings/SettingsPage.tsx` + `api.ts` no longer touch mock master data or logo data-URLs; the page now manages real Directus `pm_saved_view` records.
**Remaining:** It is now a saved-views screen, not a master-data admin. Full reference-data management (retailer/buyer/licensor/property/factory/product_type/season/stage) is net-new scope if still wanted.

## 2.17 The Add New button is nonfunctional and underspecified

Original gap: Topbar had a no-op `Add new` button.
**Status (2026-06-21):** DONE (removed)
**Evidence:** No "Add new"/plus creation button exists in `src/components/Topbar.tsx` or anywhere under `src/`. The richer object-type creation launcher proposed in the gap was not built, but the dangerous no-op button is gone.

## 2.18 Licensor filter uses static mock list

Original gap: filter used `LICENSORS` from `mockData` mapped via a hardcoded object.
**Status (2026-06-21):** DONE
**Evidence:** `src/domain/reference/api.ts` `fetchLicensors()` reads the Directus `licensor` collection (with turnaround/PI/resale metadata). `src/features/pipeline/api.ts` filters server-side by licensor **id** (`licensor: { id: { _in: licensorIds } }`). No `LICENSORS`/`mockData` references remain.

## 2.19 Category is inferred from product title

Original gap: `inferCategory()` guesses category from title regexes instead of a real product-type field.
**Status (2026-06-21):** PARTIAL
**Evidence:** `src/domain/products/adapters.ts` still runs `CATEGORY_KEYWORDS` regexes, but now seeds them from `product_type` first and returns `'unknown'` when nothing matches. The real `productTypeName` is carried through and shown in cards/modal.
**Remaining:** `category` is still keyword-inferred rather than driven purely off the `product_type`/category relation; prefer `productTypeName` as source of truth and drop regex inference.

## 2.20 Assignees are not shown on cards/table

Original gap: adapter set `assignees: []`; avatars came from mock people.
**Status (2026-06-21):** DONE
**Evidence:** `src/domain/products/rollups.ts` (`hydrateProductSummaryRollups`) batch-fetches `product_assignee` and maps real Directus users onto each `ProductSummary`; called by `src/features/pipeline/PipelinePage.tsx`. Cards render avatars (`src/components/PimTaskCard.tsx`); table shows assignee names.

## 2.21 Checklist/comment/file counts are zeroed on cards

Original gap: adapter set checklist/comment/file indicators to 0.
**Status (2026-06-21):** DONE
**Evidence:** `src/domain/products/rollups.ts` overwrites the zero defaults with real aggregates: `checklist_item` (total + done), `product_file` count, and `readComments` on `collection=product`. Cards render the counts (`src/components/PimTaskCard.tsx`).
**Remaining:** Open-revision count and "missing required artifacts" count are not surfaced (see 2.29/2.30).

## 2.22 Imported ClickUp metadata is too visible

Original gap: modal prominently showed ClickUp list/dates/original-task link.
**Status (2026-06-21):** DONE
**Evidence:** `src/components/TaskDetailModal.tsx` wraps ClickUp fields in a collapsed `<details>` "Legacy source" section; main surface uses business language. Internal `product.code` removed from labels (AGENTS.md §11).

## 2.23 Notifications are fake

Original gap: topbar showed a hardcoded notification count of `12`.
**Status (2026-06-22):** PARTIAL
**Evidence:** `src/components/Topbar.tsx` no longer renders any notification icon/badge or hardcoded `12`. `pm_reminder` now exists in Directus (`directus` repo `pm-system/add-operating-model.mjs`), `src/features/operating/api.ts` can create/update reminders, the product modal Operations tab can add/complete them, and `src/features/mywork/MyWorkPage.tsx` lists open/snoozed reminders assigned to the signed-in user.
**Remaining:** No external notification delivery (email/Teams/push), mentions, or Directus Flow/worker for automatic SLA/stuck/licensor reminders.

## 2.24 Sidebar collections are fake and potentially misleading

Original gap: sidebar had hardcoded brand items; only one clickable.
**Status (2026-06-21):** DONE
**Evidence:** `src/components/Sidebar.tsx` renders real workflow nav and a Spaces section loading real saved views via `fetchViews`/`fetchViewPrefs`, grouped by department with a Master "All" view. No hardcoded brand items remain.

## 2.25 The app lacks buyer/account context

Original gap: pipeline/projects queries didn't fetch buyer/retailer/account context.
**Status (2026-06-21):** PARTIAL
**Evidence:** `src/features/pipeline/api.ts` `PRODUCT_SUMMARY_FIELDS` pulls `retailer`, `buyer`, and `project.retailer`/`project.buyer`; adapter maps them. Account screen at `src/features/accounts/`. `Retailer.resale_restriction`/`Buyer.samples_required` exist. `retailer`/`buyer` are curated tables (AGENTS.md §11).
**Remaining:** No buyer-feedback history, CRM activity feed, or account-specific rule surfaces beyond `samples_required`/`resale_restriction`.

## 2.26 The app lacks factory and sourcing context

Original gap: factory/constraints/costing/sample/China-team status not exposed.
**Status (2026-06-21):** PARTIAL
**Evidence:** `factory` is linked on products and shown as `factoryName` in `TaskDetailModal` and `src/features/samples/SamplesPage.tsx`; `Factory.china_team_contact` exists.
**Remaining:** No pricing/costing fields/status, no factory-constraint/die-line/material notes, no sourcing-blocker surface; China-team contact modeled but not displayed; no role-restriction logic for pricing.

## 2.27 The app lacks licensor submission modeling

Original gap: licensor shown only as badge/PI pill; no submission records or queues.
**Status (2026-06-21):** DONE
**Evidence:** `src/features/submissions/SubmissionsPage.tsx` + `src/features/workflow/api.ts` model `product_submission` (submission_type, recipient_type, BA number/file, portal_url/reference, response_at/summary, revision_required, linked revision). Status queue ready→submitted→waiting→changes_requested→approved/rejected.
**Remaining:** "Overdue by licensor turnaround", "missing BA", "missing PI" derived queues aren't explicit filters (raw fields exist).

## 2.28 The app lacks order/PO history

Original gap: no `order`/PO history exposed.
**Status (2026-06-21):** PARTIAL
**Evidence:** `src/features/orders/api.ts` queries the `order` collection; `OrdersPage.tsx` renders the history table sorted by `-order_date`.
**Remaining:** Read-only ledger; no reuse-history surface, no role-restricted value/pricing, no "approved concept but no PO / dormant" linkage.

## 2.29 The app lacks revision workflows

Original gap: no structured revision request/response workflow.
**Status (2026-06-21):** DONE
**Evidence:** `src/features/revisions/RevisionsPage.tsx` + `src/features/workflow/api.ts` model `revision_request` (source, requested_by, requested_at, assigned_to, due_at, markup_file, resolution_note, polymorphic link). Statuses open→in_progress→resolved/accepted/rejected/canceled. Created from `TaskDetailModal`.

## 2.30 The app lacks evidence-completeness checks

Original gap: no completeness checklist gating stage transitions or review queues.
**Status (2026-06-22):** PARTIAL
**Evidence:** Manual per-product checklists exist (`checklist_item`, `collab.ts`) and individual fields exist (`pi_status`, `brand_assurance_number`, sample `photo_urls`). `src/domain/products/adapters.ts` now computes `evidenceGaps` for key product context gaps; Control Room and Reports surface missing-evidence counts. `pm_workflow_template.required_evidence_json` exists for future reusable evidence rules.
**Remaining:** No pre-transition validation or template-driven rule engine that blocks/flags stage moves by required evidence.

## 2.31 User permissions are not reflected in frontend UX

Original gap: no role-aware navigation/dashboards/actions; pricing not hidden from designers.
**Status (2026-06-21):** OPEN
**Evidence:** Directus role is loaded (`src/auth/auth.tsx`) and used only to filter ownership in My Work / revision assignment. No screen, nav item, dashboard, or action is gated by role; no pricing-hiding logic (no pricing fields exist either).
**Remaining:** Role-based nav/dashboards/actions; backend stays source of truth.

## 2.32 The app lacks creation/conversion workflows

Original gap: no real creation/conversion flows.
**Status (2026-06-21):** PARTIAL
**Evidence:** `TaskDetailModal` can create submission/sample/revision for a product via `src/features/workflow/api.ts`; inline product field edits exist (AGENTS.md §11).
**Remaining:** No create-project/offer, convert-buyer-pick-into-SKU, record-PO (Orders is read-only), create-design-collection/account-project/selection→style-number, or pricing-request creation.

## 2.33 The app lacks batch operations

Original gap: only single-product stage movement; no batch assign/move/set/export.
**Status (2026-06-22):** PARTIAL
**Evidence:** `src/features/pipeline/PipelinePage.tsx` now has table selection state and a bulk action bar for mark waiting, set high risk, clear blocker, set next action, and set waiting-on.
**Remaining:** Bulk assign, validated stage move, date changes, note/tag, submission batches, and export.

## 2.34 The app lacks reporting and analytics

Original gap: no real dashboards beyond board/table counts.
**Status (2026-06-22):** PARTIAL
**Evidence:** `src/features/reports/api.ts` + `ReportsPage.tsx` compute stage distribution, closure-reason histogram, recent stage handoffs, totals, blocked/waiting counts, owner gaps, evidence gaps, open revisions, waiting submissions, active samples, open dependencies, open reminders, recorded decisions, and active templates. `src/features/control-room/api.ts` adds urgent/upcoming/active-project plus blocked/waiting, owner-gap, and evidence-gap surfaces.
**Remaining:** Missing stuck-by-stage-age, licensor response time, designer workload, concept-approved-no-PO, reusable-design inventory, factory/pricing & sample turnaround, cancellation-reason trends, bottleneck/seasonal-readiness analytics.

## 2.35 The app lacks AI-assistant surfaces

Original gap: no assistant UI / NL query panel.
**Status (2026-06-21):** OPEN
**Evidence:** No assistant/AI/chat/NL-query UI exists in `src/`; no LLM integration.
**Remaining:** A citing AI side panel once data surfaces are reliable.

---

## 3. Technical / Code Architecture Gaps

## 3.1 Domain code is mixed with mock/prototype code

App screens still import from `src/lib/mockData.ts`.
**Status (2026-06-21):** OBSOLETE
**Evidence:** `src/lib/mockData.ts` no longer exists; grep for `mockData`/`MockTask` returns zero hits. Schedule/Notes/People are stub pages explaining the mock removal. All production pages read Directus via per-feature `api.ts`.

## 3.2 Frontend types are a minimal hand-maintained slice

Types omit many backend fields/collections.
**Status (2026-06-22):** PARTIAL
**Evidence:** `src/lib/types.ts` now covers the product/project/design/workflow slice plus operating records (`PmDependency`, `PmDecision`, `PmReminder`, `PmWorkflowTemplate`) and the `Schema` map. Raw vs view-model is separated via `src/domain/products/{types,adapters}.ts`.
**Remaining:** Still hand-maintained, not generated from the Directus schema; raw vs UI split only exists for products.

## 3.3 API layer is not organized by domain object

APIs split around pipeline/projects/board.
**Status (2026-06-21):** DONE
**Evidence:** Domain-organized APIs exist: `src/features/{accounts,control-room,designs,mywork,operating,orders,pipeline,projects,reports,views,workflow,settings}/api.ts` plus `src/domain/{products,reference}/`. (Submissions/samples/reviews are handled by `workflow/api.ts`.)

## 3.4 Detail modal is doing too much

`TaskDetailModal.tsx` fetches and renders everything inline.
**Status (2026-06-22):** OPEN
**Evidence:** `src/components/TaskDetailModal.tsx` is still a monolith and still named `Task`. Inline editing, lightbox, comments, checklist, subtasks, files, imported fields, and operating records all live here.
**Remaining:** Rename away from `Task`; split into domain sections; add route/deep-link for object type+ID (only `?item=<uuid>` exists); no full-page detail option.

## 3.5 No client routing yet

App switches screens via internal state; deep-link is `?item=`.
**Status (2026-06-21):** OPEN
**Evidence:** No `react-router` dependency. `src/App.tsx` `ActiveScreen()` is a `switch (screen)` over `useAppState()`; deep-link is only `?item=<uuid>` (AGENTS.md §15).
**Remaining:** Adopt a router; per-object-type URLs for the screens.

## 3.6 Search is too narrow

Pipeline search hits product name/code only.
**Status (2026-06-21):** OPEN
**Evidence:** `src/features/pipeline/api.ts` `buildFilter()` only `_or`s on `name`/`code` `_icontains`. No global search across project/retailer/buyer/licensor/property/design/factory/order/BA/notes.
**Remaining:** Broaden to related fields and a global search entry point.

## 3.7 Filtering is too narrow

Pipeline filters by licensor only.
**Status (2026-06-21):** PARTIAL
**Evidence:** `buildFilter()` now supports `licensorIds`, `listNames` (ClickUp list), and `businessUnit`. `lifecycleStates` is accepted but a no-op (`void lifecycleStates`).
**Remaining:** Stage, owner, retailer, buyer, season, property, product type, factory, stage-age, risk, missing-evidence, PI, BA-missing, sample/order status — none wired; lifecycle filter is stubbed.

## 3.8 Pagination/load strategy is still incomplete

Loads 300/500 products; client-slice pagination only.
**Status (2026-06-21):** PARTIAL
**Evidence:** `fetchPipelineProducts` uses a flat `limit` (default 300); `countPipelineProducts`/`fetchListFacets` give aggregate counts; filtering + count are server-side and debounced (AGENTS.md §15).
**Remaining:** No cursor/offset server pagination, no per-column lazy loading/virtualization; deep-linked item not guaranteed in the loaded slice.

## 3.9 Error handling is too quiet

Catches `console.error` or silently clears data.
**Status (2026-06-21):** OPEN
**Evidence:** ~16 `console.error`/`console.warn` calls across `src/`. Sonner is installed (`src/main.tsx`, `src/components/ui/sonner.tsx`) but `toast(` is never called in feature code.
**Remaining:** Surface failures as toasts; distinguish permission vs empty; partial-data warnings; retries.

## 3.10 No clear "real vs legacy" boundary in UI

Modal mixes ClickUp data with PM fields.
**Status (2026-06-21):** PARTIAL
**Evidence:** `PRODUCT_SUMMARY_FIELDS` still pulls ~25 `clickup_*` fields; `TaskDetailModal` has an "imported fields" section and `product.code` was removed from titles. Business fields (lifecycle, next_action, waiting_on, risk) are first-class and inline-editable.
**Remaining:** ClickUp metadata still prominent in fetch/modal; not collapsed behind an "Imported evidence" boundary by default.

---

## 4. Extraneous or Potentially Harmful Current Elements

**Status (2026-06-21):** MOSTLY DONE
**Evidence:**
- Mock My Work / Schedule / Notes / People: My Work is real (`src/features/mywork/api.ts`); Schedule/Notes/People are honest stubs; only My Work remains in the sidebar.
- Generic "Add New": replaced — the primary topbar action is "Save view" (`src/components/Topbar.tsx`).
- Fake sidebar collections: replaced by the real saved-views tree (`src/features/views/api.ts` + Sidebar) and a real "Design collections" screen.
- Settings logo upload: `src/features/settings/SettingsPage.tsx` repurposed to saved views.
**Remaining:** Verify topbar avatar/notification elements are real or removed. ClickUp metadata prominence (§3.10) still open.

---

## 5. Things Done in the Wrong Way

### 5.1 Using `MockTask` for real products

**Status (2026-06-21):** DONE
**Evidence:** `MockTask` is gone. Pipeline uses real `Product` adapted via `src/domain/products/adapters.ts`. (The `TaskDetailModal` name persists — see §3.4 — but no longer rides on a mock type.)

### 5.2 Inferring product category from title

**Status (2026-06-21):** PARTIAL
**Evidence:** `inferCategory()` prefers `product_type` relation name first, falling back to title keywords.
**Remaining:** Category should derive purely from backend product type/category, not title keywords.

### 5.3 Hardcoding operational master data

**Status (2026-06-21):** DONE
**Evidence:** No `const LICENSORS/PEOPLE/STAGES/COLLECTIONS` arrays in `src`. Stages/licensors/properties/types come from `src/domain/reference/api.ts` and Directus relations. (Color/icon maps in `presentation.ts` are cosmetic.)

### 5.4 Treating stage as the primary truth

**Status (2026-06-21):** PARTIAL
**Evidence:** `WorkflowFields` carries lifecycle_state, next_action, waiting_on, blocker_reason, risk_level, blocked_since — surfaced/editable in modal and Control Room.
**Remaining:** Board/pipeline still stage-organized; SLA/evidence not enforced; lifecycle filter stubbed (§3.7).

### 5.5 Allowing stage moves without evidence prompts

**Status (2026-06-21):** OPEN
**Evidence:** No evidence/confirm prompts in `src/features/board/api.ts` or `PimTaskCard.tsx`; drag-to-stage writes optimistically with no BA/PI gate.
**Remaining:** Validation gates for compliance-critical transitions.

### 5.6 Building generic pages before real workflows

**Status (2026-06-21):** DONE
**Evidence:** Real workflow screens exist (Submissions, Samples, Revisions, Orders, Accounts, Reports, Control Room, My Work). Generic Schedule/Notes/People reduced to stubs.

### 5.7 Making ClickUp metadata too prominent

**Status (2026-06-21):** PARTIAL
**Evidence:** Imported fields sectioned, code removed from titles, but ~25 `clickup_*` fields still fetched and shown.
**Remaining:** Collapse legacy metadata behind an explicit imported-evidence boundary.

---

## 6. Missing Feature Inventory

### Core objects

| Item | Status | Evidence |
|---|---|---|
| Product/SKU/style-number workspace | PARTIAL | `domain/products/*`, pipeline; SKU/style-number not a distinct model |
| Project/offer workspace | DONE | `features/projects/`, `types.Project` |
| Design library | DONE | `features/designs/DesignLibraryPage.tsx`, `types.Design` |
| Spruce design collections | DONE | `features/designs/DesignCollectionsPage.tsx`, `types.DesignCollection` |
| Licensor submissions | DONE | `types.ProductSubmission`, `features/submissions`, `workflow/api.ts` |
| Buyer selections | PARTIAL | `types.Buyer` w/ samples_required; no dedicated selection object |
| Samples | DONE | `types.ProductSample`, `features/samples` |
| Pricing/factory requests | OPEN | No model; `factory` is a relation only |
| Orders/PO history | DONE | `types.Order`, `features/orders` |
| Revision requests | DONE | `types.RevisionRequest`, `features/revisions`, `workflow/api.ts` |
| Object-linked notes | OPEN | Notes page is a stub; no note model |
| Stage history | PARTIAL | `types.StageHistory` + read in `reports/api.ts`; not auto-logged on move |
| Lifecycle state | DONE | `WorkflowFields.lifecycle_state` |
| Saved views | DONE | `features/views/api.ts`, `types.PmSavedView`/`PmViewPref` |

### Core views

| Item | Status | Evidence |
|---|---|---|
| POP / Spruce pipeline | DONE | `features/pipeline` + `businessUnit` filter |
| Design library grid/table | DONE | `DesignLibraryPage.tsx` |
| Design collection view | DONE | `DesignCollectionsPage.tsx` |
| Project/offer list & detail | PARTIAL | `ProjectsPage.tsx` list; detail via modal only |
| Account/retailer view | DONE | `features/accounts/` |
| My Work real queue | DONE | `features/mywork/api.ts` |
| Jessica control room | PARTIAL | `features/control-room/` — generic, not Jessica-specific |
| Liz review queue | PARTIAL | Covered by Submissions/Revisions, not a named cockpit |
| Jen / Adam cockpits | OPEN | No role-named cockpits |
| Licensing submission queue | DONE | `features/submissions` |
| Sourcing/factory queue | OPEN | No factory queue view |
| Production approval queue | PARTIAL | Revisions/Orders cover parts; no dedicated production queue |
| Reports/dashboard | DONE | `features/reports/` |

### Core actions

| Item | Status | Evidence |
|---|---|---|
| Create submission / sample / revision | DONE | `TaskDetailModal` + `workflow/api.ts` |
| Approve/request-changes/reject review | DONE | `submissions` `updateSubmissionStatus` |
| Record BA / PI status | PARTIAL | editable fields; no guided action |
| Record sample received/sent/approved | PARTIAL | `ProductSample` + page; not all states confirmed |
| Record PO/order | DONE | `features/orders` |
| Park/reuse/cancel/complete | PARTIAL | `closure_reason`/lifecycle exist; no explicit action |
| Convert buyer pick/Spruce selection to SKU | OPEN | No conversion action |
| Record buyer feedback / pricing req+resp / factory deadline | OPEN | No models/actions |
| Batch assign/move/update/export | OPEN | Not found |
| Create POP project/offer / preliminary design | PARTIAL | Objects exist; create flows not confirmed |

### Core automations

| Item | Status | Evidence |
|---|---|---|
| Stage history logging | OPEN | `StageHistory` read-only; no write on stage move |
| All alert types (SLA/stuck, licensor due, missing BA/PI, dormant, handoff, sample/factory overdue, buyer follow-up, reuse conflict) | OPEN | No notification/automation layer; risk/blocked fields displayed only |

### Core reporting

| Item | Status | Evidence |
|---|---|---|
| Work by stage / business unit | DONE | `reports/api.ts` stageCounts + businessUnit |
| Work by retailer/buyer / licensor/property | PARTIAL | summary joins retailer/buyer/licensor; breakdowns limited |
| Work by owner/role / product type | OPEN | Not present |
| Stuck work / aging concepts | PARTIAL | risk/blocked_since exist; no dedicated report |
| Reusable inventory / designer workload / licensor turnaround / factory-sample turnaround / cancellation reasons / season readiness | OPEN | Not built |

---

## 7. Recommended Priority Order

### Priority 0: Stop misleading UI
**Status (2026-06-21):** DONE — mock pages removed/stubbed, `mockData.ts` deleted, fake sidebar collections replaced by real saved views, generic "Add New" replaced by "Save view".

### Priority 1: Replace task abstraction
**Status (2026-06-21):** PARTIAL — domain `Product` model + adapters; `MockTask` gone. Remaining: `TaskDetailModal.tsx` still named `Task` and monolithic (§3.4).

### Priority 2: Separate POP and Spruce
**Status (2026-06-21):** DONE — `appState.tsx` `businessUnit` filter drives pipeline, control-room, and reports (AGENTS.md §11).

### Priority 3: Add real My Work
**Status (2026-06-21):** PARTIAL — `features/mywork/api.ts` merges assignments + lifecycle-owned products + assigned revisions. Remaining: subtasks and explicit role-owned stage/review queues.

### Priority 4: Enrich product and project detail
**Status (2026-06-21):** PARTIAL — lifecycle/next_action/waiting_on/blocker/risk added and editable. Remaining: stage-history section (logging absent), evidence sections incomplete.

### Priority 5: Build role queues
**Status (2026-06-21):** PARTIAL — Control Room, Submissions, Revisions, My Work exist. Remaining: named cockpits (Jessica/Liz/Jen/Adam), sourcing/production queues.

### Priority 6: Build design library and Spruce collections
**Status (2026-06-21):** DONE — `DesignLibraryPage.tsx` + `DesignCollectionsPage.tsx` + `designs/api.ts`.

### Priority 7: Add submissions, samples, orders
**Status (2026-06-21):** DONE — `features/{submissions,samples,orders}` + `workflow/api.ts`/`orders/api.ts`.

### Priority 8: Add analytics and AI
**Status (2026-06-21):** PARTIAL — Reports dashboard exists. Remaining: SLA dashboards, bottleneck reports, reuse recommendations, AI assistant.

---

## 8. Final Assessment

The app has moved decisively past the prototype phase the original doc critiqued. All mock data and the `MockTask` abstraction are gone; every production screen reads real Directus data through a domain-organized API layer (`src/features/*/api.ts`, `src/domain/products`), and POP vs Spruce are hard-separated by a business-unit filter. First-class screens now exist for projects, designs, collections, submissions, samples, revisions, orders, accounts, reports, control room, and My Work, with lifecycle/next-action/owner/risk fields surfaced and inline-edited.

The remaining gaps are **architectural maturity** rather than honesty: no client router (state-switch + `?item=` only), a large `TaskDetailModal` still named "Task", narrow pipeline search/filter, no server cursor pagination, quiet error handling (sonner installed but unused), and ClickUp metadata still prominent. The biggest missing capability is **automation/intelligence** — no external notification delivery, stage-gate enforcement, SLA/stuck/handoff Flows, role-named cockpits, or reuse/turnaround reporting — plus the looming **Directus→Supabase migration** (AGENTS.md §15). Net: a solid, honest, data-backed PM tool that now has first-class operating records and needs routing, modal decomposition, gated workflows, and the automation/analytics layer to fulfill the business graph the original doc envisioned.

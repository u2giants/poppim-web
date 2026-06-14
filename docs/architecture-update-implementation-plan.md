# Architecture Update and Implementation Plan

**Purpose.** This document defines the architecture update and implementation plan required to turn `poppim-web` from a phase-one ClickUp-board replacement into the project management system POP Creations actually needs.

It is intentionally detailed. Future engineering sessions should be able to use this as a roadmap, product spec, architecture guide, and implementation checklist.

**Companion documents:**

- `../gaps.md` in this repo: detailed gap analysis of the current frontend.
- `/worksp/directus/docs/business-process.md`: how the business actually works.
- `/worksp/directus/docs/product-flow-evidence-pack.md`: evidence from ClickUp/D1/interviews.
- `/worksp/directus/docs/pm-system-design.md`: product/workflow spec for the ideal PM system.
- `/worksp/directus/docs/data-model.md`: backend schema target.
- `/worksp/directus/AGENTS.md`: backend operating guide and deployment constraints.

**Core thesis.** The application must stop being organized around generic tasks and become organized around the company's real business objects: projects/offers, products/SKUs/style numbers, designs, design collections, submissions, samples, pricing/factory requests, orders, revisions, stage history, and lifecycle state.

---

## 1. Target Product Shape

## 1.1 What this program should become

`poppim-web` should become the human operating surface for the PM/PIM domain of the POP super-app.

It should let staff:

- See what work exists.
- Understand what kind of work each item is.
- Know who owns the next action.
- Know what evidence is needed to move forward.
- Move work through business-specific flows.
- Preserve files, notes, approvals, and revision context.
- Reuse creative work that would otherwise be lost.
- Understand bottlenecks and plan seasons proactively.

It should not merely show "tasks on a board."

## 1.2 What "perfectly tailored" means here

For POP Creations and Spruce Line, "perfectly tailored" means:

1. **The app uses the company's language.**
   - Offer, SKU, style number, licensor submission, Brand Assurance, PI, PPS, style guide, design collection, buyer selection, factory sample, art sent for PO.

2. **The app respects that POP and Spruce are different businesses.**
   - POP is licensed and approval-heavy.
   - Spruce is generic/original, buyer/account-driven, and collection-heavy.

3. **The app preserves reusable creative inventory.**
   - Unpicked designs, approved-but-unsold concepts, and Spruce trend art must not disappear inside old projects.

4. **The app makes status self-explanatory.**
   - Stage alone is not enough.
   - Users need lifecycle, next action, next owner, waiting-on, blocker, due/risk, and required evidence.

5. **The app lets each role work from its own queue.**
   - Jessica should not manually push every card.
   - Liz should not hunt for sheets to review.
   - Jen should not chase status by memory.
   - Adam should not need to ask for basic buyer/account status.

6. **The app protects sensitive information correctly.**
   - Pricing is protected by backend permissions.
   - Manufacturing constraints are visible to designers even when pricing is not.

7. **The app captures proof.**
   - Files, comments, revision notes, marked-up images, NAS paths, submission numbers, sample photos, and approvals are durable records.

8. **The app supports exceptions without becoming chaos.**
   - Burlington and Hobby Lobby can have different Spruce sample flows.
   - Wholesale sublicensor work can differ from internal licensing work.
   - A stage gate can warn or block depending on the rule.

9. **The app uses data for planning.**
   - Stage history, SLA, bottlenecks, reusable concepts, licensor response times, factory timing, and cancellation reasons should improve future planning.

---

## 2. Architectural Principles

## 2.1 Business object first, view second

Boards, tables, calendars, dashboards, and queues are views over business objects. They are not the data model.

Frontend architecture should reflect this:

- Raw Directus collections are API data.
- Domain models represent business objects.
- View models shape domain data for a particular screen.
- Screens compose reusable domain sections and actions.

Do not use one generic `Task` model for everything.

## 2.2 One shared backend, multiple workflow surfaces

The backend remains the source of truth:

- Directus owns data, auth, roles, permissions, schema, Flows, and API.
- `poppim-web` owns the PM/PIM human experience.
- CRM and DAM frontends are sibling apps, not data owners.

The PM frontend should read and write only through Directus APIs or approved backend services.

## 2.3 Security lives in Directus

The frontend can make the UI cleaner by hiding unavailable controls, but security must be enforced in Directus:

- Field-level pricing restrictions.
- Role permissions.
- Row scoping, especially future vendor/factory access.
- Create/update/delete permissions.

Frontend role awareness is for ergonomics, not enforcement.

## 2.4 Explicit lifecycle, explicit handoff

Every actionable object should have:

- Lifecycle state.
- Current stage.
- Next action.
- Next owner or owner role.
- Waiting-on party.
- Blocker reason if blocked.
- Required evidence for next move.
- Stage age and risk.

## 2.5 Legacy ClickUp data is evidence, not the new product model

Imported ClickUp data should remain accessible, but the primary UI should be based on the new business model.

Legacy data should be placed under:

- "Imported evidence."
- "Legacy source."
- "ClickUp history."

It should not dominate the product detail surface forever.

---

## 3. Target Information Architecture

## 3.1 Top-level navigation

Recommended primary navigation:

1. **Home / Control Room**
2. **My Work**
3. **POP**
4. **Spruce**
5. **Projects / Offers**
6. **Products / SKUs**
7. **Design Library**
8. **Design Collections**
9. **Reviews**
10. **Submissions**
11. **Samples / Factory**
12. **Orders**
13. **Accounts**
14. **Reports**
15. **Settings / Admin**

This can be simplified per role. The important part is that the IA maps to the business, not to generic app demos.

## 3.2 Role-aware navigation

Navigation should adapt by role:

### Jessica / PM

Default:

- Control Room.
- POP Pipeline.
- Projects.
- Products.
- Reviews.
- Submissions.
- Samples.
- Reports.

### Liz / Creative Director

Default:

- My Reviews.
- Licensing Sheet Review.
- Revision Requests.
- Products.
- Design Library.
- Reports, limited to creative/review metrics.

### Jen / Spruce Creative Director

Default:

- Spruce Control Room.
- Design Collections.
- Account Projects.
- Pricing/Sample Tracker.
- Buyer Follow-ups.
- Reports.

### Adam / Sales

Default:

- Accounts.
- Projects.
- Buyer Status.
- Reusable Concepts.
- Presentations.
- Orders/Samples.

### Creative Designer

Default:

- My Work.
- Assigned Designs.
- Revision Requests.
- Design Library.
- Project Briefs.

### Technical Designer

Default:

- My Work.
- Licensing Sheets.
- Tech Packs.
- Packaging.
- Samples/Photos.
- Factory Handoffs.

### Licensing

Default:

- Submission Queue.
- Waiting on Licensor.
- Revisions.
- Brand Assurance.
- PI.
- PPS/Sample Submissions.

### Sourcing / China

Default:

- Pricing Requests.
- Factory Assignments.
- Sample Requests.
- Factory Responses.
- Constraints.

### Production

Default:

- Production Approval.
- Compliance Paperwork.
- Orders.
- Shipping/Import Artifacts.

## 3.3 Home / Control Room

The home screen should not be a marketing page. It should be a dense operating dashboard.

Sections:

- My immediate work.
- Items waiting on me.
- Items I own that are overdue.
- Items recently handed to me.
- Business-unit tabs: POP, Spruce, All.
- Risk summary.
- Stuck work by stage.
- Missing evidence summary.
- Upcoming shelf/PPS/sample/factory deadlines.
- Recent handoffs.
- Saved views.

For Jessica, Home should become the POP control room.

For Jen, Home should become the Spruce control room.

For Adam, Home should become the account/sales status cockpit.

---

## 4. Target Domain Model in the Frontend

The frontend should have explicit domain types and view models.

## 4.1 Raw API types

Raw API types map directly to Directus collections:

- `DirectusProduct`
- `DirectusProject`
- `DirectusDesign`
- `DirectusDesignCollection`
- `DirectusStage`
- `DirectusStageHistory`
- `DirectusRetailer`
- `DirectusBuyer`
- `DirectusLicensor`
- `DirectusProperty`
- `DirectusFactory`
- `DirectusProductType`
- `DirectusOrder`
- `DirectusSubmission`
- `DirectusSample`
- `DirectusRevision`
- `DirectusFile`
- `DirectusComment`

These types should not be used directly by complex UI components unless the component is purely generic.

## 4.2 Domain models

Domain models should express business meaning:

### `ProductDomain`

Fields:

- `id`
- `code`
- `name`
- `businessUnit`
- `productKind`: `pop_sku` | `spruce_style`
- `project`
- `design`
- `designCollection`
- `stage`
- `lifecycle`
- `nextAction`
- `nextOwner`
- `waitingOn`
- `blocker`
- `risk`
- `stageAge`
- `stageSla`
- `retailer`
- `buyer`
- `season`
- `licensor`
- `property`
- `productType`
- `factory`
- `onShelfDate`
- `ppsRequestedDate`
- `brandAssurance`
- `pi`
- `sample`
- `orderSummary`
- `fileSummary`
- `commentSummary`
- `revisionSummary`
- `legacySource`

### `ProjectDomain`

Fields:

- `id`
- `title`
- `businessUnit`
- `projectKind`: `pop_offer` | `spruce_account_project`
- `retailer`
- `buyer`
- `department`
- `season`
- `status`
- `lifecycle`
- `brief`
- `restrictions`
- `productTypesRequested`
- `licensors`
- `properties`
- `designCollection`
- `selectionPdf`
- `onShelfDate`
- `ppsRequestedDate`
- `owner`
- `nextAction`
- `risk`
- `productRollup`
- `files`
- `notes`

### `DesignDomain`

Fields:

- `id`
- `name`
- `businessUnit`
- `status`
- `thumbnail`
- `asset`
- `nasPath`
- `licensor`
- `property`
- `theme`
- `productType`
- `season`
- `firstOfferedTo`
- `projects`
- `products`
- `reuseEligibility`
- `restrictions`
- `notes`

### `DesignCollectionDomain`

Fields:

- `id`
- `name`
- `format`
- `theme`
- `businessUnit`
- `versionDate`
- `accountSpecificFor`
- `designs`
- `presentations`
- `accountProjects`
- `status`
- `nextAction`

### `SubmissionDomain`

Fields:

- `id`
- `product`
- `submissionType`: `concept` | `packaging` | `pps_sample` | `production`
- `recipient`: `internal` | `licensor` | `buyer`
- `licensor`
- `submittedBy`
- `submittedAt`
- `expectedResponseAt`
- `status`
- `brandAssuranceNumber`
- `brandAssuranceFile`
- `files`
- `response`
- `revision`

### `SampleDomain`

Fields:

- `id`
- `product`
- `factory`
- `requestedAt`
- `requestedBy`
- `expectedAt`
- `receivedAt`
- `sentToLicensorAt`
- `status`
- `photos`
- `notes`
- `revisionRequired`

### `OrderDomain`

Fields:

- `id`
- `product`
- `retailer`
- `buyer`
- `orderNumber`
- `orderDate`
- `quantity`
- `value`
- `visibleValue`
- `status`

### `WorkItemDomain`

This is the model for My Work and role queues. It is not the same as product.

Fields:

- `id`
- `objectType`
- `objectId`
- `title`
- `businessUnit`
- `queueType`
- `nextAction`
- `ownerUser`
- `ownerRole`
- `dueAt`
- `risk`
- `sourceObject`
- `projectContext`
- `accountContext`
- `evidenceNeeded`
- `actionButtons`

## 4.3 View models

Each screen should receive a model shaped for that screen:

- `PipelineCardViewModel`
- `PipelineColumnViewModel`
- `ProductTableRowViewModel`
- `ProjectTableRowViewModel`
- `DesignCardViewModel`
- `ReviewQueueRowViewModel`
- `SubmissionQueueRowViewModel`
- `MyWorkRowViewModel`
- `DashboardMetricViewModel`

This prevents domain logic from leaking into visual components.

---

## 5. Backend Schema Updates Needed

Some required features depend on backend schema work in `/worksp/directus`. The frontend plan should track these dependencies explicitly.

## 5.1 Confirm existing collections and fields

Before implementation, verify production Directus contains:

- `retailer`
- `buyer`
- `licensor`
- `property`
- `factory`
- `product_type`
- `season`
- `stage`
- `design_collection`
- `project`
- `design`
- `product`
- `order`
- `stage_history`
- `checklist_item`
- `subtask`
- `product_assignee`
- `product_file`
- `product_update`
- `product_tag`
- `product_field`
- `product_activity`
- `product_link`
- `product_time_entry`

## 5.2 Add or confirm lifecycle fields

Required on `product`, `project`, `design`, and `design_collection`:

- `lifecycle_state`
- `next_action`
- `next_owner_user`
- `next_owner_role`
- `waiting_on`
- `blocker_reason`
- `blocked_since`
- `risk_level`
- `last_meaningful_update_at`
- `closure_reason`
- `closed_at`
- `closed_by`

Suggested lifecycle values:

- `active`
- `waiting`
- `blocked`
- `parked`
- `reusable`
- `canceled`
- `abandoned`
- `complete`

Suggested waiting-on values:

- `internal_design`
- `technical_design`
- `creative_director`
- `licensing`
- `licensor`
- `sales`
- `buyer`
- `sourcing`
- `factory`
- `production`
- `unknown`

## 5.3 Add submission model

Create `product_submission` or similarly named collection.

Fields:

- `product`
- `project`
- `business_unit`
- `submission_type`
- `recipient_type`
- `licensor`
- `submitted_by`
- `submitted_at`
- `expected_response_at`
- `status`
- `response_at`
- `response_summary`
- `brand_assurance_number`
- `brand_assurance_file`
- `portal_url`
- `portal_reference`
- `revision_required`
- `revision`
- `notes`

Submission types:

- `internal_review`
- `licensing_sheet`
- `concept`
- `packaging`
- `pps_sample`
- `production`

Statuses:

- `draft`
- `ready`
- `submitted`
- `waiting`
- `changes_requested`
- `approved`
- `rejected`
- `canceled`

## 5.4 Add sample model

Create `product_sample`.

Fields:

- `product`
- `project`
- `factory`
- `sample_type`
- `requested_by`
- `requested_at`
- `expected_at`
- `received_at`
- `sent_to_buyer_at`
- `sent_to_licensor_at`
- `status`
- `photo_files`
- `notes`
- `revision_required`
- `revision_reason`

Statuses:

- `not_required`
- `needed`
- `requested`
- `in_factory`
- `received`
- `under_internal_review`
- `sent_to_buyer`
- `sent_to_licensor`
- `approved`
- `revision_needed`
- `canceled`

## 5.5 Add revision model

Create `revision_request`.

Fields:

- `object_collection`
- `object_id`
- `product`
- `project`
- `design`
- `submission`
- `source`
- `requested_by_user`
- `requested_by_external`
- `requested_at`
- `assigned_to`
- `due_at`
- `status`
- `body`
- `markup_file`
- `resolved_at`
- `resolution_note`

Sources:

- `liz`
- `jen`
- `licensor`
- `buyer`
- `factory`
- `internal`

Statuses:

- `open`
- `in_progress`
- `resolved`
- `accepted`
- `rejected`
- `canceled`

## 5.6 Add order model if not complete

Ensure `order` supports:

- `product`
- `project`
- `retailer`
- `buyer`
- `order_number`
- `order_date`
- `quantity`
- `value`
- `status`
- `notes`

Order values:

- `pending`
- `received`
- `in_production`
- `shipped`
- `complete`
- `canceled`

## 5.7 Add file/asset linking model

Short term:

- Continue using `product_file` for product files.
- Add equivalent file tables or polymorphic file relations for project, design, design collection, submission, sample, and revision.

Long term:

- Move to DAM asset relations.

The PM frontend should support both:

- Direct file URL.
- NAS path.
- DAM asset reference when available.

## 5.8 Add saved views

Create a saved view/preferences model if Directus presets are not sufficient for the custom frontend.

Fields:

- `user`
- `role`
- `team`
- `name`
- `screen`
- `business_unit`
- `filters_json`
- `sort_json`
- `columns_json`
- `is_default`
- `shared_with_role`

## 5.9 Add computed summary fields or reporting views

For performance, consider database views or precomputed summary tables for:

- Product card counts.
- Stage age.
- SLA status.
- Missing evidence.
- Current next action.
- Owner queues.
- Project rollups.
- Design reuse eligibility.

Possible collections/views:

- `pm_product_summary`
- `pm_project_summary`
- `pm_work_queue`
- `pm_stage_aging`
- `pm_missing_evidence`
- `pm_reusable_design`

---

## 6. Frontend Architecture Update

## 6.1 Proposed folder structure

Recommended structure:

```text
src/
  app/
    App.tsx
    routes.tsx
    AppShell.tsx
    navigation.ts
  auth/
    auth.tsx
    roles.ts
  lib/
    directus.ts
    utils.ts
    buildInfo.ts
  domain/
    products/
      types.ts
      api.ts
      adapters.ts
      rules.ts
    projects/
      types.ts
      api.ts
      adapters.ts
      rules.ts
    designs/
      types.ts
      api.ts
      adapters.ts
    collections/
      types.ts
      api.ts
    submissions/
      types.ts
      api.ts
      rules.ts
    samples/
      types.ts
      api.ts
    orders/
      types.ts
      api.ts
    work/
      types.ts
      api.ts
      queues.ts
    reference/
      api.ts
      types.ts
  features/
    control-room/
    my-work/
    pipeline/
    projects/
    products/
    designs/
    design-collections/
    reviews/
    submissions/
    samples/
    orders/
    accounts/
    reports/
    settings/
  components/
    layout/
    object-detail/
    cards/
    tables/
    filters/
    forms/
    status/
    ui/
```

## 6.2 Remove `MockTask` from real paths

Implementation steps:

1. Keep `src/lib/mockData.ts` only for isolated dev/demo stories if needed.
2. Create `src/domain/products/types.ts`.
3. Create `ProductSummary` and `ProductDetail` types.
4. Replace `productToTask()` with `productToPipelineCard()` and `productToTableRow()`.
5. Update `PimTaskCard` to become `ProductCard`.
6. Update `TaskDetailModal` to become `ProductDetailWorkspace`.
7. Delete fake task fields from real product cards.

## 6.3 Add routing

Use `react-router-dom` or another established route mechanism.

Routes:

```text
/                         -> role-aware home
/my-work                  -> real work queue
/pipeline                 -> product pipeline
/projects                 -> projects/offers
/projects/:id             -> project detail
/products/:id             -> product detail
/designs                  -> design library
/designs/:id              -> design detail
/design-collections       -> Spruce design collections
/design-collections/:id   -> collection detail
/reviews                  -> review queues
/submissions              -> submissions
/submissions/:id          -> submission detail
/samples                  -> samples/factory tracker
/orders                   -> order history
/accounts                 -> retailer/buyer accounts
/accounts/:id             -> account detail
/reports                  -> analytics
/settings                 -> admin/reference management
```

Requirements:

- Preserve deep linking.
- Use object type plus ID, not only `?item=`.
- Modal quick views may still exist, but full-page detail should exist for complex objects.

## 6.4 Role-aware app state

Auth context should expose:

- User ID.
- Name/email.
- Role ID/name.
- Team/department if available.
- Feature flags/permissions summary.

Navigation should be derived from role.

Do not hardcode fake people.

## 6.5 Reference data loading

Create a reference-data service:

- Stages by business unit.
- Licensors.
- Properties.
- Product types.
- Retailers.
- Buyers.
- Factories.
- Seasons.
- Users.

Requirements:

- Cache per session.
- Refresh on demand.
- Use IDs internally.
- Use names only for display.

## 6.6 Filter architecture

Create reusable filter state:

Common filters:

- Search.
- Business unit.
- Lifecycle.
- Stage.
- Owner.
- Next owner.
- Waiting on.
- Risk.
- Retailer.
- Buyer.
- Licensor.
- Property.
- Product type.
- Factory.
- Season.
- Missing evidence.
- Due range.
- Stage age.

Each screen should define which filters apply.

Filters should be serializable to URL query params and saved views.

## 6.7 Table architecture

Tables should support:

- Server-side pagination.
- Server-side sort.
- Column selection.
- Saved column presets.
- Bulk selection.
- Bulk actions.
- Sticky headers.
- Export.

Important tables:

- Product table.
- Project table.
- Design table.
- Submission table.
- Sample table.
- Order table.
- My Work table.

## 6.8 Board architecture

Boards should support:

- Group by stage, lifecycle, owner, licensor, retailer, buyer, or risk where appropriate.
- Per-column counts from server aggregates.
- Per-column lazy loading.
- Drag move with validation.
- Batch moves.
- WIP limits if useful.
- Stage age indicators.

Boards should not load only the first 300 products without making the limitation obvious and navigable.

## 6.9 Detail workspace architecture

Use a composable object detail shell:

```text
ObjectDetailShell
  Header
  StatusPanel
  PrimaryFields
  ContextPanel
  EvidencePanel
  FilesPanel
  ActivityPanel
  RelatedObjectsPanel
  ActionsPanel
```

Product detail sections:

- Identity.
- Status/next action.
- Project/account context.
- Design/source context.
- Approval/submission.
- Factory/sample/pricing/order.
- Files/assets.
- Revisions/comments.
- Stage history.
- Related/reusable objects.
- Legacy source.

Project detail sections:

- Brief.
- Account context.
- Restrictions.
- Child product rollup.
- Design/presentation assets.
- Project notes.
- Timeline.
- Batch child actions.

Design detail sections:

- Visual asset.
- Origin.
- Offered-to history.
- Reuse eligibility.
- Related products/projects.
- Files/NAS/DAM.
- Notes.

---

## 7. Screen-by-Screen Plan

## 7.1 Home / Control Room

### Purpose

Give each user an immediate answer to: "What needs attention now?"

### Data

- Current user.
- Role.
- Assigned work.
- Role-owned stage queues.
- Due soon.
- Stage overdue.
- Missing evidence.
- Recently handed off.
- Waiting-on-me.
- Waiting-on-others.

### Jessica version

Widgets:

- POP products by risk.
- Stuck SKUs.
- Licensing sheets awaiting Liz.
- Ready-to-submit products.
- Concepts approved without PO/sample.
- Missing Brand Assurance.
- PI required incomplete.
- Designer workload.
- Upcoming shelf/PPS dates.
- Batch action shortcuts.

### Jen version

Widgets:

- Spruce account projects by stage.
- Pricing requests aging.
- Sample requests aging.
- With buyer aging.
- Factory deadline approaching.
- General collections needing update.
- Buyer feedback unresolved.

### Adam version

Widgets:

- Buyer/account status.
- Ready buyer-facing presentations.
- Reusable approved concepts.
- Samples/PO status.
- Awaiting buyer decision.
- Recent updates by account.

### Implementation

1. Build `features/control-room`.
2. Create `domain/work/api.ts`.
3. Add query functions:
   - `fetchMyWorkSummary()`
   - `fetchRoleQueueSummary()`
   - `fetchRiskSummary()`
   - `fetchUpcomingDeadlines()`
4. Use placeholder widgets only if backed by real data.

## 7.2 My Work

### Purpose

Replace mock My Work with a real operating queue.

### Included work

- Products directly assigned to current user.
- Subtasks assigned to current user.
- Review items assigned to current user or role.
- Stage-owner items where current user's role owns the next action.
- Revision requests assigned to current user.
- Comments/mentions if implemented.

### Columns

- Object.
- Business unit.
- Project/account.
- Next action.
- Stage.
- Lifecycle.
- Due.
- Risk.
- Waiting on.

### Actions

- Open.
- Mark subtask done.
- Add update.
- Request help/block.
- Complete step.
- Handoff to next owner.

### Implementation

1. Replace mock data in `src/features/mywork/MyWorkPage.tsx`.
2. Use `useAuth()` current user.
3. Fetch assignments from `product_assignee`.
4. Fetch subtasks from `subtask`.
5. Fetch role queues from stage/next owner rules.
6. Build real grouping by risk, due date, and object type.

## 7.3 POP Pipeline

### Purpose

Show POP SKUs/products through the licensed workflow.

### Filters

- Stage.
- Lifecycle.
- Licensor.
- Property.
- Retailer.
- Buyer.
- Season.
- Product type.
- Designer.
- Technical designer.
- Factory.
- PI required.
- Brand Assurance missing.
- Sample status.
- Order status.
- Risk.

### Card fields

- Product code.
- Product name.
- Cover image.
- Licensor/property.
- Retailer/buyer.
- Product type.
- Stage.
- Lifecycle.
- Next owner.
- Next action.
- Stage age/risk.
- Missing evidence badges.
- Assignee avatars.
- Comment/file/revision counts.

### Stage move behavior

On drag:

1. Open transition preview if the stage has requirements.
2. Show missing evidence.
3. Allow safe moves directly.
4. Require confirmation for risky moves.
5. Hard-block critical compliance moves if backend says missing evidence.
6. Record transition note if needed.

### Implementation

1. Add `business_unit=POP` filter.
2. Fetch richer fields.
3. Fetch aggregates.
4. Replace `MockTask`.
5. Add stage transition service.

## 7.4 Spruce Pipeline

### Purpose

Show Spruce account/project/style-number flow without POP licensing noise.

### Views

- Account projects.
- Style-numbered products.
- Pricing tracker.
- Sample tracker.
- Art sent for PO.
- On hold / with buyer.

### Filters

- Account/retailer.
- Buyer.
- Format/theme.
- Design collection.
- Stage.
- Lifecycle.
- Sample required.
- Pricing status.
- Factory.
- Owner.
- Risk.

### Implementation

1. Add `business_unit=Spruce` screens.
2. Use Spruce stage set.
3. Hide licensor sections.
4. Show design collection/account rules.
5. Add account-specific process indicators.

## 7.5 Projects / Offers

### Purpose

Manage project/offer containers, not just child products.

### List columns

- Project title.
- Business unit.
- Retailer.
- Buyer.
- Department/account.
- Season.
- Status.
- Lifecycle.
- Next action.
- Risk.
- On shelf.
- PPS requested.
- Child product rollup.
- Owner.

### Detail

Sections:

- Brief.
- Restrictions.
- Account context.
- Licensors/properties.
- Product types requested.
- Dates.
- Files/selections.
- Child product status rollup.
- Notes/revisions.
- Batch actions.
- Legacy source.

### Rollups

- Products by stage.
- Products by lifecycle.
- Missing evidence count.
- Blocked count.
- Ready for review count.
- Approved without PO count.

## 7.6 Product / SKU Detail

### Purpose

One place to understand and act on a product.

### Header

- Code.
- Name.
- Business unit.
- Lifecycle.
- Stage.
- Risk.
- Next action.
- Owner.

### POP sections

- Project context.
- Retailer/buyer.
- Licensor/property.
- Product type.
- Season.
- On shelf/PPS dates.
- Design source.
- Licensing sheet.
- Brand Assurance.
- PI.
- Concept submission.
- PPS/sample submission.
- Factory/sample.
- PO/order.
- Revisions.
- Files.
- Stage history.

### Spruce sections

- Account project.
- Buyer/account rules.
- Design collection.
- Style number.
- Pricing.
- Sample requirement.
- Factory deadline.
- Art sent for PO.
- Order.
- Buyer feedback.
- Files.
- Stage history.

### Actions

- Edit fields.
- Assign owner.
- Change lifecycle.
- Move stage.
- Create submission.
- Request revision.
- Request sample.
- Record order.
- Mark reusable.
- Cancel/close.

## 7.7 Design Library

### Purpose

Prevent creative work from getting lost.

### Views

- Visual grid.
- Table.
- Reusable concepts.
- Recently approved.
- Unpicked.
- Offered to multiple.
- Missing high-res art.

### Filters

- Business unit.
- Status.
- Licensor/property.
- Retailer first offered to.
- Season.
- Product type.
- Theme.
- Designer.
- Source project.
- Reuse eligibility.

### Detail

- Image/thumbnail.
- Files/NAS path.
- Source.
- Offered-to history.
- Picked-by history.
- Related products.
- Restrictions.
- Notes.
- Reuse action.

## 7.8 Spruce Design Collections

### Purpose

Manage Spruce upstream creative inventory.

### List

- Name.
- Theme.
- Format.
- Version date.
- Account-specific flag.
- Account.
- Design count.
- Active project count.
- Status.

### Detail

- Collection brief.
- Designs.
- Presentations.
- Account projects.
- Buyer feedback.
- Convert selection to project/product.

## 7.9 Reviews

### Purpose

Give Liz, Jen, and other reviewers clean decision queues.

### Review types

- Liz licensing sheet review.
- Jen Spruce internal review.
- Internal sample/photo review.
- Packaging review.
- Factory sample review.
- Buyer feedback review.

### Queue fields

- Item.
- Business unit.
- Review type.
- Submitted by.
- Age.
- Due.
- Completeness.
- Files.
- Risk.

### Actions

- Approve.
- Request changes.
- Reject.
- Attach markup.
- Add note.
- Route to next role.

## 7.10 Submissions

### Purpose

Make licensor/buyer/internal submissions first-class.

### Queues

- Draft.
- Ready.
- Submitted.
- Waiting.
- Changes requested.
- Approved.
- Overdue.

### Fields

- Product.
- Submission type.
- Licensor/recipient.
- Submitted at.
- Expected response.
- Actual response.
- Brand Assurance.
- Files.
- Revision.

## 7.11 Samples / Factory

### Purpose

Track sample and factory execution.

### Queues

- Need factory.
- Pricing requested.
- Awaiting pricing.
- Pricing returned.
- Sample requested.
- Sample in factory.
- Sample received.
- Internal review.
- Sent to buyer/licensor.
- Approved.
- Revision needed.

### Fields

- Product.
- Project/account.
- Factory.
- Sample requirement.
- Request date.
- Expected date.
- Received date.
- Photos.
- Notes.
- Risk.

## 7.12 Orders

### Purpose

Track PO/order history and conversion from approved concept to real business.

### Views

- Orders by retailer.
- Orders by product.
- Approved without order.
- Reused products.
- Recent PO.

### Fields

- Product.
- Project.
- Retailer.
- Buyer.
- Order number.
- Order date.
- Quantity.
- Value if role allows.
- Status.

## 7.13 Accounts

### Purpose

Give Adam and leadership buyer/account context across POP and Spruce.

### Account detail

- Retailer.
- Buyers.
- Departments.
- Sample rules.
- Resale restrictions.
- Active projects.
- Active products.
- Design/offering history.
- Orders.
- CRM meeting notes/emails if linked.
- Follow-ups.

## 7.14 Reports

### Reports

- Stage aging.
- Bottlenecks.
- Products by status.
- Products by owner.
- Products by business unit.
- Licensor response time.
- Factory/sample turnaround.
- Designer workload.
- Reusable design inventory.
- Approved no PO.
- Cancellation reasons.
- Season readiness.

---

## 8. Workflow Rules

## 8.1 POP stage requirements

The following should be implemented as data-driven rules, not hardcoded switch statements where possible.

### Art files creation -> Licensing sheet creation

Required:

- Product exists.
- Project linked.
- Licensor/property selected.
- Product type selected.
- Creative designer assigned.
- Art file or NAS path present, or explicit "art pending" state.

### Licensing sheet creation -> Licensing sheet review

Required:

- Licensing sheet file or field complete.
- Product description.
- Material/size/specs.
- Packaging info if relevant.
- Technical designer assigned.

### Licensing sheet review -> Ready to submit

Required:

- Liz approval.
- No open critical revision requests.

### Ready to submit -> Concept submitted

Required:

- Licensing team owner.
- Submission record created.
- Submitted date.
- Brand Assurance number if available/required at this point.

### Concept submitted -> Revisions

Required:

- Licensor response captured.
- Revision request created.
- Assigned owner.

### Concept submitted -> Concept approved

Required:

- Licensor approval captured.
- Approval date.
- Submission record status approved.

### Concept approved -> PO received

Required:

- Buyer/retailer confirmed.
- Order record or PO marker.

### Concept approved -> Sales requested sample

Required:

- Sales request captured.
- Requested date.

### Sales requested sample -> Sample requested

Required:

- Factory selected.
- Sample request record.

### Sample requested -> Sample received

Required:

- Received date.
- Sample photos/files where possible.

### Sample received -> Factory resample

Required:

- Review note.
- Revision reason.

### Sample received -> Sample sent to licensor

Required:

- Internal review complete.
- Sample/PPS files/photos attached.
- Submission record.

### Sample sent to licensor -> Sample revision

Required:

- Licensor response.
- Revision request.

### Sample sent to licensor -> Pre-production approved

Required:

- PPS approval captured.

### Pre-production approved -> Production approved

Required:

- Production approval evidence.
- Compliance paperwork status.
- Brand Assurance/trademark forms if required.

## 8.2 Spruce workflow requirements

### Collection -> Account project

Required:

- Design collection.
- Account/retailer.
- Buyer.
- Presentation/selections context.

### Account project -> With buyer

Required:

- Presentation or selection PDF.
- Sent date.
- Sales owner.

### With buyer -> Initial approval/selections made

Required:

- Buyer feedback/selections.
- Selected designs.

### Initial approval -> Price requested / buyer approving

Required:

- Product format/size/material.
- Costing tech pack.
- Pricing request owner.

### Price requested -> Waiting for factory

Required:

- Factory/sourcing request sent.

### Waiting for factory -> Sample requested

Required:

- Factory response.
- Sample required for account.
- Sample request.

### Waiting for factory -> Send out art for PO

Required:

- Account does not require sample or sample path complete.
- Order/commitment present.
- Style number assigned.

### Send out art for PO -> Complete

Required:

- Art sent date.
- Order number if available.
- Files complete.

## 8.3 Lifecycle transitions

Lifecycle should not be casually edited without reason.

### Active -> Parked

Required:

- Park reason.
- Review date.

### Active -> Canceled

Required:

- Cancellation reason.
- Notes.
- Whether design remains reusable.

Reasons:

- Cost.
- Licensing.
- Sampling/manufacturing.
- Buyer decline.
- Duplicate.
- Business decision.

### Active -> Reusable

Required:

- Reuse eligibility note.
- Restrictions.
- Related design record.

### Any -> Abandoned

Required:

- Migration/admin reason or review decision.

### Any -> Complete

Required:

- Completion evidence appropriate to object type.

---

## 9. API and Data Fetching Plan

## 9.1 Query shape for product pipeline

Initial product pipeline query should include:

- `id`
- `code`
- `name`
- `business_unit`
- `lifecycle_state`
- `next_action`
- `waiting_on`
- `blocker_reason`
- `risk_level`
- `on_shelf_date`
- `pps_requested_date`
- `pi_status`
- `brand_assurance_number`
- `cover_url`
- `stage`
- `project`
- `design`
- `product_type`
- `retailer`
- `buyer`
- `licensor`
- `property`
- `factory`
- summary counts or rollups

Do not fetch full detail for every card.

## 9.2 Product detail query

Fetch full detail only when opening product:

- Product fields.
- Project.
- Design.
- Design collection.
- Retailer/buyer.
- Licensor/property.
- Product type.
- Factory.
- Assignees.
- Checklist.
- Subtasks.
- Files.
- Comments.
- Updates.
- Revisions.
- Submissions.
- Samples.
- Orders.
- Stage history.
- Links.
- Legacy source.

## 9.3 Aggregates

Use aggregate queries for:

- Total count.
- Count by stage.
- Count by lifecycle.
- Count by risk.
- Count by owner.
- Counts for card badges where possible.

If Directus API aggregate becomes cumbersome, add backend SQL views or summary collections.

## 9.4 Pagination

For table:

- Server page.
- Page size.
- Sort.
- Filter.
- Total.

For board:

- Per-column count.
- Per-column first page.
- Load more in column.
- Column-specific filters.

## 9.5 Deep links

Deep links should include type:

- `/products/:id`
- `/projects/:id`
- `/designs/:id`

If preserving modal routes:

- `/pipeline?product=<id>`
- `/projects?project=<id>`

When a deep-linked item is not in the current page, fetch it directly.

---

## 10. UI Components to Build

## 10.1 Status components

- `LifecycleBadge`
- `StageBadge`
- `RiskBadge`
- `WaitingOnBadge`
- `NextActionBadge`
- `MissingEvidenceBadge`
- `BusinessUnitBadge`
- `RoleOwnerBadge`

## 10.2 Object cards

- `ProductCard`
- `ProjectCard`
- `DesignCard`
- `DesignCollectionCard`
- `SubmissionCard`
- `SampleCard`
- `OrderCard`

## 10.3 Object tables

- `ProductTable`
- `ProjectTable`
- `DesignTable`
- `SubmissionTable`
- `SampleTable`
- `OrderTable`
- `WorkQueueTable`

## 10.4 Detail sections

- `IdentitySection`
- `StatusSection`
- `ProjectContextSection`
- `AccountContextSection`
- `DesignSourceSection`
- `ApprovalSection`
- `SubmissionSection`
- `SampleSection`
- `OrderSection`
- `FactorySection`
- `FilesSection`
- `RevisionSection`
- `CommentsSection`
- `StageHistorySection`
- `LegacySourceSection`

## 10.5 Form components

- `BusinessUnitSelect`
- `LifecycleSelect`
- `StageSelect`
- `RetailerSelect`
- `BuyerSelect`
- `LicensorSelect`
- `PropertySelect`
- `ProductTypeSelect`
- `FactorySelect`
- `UserSelect`
- `DateField`
- `FilePicker`
- `NasPathField`

## 10.6 Workflow components

- `StageTransitionDialog`
- `MissingEvidencePanel`
- `ReviewDecisionDialog`
- `RevisionRequestDialog`
- `SubmissionCreateDialog`
- `SampleRequestDialog`
- `OrderCreateDialog`
- `CancelParkReuseDialog`
- `BatchActionBar`

---

## 11. Implementation Phases

## Phase 0: Stabilize and remove misleading prototype surfaces

### Goal

Make the app honest. Anything shown should be real or clearly disabled.

### Tasks

1. Hide or label mock `Schedule`, `Notes`, `People`, and `Settings`.
2. Remove fake notification badge.
3. Remove fake topbar avatar stack or wire to real users.
4. Hide or disable Add New until real creation flows exist.
5. Replace fake sidebar collections with real navigation.
6. Move mock data out of production imports.
7. Add a "Legacy ClickUp" collapsed section in product detail.

### Acceptance criteria

- No production-visible screen claims to manage real business data while using mock data.
- No fake counts or fake people appear in the main shell.
- Users can trust that visible data is real.

## Phase 1: Domain model foundation

### Goal

Stop treating real products as mock tasks.

### Tasks

1. Add `src/domain/products`.
2. Add raw Directus product types and product summary/detail types.
3. Add product adapters.
4. Replace `MockTask` usage in pipeline.
5. Rename `PimTaskCard` to `ProductCard`.
6. Rename `TaskDetailModal` to `ProductDetailWorkspace` or `ProductDetailModal`.
7. Expand product query fields.
8. Add business-unit/lifecycle fields as backend allows.

### Acceptance criteria

- Real pipeline does not import `MockTask`.
- Product cards show product code, business unit, real product type/category, real assignee summary where available.
- Product detail uses business labels, not task labels.

## Phase 2: POP/Spruce split

### Goal

Give each line its own workflow surface.

### Tasks

1. Add business-unit switch.
2. Add POP pipeline preset.
3. Add Spruce pipeline/account-project preset.
4. Filter stage rows by business unit.
5. Show POP-specific fields only for POP.
6. Show Spruce-specific fields only for Spruce.
7. Add saved view defaults.

### Acceptance criteria

- POP user can see licensed pipeline without Spruce noise.
- Spruce user can see account/project flow without licensor noise.
- All-products view remains available for leadership/admin.

## Phase 3: Real My Work and role queues

### Goal

Let people work from real assigned queues.

### Tasks

1. Use current Directus user from auth.
2. Fetch product assignments.
3. Fetch assigned subtasks.
4. Fetch review queues by role.
5. Fetch stage-owner queues.
6. Build My Work table/card view.
7. Add quick actions.

### Acceptance criteria

- My Work shows current user's real work.
- Creative Director sees reviews waiting on them.
- Licensing sees ready-to-submit/waiting queues.
- PM sees exceptions and stuck items.

## Phase 4: Product and project detail overhaul

### Goal

Make product/project records operationally complete.

### Tasks

1. Build `ObjectDetailShell`.
2. Build product detail sections.
3. Build project detail sections.
4. Add stage history section.
5. Add files/revisions/submissions/orders/samples sections as backend supports them.
6. Move legacy metadata to collapsed section.

### Acceptance criteria

- A new person can open a product and understand what it is, who owns it, what is next, what is missing, and why.
- A project detail shows child product rollups and batch action opportunities.

## Phase 5: Stage transition rules and lifecycle

### Goal

Make stage moves meaningful and trustworthy.

### Tasks

1. Add lifecycle fields in backend if not present.
2. Add lifecycle badges and filters.
3. Add stage transition dialog.
4. Add missing evidence calculation.
5. Add soft warnings/hard gates.
6. Add transition notes.
7. Add batch transition validation.

### Acceptance criteria

- Users cannot accidentally represent incomplete work as approved/ready.
- Stage history becomes meaningful.
- Missing evidence is visible before movement.

## Phase 6: Reviews and submissions

### Goal

Make approvals first-class.

### Tasks

1. Add review queue screens.
2. Add submission collection/backend support.
3. Add submission queue.
4. Add review decision workflow.
5. Add Brand Assurance capture.
6. Add PI tracking.
7. Add licensor response tracking.

### Acceptance criteria

- Liz has a clean queue.
- Licensing has a clean submission queue.
- Brand Assurance and PI are visible and actionable.
- Revisions route back to the correct owner.

## Phase 7: Design library and Spruce collections

### Goal

Prevent creative inventory loss.

### Tasks

1. Add design library screen.
2. Add design detail.
3. Add design filters.
4. Add reuse actions.
5. Add Spruce design collection screen.
6. Add collection detail.
7. Add convert-to-project/product actions.

### Acceptance criteria

- Users can find unpicked and reusable designs.
- Adam can find buyer-ready reusable concepts.
- Jen can manage general Spruce collections.

## Phase 8: Samples, factory, pricing, orders

### Goal

Represent execution after approval/selection.

### Tasks

1. Add sample tracker.
2. Add factory/pricing tracker.
3. Add order history.
4. Add role-restricted pricing UI.
5. Add account-specific sample rules.

### Acceptance criteria

- Users can see what is waiting on factory, sample, pricing, PO, or production.
- Designers see constraints without seeing restricted pricing.
- Adam/Jen/Jessica can track sample/order progress.

## Phase 9: Reports and AI assistant

### Goal

Use the data to improve planning.

### Tasks

1. Add reports screen.
2. Add stage aging.
3. Add bottleneck reports.
4. Add reusable design reports.
5. Add cancellation reason reports.
6. Add licensor/factory turnaround.
7. Add assistant panel backed by Directus/worker query layer.

### Acceptance criteria

- Leadership can see bottlenecks.
- PMs can identify stuck work.
- Sales can find reusable concepts.
- AI answers cite records.

---

## 12. Data Migration and Backfill Plan

## 12.1 Product enrichment

Backfill products with:

- Business unit.
- Project.
- Retailer.
- Buyer where known.
- Product type.
- Licensor/property.
- Factory where known.
- Lifecycle state.
- Closure reason for abandoned/canceled items.
- Stage history where historical data supports it.

## 12.2 Design extraction

Identify:

- Unpicked POP preliminary designs.
- Concept-approved but no PO/sample products.
- Spruce general presentation designs.
- Spruce style-numbered products.

Create design records and link to products/projects.

## 12.3 Design collection extraction

For Spruce:

- Create design collections from general presentation structures.
- Link account projects.
- Link selected designs.
- Mark account-specific collections.

## 12.4 Submission extraction

From ClickUp fields/comments/files:

- Brand Assurance numbers.
- Licensor submission dates.
- Approval dates.
- Rejection/revision notes.
- PPS/sample submissions.

Create submission records where evidence supports them.

## 12.5 Sample/order extraction

From ClickUp tags/statuses/comments:

- Sample requested.
- Sample received.
- Factory resample.
- Sample sent to licensor.
- PO received.
- On PO tags.
- Order numbers in Spruce titles.

Create sample/order records where evidence supports them, otherwise keep raw evidence.

## 12.6 Legacy evidence preservation

Keep raw imported evidence:

- Product fields.
- Tags.
- Comments.
- Files.
- Activity.
- Links.
- Time entries if any.

But gradually map key evidence into structured business records.

---

## 13. Testing and Verification Plan

## 13.1 Automated checks

Keep:

- `npm run lint`
- `npm run build`

Add when feasible:

- Unit tests for adapters/rules.
- API mock tests.
- Stage transition rule tests.
- Role permission UI tests.

## 13.2 Business workflow tests

Create scripted scenarios:

### POP buyer pick to SKU

1. Create project/offer.
2. Add design.
3. Convert buyer pick to SKU.
4. Assign creative/technical owners.
5. Create licensing sheet.
6. Liz approves.
7. Licensing submits.
8. Licensor approves.
9. Sample requested.
10. PPS approved.
11. Production approved.

### POP revision loop

1. Product submitted.
2. Licensor requests changes.
3. Revision created and assigned.
4. Designer uploads corrected file.
5. Liz reviews.
6. Licensing resubmits.
7. Approval captured.

### POP approved but no PO

1. Product concept approved.
2. No order/sample after threshold.
3. Dormant alert appears.
4. PM marks reusable or parked.

### Spruce general collection to account project

1. Create design collection.
2. Add designs.
3. Create account project.
4. Send presentation.
5. Buyer selects.
6. Convert to style-numbered products.
7. Pricing/sample path follows account rules.

### Burlington no-sample flow

1. Buyer selection.
2. No sample required.
3. Style number assigned after final order selection.
4. Art sent for PO.

### Hobby Lobby sample flow

1. Buyer selection.
2. Sample required.
3. Size/format confirmed.
4. Sample requested.
5. Buyer approves or requests changes.

## 13.3 Permission tests

Designer:

- Cannot see pricing.
- Can see constraints.
- Can update assigned design work.

Sales:

- Can see buyer-ready status.
- Can record buyer feedback/selections.

Licensing:

- Can update Brand Assurance and submissions.

Sourcing:

- Can update factory/pricing/sample status.

Vendor/factory future:

- Sees only scoped products when row scoping is implemented.

## 13.4 Data quality tests

Reports:

- Products missing business unit.
- Products missing project.
- Products missing stage.
- POP products missing licensor/property.
- Spruce products with licensor accidentally set.
- Products with active stage but closed lifecycle.
- Concept approved with no PO/sample after threshold.
- ClickUp-only fields not mapped to structured records.

---

## 14. Rollout Plan

## 14.1 Internal alpha

Audience:

- Jessica.
- Liz.
- Jen.
- Adam.

Scope:

- Real pipeline.
- Product detail.
- Projects.
- My Work.
- One or two role queues.

Goal:

- Confirm business vocabulary and daily usefulness.

## 14.2 POP workflow beta

Scope:

- POP pipeline.
- Liz review queue.
- Licensing submission queue.
- Brand Assurance/PI.
- Stage transition validation.

Goal:

- Move current POP work through system with less Jessica manual pushing.

## 14.3 Spruce workflow beta

Scope:

- Spruce collections.
- Account projects.
- Pricing/sample tracker.
- Buyer feedback.

Goal:

- Give Jen and Adam self-service visibility.

## 14.4 Design library rollout

Scope:

- Reusable concepts.
- Unpicked designs.
- Approved no PO.
- Search/reuse.

Goal:

- Prove creative inventory value.

## 14.5 Analytics rollout

Scope:

- Stage aging.
- Bottlenecks.
- Licensor/factory turnaround.
- Reuse reports.

Goal:

- Improve planning and staffing.

---

## 15. Open Decisions

1. Should product detail be modal-first, page-first, or both?
2. Should submissions be one generic collection or separate internal/licensor/sample submission collections?
3. Should sample tracking be a product field for phase one or a separate collection immediately?
4. How should design files connect to DAM before DAM is complete?
5. How much legacy ClickUp data should be mapped automatically versus left as imported evidence?
6. Which lifecycle values should be final?
7. Which stage gates should hard-block versus warn?
8. Should role queues be materialized backend views or built from frontend queries?
9. How should saved views be stored: Directus presets, custom collection, or local user prefs?
10. Which reports are needed first by leadership?

---

## 16. Anti-Patterns to Avoid

1. **Do not build a generic task app.**
   - The business already learned the limits of this.

2. **Do not make POP and Spruce share one forced workflow.**
   - Shared data does not mean shared process.

3. **Do not bury design inventory inside products.**
   - Designs are business assets even when not picked.

4. **Do not make stage the only status.**
   - Lifecycle, owner, blocker, and evidence matter.

5. **Do not use frontend-only security.**
   - Backend permissions must enforce sensitive fields.

6. **Do not create generic notes as a new silo.**
   - Notes should attach to business objects.

7. **Do not let mock screens remain in production.**
   - Users must trust what they see.

8. **Do not show pricing to designers.**
   - But do show constraints that help them design correctly.

9. **Do not over-automate expert judgment.**
   - Liz and Jen need decision support, not fake aesthetic checklists.

10. **Do not hide legacy evidence.**
    - Preserve it, but do not let it define the new system.

---

## 17. Definition of Done for the Tailored System

The program can be considered properly tailored when:

1. POP and Spruce have distinct workflows in the UI.
2. Projects, products, designs, design collections, submissions, samples, orders, and revisions are all first-class or intentionally deferred with a documented reason.
3. My Work is real and role-aware.
4. Jessica can run POP from a control room instead of manually pushing every status.
5. Liz has a clean review queue with files/evidence and decision actions.
6. Jen has a Spruce cockpit for collections, account projects, pricing, samples, and buyer follow-ups.
7. Adam can answer buyer/account status questions without asking Jessica or Jen.
8. Designers can see briefs, constraints, assignments, and revisions without seeing restricted pricing.
9. Licensing can track Brand Assurance, PI, concept submissions, PPS submissions, responses, and revisions.
10. Sourcing/China can track factory constraints, pricing, and samples.
11. Approved-but-unsold concepts and unpicked designs are searchable and reusable.
12. Stage moves record history and respect evidence gates.
13. Lifecycle states distinguish active, waiting, blocked, parked, reusable, canceled, abandoned, and complete.
14. Product/project details make next action and owner obvious.
15. Reports show bottlenecks, stage aging, reusable inventory, and overdue follow-ups.
16. Mock data is absent from production paths.
17. ClickUp is treated as legacy evidence, not the conceptual model.

---

## 18. First Recommended Engineering Sprint

If choosing one immediate sprint, do this:

1. Hide mock pages and fake shell elements.
2. Replace `MockTask` in real pipeline with `ProductSummary`.
3. Add business-unit and lifecycle filtering.
4. Enrich product card and detail with project, retailer, buyer, product type, business unit, assignee summary, and stage age if available.
5. Build real My Work from current user assignments/subtasks.
6. Move ClickUp metadata into a collapsed legacy section.
7. Add the first role queue: Liz review queue or Jessica stuck-work queue.

This sprint would not finish the ideal system, but it would turn the app decisively away from a generic ClickUp clone and toward the real business architecture.


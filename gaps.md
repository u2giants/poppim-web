# Poppim Web Gaps

**Purpose.** This document compares the current `poppim-web` application against what the company actually needs from the project management system, based on:

- The current `poppim-web` codebase.
- The frontend docs in this repo.
- The Directus backend docs in `/worksp/directus`, especially `docs/business-process.md`, `docs/product-flow-evidence-pack.md`, `docs/pm-system-design.md`, and `docs/data-model.md`.
- The ClickUp monitoring evidence and employee-interview synthesis captured in the Directus repo.

**Bottom line.** The current app is a useful first slice: it authenticates against Directus, shows real product records, supports a product board/table, opens a detail modal, shows migrated ClickUp work evidence, and has a basic projects page. But it is still mostly a nicer ClickUp-style product board. It is not yet the tailored business operating system described in the business/process docs.

The gap is not cosmetic. The core issue is that the real business does not run on generic tasks. It runs on offers/projects, SKUs/style numbers, designs, design collections, licensor submissions, buyer selections, samples, POs/orders, revisions, compliance artifacts, factories, account-specific rules, and lifecycle states. The frontend currently exposes only a small subset of that graph.

---

## 1. Current Fit Summary

### 1.1 What the current app already does well

The current application has several strong foundations:

1. **Directus session authentication is correct.**
   - The app uses the backend session-cookie model instead of local token storage.
   - This is aligned with cross-subdomain SSO architecture for `pm.designflow.app` and `data.designflow.app`.

2. **The main pipeline uses real Directus product data.**
   - `src/features/pipeline/api.ts` queries `product`, `stage`, and `licensor`.
   - Server-side search, licensor filtering, and product counts are implemented.
   - Dragging a product updates `product.stage`.

3. **The projects page uses real Directus project data.**
   - `src/features/projects/api.ts` reads `project` and aggregates product counts.
   - It can open a project and show linked products.

4. **The detail modal preserves imported ClickUp evidence.**
   - Comments, product updates, files, tags, imported fields, activity, links, and time entries can be displayed from Directus collections.
   - This is important because the raw D1/ClickUp monitoring showed that context lived in comments, paths, files, and incremental edits, not only stage changes.

5. **The UI shell is a plausible starting point.**
   - Sidebar, topbar, board/table toggle, card images, modal, and detail tabs are all good raw material.

6. **The app builds.**
   - `npm run lint` currently has warnings but no errors.
   - `npm run build` succeeds.

### 1.2 What the current app is primarily optimized for

The app is currently optimized for:

- Seeing products grouped by stage.
- Searching products by name/code.
- Filtering products by licensor.
- Moving products between stages.
- Opening a product and viewing imported ClickUp context.
- Seeing a simple list of projects and their product counts.

That is useful, but it is only a slice of the real workflow.

### 1.3 What the real business needs instead

The real business needs a system that answers:

- What kind of object is this?
- Is this an offer, product, design, collection, submission, sample, order, or reusable concept?
- Which business line does it belong to, POP or Spruce?
- Who owns the next decision?
- What evidence is required before it moves?
- What is blocked, waiting, parked, canceled, reusable, complete, or stale?
- What can be reused for future buyers?
- What requires licensor review, buyer review, factory action, pricing review, sample action, or production approval?
- Which person should act now without Jessica or Jen manually pushing every status?

The current app does not yet answer those questions reliably.

---

## 2. Critical Product/Business Gaps

## 2.1 The app still flattens business objects into "tasks"

### Current state

The real product rows from Directus are converted into `MockTask` in `src/features/pipeline/adapter.ts`.

That adapter:

- Converts `product.name` into a task title.
- Converts `product.stage` into a task stage.
- Converts `product.licensor` into a display badge.
- Infers category from the product title.
- Sets `checklist`, `comments`, `attach`, and `assignees` to empty/zero values.
- Uses ClickUp dates for due display.

### Why this is wrong for the business

The ClickUp evidence showed that the old structural problem was exactly this flattening: ClickUp made everything look like a task. The replacement should not repeat that at the application layer.

The business has distinct objects:

- Project / offer.
- Product / SKU / style number.
- Design.
- Design collection.
- Licensor submission.
- Buyer selection.
- Sample.
- Factory/pricing request.
- Order / PO.
- Stage history.
- Revision / note.
- File / asset.

When everything is converted into `MockTask`, the UI loses the natural shape of the business and makes future features harder to implement.

### Consequences

- Users cannot tell whether they are looking at a product, design, project, submission, order, or reusable concept.
- POP and Spruce become too similar in the interface.
- Lifecycle states get hidden behind board columns.
- Role-specific queues have no native model.
- The app risks becoming "ClickUp, but prettier."

### Required direction

Create real frontend domain models:

- `PipelineProductCardModel`
- `ProjectSummaryModel`
- `DesignSummaryModel`
- `DesignCollectionSummaryModel`
- `SubmissionQueueItem`
- `SampleQueueItem`
- `OrderSummaryModel`
- `MyWorkItem`
- `ReviewQueueItem`
- `ExceptionQueueItem`

Do not keep using `MockTask` as the core bridge from Directus to UI.

---

## 2.2 POP and Spruce are not separated enough

### Current state

`fetchPipelineProducts()` filters only for `stage _nnull`. It does not require or expose a business-unit split in the pipeline query.

The board shows one stage-driven product pipeline. It can include any product with a stage.

### Why this is wrong for the business

POP and Spruce are not the same workflow.

POP:

- Licensed product line.
- Heavy licensor approval flow.
- 17 major stages.
- Requires internal review, licensing sheet review, licensor concept approval, sample/PPS approval, Brand Assurance, PI status, compliance artifacts, and production approval.

Spruce:

- Generic/original line.
- Buyer/account driven.
- No licensor.
- Works through design collections, buyer selections, pricing, samples where account-specific, factory timing, and order execution.
- High-res art may not exist until a buyer asks.
- Some accounts do not require samples; others do.

The current app treats a product with a stage as a generic pipeline object, which hides the most important distinction in the business.

### Consequences

- Users may see Spruce and POP work in the same mental model.
- Licensor fields appear irrelevant or confusing for Spruce.
- Spruce account-specific exceptions are not represented.
- POP compliance gates are not enforced.
- Reporting by line becomes unreliable.

### Required direction

Add first-class business-unit separation:

- Global line switch: `POP`, `Spruce`, `All`.
- Pipeline presets per business unit.
- Different stage groups per business unit.
- Different detail sections per business unit.
- Different role dashboards per business unit.
- Different creation flows per business unit.

At minimum:

- POP Product Pipeline.
- POP Review/Submission Queues.
- Spruce Account Projects.
- Spruce Design Collections.
- Spruce Pricing/Sample Tracker.

---

## 2.3 The design library is absent from the frontend

### Current state

The backend data model defines `design` as a first-class collection. The frontend does not expose it in navigation, types, data fetching, cards, detail views, or workflows.

### Why this is a major business gap

One of the clearest business needs from the evidence pack is that creative work gets lost:

- Preliminary POP designs shown to buyers but not picked.
- Approved POP concepts that never receive a PO or sample request.
- Spruce trend art and general presentation inventory.
- Designs that could be re-offered to future buyers.

ClickUp hid this work inside tasks/projects. The new PM system must rescue it.

### Consequences

- The system cannot become a reusable creative inventory.
- Adam cannot find concepts to re-offer.
- Jessica cannot see approved-but-dormant concepts.
- Jen cannot manage general Spruce presentations as inventory.
- Designers cannot see what already exists before creating similar work.

### Required direction

Add a real Design Library area:

- Search by licensor, property, retailer, buyer, season, product type, theme, style guide, product format, status, and source project.
- Statuses such as `unpicked`, `picked`, `approved`, `reusable`, `offered_to_multiple`, `retired`, and `blocked`.
- Visual card and table views.
- Design detail page with source project, files, NAS paths, thumbnails, notes, offered-to history, picked-by history, related products, and restrictions.
- Convert design to SKU/product.
- Re-offer design to another project/account.
- Flag licensing or buyer restrictions before reuse.

---

## 2.4 Design collections are absent from the frontend

### Current state

The backend data model includes `design_collection` for Spruce. The frontend does not expose it.

### Why this matters

Spruce often starts from account-agnostic trend/theme collections, not products. Examples from the business process include general themes such as Gaming, Farmhouse, Cowgirl Country, Soft Religion, Wall Art, Floor Coverings, Storage, Seasonal, and Garden.

Those collections may contain many presentation-level designs. They are not committed products until a buyer selection or sample/order path makes them so.

### Consequences

- Spruce gets forced into a product/SKU model too early.
- Jen cannot manage the true upstream creative process.
- Adam lacks self-service access to general presentations.
- Account-specific exceptions, such as Hobby Lobby/sample-required or storage/account-specific work, are not visible.

### Required direction

Add Spruce Design Collections:

- Collection list by theme, format, date, account-specific flag, and status.
- Collection detail with designs, presentations, selected accounts, buyer feedback, and conversion history.
- General presentation view for Adam.
- Account-specific branch view.
- Ability to convert selected designs into account projects and style-numbered products.

---

## 2.5 Lifecycle state is missing or under-modeled in the frontend

### Current state

The pipeline filters for products with a stage and displays stage as the main status. Project status only has `active` and `won` styling in the current frontend.

### Why this is wrong

The evidence showed that many "open" or "approved" ClickUp records are not actually active work. They may be:

- Active.
- Waiting.
- Stuck.
- Parked.
- Reusable.
- Canceled.
- Abandoned.
- Complete.
- Waiting on buyer.
- Waiting on licensor.
- Waiting on factory.
- Waiting on internal review.

Stage and lifecycle are not the same thing.

### Consequences

- Old or parked work pollutes active boards.
- Approved-but-unsold concepts look the same as active concepts.
- Cancelled/abandoned work cannot be learned from.
- Jessica and Jen cannot see what needs cleanup.
- Adam cannot find reusable inventory confidently.

### Required direction

Expose lifecycle state everywhere:

- Add filters and badges for lifecycle.
- Separate active workflow boards from inventory/reuse boards.
- Add cancellation and closure flows with reason codes.
- Add parked/review-later queues.
- Add dormant alerts for concept-approved products with no order/sample movement.

---

## 2.6 The app lacks role-specific operating views

### Current state

The navigation has a generic pipeline, projects, schedule, notes, people, my work, and settings. Most role-specific needs are not represented.

### Required role views

#### Jessica: POP PM control room

Missing:

- Due-soon and risk-ranked products/projects.
- Stuck SKUs by stage age.
- Licensing sheets waiting for Liz.
- Art files not delivered by creative.
- Tech packs ready but missing factory confirmation.
- Concepts approved but not tied to PO/sample.
- Designer workload/capacity.
- Batch stage movement.
- Batch assignment.
- Exception management.
- Products needing cancellation/parking/reuse decisions.

#### Liz: creative director review queue

Missing:

- Licensing sheet review queue.
- Package completeness display.
- Pantone/spec/manufacturing detail visibility.
- Markup attachment flow.
- Approve/reject/request-changes action.
- Routing to licensing.
- Wholesale sublicensor separation.
- Revision history by product/licensor/designer.

#### Jen: Spruce control room

Missing:

- General design collection cockpit.
- Account project queue.
- Buyer feedback tracker.
- Pricing tracker.
- Sample tracker.
- Factory waiting tracker.
- Quarterly stale buyer review.
- Account-specific rules display.

#### Adam: sales cockpit

Missing:

- Buyer/retailer account view across POP and Spruce.
- Current status, next action, blocker, and owner.
- Buyer-facing mockups, selection PDFs, and reusable concepts.
- Ability to record buyer selections/passes/changes.
- Trigger for buyer commitment that creates SKU/style number.

#### Creative designers

Missing:

- Real assigned work view.
- Brief context.
- Manufacturing constraints.
- Files/NAS paths.
- Revision requests.
- Completion checklists for their step.

#### Technical designers

Missing:

- Licensing sheet creation queue.
- Costing sheet/tech pack queue.
- Packaging queue.
- Factory file handoff.
- Product integrity/PI visibility.
- Sample photo review.

#### Sourcing / Albert / China team

Missing:

- Factory matching queue.
- Pricing/costing queue.
- Factory response tracking.
- Sample timing tracking.
- Constraint feedback to designers.

#### Licensing team

Missing:

- Ready-to-submit queue.
- Submission record creation.
- Brand Assurance number/PDF capture.
- Licensor response tracking.
- PPS/sample submission tracking.
- Rejection/revision routing.

#### Production managers

Missing:

- Production approval queue.
- Compliance paperwork tracker.
- Import/shipping artifact status.
- Brand Assurance/trademark form reuse.

---

## 2.7 The main pipeline does not show true next action or owner

### Current state

The board groups products by stage. The card does not show next owner, next action, blocker, or elapsed time in stage.

### Why this matters

The business problem is not only "what stage is this in?" It is "who needs to do what next?"

ClickUp required Jessica and Jen to chase people because status did not translate cleanly to next action.

### Consequences

- Stage names remain ambiguous.
- Users still ask Jessica/Jen for status.
- Work can sit in a stage with no clear accountable owner.
- Board movement remains PM-driven instead of role-driven.

### Required direction

Every product/project/work item should expose:

- Current stage.
- Lifecycle state.
- Next action.
- Next owner.
- Waiting on.
- Last meaningful update.
- Days in stage.
- SLA/risk status.
- Required evidence to move.
- Blocker reason.

---

## 2.8 Stage movement has no business gates

### Current state

Dragging a card updates `product.stage` directly.

### Why this matters

POP stage movement should sometimes require evidence:

- Art files completed.
- Licensing sheet attached.
- Liz review approved.
- Licensing submission ready.
- Brand Assurance number present.
- PI status addressed.
- Buyer pick confirmed.
- PO received.
- Sample requested.
- Sample/PPS photos attached.
- Licensor PPS approval.
- Production compliance artifacts present.

Spruce stage movement may require:

- Buyer selection captured.
- Pricing request sent.
- Pricing returned.
- Adam approved costing.
- Sample requested if account requires it.
- Factory deadline recorded.
- Art sent for PO.
- Order number captured.

### Consequences

- Users can move work into a false stage.
- Stage history becomes less trustworthy.
- PMs still need to audit manually.
- The system cannot power reliable alerts.

### Required direction

Add move guards:

- Soft warnings for missing evidence.
- Hard gates for critical compliance moves.
- Stage transition dialog with required fields.
- Role-aware move actions.
- Move reason and comment capture.
- Batch move with validation summary.

---

## 2.9 Stage history/SLA is not surfaced

### Current state

The backend data model includes `stage_history`, and the backend Flow is intended to write stage changes. The frontend does not show time-in-stage, stage history, SLA status, or projected completion.

### Why this matters

The monitoring work was partly intended to understand flow and cycle time. The new system should use that learning. Users need to know not just where an item is, but whether it is aging normally.

### Consequences

- No stuck-work visibility.
- No objective risk signal.
- No improvement loop.
- No basis for proactive seasonal planning.

### Required direction

Add:

- Days in current stage.
- Stage history timeline.
- SLA target by stage/product type/licensor/account.
- On-track / at-risk / overdue status.
- Projected completion.
- Bottleneck dashboard.
- Stage aging filters.

---

## 2.10 Product detail omits many business-critical fields

### Current state

The product modal shows:

- Stage/status.
- Licensor.
- Due.
- Inferred category.
- Assignees.
- Checklist.
- Description.
- Tags.
- ClickUp metadata.
- Files/fields/activity/updates.

### Missing for POP

- SKU code as a primary identifier.
- Project/offer link.
- Retailer and buyer.
- Season.
- Licensor property.
- Product type.
- Business unit.
- Factory.
- Packaging/put-up.
- On-shelf date and PPS-requested date as distinct fields.
- Brand Assurance number and PDF.
- PI required/not required/completed/pending details.
- Licensing sheet file.
- Packaging file.
- Licensor concept submission.
- Licensor PPS/sample submission.
- Licensor response history.
- Sample requested/received/sent status.
- PO/order history.
- Closure/reuse state.
- Manufacturing constraints visible to designers.
- Pricing fields visible only to allowed roles.

### Missing for Spruce

- Account project.
- Buyer/account rules.
- Design collection.
- Style number.
- General presentation link.
- Selection PDF.
- Pricing request status.
- Adam costing approval.
- Sample requirement by buyer.
- Factory deadline.
- Art sent for PO.
- Order number.
- High-res art readiness.

### Required direction

Redesign the detail view as a business object workspace rather than a generic task modal.

Recommended sections:

- Identity.
- Current status and next action.
- Project/account context.
- Design/source context.
- Approval/submission status.
- Files/assets.
- Factory/pricing/sample/order.
- Revision and comments.
- Stage history and activity.
- Related/reusable items.
- Admin/migration metadata collapsed by default.

---

## 2.11 Projects page is real but not operationally rich

### Current state

Projects page shows:

- Project title.
- Status.
- Business unit.
- Retailer.
- Shelf date.
- SKU count.
- Brief and restrictions in modal.
- Linked products.

### Missing

- Buyer.
- Season.
- Licensors/properties.
- Product types requested.
- PPS requested date.
- Project owner.
- Next action.
- Risk status.
- Lifecycle state beyond active/won.
- Selection PDF.
- Spruce design collection.
- Account-specific rules.
- Buyer feedback.
- Files and notes.
- Project-level timeline.
- Batch actions for child products.
- Roll-up by child stage.
- Roll-up by child blockers.
- Project comments.
- Opportunity/order context from CRM.

### Required direction

Projects should become the main container for offers/account projects:

- Project list with filters by business unit, retailer, buyer, season, status, lifecycle, owner, risk, stage mix.
- Project detail with product roll-up, files, brief, restrictions, notes, selections, next action, and child product operations.
- Project board/table/report views.

---

## 2.12 My Work is mock data

### Current state

`MyWorkPage` hardcodes a current user and filters mock tasks.

### Why this is dangerous

This page looks like a real operating surface, but it does not reflect the signed-in user or real assignments.

### Consequences

- Users cannot trust it.
- It may create false confidence during demos.
- It hides one of the most important future workflows: each person updating their own step.

### Required direction

Replace with real data:

- Read current user via auth context.
- Fetch direct product assignments.
- Fetch subtasks assigned to user.
- Fetch stage-owner queues relevant to user role.
- Fetch review queues for creative director/licensing/sourcing roles.
- Show grouped work by due date, risk, next action, and object type.

---

## 2.13 Schedule is mock data

### Current state

`SchedulePage` uses static week days and static mock task lists.

### Why this matters

The business needs seasonal planning, shelf dates, PPS dates, sample deadlines, factory deadlines, buyer meetings, follow-ups, and quarterly stale-buyer review. A fake weekly schedule does not serve that.

### Required direction

Either remove Schedule from production navigation until real, or implement it using:

- Project `on_shelf_date`.
- Product `pps_requested_date`.
- Product `clickup_due_at` only as imported legacy metadata.
- Sample due dates.
- Factory deadlines.
- Buyer follow-up dates.
- Licensor expected response dates.
- Order/PO dates.
- Stage SLA due dates.

---

## 2.14 Notes is mock data and should not become another silo

### Current state

`NotesPage` displays static mock notes.

### Why this matters

The business already suffered from scattered context in Teams, Illustrator markups, NAS paths, emails, and comments. A generic notes area could become another silo if it is not attached to business objects.

### Required direction

Do not build generic notes first. Build object-attached notes/revisions:

- Product revision notes.
- Project notes.
- Design notes.
- Buyer feedback notes.
- Licensor rejection notes.
- Factory constraint notes.
- Meeting notes from CRM linked to retailers/buyers/projects.

If a global notes page remains, it should be an index over object-linked notes, not a separate notebook.

---

## 2.15 People page is mock data

### Current state

`PeoplePage` displays fake people from `mockData`.

### Required direction

Either hide it or make it real:

- Read active Directus users.
- Show role, team, workload, active work, stuck work.
- Link to assignments.
- Respect roles/permissions.

---

## 2.16 Settings page is local-only and misleading

### Current state

Settings uses mock licensors/customers and stores uploaded logos only in React state. It implies records can be managed, but changes do not persist.

### Required direction

Either hide it or wire it to real Directus records:

- `retailer`.
- `buyer`.
- `licensor`.
- `property`.
- `factory`.
- `product_type`.
- `season`.
- `stage`.
- Role/configuration tables.

For licensor/customer logos, use real fields and file/asset storage, not local data URLs.

---

## 2.17 The Add New button is nonfunctional and underspecified

### Current state

Topbar has an `Add new` button with no behavior.

### Why this matters

Creation is not simple in this business. "Add new" might mean:

- New POP project/offer.
- New POP SKU from buyer pick.
- New POP design concept.
- New Spruce design collection.
- New Spruce account project.
- New Spruce style-numbered product.
- New licensor submission.
- New sample request.
- New order.
- New buyer feedback note.
- New factory/pricing request.

### Required direction

Replace generic Add New with a creation launcher:

- Choose object type.
- Ask business-unit-specific questions.
- Use templates.
- Validate required relations.
- Create child objects only when the business event justifies them.

---

## 2.18 Licensor filter uses static mock list

### Current state

The filter uses `LICENSORS` from `mockData`, and maps display names back to raw names via a hardcoded object.

### Why this matters

Licensors are real backend records. The frontend should not hardcode operational master data.

### Consequences

- New licensors require code changes.
- Name variants can break filters.
- Licensor metadata such as turnaround time, PI requirement, and resale restrictions is not used.

### Required direction

Fetch licensors from Directus:

- `id`.
- `name`.
- `turnaround_days_min`.
- `turnaround_days_max`.
- `requires_pi`.
- `prohibits_resale`.
- logo/color metadata if desired.

Use licensor IDs for filters, not display names.

---

## 2.19 Category is inferred from product title

### Current state

`inferCategory()` uses regexes against the title and defaults to `storage`.

### Why this is wrong

Product type/category is a business field. It drives:

- SLA expectations.
- Designer workload.
- Manufacturing constraints.
- Factory capabilities.
- Pricing/sample timing.
- Seasonal planning.

Title regexes are not a business source of truth.

### Required direction

Use `product.product_type` or a dedicated category/product-type relation. Show unknown/missing category explicitly rather than guessing.

---

## 2.20 Assignees are not shown on cards/table

### Current state

The adapter sets `assignees: []`. Card avatars come from mock people only if IDs are present, which real products do not get through the adapter. Assignees are fetched only inside the modal.

### Why this matters

Assignment is core to reducing Jessica/Jen manual chasing.

### Required direction

Fetch assignment summaries with products:

- Assigned users.
- Role owner.
- Next owner.
- Subtask owners.
- Review owner.

Show them on cards, table, My Work, role queues, and filters.

---

## 2.21 Checklist/comment/file counts are zeroed on cards

### Current state

`productToTask()` sets checklist/comment/file indicators to zero.

### Why this matters

The evidence showed context lives in comments/files/checklists. Cards should surface whether a product has:

- Open checklist items.
- Unresolved comments/revision notes.
- Files missing or present.
- Licensor submission documents.
- Sample photos.

### Required direction

Add aggregate counts:

- Checklist total/done.
- Comment count.
- File count.
- Open revision count.
- Missing required artifacts count.

Use Directus aggregate queries or precomputed summary fields.

---

## 2.22 Imported ClickUp metadata is too visible

### Current state

The modal displays "ClickUp list", "Created in ClickUp", "Updated in ClickUp", "ClickUp due", and an "Open original ClickUp task" link.

### Why this is partly wrong

During migration, traceability is valuable. Long-term, the app should not make ClickUp the conceptual center of the new workflow.

### Required direction

Keep ClickUp metadata, but move it into a collapsed "Legacy source" section:

- External source.
- External ID.
- Original URL.
- Imported dates.
- Raw fields.

The main surface should use POP/Spruce business language.

---

## 2.23 Notifications are fake

### Current state

Topbar shows a hardcoded notification count of `12`.

### Required direction

Either hide notifications or wire them to:

- Stage handoffs.
- Mentions/comments.
- Review requests.
- Stuck/SLA alerts.
- Licensor response reminders.
- Buyer/factory follow-up reminders.
- Missing evidence alerts.

---

## 2.24 Sidebar collections are fake and potentially misleading

### Current state

Sidebar collections include hardcoded items such as "Disney · Encanto", "Marvel · Q4", and "Nick · Bluey"; only "Product Pipeline" is clickable.

### Required direction

Replace with real navigation:

- POP.
- Spruce.
- My Work.
- Projects/Offers.
- Products/SKUs.
- Design Library.
- Spruce Collections.
- Reviews.
- Submissions.
- Samples.
- Orders.
- Accounts.
- Reports.
- Admin/Settings.

If there are saved views, fetch/save them as real user/team presets.

---

## 2.25 The app lacks buyer/account context

### Current state

Products do not fetch buyer/retailer/project context in the pipeline query. Projects only fetch retailer, not buyer.

### Why this matters

The business is buyer/account-driven:

- Adam sells to buyers.
- Offers/projects are organized around retailer, buyer, season, and account rules.
- Spruce account differences materially change workflow.
- POP buyer picks determine SKU creation.

### Required direction

Expose account context:

- Retailer.
- Buyer.
- Department/account.
- Account-specific rules.
- Sample requirement.
- Resale restriction.
- Buyer feedback history.
- Related CRM activity.

---

## 2.26 The app lacks factory and sourcing context

### Current state

Products do not expose factory, factory constraints, costing, sample, or China-team status in the main UI.

### Why this matters

Interviews showed factory/pricing opacity and late manufacturing constraints cause rework.

### Required direction

Expose:

- Factory.
- Capabilities.
- Known constraints.
- Die line/material/print method notes.
- Pricing request status.
- Sample request status.
- Factory deadlines.
- China team contact.
- Sourcing blockers.

Keep sensitive pricing role-restricted, but expose non-price manufacturing constraints to designers.

---

## 2.27 The app lacks licensor submission modeling

### Current state

The app shows licensor as a badge and PI Required as a pill. It does not show licensor submission records, Brand Assurance, PPS submissions, or response tracking as first-class workflows.

### Why this matters

POP is defined by licensor approval.

Required records include:

- Concept submission.
- Packaging submission.
- Brand Assurance number/PDF.
- Licensor response.
- Revision request.
- Concept approved.
- Sample/PPS submission.
- PPS approval.
- Production approval/compliance artifacts.

### Required direction

Add submission objects and queues:

- Ready to submit.
- Submitted.
- Waiting on licensor.
- Changes requested.
- Approved.
- Overdue by licensor turnaround expectation.
- Missing Brand Assurance.
- Missing PI.

---

## 2.28 The app lacks order/PO history

### Current state

The app does not expose `order` or PO history.

### Why this matters

The business needs to know:

- Whether an approved concept became an order.
- Which buyer/retailer bought it.
- Whether it can be reused.
- Whether a product is dormant after approval.
- Whether a Spruce item has an order number.

### Required direction

Add order history:

- Product orders.
- Retailer/buyer.
- PO/order number.
- Order date.
- Quantity.
- Role-restricted value/pricing.
- Reuse history.

---

## 2.29 The app lacks revision workflows

### Current state

The modal can show comments and imported updates. It does not provide structured revision request/response workflow.

### Why this matters

Revisions are central:

- Liz requests changes.
- Licensors request changes.
- Buyers request changes.
- Jen gets marked-up Spruce feedback.
- Designers respond with revised files.

### Required direction

Add revision records:

- Source: Liz, licensor, buyer, factory, internal.
- Requested by.
- Requested date.
- Assigned to.
- Due date.
- Status: open, in progress, resolved, accepted, rejected.
- Markup/files attached.
- Linked submission/product/design.

---

## 2.30 The app lacks evidence-completeness checks

### Current state

There is no visible completeness checklist for stage transitions or review queues.

### Required direction

Add business-specific completeness:

POP examples:

- Art files present.
- Product description present.
- Product type selected.
- Licensor/property selected.
- Licensing sheet present.
- Packaging file present.
- Pantones/specs present.
- Brand Assurance number present where required.
- PI status addressed.
- Sample photos attached.
- PPS submission result captured.

Spruce examples:

- Design collection linked.
- Buyer/account linked.
- Selection PDF attached.
- Pricing status captured.
- Sample required flag resolved.
- Factory deadline captured.
- Style number assigned only after commitment.

---

## 2.31 User permissions are not reflected in frontend UX

### Current state

The backend enforces field permissions. The frontend has no role-aware surfaces, no role-specific navigation, and no visible cues for hidden/protected fields.

### Why this matters

Pricing must be hidden from designers while constraints remain visible. Different roles should see different defaults and actions.

### Required direction

Use `readMe()` role information:

- Role-based nav.
- Role-based dashboards.
- Role-based move actions.
- Role-aware detail sections.
- Hide unavailable create/edit actions.
- Never rely on frontend hiding for security; backend remains source of truth.

---

## 2.32 The app lacks creation/conversion workflows

### Current state

There is no real creation flow.

### Required creation events

POP:

- Create project/offer from buyer brief.
- Add preliminary design to project.
- Convert buyer pick into SKU/product.
- Create licensor submission from SKU.
- Request sample from factory.
- Record PO/order.
- Park/cancel/reuse concept.

Spruce:

- Create design collection.
- Add designs to collection.
- Create account project.
- Record buyer selections.
- Convert selection into style-numbered product.
- Create pricing request.
- Create sample request if account requires.
- Record order/art sent for PO.

---

## 2.33 The app lacks batch operations

### Current state

The board supports single-product stage movement. Projects can show child SKUs but not act on them.

### Why this matters

Jessica and Jen often manage many SKUs/designs under one project/account. The system needs to support partial progress, batch movement, and bulk assignment without losing item-level nuance.

### Required direction

Add batch actions:

- Assign designer/technical designer.
- Move selected products after validation.
- Set lifecycle state.
- Set due/PPS/sample dates.
- Add note/tag.
- Create submission batch.
- Export selected products.
- Download selected files/thumbnails.

---

## 2.34 The app lacks reporting and analytics

### Current state

There are no real dashboards beyond board/table counts.

### Required analytics

- Active products by stage and business unit.
- Stuck products by stage age.
- Licensor response time.
- Designer workload.
- Designer output/pick rate where data supports it.
- Concept-approved but no PO/sample.
- Reusable design inventory.
- Buyer/account activity.
- Factory/pricing turnaround.
- Sample turnaround.
- Cancellation reasons.
- Bottleneck trends.
- Seasonal readiness.

---

## 2.35 The app lacks AI-assistant surfaces

### Current state

There is no assistant UI.

### Why this matters

The legacy Cloudflare Worker/D1 analytics layer was already oriented toward natural-language querying. The future PM system should be able to answer business questions using Directus data and historical evidence.

### Required direction

Add an AI side panel once data surfaces are reliable:

- "What is stuck for Disney?"
- "What concepts are approved but have no PO?"
- "What can Adam re-offer to Burlington?"
- "Which products are waiting on Liz?"
- "Which sample requests are old?"
- "Why did this item get delayed?"

The assistant must cite the underlying records.

---

## 3. Technical / Code Architecture Gaps

## 3.1 Domain code is mixed with mock/prototype code

The app still imports from `src/lib/mockData.ts` in major production screens:

- Pipeline card styling and category icons.
- Topbar people/licensor filters.
- Sidebar fake collections.
- My Work.
- Schedule.
- Notes.
- People.
- Settings.

This creates ambiguity over what is real and what is prototype.

Required direction:

- Move remaining mock data into `src/dev/` or delete it.
- Do not import mock data in production routes.
- Replace with Directus-backed APIs or hide the screen.

## 3.2 Frontend types are a minimal hand-maintained slice

`src/lib/types.ts` includes only the fields currently used. It omits many backend fields and collections that are central to the product spec.

Required direction:

- Expand types intentionally by domain.
- Consider generated Directus schema types when stable.
- Separate raw API types from UI view models.

## 3.3 API layer is not organized by domain object

Current APIs are split around `pipeline`, `projects`, and leftover `board/collab`. The future app needs domain APIs:

- `products/api.ts`
- `projects/api.ts`
- `designs/api.ts`
- `collections/api.ts`
- `submissions/api.ts`
- `samples/api.ts`
- `orders/api.ts`
- `reviews/api.ts`
- `work/api.ts`
- `reports/api.ts`
- `reference/api.ts`

## 3.4 Detail modal is doing too much

`TaskDetailModal.tsx` fetches and renders many different pieces of data inline.

Required direction:

- Rename away from `Task`.
- Split into domain detail sections.
- Add route/deep-link support for object type and ID.
- Consider full-page detail for complex business objects, with modal only for quick preview.

## 3.5 No client routing yet

The app uses internal state to switch screens. Deep linking only supports `?item=<uuid>`.

Required direction:

Use routes when the app adds multiple object types:

- `/pipeline`
- `/products/:id`
- `/projects/:id`
- `/designs/:id`
- `/design-collections/:id`
- `/reviews`
- `/submissions/:id`
- `/accounts/:id`
- `/my-work`
- `/reports`

## 3.6 Search is too narrow

Current pipeline search hits product name/code only.

Required direction:

Add global search across:

- Product code/name.
- Project title.
- Retailer.
- Buyer.
- Licensor.
- Property.
- Design name/theme.
- Design collection.
- Factory.
- Order number.
- Brand Assurance number.
- Notes/comments/files.

## 3.7 Filtering is too narrow

Current pipeline filters by licensor only.

Required filters:

- Business unit.
- Lifecycle state.
- Stage.
- Owner/assignee.
- Next owner.
- Retailer.
- Buyer.
- Season.
- Licensor.
- Property.
- Product type.
- Factory.
- Stage age.
- Risk status.
- Missing evidence.
- PI required.
- Brand Assurance missing.
- Sample status.
- Order status.

## 3.8 Pagination/load strategy is still incomplete

The pipeline loads 300 unfiltered products and 500 when filtered. Table pagination paginates only the loaded client slice.

Required direction:

- Server-side pagination.
- Cursor or page state.
- Stable sort.
- Aggregate counts by column/stage.
- Board virtualization or per-column lazy loading.
- Deep link should fetch the specific item even if it is not in the first loaded slice.

## 3.9 Error handling is too quiet

Several catches call `console.error` or silently clear data.

Required direction:

- Toast user-visible failures.
- Distinguish permission issues from empty states.
- Show partial data warnings.
- Retry where appropriate.
- Add structured logging for API failures.

## 3.10 No clear "real vs legacy" boundary in UI

The modal mixes migrated ClickUp data with current PM fields.

Required direction:

- Primary business fields first.
- Legacy ClickUp/source metadata collapsed.
- Imported fields displayed as "Imported evidence" until mapped.
- Encourage users to update new structured fields instead of editing legacy fields.

---

## 4. Extraneous or Potentially Harmful Current Elements

These are not necessarily bad prototypes, but they should not remain as-is in production.

1. **Fake sidebar collections.**
   - They imply saved collections/projects exist.
   - Most are not clickable.

2. **Fake topbar avatars.**
   - They imply active collaborators.

3. **Fake notification badge.**
   - It creates false urgency.

4. **Generic Add New.**
   - It hides critical creation distinctions.

5. **Mock My Work.**
   - It is especially dangerous because "my work" must be trustworthy.

6. **Mock Schedule.**
   - Could be mistaken for real deadlines.

7. **Mock Notes.**
   - Could create another silo if made real without object links.

8. **Mock People.**
   - Does not reflect Entra/Directus users.

9. **Local-only Settings logo upload.**
   - Appears to manage records but does not persist.

10. **ClickUp as primary detail language.**
    - Useful for migration, but should fade behind POP/Spruce business fields.

---

## 5. Things Done in the Wrong Way

This section is intentionally direct. These are not moral failures; they are natural phase-one shortcuts that should not harden into architecture.

### 5.1 Using `MockTask` for real products

Wrong because it preserves the ClickUp mental model. Replace it with domain-specific view models.

### 5.2 Inferring product category from title

Wrong because product type/category drives real business rules. Use backend product type/category data.

### 5.3 Hardcoding operational master data

Wrong because licensors, people, customers, stages, and collections belong in Directus.

### 5.4 Treating stage as the primary truth

Wrong because stage is only one dimension. Lifecycle, next action, owner, blocker, evidence, and SLA matter just as much.

### 5.5 Allowing stage moves without evidence prompts

Wrong because critical business/compliance gates need validation.

### 5.6 Building generic pages before real workflows

Schedule, Notes, People, and Settings are generic app-shaped features. The business needs review queues, submissions, design library, samples, orders, and account views more urgently.

### 5.7 Making ClickUp metadata too prominent

Wrong long-term because the new system should not remain organized around the legacy system.

---

## 6. Missing Feature Inventory

### Core objects

- Product/SKU/style-number workspace.
- Project/offer workspace.
- Design library.
- Spruce design collections.
- Licensor submissions.
- Buyer selections.
- Samples.
- Pricing/factory requests.
- Orders/PO history.
- Revision requests.
- Object-linked notes.
- Stage history.
- Lifecycle state.
- Saved views.

### Core views

- POP pipeline.
- Spruce pipeline.
- Design library grid/table.
- Design collection view.
- Project/offer list and detail.
- Account/retailer view.
- My Work real queue.
- Jessica control room.
- Liz review queue.
- Jen Spruce cockpit.
- Adam sales cockpit.
- Licensing submission queue.
- Sourcing/factory queue.
- Production approval queue.
- Reports/dashboard.

### Core actions

- Create POP project/offer.
- Create preliminary design.
- Convert buyer pick to SKU.
- Create licensor submission.
- Approve/request changes/reject review.
- Record Brand Assurance.
- Record PI status.
- Request sample.
- Record sample received/sent/approved.
- Record PO/order.
- Park/reuse/cancel/complete item.
- Create Spruce collection.
- Convert Spruce selection to style-numbered product.
- Record buyer feedback.
- Record pricing request and response.
- Record factory deadline.
- Batch assign/move/update/export.

### Core automations

- Stage history logging.
- Stage SLA/stuck alerts.
- Licensor response due alerts.
- Missing Brand Assurance alerts.
- Missing PI alerts.
- Dormant concept alerts.
- Next owner handoff notifications.
- Sample/factory overdue alerts.
- Buyer follow-up reminders.
- Multi-buyer/reuse conflict alerts.

### Core reporting

- Work by stage/business unit.
- Work by owner/role.
- Work by retailer/buyer.
- Work by licensor/property.
- Work by product type.
- Stuck work.
- Aging approved concepts.
- Reusable inventory.
- Designer workload.
- Licensor turnaround.
- Factory/sample turnaround.
- Cancellation reasons.
- Season readiness.

---

## 7. Recommended Priority Order

### Priority 0: Stop misleading UI

- Hide or label mock pages.
- Remove fake counts/avatars/collections from production UI.
- Make Add New either real or hidden.

### Priority 1: Replace task abstraction

- Introduce domain models.
- Rename `TaskDetailModal`.
- Remove `MockTask` from real pipeline.

### Priority 2: Separate POP and Spruce

- Add business-unit filters and default views.
- Use separate stage sets and detail layouts.

### Priority 3: Add real My Work

- Current user.
- Product assignments.
- Subtasks.
- Role-owned stage queues.
- Review queues.

### Priority 4: Enrich product and project detail

- Add missing business fields.
- Add lifecycle state.
- Add next action/owner/blocker.
- Add stage history and evidence sections.

### Priority 5: Build role queues

- Jessica control room.
- Liz review queue.
- Jen Spruce cockpit.
- Adam sales cockpit.
- Licensing/sourcing/production queues.

### Priority 6: Build design library and Spruce collections

- Rescue lost creative inventory.
- Enable reuse and proactive seasonal planning.

### Priority 7: Add submissions, samples, orders

- Make approval and execution workflows first-class.

### Priority 8: Add analytics and AI

- SLA dashboards.
- Bottleneck reports.
- Reuse recommendations.
- AI assistant with citations.

---

## 8. Final Assessment

The current frontend is not wrong as a first slice. It proves that:

- Directus can back a custom PM UI.
- Product data can be shown at useful scale.
- Stage movement works.
- Imported ClickUp evidence can be preserved.
- The frontend can deploy cleanly.

But it is not yet tailored enough to the business. The next engineering phase should not be more generic app polish. It should reshape the product around the real business graph:

- POP and Spruce are separate workflows on one platform.
- Designs and collections are first-class.
- Stage is only one piece of status.
- Role queues matter more than generic boards.
- Submissions, samples, orders, and revisions need their own models.
- Lifecycle and reuse are essential.
- The system should reduce chasing by making next action and owner obvious.

The strategic risk is accidentally building another generic project management board. The strategic opportunity is building the first system that actually understands how POP Creations and Spruce Line create, approve, source, sell, and reuse products.


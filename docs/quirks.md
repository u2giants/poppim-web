# Intentional quirks and non-obvious decisions

Moved out of AGENTS.md so the always-load guide stays a router. Load this file when behavior looks wrong or surprising.


### Supabase is the backend API/database, not the frontend runtime
What changed:
The 2026-06-22/23 migration removed the old backend SDK client from this repo and rewired the React app to use `@supabase/supabase-js` against `https://qsllyeztdwjgirsysgai.supabase.co`.

Why:
The frontend is still the custom React/TypeScript SPA in this repo, built by GitHub Actions and served by Coolify/nginx at `pm.designflow.app`. Supabase owns auth, API, database schema, RLS, realtime, and storage; it is not where the SPA is hosted.

Future sessions should:
When describing or changing this app, say "frontend data/auth layer uses Supabase" rather than "frontend runs on Supabase." Frontend runtime/deploy issues belong in this repo/Coolify; schema/RLS/migration issues belong in canonical `u2giants/shared-db`.

### shadcn uses the `new-york` (Radix) style, not the CLI default
Looks like: `components.json` has `style: "new-york"` and components import from `radix-ui`, even though `npx shadcn init` now defaults to `base-nova` (Base UI).
Actually: we deliberately switched to the Radix-based `new-york` style.
Why: Base UI uses a `render` prop instead of Radix's `asChild`, and most shadcn docs/examples assume Radix — for an AI-assisted, docs-driven workflow that mismatch caused friction (and an unused-`React`-import build error).
Do not change because: reverting to Base UI breaks every `asChild` usage and diverges from the examples future sessions will copy.

### Auth uses Supabase Auth in the browser
`src/lib/supabase.ts` creates the browser client with `persistSession`, `autoRefreshToken`, and `detectSessionInUrl`. Microsoft sign-in goes through `supabase.auth.signInWithOAuth({ provider: 'azure' })`, and `src/auth/auth.tsx` resolves the app profile through `api.current_user_profile`.
Do not reintroduce an app-owned token store or a legacy backend SSO URL. Supabase Auth owns the session lifecycle.

### `PimTaskCard` needs `shrink-0`
Looks like: a stray `shrink-0` on the card.
Actually: cards are flex children in a fixed-height column; without `shrink-0` they get squeezed by flex-shrink to ~2px and the column won't scroll.
Why/Do not change: removing it collapses every card (this exact bug shipped once — see §14).

### `cover_url` points at Spaces originals; thumbnails are derived
Looks like: the frontend only reads `product.cover_url`, but cards show a smaller thumbnail.
Actually: `cover_url` is the DigitalOcean Spaces original uploaded by the backend migration. `src/domain/products/adapters.ts` derives `covers/<product-id>_thumb.webp` for cards when the original URL is in the Spaces `covers/` prefix; `TaskDetailModal` opens the original.
Why: the user explicitly wanted originals stored without resizing, while cards need fast thumbnails.
Do not change because: replacing `cover_url` with a resized file would lose the original. If a thumb 404s, `PimTaskCard` falls back to the original once.

### Runtime app code no longer uses mock tasks
What changed:
The generic `MockTask` layer and `src/lib/mockData.ts` were removed from runtime code. `ProductSummary` in `src/domain/products/types.ts` is now the board/detail view model, and raw backend data is adapted in `src/domain/products/adapters.ts`.

Why:
The app is no longer a ClickUp-board demo; it now works from real business objects and workflow tables in Supabase.

Future sessions should:
Do not reintroduce generic task-shaped mock data into real screens. Use Supabase-backed feature APIs and add isolated fixtures only for tests/stories if those are introduced later.

### Workflow search filters must be collection-specific
What changed:
`src/features/workflow/api.ts` uses separate search filters for submissions, samples, and revisions.

Why:
The backend rejects filters on fields that do not exist on the target table/view. A shared workflow search filter looked convenient but queried fields like `body` on samples and `portal_reference` on revisions.

Future sessions should:
When adding fields to search, confirm the field exists on that collection or relation before adding it to the `_or` filter.

### Pipeline filters are server-side (Supabase)
Search and licensor filters are pushed to the backend. The pipeline loads a bounded product set for the active department, with count/truncation UI when applicable. Search is debounced 300 ms; stale fetch results are discarded via an incrementing ref.
Do not assume: all 15K+ products are loaded at once — they aren't.

### Product Pipeline failures must be verified in a browser
Looks like:
If `Product pipeline` shows "could not load" or empty columns, it can be tempting to inspect only the source bundle, Supabase schema cache, or table row counts.

Actually:
The pipeline has several independent failure points that only became obvious in an authenticated browser on 2026-06-30. The confirmed chain was: an old `product_assignee` embed error, then overlong `api.pm_product_board?id=in.(...)` enrichment URLs, then `pim.product.select('*')` timing out on huge ClickUp `metadata`, then `app.comment` RLS denying comment-count rollups, then empty first-viewport columns because seeded/reference stages did not match restored ClickUp statuses.

Why:
The board is composed from `src/features/pipeline/api.ts`, `src/domain/products/enrich.ts`, `src/domain/products/rollups.ts`, and `src/features/pipeline/PipelinePage.tsx`. A fix in one layer can uncover the next failing layer, and unauthenticated checks only show the login page.

Do not change because:
Keep the pipeline fetch lean: do not reintroduce `select('*')` on `pim.product`; keep `pm_product_board` enrichment batches small; treat optional rollups such as comment counts as non-fatal unless RLS is fixed in `shared-db`; and put real loaded task stages before empty reference stages. Before reporting the pipeline fixed, authenticate a browser session, click `Product pipeline`, confirm cards are visible, check the current console/network errors, and verify production is serving the expected `build-sha`.

### Departments are hard-separated, not optional filters
What changed:
The app-level departments are `Licensed`, `Generic`, and `Software`. `Licensed` maps to legacy backend values `POP` / `POP Creations`; `Generic` maps to `Spruce` / `Spruce Line`; `Software` maps to `Software`.

Why:
The user explicitly rejected a mixed `All` board/filter model. These departments should never mix in the live app.

Future sessions should:
Do not reintroduce an `All` department tab or treat department as a casual filter. If backend values are renamed later, update the alias logic in `src/domain/products/adapters.ts` and each feature API's department clause.

### Pipeline departments mirror live ClickUp top-level open cards
What changed:
The product pipeline has three hard-separated departments: `Licensed`, `Generic`, and `Software`. Each department excludes ClickUp subtasks via `clickup_parent_id _null`, excludes closed/done ClickUp statuses via `clickup_status_type _in ['open', 'custom']`, and sorts by `-clickup_updated_at`. It is intentionally not limited to the old `Licensing Management` list because the backend parity pass imports all live ClickUp lists into department-specific product rows.

Why:
ClickUp's Board views showed top-level open tasks sorted by "Date updated"; Poppim was previously mixing departments, hiding non-`Licensing Management` lists, subtasks, closed/done historical records, and unsorted rows.

Future sessions should:
If cards or counts drift from ClickUp, first verify `business_unit`, `clickup_parent_id`, `clickup_status_type`, `clickup_list_name`, and `clickup_updated_at` in Supabase before changing frontend grouping. A 2026-06-14 backend audit matched 17,859 live ClickUp task ids to 17,859 Poppim external ids with 0 missing and 0 extra.

### No client-side router
The app uses a simple auth gate in `App.tsx`, not routes. Deep-linking is done with `history.replaceState` + `URLSearchParams` (`?item=<uuid>`). `react-router-dom` is installed but not used — don't add route components without a clear reason.

### Department switch clears the List filter via the topbar tab onClick, NOT a reactive effect
What changed:
Switching department (Licensed/Generic/Software) clears `filterListNames`. This is done in the `BUSINESS_UNITS` button `onClick` in `Topbar.tsx`, not in a `useEffect` watching `businessUnit`.
Why:
A reactive effect (`if prevBusinessUnit !== businessUnit → clear`) was tried first and clobbered the sidebar Spaces tree: clicking a list sets department + list filter together, and the effect fired on the department change and wiped the just-set filter. Lists are department-specific, so a stale filter must clear on an *explicit* tab switch only.
Future sessions should:
Do not move this back into a `useEffect`. If you add another way to switch department, clear `filterListNames` in that same explicit handler.

### ClickUp orderindex is a string; sort numerically, and it truncates past 5,000
What changed:
`clickup_orderindex` is stored as a 32-decimal varchar (exceeds float64). `adapters.ts` parses it with `Number()` into `ProductSummary.clickupOrderindex`; `PipelinePage` sorts cards within each kanban column / table group by it (`byOrderindex`, nulls last).
Why:
Lexical string sort is wrong ("10" < "5"). Ordering is only *exact* within a single list; across lists in one stage column it's a stable secondary order. The pipeline caps at 5,000 loaded rows, so the only list exceeding that (`Licensing Management`, ~11,575) is still order-exact only on the loaded subset even when filtered to it.
Future sessions should:
Never sort orderindex lexically. Don't claim "exact ClickUp order" globally — it holds per-list, and not for lists over the 5,000 load cap.

### ClickUp time estimate is sparse — render only when set
What changed:
`clickup_time_estimate_ms` is populated for only ~123 of 17,859 products (ClickUp returns null when unset, not 0). The modal shows a "Time estimate" field only when the value is non-null (`formatDuration`).
Future sessions should:
Treat null as "no estimate." Do not add it to cards or default it to 0 — it would be blank noise on ~99% of products.

### Do not display `product.code` — it's an internal ClickUp-style id
What changed:
`product.code` holds a ClickUp-task-style string (e.g. `8688wgqth`), not a human SKU. It was being prepended to product titles (`code · title`) and was removed from every display surface (2026-06-17/18): pipeline card + table, Control Room, My Work, Projects, Orders, Samples, Submissions, Revisions, Reports, and the modal's linked-product label. Surfaces now show the title alone.
Why:
Users read it as "random characters." It crept in across ~10 components because the `[x.code, x.title].filter(Boolean).join(' · ')` idiom was copy-pasted.
Future sessions should:
When rendering a product/summary label, show `title` (or `name`) only — do not reintroduce `code` into list/card labels. If a genuine human-facing SKU exists later, add a dedicated field; don't repurpose `code`.

### Saved Views: Space = department, per-user prefs live in pm_view_pref
What changed:
The sidebar is a saved-views model, not a literal ClickUp tree. Each department (Licensed/Generic/Software) is a "Space" with a virtual Master view ("All") pinned first, then `pm_saved_view` rows (company-`shared` ∪ the user's `personal`). Applying a view writes its `filters_json` + `business_unit` into appState. Per-user reorder/recolor/hide of *any* view (including shared/seeded) is stored in a separate `pm_view_pref` row — the view record itself is never mutated by a non-owner.
Why:
A shared view is one record seen by many users, so per-user order/color/hidden cannot live on it. `pm_view_pref` (one row per user+view) holds the overrides. "Deleting" a shared/seeded view sets `pm_view_pref.hidden=true` (per-user); only the owner can hard-`deleteView`.
Future sessions should:
There is **no composite-unique (user, view)** at the DB layer — `upsertViewPref` does read-then-write. Don't assume DB-enforced uniqueness. Seeded list views are `origin='clickup_list'`, color `#8C9BB5`; re-running `seed-clickup-list-views.mjs` is idempotent (skips by name+business_unit).

### pm_saved_view / pm_view_pref permissions are wildcard; scoping is in the query
What changed:
Legacy note: both saved-view collections previously granted wildcard CRUD with no row filter across the app policies. In the Supabase-backed app, verify current RLS/policies in `shared-db` before assuming view isolation behavior.
Why:
This matches how `pm_saved_view` already worked before this feature; tightening it was out of scope and risked breaking existing saved views.
Future sessions should:
Treat view isolation as client-enforced until verified in `shared-db`. If true row-level security is needed later, add it in canonical `u2giants/shared-db` — don't assume it exists today.

### Inline field edits are optimistic and fail silently
What changed:
Editable fields in `TaskDetailModal` keep a `local` override object layered over the `task` prop; `applyLocal` updates state then calls `updateProduct` (`collab.ts`), reverting the override on error with no toast.
Why:
Matches the existing drag-to-stage / checklist optimistic pattern.
Future sessions should:
If a "field didn't save" bug is reported, check Supabase write/RLS permissions and the network response — the UI gives no error signal, so a silent revert (value snaps back) is the symptom.

### PM operating records are Supabase tables, not local UI state
What changed:
Dependencies, decisions, reminders, and reusable workflow templates live in Supabase and are surfaced through `src/features/operating/api.ts`. Product detail has an Operations tab; My Work lists reminders assigned to the signed-in user; Settings lists/creates workflow templates; Reports counts open dependencies/reminders, decisions, and active templates.

Why:
The PM system needs durable operational records for blockers, approvals/decisions, follow-ups, and repeatable stage/checklist patterns. A frontend-only implementation would lose the audit trail and would not be available to Reports/My Work.

Future sessions should:
Add schema fields in canonical `shared-db` first, then update `src/lib/types.ts` and `src/features/operating/api.ts`. External notification delivery is not implemented in this frontend; reminders are in-app records until a backend worker/automation is added.

### `retailer`/`buyer` are curated customer tables; the raw CRM dump lives in `ingested_*`
What it is:
Legacy CRM ingestion separated curated customers from raw ingested domains before the shared Supabase migration. **Current app customer pickers must use `api.pm_customer_list`** (global active/potential AND PM extension active). The historical `api.customer_list` relation was deliberately removed and must not be resurrected. Buyer/contact reads use `core.contact` / `core.contact_company`. Historical end state:
- **`retailer` (picker)** = rows from `api.pm_customer_list` only; labels prefer curated `display_name`.
- **`buyer`** = curated buyers via `core.contact` / `core.contact_company`.
- **`ingested_domains` / `ingested_contact`** = CRM-private email triage data. **Not for app pickers.** Never associate ingested domains with `core.customer`.
Why:
The product owner's rule: apps must only ever see real customers (active/potential), never a table that is ~97% ingested garbage.
Future sessions should:
Read curated customer/contact data through `fetchCustomers()` / `fetchBuyers(retailerId)` in `features/board/collab.ts`. `fetchCustomers()` must read `api.pm_customer_list` (constant `PM_CUSTOMER_LIST` in `domain/reference/pmCustomerList.ts`). Never call `.from('customer_list')`. Never point an app picker at raw ingested-domain/contact tables.


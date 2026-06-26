# fix_new_schema.md - Customer Views/RPC Cutover Plan

Read this top to bottom before changing anything. It assumes no prior context and
orders the work so shared database safety comes before app rewrites.

This plan merges the earlier PM migration guide with the customer views/RPC
cutover review. It supersedes the risky assumption that production can hard-rename
`core.company` without either an apps-first verification pass or a temporary
compatibility shim.

Do not edit `/worksp/poppim-web/shared-db/`. It is a read-only mirror of
`u2giants/shared-db`. Any database migration or shared-db documentation change
belongs in canonical `/worksp/shared-db` on a branch and PR.

## 1. What Changed In The Shared Database

The shared Supabase backend is being restructured so the canonical customer table
holds customers only, not email noise, factories, licensors, or generic companies.

| Before | After |
|---|---|
| `core.company`, a mixed table of customers, prospects, and ingested email domains | `core.customer`, customers only |
| Email-domain noise mixed into the customer/account table | `crm.ingested_domain`, CRM-only triage data |
| "Real customer" inferred from `customer_status` | `core.customer.is_potential`: `false` for ERP/PLM-confirmed customers, `true` for potential customers |

Important names that intentionally do not change:

- Foreign-key columns stay named `company_id` in PM/CRM/DAM tables.
- `core.company_source_ref` keeps its name.
- `customer_status` still exists for existing UI/status behavior.

`is_potential` is the factual confirmed-vs-potential signal. It must not be used
as a visibility filter by itself.

## 2. Target API Shape

Use app-facing views and RPCs as the stable API over `core.customer`.

- `api.customer_list` is the canonical shared plain customer list for pickers,
  dropdowns, and basic customer reads.
- `api.crm_account_list` remains independent for CRM account-management screens.
- DAM's `search_style_tracker_link_candidates` remains independent because it is
  ranked multi-entity search, not a customer list.
- Customer writes must go through app-appropriate `api.*` RPCs, not direct
  browser writes to `core.customer`.

This preserves a clean end state with no permanent `core.company` object while
still giving production a safe cutover path.

## 3. First: Tighten `api.customer_list` In `shared-db`

Before apps converge on `api.customer_list`, define the view contract in
canonical `/worksp/shared-db`.

Create a new timestamped migration, never edit an applied migration. The
migration should replace `api.customer_list` so it exposes only stable,
picker-safe columns:

- `id`
- `name`
- `customer_status`
- `is_potential`
- `domain`
- `status`
- `updated_at`

Do not expose raw `metadata`. If PM, CRM, or DAM need metadata-derived fields,
expose named audited columns in a specific view or add a narrowly scoped
app-specific view.

The view semantics are:

- Return listable customer rows only.
- Include both confirmed active customers and potential customers unless a row is
  explicitly archived, deleted, or hidden by a dedicated status field.
- Do not filter on `is_potential = false`; that would hide potential customers
  that may still be valid in PM/CRM workflows.
- Use `security_invoker = true` so caller RLS still applies.

Migration sketch:

```sql
create or replace view api.customer_list
with (security_invoker = true) as
select
  c.id,
  c.name,
  c.customer_status,
  c.is_potential,
  c.domain,
  c.status,
  c.updated_at
from core.customer c;

comment on view api.customer_list is
  'Shared plain customer list for picker/basic reads. Exposes only stable, picker-safe columns. Includes listable active and potential customers; is_potential is not a visibility filter. App-specific account views/RPCs should expose specialized fields.';

grant select on api.customer_list to authenticated;
```

Run in `/worksp/shared-db`:

```bash
scripts/check-sql.sh
supabase db push --dry-run
```

Then apply the migration to the preview branch and verify the view before any
production promotion.

## 4. Keep Specialized APIs Separate

CRM:

- Keep `api.crm_account_list` separate.
- It may read `core.customer` directly and expose CRM-only fields such as sales
  owner, routing aliases, departments, account state, and internal CRM metadata.
- Do not rebuild it on top of `api.customer_list` unless the team later confirms
  CRM should always see exactly the shared picker row set plus extras.

DAM:

- Keep `search_style_tracker_link_candidates`.
- Repoint internals to `core.customer` where needed.
- Do not replace fuzzy multi-entity search with `api.customer_list`.

PM:

- Plain customer reads should use `api.customer_list`.
- Buyer/contact reads may continue through `core.contact` /
  `core.contact_company` or future API views as needed.
- PM account-style screens that need extra customer fields should use explicit
  named columns or a PM-specific view, not raw `metadata` from `api.customer_list`.

## 5. Audit All Consumers Before Production Rename

Before choosing the production cutover path, audit runtime consumers, not just
visible frontend screens.

Search `poppim-web`, `popcrm-web`, `popdam-web`, `/worksp/shared-db`, scripts,
workers, Supabase functions, importers, docs examples, dashboards, and generated
types for:

```text
core.company
.from('company')
from core.company
references core.company
company:company_id
customer_list
```

Confirm no runtime consumer depends on `core.company` before choosing the
apps-first production cutover path.

In this repo, also search:

```bash
rg "from\(['\"]company['\"]\)|from\(['\"]customer['\"]\)|core\.company|company:company_id|customer:company_id" src/
```

`company:company_id(...)` may be only a local response alias, but do not ignore
it. Open the file, decide whether it should stay, and smoke-test that screen
against the renamed schema.

## 6. Update PM Plain Customer Reads

This app accesses Supabase schemas through helpers in
`src/lib/supabaseQuery.ts`. Use the existing `api()` helper for
`api.customer_list`; do not add direct `supabase.schema('api')` calls for this
change.

Change plain customer reads from schema `core`, table `company` or `customer`, to
schema `api`, view `customer_list`.

### `src/domain/reference/api.ts`

`fetchRetailers()` should read:

```ts
const { data, error } = await (api() as any)
  .from('customer_list')
  .select('id,name,customer_status,is_potential')
  .order('name')
```

### `src/features/board/collab.ts`

`fetchCustomers()` should read:

```ts
const { data, error } = await (api() as any)
  .from('customer_list')
  .select('id,name,customer_status,is_potential')
  .order('name')
```

### `src/features/accounts/api.ts`

Do not read raw `metadata` from `api.customer_list`. If the Accounts screen still
needs fields such as `resale_restriction` or `notes`, choose one of these before
implementation:

- expose those fields as named audited columns on an app-specific API view, or
- remove them from this migration and keep the Accounts screen on a specialized
  read path until that view exists.

Do not put `metadata` back onto the shared `api.customer_list` just to satisfy
this screen.

After PM changes, this app should not read `core.customer` directly for plain
customer lists.

## 7. Regenerate Supabase Types

Regenerate `src/lib/database.types.ts` from the environment being tested.

Use preview until production has the rename and `api.customer_list` is exposed
through PostgREST:

```bash
supabase gen types typescript --project-id xjcyeuvzkhtzsheknaiu --schema app,core,crm,pim,api > src/lib/database.types.ts
```

Use production only after production has the schema:

```bash
supabase gen types typescript --project-id qsllyeztdwjgirsysgai --schema app,core,crm,pim,api > src/lib/database.types.ts
```

Then run `npm run build` and fix compile errors caused by old `company` table
types or outdated view shapes.

## 8. Optional PM Cleanup: Adopt `is_potential`

This is recommended, but not required to prevent the rename break.

1. Add `is_potential?: boolean` to the relevant customer/retailer app type.
2. Where code treats `customer_status === 'ACTIVE_CUSTOMER'` as "confirmed
   customer", prefer `is_potential === false`.
3. Do not rename every app-facing `Retailer` or `retailer` concept during this
   migration. Keep product-language cleanup separate.

## 9. Preview Verification

Shared-db:

- `scripts/check-sql.sh` passes.
- Preview dry-run has only intended view/comment changes.
- Preview migration is applied.
- `api.customer_list` returns the expected columns and does not return
  `metadata`.
- PostgREST exposes the `api` schema on preview.

PM:

- Accounts list loads, or the Accounts screen's specialized read path is
  explicitly documented if it cannot use `api.customer_list` yet.
- Project customer picker loads.
- Product detail customer picker loads.
- Projects rows load; any `company:company_id(...)` embed still works or has
  been replaced.
- `npm run build` passes after type regeneration.

CRM:

- Account list loads.
- Account update RPC still works.
- CRM-only fields still appear where expected.

DAM:

- Master Data candidate search still returns customers, licensors, properties,
  factories, and SKUs as expected.
- Customer candidates use `core.customer` semantics, not old email-noise domains.

## 10. Production Cutover

Production must not receive a hard `core.company` rename without either Path A
verification or the Path B temporary shim.

### Path A: Preferred Apps-First Cutover

1. Finish PM, CRM, and DAM changes so no app reads `core.company` directly.
2. Verify all three apps against preview.
3. Audit hidden consumers, including scripts, workers, functions, importers,
   docs examples, dashboards, and generated types.
4. Promote the production rename only after the audit is clean.
5. End with no `core.company` object.

### Path B: Fallback Temporary Shim

Use this path only if all consumers cannot be guaranteed migrated before the
production rename.

1. Production migration may temporarily create `core.company` as a compatibility
   view over `core.customer`.
2. Document the shim as temporary in the migration and shared-db docs.
3. Name the exact drop condition: all apps and hidden consumers have been
   verified off the old name.
4. Drop the shim only after that condition is met.

The owner wants no permanent `core.company`; Path B is only a cutover safety
tool.

## 11. Post-Cutover Verification

After production deploy/promotion:

- Confirm `api.customer_list` works through production PostgREST.
- Repeat the PM smoke tests on `pm.designflow.app`.
- Repeat CRM and DAM customer/account/search smoke tests on their production
  URLs.
- Regenerate types from production if preview-generated types were used during
  the transition.
- Re-run the consumer audit and drop any temporary `core.company` shim only after
  the agreed drop condition is met.

## 12. Commit Rules

For app repos such as `poppim-web`, commit straight to `main` after the build
passes; CI deploys the app.

For canonical `shared-db`, use branch + PR, apply to preview first, verify all
dependent apps, then merge and promote production only in an approved window.

Never commit secrets, service-role keys, database passwords, or `.env` files.

## 13. Quick Checklist

- [ ] Create shared-db migration tightening `api.customer_list`.
- [ ] Remove `metadata` from the shared view.
- [ ] Add SQL comment documenting the shared view contract.
- [ ] Run shared-db SQL checks and preview dry-run.
- [ ] Apply shared-db migration to preview.
- [ ] Audit all app/runtime consumers for `core.company`.
- [ ] Update PM plain customer reads to `api.customer_list`.
- [ ] Resolve PM Accounts metadata needs without re-exposing shared raw metadata.
- [ ] Regenerate Supabase types from preview.
- [ ] Run `npm run build`.
- [ ] Smoke-test PM, CRM, and DAM against preview.
- [ ] Choose Path A or Path B before production rename.
- [ ] Promote production only after the selected cutover gate is satisfied.
- [ ] Regenerate production types and repeat smoke tests after production cutover.

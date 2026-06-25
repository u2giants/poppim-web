# fix_new_schema.md — poppim-web (PM/PIM) shared-schema migration

**Read this top to bottom before changing anything. It assumes you have zero prior
context.** It tells you exactly what changed in the shared Supabase database and
what *this* app must change. Every file/line below is in **this** repo
(`poppim-web`). Do **not** edit the vendored `shared-db/` folder — it is a
read-only auto-synced copy.

---

## 1. What changed in the shared database (and why)

The shared Supabase Postgres backend (project `qsllyeztdwjgirsysgai`, which this
app talks to) was restructured so the canonical customer table holds **only
customers** — not email noise, not factories, not licensors.

| Before | After |
|---|---|
| `core.company` (a table that mixed real customers, prospects, and every ingested email domain) | **`core.customer`** — customers only. **`core.company` no longer exists** (hard rename, no fallback). |
| "is this a real customer?" was guessed from `customer_status` | New column **`core.customer.is_potential`**: `false` = active/confirmed customer (exists in PLM/ERP), `true` = potential customer (not yet in PLM/ERP). |

**What did NOT change** (do not "fix" these — they are intentional):
- The foreign-key **column** `company_id` keeps its name everywhere
  (`pim.project.company_id`, `pim.product.company_id`,
  `pim.customer_order.company_id`, `pim.design_collection.company_id`,
  `core.contact_company.company_id`). Only the **table** was renamed.
- `core.company_source_ref` keeps its name.
- The `customer_status` column still exists, so your existing enum-based UI keeps
  working. `is_potential` is an additional, more reliable signal — adopt it when
  convenient (§6).

Full rationale: `shared-db/docs/shared-database-vision.md` → "Customer vs.
Company vs. Ingested Domain".

---

## 2. The approach: read through the shared "front desk" view, not the raw table

Today this app reaches into the shared table **directly** by name
(`.from('company')`) in three places. That is fragile: any time the table is
renamed or reshaped, this app breaks, and the database change and an app redeploy
have to be timed to the same moment or real users see errors.

The fix is to read customers through a **stable read-only view** instead of the
raw table. A view is a "front desk": the app asks the front desk for the customer
list, and if the underlying table ever changes again, the front desk is adjusted
once and **this app never breaks**. CRM and DAM already work this way.

That view has been created for you in the shared database:

- **`api.customer_list`** — a read-only list over `core.customer`, exposing:
  `id, name, customer_status, is_potential, domain, status, metadata, updated_at`.

So the change in this app is: point the three customer reads at
`api.customer_list` (schema `api`) instead of `company`/`customer` (schema
`core`).

---

## 3. Required code changes (exact)

This app accesses Supabase schemas via helpers in `src/lib/supabaseQuery.ts`
(e.g. `core()` returns the client scoped to the `core` schema). Read customers
from the `api` schema's `customer_list` view instead. If there is no `api()`
helper yet, add one next to `core()` (one line, same pattern), or call
`supabase.schema('api')` directly.

**`src/domain/reference/api.ts:10`** (`fetchRetailers()`)
```diff
- const { data, error } = await (core() as any).from('company').select('id,name,customer_status').order('name')
+ const { data, error } = await (supabase.schema('api') as any).from('customer_list').select('id,name,customer_status,is_potential').order('name')
```

**`src/features/board/collab.ts:300`** (`fetchCustomers()`)
```diff
- const { data, error } = await (core() as any).from('company').select('id,name,customer_status').order('name')
+ const { data, error } = await (supabase.schema('api') as any).from('customer_list').select('id,name,customer_status,is_potential').order('name')
```

**`src/features/accounts/api.ts:18`** (`fetchAccountRows()`, inside the `Promise.all`)
```diff
-   (core() as any).from('company').select('id,name,customer_status,metadata').order('name'),
+   (supabase.schema('api') as any).from('customer_list').select('id,name,customer_status,is_potential,metadata').order('name'),
```

(Use whatever the app's existing pattern is for reaching a schema — mirror how
`core()` is defined. The point is: **schema `api`, view `customer_list`**, not
schema `core`, table `company`/`customer`.)

Then confirm nothing still reaches the raw table directly:
```bash
grep -rn "from('company')\|from(\"company\")\|from('customer')\|core\.company" src/
```
Expect zero hits (matches inside `shared-db/` don't count).

After this, **this app never reads `core.customer` directly**, so future shared
table changes won't break it and there is no lockstep-deploy requirement (see §7).

---

## 4. Instructions for adding views / RPCs to the shared database

You normally won't need to add anything — `api.customer_list` already exists. This
section documents the pattern so a future change is easy and so you understand
where the front desk lives.

**Where:** shared views/RPCs live in the canonical repo **`u2giants/shared-db`**
(NOT in this app, and NOT in this app's read-only `shared-db/` copy). Per
`shared-db/AGENTS.md`, a shared-db change is a new timestamped SQL migration on a
branch → PR → applied to the **preview** branch (`xjcyeuvzkhtzsheknaiu`) → merged
to `main`. App repos must never hand-edit their vendored `shared-db/` folder.

**A read view (what `api.customer_list` is)** — apps READ through this:
```sql
-- supabase/migrations/<timestamp>_api_customer_list_view.sql  (in u2giants/shared-db)
create or replace view api.customer_list
with (security_invoker = true) as          -- caller's row-level security still applies
select c.id, c.name, c.customer_status, c.is_potential,
       c.domain, c.status, c.metadata, c.updated_at
from core.customer c;

grant select on api.customer_list to authenticated;
```

**A write RPC (only if an app ever needs to CHANGE a customer)** — apps never get
direct write access to the table; they call a function that does the write safely.
PM only reads customers today, so PM does **not** need this — included only as the
pattern to follow (CRM's `api.crm_update_account` is a real example):
```sql
create or replace function api.update_customer(p_id uuid, p_name text default null /* ... */)
returns api.customer_list                  -- or core.customer
language plpgsql
security definer                            -- runs with elevated rights, enforces its own checks
set search_path = api, core, app, public
as $$
begin
  -- (authorization checks here, e.g. app.has_app_access('pm'))
  update core.customer c set name = coalesce(p_name, c.name) where c.id = p_id;
  -- return the updated row...
end;
$$;
grant execute on function api.update_customer(uuid, text) to authenticated;
```
From the app you'd then call
`supabase.schema('api').rpc('update_customer', { p_id, p_name })` instead of
writing to the table directly.

---

## 5. Regenerate the Supabase TypeScript types

`src/lib/database.types.ts` is auto-generated and currently describes the old
`company` table (around lines 1163–1228). Regenerate it so the types match the new
schema (the `customer` table, the `api.customer_list` view, and `is_potential`):

```bash
supabase login          # or export SUPABASE_ACCESS_TOKEN=<token from owner/1Password>
supabase gen types typescript --project-id qsllyeztdwjgirsysgai --schema app,core,crm,pim,api > src/lib/database.types.ts
```
> Generate from **production** only once production has actually been renamed.
> To regenerate beforehand, target the **preview** branch which already has the
> new schema: `--project-id xjcyeuvzkhtzsheknaiu`. Then `npm run build` and fix any
> remaining compile errors (switch old `company` row types to `customer`).

Optional `package.json` script:
```json
"gen:types": "supabase gen types typescript --project-id qsllyeztdwjgirsysgai --schema app,core,crm,pim,api > src/lib/database.types.ts"
```

---

## 6. Optional but recommended: adopt `is_potential`

The selects in §3 now include `is_potential`. To use it:
1. Add `is_potential?: boolean` to the `Retailer` interface in `src/lib/types.ts`
   (~lines 18–24).
2. Where code treats `customer_status === 'ACTIVE_CUSTOMER'` as "real customer,"
   prefer `is_potential === false` — it's owned by the PLM/ERP import and is more
   reliable than the manually-set enum.

Correctness improvement, not a breakage fix — do it whenever.

---

## 7. Cutover sequencing (now relaxed)

Because this app now reads through the `api.customer_list` view (whose name does
not change) instead of the raw table, **the tight production-cutover window is
gone**. The view already exists on the preview branch and will exist on production
before/when the rename is promoted, so:

- You can ship the §3 + §5 changes on your normal schedule.
- When the shared-db owner promotes the rename to production, this app keeps
  working because it asks the front desk, not the raw table.

(Before this change, the app grabbed `core.company` directly and would have broken
the instant production was renamed — that risk is what the view removes.)

---

## 8. How to verify

```bash
npm install
npm run dev   # point .env at preview xjcyeuvzkhtzsheknaiu to test the new schema, then revert
```
- Open Accounts → the list loads (no console error).
- Open a Project → the customer/retailer picker populates.
- Open a Product detail modal → the customer picker populates.
- `npm run build` passes with the regenerated types.

After production deploy: repeat the three checks on `pm.designflow.app`.

---

## 9. Commit rules for this repo

Per this repo's `AGENTS.md`: app repos **commit straight to `main`** (no feature
branches), build must pass, then push; CI deploys. Do **not** touch the
`shared-db/` folder (auto-synced from `u2giants/shared-db`; edits there are
overwritten).

---

## 10. Quick checklist

- [ ] `src/domain/reference/api.ts:10` → read `api.customer_list` (schema `api`)
- [ ] `src/features/board/collab.ts:300` → read `api.customer_list`
- [ ] `src/features/accounts/api.ts:18` → read `api.customer_list`
- [ ] `grep -rn "from('company')\|from('customer')\|core\.company" src/` returns nothing
- [ ] Regenerate `src/lib/database.types.ts`; `npm run build` passes
- [ ] Update `AGENTS.md` §11 wording (`core.company` → via `api.customer_list`)
- [ ] (optional) adopt `is_potential` in `src/lib/types.ts`
- [ ] Smoke-test Accounts + project/product customer pickers

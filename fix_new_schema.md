# fix_new_schema.md — poppim-web (PM/PIM) shared-schema migration

**Read this top to bottom before changing anything. It assumes you have zero prior
context.** It tells you exactly what changed in the shared Supabase database, what
*this* app must change, and the order to do it in so you don't take production
down. Every file/line below is in **this** repo (`poppim-web`). Do **not** edit
the vendored `shared-db/` folder — it is a read-only auto-synced copy.

---

## 1. What changed in the shared database (and why)

The shared Supabase Postgres backend (project `qsllyeztdwjgirsysgai`, which this
app talks to) was restructured so the canonical customer table holds **only
customers** — not email noise, not factories, not licensors.

| Before | After |
|---|---|
| `core.company` (a table that mixed real customers, prospects, and every email domain ever ingested) | **`core.customer`** — customers only. **`core.company` no longer exists** (hard rename, no compatibility view). |
| "is this a real customer?" was guessed from `customer_status` | New boolean column **`core.customer.is_potential`**: `false` = active/confirmed customer (exists in PLM/ERP), `true` = potential customer (not yet in PLM/ERP). Kept correct automatically by a DB trigger. |
| email domains were dumped into `core.company` | now live in a separate CRM-only table `crm.ingested_domain` (not your concern in PM) |

**What did NOT change** (do not "fix" these — they are intentional):

- The foreign-key **column** `company_id` keeps its name everywhere
  (`pim.project.company_id`, `pim.product.company_id`,
  `pim.customer_order.company_id`, `pim.design_collection.company_id`,
  `core.contact_company.company_id`). Only the **table** was renamed.
- `core.company_source_ref` keeps its name (it links a customer to its source
  system IDs).
- The `customer_status` column (`ACTIVE_CUSTOMER` / `POTENTIAL_CUSTOMER` /
  `OTHER` / `UNASSIGNED`) still exists on `core.customer`. Your existing
  enum-based UI keeps working. `is_potential` is an *additional*, authoritative
  signal — adopt it when convenient (§5), but nothing forces you to right now.

Full rationale lives in `shared-db/docs/shared-database-vision.md` →
"Customer vs. Company vs. Ingested Domain".

---

## 2. Why this app is the urgent one

`poppim-web` is **live in production** (`pm.designflow.app`) and it queries the
renamed table **directly** by name in three places:

- `src/domain/reference/api.ts:10` — `(core() as any).from('company')...`
- `src/features/board/collab.ts:300` — `(core() as any).from('company')...`
- `src/features/accounts/api.ts:18` — `(core() as any).from('company')...`

`.from('company')` hits `core.company` over PostgREST. The moment the rename is
promoted to **production**, those three calls start returning a "relation does not
exist" error and the Accounts page, the project/product customer pickers, and the
collab customer list break. So this app's code change must ship **in lockstep with
the production promotion** (see §6 — this is the single most important section).

> The rename is already applied and verified on the **preview** branch
> (`xjcyeuvzkhtzsheknaiu`). Production (`qsllyeztdwjgirsysgai`) has **not** been
> renamed yet. Your app points at production, so nothing is broken *today*.

---

## 3. Required code changes (exact)

Change the table name in the three direct queries. The selected columns and
everything else stay the same.

**`src/domain/reference/api.ts:10`** (`fetchRetailers()`)
```diff
- const { data, error } = await (core() as any).from('company').select('id,name,customer_status').order('name')
+ const { data, error } = await (core() as any).from('customer').select('id,name,customer_status').order('name')
```

**`src/features/board/collab.ts:300`** (`fetchCustomers()`)
```diff
- const { data, error } = await (core() as any).from('company').select('id,name,customer_status').order('name')
+ const { data, error } = await (core() as any).from('customer').select('id,name,customer_status').order('name')
```

**`src/features/accounts/api.ts:18`** (`fetchAccountRows()`, inside the `Promise.all`)
```diff
-   (core() as any).from('company').select('id,name,customer_status,metadata').order('name'),
+   (core() as any).from('customer').select('id,name,customer_status,metadata').order('name'),
```

Then sanity-check there are no others:
```bash
grep -rn "from('company')\|from(\"company\")\|core\.company" src/
```
Expect zero hits after the three edits (matches inside `shared-db/` don't count).

---

## 4. Regenerate the Supabase TypeScript types

`src/lib/database.types.ts` is auto-generated and currently describes the old
`company` table (around lines 1163–1228) and an RPC return type
`Database["core"]["Tables"]["company"]["Row"]` (around line 641–657). After the
schema change it must be regenerated so the `company` table type becomes
`customer` (and gains `is_potential`).

```bash
# you need a Supabase access token (ask the owner / 1Password) and the project ref
supabase login            # or: export SUPABASE_ACCESS_TOKEN=<token>
supabase gen types typescript --project-id qsllyeztdwjgirsysgai --schema app,core,crm,pim,api > src/lib/database.types.ts
```

After regenerating, your build (`npm run build`) will surface any remaining
compile errors where code referenced the old `company` row type. Fix them by
switching to the `customer` type. There is no `package.json` script for this
today — add one if you like:
```json
"gen:types": "supabase gen types typescript --project-id qsllyeztdwjgirsysgai --schema app,core,crm,pim,api > src/lib/database.types.ts"
```

> Generate types from **production** only once production has actually been
> renamed; otherwise the generated file will still say `company`. If you need to
> regenerate before then, generate against the **preview** branch
> (`--project-id xjcyeuvzkhtzsheknaiu`), which already has the new schema.

---

## 5. Optional but recommended: adopt `is_potential`

Today the app models customers with the `customer_status` enum in
`src/lib/types.ts` (`CustomerStatus`, `Retailer`). That still works. When you want
the *authoritative* "have we actually done business with them" signal:

1. Add `is_potential?: boolean` to the `Retailer` interface in
   `src/lib/types.ts` (~lines 18–24).
2. Include `is_potential` in the three `select(...)` lists from §3.
3. Where you currently treat `customer_status === 'ACTIVE_CUSTOMER'` as "real
   customer," prefer `is_potential === false`. `is_potential` is owned by the
   PLM/ERP import and is more reliable than the manually-set enum.

This is a correctness improvement, not a breakage fix — do it in a follow-up if
you want to keep the cutover small.

---

## 6. Production cutover sequencing (CRITICAL — read before deploying)

Because the rename has **no compatibility view**, there is a hard ordering
constraint between this app and the database:

- If production is renamed **before** this app deploys → the live app's
  `.from('company')` calls break.
- If this app deploys `.from('customer')` **before** production is renamed → the
  new build breaks (prod still has `company`).

So the `.from('customer')` deploy and the production rename must happen in the
**same coordinated window**. Recommended, lowest-risk sequence (coordinate with
the shared-db owner who runs the promotion):

1. Land your code change (§3) + regenerated types (§4) on `main` and get a green
   build, but **time the production deploy** for the cutover window.
2. Owner promotes the shared-db rename to **production**.
3. Immediately deploy this app's new build.
4. Smoke-test (§7).

To shrink the window to ~zero, the owner can temporarily create a
`core.company` view (`create view core.company as select * from core.customer`)
on production right before the rename, deploy all apps, then drop the view. Ask
the owner — this is their call, since the team chose a clean no-view end state.

> CRM (`popcrm-web`) and DAM (`popdam3`) are **not** on this tight clock — they
> read through `api.*` views / RPCs whose names did not change, so they keep
> working at runtime and only need a types regen + rebuild. **PM is the
> hard-coupled app.** Don't assume the other apps gate your deploy; coordinate
> specifically on the PM deploy.

---

## 7. How to verify

Local (point `.env` at the **preview** branch `xjcyeuvzkhtzsheknaiu` to test
against the new schema before prod is cut over, then revert):

```bash
npm install
npm run dev
```
- Open Accounts → the list loads (no console error about `company` relation).
- Open a Project → the customer/retailer picker populates.
- Open a Product detail modal → the customer picker populates.
- `npm run build` passes with the regenerated types.

After production deploy: repeat the three checks on `pm.designflow.app`.

---

## 8. Commit/PR rules for this repo

Per this repo's `AGENTS.md`: app repos **commit straight to `main`** (no feature
branches), build must pass, then push; CI deploys. Fix-forward or revert on
`main`. Do **not** touch the `shared-db/` folder (auto-synced from
`u2giants/shared-db`; edits there are overwritten).

---

## 9. Quick checklist

- [ ] `src/domain/reference/api.ts:10` → `.from('customer')`
- [ ] `src/features/board/collab.ts:300` → `.from('customer')`
- [ ] `src/features/accounts/api.ts:18` → `.from('customer')`
- [ ] `grep -rn "from('company')\|core\.company" src/` returns nothing
- [ ] Regenerate `src/lib/database.types.ts`; `npm run build` passes
- [ ] Update `AGENTS.md` §11 wording (`core.company` → `core.customer`)
- [ ] Coordinate the production deploy with the shared-db prod promotion (§6)
- [ ] (optional) adopt `is_potential` in `src/lib/types.ts` + selects
- [ ] Smoke-test Accounts + project/product customer pickers

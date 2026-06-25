# Using PLM Master Data Tables in PM

PM/PIM shares one Supabase database with CRM, DAM, and PLM. The PLM import is now the canonical shared source for customers, licensors, and properties. PM should link product/project workflow rows to those shared identities instead of maintaining separate master-data copies.

## Current Source of Truth

PLM data is imported from the live Designflow API into the shared Supabase project.

- Production Supabase project: `qsllyeztdwjgirsysgai`
- Preview Supabase project: `xjcyeuvzkhtzsheknaiu`
- Shared schema repo: `u2giants/shared-db`
- Migration that created the import path: `supabase/migrations/20260624173000_plm_master_data_import.sql`
- Import tool: `tools/sync-plm-master-data.mjs`
- Import source system value: `designflow_plm`

API sources inspected before the schema was finalized:

- Customers: `https://api.designflow.app/api/core/customers/getCustomers`
- Licensors/properties: `https://api.designflow.app/api/item_master/lib/getLicensorsWithProperties`

The PLM API key is read-only and belongs only in server/admin tooling. Never put it in browser code, frontend env, logs, screenshots, fixtures, or committed docs.

## Tables PM Should Know

Use these tables as the stable master-data identity layer:

- `core.company`: canonical customer/company/account identity.
- `core.company_source_ref`: PLM customer lineage. For PLM customers, use `source_system = 'designflow_plm'` and `source_table = 'customers'`.
- `core.licensor`: canonical licensor identity.
- `core.property`: canonical property identity, linked to `core.licensor` by `licensor_id`.
- `core.taxonomy_source_ref`: PLM lineage for licensors and properties. For PLM rows, use `source_system = 'designflow_plm'` and `source_table = 'merchGroup'`.
- `plm.customer_import`, `plm.licensor_import`, `plm.property_import`: PLM-shaped import snapshots linked to canonical IDs. These are not PM workflow tables.
- `ingest.sync_run`, `ingest.raw_record`: raw import audit trail. Do not query these from the browser.

Production was populated on 2026-06-25 with 55 PLM customers, 37 licensors, 468 properties, and 560 raw ingest records. The import redacts `customers_passw`; stored raw records should not contain that field.

## How PM Should Use The Data

PM product/project records should reference canonical IDs when they need customer, licensor, or property identity.

Use `core.company` for customer/account links. Use `core.licensor` and `core.property` for licensing and property filters. PM workflow state, task state, project state, product lifecycle state, decisions, reminders, and operating metrics remain PM/PIM-owned data and should stay in PM/PIM tables keyed to canonical IDs.

The PLM master-data import is not the item-master import. Existing product `plm_item_id` or item links still point to PLM item records where that contract exists. Do not treat `plm.property_import` or `plm.licensor_import` as product/item tables.

Example licensor/property lookup shape:

```sql
select
  p.id,
  p.name,
  p.licensor_id,
  l.name as licensor_name,
  tsr.source_id as plm_merch_group_id,
  tsr.source_code as plm_property_code
from core.property p
join core.licensor l on l.id = p.licensor_id
join core.taxonomy_source_ref tsr
  on tsr.entity_schema = 'core'
 and tsr.entity_table = 'property'
 and tsr.entity_id = p.id
where tsr.source_system = 'designflow_plm'
  and tsr.source_table = 'merchGroup';
```

If the browser needs a PM-shaped contract for dropdowns, filters, or board facets, add an `api.pm_*` or other agreed API view/RPC in `u2giants/shared-db` instead of querying internal import tables directly.

## What Not To Do

- Do not create a PM-owned duplicate customer/licensor/property master-data table as the canonical source.
- Do not use PLM import tables as product/item tables.
- Do not write PM workflow state into `plm.*_import` or source-ref tables.
- Do not write to `plm.*_import`, `core.*_source_ref`, or `ingest.*` from PM UI code.
- Do not change PLM source refs, `source_system`, or `source_table` values. The future PLM database cutover depends on those stable keys.
- Do not expose the PLM API key to the frontend. Import refreshes belong in server/admin tooling.
- Do not read `ingest.raw_record` from browser code.
- Do not edit the mirrored `shared-db/` folder inside this app repo. Shared schema changes belong in canonical `u2giants/shared-db`.
- Do not rename/drop shared tables, columns, views, or policies from an app repo.

## If PM Needs More Fields

If PM needs app-specific fields, add PM/PIM-owned extension tables or columns keyed to canonical IDs. Examples: product property usage keyed to `core.property.id`, project customer ownership keyed to `core.company.id`, or licensing workflow data keyed to `core.licensor.id`.

If PM needs a new shared browser contract, make a timestamped migration in `u2giants/shared-db`, apply it to preview first, verify the PM screen against preview, then promote to production through the shared-db workflow.

## Documentation Rule

When changing how PM uses these PLM tables, document both sides:

- In this repo: update the relevant PM docs, API notes, or this file.
- In `u2giants/shared-db`: update schema/API docs if the change affects shared tables, RLS, views, RPCs, imports, or cross-app data contracts.

Future sessions should start by checking this file, `AGENTS.md`, and the canonical `shared-db` docs before changing product/project customer/licensor/property behavior.

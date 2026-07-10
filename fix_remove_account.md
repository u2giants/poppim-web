# Remove Legacy CRM Account Naming — PM/PIM Audit

Date: 2026-06-30

## Plain-English Summary

This PM/PIM app uses the shared Supabase database, but it should not call CRM's
legacy customer contracts:

- old/deprecated CRM names: `api.crm_account_list`,
  `api.crm_account_overview`, `api.crm_update_account`
- new CRM names: `api.crm_customer_list`,
  `api.crm_customer_overview`, `api.crm_update_customer`
- shared plain picker contract: `api.customer_list`

PM screens that need a basic customer picker/list should use `api.customer_list`.
PM screens that need PM-specific customer fields should get a PM-specific
customer view/RPC in `/worksp/shared-db`, not reuse CRM's `crm_customer_*`
contracts.

## Current PM Status

Active PM code does **not** appear to call `api.crm_account_*` or
`api.crm_update_account`.

Known references:

- `src/lib/database.types.ts` was regenerated from production project
  `qsllyeztdwjgirsysgai` on 2026-06-30 after shared-db rollout PRs #19, #20,
  and #21 were applied. It now includes `crm_customer_*`,
  `crm_customer_segment_*`, and `crm_update_customer`.
- `src/lib/database.types.ts` still contains generated schema entries for legacy
  `crm_account_*` objects. This is expected while shared-db keeps those
  compatibility contracts alive; do not delete generated entries by hand.
- `src/features/accounts/AccountsPage.tsx` and `src/App.tsx` contain PM's own
  "Accounts" screen. Do **not** blindly rename this as part of the CRM cleanup;
  decide separately whether PM product language should become "Customers."
- `fix_new_schema.md` contains older planning notes that mention
  `api.crm_account_list`; treat those as historical unless actively updating
  that plan.
- Existing active customer reads still use `api.customer_list` for shared/basic
  picker data in `src/domain/reference/api.ts`, `src/features/board/collab.ts`,
  and `src/features/accounts/api.ts`, per the PM/shared-picker rule.

## What Future AI Sessions Should Do

After any additional shared-db customer-contract change:

1. Regenerate PM database types from the target Supabase schema.
2. Search active PM code:

   ```bash
   rg "crm_account|crm_update_account|accountSegment|AccountSegment" src
   ```

3. If the only hits are generated type references, confirm whether shared-db is
   still intentionally exposing compatibility objects. Do not manually remove
   generated type entries.
4. If active PM code ever needs CRM customer fields, do **not** call
   `api.crm_account_*`. Use `api.customer_list` for basic data or add a
   PM-owned customer contract in `/worksp/shared-db`.

## Do Not Do This

- Do not edit `/worksp/poppim-web/shared-db`; it is a mirror.
- Do not drop legacy `crm_account_*` contracts from shared-db until CRM is
  deployed and all app scans are clean.
- Do not rename PM's own "Accounts" feature as an automatic database cleanup.
  That is a product-language decision, not the CRM API migration.

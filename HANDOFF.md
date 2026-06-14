# Handoff — ClickUp Work Import

## ClickUp Work-Data Import

Status:
partial

Done:
- Frontend deployed at `https://pm.designflow.app` with build SHA `0fc6cecac9b306ae781cb8e34e7cdc06047d59e2`.
- Directus migration/importer code pushed in `/worksp/directus` commit `f0e1413`.
- Directus schema was updated with first-class ClickUp status and parent fields on `product` / `project`.
- `pm-system/migration/backfill-clickup-status-fields.mjs` backfilled those fields for existing rows with `clickup_raw`.
- `pm-system/migration/clickup-work-import.mjs` now writes ClickUp status/parent fields and JSON-stringifies scalar custom-field values before inserting `product_field.value_json`.
- A foreground proof run advanced from checkpoint `12873` to `12900` with failed count unchanged, verifying the custom-field JSON fix on newly processed rows.
- The full importer was relaunched detached with:
  `setsid env POPPIM_ENV_FILE=/home/ai/.directus-deploy.env DX_URL=https://data.designflow.app node /worksp/directus/pm-system/migration/clickup-work-import.mjs >> /tmp/clickup-work-import.log 2>&1 < /dev/null &`
- Poppim detail cards now use ClickUp attachment previews and no longer prepend ClickUp ids to titles.
- ClickUp task `868jzm9k2` (`Miniso`) was missing from Directus. It was created as product `0ee5283e-4f36-4352-bc4c-20370814b028`, work data was hydrated successfully (`files 3`, `comments 2`, failed `0`), and its cover was moved to Spaces at `https://poppim.nyc3.digitaloceanspaces.com/covers/0ee5283e-4f36-4352-bc4c-20370814b028.png`.
- A live ClickUp scan of the Licensing Management list found `5120` current top-level tasks and, after adding Miniso, `0` additional missing Directus products.
- Last verified checkpoint: `index 13872`, `processed 13875`, `failed 32`, `files 12581`, `tags 10449`, `fields 2525`, `checklist 26689`, `comments 7077`, `links 221`, `time 0`.

Next action:
Monitor `/tmp/clickup-work-import.log` and `/tmp/clickup-work-import.checkpoint` until the importer reaches `16534/16534`. After completion, retry the failed product ids. The newest known failure was product `ce356bdb-f5b7-4969-b4a2-73dfb5961614` with `POST /items/product_update -> 400: Invalid payload. request entity too large`, so at least one retry needs oversized update/comment handling, not integer/decimal handling.

Risks / watchouts:
- Do not restart from index 0 unless intentionally doing a full refresh; the importer uses `/tmp/clickup-work-import.checkpoint`.
- The importer clears and replaces ClickUp-origin rows per product, so interrupted work is safe to resume from the checkpoint.
- `activity` and `time` have remained `0`; verify ClickUp API access/endpoints before treating that as a frontend bug.
- The Licensed board depends on `clickup_parent_id`, `clickup_status_type`, `clickup_list_name`, and `clickup_updated_at`. If counts differ from ClickUp, inspect these fields first.
- If a ClickUp card exists but Poppim cannot find it, compare the ClickUp task id to `product.external_id`. Use `/worksp/directus/pm-system/migration/clickup-incremental-products.mjs` to create missing current list tasks, then run targeted work and cover imports with `PRODUCT_IDS=<created ids>`.

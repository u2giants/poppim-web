# Handoff — ClickUp Parity Tail

## ClickUp Product/Card Parity

Status:
done

Done:
- Directus live audit on 2026-06-14 matched 23 live ClickUp lists / 17,859 unique ClickUp task ids to 17,859 Poppim external ids.
- Audit result: missing `0`, extra `0`.
- Poppim board departments are hard-separated as `Licensed`, `Generic`, and `Software`; each shows top-level open/custom ClickUp cards for that department, not only the old `Licensing Management` list.
- Miniso (`868jzm9k2`) is now product `0ee5283e-4f36-4352-bc4c-20370814b028` with 3 files and 2 comments hydrated.

Next action:
No product/card id import is pending. If a card appears missing, compare its ClickUp task id against `product.external_id` in Directus before changing frontend filters.

Risks / watchouts:
- `project.external_id` also contains 651 ClickUp ids, but matching product rows were intentionally created so project/offer work data has a live detail home in Poppim.

## Product-File Source Recovery

Status:
partial

Done:
- Backend copied 20,234 / 20,281 imported `product_file` rows to DigitalOcean Spaces.
- Product covers have 0 ClickUp URLs remaining.
- Sampled remaining failures return either 404 or 200 with zero bytes, anonymously and with `CLICKUP_TOKEN`.

Next action:
Recover the remaining 47 source files from an old ClickUp export, NAS, or user re-upload. After replacement source URLs/files exist, rerun `/worksp/directus/pm-system/migration/clickup-files-to-spaces.mjs`.

Risks / watchouts:
- Rerunning the same current ClickUp URLs will not recover the 47 files unless ClickUp starts serving bytes again.

## ClickUp Activity / Time

Status:
partial

Done:
- `clickup-work-import.mjs` attempts ClickUp history/activity/time-entry imports.
- All 2026-06-14 runs still reported `activity 0` and `time 0`.

Next action:
Verify ClickUp API endpoints/permissions for task history/activity, and confirm whether the team used ClickUp time tracking. Do not debug this as a frontend rendering problem until the backend API returns records.

Risks / watchouts:
- Existing evidence docs already noted `time_entries` were empty; activity may need a different endpoint or may be unavailable with the current token.

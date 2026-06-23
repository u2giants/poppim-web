# Handoff — ClickUp Parity Tail

## PM Operating Model

Status:
done

Done:
- The frontend now maps PM operating records onto the shared Supabase schema: dependencies/decisions in `app.activity`, reminders in `app.notification`, and workflow templates in scoped `pim.saved_view` rows.
- Verified the frontend build against the shared Supabase client/API layer.
- Frontend types/API added in `src/lib/types.ts` and `src/features/operating/api.ts`.
- Product detail now has an Operations tab for dependencies, decisions, and reminders.
- My Work now lists open/snoozed reminders assigned to the signed-in user.
- Settings now lists and creates workflow templates.
- Reports now counts open dependencies, open reminders, recorded decisions, and active templates.
- `npm run build` passed on 2026-06-22.

Next action:
No continuation action is required for the implemented in-app operating model. External delivery (email/Teams/push) would require a future Supabase Flow or worker; this session did not implement external notifications.

Risks / watchouts:
- Any future first-class operating-table schema work belongs in canonical `u2giants/shared-db`, not this frontend repo.
- Reminders are durable Supabase records and My Work items, not an external notification-delivery system.

## ClickUp Product/Card Parity

Status:
done

Done:
- Supabase live audit on 2026-06-14 matched 23 live ClickUp lists / 17,859 unique ClickUp task ids to 17,859 Poppim external ids.
- Audit result: missing `0`, extra `0`.
- Poppim board departments are hard-separated as `Licensed`, `Generic`, and `Software`; each shows top-level open/custom ClickUp cards for that department, not only the old `Licensing Management` list.
- Miniso (`868jzm9k2`) is now product `0ee5283e-4f36-4352-bc4c-20370814b028` with 3 files and 2 comments hydrated.

Next action:
No product/card id import is pending. If a card appears missing, compare its ClickUp task id against `product.external_id` in Supabase before changing frontend filters.

Risks / watchouts:
- `project.external_id` also contains 651 ClickUp ids, but matching product rows were intentionally created so project/offer work data has a live detail home in Poppim.

## Product-File Source Recovery

Status:
blocked on external source bytes (repo/app work complete for currently reachable files)

Done:
- Backend copied 20,234 / 20,281 imported `product_file` rows to DigitalOcean Spaces.
- Product covers have 0 ClickUp URLs remaining.
- Sampled remaining failures return either 404 or 200 with zero bytes, anonymously and with `CLICKUP_TOKEN`.
- 2026-06-21 follow-up recovered one newly reachable file (`Women of the World`, `product_file` `58ee2054-accd-4a0d-bcd4-a7fa8b6fbc6c`) after fixing the Spaces migration extension parser for extensionless ClickUp files. Current count: 20,235 / 20,281 stored; 46 remain unstored.

Next action:
Recover the remaining 46 source files from an old ClickUp export, NAS, or user re-upload, then apply the recovery through the canonical shared backend migration process.

Risks / watchouts:
- Rerunning the same current ClickUp URLs will not recover the 46 files unless ClickUp starts serving bytes again. A 2026-06-21 probe found no matching filenames under `/worksp`.

## ClickUp Activity / Time

Status:
time entries recovered where current products exist; activity blocked by unavailable ClickUp endpoint

Done:
- `clickup-work-import.mjs` attempts ClickUp history/activity/time-entry imports.
- All 2026-06-14 runs still reported `activity 0` and `time 0`.
- 2026-06-21 verified the empty time import was query-shape related: ClickUp returns workspace time entries only when `assignee` is provided. The historical importer was patched to query workspace members and include `assignee`, `include_task_tags`, and `include_location_names`.
- Imported the 4 time entries whose ClickUp tasks map to current Supabase `product` rows. `product_time_entry` now has 4 rows. The workspace has 10 time entries total across 8 ClickUp task ids; 5 task ids do not map to current `product` rows.
- Verified task activity/history endpoints used by the old importer (`/api/v2/task/:id/history` and `/api/v3/task/:id/activity`) return 404 for sampled live tasks. `product_activity` remains 0 because ClickUp does not expose that activity-log endpoint to this token/API shape.

Next action:
No frontend action. If activity logs are still desired, find an officially supported ClickUp endpoint/export for task activity history or recover activity from a separate ClickUp export. If the 5 unmatched time-entry task ids matter, decide whether to create product/project homes for them or add a non-product time-entry model.

Risks / watchouts:
- Existing evidence docs already noted `time_entries` were empty; activity may need a different endpoint or may be unavailable with the current token.
- This is about logged time *entries* / activity log, which are still empty. It is NOT the per-task `clickup_time_estimate_ms` field (added 2026-06-16, populated for ~123 products) — that is a separate field and does not resolve this item.

## Saved Views — Supabase scripts committed (RESOLVED 2026-06-21)

Status:
done — saved views are now represented by shared Supabase `pim.saved_view` / `pim.view_pref` tables
("saved views: pm_saved_view fields + pm_view_pref + seed list views"). Prod schema/seed
were already applied and the scripts are idempotent, so the commit just recorded them; the
"prod schema the repo doesn't describe" drift is resolved.

Residual notes (not blockers):
- `pm_view_pref` has NO composite-unique (user, view); the app does read-then-upsert. Add a
  unique index via a Supabase migration if DB-level safety is wanted later.
- View isolation is client-enforced (wildcard policies). See poppim-web AGENTS.md §11.

## Hierarchy + Editing Frontend (deployed, not live-verified)

Status:
done — live verified 2026-06-21

Done:
- Backend (Supabase 45af984): 8 new product fields added + backfilled; verification SQL passed (17,859 has_space/has_list_id; 17,705 has_folder; 123 has_time_estimate).
- Frontend (`e487955`, live on `pm.designflow.app`): topbar List filter, group-by List/Folder, sidebar Spaces tree, card/modal breadcrumbs, time-estimate field, orderindex sort, inline-editable modal fields, image lightbox + set-as-cover, inline topbar search. `npm run build` clean.
- Live login via the email/password path reached the deployed app (`pm.designflow.app`, build badge `da4a910`, Jun 21 2026 3:05 PM EDT).
- Sidebar saved-list view click verified across departments: from Licensed, expanded Generic and clicked `General Presentations`; app switched to Generic and kept topbar `List 1` active, with Generic/General Presentations cards rendered.
- Topbar/list-backed filtering rendered real list-filtered data in live Product Pipeline (`New Prod Development`, `Customer Refresh`, and `General Presentations` were spot-checked in the browser).
- Reversible persistence smoke test passed through Supabase: patched `next_action`, read it back, restored it; patched `cover_url` to an existing stored image, read it back, restored it. Product `7f795aee-28ec-4843-bb66-8923ed4ccf5d`, file `ffffa79e-9fc4-49e7-b142-f07d51ac044f`.

Next action:
No remaining frontend verification action from this handoff.

Risks / watchouts:
- orderindex order is exact per-list only and not for lists over the 5,000 load cap (Licensing Management). See AGENTS.md §11.
- Field edits fail silently (optimistic revert). A "didn't save" report is a backend write/permission issue, not a UI bug.

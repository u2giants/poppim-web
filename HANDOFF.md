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
- This is about logged time *entries* / activity log, which are still empty. It is NOT the per-task `clickup_time_estimate_ms` field (added 2026-06-16, populated for ~123 products) — that is a separate field and does not resolve this item.

## Saved Views — directus scripts run in prod but NOT committed (ACTION NEEDED)

Status:
partial (schema + seed applied to production; scripts not yet in the directus GitHub repo)

Done:
- Authored and RAN against prod Directus (`data.designflow.app`) on 2026-06-17:
  - `/worksp/directus/pm-system/add-saved-views-model.mjs` — added `visibility`,
    `origin`, `color`, `sort_order` to `pm_saved_view`; created `pm_view_pref`
    (user, view, sort_order, color, hidden) with CASCADE relations; mirrored
    `pm_saved_view`'s 24 wildcard permissions onto `pm_view_pref`. Additive/idempotent.
  - `/worksp/directus/pm-system/migration/seed-clickup-list-views.mjs` — seeded
    15 shared `origin='clickup_list'` views (Licensed 8, Generic 5, Software 2),
    all color `#8C9BB5`. DRY_RUN default / APPLY=1; idempotent by name+business_unit.
- Verified: pm_view_pref exists; 15 seeded views; one distinct color per dept.
- poppim-web frontend consuming all of the above is committed + deployed (`0e4e61c`).

Next action (do this in the directus AI session — that repo's git is not writable by the poppim session's user):
1. `cd /worksp/directus && git add pm-system/add-saved-views-model.mjs pm-system/migration/seed-clickup-list-views.mjs`
2. Commit + push to `main` (keeps GitHub the source of truth; the prod schema/seed are already applied, so this just records them). Re-running either script is idempotent/no-op.
3. Optional: update `pm-system/schema-snapshot.yaml` if that repo keeps one in sync.

Risks / watchouts:
- Until committed, production has schema the repo doesn't describe (drift) — violates the directus repo's "GitHub is source of truth" rule. Commit promptly.
- `pm_view_pref` has NO composite-unique (user, view); the app does read-then-upsert. If you later want DB-level safety, add a unique index via a migration in the directus repo (the field API can't create composite uniques).
- View isolation is client-enforced (wildcard policies). See poppim-web AGENTS.md §11.

## Hierarchy + Editing Frontend (deployed, not live-verified)

Status:
partial (code complete + deployed; live behavior unverified)

Done:
- Backend (directus 45af984): 8 new product fields added + backfilled; verification SQL passed (17,859 has_space/has_list_id; 17,705 has_folder; 123 has_time_estimate).
- Frontend (`e487955`, live on `pm.designflow.app`): topbar List filter, group-by List/Folder, sidebar Spaces tree, card/modal breadcrumbs, time-estimate field, orderindex sort, inline-editable modal fields, image lightbox + set-as-cover, inline topbar search. `npm run build` clean.

Next action:
Drive the live site (needs a real login — the Playwright/automated browser hits the Microsoft SSO gate and has no session) and spot-check:
1. Sidebar tree counts match the topbar List-filter counts (e.g. Licensing Management ~11,575).
2. Click a sidebar list in a *different* department → it switches department AND keeps the filter (regression check for the effect-ordering fix; see AGENTS.md §11).
3. Edit a field, reopen the card → value persisted (silent revert = a failed Directus write/permission).
4. Right-click an image → "Set as cover image" updates the card banner.

Risks / watchouts:
- orderindex order is exact per-list only and not for lists over the 5,000 load cap (Licensing Management). See AGENTS.md §11.
- Field edits fail silently (optimistic revert). A "didn't save" report is a backend write/permission issue, not a UI bug.

# Secondary-screen accuracy contracts

Date: 2026-07-27

These contracts prevent bounded reads from being presented as complete business
data. `Licensed`, `Generic`, and `Software` are always mandatory; records that
cannot be attributed through their product/project are excluded, never mixed
into the selected department.

| API / screen | Accuracy class | Stable order | Projection and truncation semantics |
|---|---|---|---|
| Reports | Exact aggregate + optional recent activity | Aggregate buckets use stable keys; handoffs `(changed_at desc,id desc)` | Server returns department-scoped counts/buckets. Handoffs are an independently fallible, labeled 30-day window. `asOf` is returned. |
| Control Room | Exact aggregate + paged exception lists | Counts by stable key; exception lists `(updated_at desc,id desc)` | Server returns exact department totals and bounded 80-row exception lists with `hasMore`; projects are a bounded 40-row list. No product metadata blob. |
| Schedule | Bounded date-window list | `(event_date asc,id asc)` | Explicit inclusive start/exclusive end, department, narrow displayed fields, and a visibly disclosed first-100 bound. Six-month window controls prevent an all-time claim. |
| Notes | Recent activity | `(created_at desc,id desc,kind asc)` | Server-side search precedes limit. Default 30-day window, bounded merged page, labeled as recent. |
| People | Paged list + exact aggregate columns | `(display_name asc,id asc)` | Narrow profiles page; assignment, unread PM reminder, and open revision counts are server grouped and department scoped. |
| Accounts | Paged list + exact aggregate columns | `(name asc,id asc)` | Narrow customer rows and grouped project/order counts. Search precedes limit. |
| Projects | Paged list | `(updated_at desc,id desc)` | Narrow displayed fields, mandatory department, server search before limit, explicit continuation. |
| My Work | Paged products + bounded supporting lists | Products `(updated_at desc,id desc)`; revisions `(requested_at desc,id desc)`; reminders `(created_at desc,id desc)` | Server derives the signed-in profile, requires the selected department, and never accepts another profile ID. Product continuation uses `limit + 1`; revisions/reminders are visibly bounded at 100 and reminders require `app='pm'`. |
| Workflow submissions | Paged list | `(updated_at desc,id desc)` | Narrow displayed fields and embedded product summary; department/search before limit. |
| Workflow samples | Paged list | `(updated_at desc,id desc)` | Narrow displayed fields and embedded product summary; department/search before limit. |
| Workflow revisions | Paged list | `(requested_at desc,id desc)` | Narrow displayed fields and embedded product summary; department/search before limit. |
| Designs / collections | Paged list | `(updated_at desc,id desc)` | Narrow displayed fields, department/search before limit, explicit continuation. |
| Orders | Paged list | `(updated_at desc,id desc)` | Narrow displayed fields, department/search before limit, explicit continuation. |

For every list classified as paged, `limit + 1` determines `hasMore`; the extra
row is never rendered. Intentionally bounded supporting/window lists disclose
their limit instead. Cursors are opaque to UI components. Optional
aggregate/count failure must not blank successful primary data.

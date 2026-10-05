# Critical incidents

Moved out of AGENTS.md. Load when investigating a regression or deploy failure.


### 2026-06-11 — Cards collapsed to 2px on the board
What happened: after the Prompt-B board rework, all task cards rendered ~2px tall (only the border), content hidden.
Impact: board unusable (caught in preview before anyone relied on it).
Root cause: cards are flex children in a fixed-height, scrollable column; default `flex-shrink:1` compressed them to fit instead of overflowing.
Recovery: added `shrink-0` to the product card so cards keep natural height and the column scrolls.
Rule added: see §11 "`PimTaskCard` needs `shrink-0`" — don't remove it.

### 2026-06-11 — Image importer crashed (backend, but affected this app's images)
What happened: the historical ClickUp image importer died at ~800 products; image counts stalled.
Root cause: its periodic re-login sent the already-expired token, so the re-login itself 401'd.
Recovery: fixed to clear the token before re-login + retry; documented here because this app surfaces those images.

No production incidents since the app moved to `pm.designflow.app`.


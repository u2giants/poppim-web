# Handoff — Poppim Shared-DB Gate + ClickUp Gap Review

## 1. What this application is

`poppim-web` is POP Creations' PIM/PM frontend: a React 19 + Vite + TypeScript single-page app served at `https://pm.designflow.app`. Internal staff use it as the replacement for the old ClickUp product/project board. It stores no data of its own; all reads/writes go through the shared Supabase backend project `qsllyeztdwjgirsysgai` at `https://qsllyeztdwjgirsysgai.supabase.co`.

Repo and runtime map:
- App repo: `/worksp/poppim-web`, GitHub `u2giants/poppim-web`, main-only.
- Live URL: `https://pm.designflow.app`; preview aliases `pm-dev.designflow.app` and `pm-ci.designflow.app`.
- Shared schema source of truth: `/worksp/shared-db`, GitHub `u2giants/shared-db`.
- Local `shared-db/` inside this repo is a read-only auto-synced mirror. Never edit it by hand.
- Sibling apps on the same Supabase project: CRM (`popcrm-web`), DAM/SG (`popdam`), PLM/master-data work.

## 2. What we set out to do this session, and why

The final session goal was closeout: leave the repo synchronized, documented, committed, pushed, and handoff-safe. Immediately before closeout, we also added a CI enforcement gate so future app-side database/schema changes are blocked unless they are made through canonical `u2giants/shared-db`.

Business reason: the same Supabase project backs multiple POP apps. An app repo quietly adding DDL, migrations, dashboard SQL, or one-off schema changes can break other apps. The guard makes the shared-db rule visible and enforceable in GitHub Actions.

Technical work covered in this closeout:
- Added `.github/workflows/shared-db-guard.yml` from `u2giants/ai-devops`.
- Added explicit "Shared DB Gatekeeper" sections to `AGENTS.md` and `CLAUDE.md`.
- Preserved and documented earlier uncommitted work from June 30: ClickUp MCP setup docs, the PM gap-review PDF/source/assets, updated ClickUp file-recovery facts, and regenerated Supabase database types.
- Reshaped this `HANDOFF.md` into the required fresh-developer format.

## 3. Current state

Committed and pushed:
- `8aae0276cf0b4c244abd850967b107b6a34fed17` — `add shared DB guard [db-change-approved]`.
- This commit added the new `shared-db guard` workflow and the gatekeeper docs.
- GitHub Actions showed `shared-db guard` active and green on the push.
- Existing workflow `Forbid Shared DB Bypass` also passed.
- Deploy workflow for `8aae027` passed; live HTML at `https://pm.designflow.app` reported `<meta name="build-sha" content="8aae0276cf0b4c244abd850967b107b6a34fed17">`.

Remote/local branch state at closeout:
- `main` was fast-forwarded after the guard commit to include an auto-sync from shared-db: `6c6e753 chore: sync shared-db @ u2giants/shared-db@94644d0`.
- Local `main` matches `origin/main` before this closeout commit is created.
- Canonical `/worksp/shared-db` was checked and has no dirty files; it is on branch `codex/popdam-rich-pdf-extraction-docs`, tracking origin. No shared-db schema work was started from this session.

Files ready to commit in this closeout:
- `AGENTS.md`: docs map now points to `docs/clickup-mcp.md`; ClickUp file-recovery count updated.
- `HANDOFF.md`: rewritten into this comprehensive closeout handoff.
- `README.md`: added ClickUp migration review links.
- `docs/architecture.md`: updated ClickUp file-preview/storage counts.
- `docs/configuration.md`: documented Supabase Auth allowlist requirements for PM URLs.
- `docs/clickup-mcp.md`: new ClickUp MCP setup/audit notes.
- `docs/clickup-poppim-gap-review.html`: editable source for the PM gap-review worksheet.
- `docs/clickup-poppim-gap-review.pdf`: generated 6-page PM worksheet.
- `docs/gap-analysis-assets/poppim-card-detail-main.png` and `docs/gap-analysis-assets/poppim-pipeline-loaded.png`: live Poppim screenshots used by the worksheet.
- `fix_remove_account.md`: updated legacy `crm_account_*` cleanup status.
- `src/lib/database.types.ts`: regenerated from production Supabase after shared-db customer-contract rollouts; includes current generated CRM/customer type surface.

What works and how it was verified:
- New shared-db guard workflow appears under GitHub Actions and passed on push.
- Live app was serving build SHA `8aae027` after the guard commit deployed.
- The ClickUp review PDF/source includes 30 numbered table rows and matching numbered visual markers; see the verification command in section 6.
- No secret values were found in the closeout scan. Docs mention 1Password item names and environment variable names only.

What is half-done:
- Product-file source recovery remains blocked on 46 missing source files. The app/repo work is complete for reachable files, but the missing bytes are not available from current ClickUp URLs.
- Direct raw ClickUp browser screenshots for the gap-review PDF are not captured. The PDF deliberately uses MCP-verified evidence panels for ClickUp and live Poppim screenshots for Poppim.

What is not started:
- No new shared-db migration was started.
- No external reminder delivery system (email/Teams/push) was built; PM reminders remain durable in-app Supabase records.

## 4. Everything we tried that did not work

Direct ClickUp browser screenshots:
- Why it seemed right: the PM gap-review worksheet would be strongest with raw ClickUp screenshots beside Poppim screenshots.
- What failed: headless/browser automation hit ClickUp's interactive login/SSO flow and could not reliably capture authenticated board/task screenshots.
- Result: the PDF labels ClickUp visuals as MCP-verified evidence panels, not raw browser screenshots. Future sessions must not claim otherwise unless they replace those panels with real screenshots from an already-authenticated interactive browser.

Remaining product-file recovery from current ClickUp URLs:
- Why it seemed right: rerun the old ClickUp attachment recovery for the remaining missing files.
- What failed: the remaining 46 source URLs returned 403/404/416 or zero useful bytes, including with `CLICKUP_TOKEN`.
- Result: no more files can be recovered from the current URLs unless ClickUp starts serving bytes again. The next source must be an old ClickUp export, NAS copy, or user re-upload.

Exact-name local/NAS search for missing files:
- Why it seemed right: source files might still exist somewhere under `/worksp`, `/home/ai`, Tailscale-mounted paths, or likely NAS shares.
- What failed: exact-name searches found no matches under local paths; read-only NAS exact-name `find` attempts timed out or reached no matching files in the searched paths.
- Result: do not spend another session repeating the same local exact-name search unless new source paths are identified.

ClickUp task activity/history import:
- Why it seemed right: imported task activity would close the parity gap for ClickUp history.
- What failed: sampled `/api/v2/task/:id/history` and `/api/v3/task/:id/activity` calls returned 404 for live tasks with the available token/API shape.
- Result: `product_activity` remains empty. If activity history is still desired, find an official ClickUp endpoint/export or recover activity from a separate export.

ClickUp time-in-status and logged-time completeness:
- Why it seemed right: time-in-status/logged time appears in ClickUp and may be relevant for PM parity.
- What failed: MCP bulk time-in-status returned no task data; historical logged-time import only produced 4 entries mapped to current products. The workspace had 10 time entries across 8 ClickUp task ids, with 5 ids not mapping to current `product` rows.
- Result: time estimate is a separate sparse product field; logged time/activity is still not complete.

Initial partial staging during the shared-db guard commit:
- Why it seemed right: `AGENTS.md` had pre-existing unrelated edits, so only the new gatekeeper hunk should be staged.
- What failed: the first manual index patch staged the gatekeeper section at the bottom of `AGENTS.md`.
- Result: the staged copy was reset and rebuilt from `HEAD:AGENTS.md` plus the gatekeeper section in the correct top location. Worktree content was not damaged.

## 5. Root causes and key findings

Shared DB governance:
- The frontend depends on Supabase project `qsllyeztdwjgirsysgai`, shared by PM/CRM/DAM/PLM.
- Root rule now documented in `AGENTS.md` and `CLAUDE.md`: all schema/DDL changes must be authored in canonical `u2giants/shared-db` by branch + PR + timestamped migration, preview-first, AI merges.
- Enforcement now lives in `.github/workflows/shared-db-guard.yml`. It runs on `push` and `pull_request`, excluding the vendored `shared-db/` mirror. Overrides are explicit: PR label `db-change-approved` or commit message `[db-change-approved]`.
- The bootstrap commit used `[db-change-approved]` because the guard file itself contains DDL-keyword regex text and can flag its own first addition.

ClickUp MCP:
- `docs/clickup-mcp.md` records the official remote MCP server: `https://mcp.clickup.com/mcp`.
- OAuth is configured for the Ubuntu `ai` user on Hetzner. The useful verification command is `su - ai -c 'codex mcp list'`, expecting `clickup  https://mcp.clickup.com/mcp  enabled  OAuth`.
- Fixed OAuth callback port is `32803`; from Windows use `ssh -L 32803:127.0.0.1:32803 ai@hetz` before `codex mcp login clickup` on Hetzner.
- This desktop Codex session may not expose the ClickUp tools even when the CLI is authenticated. Start a fresh session or use a focused nested `su - ai -c 'cd /worksp/poppim-web && codex exec ...'` read-only audit.

ClickUp gap-review worksheet:
- `docs/clickup-poppim-gap-review.html` is the editable source.
- `docs/clickup-poppim-gap-review.pdf` is the generated PM-facing output.
- `docs/gap-analysis-assets/` contains Poppim screenshots only. ClickUp visuals in the PDF are MCP evidence panels because raw browser capture was blocked.

Legacy CRM account naming:
- `fix_remove_account.md` says PM/PIM must not call CRM's legacy `api.crm_account_list`, `api.crm_account_overview`, or `api.crm_update_account` contracts.
- Active PM code scan on June 30 found no active calls outside generated schema types.
- Basic PM customer pickers should use shared `api.customer_list`; PM-specific customer data needs a PM-owned shared-db view/RPC, not CRM's private `crm_customer_*` contracts.
- `src/lib/database.types.ts` was regenerated after shared-db PRs #19, #20, and #21. Remaining `crm_account_*` generated entries are expected while compatibility objects still exist; never delete generated entries by hand.

Product files:
- As of June 26, the retired source had 20,245 / 20,291 imported `product_file` rows stored in Spaces; 46 remain unstored.
- `TaskDetailModal` display logic prefers `thumbnail_url`, then image `stored_url`, then original ClickUp preview/source fallback.
- Remaining source recovery is blocked on external source bytes, not frontend code.

Supabase Auth:
- `docs/configuration.md` now documents the PM Auth allowlist requirement. Supabase project's `site_url` is `https://crm.designflow.app`, so PM must pass explicit `redirectTo` and PM URLs must stay in `uri_allow_list`:
  `https://pm.designflow.app`, `https://pm.designflow.app/`, `https://pm.designflow.app/**`,
  `https://pm-dev.designflow.app`, `https://pm-dev.designflow.app/`, `https://pm-dev.designflow.app/**`,
  `https://pm-ci.designflow.app`, `https://pm-ci.designflow.app/`, `https://pm-ci.designflow.app/**`.
- If Microsoft SSO from PM lands on CRM, check this allowlist before changing frontend routing.

## 6. Exact next steps

1. Commit and push this closeout bundle to `main`.
   - You will know it worked when `git status --short --branch` shows `main...origin/main` with no dirty tracked/untracked files in `/worksp/poppim-web`.

2. Watch GitHub Actions for the closeout commit.
   - You will know it worked when `gh run list --repo u2giants/poppim-web --branch main --limit 5` shows the guard workflows and deploy workflow completed successfully.

3. Verify the live deployed SHA.
   - You will know it worked when `curl -fsSL https://pm.designflow.app/ | rg 'build-sha'` reports the closeout commit SHA.

4. If the PM wants a more literal ClickUp visual packet, capture raw screenshots from an already-authenticated interactive ClickUp browser session.
   - Replace only the ClickUp evidence panels in `docs/clickup-poppim-gap-review.html`.
   - Regenerate `docs/clickup-poppim-gap-review.pdf`.
   - You will know it worked when the HTML/PDF labels no longer need to say MCP-verified evidence panels for the replaced screenshots, and the marker count check below is clean.

5. Before regenerating the PDF after any worksheet edit, run:
   ```bash
   node <<'NODE'
   const fs=require('fs');
   const html=fs.readFileSync('docs/clickup-poppim-gap-review.html','utf8');
   const rows=[...html.matchAll(/<td class="num">(\d+)<\/td>/g)].map(m=>+m[1]);
   const pins=[...html.matchAll(/class="pin(?: small)?"[^>]*>(\d+)<\/span>/g)].map(m=>+m[1]);
   console.log({
     rows: rows.length,
     uniqueRows: new Set(rows).size,
     missingRows: [...Array(30)].map((_,i)=>i+1).filter(n=>!rows.includes(n)),
     missingPins: [...Array(30)].map((_,i)=>i+1).filter(n=>!pins.includes(n)),
   });
   NODE
   ```
   - You will know it worked when `rows` and `uniqueRows` are 30 and both missing arrays are empty.

6. To regenerate the PDF, run:
   ```bash
   google-chrome --headless --no-sandbox --disable-gpu \
     --print-to-pdf=/worksp/poppim-web/docs/clickup-poppim-gap-review.pdf \
     file:///worksp/poppim-web/docs/clickup-poppim-gap-review.html
   ```
   - You will know it worked when the PDF timestamp/file size updates and opens as a 6-page worksheet.

7. For the 46 missing product-file sources, do not rerun the same current ClickUp URLs unless new evidence says they are serving bytes again.
   - Find an old ClickUp export, NAS source directory, or ask for user re-upload.
   - You will know it worked when the recovered bytes can be uploaded to Spaces and the corresponding `product_file` rows get `stored_url` and, where applicable, `thumbnail_url`.

8. If shared-db later removes legacy `crm_account_*` compatibility objects, regenerate `src/lib/database.types.ts`.
   - Run `rg "crm_account|crm_update_account|accountSegment|AccountSegment" src`.
   - You will know it worked when active PM source has no calls to the legacy CRM account contracts; generated hits are acceptable only if shared-db still exposes compatibility objects.

## 7. Constraints and gotchas

- This app repo is main-only. Do not create a branch for normal app work.
- All shared Supabase schema/DDL changes go through canonical `/worksp/shared-db` branch + PR + timestamped migration, preview-first. Do not create local app migrations here.
- The `shared-db/` folder in this repo is an auto-synced mirror and is read-only.
- Do not hand-edit generated schema entries out of `src/lib/database.types.ts`; regenerate types from the target Supabase project.
- `src/components/ui/` is generated shadcn/Radix code; use the shadcn CLI rather than hand-editing primitives.
- Product pipeline failures must be verified in an authenticated browser. Unauthenticated checks only prove the login page works.
- PM departments are hard-separated: `Licensed`, `Generic`, `Software`. Do not reintroduce an "All" department.
- `product.code` is an internal ClickUp-style id, not a human SKU. Do not display it.
- Inline modal edits are optimistic and can silently revert on backend/RLS failure; check network responses if a field "didn't save."
- Do not expose Supabase service-role keys through frontend env vars. Browser app env vars must remain `VITE_*` publishable/build-time values only.

## 8. Access and environment

- GitHub remote: `origin https://github.com/u2giants/poppim-web.git`.
- Git branch for this repo: `main`.
- Git author: `Albert Hazan <u2giants@users.noreply.github.com>`.
- GitHub CLI is authenticated enough to list workflows/runs and push commits.
- 1Password vault for secrets and setup notes: `vibe_coding`. Do not print secret values.
- Supabase production project ref: `qsllyeztdwjgirsysgai`.
- Supabase preview branch/project ref from shared-db docs: `xjcyeuvzkhtzsheknaiu`.
- ClickUp MCP setup record: 1Password vault `vibe_coding`, item `ClickUp MCP Server - official remote setup`.
- Supabase DB migration password record: 1Password vault `vibe_coding`, item `Supabase DB Password - shared POP database`, field `password`.
- Runtime app is owned by Coolify/GitHub Actions/GHCR. Do not deploy by SSH or `docker run` on the server.

## 9. Open questions and risks

- The 46 remaining unstored `product_file` sources may never be recoverable from ClickUp. Risk: old tasks may still show ClickUp fallback URLs that are dead. Decision so far: recover only when real source bytes are found.
- Raw ClickUp browser screenshots are still missing from the PM gap-review worksheet. Risk: visual comparison is less literal than a screenshot packet. Decision so far: use MCP-verified panels and clearly label them.
- Legacy `crm_account_*` generated types may remain until shared-db removes compatibility objects. Risk: future AI sessions may mistake generated type references for active PM usage. Decision: document that generated entries are not to be manually deleted.
- Supabase Auth is shared across apps and CRM is the project `site_url`. Risk: PM Microsoft SSO can route to CRM if redirect allowlist config drifts. Decision: document the required PM allowlist entries.

## Self-audit

Passed. This handoff names what the app is, why the session happened, current branch/deploy state, what worked, what failed and why, root causes, exact next steps with verification gates, constraints, access locations, and remaining risks. A fresh developer should be able to continue without reading this chat.

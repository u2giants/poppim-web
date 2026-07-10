# ClickUp MCP Server

ClickUp has an official remote MCP server for connecting AI assistants to the
ClickUp workspace:

```text
https://mcp.clickup.com/mcp
```

The setup record is stored in 1Password:

```text
vault: vibe_coding
item: ClickUp MCP Server - official remote setup
```

The official server uses OAuth 2.1 with PKCE. ClickUp does not support
authenticating the official MCP server with a personal API key or static access
token.

## Current Codex Setup

As of 2026-06-30, OAuth was completed for the Ubuntu `ai` user on Hetzner:

```bash
su - ai -c 'codex mcp list'
```

Expected ClickUp entry:

```text
Name     Url                          Status   Auth
clickup  https://mcp.clickup.com/mcp  enabled  OAuth
```

The relevant Ubuntu config is:

```text
/home/ai/.codex/config.toml
```

It contains:

```toml
mcp_oauth_callback_port = 32803

[mcp_servers.clickup]
url = "https://mcp.clickup.com/mcp"
```

The fixed callback port matters when the browser is on Windows and the MCP
client is on Hetzner. Use an SSH tunnel from Windows before starting OAuth:

```powershell
ssh -L 32803:127.0.0.1:32803 ai@hetz
```

Then run this on Hetzner as `ai`:

```bash
codex mcp login clickup
```

Open the printed `https://mcp.clickup.com/oauth/authorize?...` URL in the
Windows browser. The final redirect to `http://127.0.0.1:32803/...` will be
forwarded to the waiting Codex process on Hetzner.

If a new Codex session does not show ClickUp, restart the Codex session. MCP
servers are loaded at session startup; an already-running session may not gain a
newly configured/authenticated server.

Standard client command:

```bash
npx -y mcp-remote https://mcp.clickup.com/mcp
```

## Other MCP Servers on Hetzner

The `ai` user's Ubuntu Codex config was updated on 2026-06-30 to mirror the
Linux MCP stack used by the root Codex session. Verify with:

```bash
su - ai -c 'codex mcp list'
```

Expected enabled servers:

- `clickup` — official remote ClickUp MCP, OAuth.
- `1password` — `@u2giants/1password-mcp`; use for stored credentials and
  setup notes.
- `playwright` — browser automation MCP.
- `devops-mcp` — server/host/Docker/system operations; discover hidden
  operations with `tool_search` first.
- `synology-monitor` — NAS diagnostics/monitoring; use its own `tool_search`
  before NAS operations.
- `recall-ai` — Recall.ai workspace/docs/debugging tools.
- `trigger` — Trigger.dev docs/setup/project tools.
- `vercel` — Vercel remote MCP.
- `ag-grid` — AG Grid documentation search MCP.

For this desktop Codex thread, available MCPs appear as tool namespaces only
when the session was started with them. If the CLI shows a server but this
thread does not expose its tools, start a fresh Codex session or route a
read-only audit through:

```bash
su - ai -c 'cd /worksp/poppim-web && codex exec --dangerously-bypass-approvals-and-sandbox "<prompt>"'
```

Use that pattern carefully: it starts a nested Codex CLI agent as `ai`, with the
`ai` user's MCP configuration.

## Capabilities

As of 2026-06-30, ClickUp documents these official MCP capabilities:

- Search the workspace, tasks by task type, and tasks by tag.
- Create, get, update, and delete tasks.
- Create and update tasks in bulk.
- Set task custom fields.
- Attach files to tasks.
- Get task comments, get threaded replies, and create task comments.
- Add and remove task tags.
- Add and remove task links and dependencies.
- Move tasks to another List and add tasks to another List.
- Get workspace hierarchy, Lists, Folders, and workspace members.
- Create/update Lists and Folders.
- Resolve members and assignees by name or email.
- Get, start, stop, and manually add time entries.
- Get time-in-status for one task or tasks in a List.
- Get chat channels and send chat messages.
- Create Docs, list Doc pages, get Doc pages, create Doc pages, and update Doc pages.

## Migration Uses

For the Poppim migration, ClickUp MCP is useful as an interactive audit layer:

- Ask an AI assistant to inspect a ClickUp task/card and summarize the fields,
  comments, files, checklists, subtasks, relationships, and time-in-status that
  staff actually use.
- Compare a ClickUp task to the matching Poppim product by ClickUp task id.
- Generate human-readable gap notes from real tasks and Lists.
- Spot-check dependencies, tags, comments, and time logs before deciding whether
  they should become first-class Poppim features or remain imported evidence.

Use deterministic REST/export/Supabase scripts for bulk migration or production
sync. The MCP server is OAuth-scoped, permission-scoped, rate-limited, and
currently in public beta.

## 2026-06-30 Gap Review Audit

The ClickUp side of `docs/clickup-poppim-gap-review.pdf` was re-checked through
the authenticated ClickUp MCP server on 2026-06-30. The nested Codex CLI audit
inspected:

- Workspace hierarchy: `POP Creations`, `Spruce Line`, and `designflow`.
- Relevant product/project lists: `Licensing Management`,
  `Sourcing/Sampling Projects`, `New Prod Development`, `Edge Generic`, and
  `Sprint 1`.
- Representative open tasks/cards:
  - `8687bymye` — Sonic canvas, `Licensing Management`.
  - `8689emd23` — Diecut Acrylic Clocks, `Sourcing/Sampling Projects`.
  - `8688ckee4` — Stitch/Spiderman cotton rope basket, `New Prod Development`.
  - `868gj2u0h` — Burlington/Kim illustrations, `Edge Generic`.
  - `868hjptjf` — Hobby Lobby/LaTasha/Fall, `Edge Generic`.
  - `86892rzhm` — Star Wars Hexagon Bin, `New Prod Development`.

Verified through MCP:

- Status columns and list status counts.
- Spaces/folders/lists.
- Assignees, due dates, priority, tags, checklist counts.
- Checklists, subtasks, descriptions.
- Comments, threaded replies, mentions, attachments, and image/PDF evidence.
- Custom fields including customer/retailer, buyer, factory, category, due date
  licensor, sample request, license, and put-up fields.
- Linked tasks and partial dependency/time evidence.

Partially or not verified through MCP:

- Exact ClickUp board drag order. Status order was visible, but exact manual
  board order was not exposed by the read tools.
- Named saved views and dashboards. List URLs were visible, but saved/board view
  enumeration was not exposed by the available tools.
- Full status/activity history. Current status and created/updated timestamps
  were visible, but full activity history was not exposed.
- Time in status. The bulk time-in-status call returned no task data.
- Logged time entries. One time estimate was present, but sampled time entry
  queries returned zero entries.

Direct ClickUp browser screenshots were still blocked by ClickUp's interactive
login/SSO flow in headless automation. For this reason, the revised PDF uses
MCP-verified ClickUp evidence panels instead of raw ClickUp browser captures,
and live Poppim screenshots for the Poppim panels.

Sources:

- ClickUp MCP overview: https://developer.clickup.com/docs/connect-an-ai-assistant-to-clickups-mcp-server
- ClickUp MCP setup: https://developer.clickup.com/docs/connect-an-ai-assistant-to-clickups-mcp-server-1
- ClickUp MCP supported tools: https://developer.clickup.com/docs/mcp-tools
- ClickUp Help overview: https://help.clickup.com/hc/en-us/articles/33335772678423-What-is-ClickUp-MCP

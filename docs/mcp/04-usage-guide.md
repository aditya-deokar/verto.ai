# Verto AI — MCP Server Usage Guide

> Connect any MCP-compatible AI assistant to Verto AI's presentation platform.

---

## What is MCP?

The **Model Context Protocol (MCP)** is an open standard that lets AI assistants (like Claude, Cursor, Windsurf, and Antigravity) interact with external tools and data sources. Verto AI exposes an MCP server so AI agents can **list, create, edit, delete, and publish presentations** on your behalf.

---

## Prerequisites

1. **Verto AI API Key** — Generate one from your [Verto AI Settings page](http://localhost:3000/settings)
2. **Node.js 18+** and **bun** (or npm) installed
3. The Verto AI project cloned and dependencies installed

---

## Quick Start

### 1. Set your API key

Add your Verto AI API key to `.env`:

```env
VERTO_API_KEY=verto_your_api_key_here
```

### 2. Start the MCP server (stdio)

```bash
npx tsx src/mcp/transport/stdio.ts
```

### 3. Or use the MCP Inspector to test interactively

```bash
npx @modelcontextprotocol/inspector npx tsx src/mcp/transport/stdio.ts
```

This opens a web UI where you can browse tools, resources, and execute test calls.

---

## Transport Options

Verto AI supports **two MCP transports**:

| Transport | Use Case | Endpoint |
|-----------|----------|----------|
| **stdio** | Local AI clients (Claude Desktop, Cursor, Windsurf, Antigravity) | `npx tsx src/mcp/transport/stdio.ts` |
| **Streamable HTTP** | Remote/cloud AI agents, web-based integrations | `POST /api/mcp` |

---

## Connecting to AI Clients

### Antigravity (Google Gemini Coding Assistant)

Add the following to your **Antigravity MCP settings** (`.gemini/settings.json` or via the UI):

```json
{
  "mcpServers": {
    "verto-ai": {
      "command": "npx",
      "args": ["tsx", "src/mcp/transport/stdio.ts"],
      "cwd": "C:/Users/adity/Documents/PPT Gen/pptmaker",
      "env": {
        "VERTO_API_KEY": "verto_your_api_key_here"
      }
    }
  }
}
```

Once connected, you can ask Antigravity to:
- *"List my presentations"*
- *"Create a presentation about climate change with 5 slides"*
- *"Change the theme of presentation X to Dark Elegance"*
- *"Publish my latest presentation"*

---

### Claude Desktop

Add to your Claude Desktop config file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "verto-ai": {
      "command": "npx",
      "args": ["tsx", "src/mcp/transport/stdio.ts"],
      "cwd": "C:/Users/adity/Documents/PPT Gen/pptmaker",
      "env": {
        "VERTO_API_KEY": "verto_your_api_key_here"
      }
    }
  }
}
```

Restart Claude Desktop after saving. The Verto AI tools will appear in Claude's tool picker (hammer icon).

---

### Cursor

Add to your Cursor MCP settings (`.cursor/mcp.json` in your project root):

```json
{
  "mcpServers": {
    "verto-ai": {
      "command": "npx",
      "args": ["tsx", "src/mcp/transport/stdio.ts"],
      "cwd": "C:/Users/adity/Documents/PPT Gen/pptmaker",
      "env": {
        "VERTO_API_KEY": "verto_your_api_key_here"
      }
    }
  }
}
```

---

### Windsurf

Add to your Windsurf MCP config (`~/.codeium/windsurf/mcp_config.json`):

```json
{
  "mcpServers": {
    "verto-ai": {
      "command": "npx",
      "args": ["tsx", "src/mcp/transport/stdio.ts"],
      "cwd": "C:/Users/adity/Documents/PPT Gen/pptmaker",
      "env": {
        "VERTO_API_KEY": "verto_your_api_key_here"
      }
    }
  }
}
```

---

### VS Code (GitHub Copilot MCP)

Add to your VS Code settings (`.vscode/settings.json`):

```json
{
  "mcp": {
    "servers": {
      "verto-ai": {
        "command": "npx",
        "args": ["tsx", "src/mcp/transport/stdio.ts"],
        "cwd": "${workspaceFolder}",
        "env": {
          "VERTO_API_KEY": "verto_your_api_key_here"
        }
      }
    }
  }
}
```

---

### HTTP Transport (Remote / API Clients)

For remote or cloud-based agents, use the HTTP endpoint:

```
POST https://your-domain.com/api/mcp
```

Include your API key as a Bearer token:

```bash
curl -X POST https://your-domain.com/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer verto_your_api_key_here" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

---

## Available Tools (10)

### Read-Only

| Tool | Description |
|------|-------------|
| `presentation_list` | List all presentations with pagination, sorting, and soft-delete filtering |
| `presentation_get` | Get a single presentation by ID (with optional slide content) |

### Create & Delete

| Tool | Description |
|------|-------------|
| `presentation_create` | Create a new presentation with title and outlines |
| `presentation_delete` | Soft-delete a presentation (recoverable) |
| `presentation_recover` | Restore a soft-deleted presentation |
| `presentation_delete_permanently` | **PERMANENT** deletion — requires `confirm: true` |

### Update

| Tool | Description |
|------|-------------|
| `presentation_update_slides` | Replace all slides (full replacement, not a patch) |
| `presentation_update_theme` | Change the visual theme |

### Publishing

| Tool | Description |
|------|-------------|
| `presentation_publish` | Make publicly shareable via a share URL |
| `presentation_unpublish` | Remove public access |

---

## Available Resources (3)

Resources provide read-only context that AI agents can reference:

| Resource URI | Description |
|-------------|-------------|
| `verto://presentations` | Instructions for browsing presentations (directs to `presentation_list`) |
| `verto://templates` | Live catalog of published templates with ratings |
| `verto://themes` | All 40+ available themes with colors and typography |

---

## Example Workflows

### Create a presentation from scratch

```
1. presentation_create(title: "Q4 Sales Report", outlines: [...])
2. presentation_update_theme(presentation_id: "...", theme_name: "Dark Elegance")
3. presentation_update_slides(presentation_id: "...", slides: [...])
4. presentation_publish(presentation_id: "...")
```

### Edit an existing presentation

```
1. presentation_list() → find the presentation ID
2. presentation_get(presentation_id: "...", include_slides: true)
3. Modify the slides array
4. presentation_update_slides(presentation_id: "...", slides: [...])
```

### Clean up old presentations

```
1. presentation_list(include_deleted: true) → find trash items
2. presentation_delete_permanently(presentation_ids: [...], confirm: true)
```

### Browse themes before updating

```
1. Read resource: verto://themes
2. presentation_update_theme(presentation_id: "...", theme_name: "Ocean Breeze")
```

---

## Troubleshooting

### "Authentication required" error
- Ensure `VERTO_API_KEY` is set in your `.env` file or in the MCP client config's `env` block
- The API key must match a valid key in the Verto AI database

### "EPERM: operation not permitted" when starting
- Another process (like MCP Inspector) may be running and locking the Prisma engine
- Kill all `node.exe` processes: `taskkill /F /IM node.exe /T`
- Then retry

### Tools not showing in Claude Desktop / Cursor
- Restart the AI client after updating the MCP config
- Check the client's MCP logs for connection errors
- Verify the `cwd` path points to the correct project directory

### "Usage limit exceeded"
- Free tier: 5 presentations, BYOAK: 15, Pro: unlimited
- Upgrade your plan or add your own AI API key in Settings

---

## Development Scripts

Add these to your `package.json` for convenience:

```json
{
  "scripts": {
    "mcp:dev": "npx tsx src/mcp/transport/stdio.ts",
    "mcp:inspect": "npx @modelcontextprotocol/inspector npx tsx src/mcp/transport/stdio.ts"
  }
}
```

Then run:

```bash
bun run mcp:dev       # Start MCP server
bun run mcp:inspect   # Open MCP Inspector UI
```

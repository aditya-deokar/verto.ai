# Verto AI - MCP Server Usage Guide

> Connect MCP-compatible AI clients to Verto AI's presentation platform.

---

## What is MCP?

The **Model Context Protocol (MCP)** is an open standard that lets AI assistants connect to external tools and data sources. Verto AI exposes an MCP server so agents can **list, create, edit, generate, delete, and publish presentations** on your behalf.

---

## Prerequisites

1. **Verto AI API Key** - Generate one from your [Verto AI Settings page](http://localhost:3000/settings)
2. **Node.js 18+** and project dependencies installed
3. For **stdio**: local access to this repository
4. For **Streamable HTTP**: a running Verto AI app with `/api/mcp` reachable by the client

---

## Quick Start

### 1. Set your API key

For local stdio clients, add your key to `.env`:

```env
VERTO_API_KEY=verto_your_api_key_here
```

### 2. Start the MCP server in stdio mode

```bash
npx tsx src/mcp/transport/stdio.ts
```

### 3. Or test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector
```

In Inspector:

1. Choose `stdio` to test the local server, or `Streamable HTTP` to test `/api/mcp`
2. For stdio, use `npx tsx src/mcp/transport/stdio.ts`
3. For HTTP, use `http://localhost:3000/api/mcp` or your deployed URL
4. If testing HTTP auth, send `Authorization: Bearer verto_your_api_key_here`

---

## Transport Options

Verto AI supports two MCP transports:

| Transport | Use Case | Endpoint / Startup |
|-----------|----------|--------------------|
| **stdio** | Local desktop and IDE clients | `npx tsx src/mcp/transport/stdio.ts` |
| **Streamable HTTP** | Remote or cloud clients, browser-based integrations, shared deployments | `https://your-domain.com/api/mcp` |

### Streamable HTTP behavior

- `GET /api/mcp` returns server metadata and acts as a health check
- `POST /api/mcp` handles MCP JSON-RPC requests
- `DELETE /api/mcp` closes an MCP session
- `OPTIONS /api/mcp` supports CORS preflight
- HTTP auth uses `Authorization: Bearer <VERTO_API_KEY>` for API-key clients
- Browser-based clients can also authenticate through an existing Clerk session

---

## Connecting with stdio Clients

### Antigravity (Google Gemini Coding Assistant)

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

### Claude Desktop

Add to your Claude Desktop config file:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\\Claude\\claude_desktop_config.json`

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

### Cursor

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

### Windsurf

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

### VS Code

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

## Adding the Streamable HTTP Server to MCP Clients

Use the HTTP endpoint when you want a **remote/shared MCP server** instead of launching a local process.

### Generic HTTP configuration shape

If your MCP client supports remote HTTP servers via JSON config, the entry typically looks like this:

```json
{
  "mcpServers": {
    "verto-ai": {
      "type": "http",
      "url": "https://your-domain.com/api/mcp",
      "headers": {
        "Authorization": "Bearer ${VERTO_API_KEY}"
      }
    }
  }
}
```

Use:

- `type: "http"` for Streamable HTTP
- `url` set to your deployed MCP route
- `Authorization: Bearer ...` for API-key auth

### Claude Code

Claude Code has first-class documented support for remote HTTP MCP servers.

Add from the CLI:

```bash
claude mcp add --transport http verto-ai https://your-domain.com/api/mcp \
  --header "Authorization: Bearer ${VERTO_API_KEY}"
```

Or store it in `.mcp.json`:

```json
{
  "mcpServers": {
    "verto-ai": {
      "type": "http",
      "url": "https://your-domain.com/api/mcp",
      "headers": {
        "Authorization": "Bearer ${VERTO_API_KEY}"
      }
    }
  }
}
```

### Anthropic Messages API MCP Connector

If you are connecting from the Anthropic API instead of a desktop IDE client, configure the remote server in the `mcp_servers` array:

```json
{
  "mcp_servers": [
    {
      "type": "url",
      "name": "verto-ai",
      "url": "https://your-domain.com/api/mcp",
      "authorization_token": "verto_your_api_key_here"
    }
  ],
  "tools": [
    {
      "type": "mcp_toolset",
      "mcp_server_name": "verto-ai"
    }
  ]
}
```

### Cursor and other remote-capable clients

Cursor's docs say it supports **Streamable HTTP** for MCP, but remote-auth configuration UX can vary by version. In practice:

1. Open the client's MCP settings
2. Add a **remote HTTP** MCP server
3. Set the server URL to `https://your-domain.com/api/mcp`
4. If the client supports custom headers, add `Authorization: Bearer <VERTO_API_KEY>`
5. If your client only supports OAuth for remote MCP auth, use the **stdio** transport for Verto AI instead

### Local HTTP example

If your Next.js app is running locally:

```text
http://localhost:3000/api/mcp
```

If deployed:

```text
https://your-domain.com/api/mcp
```

---

## Basic HTTP Verification

### Health check

```bash
curl http://localhost:3000/api/mcp
```

### List tools over Streamable HTTP

```bash
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer verto_your_api_key_here" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

---

## Available Tools (11)

### Read-only

| Tool | Description |
|------|-------------|
| `presentation_list` | List all presentations with pagination, sorting, and soft-delete filtering |
| `presentation_get` | Get a single presentation by ID, optionally including slide content |

### Create, delete, and recover

| Tool | Description |
|------|-------------|
| `presentation_create` | Create a new presentation with title and outlines |
| `presentation_delete` | Soft-delete a presentation |
| `presentation_recover` | Restore a soft-deleted presentation |
| `presentation_delete_permanently` | Permanent deletion, requires `confirm: true` |

### Update

| Tool | Description |
|------|-------------|
| `presentation_update_slides` | Replace the full slides array |
| `presentation_update_theme` | Change the visual theme |

### Publishing

| Tool | Description |
|------|-------------|
| `presentation_publish` | Create a public share URL |
| `presentation_unpublish` | Remove public access |

### AI generation

| Tool | Description |
|------|-------------|
| `presentation_generate` | Run the AI generation pipeline with progress tracking |

---

## Available Resources (4)

| Resource URI | Description |
|-------------|-------------|
| `verto://presentations` | Guidance for browsing presentations via `presentation_list` |
| `verto://templates` | Published template catalog |
| `verto://themes` | Available themes and visual metadata |
| `verto://generation/{runId}/progress` | Progress details for a running generation job |

---

## Example Workflows

### Create a presentation from scratch

```text
1. presentation_create(title: "Q4 Sales Report", outlines: [...])
2. presentation_update_theme(presentation_id: "...", theme_name: "Dark Elegance")
3. presentation_update_slides(presentation_id: "...", slides: [...])
4. presentation_publish(presentation_id: "...")
```

### Generate a presentation with AI

```text
1. presentation_generate(topic: "Climate change strategy deck")
2. If status is RUNNING, read verto://generation/{runId}/progress
3. When project_id is available, call presentation_get(presentation_id: "...")
4. Optionally publish with presentation_publish(...)
```

### Edit an existing presentation

```text
1. presentation_list()
2. presentation_get(presentation_id: "...", include_slides: true)
3. Modify the slides array
4. presentation_update_slides(presentation_id: "...", slides: [...])
```

### Browse themes before updating

```text
1. Read verto://themes
2. presentation_update_theme(presentation_id: "...", theme_name: "Ocean Breeze")
```

---

## Troubleshooting

### "Authentication required"

- For stdio, make sure `VERTO_API_KEY` is present in the process environment
- For HTTP, send `Authorization: Bearer <VERTO_API_KEY>`
- If you are using a browser-based client, make sure the Clerk session belongs to the same Verto account

### Remote HTTP client connects but tools fail

- Verify the URL is exactly `/api/mcp`
- Confirm the deployed domain is reachable from the client
- Check that the client is using **Streamable HTTP**, not raw REST
- If the client cannot send custom Bearer headers for remote HTTP, fall back to stdio

### CORS or preflight problems

- Set `MCP_ALLOWED_ORIGINS` for your deployed domains if needed
- Confirm the client is sending requests to the same domain you allow

### "Request exceeds the 10MB MCP limit"

- Reduce payload size, especially full slide arrays
- Avoid sending deeply nested or duplicated JSON

### "Rate limit exceeded"

- Free tier users have lower per-minute MCP limits
- Wait for the returned `retry_after_seconds` value before retrying

### Tools not showing in Claude Desktop / Cursor

- Restart the client after saving config changes
- Verify the `cwd` path for stdio setups
- For HTTP setups, verify the remote server is healthy with `GET /api/mcp`

---

## Development Scripts

`package.json` already includes:

```json
{
  "scripts": {
    "mcp:dev": "npx tsx src/mcp/transport/stdio.ts",
    "mcp:inspect": "npx @modelcontextprotocol/inspector npx tsx src/mcp/transport/stdio.ts"
  }
}
```

Run:

```bash
bun run mcp:dev
bun run mcp:inspect
```

---

## Notes

- Prefer **stdio** for local desktop/IDE setups
- Prefer **Streamable HTTP** for shared, remote, or server-hosted MCP access
- Verto AI's remote MCP auth currently expects a **Bearer API key** or a **Clerk browser session**
- Some MCP clients support remote HTTP today but still vary in how they expose custom auth headers; when in doubt, use stdio locally



<!-- 
 // "verto-ai": {
    //   "command": "npx",
    //   "args": [
    //     "tsx",
    //     "src/mcp/transport/stdio.ts"
    //   ],
    //   "cwd": "C:/Users/adity/Documents/PPT Gen/pptmaker",
    //   "env": {
    //     "VERTO_API_KEY": "vk_live_01f252f55a17f24e9a384099ac411ea7de16792b"
    //   },
    //   "disabled": true
    // } -->
<p align="center">
  <img src="./public/logoipsum-246.png" alt="Verto AI Logo" width="88" height="88" />
</p>

<h1 align="center">Verto AI</h1>

<p align="center">
  <strong>AI presentation workspace, mobile design engine, and hosted MCP server</strong>
</p>

<p align="center">
  Transform outlines and raw documents into broadcast-ready slide decks, iterate with an interactive editor, build mobile app layouts, and control presentation flows directly through an authenticated Model Context Protocol (MCP) server.
</p>

<p align="center">
  <a href="https://verto.ai.aditya-deokar.me"><strong>Live Web App</strong></a>
  •
  <a href="https://verto.ai.aditya-deokar.me/docs/mcp/04-usage-guide"><strong>Hosted MCP Guide</strong></a>
  •
  <a href="#system-architecture"><strong>Architecture</strong></a>
  •
  <a href="#mcp-tools-and-resources"><strong>MCP Tools</strong></a>
  •
  <a href="#quick-start"><strong>Quick Start</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Prisma-6.7-2D3748?style=flat-square&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/LangGraph-0.4-16a34a?style=flat-square" alt="LangGraph" />
  <img src="https://img.shields.io/badge/MCP-Streamable_HTTP-10b981?style=flat-square" alt="MCP Streamable HTTP" />
  <img src="https://img.shields.io/badge/Tailwind-v4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
</p>

---

<p align="center">
  <img src="./docs/mcp-apps/submission-assets/presentation-cmq2lgo730001ora8ptqjx56t/presentation-editor.gif" alt="Verto AI Presentation Editor" width="90%" style="border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.35);" />
</p>

---

## Overview

Verto AI is a creative platform built on Next.js 16. It generates structured presentations from natural language, provides visual editing tools, creates mobile prototypes, and exposes a remote Model Context Protocol endpoint so AI assistants can build decks on your behalf.

### Core systems

1. **Agentic slide pipeline.** An 8-step LangGraph workflow determines structure and layout before drafting copy, keeping text fitted to slide components.
2. **Interactive deck studio.** Reorder slides with drag-and-drop, edit content inline, swap themes live, and export decks to PDF or public URLs.
3. **Mobile design generator.** An Inngest background job pipeline generates HTML mobile screen prototypes from text prompts.
4. **Hosted MCP server.** Remote AI clients such as Claude Desktop and Cursor connect over Streamable HTTP to create, update, and publish presentations.
5. **BYOK model routing.** Users can store Google, OpenAI, or Groq API keys and configure model preferences with automatic fallbacks.

---

## Live endpoints

| Surface | Address | Description |
| --- | --- | --- |
| Web application | [verto.ai.aditya-deokar.me](https://verto.ai.aditya-deokar.me) | Full browser app with editor, dashboard, and settings |
| Hosted MCP endpoint | `https://verto.ai.aditya-deokar.me/mcp` | Streamable HTTP transport for remote MCP clients |
| OAuth discovery | `/.well-known/oauth-protected-resource` | Protected resource metadata for client discovery |
| MCP integration guide | [/docs/mcp/04-usage-guide](https://verto.ai.aditya-deokar.me/docs/mcp/04-usage-guide) | Step-by-step setup for Claude Desktop, Cursor, and CLI |

---

## System architecture

### High-level topology

```mermaid
graph LR
    User["Browser user"] --> App["Verto AI web app"]
    AIClient["Claude / Cursor / MCP client"] --> MCP["Hosted MCP server"]

    App --> Clerk["Clerk authentication"]
    App --> Actions["Server actions"]
    App --> Stream["Streamable generation API"]
    App --> Mobile["Mobile design routes"]

    Actions --> Workflow["LangGraph slide pipeline"]
    Actions --> Prisma["Prisma ORM"]
    Stream --> Workflow
    Mobile --> Inngest["Inngest background jobs"]

    Workflow --> Models["AI runtime & BYOK routing"]
    Workflow --> Images["Unsplash image search"]
    Workflow --> Prisma

    Inngest --> Models
    Inngest --> Prisma

    MCP --> Prisma
    MCP --> Workflow

    Billing["Lemon Squeezy"] --> App
    Prisma --> DB[("PostgreSQL")]
```

### Presentation generation flow

The presentation workflow decouples layout selection from copy writing. The generator decides the visual shape first, preventing text overflow and awkward slide density.

```mermaid
flowchart LR
    Prompt["Topic + context + theme"] --> Init["projectInitializer"]
    Init --> Outline["outlineGenerator"]
    Outline --> Layout["layoutSelector"]
    Layout --> Writer["contentWriter"]
    Writer --> Query["imageQueryGenerator"]
    Query --> Fetch["imageFetcher"]
    Fetch --> Compile["jsonCompiler"]
    Compile --> Persist["databasePersister"]
    Persist --> Editor["Editor, share link, PDF"]
```

### MCP connection lifecycle

```mermaid
sequenceDiagram
    participant Client as MCP client (Claude / Cursor)
    participant UI as Verto settings UI
    participant MCP as /mcp endpoint
    participant Tools as Presentation tools
    participant DB as PostgreSQL

    UI->>DB: Generate hashed API key (vk_live_...)
    Client->>MCP: initialize (Bearer token)
    MCP-->>Client: Session ID and server capabilities
    Client->>MCP: tools/call (e.g. presentation_generate)
    MCP->>Tools: Execute authenticated handler
    Tools->>DB: Read and write presentation state
    Tools-->>MCP: Return structured result
    MCP-->>Client: Streamed or JSON tool response
```

---

## Visual workspaces

### Live deck editor and presenter mode

Inspect and modify each slide in real time, navigate through custom layouts, and trigger full-screen presentation mode directly from the browser.

<p align="center">
  <img src="./docs/mcp-apps/submission-assets/presentation-cmq2lgo730001ora8ptqjx56t/presentation-desktop.png" alt="Desktop Presentation Editor" width="48%" style="border-radius: 8px;" />
  &nbsp;
  <img src="./docs/mcp-apps/submission-assets/presentation-cmq2lgo730001ora8ptqjx56t/presentation-flow.gif" alt="Presenter Mode Flow" width="48%" style="border-radius: 8px;" />
</p>

### Deck studio and theme system

The deck studio lets you inspect each slide, reorder items via drag-and-drop, test responsive views, and pick from curated theme palettes.

<p align="center">
  <img src="./docs/mcp-apps/submission-assets/deck-studio/theme-picker.png" alt="Theme Selector" width="48%" style="border-radius: 8px;" />
  &nbsp;
  <img src="./docs/mcp-apps/submission-assets/deck-studio/overview-desktop.png" alt="Overview Grid" width="48%" style="border-radius: 8px;" />
</p>

---

## MCP tools and resources

The hosted MCP endpoint exposes 11 tools and 4 resources using protocol version `2025-03-26`.

### Tools

| Tool name | Description |
| --- | --- |
| `presentation_create` | Scaffold an empty presentation with a title and theme |
| `presentation_generate` | Run the multi-agent generation pipeline to build a full deck |
| `presentation_get` | Fetch slide content, outline, and theme details for a deck |
| `presentation_list` | List recent presentations with pagination and search filters |
| `presentation_update_theme` | Apply a named theme from the catalog to an existing deck |
| `presentation_update_slide` | Modify slide title, body copy, layout, or image assets |
| `presentation_add_slide` | Insert a new slide at a designated index |
| `presentation_remove_slide` | Delete a slide from a deck |
| `presentation_reorder_slides` | Reorder slides by passing a list of slide IDs |
| `presentation_publish` | Make a presentation accessible via public share link |
| `presentation_unpublish` | Revoke public access to a presentation |

### Resources

| URI | Description |
| --- | --- |
| `verto://themes` | Complete list of available visual themes with color tokens |
| `verto://templates` | Catalog of prebuilt presentation templates |
| `verto://presentations` | User's presentations list with metadata |
| `verto://generation/{runId}/progress` | Real-time status stream for active generation runs |

---

## Tech stack

| Area | Technologies |
| --- | --- |
| Frontend | Next.js 16, React 19, Tailwind CSS 4, Radix UI, Framer Motion |
| State | Zustand stores for slide manipulation, UI state, and editor undo/redo |
| Agents | LangGraph.js, Vercel AI SDK (`ai`), LangChain Core |
| Models | Google Gemini, OpenAI GPT-4o, Groq Llama models |
| Database & ORM | PostgreSQL, Prisma 6.7 with typed client generation |
| Background tasks | Inngest queue for asynchronous mobile screen synthesis |
| Auth & Billing | Clerk, Lemon Squeezy webhooks and subscriptions |
| Export | html2canvas and jsPDF for client-side document rendering |
| Protocol | `@modelcontextprotocol/sdk` supporting Streamable HTTP and stdio |

---

## Project structure

```text
pptmaker/
|-- prisma/
|   `-- schema.prisma                      # Database schema and relations
|-- src/
|   |-- actions/                           # Next.js server actions (projects, themes, auth)
|   |-- agentic-workflow-v2/               # 8-agent LangGraph generation engine
|   |-- app/                               # App router pages, routes, layouts, and /mcp
|   |   |-- (auth)/                        # Sign-in and sign-up flows
|   |   |-- (protected)/                   # Dashboard, editor, templates, settings
|   |   |-- api/                           # Generation streaming and webhook endpoints
|   |   |-- docs/                          # MCP documentation and integration guides
|   |   `-- mcp/                           # Streamable HTTP MCP route handler
|   |-- components/                        # Reusable UI, slide canvas, and landing sections
|   |-- lib/                               # Theme definitions, BYOK resolution, slide models
|   |-- mcp/                               # Tools, resources, auth middleware, and app widgets
|   |-- mobile-design/                     # Inngest functions for mobile UI generation
|   `-- store/                             # Zustand slide and UI stores
|-- docs/                                  # Architectural specifications and guides
|-- public/                                # Static images, icons, and brand assets
`-- README.md                              # Project documentation
```

---

## Quick start

### Prerequisites

- Node.js 20 or newer
- Bun package manager
- PostgreSQL instance (local or hosted like Neon / Supabase)
- Clerk account for authentication
- At least one AI API key (Google Gemini, OpenAI, or Groq)

### 1. Clone and install

```bash
git clone https://github.com/aditya-deokar/verto.ai.git
cd verto.ai
bun install
```

### 2. Configure environment

Create a `.env` file in the project root:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/verto"

# Clerk authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# AI runtime (default hosted keys)
GEMINI_API_KEY="AIza..."
OPENAI_API_KEY="sk-..."
GROQ_API_KEY="gsk_..."

# Unsplash image provider
UNSPLASH_ACCESS_KEY="..."

# MCP secrets (optional for local development)
VERTO_MCP_SECRET="secret-signing-key"
```

### 3. Initialize database

```bash
npx prisma generate
npx prisma migrate dev
```

### 4. Start the application

```bash
# Start the web app with Turbopack
bun run dev

# (Optional) Start the Inngest local dev server for mobile screen generation
bun run inngest:dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Local MCP testing

You can test the MCP server locally over stdio without running the Next.js web server:

```bash
# Set your API key
export VERTO_API_KEY="vk_live_..."

# Run the MCP server over stdio
bun run mcp:dev

# Inspect tools and resources with the MCP Inspector
bun run mcp:inspect
```

---

## Useful scripts

| Command | Purpose |
| --- | --- |
| `bun run dev` | Run local web server with Turbopack |
| `bun run build` | Build the Next.js production bundle |
| `bun run start` | Run the built production server |
| `bun run inngest:dev` | Start the local Inngest development agent |
| `bun run mcp:dev` | Start the local MCP server over stdio |
| `bun run mcp:inspect` | Launch MCP Inspector against the local stdio transport |
| `bun run lint` | Execute ESLint checks across the codebase |

---

## License

Private repository. All rights reserved.

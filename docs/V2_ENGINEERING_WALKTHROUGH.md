# V2: Verto AI Engineering Deep-Dive (High-Signal)

This version is stripped of marketing fluff. It is designed for a fast-paced, "point-to-point" technical walkthrough.

---

## 01: Architecture & Stack
- **Next.js 16 + React 19**: Standardized on **Turbopack** for rapid HMR in complex agentic logic.
- **Server-First CRUD**: 100% Next.js **Server Actions**. No REST/GraphQL overhead. 
- **Ownership Boundary**: All actions piped through `getOwnedProject()` for mandatory Auth-to-DB mapping.
- **Infrastructure**: **Prisma** (Postgres), **Inngest** (Queueless background jobs), **Clerk** (JWT Auth).

## 02: The Agentic Pipeline (LangGraph)
- **Problem**: Monolithic LLM prompts fail on layout structure.
- **Solution**: **LangGraph orchestration** with 8 specialized agents.
- **The Flow**: 
    1. **Architect** (Plan) → 
    2. **Layout Designer** (CSS/Structure Schema Selection) → 
    3. **Content Writer** (Context-aware text) → 
    4. **Curator** (Asset injection).
- **Layout-First Design**: AI selects the **Layout Primitive** *before* generating content. This prevents text-overflow and responsive breakages.
- **State Persistence**: Progress is mirrored in the `PresentationGenerationRun` DB table. Survived refreshes + SSE live-streaming status.

## 03: Frontend — Recursive Rendering
- **The Core**: Slides are stored as a **recursive JSON tree** of `ContentItem` nodes.
- **Logic**: The `MasterRecursiveComponent` walks the tree. 
    - **Nesting**: Supports infinite nesting (columns inside columns inside cards).
    - **Single Source of Truth**: The same component tree renders the **Editor**, **Presentation Mode**, and **PPTX/PDF Export**.
- **State Management**: **Zustand** with optimistic updates. Every user edit hits the store immediately and debounces the Server Action save.

## 04: The MCP Server (Programmable Interface)
- **Protocol**: **Model Context Protocol (MCP)** implementation.
- **Capability**: Allows external agents (Claude, Cursor) to call `presentation_generate` or `presentation_update_slides` via JSON-RPC.
- **Impact**: Decouples the UI from the engine. Verto becomes a **headless presentation platform**.

## 05: Background Workflows (Inngest)
- **Use Case**: **Mobile UI Generation**. High-latency HTML/CSS frame generation.
- **Pattern**: 
    1. UI fires Inngest event. 
    2. Background function handles LLM retries and asset fetching. 
    3. Polling/SSE updates the UI upon completion.
- **Benefit**: Zero blocking on the main Next.js thread.

---

## Technical Features Walkthrough (Point-to-Point)

1. **Landing Page**: 
   - GSAP + `@gsap/react`.
   - Intersection Observer based reveal triggers.
2. **Generation Flow**: 
   - SSE Stream (`/api/generation/stream`).
   - Live DB polling fallback.
3. **Visual Editor**: 
   - Recursive tree walker.
   - Dynamic CSS variable theme injection.
4. **MCP Demo**: 
   - Show `stdio` transport connecting to Claude Desktop.
   - Command: `presentation_list` → `presentation_generate`.

---
*No fluff. Just engineering.*

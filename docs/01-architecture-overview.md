# Architecture Overview

> This document describes the high-level architecture of Verto AI. It is intended to give new contributors a mental model of the system before diving into code.

---

## Table of Contents

- [System Context](#system-context)
- [High-Level Architecture](#high-level-architecture)
- [Core Subsystems](#core-subsystems)
- [Request Flow Diagrams](#request-flow-diagrams)
- [Module Dependency Map](#module-dependency-map)
- [Key Architectural Principles](#key-architectural-principles)

---

## System Context

Verto AI is a Next.js 16 full-stack application that integrates with several external services to deliver its functionality.

```mermaid
graph LR
    User([End User]) --> VertoAI["Verto AI<br/>(Next.js 16)"]
    
    VertoAI --> Clerk[Clerk<br/>Authentication]
    VertoAI --> Gemini[Google Gemini<br/>2.5 Flash]
    VertoAI --> Unsplash[Unsplash API<br/>Image Search]
    VertoAI --> PostgreSQL[(PostgreSQL<br/>Database)]
    VertoAI --> Inngest[Inngest<br/>Background Jobs]
    VertoAI --> LemonSqueezy[Lemon Squeezy<br/>Payments]
    
    style VertoAI fill:#0070f3,color:#fff,stroke:#0070f3
    style Clerk fill:#6C47FF,color:#fff
    style Gemini fill:#4285F4,color:#fff
    style Unsplash fill:#111,color:#fff
    style PostgreSQL fill:#336791,color:#fff
    style Inngest fill:#6366f1,color:#fff
    style LemonSqueezy fill:#FFC233,color:#000
```

| Service | Purpose | Integration Point |
|---------|---------|------------------|
| **Clerk** | User authentication & identity | Middleware + `@clerk/nextjs` |
| **Google Gemini** | LLM for content generation | AI SDK (`@ai-sdk/google`) + LangChain |
| **Unsplash** | Stock image search for slides | REST API via `imageProviders.ts` |
| **PostgreSQL** | Primary data store | Prisma ORM |
| **Inngest** | Background job processing | Event-driven functions for mobile design |
| **Lemon Squeezy** | Subscription billing | Webhook-based status sync |

---

## High-Level Architecture

```mermaid
graph TB
    subgraph Client["Browser (Client)"]
        UI[React UI]
        ZustandStore[Zustand Stores]
        SSEClient[SSE Client]
    end
    
    subgraph NextApp["Next.js 16 Server"]
        subgraph AppRouter["App Router"]
            Pages[Pages & Layouts]
            APIRoutes[API Routes]
        end
        
        subgraph ServerActions["Server Actions"]
            ProjectActions[Project CRUD]
            GenerationAction[Generation Entry]
            ShareActions[Share/Publish]
            SubActions[Subscription]
            AccessControl[Ownership Enforcement]
        end
        
        subgraph AIEngine["AI Generation Engine"]
            LangGraphPipeline["LangGraph Pipeline<br/>(8 Agents)"]
            Streaming[SSE Event Emitter]
            ProgressTracker[Progress Tracker]
        end
        
        subgraph BackgroundJobs["Background Processing"]
            InngestFunctions[Inngest Functions]
        end
        
        Middleware[Clerk Middleware]
        PrismaClient[Prisma Client]
    end
    
    subgraph External["External Services"]
        Clerk[Clerk Auth]
        Gemini[Google Gemini]
        Unsplash[Unsplash API]
        LemonSqueezy[Lemon Squeezy]
        DB[(PostgreSQL)]
    end
    
    UI --> Pages
    UI --> ServerActions
    ZustandStore --> UI
    SSEClient --> APIRoutes
    
    Middleware --> Clerk
    Pages --> Middleware
    APIRoutes --> Streaming
    
    GenerationAction --> LangGraphPipeline
    LangGraphPipeline --> Gemini
    LangGraphPipeline --> Unsplash
    LangGraphPipeline --> ProgressTracker
    ProgressTracker --> PrismaClient
    Streaming --> SSEClient
    
    InngestFunctions --> Gemini
    InngestFunctions --> PrismaClient
    
    ProjectActions --> AccessControl
    ShareActions --> AccessControl
    AccessControl --> PrismaClient
    SubActions --> LemonSqueezy
    PrismaClient --> DB
    
    style Client fill:#1a1a2e,color:#fff
    style NextApp fill:#16213e,color:#fff
    style AIEngine fill:#0f3460,color:#fff
    style External fill:#1a1a2e,color:#fff
```

---

## Core Subsystems

### 1. AI Generation Engine (`src/agentic-workflow-v2/`)

The heart of Verto AI. A **LangGraph state machine** that orchestrates 8 specialized agents to transform a topic into a complete slide deck.

**Key files**:
- `actions/advanced-genai-graph.ts` — Graph definition and execution
- `agents/` — 8 agent implementations
- `lib/state.ts` — Shared state schema
- `lib/llm.ts` — Model configuration
- `lib/validators.ts` — Zod schemas for LLM output validation

→ **Deep dive**: [03-agentic-workflow.md](03-agentic-workflow.md)

### 2. Slide Editor (`src/app/(protected)/presentation/`)

A visual editor built on a **recursive component tree**. Slides are stored as nested `ContentItem` JSON, rendered by `MasterRecursiveComponent`, and managed by a Zustand store with undo/redo.

**Key files**:
- `[presentationId]/page.tsx` — Editor page
- `_components/editor/MasterRecursiveComponent.tsx` — Recursive renderer
- `_components/editor/Editor.tsx` — Editor layout
- `src/store/useSlideStore.tsx` — Slide state with undo/redo

### 3. Server Actions (`src/actions/`)

All backend operations are implemented as Next.js **Server Actions** — no traditional REST endpoints. Every action authenticates the user via Clerk and enforces project ownership.

**Key files**:
- `project-access.ts` — `getOwnedProject()` helper (centralized ownership check)
- `projects.ts` — CRUD operations
- `generatePresentation.ts` — Generation entry point
- `presentation-generation.ts` — Run lifecycle tracking

→ **Deep dive**: [05-api-reference.md](05-api-reference.md)

### 4. Mobile Design System (`src/mobile-design/`)

A separate subsystem for generating mobile UI screens using AI. Unlike presentations, this uses **Inngest background functions** for generation because it produces raw HTML frames.

**Key files**:
- `inngest/functions/generateScreens.ts` — Screen generation function
- `inngest/functions/regenerateFrame.ts` — Individual frame regeneration

### 5. Payment & Subscription (`src/actions/subscription.ts`, `payment.ts`)

Lemon Squeezy integration for subscription billing. The flow is:
1. User initiates checkout via `buySubscription()` → redirects to Lemon Squeezy
2. Webhook (`/api/webhook/lemon-squeezy`) receives events → updates local `Subscription` model
3. Feature gating via `hasActiveSubscription()`

---

## Request Flow Diagrams

### 1. Presentation Generation

The primary user journey: topic → complete slide deck.

```mermaid
sequenceDiagram
    actor User
    participant UI as Create Page
    participant Hook as useAgenticGenerationV2
    participant SA as generatePresentationAction()
    participant Run as PresentationGenerationRun
    participant Graph as LangGraph Pipeline
    participant Agents as Agents (×8)
    participant LLM as Gemini 2.5 Flash
    participant DB as PostgreSQL
    participant SSE as SSE Stream

    User->>UI: Enter topic + theme
    UI->>Hook: Start generation
    Hook->>SA: Call server action
    SA->>Run: Create run (PENDING)
    SA->>Run: Start run (RUNNING)
    SA->>Graph: Execute graph
    
    loop For each of 8 agents
        Graph->>Agents: Run agent
        Agents->>Run: Mark step running
        Agents->>SSE: Emit agent_start
        Agents->>LLM: Generate content
        LLM-->>Agents: Return structured output
        Agents->>Run: Mark step completed
        Agents->>SSE: Emit agent_complete
    end
    
    Graph->>DB: Persist slides (databasePersister)
    SA->>Run: Complete run (COMPLETED)
    SA-->>Hook: Return {success, projectId}
    Hook->>UI: Navigate to editor
    
    Note over Hook,SSE: Client polls Run for progress<br/>or subscribes to SSE stream
```

### 2. Slide Editing

Real-time editing with optimistic Zustand updates and server persistence.

```mermaid
sequenceDiagram
    actor User
    participant Editor as Slide Editor
    participant Store as Zustand (useSlideStore)
    participant SA as updateSlides()
    participant Access as getOwnedProject()
    participant DB as PostgreSQL

    User->>Editor: Edit slide content
    Editor->>Store: updateContentItem()
    Store->>Store: Push to undo stack
    Store->>Store: Update slides (optimistic)
    Editor->>SA: Save slides
    SA->>Access: Verify ownership
    Access->>DB: Check userId match
    Access-->>SA: Project confirmed
    SA->>DB: Update slides JSON
    SA-->>Editor: Success
```

### 3. Mobile Design Generation

Background processing via Inngest for mobile screen generation.

```mermaid
sequenceDiagram
    actor User
    participant UI as Mobile Design Page
    participant Event as Inngest Event
    participant Fn as generateScreens()
    participant LLM as Gemini AI
    participant DB as PostgreSQL

    User->>UI: Describe mobile app
    UI->>Event: Send "mobile.generate" event
    Event->>Fn: Trigger background function
    
    loop For each screen
        Fn->>LLM: Generate HTML for screen
        LLM-->>Fn: Return HTML content
        Fn->>DB: Save MobileFrame
    end
    
    Fn-->>UI: Generation complete (via polling)
```

### 4. Share & Present

Owner-controlled publication with public access.

```mermaid
sequenceDiagram
    actor Owner
    actor Viewer
    participant Editor as Editor Navbar
    participant SA as publishProject()
    participant DB as PostgreSQL
    participant ShareRoute as /share/[id]

    Owner->>Editor: Click "Publish"
    Editor->>SA: publishProject(id)
    SA->>DB: Set isPublished = true
    SA-->>Editor: Return share URL
    Owner->>Viewer: Share link
    
    Viewer->>ShareRoute: Open share link
    ShareRoute->>DB: Query where isPublished = true
    DB-->>ShareRoute: Return slide data
    ShareRoute->>Viewer: Render PresentationViewer
```

### 5. Payment Flow

Lemon Squeezy checkout with webhook-based sync.

```mermaid
sequenceDiagram
    actor User
    participant App as Verto AI
    participant LS as Lemon Squeezy
    participant Webhook as /api/webhook/lemon-squeezy
    participant DB as PostgreSQL

    User->>App: Click "Subscribe"
    App->>LS: Create checkout session
    LS-->>User: Redirect to checkout
    User->>LS: Complete payment
    LS->>Webhook: subscription_created event
    Webhook->>DB: Create/update Subscription
    Webhook->>DB: Set user.subscription = true
    User->>App: Redirected to dashboard
    App->>DB: Check hasActiveSubscription()
    DB-->>App: true → unlock features
```

---

## Module Dependency Map

```mermaid
graph TD
    subgraph Entry["Entry Points"]
        CreatePage[Create Page]
        EditorPage[Editor Page]
        SharePage[Share Page]
        MobilePage[Mobile Design]
    end
    
    subgraph Actions["Server Actions"]
        GenAction[generatePresentation]
        ProjectActions[projects.ts]
        ShareActions[project-share.ts]
        AccessControl[project-access.ts]
        SubActions[subscription.ts]
    end
    
    subgraph AI["AI Engine"]
        Graph[LangGraph Graph]
        Agents[Agents × 8]
        State[State Schema]
        Validators[Zod Validators]
        LLMConfig[LLM Config]
        ImageProviders[Image Providers]
    end
    
    subgraph State["Client State"]
        SlideStore[useSlideStore]
        WorkflowStore[useAgenticWorkflowStore]
        GenHook[useAgenticGenerationV2]
    end
    
    subgraph Infra["Infrastructure"]
        Prisma[Prisma Client]
        Clerk[Clerk Auth]
        Inngest[Inngest Client]
        EventEmitter[SSE Emitter]
    end
    
    CreatePage --> GenAction
    CreatePage --> GenHook
    GenHook --> GenAction
    GenAction --> Graph
    Graph --> Agents
    Agents --> LLMConfig
    Agents --> Validators
    Agents --> ImageProviders
    Agents --> EventEmitter
    
    EditorPage --> SlideStore
    EditorPage --> ProjectActions
    ProjectActions --> AccessControl
    ShareActions --> AccessControl
    AccessControl --> Prisma
    AccessControl --> Clerk
    
    SharePage --> ShareActions
    MobilePage --> Inngest
    
    SubActions --> Prisma
    
    Prisma --> DB[(PostgreSQL)]
```

---

## Key Architectural Principles

### 1. Server-First

All data mutations happen through **Next.js Server Actions**, not REST APIs. This eliminates API boilerplate, provides automatic CSRF protection, and keeps business logic close to the data layer.

> Exception: The SSE streaming endpoint (`/api/generation/stream`) and webhooks use API Routes because they require long-lived connections or external POST callbacks.

### 2. Agent-Based AI Orchestration

Presentation generation is decomposed into **8 specialized agents** rather than one monolithic LLM prompt. Each agent has:
- A single responsibility
- Its own LLM temperature/token config
- Zod validation on outputs
- Independent error handling and retry logic

This makes the pipeline testable, debuggable, and extensible.

### 3. Database-Persisted Progress

Generation progress is tracked in the `PresentationGenerationRun` table, not simulated on the client. The server writes real step status as each agent completes, and the client polls this record. This means:
- Progress survives page refreshes
- Multiple devices see the same state  
- Failures are recorded with the exact failing step

### 4. Recursive Component Rendering

Slides are stored as a recursive tree of `ContentItem` nodes. The `MasterRecursiveComponent` walks this tree and renders the appropriate component for each node type. This enables:
- Arbitrarily nested layouts (columns within columns)
- Consistent rendering between editor, presentation mode, and export
- Drag-and-drop at any nesting level

### 5. Owner-Controlled Access

Every project mutation checks ownership via `getOwnedProject()`:
```
Client → Server Action → getOwnedProject(id) → verify userId match → proceed or reject
```
Public access is opt-in: projects are only visible via share links when `isPublished = true`.

### 6. Layout-First Content Generation

The AI pipeline selects **layouts before writing content**. This ensures content is structurally aware of its target layout — e.g., a comparison layout produces `comparisonPointsA/B`, a stats layout produces `statValue/statLabel`. This eliminates post-generation reformatting.

---

*Next: [02-technology-stack.md](02-technology-stack.md) — detailed technology decisions and dependency reference.*

# Verto AI — Documentation Suite Implementation Plan

> **Goal**: Build an industry-grade documentation suite that a senior engineer joining the team can read end-to-end and be productive within a day. Modeled after how Stripe, Vercel, Supabase, and top open-source projects document their systems.

---

## Current State Assessment

### What Exists Today

| File | Status | Issue |
|------|--------|-------|
| `README.md` | ❌ Default Next.js boilerplate | Zero project context |
| `SPEC.md` | ⚠️ Single-feature spec (streaming) | Not a project spec |
| `IMPLEMENTATION-PLAN.md` | ⚠️ Single-feature plan (streaming) | Not project-wide |
| `improvement-plan.md` | ✅ Good historical context | Phase 0–8 complete, now stale reference |
| `presentationfeaturebreakdown.md` | ✅ Useful feature map | Needs promotion to official docs |
| `docs/old/presentation-architecture.md` | ✅ Useful but thin | Needs massive expansion |
| `docs/old/lemon-squeezy-*.md` | ⚠️ Payment integration docs | Scattered, needs consolidation |
| `docs/old/pptx-implementation-plan.md` | ⚠️ Single-feature plan | Useful as reference only |

### Key Problems

1. **No single source of truth** — architecture knowledge is scattered across 8+ files
2. **No onboarding path** — a new developer cannot understand the system without reading source code
3. **No architectural decision records** — decisions are buried in improvement plans
4. **No API reference** — server actions, API routes, and webhook contracts are undocumented
5. **No data model documentation** — Prisma schema has no companion docs
6. **README is boilerplate** — first thing anyone sees is the default Next.js readme

---

## Documentation Architecture

```
verto-ai/
├── README.md                          # Project README (root level, replaces current)
├── docs/
│   ├── docs-plan.md                   # THIS FILE — the plan
│   ├── 01-architecture-overview.md    # High-level system architecture
│   ├── 02-technology-stack.md         # Tech stack with versions & rationale
│   ├── 03-agentic-workflow.md         # Deep-dive: AI generation pipeline
│   ├── 04-data-model.md              # Database schema & relationships
│   ├── 05-api-reference.md           # Server actions, API routes, webhooks
│   ├── 06-frontend-architecture.md   # Components, state, routing, rendering
│   ├── 07-development-guide.md       # Setup, scripts, workflows, debugging
│   ├── 08-deployment-guide.md        # Production deployment & infrastructure
│   ├── 09-security.md               # Auth, authorization, data protection
│   ├── 10-testing-strategy.md        # Testing approach & smoke checklist
│   ├── contributing.md               # Contributing guidelines
│   ├── glossary.md                   # Domain terms & definitions
│   ├── adrs/                         # Architecture Decision Records
│   │   ├── 001-v2-agentic-workflow.md
│   │   ├── 002-langgraph-over-custom-orchestration.md
│   │   ├── 003-clerk-authentication.md
│   │   ├── 004-inngest-background-jobs.md
│   │   ├── 005-zustand-state-management.md
│   │   ├── 006-sse-over-websockets.md
│   │   ├── 007-pdf-export-strategy.md
│   │   └── 008-lemon-squeezy-payments.md
│   └── old/                          # Archived docs (existing, no changes)
│       └── ... (current files preserved)
```

---

## Phase 1: Foundation — README & Architecture Overview

> **Priority**: 🔴 Critical — This is what everyone sees first.

### 1.1 — `README.md` (root level)

**File**: `README.md` (root)

**Sections**:

- **What is Verto AI?**
  - One-paragraph elevator pitch
  - Key value proposition
  - Screenshot or demo GIF placeholder

- **Key Features**
  - AI-powered presentation generation (multi-agent LangGraph pipeline)
  - Visual slide editor with drag-and-drop
  - Mobile design generation (Inngest-powered)
  - Real-time generation progress with SSE streaming
  - PDF export
  - Public sharing with owner-controlled publish
  - Subscription management via Lemon Squeezy
  - Dark/light theme support

- **Tech Stack** (summary table)

  | Layer | Technology |
  |-------|-----------|
  | Framework | Next.js 16 (App Router, Turbopack) |
  | Language | TypeScript 5 |
  | AI/LLM | Google Gemini 2.5 Flash via AI SDK + LangChain |
  | Orchestration | LangGraph (multi-agent stateful workflow) |
  | Database | PostgreSQL via Prisma ORM |
  | Auth | Clerk |
  | State | Zustand (persisted) |
  | Background Jobs | Inngest |
  | Payments | Lemon Squeezy |
  | UI | Radix UI + shadcn/ui + Tailwind CSS v4 |
  | Animations | Framer Motion + GSAP |

- **Quick Start**
  - Prerequisites (Node 18+, bun, PostgreSQL)
  - Clone, install, env setup, prisma generate, dev server
  - Running Inngest dev server

- **Project Structure** (tree overview)

- **Documentation** — link to docs/ folder with table of contents

- **License**

**Content expectations**:
- Must feel premium — not a template
- Include a clear "Quick Start" that works on first try
- Link to every doc in the `docs/` folder
- Include architecture diagram inline (Mermaid)

---

### 1.2 — `docs/01-architecture-overview.md`

**File**: `docs/01-architecture-overview.md`

**Sections**:

- **System Context Diagram**
  - Mermaid C4-style: User → Verto AI → External Services
  - External services: Clerk, Google Gemini, Unsplash/Image APIs, Lemon Squeezy, PostgreSQL, Inngest

- **High-Level Architecture**
  - Mermaid diagram showing:
    - Next.js App (frontend + API layer)
    - LangGraph Workflow Engine (agentic-workflow-v2)
    - Inngest Background Workers (mobile design)
    - PostgreSQL (Prisma)
    - External AI/Image/Auth/Payment services

- **Request Flow Diagrams**
  1. Presentation Generation Flow: User → Create Page → Server Action → LangGraph Graph → [8 agents in sequence] → Database Persist → Editor
  2. Slide Editing Flow: Editor → Zustand Store → Server Action → Prisma → PostgreSQL
  3. Mobile Design Flow: User → Create → Inngest Event → Background Function → Gemini → HTML Frames → Database
  4. Share/Present Flow: Owner publish → isPublished flag → Public route reads slides
  5. Payment Flow: User → Lemon Squeezy checkout → Webhook → Subscription model

- **Module Dependency Map**
  - Which modules depend on which
  - Clear boundaries between concerns

- **Key Architectural Principles**
  - Server-first (Server Actions, not REST APIs)
  - Agent-based AI orchestration (not monolithic prompts)
  - Database-persisted progress (not client-simulated)
  - Owner-controlled sharing (not open by default)
  - Recursive component rendering (tree-based slide structure)

**Content expectations**:
- Every diagram must be Mermaid (renderable in GitHub/VS Code)
- At least 3-4 sequence diagrams for major flows
- Clear separation of concerns identified
- New developer should understand the system _shape_ after reading this

---

## Phase 2: Technology & System Design Deep-Dives

> **Priority**: 🟠 High — This is where senior engineers get the "why".

### 2.1 — `docs/02-technology-stack.md`

**Sections**:

- **Core Framework**
  - Next.js 16 — App Router, React Server Components, Turbopack
  - React 19 — React Compiler enabled
  - TypeScript 5 — Strict mode

- **AI & LLM Layer**
  - @ai-sdk/google — Vercel AI SDK provider for Gemini
  - @langchain/google-genai — LangChain Google Gemini integration
  - @langchain/langgraph — Stateful multi-agent orchestration
  - Model: Gemini 2.5 Flash
  - Per-agent temperature/token configs documented

- **Database & ORM**
  - PostgreSQL — Primary datastore
  - Prisma 6.7 — ORM with generated client
  - Generated client output: `src/generated/prisma`

- **Authentication & Authorization**
  - Clerk — Auth provider
  - @clerk/nextjs — Next.js integration
  - Middleware-based route protection
  - Owner-based project authorization

- **State Management**
  - Zustand — Client-side state
  - Persisted to localStorage (`slides-storage`)
  - Undo/redo history stack

- **Background Processing**
  - Inngest — Event-driven background functions
  - @inngest/realtime — Real-time event streaming
  - Used for: mobile design generation, frame regeneration

- **Payments**
  - Lemon Squeezy — Subscription management
  - Webhook-based status sync

- **UI Component Library**
  - Radix UI (full primitive set — 20+ components)
  - shadcn/ui patterns
  - Tailwind CSS v4 (@tailwindcss/postcss)
  - Framer Motion — Page transitions, component animations
  - GSAP — Landing page animations
  - Recharts — Data visualization
  - react-resizable-panels — Editor panel layout
  - react-dnd — Drag and drop
  - react-zoom-pan-pinch — Canvas zoom/pan (mobile design)
  - cmdk — Command palette
  - sonner — Toast notifications
  - embla-carousel-react — Carousels

- **Export & Rendering**
  - html2canvas — Slide-to-image rendering
  - jspdf — PDF generation
  - pptxgenjs — PowerPoint generation (planned)
  - puppeteer-core + @sparticuz/chromium-min — Server-side rendering

- **Validation**
  - Zod — Schema validation throughout
  - @hookform/resolvers — Form validation integration
  - react-hook-form — Form management

- **Dev Tooling**
  - Turbopack — Dev server bundler
  - ESLint — Linting
  - babel-plugin-react-compiler — React Compiler
  - inngest-cli — Local Inngest dev server

- **Dependency Version Matrix**
  - Table of all major deps with pinned versions from package.json

---

### 2.2 — `docs/03-agentic-workflow.md`

> **This is the crown jewel doc — the most complex system in the codebase.**

**Sections**:

- **Overview**
  - What it is: a LangGraph-based multi-agent state machine
  - What it does: takes a topic → produces a complete slide deck
  - Entry point: `generateAdvancedPresentation()`

- **Architecture Diagram**
  - Full Mermaid statechart of the 8-agent pipeline
  - Including the conditional image fetcher loop

- **State Schema**
  - Complete `AdvancedPresentationState` interface documented
  - Every field explained with its purpose and lifecycle

- **Agent Reference** (for each of the 8 agents):

  | Agent | File | LLM Config | Purpose |
  |-------|------|-----------|---------|
  | Project Initializer | `agents/projectInitializer.ts` | N/A | Creates Project record in DB |
  | Outline Generator | `agents/outlineGenerator.ts` | temp 0.8, 2000 tokens | Generates slide outlines |
  | Layout Selector | `agents/layoutSelector.ts` | temp 0.3, 1000 tokens | Selects layout per slide (before content!) |
  | Content Writer | `agents/contentWriter.ts` | temp 0.7, 8000 tokens | Layout-aware structured content |
  | Image Query Generator | `agents/imageQueryGenerator.ts` | temp 0.7, 2000 tokens | Search queries per slide |
  | Image Fetcher | `agents/imageFetcher.ts` | N/A | Provider-backed image search + fallback |
  | JSON Compiler | `agents/jsonCompiler.ts` | temp 0.2, 8000 tokens | Maps to recursive ContentItem tree (54KB!) |
  | Database Persister | `agents/databasePersister.ts` | N/A | Saves slides JSON to Project |

  Each agent section includes: purpose, input state, output state, LLM config, Zod validation schema, error handling, file reference

- **Graph Execution Flow**
  - Step-by-step walkthrough with code references
  - The `wrapNode()` pattern for progress/streaming/error handling
  - Conditional edge: `shouldFetchMoreImages()` loop

- **Progress Tracking**
  - `PresentationGenerationRun` model
  - Server-side step marking
  - Client-side polling via `useAgenticGenerationV2`

- **Streaming Integration**
  - `EventEmitter` system (`src/lib/streaming/EventEmitter.ts`)
  - SSE endpoint: `/api/generation/stream`
  - Event types: `progress`, `token`, `agent_start`, `agent_complete`, `error`, `complete`

- **Error Handling & Retry Logic**
  - `retryWithBackoff` utility
  - `executeAgentSafely` pattern
  - Per-agent error recovery

- **LLM Configuration**
  - Model selection rationale (Gemini 2.5 Flash)
  - Per-agent temperature/token tuning with reasoning
  - `modelConfigs` object reference

- **Layout Template System**
  - All layout types listed with descriptions
  - Content structure types (15 types)
  - How layouts map to final slide components
  - `LAYOUT_TEMPLATES` and `LAYOUT_DESCRIPTIONS` reference

---

## Phase 3: Data Model & API Reference

> **Priority**: 🟠 High — Essential for anyone touching backend.

### 3.1 — `docs/04-data-model.md`

**Sections**:

- **ER Diagram** — Mermaid ER diagram of all models and relationships

- **Models** (for each model: fields table, relations, notes):
  - **User** — Clerk integration, owned projects, subscriptions
  - **Project** — Slide JSON storage, soft delete, publishing flags, marketplace fields
  - **MobileProject + MobileFrame** — HTML content storage, cascade delete
  - **PresentationGenerationRun** — Generation lifecycle, step tracking, progress JSON
  - **Subscription** — Lemon Squeezy integration fields, status lifecycle

- **Enums**
  - `ProjectType`: PRESENTATION, MOBILE_DESIGN
  - `PresentationGenerationStatus`: PENDING → RUNNING → COMPLETED | FAILED
  - `SubscriptionStatus`: ACTIVE, CANCELLED, EXPIRED, PAST_DUE, PAUSED, UNPAID, ON_TRIAL

- **JSON Schemas**
  - **Slide JSON Structure** — The recursive `ContentItem` tree structure with example
  - **ContentType union** — All 24 content types explained
  - **Theme Schema** — Theme interface fields

- **Migration History** — Key migrations with purpose, how to run

---

### 3.2 — `docs/05-api-reference.md`

**Sections**:

- **Server Actions** (`src/actions/`)
  - Project Actions (`projects.ts`) — getProjects, getProjectById, createProject, updateSlides, updateTheme, deleteProject, recoverProject
  - Generation Actions — `generatePresentation.ts`, `presentation-generation.ts`
  - Subscription Actions (`subscription.ts`)
  - Payment Actions (`payment.ts`)
  - User Actions (`user.ts`)
  - Share Actions (`project-share.ts`, `project-access.ts`)
  - Unified Projects (`unified-projects.ts`)
  - Legacy Generation (`genai.ts`, `genai-pre.ts`) — marked as compatibility path
  - Each action with: signature, params, return type, auth requirements, ownership checks

- **API Routes** (`src/app/api/`)
  - `GET /api/generation/stream` — SSE streaming (query param: `runId`, event format)
  - `POST /api/inngest` — Inngest webhook receiver
  - `POST /api/mobile-design/inngest` — Mobile design Inngest receiver
  - `POST /api/webhook/lemon-squeezy` — Payment webhook (event types, signature verification)

- **Inngest Functions**
  - `generateScreens` — Trigger event, input schema, processing steps, output
  - `regenerateFrame` — Trigger event, input schema, processing steps, output

- **Middleware** — Route protection matrix, public routes list, Clerk config

---

## Phase 4: Frontend Architecture & Development Guide

> **Priority**: 🟡 Medium-High — Critical for frontend contributors.

### 4.1 — `docs/06-frontend-architecture.md`

**Sections**:

- **Routing Structure** — Complete route tree with descriptions, route groups, dynamic routes

- **Layout Hierarchy** — RootLayout → ClerkProvider → ThemeProvider → Sidebar

- **State Management**
  - **Zustand Stores**: `useSlideStore` (complete interface, undo/redo, persistence), `useAgenticWorkflowStore`, `useCreativeAiStore`, `usePromptStore`, `useScratchStore`, `useSearchStore`
  - **Custom Hooks**: `useAgenticGenerationV2`, `useStreamingGeneration`, `use-mobile`, `use-toast`

- **Component Architecture**
  - **Slide Editor System**: `MasterRecursiveComponent`, component registry (15 types), ContentItem tree traversal, drag & drop, editor toolbar
  - **Slide Component Types**: Table of all 24 `ContentType` values with descriptions
  - **Layout System**: Layout groups, layout → ContentItem mapping, theme application
  - **Landing Pages**: LandingPageV2 components, GSAP + Framer Motion animation strategy

- **Theming** — Theme interface, built-in themes, dark/light via next-themes, Clerk dark theme

- **Provider Hierarchy** — ClerkProvider → ThemeProvider → Toaster

---

### 4.2 — `docs/07-development-guide.md`

**Sections**:

- **Prerequisites** — Node.js 18+, bun, PostgreSQL, Clerk account, Google AI API key

- **First-Time Setup** — Step-by-step from clone to running dev server

- **Environment Variables Reference** — Complete table of every env var (DATABASE_URL, CLERK keys, GOOGLE_GENERATIVE_AI_API_KEY, image provider keys, LEMON_SQUEEZY_API_KEY, INNGEST keys, etc.)

- **Available Scripts** — Table of all npm scripts with descriptions

- **Common Development Workflows**:
  - Adding a new slide component (5-step process)
  - Adding a new agent to the pipeline (5-step process)
  - Adding a new layout template (4-step process)
  - Working with Prisma (schema changes, migrations, studio)
  - Working with Inngest (local dev, dashboard, creating functions)

- **Debugging Tips** — LangGraph logs, Prisma queries, Clerk auth, Inngest functions

- **Code Conventions** — Path aliases, file naming, component patterns, Server Action patterns

---

## Phase 5: Deployment, Security & Operations

> **Priority**: 🟡 Medium — Important for production readiness.

### 5.1 — `docs/08-deployment-guide.md`

- Infrastructure requirements
- Environment configuration for production
- Database setup (Supabase/Neon/Railway)
- Deployment steps for Vercel
- External service setup (Clerk, Lemon Squeezy, Inngest, image provider)
- Post-deployment verification checklist
- Monitoring & observability recommendations

### 5.2 — `docs/09-security.md`

- Authentication (Clerk, middleware route protection, public vs protected matrix)
- Authorization (project ownership enforcement, owner-only mutations)
- Data protection (API key management, webhook signature verification)
- Input validation (Zod on LLM outputs, server action validation)
- Common security patterns

### 5.3 — `docs/10-testing-strategy.md`

- Current approach (manual smoke testing)
- Expanded smoke test checklist (11 user flows)
- Future testing recommendations (Vitest, Playwright, agent testing, Zod schema testing)

---

## Phase 6: ADRs, Glossary & Contributing

> **Priority**: 🟢 Medium — Important for long-term maintainability.

### 6.1 — `docs/adrs/` — Architecture Decision Records

Each ADR follows standard format:
```
# ADR-NNN: Title
## Status — Accepted | Superseded | Deprecated
## Context — What was the problem or need?
## Decision — What was decided and why?
## Consequences — What are the trade-offs?
## Alternatives Considered — What else was evaluated?
```

**ADRs to create**:

| # | Title | Key Decision |
|---|-------|-------------|
| 001 | V2 Agentic Workflow as Primary Architecture | Chose V2 multi-agent over legacy monolithic generation |
| 002 | LangGraph for Agent Orchestration | Chose LangGraph over custom state machine or CrewAI |
| 003 | Clerk for Authentication | Chose Clerk over NextAuth or custom auth |
| 004 | Inngest for Background Processing | Chose Inngest over BullMQ, Trigger.dev, or custom queues |
| 005 | Zustand for State Management | Chose Zustand over Redux, Jotai, or React Context |
| 006 | SSE over WebSockets for Streaming | Chose Server-Sent Events over WebSocket for progress |
| 007 | PDF-First Export Strategy | Chose PDF via html2canvas+jspdf before PPTX |
| 008 | Lemon Squeezy for Payments | Chose Lemon Squeezy over Stripe for MoR benefits |

### 6.2 — `docs/glossary.md`

Key terms: Agent, ContentItem, ContentType, Generation Run, Layout Template, MasterRecursiveComponent, SlideData, Theme, Slide Store, V2 Workflow, etc.

### 6.3 — `docs/contributing.md`

- Getting started (fork, clone, branch workflow)
- Code style conventions
- PR process (branch naming, commit format, review expectations)
- Documentation update guidelines
- ADR process for architectural changes

---

## Execution Order

| Phase | Documents | Effort | Priority |
|-------|-----------|--------|----------|
| **Phase 1** | `README.md` + `01-architecture-overview.md` | ~2 sessions | 🔴 Critical |
| **Phase 2** | `02-technology-stack.md` + `03-agentic-workflow.md` | ~2 sessions | 🟠 High |
| **Phase 3** | `04-data-model.md` + `05-api-reference.md` | ~2 sessions | 🟠 High |
| **Phase 4** | `06-frontend-architecture.md` + `07-development-guide.md` | ~2 sessions | 🟡 Medium-High |
| **Phase 5** | `08-deployment.md` + `09-security.md` + `10-testing.md` | ~2 sessions | 🟡 Medium |
| **Phase 6** | ADRs (8 files) + `glossary.md` + `contributing.md` | ~2 sessions | 🟢 Medium |

**Total**: ~12 focused sessions → 14 documents + 8 ADRs = 22 files

---

## Quality Standards

Every document must meet these criteria:

1. **Self-contained** — A reader should not need to read source code to understand the doc
2. **Diagrammed** — Every system interaction has a Mermaid diagram
3. **Referenced** — File paths link to actual source files
4. **Versioned** — Key dependency versions are mentioned
5. **Actionable** — Guides produce working results when followed step-by-step
6. **Current** — Reflects the actual shipped codebase, not aspirational plans
7. **Searchable** — Clear headings, consistent formatting, table of contents where needed

---

## Migration Plan for Existing Docs

| Current File | Action |
|-------------|--------|
| `README.md` | **Overwrite** with new content (Phase 1) |
| `SPEC.md` | Move to `docs/old/streaming-spec.md` |
| `IMPLEMENTATION-PLAN.md` | Move to `docs/old/streaming-implementation-plan.md` |
| `improvement-plan.md` | Move to `docs/old/improvement-plan.md` |
| `presentationfeaturebreakdown.md` | Content absorbed into new docs, move to `docs/old/` |
| `upgrade-userflow.md` | Move to `docs/old/` |
| `docs/old/*` | Preserve as-is (historical reference) |

---

> **Next step**: Say "start Phase 1" and I'll begin with the README and Architecture Overview.

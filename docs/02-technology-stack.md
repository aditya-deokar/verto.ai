# Technology Stack Reference

> Complete reference of every technology used in Verto AI, including versions, configuration, and rationale for selection.

---

## Table of Contents

- [Core Framework](#core-framework)
- [AI & LLM Layer](#ai--llm-layer)
- [Database & ORM](#database--orm)
- [Authentication & Authorization](#authentication--authorization)
- [State Management](#state-management)
- [Background Processing](#background-processing)
- [Payments & Billing](#payments--billing)
- [UI Component Library](#ui-component-library)
- [Animation & Motion](#animation--motion)
- [Export & Rendering](#export--rendering)
- [Validation & Forms](#validation--forms)
- [Dev Tooling](#dev-tooling)
- [Dependency Version Matrix](#dependency-version-matrix)

---

## Core Framework

### Next.js 16 — `next@16.0.7`

| Feature | Configuration |
|---------|--------------|
| Router | App Router (file-system based) |
| Bundler | Turbopack (`next dev --turbopack`) |
| React Compiler | Enabled (`reactCompiler: true`) |
| Image Optimization | Configured for Unsplash, placeholder domains |

**Why Next.js 16**: App Router provides React Server Components, Server Actions, streaming, and file-based routing. Turbopack delivers significantly faster dev server starts. React Compiler auto-memoizes for performance.

**Config**: `next.config.ts`
```typescript
const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { hostname: 'images.unsplash.com' },
      { hostname: 'plus.unsplash.com' },
      // ...
    ]
  }
};
```

### React 19 — `react@19.2.1`

React 19 with the React Compiler (`babel-plugin-react-compiler`) enabled. This auto-memoizes components and hooks, reducing the need for manual `useMemo`/`useCallback`.

### TypeScript 5 — `typescript@^5`

**Strict mode enabled.** Key compiler options:
- `target`: ES2017
- `moduleResolution`: bundler
- `jsx`: react-jsx
- Path alias: `@/*` → `./src/*`

---

## AI & LLM Layer

### Google Gemini — `@ai-sdk/google@^3.0.14`

Primary LLM provider using **Gemini 2.5 Flash** for all agent operations.

**Why Gemini 2.5 Flash**: Fast inference, large context window, strong structured output support (JSON mode), and cost-effective for high-throughput generation.

**Configuration** (`src/agentic-workflow-v2/lib/llm.ts`):

| Agent | Temperature | Max Tokens | Rationale |
|-------|------------|-----------|-----------|
| Outline Generator | 0.8 | 2,000 | Needs creativity for diverse outlines |
| Content Writer | 0.7 | 8,000 | Balanced creativity + coherence |
| Layout Selector | 0.3 | 1,000 | Needs consistency and predictability |
| Image Query Generator | 0.7 | 2,000 | Creative search queries |
| JSON Compiler | 0.2 | 8,000 | Precision for structured output |

### LangChain — `@langchain/google-genai@^0.2.16`

LangChain provides the model abstraction layer used by some agents for structured output generation with Zod schemas.

### LangGraph — `@langchain/langgraph@^0.4.8`

**Stateful multi-agent orchestration framework.** Defines the 8-agent presentation generation pipeline as a `StateGraph` with:
- Typed state channels
- Sequential and conditional edges
- Built-in state merging
- Recursion limits for looping agents

**Why LangGraph**: Unlike simple chain-of-calls, LangGraph provides a proper state machine with conditional branching (image fetcher loop), state persistence, and a clean separation between agents.

### Vercel AI SDK — `ai@^6.0.54`

Used alongside LangChain for AI SDK compatibility and streaming primitives.

---

## Database & ORM

### PostgreSQL

Primary relational datastore. Chosen for strong JSON support (slide data stored as `Json` columns), robust indexing, and mature Prisma support.

### Prisma — `@prisma/client@^6.7.0`

| Setting | Value |
|---------|-------|
| Schema file | `prisma/schema.prisma` |
| Client output | `src/generated/prisma` |
| Provider | PostgreSQL |
| Migrations | `prisma/migrations/` |

**Key patterns**:
- Generated client is output to `src/generated/prisma` (non-default location)
- `predev` script auto-generates client before dev server starts
- All queries go through the singleton Prisma instance (`src/lib/prisma.ts`)

**Models**: User, Project, MobileProject, MobileFrame, PresentationGenerationRun, Subscription

→ See [04-data-model.md](04-data-model.md) for complete schema documentation.

---

## Authentication & Authorization

### Clerk — `@clerk/nextjs@^6.19.2`

| Feature | Implementation |
|---------|---------------|
| Route protection | `clerkMiddleware()` in `src/middleware.ts` |
| User identity | `currentUser()` / `auth()` in server actions |
| Theme | Dark base theme (`@clerk/themes`) |
| User sync | Auto-creates DB User on first auth (`onAuthenticateUser`) |

**Public routes** (bypasses auth):
- `/sign-in`, `/sign-up`
- `/api/webhook/*`, `/api/inngest`, `/api/mobile-design/inngest`
- `/` (landing page)

**Authorization model**:
- Centralized ownership check: `getOwnedProject(projectId)` in `project-access.ts`
- Verifies `userId` match in Prisma `where` clause
- Returns 403 for unauthenticated, 404 for not-found/not-owned

---

## State Management

### Zustand — `zustand@^5.0.4`

Client-side state management with **6 stores**:

| Store | File | Purpose | Persisted? |
|-------|------|---------|-----------|
| `useSlideStore` | `store/useSlideStore.tsx` | Active slide deck, undo/redo | ✅ localStorage |
| `useAgenticWorkflowStore` | `store/useAgenticWorkflowStore.tsx` | Generation workflow state | ❌ |
| `useCreativeAiStore` | `store/useCreativeAiStore.tsx` | Creative AI mode state | ❌ |
| `usePromptStore` | `store/usePromptStore.tsx` | Prompt input state | ❌ |
| `useScratchStore` | `store/useScratchStore.tsx` | Scratch mode state | ❌ |
| `useSearchStore` | `store/useSearchStore.ts` | Search state | ❌ |

**Why Zustand**: Minimal boilerplate, built-in persist middleware, good TypeScript support, and simple API compared to Redux. The undo/redo system in `useSlideStore` uses `past[]` and `future[]` stacks.

**Persistence detail**: `useSlideStore` persists to `localStorage` under key `slides-storage`, but excludes `past` and `future` from persistence via `partialize`.

---

## Background Processing

### Inngest — `inngest@^3.49.3`

| Feature | Implementation |
|---------|---------------|
| Client | `src/mobile-design/inngest/client.ts` |
| Functions | `src/mobile-design/inngest/functions/` |
| Dev server | `inngest-cli dev -u http://127.0.0.1:3000/api/mobile-design/inngest` |
| API route | `src/app/api/mobile-design/inngest/route.ts` |

**Functions**:
1. **`generateScreens`** — Generates multiple mobile UI screens for a project
2. **`regenerateFrame`** — Regenerates a single frame within a project

**Why Inngest**: Event-driven architecture perfect for long-running AI generation tasks. Provides automatic retries, step functions, and an excellent local dev dashboard. Separates mobile design generation (which is slow) from the main request cycle.

### @inngest/realtime — `@inngest/realtime@^0.4.5`

Provides real-time event streaming from Inngest functions to the client.

---

## Payments & Billing

### Lemon Squeezy

Merchant-of-Record (MoR) service handling all payment processing, tax collection, and compliance.

| Component | Implementation |
|-----------|---------------|
| API client | `src/lib/axios.ts` — Axios instance for LS API |
| Checkout | `actions/payment.ts` → `buySubscription()` |
| Subscription CRUD | `actions/subscription.ts` |
| Webhook handler | `src/app/api/webhook/lemon-squeezy/` |
| DB model | `Subscription` table |

**Why Lemon Squeezy over Stripe**: Acts as Merchant of Record — handles VAT, sales tax, and compliance globally. Simpler integration for indie/small-team SaaS. No need to manage tax collection infrastructure.

**Environment variables**:
- `LEMON_SQUEEZY_API_KEY`
- `LEMON_SQUEEZY_STORE_ID`
- `LEMON_SQUEEZY_VARIANT_ID`
- `LEMON_SQUEEZY_WEBHOOK_SECRET`

---

## UI Component Library

### Radix UI Primitives

**20+ Radix primitives** used for accessible, unstyled base components:

| Component | Package |
|-----------|---------|
| Accordion | `@radix-ui/react-accordion` |
| Alert Dialog | `@radix-ui/react-alert-dialog` |
| Avatar | `@radix-ui/react-avatar` |
| Checkbox | `@radix-ui/react-checkbox` |
| Context Menu | `@radix-ui/react-context-menu` |
| Dialog | `@radix-ui/react-dialog` |
| Dropdown Menu | `@radix-ui/react-dropdown-menu` |
| Hover Card | `@radix-ui/react-hover-card` |
| Label | `@radix-ui/react-label` |
| Menubar | `@radix-ui/react-menubar` |
| Navigation Menu | `@radix-ui/react-navigation-menu` |
| Popover | `@radix-ui/react-popover` |
| Progress | `@radix-ui/react-progress` |
| Radio Group | `@radix-ui/react-radio-group` |
| Scroll Area | `@radix-ui/react-scroll-area` |
| Select | `@radix-ui/react-select` |
| Separator | `@radix-ui/react-separator` |
| Slider | `@radix-ui/react-slider` |
| Switch | `@radix-ui/react-switch` |
| Tabs | `@radix-ui/react-tabs` |
| Toast | `@radix-ui/react-toast` |
| Toggle | `@radix-ui/react-toggle` |
| Tooltip | `@radix-ui/react-tooltip` |

### shadcn/ui Pattern

Components follow the shadcn/ui pattern — Radix primitives + Tailwind CSS styling. Component config in `components.json`:
- Style: `new-york`
- Tailwind CSS: enabled
- CSS variables: enabled
- Path alias: `@/components`

### Tailwind CSS v4 — `tailwindcss@^4.1.17`

Using PostCSS integration via `@tailwindcss/postcss`. Utility-first CSS framework for all styling.

### Additional UI Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| `lucide-react` | ^0.509.0 | Icon library |
| `sonner` | ^2.0.3 | Toast notifications |
| `cmdk` | ^1.1.1 | Command palette |
| `vaul` | ^1.1.2 | Drawer component |
| `embla-carousel-react` | ^8.6.0 | Carousel |
| `react-resizable-panels` | ^3.0.1 | Editor panel layout |
| `react-dnd` | ^16.0.1 | Drag and drop |
| `react-dnd-html5-backend` | ^16.0.1 | HTML5 drag backend |
| `react-zoom-pan-pinch` | ^3.7.0 | Canvas zoom/pan |
| `react-rnd` | ^10.5.2 | Resizable/draggable elements |
| `react-day-picker` | 8.10.1 | Date picker |
| `input-otp` | ^1.4.2 | OTP input |
| `react-syntax-highlighter` | ^16.1.0 | Code block syntax highlighting |
| `recharts` | ^2.15.3 | Charts & data visualization |

---

## Animation & Motion

### Framer Motion — `framer-motion@^12.11.0`

Used for **page transitions, component animations, and micro-interactions** throughout the application UI.

### GSAP — `gsap@^3.14.2`

Used for **landing page animations** (LandingPageV2). Paired with `@gsap/react@^2.1.2` for React integration.

**Division of responsibility**:
- Framer Motion → Application UI animations
- GSAP → Marketing/landing page animations (more complex timeline-based sequences)

---

## Export & Rendering

| Library | Version | Purpose |
|---------|---------|---------|
| `html2canvas` | ^1.4.1 | Captures slide DOM as canvas/image |
| `jspdf` | ^4.0.0 | Generates PDF from captured images |
| `pptxgenjs` | ^4.0.0 | PowerPoint generation (planned, not yet active) |
| `puppeteer-core` | ^24.35.0 | Server-side headless browser rendering |
| `@sparticuz/chromium-min` | ^143.0.4 | Chromium binary for serverless environments |

**Current export flow**: Slides → html2canvas → jsPDF → downloadable PDF

---

## Validation & Forms

### Zod — `zod@^3.24.4`

Used **extensively throughout the AI pipeline** for validating LLM outputs:
- `outlineSchema` — Validates generated outlines
- `bulkContentSchema` — Validates content writer output
- `layoutSelectionSchema` — Validates layout selections
- `imageQuerySchema` — Validates image search queries

Also used in form validation via `@hookform/resolvers`.

### React Hook Form — `react-hook-form@^7.56.3`

Form management library with Zod resolver integration. Used in create pages and settings forms.

---

## Dev Tooling

| Tool | Purpose |
|------|---------|
| **Turbopack** | Next.js dev server bundler (replaces Webpack) |
| **ESLint** | Code linting (`eslint-config-next`) |
| **React Compiler** | Auto-memoization via `babel-plugin-react-compiler` |
| **Inngest CLI** | Local development server for background functions |
| **Prisma CLI** | Database migrations, client generation, Prisma Studio |

---

## Dependency Version Matrix

### Production Dependencies

| Package | Version |
|---------|---------|
| `next` | 16.0.7 |
| `react` / `react-dom` | 19.2.1 |
| `typescript` | ^5 |
| `@ai-sdk/google` | ^3.0.14 |
| `@langchain/google-genai` | ^0.2.16 |
| `@langchain/langgraph` | ^0.4.8 |
| `@prisma/client` | ^6.7.0 |
| `@clerk/nextjs` | ^6.19.2 |
| `zustand` | ^5.0.4 |
| `inngest` | ^3.49.3 |
| `zod` | ^3.24.4 |
| `framer-motion` | ^12.11.0 |
| `gsap` | ^3.14.2 |
| `tailwind-merge` | ^3.2.0 |
| `axios` | ^1.10.0 |
| `nanoid` | ^5.1.6 |
| `uuid` | ^11.1.0 |
| `date-fns` | ^4.1.0 |

### Dev Dependencies

| Package | Version |
|---------|---------|
| `tailwindcss` | ^4.1.17 |
| `@tailwindcss/postcss` | ^4.1.17 |
| `prisma` | 6.7.0 |
| `eslint` | ^8 |
| `eslint-config-next` | 16.0.7 |
| `inngest-cli` | ^1.16.0 |
| `babel-plugin-react-compiler` | ^1.0.0 |
| `puppeteer` | ^24.35.0 |

---

*Next: [03-agentic-workflow.md](03-agentic-workflow.md) — deep dive into the AI generation pipeline.*

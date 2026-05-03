# 10 — Quick Reference Cheat Sheet

> Print this. Read it 5 minutes before the interview.

---

## One-Liner
**"Verto AI is an AI-powered presentation platform that uses an 8-agent LangGraph pipeline to generate layout-aware, visually polished slide decks in under 60 seconds."**

---

## Key Numbers

| Metric | Value |
|--------|-------|
| AI agents in pipeline | **8** |
| Layout types | **28** (enum) / **16+** unique visual templates |
| Editor component types | **24** |
| Database models | **9** |
| Zustand stores | **7** |
| Server Action files | **16** |
| Zod validation schemas | **5** |
| Generation time | **< 60 seconds** |
| LLM temperature range | **0.2** (precise) → **0.8** (creative) |
| SSE event history | **1,000 events/run** |
| LangGraph recursion limit | **150** |
| Max output tokens | **8,000** (content writer, JSON compiler) |

---

## Tech Stack (Quick Version)

| What | Tech |
|------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 + React Compiler |
| Language | TypeScript 5 (strict) |
| AI Engine | LangGraph + Gemini 2.5 Flash |
| AI SDK | Vercel AI SDK (`generateObject()`) |
| Database | PostgreSQL + Prisma 6.7 |
| State | Zustand 5 (persist + undo/redo) |
| Auth | Clerk 6 |
| Background Jobs | Inngest |
| Payments | Lemon Squeezy |
| Validation | Zod |
| Styling | Tailwind CSS v4 + Radix UI |
| Animations | Framer Motion + GSAP |
| Export | html2canvas + jsPDF |

---

## The 8 Agents (In Order)

1. **Project Initializer** — Creates DB record (no LLM)
2. **Outline Generator** — 5-15 slide topics (temp: 0.8)
3. **Layout Selector** — Picks from 28 layouts per slide (temp: 0.3)
4. **Content Writer** — Layout-aware structured content (temp: 0.7)
5. **Image Query Generator** — Unsplash search queries (temp: 0.7)
6. **Image Fetcher** — Fetches real images + conditional loop (no LLM)
7. **JSON Compiler** — Builds recursive ContentItem tree (temp: 0.2)
8. **Database Persister** — Saves to PostgreSQL (no LLM)

---

## Top 3 Talking Points

### 1. Multi-Agent Pipeline
*"8 specialized agents with LangGraph, not one monolithic prompt. Each agent has its own temperature, validation, and error handling."*

### 2. Layout-Before-Content
*"Layouts are selected BEFORE content is written, so content is structurally shaped for its target layout — comparison slides get A/B points, stat slides get big numbers."*

### 3. Production-Grade Error Handling
*"Three layers: Zod validation at agent boundaries, retry with exponential backoff for transient errors, and DB-persisted progress that records the exact failing step."*

---

## Top 3 Trade-offs

### 1. LangGraph vs. Simple Chain
*"Chose LangGraph for shared state channels, conditional edges (image fetcher loop), and the wrapNode pattern. Trade-off: added dependency and learning curve."*

### 2. Layout → Content Ordering
*"Counterintuitive but dramatically better output. Trade-off: Content Writer must handle 14+ optional structured fields."*

### 3. Recursive ContentItem vs. Flat Structure
*"Supports nested layouts and drag-and-drop at any depth. Trade-off: recursive state updates are more complex."*

---

## Top 3 "What I'd Improve"

1. **Quick win**: Parallel image fetching (`Promise.allSettled()`)
2. **Architecture**: Redis-backed SSE for horizontal scaling
3. **Product**: Collaborative editing with CRDTs (Yjs)

---

## Design Patterns to Name-Drop

| Pattern | Where |
|---------|-------|
| State Machine | LangGraph pipeline |
| Strategy | Image providers (Unsplash/Fallback) |
| Observer | StreamingEventEmitter (SSE) |
| Decorator | wrapNode() for cross-cutting concerns |
| Composite | Recursive ContentItem tree |
| Command | Undo/redo in Zustand |
| Singleton | Global event emitter (survives HMR) |

---

## Danger Questions — Quick Answers

**"Why not GPT-4?"** → Gemini is faster and cheaper for 5 calls/generation. Structured output via `generateObject()` is excellent. Can swap per-agent with multi-agent architecture.

**"Why not MongoDB?"** → Data is relational (users→projects→subscriptions). PostgreSQL handles JSON columns for flexible slide data.

**"Why not Redux?"** → Zustand: less boilerplate, built-in `persist`, simpler undo/redo. Subscription model prevents unnecessary re-renders.

**"Why not WebSockets?"** → SSE is simpler for unidirectional server→client updates. Auto-reconnect built into EventSource API.

**"What's the hardest part?"** → The JSON Compiler (54KB) — it's essentially a compiler that maps structured content + layout types → recursive component trees.

---

## The Golden Rule

> **Lead with the problem. Explain why before how. Acknowledge trade-offs. Show iteration.**

---

*You built something genuinely impressive. Go show them.* 🚀

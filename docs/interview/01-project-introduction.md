# 01 — Project Introduction & Elevator Pitch

> How to introduce Verto AI at different depths — from a casual 30-second conversation to a full 5-minute technical walkthrough.

---

## Table of Contents

- [The Story — Why I Built This](#the-story--why-i-built-this)
- [30-Second Pitch](#30-second-pitch)
- [2-Minute Pitch](#2-minute-pitch)
- [5-Minute Technical Pitch](#5-minute-technical-pitch)
- [Competitive Positioning](#competitive-positioning)
- [Key Numbers to Memorize](#key-numbers-to-memorize)
- [Tech Stack Quick Reference](#tech-stack-quick-reference)
- [Common Opening Questions & Answers](#common-opening-questions--answers)

---

## The Story — Why I Built This

> ⚠️ **Always start with a story, not a tech stack.** Interviewers remember narratives, not bullet points.

### The Problem I Saw

*"Every AI presentation tool I tried — Gamma, Beautiful.ai, Tome — had the same fundamental problem: they treated presentation generation as a single monolithic prompt. You'd get a text dump shoved into generic slide templates. No visual awareness, no layout intelligence, no structural variety. The AI didn't understand that a comparison needs two columns, or that a statistics slide should highlight big numbers."*

### My Insight

*"I realized that generating a good presentation isn't one task — it's actually 8 different specialized tasks that need to be orchestrated. You need an agent that understands outlines, a separate one that selects visual layouts, another that writes content shaped for those specific layouts, and so on. This is fundamentally a multi-agent orchestration problem."*

### What I Built

*"So I built Verto AI — a full-stack SaaS platform that uses an 8-agent LangGraph pipeline to generate complete, visually polished presentations from a single topic prompt. The key innovation is that layout selection happens before content writing, so every piece of content is structurally aware of its target visual format."*

### The Impact

*"The system generates a complete presentation with 8-15 slides in under 60 seconds, with 16+ different layout types, real images from Unsplash, and a visual quality that actually looks like a professional designer made it."*

---

## 30-Second Pitch

> Use this when someone says "So what are you working on?" in a casual setting.

---

**"I built Verto AI, an AI-powered presentation platform. Instead of using a single AI prompt like most tools, it uses 8 specialized AI agents orchestrated by LangGraph that each handle a different part of the creation process — outlining, layout design, content writing, image selection. The key innovation is that it selects visual layouts before writing content, so the AI produces structurally-aware, presentation-ready output. It generates a full slide deck in under 60 seconds."**

---

## 2-Minute Pitch

> Use this for the "tell me about your project" interview question.

---

**Opening — The Problem (20s)**

*"Creating presentations is one of those tasks that's surprisingly hard to automate well. Most AI tools just generate text and dump it into generic templates. You end up with 15 slides that all look the same — a title and bullet points. There's no visual variety, no layout intelligence."*

**The Solution (30s)**

*"Verto AI solves this by decomposing presentation generation into 8 specialized AI agents, orchestrated as a LangGraph state machine. Each agent has a single responsibility — one generates outlines, another selects from 28 different layout types based on content analysis, a third writes content that's specifically shaped for those layouts, and so on."*

**The Key Innovation (20s)**

*"The architectural insight is that layout selection happens before content writing. This is counterintuitive — most systems write content first, then try to fit it into templates. By selecting layouts first, the content writer knows that a comparison slide needs `comparisonPointsA` and `comparisonPointsB`, a statistics slide needs `statValue` and `statLabel`. This eliminates post-generation reformatting and produces genuinely premium visual output."*

**Technical Depth (30s)**

*"The full stack is Next.js 16 with React 19, Prisma and PostgreSQL for persistence, Zustand for client state with undo/redo, and real-time SSE streaming so users see live progress as each agent completes. The editor supports 24 component types with drag-and-drop, rendered via a recursive component tree. It also includes Clerk authentication, Lemon Squeezy payments, and a separate Inngest-powered mobile design generation system."*

**Close (20s)**

*"The project taught me a lot about multi-agent AI orchestration, prompt engineering for structured output, and building production-grade AI features with proper error handling, retry logic, and real-time feedback."*

---

## 5-Minute Technical Pitch

> Use this when given extended time to present your project, e.g., during a presentation round.

### Minute 1 — Context & Problem

- The presentation creation problem
- Why existing AI tools fail (monolithic prompts, generic layouts)
- The insight: this is a multi-agent orchestration problem, not a single-prompt problem

### Minute 2 — Architecture Overview

- Draw the 5-box diagram (see [02-architecture-deep-dive.md](02-architecture-deep-dive.md))
- Highlight: Next.js 16, LangGraph pipeline, PostgreSQL, SSE streaming
- Mention the separation between AI generation engine and the visual editor

### Minute 3 — The Agentic Pipeline (Star Feature)

Walk through the 8 agents briefly:
1. **Project Initializer** — Creates the DB record
2. **Outline Generator** — AI-generated structured outline (temp: 0.8, creative)
3. **Layout Selector** — AI picks from 28 layouts per slide (temp: 0.3, consistent)
4. **Content Writer** — Layout-aware content with structured fields (temp: 0.7)
5. **Image Query Generator** — Smart search queries per slide
6. **Image Fetcher** — Unsplash API with fallback provider pattern + conditional loop
7. **JSON Compiler** — Maps content + layout → recursive ContentItem tree (temp: 0.2, precise)
8. **Database Persister** — Saves final slides to PostgreSQL

**Key talking point**: *"Each agent has its own temperature configuration — creative tasks use 0.7-0.8 for variety, structural tasks use 0.2-0.3 for precision. This kind of per-agent tuning is something you can only do with a multi-agent architecture."*

### Minute 4 — Editor & Frontend Architecture

- Recursive `ContentItem` tree rendered by `MasterRecursiveComponent`
- Zustand store with undo/redo (command pattern)
- 24 component types, drag-and-drop editing
- Theme system, PDF export
- SSE streaming for real-time generation progress

### Minute 5 — Trade-offs & What I'd Improve

- **Trade-off**: LangGraph adds complexity but enables conditional edges, shared state, agent independence
- **Trade-off**: Layout-before-content breaks intuition but dramatically improves output quality
- **What I'd improve**: Parallel agent execution where dependencies allow, Redis-backed SSE for horizontal scaling, fine-tuned models per agent for cost/quality optimization

---

## Competitive Positioning

> When asked: "How is this different from Canva / Beautiful.ai / Gamma / Tome?"

| Feature | Most AI Tools | Verto AI |
|---------|--------------|----------|
| **Generation approach** | Single monolithic prompt | 8 specialized agents with LangGraph |
| **Layout intelligence** | Generic templates applied post-generation | AI selects from 28 layouts before content is written |
| **Content-layout awareness** | Content written blindly, forced into templates | Content is structurally shaped for its specific layout |
| **Visual variety** | 2-3 repetitive layouts per deck | 16+ unique layout types with enforced variety rules |
| **Structured data** | Plain text only | Rich structured fields (stats, comparisons, timelines, grids) |
| **Generation feedback** | Spinner → done | Real-time SSE streaming with per-agent progress |
| **Editor** | Basic text editing | Full recursive component editor with drag-and-drop, 24 component types |

**The one-liner**: *"Most AI presentation tools are just a chat prompt stapled to a template picker. Verto AI is an 8-agent pipeline where each agent is specialized, layout-aware, and produces structurally rich output that actually looks designed."*

---

## Key Numbers to Memorize

| Metric | Value |
|--------|-------|
| AI agents in pipeline | **8** |
| Slide layout types | **28** (in the enum) / **16+** unique visual templates |
| Component types in editor | **24** |
| Database models | **9** (User, Project, Subscription, MobileProject, MobileFrame, PresentationGenerationRun, PresentationTemplate, TemplateFavorite, UserAiKey) |
| Zustand stores | **7** |
| Server Action files | **16** |
| Average generation time | **< 60 seconds** |
| Recursion limit (LangGraph) | **150** |
| SSE event history size | **1,000 events per run** |
| Zod validation schemas | **5** (outline, bulkContent, layoutAwareContent, layoutSelection, imageQuery) |
| LLM temperature range | **0.2** (precise) to **0.8** (creative) |
| Max output tokens | **8,000** (content writer, JSON compiler) |

---

## Tech Stack Quick Reference

> For each technology, know **what it does** and **why you chose it**.

| Technology | Version | What It Does | Why This One |
|-----------|---------|-------------|-------------|
| **Next.js** | 16.0.7 | Full-stack React framework | App Router, Server Actions, Turbopack, React Compiler support |
| **React** | 19.2.1 | UI runtime | Latest with React Compiler for automatic memoization |
| **TypeScript** | 5.x | Type safety | Strict mode catches errors at compile time |
| **LangGraph** | 0.4.8 | Multi-agent orchestration | State machine with shared state, conditional edges, built-in retry support |
| **Google Gemini 2.5 Flash** | — | LLM for content generation | Fast, cost-effective, excellent structured output via `generateObject()` |
| **Prisma** | 6.7 | ORM + database toolkit | Type-safe queries, migrations, schema-driven development |
| **PostgreSQL** | — | Primary database | Relational model fits users→projects→subscriptions naturally |
| **Zustand** | 5.0.4 | Client state management | Lightweight, middleware support (persist, undo/redo), no boilerplate |
| **Clerk** | 6.19.2 | Authentication | Drop-in auth with middleware integration, < 1 hour setup |
| **Inngest** | 3.49.3 | Background job processing | Serverless-friendly, event-driven, built-in retry + rate limiting |
| **Lemon Squeezy** | — | Subscription billing | Merchant of record, handles tax/compliance globally |
| **Tailwind CSS** | v4 | Styling | Utility-first, rapid iteration, design system consistency |
| **Radix UI** | — | Accessible UI primitives | Unstyled, composable, WAI-ARIA compliant |
| **Zod** | 3.24.4 | Runtime validation | Validates LLM output at agent boundaries, TypeScript inference |
| **Framer Motion + GSAP** | — | Animations | Framer for React-aware animations, GSAP for scroll-driven effects |
| **Unsplash API** | — | Stock images | High-quality, free tier, attribution-friendly |

---

## Common Opening Questions & Answers

### "Can you tell me about a project you've worked on?"

→ Use the **2-minute pitch** above.

### "What's the most technically challenging thing you've built?"

*"The multi-agent AI pipeline in Verto AI. The challenge wasn't just getting AI to generate content — it was designing an 8-agent orchestration system where each agent operates on shared state, produces structured output validated by Zod schemas, handles errors with retry logic, and streams real-time progress to the client via SSE. The key insight was ordering agents so layout selection happens before content writing — this broke the intuitive 'write content, then pick a layout' flow, but it produced dramatically better visual output because content is structurally shaped for its target layout."*

### "What are you most proud of in this project?"

*"Two things. First, the layout-before-content architectural decision. It was counterintuitive, and it required rethinking the entire pipeline order, but it's the single decision that makes the output look professional instead of generic. Second, the error handling architecture — each agent has Zod validation on outputs, retry with exponential backoff, error classification (recoverable vs. non-recoverable), and the whole pipeline gracefully degrades rather than failing catastrophically."*

### "How long did it take you to build?"

*"The core platform took [X weeks/months]. But the agentic pipeline went through two major iterations — V1 was a simpler sequential chain, and V2 was a complete rebuild using LangGraph with the layout-first architecture, SSE streaming, and structured output schemas. The V2 rewrite was driven by the realization that the monolithic approach couldn't produce the visual variety and quality I wanted."*

### "Did you build this alone or in a team?"

*"I built it as a solo project, which means I made every architectural decision — from database schema design to AI prompt engineering to frontend state management. That's actually one of the most valuable parts of this experience: I had to think about the full stack and make trade-offs across every layer."*

---

*Next: [02-architecture-deep-dive.md](02-architecture-deep-dive.md) — system diagrams, request flows, and how to whiteboard the architecture in 60 seconds.*

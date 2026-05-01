# 07 — Behavioral Questions (STAR Format)

> Map real Verto AI stories to common behavioral questions. Each answer uses the **STAR** framework: **S**ituation, **T**ask, **A**ction, **R**esult.

---

## 1. "Tell me about a complex technical challenge you solved"

**S**: Building the AI pipeline for Verto AI. Existing AI tools generate presentations with monolithic prompts — the output is always generic "title + bullets" slides with no visual variety.

**T**: Design a system that generates structurally diverse, visually polished presentations with 16+ layout types, structured data (stats, comparisons, timelines), and real images.

**A**: Decomposed the problem into 8 specialized agents orchestrated by LangGraph. Made the counterintuitive decision to select layouts BEFORE writing content, so the Content Writer produces structured fields shaped for each specific layout type (e.g., `comparisonPointsA/B` for comparison slides). Added Zod validation at every agent boundary and retry logic with exponential backoff.

**R**: Presentations now generate in under 60 seconds with genuine visual variety — each deck includes comparison slides, stat showcases, timelines, and image layouts instead of 15 identical "title + bullets" slides. The layout-before-content ordering was the single most impactful architectural decision.

---

## 2. "Describe a time you had to make a difficult trade-off"

**S**: When designing the agent ordering, the intuitive flow was: write content first → pick layouts → format content for layouts.

**T**: Decide whether to go with the intuitive ordering or rethink the pipeline entirely.

**A**: After prototyping both approaches, I realized content-first produced generic paragraphs that required heavy reformatting. I chose the counterintuitive path: layout selection before content writing. This required the Content Writer to handle 14+ optional structured fields and the Layout Selector to make accurate decisions from outlines alone.

**R**: The output quality improved dramatically. Comparison slides now get proper A/B point arrays, statistics slides get formatted big numbers, and timeline slides get structured step objects — all without post-generation reformatting. This proved the principle that sometimes the right architecture feels wrong initially.

---

## 3. "How do you handle technical debt?"

**S**: Verto AI originally had 3 separate generation architectures: a legacy monolithic prompt, an experimental V1 agentic workflow, and the V2 LangGraph pipeline.

**T**: Consolidate into one maintainable system without breaking existing functionality.

**A**: Created an 8-phase improvement plan starting with the highest-risk items (security hardening) and ending with dead code removal. Each phase had explicit scope, acceptance criteria, and rollback plans. I treated V2 as the "winner" early but kept V1 functional during migration. Deprecated old hooks and components incrementally.

**R**: Shipped all 8 phases. Reduced the generation codepath from 3 competing systems to 1 maintained pipeline. New features only need to be built once. The improvement plan document itself became a reference for future refactoring decisions.

---

## 4. "Tell me about a time you improved system reliability"

**S**: Early versions of the pipeline would silently fail when the LLM returned malformed data — a bad outline would cascade through all downstream agents.

**T**: Make the pipeline resilient to LLM output quality issues without adding excessive complexity.

**A**: Implemented a three-layer error strategy: (1) Zod schemas validate LLM output at every agent boundary, (2) `retryWithBackoff()` retries transient errors with exponential backoff (1s→2s→4s), (3) `isRecoverableError()` classifies errors so validation failures fail fast while network errors retry. Added `wrapNode()` to record the exact failing step to the database.

**R**: Generation failures now show the user exactly which step failed ("Image Integration failed") instead of a generic error. Transient LLM API issues are handled automatically. The Zod validation has caught dozens of malformed responses that would have previously caused blank slides.

---

## 5. "How do you approach a greenfield project?"

**S**: Starting Verto AI from scratch — no existing codebase, no team, just the idea of "AI-powered presentations."

**T**: Build a production-grade SaaS from concept to working product.

**A**: Started with the data model (what are the core entities?), then the critical path (can I generate one slide from a prompt?), then expanded outward. Chose technologies that optimize for iteration speed: Next.js for full-stack, Clerk for auth (< 1 hour setup), Prisma for type-safe DB access. Built the AI pipeline iteratively — V1 was a single prompt, V2 was the full multi-agent system. Added features based on what blocked the next user experience improvement.

**R**: Working product with 8-agent AI generation, visual editor with 24 component types, real-time streaming, auth, payments, sharing, and export. The iterative approach meant every intermediate version was usable — I never had a "big bang" integration moment.

---

## 6. "Describe a time you had to learn something new quickly"

**S**: Decided to use LangGraph for multi-agent orchestration. Had never used it before — it was a relatively new framework with limited examples.

**T**: Learn LangGraph well enough to build a production 8-agent pipeline with shared state, conditional edges, and streaming.

**A**: Read the LangGraph docs, studied the source code for state channel merging, built a minimal prototype with 2 agents first, then incrementally added agents and features. The key insight was understanding the channel system (`value: (_x, y) => y` for "last write wins") and how conditional edges work.

**R**: Built a production pipeline in about a week. The LangGraph abstraction turned out to be the right choice — the conditional edge for the image fetcher loop and the shared state channels saved significant custom code. Now comfortable explaining multi-agent orchestration patterns.

---

## 7. "How do you make decisions when requirements are ambiguous?"

**S**: Phase 0 of the improvement plan — needed to decide on the sharing model (public link? tokenized? auth-required?), export format (PDF? PPTX? both?), and image provider strategy.

**T**: Make binding decisions that the entire rest of the roadmap would depend on.

**A**: Created a decision framework: for each choice, I documented the options, trade-offs, and reversibility. Chose the most reversible option when unsure (e.g., start with public links — easy to add token-based later). For irreversible decisions (like the generation architecture), invested more analysis time. Documented all decisions as Architecture Decision Records.

**R**: The decisions stuck — none had to be reversed. The key lesson: spend decision-making time proportional to the reversibility of the decision. Easily reversible → decide fast. Hard to reverse → analyze deeply.

---

## 8. "Tell me about a time you refactored legacy code"

**S**: Had 3 generation architectures: `genai.ts` (legacy monolithic), `agentic-workflow/` (V1 experimental), and `agentic-workflow-v2/` (current LangGraph system).

**T**: Consolidate without breaking any user-facing functionality.

**A**: First, mapped all code paths to understand which UI flows used which backend. Then updated all create modes to route through V2. Deprecated V1 hooks and components with `// @deprecated` comments. Removed dead code in a separate cleanup phase (Phase 8) after confirming all flows worked on V2.

**R**: Eliminated ~40% of generation-related code. New features only need one implementation. The codebase went from "which generator does this use?" confusion to a single, clear pipeline.

---

## 9. "How do you ensure code quality?"

**S**: Building a complex system solo — no code review from teammates.

**T**: Maintain code quality without traditional peer review.

**A**: Multiple quality layers: (1) TypeScript strict mode catches type errors at compile time, (2) Zod schemas validate LLM outputs at runtime — every agent boundary is a validation checkpoint, (3) Provider abstraction patterns ensure components are swappable and testable, (4) Structured logging with agent name, run ID, and duration for debugging, (5) Architecture Decision Records (ADRs) document the "why" behind decisions.

**R**: The codebase is maintainable by a single developer with confidence. Zod validation alone has prevented dozens of production-breaking LLM output issues. The ADRs serve as documentation for my own future self.

---

## 10. "Describe your approach to debugging a production issue"

**S**: SSE streaming was dropping events — clients would miss agent completion events and show stale progress.

**T**: Debug the event loss without being able to reproduce it consistently.

**A**: Added structured logging to the EventEmitter (log listener count per emission). Discovered the issue: during HMR (Hot Module Replacement) in development, the emitter was being recreated, losing all subscribers. Fixed by attaching the singleton to `global` instead of module scope. For production reconnection issues, implemented event history replay — new subscribers receive all past events on connect.

**R**: Zero event loss since the fix. The event replay mechanism also solved the page-refresh UX issue — users who refresh during generation catch up instantly. The `global` singleton pattern is now documented as a best practice for long-lived server-side objects in Next.js.

---

## Quick Reference — Question → Story Mapping

| Question Theme | Use This Story |
|----------------|---------------|
| Complex challenge | Layout-before-content pipeline innovation |
| Trade-off | Counterintuitive agent ordering |
| Technical debt | V1→V2 migration, 8-phase improvement plan |
| Reliability | Three-layer error handling (Zod + retry + wrapNode) |
| Greenfield | Building Verto AI from concept to product |
| Learning fast | LangGraph adoption |
| Ambiguity | Phase 0 decision framework |
| Refactoring | 3-architecture consolidation |
| Code quality | TypeScript strict + Zod + ADRs |
| Debugging | SSE event loss → global singleton fix |

---

*Next: [08-demo-and-presentation.md](08-demo-and-presentation.md)*

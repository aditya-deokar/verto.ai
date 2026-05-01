# 08 — Demo & Presentation Strategy

> How to show Verto AI during an interview — whether live or via screenshots.

---

## Pre-Demo Checklist

- [ ] `bun run dev` starts without errors
- [ ] Database has 2-3 pre-generated presentations (diverse topics)
- [ ] One high-quality presentation ready as backup (don't rely on live generation)
- [ ] Browser tabs pre-opened: dashboard, create page, a finished presentation in editor
- [ ] VS Code open with `agentic-workflow-v2/` folder expanded
- [ ] Terminal visible (but not distracting)
- [ ] Screen resolution set to 1920×1080, browser at 90% zoom
- [ ] Dark mode enabled (looks more professional on screen share)
- [ ] Close all notifications, Slack, email

---

## 5-Minute Demo Script

### 0:00–0:30 — Opening (Dashboard)
**Show**: The dashboard with existing presentations  
**Say**: *"This is Verto AI — an AI-powered presentation platform. You can see existing presentations here. Let me create a new one."*

### 0:30–1:00 — Create Flow
**Show**: Click "Create", enter a topic (e.g., "The Future of AI in Healthcare"), select a theme  
**Say**: *"I enter a topic and the system kicks off an 8-agent AI pipeline..."*

### 1:00–2:00 — Generation Progress (⭐ Key Moment)
**Show**: The real-time progress dialog with agent steps completing  
**Say**: *"Watch the progress — each step is a specialized AI agent. Project Setup creates the DB record. Structure generates the outline. Design Layout selects from 28 layout types BEFORE content is written — this is the key architectural insight. Content Writing generates layout-aware structured content. Then images, compilation, and save."*

**Tip**: This is your strongest visual. Let it run and narrate each step.

### 2:00–3:00 — Editor Walkthrough
**Show**: Open the generated presentation in the editor. Scroll through slides.  
**Say**: *"Notice the layout variety — comparison slides, big number stats, timelines, image layouts. Each layout type gets content specifically structured for it. This is what layout-before-content enables."*

### 3:00–4:00 — Edit & Interact
**Show**: Click a slide, edit text, switch theme, drag-and-drop a component  
**Say**: *"Full visual editor with 24 component types, undo/redo, theme switching. The slides are stored as a recursive ContentItem tree rendered by a single recursive component."*

### 4:00–4:30 — Code Glimpse
**Show**: Open `advanced-genai-graph.ts` — show the graph edge definitions  
**Say**: *"Here's the graph definition — 8 agents, sequential edges, and this conditional edge for the image fetcher loop. Each agent is wrapped by wrapNode() for progress tracking and error handling."*

### 4:30–5:00 — Close
**Say**: *"The full stack is Next.js 16, React 19, LangGraph, Gemini 2.5 Flash, PostgreSQL, and Zustand. Happy to deep-dive into any part."*

---

## Backup Plan

If the demo breaks (generation fails, server crashes, etc.):

1. **Don't panic** — say *"Let me show you a pre-generated example instead"*
2. Open the pre-generated presentation in the editor
3. Switch to code walkthrough — open the agent files
4. Frame it positively: *"This actually lets me show you the error handling — the system recorded exactly which step failed"*

---

## What NOT to Do

- ❌ Don't spend more than 30 seconds on the landing page
- ❌ Don't try to explain every feature — focus on the pipeline
- ❌ Don't apologize for things that aren't built yet — say "next iteration"
- ❌ Don't read code line-by-line — show the structure, explain the patterns
- ❌ Don't let generation run in silence — narrate what each step is doing

---

## Screen Share Tips

- **Font size**: Increase VS Code and browser font to 16px+
- **Tab arrangement**: Dashboard | Create | Editor | VS Code (in that order)
- **Terminal**: Have it visible but small — shows you're running a real dev server
- **Bookmarks**: Pre-bookmark the key code files
- **Zoom**: Browser at 90%, VS Code at 100%

---

*Next: [09-senior-engineer-mindset.md](09-senior-engineer-mindset.md)*

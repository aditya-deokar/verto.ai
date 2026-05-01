# 06 — Code Quality & Design Patterns

> Point to specific code that demonstrates senior-level thinking. Interviewers are impressed when you can name patterns and show where they're applied.

---

## Design Patterns Used

### 1. State Machine Pattern — LangGraph Pipeline
**Where**: `src/agentic-workflow-v2/actions/advanced-genai-graph.ts`  
**What**: 8 agents connected as a `StateGraph` with defined edges and a conditional loop.  
**Why it's senior**: Formal state machine instead of ad-hoc conditionals. Makes the flow explicit, testable, and visualizable.

### 2. Strategy Pattern — Image Providers
**Where**: `src/agentic-workflow-v2/utils/imageProviders.ts`  
**What**: `ImageProvider` interface with `UnsplashImageProvider` and `FallbackImageProvider` implementations.  
**Why it's senior**: Swapping image sources requires zero changes to the pipeline. Just implement the interface.
```typescript
interface ImageProvider {
  readonly id: string;
  searchImages(query: string, options?: ImageSearchOptions): Promise<ImageSearchResult[]>;
}
```

### 3. Observer Pattern — StreamingEventEmitter
**Where**: `src/lib/streaming/EventEmitter.ts`  
**What**: Singleton emitter with subscribe/emit/event history for SSE streaming.  
**Why it's senior**: Decouples event producers (agents) from consumers (SSE endpoint). Supports event replay on reconnect.

### 4. Decorator Pattern — wrapNode()
**Where**: `advanced-genai-graph.ts` (lines 64-116)  
**What**: Wraps every agent with progress tracking, SSE emission, and error recording.  
**Why it's senior**: Cross-cutting concerns applied uniformly without modifying agent code. Agents stay focused on their core logic.

### 5. Composite Pattern — Recursive ContentItem Tree
**Where**: `src/store/useSlideStore.tsx`, `MasterRecursiveComponent.tsx`  
**What**: Slides stored as recursive `ContentItem` trees rendered by a single recursive component.  
**Why it's senior**: Enables arbitrarily nested layouts, consistent rendering across editor/present/export, drag-and-drop at any depth.

### 6. Command Pattern — Undo/Redo
**Where**: `src/store/useSlideStore.tsx` (lines 80-98)  
**What**: Every mutation pushes current state to `past[]` stack. Undo pops from `past`, pushes to `future`.
```typescript
undo: () => set((state) => {
  if (state.past.length === 0) return state;
  const previous = state.past[state.past.length - 1];
  return { slides: previous, past: state.past.slice(0, -1), future: [state.slides, ...state.future] };
}),
```
**Why it's senior**: Full undo/redo with `partialize` to exclude history from localStorage persistence.

### 7. Singleton Pattern — Global Event Emitter
**Where**: `src/lib/streaming/EventEmitter.ts` (lines 134-138)  
**What**: Attached to `global` to survive Hot Module Replacement in development.
```typescript
const g = global as any;
if (!g._streamingEmitter) { g._streamingEmitter = new StreamingEventEmitter(); }
export const streamingEmitter = g._streamingEmitter;
```

---

## TypeScript Highlights

### Discriminated Unions for Stream Events
```typescript
interface StreamEvent {
  type: 'progress' | 'token' | 'agent_start' | 'agent_complete' | 'error' | 'complete';
  agentId?: string;
  content?: string;
  timestamp: number;
}
```

### Zod Schemas as Runtime + Compile-Time Validation
```typescript
// Single schema serves as: runtime validator + TypeScript type inference + LLM output constraint
export const outlineSchema = z.object({
  outlines: z.array(z.string()).min(5).max(15)
});
// Used: const { object } = await generateObject({ schema: outlineSchema, ... })
```

### Recursive Type-Safe State Updates
`updateContentRecursively()` in `useSlideStore` traverses the ContentItem tree while maintaining full type safety — no `any` casts in the traversal logic.

---

## Error Handling Philosophy

### Three-Layer Strategy
```
Layer 1: Zod validation → structural errors caught at agent boundary
Layer 2: retryWithBackoff() → transient errors retried (1s → 2s → 4s)
Layer 3: wrapNode() → permanent failures recorded to DB + emitted via SSE
```

### Error Classification
```typescript
function isRecoverableError(error): boolean {
  const recoverablePatterns = ["network", "timeout", "rate limit", "503", "502", "429"];
  return recoverablePatterns.some(p => message.includes(p));
}
```
- **Recoverable** (retry): rate limits, timeouts, network errors
- **Non-recoverable** (fail fast): validation errors, auth failures

---

## State Management Architecture

**7 Zustand stores**, each with single responsibility:

| Store | Responsibility | Special Feature |
|-------|---------------|-----------------|
| `useSlideStore` | Slide data, undo/redo, selected component | `persist` middleware + `partialize` |
| `useAgenticWorkflowStore` | Generation progress tracking | Workflow dialog state |
| `useCreativeAiStore` | Creative AI mode state | Modal/outline editing |
| `usePromptStore` | User prompt history | Prompt suggestions |
| `useScratchStore` | Scratch/blank mode state | — |
| `useSearchStore` | Search/filter state | Dashboard filtering |
| `useLayoutStore` | Editor layout preferences | Panel sizes |

---

## Files to Open During Interview

If asked to show code, open these files in order:

1. **`agentic-workflow-v2/index.ts`** — Clean module API surface (exports all agents, types, validators)
2. **`actions/advanced-genai-graph.ts`** — Graph builder, `wrapNode()`, edge definitions
3. **`agents/contentWriter.ts`** — Layout-aware content generation with structured fields
4. **`lib/validators.ts`** — Zod schemas (show `layoutAwareContentSchema` with 14 optional fields)
5. **`store/useSlideStore.tsx`** — Undo/redo + recursive state updates
6. **`lib/streaming/EventEmitter.ts`** — Singleton event system with replay

---

*Next: [07-behavioral-questions.md](07-behavioral-questions.md)*

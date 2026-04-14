# ADR-003: Zustand for State Management

**Status**: Accepted  
**Date**: 2024  
**Decision Makers**: Core team

---

## Context

The slide editor requires complex client-side state: the current slide deck (a recursive tree), undo/redo history, theme state, selected component tracking, and drag-and-drop state. We also need to persist slide state across page navigations and browser refreshes.

### Options Considered

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **Zustand** | Minimal state library | Tiny API, built-in persist, good TypeScript, no boilerplate | Less structured than Redux for large apps |
| **Redux Toolkit** | Standard React state management | Mature ecosystem, DevTools, middleware | Boilerplate heavy, complex setup for simple state |
| **Jotai** | Atomic state management | Fine-grained reactivity, atom-based | Less natural for complex nested state like slide trees |
| **React Context** | Built-in React state | No dependencies | Performance issues with frequent updates (re-renders entire tree) |
| **Recoil** | Facebook's atomic state | Concurrent mode compatible | Less community adoption, uncertain maintenance |

## Decision

**Use Zustand** (`zustand@^5`) with `persist` middleware for slide state and `devtools` middleware for debug-heavy stores.

## Rationale

1. **Minimal API for complex state**: The slide store has 15+ actions including recursive tree operations. Zustand's function-based API keeps this manageable without action creators, reducers, or dispatch patterns.

2. **Built-in persistence**: `persist` middleware handles localStorage serialization automatically. Critical for `useSlideStore` so users don't lose work on page refresh.

3. **Selective persistence**: `partialize` option lets us persist slides but exclude undo/redo stacks (which would consume excessive localStorage space).

4. **No Provider wrapping**: Unlike Context or Redux, Zustand doesn't require Provider components. Stores are accessible from anywhere, including non-React code.

5. **TypeScript inference**: Full type inference without manual typing of actions/dispatchers.

## Consequences

### Positive
- 6 stores implemented with minimal code (~50 lines average)
- Undo/redo implemented with simple `past[]` / `future[]` arrays
- Persistence "just works" with one middleware config line
- No performance issues from the recursive slide tree operations

### Negative
- DevTools integration requires explicit `devtools` middleware per store (only added to `usePromptStore` and `useScratchStore`)
- No built-in middleware for async actions (handled with `useCallback` in hooks)
- Global stores can make data flow harder to trace vs. prop drilling

### Key Design Decisions
- **`useSlideStore`** persists to `slides-storage` but excludes `past`/`future` via `partialize`
- **`useCreativeAiStore`** persists to `creative-ai` (preserves outline work)
- **`useAgenticWorkflowStore`** is ephemeral (generation state doesn't survive refresh)
- **`useSearchStore`** is ephemeral (search state is transient)

## References

- `src/store/useSlideStore.tsx` — Primary store (400 lines)
- `src/store/useAgenticWorkflowStore.tsx` — Workflow store
- `src/store/useCreativeAiStore.tsx` — Creative AI store
- `src/store/usePromptStore.tsx` — Prompt store

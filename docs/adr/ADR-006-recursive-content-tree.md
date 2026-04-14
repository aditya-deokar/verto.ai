# ADR-006: Recursive ContentItem Tree for Slide Data

**Status**: Accepted  
**Date**: 2024  
**Decision Makers**: Core team

---

## Context

We needed a data structure to represent slide content that supports: arbitrary nesting (columns within columns), multiple component types (text, images, lists, tables, callouts), drag-and-drop at any level, and consistent rendering across 4 contexts (editor, present, export, share).

### Options Considered

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **Recursive ContentItem tree** | Nested JSON tree of typed nodes | Unlimited nesting, one renderer, flexible | Complex recursive operations, deep trees |
| **Flat array with references** | Array of items with parentId | Simpler operations, easier serialization | Rendering requires tree reconstruction |
| **Markdown / HTML string** | Store slide content as markup | Simple storage, easy rendering | No structured editing, hard to manipulate |
| **Block-based (Notion-like)** | Flat block array with indentation | Good for documents | Not natural for visual slide layouts |
| **Canvas-based (Figma-like)** | Absolute-positioned elements | Maximum layout flexibility | Complex, hard to make responsive |

## Decision

**Use a recursive `ContentItem` tree** stored as JSON in the database, rendered by a single `MasterRecursiveComponent`.

## Rationale

1. **Natural representation**: Slides are inherently hierarchical — a column contains rows, which contain text blocks and images. A recursive tree is the natural data structure.

2. **Single renderer**: `MasterRecursiveComponent` walks the tree recursively and renders each node based on its `type`. This means one component handles all rendering contexts (editor, present, share, export).

3. **Drag-and-drop at any depth**: Because the tree is recursive, components can be dragged from any nesting level to any other nesting level. The `moveComponentInSlide()` action handles the recursive removal and insertion.

4. **Extension via type union**: Adding a new component type requires adding to the `ContentType` union and a new case in `MasterRecursiveComponent`. No schema migration needed.

5. **JSON storage**: The entire slide tree serializes cleanly to JSON, which PostgreSQL stores natively. No ORM complexity for nested structures.

## Consequences

### Positive
- 28+ component types supported with one renderer
- Unlimited nesting depth for complex layouts
- Serializes to JSON for database storage
- Consistent rendering across editor, present, share, and export

### Negative
- Recursive tree operations are complex (see `useSlideStore` — 400 lines)
- Deep nesting can impact rendering performance
- Recursive functions for update/add/remove/move are harder to debug
- `content` field is polymorphic: `ContentItem[] | string | string[] | string[][]`

### Key Type Definition

```typescript
interface ContentItem {
  id: string;
  type: ContentType;    // 28+ possible types
  name: string;
  content: ContentItem[] | string | string[] | string[][];
  // ...optional props (className, fontSize, icon, etc.)
}
```

The polymorphic `content` field is the core trade-off: it enables flexibility but requires runtime type checking in every recursive operation.

## References

- `src/lib/types.ts` — `ContentItem`, `Slide`, `ContentType` definitions
- `src/components/global/editor/compontents/MasterRecursiveComponent.tsx` — Recursive renderer
- `src/store/useSlideStore.tsx` — Recursive tree operations

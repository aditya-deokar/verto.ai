# ADR-005: Layout-First Content Generation

**Status**: Accepted  
**Date**: 2024  
**Decision Makers**: Core team

---

## Context

Early versions of the generation pipeline wrote content first and then tried to fit it into layouts. This produced generic, text-heavy slides regardless of layout type. A "comparison" layout would get the same paragraph text as a "quote" layout, requiring expensive post-processing to restructure content.

### Options Considered

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **Layout-first** | Select layout → generate content matching layout | Content is structurally aware, no reformatting needed | Requires more complex prompts, tighter agent coupling |
| **Content-first** | Generate content → select layout → reformat | Simpler initial pipeline | Post-generation reformatting is lossy and expensive |
| **Parallel** | Generate content and select layout simultaneously | Faster (parallel execution) | Content can't be layout-aware, still needs reformatting |
| **Template filling** | Pre-define templates → fill with LLM | Consistent output | Limited creativity, rigid structure |

## Decision

**Select layouts BEFORE writing content.** The Layout Selector agent runs before the Content Writer, so content is generated with full awareness of its target structure.

## Rationale

1. **Structural awareness**: When the Content Writer knows a slide uses `comparisonLayout`, it generates `comparisonPointsA` and `comparisonPointsB` instead of generic paragraphs. This produces content that perfectly fits the layout.

2. **Eliminates reformatting**: Content-first approaches require a separate "reformatting" step that often loses information or produces awkward restructuring. Layout-first eliminates this entirely.

3. **Premium visual quality**: Different layouts demand fundamentally different content structures. A `bigNumberLayout` needs a `statValue` and `statLabel`. A `quoteLayout` needs `quoteText` and `quoteAttribution`. Only layout-first can produce these naturally.

4. **Diverse presentations**: By selecting layouts early, we can enforce layout diversity (no two consecutive slides with the same layout), producing more visually interesting presentations.

## Consequences

### Positive
- Generated slides look premium and intentional
- JSON Compiler simply maps content fields to layout templates (no guessing)
- Each layout type has its own structured content fields (type-safe)
- Visual diversity is enforced at the layout selection stage

### Negative
- Tighter coupling between Layout Selector and Content Writer
- Content Writer prompt is more complex (needs to know all layout-specific fields)
- Adding a new layout requires updating both the Layout Selector and Content Writer

### Pipeline Order

```
Before (content-first):  Outline → Content → Layout → Reformat → Compile
After (layout-first):    Outline → Layout → Content → Compile
                                     ↑ saves one entire agent step
```

## References

- `src/agentic-workflow-v2/agents/layoutSelector.ts` — Runs before content
- `src/agentic-workflow-v2/agents/contentWriter.ts` — Layout-aware content
- `src/agentic-workflow-v2/actions/advanced-genai-graph.ts` — Edge: `layoutSelector → contentWriter`

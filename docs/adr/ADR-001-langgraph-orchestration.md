# ADR-001: LangGraph for AI Orchestration

**Status**: Accepted  
**Date**: 2024  
**Decision Makers**: Core team

---

## Context

Verto AI needs to transform a single user topic into a complete, multi-slide presentation. This involves multiple sequential AI operations: outline generation, layout selection, content writing, image searching, JSON compilation, and database persistence. We needed an orchestration framework to manage this pipeline reliably.

### Options Considered

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| **LangGraph** | Stateful graph-based agent framework | Typed state, conditional edges, built-in retries, clear visualization | Learning curve, LangChain dependency |
| **Simple chain-of-calls** | Sequential async functions | Simple, no dependencies | No state management, hard to debug, no conditional logic |
| **LangChain Chains** | LangChain LCEL chains | Well-documented, composable | Less control over state, harder to add conditional edges |
| **Custom state machine** | Hand-built FSM | Full control | Significant build effort, maintenance burden |
| **CrewAI** | Multi-agent framework | Agent specialization | Opinionated, less control over execution flow |

## Decision

**Use LangGraph** (`@langchain/langgraph`) as the orchestration framework for the presentation generation pipeline.

## Rationale

1. **Typed state channels**: LangGraph's `StateGraph` provides typed state that flows through all agents, ensuring compile-time safety for the data passed between steps.

2. **Conditional edges**: The image fetcher agent needs a loop — it may need to retry fetching images for slides that failed. LangGraph's `addConditionalEdges()` handles this elegantly with `shouldFetchMoreImages()`.

3. **Clear graph visualization**: The pipeline is naturally a directed graph (outline → layout → content → images → compile → persist). LangGraph makes this structure explicit and debuggable.

4. **State merge semantics**: Each agent returns only the fields it modifies. LangGraph's channel reducers handle merging partial state updates.

5. **Recursion limits**: Built-in protection against infinite loops (set to 150 for image fetcher retries).

## Consequences

### Positive
- Pipeline is easily extensible (add a new agent = add a node + edge)
- Clear separation of concerns — each agent has one job
- Conditional branching is first-class (image fetcher loop)
- State is fully typed and inspectable at each step

### Negative
- Adds `@langchain/langgraph` and `@langchain/google-genai` as dependencies
- Team needs to understand LangGraph concepts (channels, reducers, conditional edges)
- LangGraph is still evolving — API may change across versions

### Trade-offs
- We accepted the LangChain ecosystem dependency in exchange for significantly reduced orchestration code
- The `wrapNode()` pattern adds a layer of indirection but provides consistent progress tracking and error handling across all agents

## References

- `src/agentic-workflow-v2/actions/advanced-genai-graph.ts` — Graph definition
- `src/agentic-workflow-v2/lib/state.ts` — State schema
- [LangGraph Documentation](https://langchain-ai.github.io/langgraphjs/)

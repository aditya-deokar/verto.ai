# Presentation Improvement Decisions

## Status

Accepted as the implementation baseline for Phase 0 and Phase 1.

## Decision 1: Primary generation architecture

Decision:

- `src/agentic-workflow-v2` is the primary long-term presentation generation architecture.

Why:

- It already models the workflow as explicit steps
- It is easier to extend for real progress, image providers, and persistence
- It is a better foundation than keeping multiple overlapping generation systems active

Short-term impact:

- Legacy generation paths may remain temporarily for compatibility
- New feature work should prefer V2

## Decision 2: Share model direction

Decision:

- Sharing will be implemented later as an explicit publish/share feature, not as an implicitly public raw project URL.

Preferred model:

- owner-controlled publish state
- dedicated share route
- optional tokenized access if needed

Short-term impact:

- Existing share affordance should not be treated as complete functionality

## Decision 3: Export scope direction

Decision:

- Export is a real product requirement candidate, but implementation should be staged:
  - PDF first
  - PPTX second, only if true PowerPoint export is required

Why:

- PDF is lower complexity
- PPTX fidelity is harder with the current recursive slide schema

## Decision 4: Image provider direction

Decision:

- Replace the mock image fetcher with a real provider abstraction rather than embedding one provider directly into the workflow logic.

Preferred design:

- provider interface
- provider-specific implementation
- fallback/default image behavior

Why:

- keeps the workflow modular
- allows provider swaps without rewriting the agent logic

## Decision 5: Authorization standard

Decision:

- All project reads and writes must enforce ownership in server-side actions.

Response behavior:

- `403` for unauthenticated requests
- `404` when the requested project is not found for the authenticated owner

Why:

- avoids exposing cross-user project existence through successful reads or writes
- keeps authorization logic centralized and predictable

## Decision 6: Create-flow normalization direction

Decision:

- All create modes should eventually converge toward one consistent generation flow built around the primary V2 architecture.

Preferred UX direction:

- collect theme before final generation
- generate once
- go directly to editor

This may still preserve outline editing where it adds value, but theme handling and final generation should become consistent.

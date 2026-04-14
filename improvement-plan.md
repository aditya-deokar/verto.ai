# Presentation Feature Improvement Plan

## Implementation Status

Completed in code:

- Phase 0
- Phase 1
- Phase 2
- Phase 3
- Phase 4
- Phase 5
- Phase 6
- Phase 7
- Phase 8

Current shipped direction:

- `src/agentic-workflow-v2` is the maintained generation path
- sharing uses owner-controlled public links
- export currently ships as PDF
- V2 progress uses persisted backend step progress instead of client-side simulation

This plan is still useful as historical implementation context, but the current source of truth for the live architecture is:

- `presentationfeaturebreakdown.md`
- `docs/presentation-architecture.md`
- `docs/presentation-smoke-checklist.md`

## Goal

This document turns the presentation feature analysis into a practical, phase-wise implementation roadmap so we can improve the system safely, in the right order, and one milestone at a time.

The requested improvement areas are:

1. Enforce ownership checks on all project read/write actions
2. Choose one primary generation architecture and deprecate the other
3. Replace mock image fetching with a real provider
4. Implement actual share route support or remove share affordance
5. Implement true presentation export if PDF/PPTX is a product requirement
6. Consider server-streamed progress for V2 workflow
7. Normalize theme-selection behavior across all create modes

---

## Recommended execution order

The safest order is:

1. Security and data ownership hardening
2. Architecture consolidation
3. UX flow normalization
4. Real image pipeline
5. Share flow decision and implementation
6. Export implementation
7. True server-streamed progress

Reasoning:

- Ownership/security issues should be fixed first because they affect every project action
- Architecture should be consolidated before we invest more in flows, progress, and exports
- Theme/create-flow normalization becomes easier once we commit to one generation path
- Real image integration should happen after we know which generation system survives
- Share and export should be built on the finalized presentation runtime and project model
- Server-streamed progress is valuable, but easiest to implement once the V2 pipeline is clearly the primary system

---

## Phase 0: Alignment and decision checkpoints

### Goal

Lock the product and technical decisions that affect the rest of the roadmap.

### Decisions to make before implementation

1. Confirm that `V2 agentic workflow` becomes the primary generation architecture
2. Decide whether sharing should be:
- public link with no auth
- tokenized private link
- authenticated-only share

3. Decide whether export is in scope for:
- PDF only
- PPTX only
- both PDF and PPTX

4. Decide acceptable provider strategy for images:
- Unsplash-like stock source
- generated images
- mixed provider with fallback

### Deliverable

- Short architecture decision note inside repo or issue tracker

### Exit criteria

- One primary generation architecture selected
- Share model selected
- Export scope selected
- Image provider direction selected

---

## Phase 1: Ownership and authorization hardening

### Goal

Ensure users can only read or mutate their own presentation projects.

### Why this comes first

This is the highest-risk issue because several project actions currently authenticate the user but do not consistently enforce project ownership.

### Target areas

- `src/actions/projects.ts`
- any route/page that reads project by ID
- V2 persistence flow if any project reads/writes bypass owner checks

### Implementation tasks

1. Create a shared helper for project ownership lookup
- Example idea: `getOwnedProjectOrThrow(userId, projectId)`
- Centralize owner verification so the pattern is not duplicated incorrectly

2. Update read actions
- `getProjectById()`
- any presentation fetches used by `/presentation/[id]`
- any presentation fetches used by `/present/[id]`

3. Update write actions
- `updateSlides()`
- `updateTheme()`
- `deleteProject()`
- `recoverProject()`
- any future share/export metadata updates

4. Standardize error behavior
- `403` when authenticated but not owner
- `404` when project does not exist

5. Audit for direct `prisma.project.update/findFirst/findUnique` patterns
- replace unsafe direct access with owned-access helper where appropriate

### Recommended technical shape

- Keep authorization checks in server actions
- Do not rely only on route protection
- Prefer checking ownership in the Prisma `where` clause whenever possible

### Deliverables

- Hardened actions
- Shared authorization helper
- Clear error handling behavior

### Acceptance criteria

- A user cannot fetch, edit, delete, recover, or theme-change another user’s project by guessing an ID
- All project actions that mutate data enforce ownership
- Editor and presentation routes still work for the owner

### Risks

- Existing pages may assume loose fetch behavior
- Some routes may need updated error-handling UX

---

## Phase 2: Generation architecture consolidation

### Goal

Pick one presentation generation system as the long-term path and reduce duplication.

### Recommendation

Make `src/agentic-workflow-v2` the primary architecture.

### Why V2 should likely win

- clearer step separation
- already project-aware
- easier to extend for progress/events
- better foundation for real image integration
- more maintainable than one giant legacy generation prompt

### Existing systems to reconcile

1. Legacy generation
- `src/actions/genai.ts`
- legacy theme-based generation flow

2. Older agentic flow
- `src/agentic-workflow`
- `useAgenticGeneration.ts`
- experimental theme-picker workflow components

3. V2 flow
- `src/agentic-workflow-v2`
- `useAgenticGenerationV2.ts`
- `generatePresentationAction()`

### Implementation tasks

1. Define the primary entrypoint
- likely `generatePresentationAction()`

2. Map what legacy features still exist only in old flow
- theme-dependent generation
- outline editing before full generation

3. Decide whether old flow will be:
- removed
- frozen but hidden
- temporarily supported behind feature flag

4. Remove or deprecate unused/duplicate components
- `ThemePickerWithWorkflow.tsx`
- `ThemePickerSimplified.tsx`
- older `useAgenticGeneration.ts`
- older `src/agentic-workflow` if no longer needed

5. Update create-page modes so each one targets the chosen architecture consistently

### Deliverables

- Architecture decision implemented in code
- Deprecation notes or cleanup commits
- Reduced duplication in generation hooks/components

### Acceptance criteria

- One generation path is clearly the default and maintained path
- New work no longer needs to touch three overlapping systems
- All create modes route through a predictable generation pipeline

### Risks

- Some legacy flow behavior may be user-friendly and worth preserving
- We may need a temporary hybrid period while normalizing UX

---

## Phase 3: Normalize theme-selection behavior across all create modes

### Goal

Make the presentation creation flow feel consistent regardless of how the user starts.

### Current inconsistency

- Creative AI and Scratch use `project -> select-theme -> generate`
- V2 agentic workflow collects theme upfront and skips select-theme page

### Recommended direction

Choose one of these patterns:

1. Theme first for all modes
- user always selects theme before full generation

2. Theme as an input during generation for all modes
- user selects theme in the create form
- generation goes directly to editor

Preferred option:

- Move all modes toward the V2 style
- collect theme before generation and go directly to editor

### Why

- simpler user journey
- fewer route transitions
- reduces legacy dependency on `select-theme`
- cleaner fit with agent-based generation

### Implementation tasks

1. Decide final UX pattern
2. Update `CreativeAI` flow
- likely keep outline editing
- but move theme selection into the same flow before final generate

3. Update `ScratchPage` flow
- same treatment

4. Refactor or retire select-theme route if no longer needed

5. Ensure editor still loads theme from persisted project

### Deliverables

- Unified create flow UX
- Reduced dependency on legacy theme route

### Acceptance criteria

- All create modes follow one predictable progression
- Theme selection is consistent everywhere
- No mode feels like a separate product

### Risks

- Users may like the dedicated theme preview screen
- May need to preserve a richer theme preview inside the create UI

---

## Phase 4: Replace mock image fetching with a real provider

### Goal

Move from placeholder image URLs to a production-ready image retrieval pipeline.

### Current problem

`src/agentic-workflow-v2/utils/imageUtils.ts` returns categorized placeholder images, not real query results.

### Scope

- Real provider integration for V2 image fetcher
- provider abstraction so we can swap sources later
- rate limit and fallback handling

### Suggested architecture

1. Create provider interface
- `searchImages(query, options) -> [{ url, alt, credit, providerId }]`

2. Add provider implementation
- whichever provider is approved in Phase 0

3. Keep fallback strategy
- fallback image or skip image if provider fails

4. Store minimal image metadata if needed
- source URL
- provider name
- attribution if product/legal requires it

### Implementation tasks

1. Refactor `imageUtils.ts` into:
- provider abstraction
- provider implementation
- fallback/validation logic

2. Update `imageFetcher.ts`
- use real search results
- preserve conditional retry behavior

3. Add env-based configuration
- API keys
- provider selection

4. Handle failure modes
- empty results
- invalid URLs
- rate limits
- timeouts

### Deliverables

- Real provider-backed image pipeline
- Configurable fallback logic

### Acceptance criteria

- Image slides use query-relevant real images
- Broken provider calls do not fail the entire presentation
- Thumbnail extraction still works

### Risks

- provider pricing
- rate limiting
- attribution/legal requirements
- slower generation time

---

## Phase 5: Share flow implementation or removal

### Goal

Resolve the gap between the editor share button and missing/unfinished share functionality.

### Current state

- Navbar copies `/share/[presentationId]`
- no actual share route was found during analysis

### Product options

1. Implement real share route
2. Hide/remove share affordance until implemented

### Recommendation

Implement a real share route if sharing is product-important. Otherwise remove the button until ready.

### If implementing share, scope should include

1. Public presentation route
- e.g. `src/app/share/[presentationId]/page.tsx`

2. Authorization/public access strategy
- truly public
- token-based signed access
- owner-controlled publish toggle

3. Presentation rendering
- reuse read-only presentation components
- likely reuse the presentation runtime rendering logic

4. Optional project metadata
- `isPublished`
- `shareToken`
- `publishedAt`

### Implementation tasks

1. Decide access model
2. Add DB fields if needed
3. Build share route
4. Add publish/unpublish controls
5. Update navbar behavior
- copy valid URL only when sharing is enabled

### Deliverables

- Real share route or removed share button

### Acceptance criteria

- Shared links actually open a presentation
- unpublished/private decks are not publicly accessible
- owner can control share state if required

### Risks

- accidental public exposure if share model is too loose
- need extra ownership/publish checks

---

## Phase 6: Presentation export implementation

### Goal

Add true export support for presentation projects if PDF/PPTX export is a real product requirement.

### Current state

- dependencies exist: `pptxgenjs`, `jspdf`, `html2canvas`, `puppeteer-core`
- no presentation export feature was found in the presentation flow

### Product options

1. PDF export only
2. PPTX export only
3. Both PDF and PPTX

### Recommendation

Implement in two steps:

1. PDF export first
- easier path
- good for read-only deck distribution

2. PPTX export second
- only if true editable PowerPoint export is required

### Why this staged approach is better

- PDF export can reuse presentation rendering more directly
- PPTX export requires schema-to-PowerPoint mapping, which is more complex

### Proposed architecture

#### PDF export

- server-side render slides
- generate PDF from HTML/canvas or headless browser
- preserve theme and slide order

#### PPTX export

- map slide JSON schema into `pptxgenjs`
- define conversion rules for:
  - headings
  - paragraphs
  - bullets
  - images
  - tables
  - callouts
  - layout positioning

### Implementation tasks

1. Add export action(s)
2. Define export-compatible slide layout rules
3. Implement PDF pipeline
4. Validate visual parity
5. If required, implement PPTX pipeline
6. Add export UI in editor/navbar

### Deliverables

- export action(s)
- UI trigger(s)
- downloadable file generation

### Acceptance criteria

- Exported output respects slide order and theme
- PDF output is visually consistent with presentation mode
- PPTX output is structurally usable in PowerPoint if that format is chosen

### Risks

- PPTX fidelity can be hard with a recursive web-native component schema
- some component types may need export-specific fallbacks

---

## Phase 7: Real server-streamed progress for V2

### Goal

Replace simulated progress with actual backend step progress during generation.

### Current state

- `useAgenticGenerationV2.ts` simulates progress client-side
- backend does not stream per-step updates to UI

### Desired result

When V2 runs, the UI should show real step progress such as:

- project initialized
- outline generated
- content written
- layouts selected
- images fetched
- JSON compiled
- project saved

### Recommended architecture

Possible implementation approaches:

1. Realtime events per generation job
2. Polling progress from database/state table
3. SSE or websocket-style step feed

Preferred direction:

- persist step status to a lightweight generation-progress store
- use polling or realtime events from the client

### Why this should not be Phase 1

- it is not a correctness blocker
- much easier once V2 is unquestionably the main generator

### Implementation tasks

1. Add generation run identifier
2. Add progress persistence or event emission at each agent step
3. Update client hook to consume actual progress
4. Remove simulated random increments
5. Add proper failure state messaging by step

### Deliverables

- real progress plumbing
- updated workflow dialog

### Acceptance criteria

- UI progress reflects true backend state
- users can see where failures happen
- progress no longer jumps artificially

### Risks

- more infrastructure complexity
- need cleanup for abandoned/failed jobs

---

## Phase 8: Cleanup and deprecation removal

### Goal

Remove dead code, reduce confusion, and leave the presentation feature in a maintainable state.

### Scope

- old generation hooks
- unused theme workflow variants
- duplicate agentic systems
- obsolete route transitions
- outdated comments and docs

### Implementation tasks

1. Remove deprecated files after migration
2. Update `presentationfeaturebreakdown.md`
3. Add short internal docs for:
- chosen architecture
- generation flow
- export/share flow

4. Add smoke test checklist for:
- create
- generate
- edit
- present
- share
- export

### Deliverables

- reduced code surface
- updated docs

### Acceptance criteria

- new contributors can identify the main flow quickly
- no major user path depends on deprecated code

---

## Suggested phase-by-phase delivery milestones

## Milestone A: Secure Foundation

Includes:

- Phase 0
- Phase 1

Outcome:

- safer project access
- architecture decisions locked

## Milestone B: One Clear Creation System

Includes:

- Phase 2
- Phase 3

Outcome:

- one primary generation system
- consistent create/theme flow

## Milestone C: Production Media and Sharing

Includes:

- Phase 4
- Phase 5

Outcome:

- real image pipeline
- real share behavior

## Milestone D: Output and Observability

Includes:

- Phase 6
- Phase 7

Outcome:

- export support
- real progress visibility

## Milestone E: Final Cleanup

Includes:

- Phase 8

Outcome:

- maintainable long-term feature set

---

## Recommended first implementation task

Start with:

- `Phase 1: Ownership and authorization hardening`

Why:

- highest risk
- smallest blast radius compared to architecture rewrites
- improves safety before we add sharing/export/public access

---

## Working rule for execution

For each phase, we should do the same sequence:

1. define exact scope
2. inspect affected files
3. make minimal safe code changes
4. verify critical user flows
5. update docs if behavior changes

This will let us move one phase at a time without destabilizing the whole presentation feature.

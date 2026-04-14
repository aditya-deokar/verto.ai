# Presentation Feature Breakdown

This document now reflects the current production direction of the presentation feature after phases 0 through 8.

## Current status

- Primary generation architecture: `src/agentic-workflow-v2`
- Share model: public link with owner-controlled publish/unpublish
- Export scope implemented: PDF export
- Image provider strategy: provider-backed search with fallback
- V2 progress UX: real backend progress persisted to the database and polled by the client

## Main user flows

### 1. Create

Route:

- `src/app/(protected)/(pages)/(dashboardPages)/create-page`

Modes:

- `Creative AI`
- `Start from Scratch`
- `Agentic Workflow`

Current UX direction:

- all active create modes now collect theme before final generation
- V2 is the maintained generation path
- legacy `select-theme` route still exists for older project-first flow compatibility, but it is no longer the strategic path

### 2. Generate

Primary entrypoint:

- `src/actions/generatePresentation.ts`

Workflow engine:

- `src/agentic-workflow-v2/actions/advanced-genai-graph.ts`

High-level graph:

- `projectInitializer`
- `outlineGenerator`
- `contentWriter`
- `layoutSelector`
- `imageQueryGenerator`
- `imageFetcher`
- `jsonCompiler`
- `databasePersister`

Progress tracking:

- generation runs are persisted via `PresentationGenerationRun`
- step progress is written server-side during the workflow
- the client polls the run instead of simulating progress locally

### 3. Edit

Editor route:

- `src/app/(protected)/presentation/[presentationId]`

Main runtime pieces:

- `src/store/useSlideStore.tsx`
- `src/app/(protected)/presentation/[presentationId]/_components/editor/Editor.tsx`
- `src/app/(protected)/presentation/[presentationId]/_components/editor/MasterRecursiveComponent.tsx`
- `src/app/(protected)/presentation/[presentationId]/_components/editor/EditorToolbar.tsx`

Capabilities:

- manual content editing
- drag/drop layouts and components
- theme switching
- save to Prisma
- PDF export from editor navbar
- publish/unpublish public share link

### 4. Present and share

Owner presentation route:

- `src/app/(protected)/present/[presentationId]/page.tsx`

Public share route:

- `src/app/share/[presentationId]/page.tsx`

Shared presentation viewer:

- `src/components/presentation/PresentationViewer.tsx`

Sharing model:

- owner enables sharing from the editor navbar
- shared decks are only accessible when `isPublished = true`

## Data model

Relevant Prisma models and fields:

- `Project`
  - `slides`
  - `outlines`
  - `themeName`
  - `thumbnail`
  - `isDeleted`
  - `isPublished`
  - `publishedAt`
- `PresentationGenerationRun`
  - `status`
  - `currentStepId`
  - `currentStepName`
  - `progress`
  - `error`
  - `steps`
  - `projectId`

## Active architecture

### Maintained path

- `src/agentic-workflow-v2`
- `src/hooks/useAgenticGenerationV2.ts`
- `src/actions/generatePresentation.ts`

### Compatibility path still present

- `src/actions/genai.ts`
- `src/app/(protected)/presentation/[presentationId]/select-theme/_components/ThemePicker.tsx`
- `src/agentic-workflow`

These legacy pieces are still present to support the older project-first generation flow, but they are no longer the preferred foundation for new work.

## What is now implemented

- ownership-aware project actions
- V2 as the main generation path
- normalized theme-first create flow across active create modes
- real provider-backed V2 image pipeline with fallback
- real share route and publish controls
- PDF export from the editor
- real persisted backend progress for V2 generation

## Removed during cleanup

- deprecated `useAgenticGeneration.ts`
- deprecated `ThemePickerWithWorkflow.tsx`
- deprecated `ThemePickerSimplified.tsx`

## Best onboarding path

If you want to understand the feature quickly, start here:

1. `src/app/(protected)/(pages)/(dashboardPages)/create-page/_components/AgenticWorkflowPage.tsx`
2. `src/hooks/useAgenticGenerationV2.ts`
3. `src/actions/generatePresentation.ts`
4. `src/agentic-workflow-v2/actions/advanced-genai-graph.ts`
5. `src/actions/presentation-generation.ts`
6. `src/app/(protected)/presentation/[presentationId]/page.tsx`
7. `src/components/presentation/PresentationViewer.tsx`

## Supporting docs

For more focused internal documentation, see:

- `docs/presentation-architecture.md`
- `docs/presentation-smoke-checklist.md`

# Presentation Architecture

## Product decisions in code

- generation architecture: `V2 agentic workflow`
- sharing: public link with owner-controlled publish toggle
- export: PDF first
- images: provider-backed search with fallback

## Main paths

### Create and generate

- UI: `src/app/(protected)/(pages)/(dashboardPages)/create-page/_components/AgenticWorkflowPage.tsx`
- Hook: `src/hooks/useAgenticGenerationV2.ts`
- Server action: `src/actions/generatePresentation.ts`
- Workflow: `src/agentic-workflow-v2/actions/advanced-genai-graph.ts`
- Progress persistence: `src/actions/presentation-generation.ts`

### Editor

- Route: `src/app/(protected)/presentation/[presentationId]/page.tsx`
- Store: `src/store/useSlideStore.tsx`
- Recursive renderer: `src/app/(protected)/presentation/[presentationId]/_components/editor/MasterRecursiveComponent.tsx`
- Toolbar: `src/app/(protected)/presentation/[presentationId]/_components/editor/EditorToolbar.tsx`
- Navbar: `src/app/(protected)/presentation/[presentationId]/_components/Navbar.tsx`

### Presentation runtime

- Shared viewer: `src/components/presentation/PresentationViewer.tsx`
- Owner present route: `src/app/(protected)/present/[presentationId]/page.tsx`
- Public share route: `src/app/share/[presentationId]/page.tsx`

## V2 generation steps

1. `projectInitializer`
2. `outlineGenerator`
3. `contentWriter`
4. `layoutSelector`
5. `imageQueryGenerator`
6. `imageFetcher`
7. `jsonCompiler`
8. `databasePersister`

These steps are the source of truth for client-visible progress.

## Persistence model

### Project

Stores deck data and runtime metadata:

- `slides`
- `outlines`
- `themeName`
- `thumbnail`
- `isPublished`
- `publishedAt`

### PresentationGenerationRun

Stores observable generation state:

- `status`
- `currentStepId`
- `currentStepName`
- `progress`
- `error`
- `steps`
- `projectId`

## Export strategy

Current implementation:

- PDF export from the editor navbar
- rendered from the actual slide JSON with theme styling
- implemented client-side with `html2canvas` + `jspdf`

Future extension path:

- PPTX export should be added as a separate schema-mapping pipeline rather than by reusing the PDF renderer

## Legacy code policy

Still present for compatibility:

- `src/actions/genai.ts`
- `src/agentic-workflow`
- legacy select-theme route

Removed during cleanup:

- `src/hooks/useAgenticGeneration.ts`
- `ThemePickerWithWorkflow.tsx`
- `ThemePickerSimplified.tsx`

Rule:

- new presentation work should target `src/agentic-workflow-v2` unless there is a deliberate compatibility reason not to

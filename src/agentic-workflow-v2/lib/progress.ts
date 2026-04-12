export type GenerationStepStatus = "pending" | "running" | "completed" | "error";

export const GENERATION_STEP_DEFINITIONS = [
  {
    id: "projectInitializer",
    name: "Project Setup",
    description: "Preparing your presentation workspace",
    progress: 10,
  },
  {
    id: "outlineGenerator",
    name: "Structure",
    description: "Organizing the presentation flow",
    progress: 20,
  },
  {
    id: "contentWriter",
    name: "Content Writing",
    description: "Creating engaging text for all slides",
    progress: 40,
  },
  {
    id: "layoutSelector",
    name: "Design Layout",
    description: "Selecting the best look for your slides",
    progress: 55,
  },
  {
    id: "imageQueryGenerator",
    name: "Visual Search",
    description: "Finding the right visuals for each slide",
    progress: 65,
  },
  {
    id: "imageFetcher",
    name: "Image Integration",
    description: "Adding beautiful visuals",
    progress: 75,
  },
  {
    id: "jsonCompiler",
    name: "Assembly",
    description: "Formatting and polishing your slides",
    progress: 85,
  },
  {
    id: "databasePersister",
    name: "Finalization",
    description: "Saving your masterpiece",
    progress: 100,
  },
] as const;

export type GenerationStepId = (typeof GENERATION_STEP_DEFINITIONS)[number]["id"];

export type GenerationStepSnapshot = {
  id: GenerationStepId;
  name: string;
  description: string;
  progress: number;
  status: GenerationStepStatus;
  details?: string;
};

export function buildGenerationStepSnapshots(): GenerationStepSnapshot[] {
  return GENERATION_STEP_DEFINITIONS.map((step) => ({
    ...step,
    status: "pending" as const,
  }));
}

export function getGenerationStepDefinition(stepId: string) {
  return GENERATION_STEP_DEFINITIONS.find((step) => step.id === stepId);
}

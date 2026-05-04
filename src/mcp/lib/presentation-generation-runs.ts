import type { PresentationGenerationRun } from '@/generated/prisma';
import prisma from '@/lib/prisma';
import {
  buildGenerationStepSnapshots,
  type GenerationStepSnapshot,
} from '@/agentic-workflow-v2/lib/progress';

export interface PresentationGenerationRunMcpResponse {
  id: string;
  topic: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
  current_step_id: string | null;
  current_step_name: string | null;
  error: string | null;
  project_id: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  steps: GenerationStepSnapshot[];
}

function normalizeGenerationSteps(steps: unknown): GenerationStepSnapshot[] {
  if (!Array.isArray(steps)) {
    return buildGenerationStepSnapshots();
  }

  const defaults = buildGenerationStepSnapshots();

  return defaults.map((defaultStep) => {
    const matchingStep = steps.find(
      (step) =>
        typeof step === 'object' &&
        step !== null &&
        'id' in step &&
        (step as { id?: string }).id === defaultStep.id
    ) as Partial<GenerationStepSnapshot> | undefined;

    return {
      ...defaultStep,
      status: matchingStep?.status ?? defaultStep.status,
      details: matchingStep?.details,
    };
  });
}

export function generationRunToMcpResponse(
  run: PresentationGenerationRun
): PresentationGenerationRunMcpResponse {
  return {
    id: run.id,
    topic: run.topic,
    status: run.status,
    progress: run.progress,
    current_step_id: run.currentStepId ?? null,
    current_step_name: run.currentStepName ?? null,
    error: run.error ?? null,
    project_id: run.projectId ?? null,
    completed_at: run.completedAt?.toISOString() ?? null,
    created_at: run.createdAt.toISOString(),
    updated_at: run.updatedAt.toISOString(),
    steps: normalizeGenerationSteps(run.steps),
  };
}

export async function createGenerationRunForMcp(
  userId: string,
  topic: string
): Promise<PresentationGenerationRun> {
  return prisma.presentationGenerationRun.create({
    data: {
      userId,
      topic,
      status: 'PENDING',
      progress: 0,
      steps: buildGenerationStepSnapshots(),
    },
  });
}

export async function getGenerationRunForMcp(
  runId: string,
  userId: string
): Promise<PresentationGenerationRun | null> {
  return prisma.presentationGenerationRun.findFirst({
    where: {
      id: runId,
      userId,
    },
  });
}

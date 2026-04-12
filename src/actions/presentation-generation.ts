"use server";

import prisma from "@/lib/prisma";
import { getAuthenticatedAppUser } from "./project-access";
import {
  buildGenerationStepSnapshots,
  getGenerationStepDefinition,
  type GenerationStepSnapshot,
  type GenerationStepStatus,
} from "@/agentic-workflow-v2/lib/progress";

function normalizeSteps(steps: unknown): GenerationStepSnapshot[] {
  if (!Array.isArray(steps)) {
    return buildGenerationStepSnapshots();
  }

  const defaults = buildGenerationStepSnapshots();

  return defaults.map((defaultStep) => {
    const matchingStep = steps.find(
      (step) =>
        typeof step === "object" &&
        step !== null &&
        "id" in step &&
        (step as { id: string }).id === defaultStep.id
    ) as Partial<GenerationStepSnapshot> | undefined;

    return {
      ...defaultStep,
      status: matchingStep?.status ?? defaultStep.status,
      details: matchingStep?.details,
    };
  });
}

function updateStepSnapshots(
  steps: GenerationStepSnapshot[],
  stepId: string,
  status: GenerationStepStatus,
  details?: string
) {
  return steps.map((step) => {
    if (step.id !== stepId) {
      return step;
    }

    return {
      ...step,
      status,
      details,
    };
  });
}

export const createPresentationGenerationRun = async (topic: string) => {
  try {
    const auth = await getAuthenticatedAppUser();
    if (auth.status !== 200) {
      return auth;
    }

    const run = await prisma.presentationGenerationRun.create({
      data: {
        userId: auth.user.id,
        topic,
        status: "PENDING",
        progress: 0,
        steps: buildGenerationStepSnapshots(),
      },
    });

    return {
      status: 200 as const,
      data: run,
    };
  } catch (error) {
    console.error("ERROR", error);
    return {
      status: 500 as const,
      error: "Internal server error",
    };
  }
};

export const getPresentationGenerationRun = async (runId: string) => {
  try {
    if (!runId) {
      return {
        status: 400 as const,
        error: "Generation run ID is required",
      };
    }

    const auth = await getAuthenticatedAppUser();
    if (auth.status !== 200) {
      return auth;
    }

    const run = await prisma.presentationGenerationRun.findFirst({
      where: {
        id: runId,
        userId: auth.user.id,
      },
    });

    if (!run) {
      return {
        status: 404 as const,
        error: "Generation run not found",
      };
    }

    return {
      status: 200 as const,
      data: {
        ...run,
        steps: normalizeSteps(run.steps),
      },
    };
  } catch (error) {
    console.error("ERROR", error);
    return {
      status: 500 as const,
      error: "Internal server error",
    };
  }
};

export async function startPresentationGenerationRun(runId: string) {
  if (!runId) {
    return;
  }

  await prisma.presentationGenerationRun.update({
    where: { id: runId },
    data: {
      status: "RUNNING",
      progress: 0,
      error: null,
      currentStepId: null,
      currentStepName: null,
      steps: buildGenerationStepSnapshots(),
    },
  });
}

export async function markPresentationGenerationStepRunning(
  runId: string,
  stepId: string,
  details?: string
) {
  if (!runId) {
    return;
  }

  const run = await prisma.presentationGenerationRun.findUnique({
    where: { id: runId },
  });

  if (!run) {
    return;
  }

  const steps = updateStepSnapshots(
    normalizeSteps(run.steps),
    stepId,
    "running",
    details
  );
  const step = getGenerationStepDefinition(stepId);

  await prisma.presentationGenerationRun.update({
    where: { id: runId },
    data: {
      status: "RUNNING",
      currentStepId: stepId,
      currentStepName: step?.name ?? stepId,
      progress: step ? Math.max(run.progress, step.progress - 5) : run.progress,
      error: null,
      steps,
    },
  });
}

export async function markPresentationGenerationStepCompleted(
  runId: string,
  stepId: string,
  options?: {
    details?: string;
    projectId?: string | null;
  }
) {
  if (!runId) {
    return;
  }

  const run = await prisma.presentationGenerationRun.findUnique({
    where: { id: runId },
  });

  if (!run) {
    return;
  }

  const steps = updateStepSnapshots(
    normalizeSteps(run.steps),
    stepId,
    "completed",
    options?.details
  );
  const step = getGenerationStepDefinition(stepId);

  await prisma.presentationGenerationRun.update({
    where: { id: runId },
    data: {
      status: "RUNNING",
      currentStepId: stepId,
      currentStepName: step?.name ?? stepId,
      progress: step?.progress ?? run.progress,
      error: null,
      steps,
      projectId: options?.projectId ?? run.projectId,
    },
  });
}

export async function failPresentationGenerationRun(
  runId: string,
  error: string,
  stepId?: string
) {
  if (!runId) {
    return;
  }

  const run = await prisma.presentationGenerationRun.findUnique({
    where: { id: runId },
  });

  if (!run) {
    return;
  }

  const step = stepId ? getGenerationStepDefinition(stepId) : null;
  const steps = stepId
    ? updateStepSnapshots(normalizeSteps(run.steps), stepId, "error", error)
    : normalizeSteps(run.steps);

  await prisma.presentationGenerationRun.update({
    where: { id: runId },
    data: {
      status: "FAILED",
      error,
      currentStepId: stepId ?? run.currentStepId,
      currentStepName: step?.name ?? run.currentStepName,
      steps,
      completedAt: new Date(),
    },
  });
}

export async function completePresentationGenerationRun(
  runId: string,
  options?: {
    projectId?: string | null;
  }
) {
  if (!runId) {
    return;
  }

  const run = await prisma.presentationGenerationRun.findUnique({
    where: { id: runId },
  });

  if (!run) {
    return;
  }

  await prisma.presentationGenerationRun.update({
    where: { id: runId },
    data: {
      status: "COMPLETED",
      progress: 100,
      currentStepId: "databasePersister",
      currentStepName:
        getGenerationStepDefinition("databasePersister")?.name ?? "Finalization",
      projectId: options?.projectId ?? run.projectId,
      completedAt: new Date(),
    },
  });
}

"use server";

import prisma from "@/lib/prisma";
import { getOwnedProject } from "./project-access";

export const getProjectShareState = async (projectId: string) => {
  try {
    const access = await getOwnedProject(projectId);
    if (access.status !== 200) {
      return access;
    }

    return {
      status: 200 as const,
      data: {
        id: access.project.id,
        isPublished: access.project.isPublished,
        publishedAt: access.project.publishedAt,
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

export const publishProject = async (projectId: string) => {
  try {
    const access = await getOwnedProject(projectId);
    if (access.status !== 200) {
      return access;
    }

    const publishedProject = await prisma.project.update({
      where: {
        id: access.project.id,
      },
      data: {
        isPublished: true,
        publishedAt: access.project.publishedAt ?? new Date(),
      },
    });

    return {
      status: 200 as const,
      data: publishedProject,
    };
  } catch (error) {
    console.error("ERROR", error);
    return {
      status: 500 as const,
      error: "Internal server error",
    };
  }
};

export const unpublishProject = async (projectId: string) => {
  try {
    const access = await getOwnedProject(projectId);
    if (access.status !== 200) {
      return access;
    }

    const unpublishedProject = await prisma.project.update({
      where: {
        id: access.project.id,
      },
      data: {
        isPublished: false,
      },
    });

    return {
      status: 200 as const,
      data: unpublishedProject,
    };
  } catch (error) {
    console.error("ERROR", error);
    return {
      status: 500 as const,
      error: "Internal server error",
    };
  }
};

export const getSharedProjectById = async (projectId: string) => {
  try {
    if (!projectId) {
      return {
        status: 400 as const,
        error: "Project ID is required",
      };
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        isDeleted: false,
        isPublished: true,
        projectType: "PRESENTATION",
      },
    });

    if (!project) {
      return {
        status: 404 as const,
        error: "Shared presentation not found",
      };
    }

    return {
      status: 200 as const,
      data: project,
    };
  } catch (error) {
    console.error("ERROR", error);
    return {
      status: 500 as const,
      error: "Internal server error",
    };
  }
};

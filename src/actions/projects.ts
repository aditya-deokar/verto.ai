"use server";

import prisma from "@/lib/prisma";
import { onAuthenticateUser } from "./user";
import { OutlineCard } from "@/lib/types";
import { JsonValue } from "@/generated/prisma/runtime/library";
import { getOwnedProject } from "./project-access";
import { checkAndIncrementUsage } from "@/lib/usage-limit";

export const getAllProjects = async () => {
  try {
    const checkUser = await onAuthenticateUser();
    if (checkUser.status !== 200 || !checkUser.user) {
      return {
        status: 403,
        error: "User Not Authenticated",
      };
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: checkUser.user.id,
        isDeleted: false,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (projects.length === 0) {
      return {
        status: 404,
        error: "No Projects Found",
      };
    }

    return {
      status: 200,
      data: projects,
    };
  } catch (error) {
    console.log("ERROR", error);
    return {
      status: 500,
      error: "Internal Server Error",
    };
  }
};

export const getRecentProjects = async () => {
  try {
    const checkUser = await onAuthenticateUser();

    if (checkUser.status !== 200 || !checkUser.user) {
      return { status: 403, error: "User not authenticated" };
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: checkUser.user.id,
        isDeleted: false,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
    });

    if (projects.length === 0) {
      return { status: 404, error: "No recent prompts found" };
    }

    return { status: 200, data: projects };
  } catch (error) {
    console.error("ERROR", error);
    return { status: 500, error: "Internal server error" };
  }
};

export const deleteProject = async (projectId: string) => {
  try {
    console.log("Deleting project with ID:", projectId);

    const access = await getOwnedProject(projectId, { includeDeleted: true });
    if (access.status !== 200) {
      return access;
    }

    const updatedProject = await prisma.project.update({
      where: {
        id: access.project.id,
      },
      data: {
        isDeleted: true,
      },
    });

    return { status: 200, data: updatedProject };
  } catch (error) {
    console.log("ERROR", error);
    return { status: 500, error: "Internal server error" };
  }
};

export const getDeletedProjects = async () => {
  try {
    const checkUser = await onAuthenticateUser();

    if (checkUser.status !== 200 || !checkUser.user) {
      return { status: 403, error: "User not authenticated" };
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: checkUser.user.id,
        isDeleted: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (projects.length === 0) {
      return { status: 200, message: "No deleted projects found", data: [] };
    }

    return { status: 200, data: projects };
  } catch (error) {
    console.error("ERROR", error);
    return { status: 500, error: "Internal server error" };
  }
};

export const recoverProject = async (projectId: string) => {
  try {
    console.log("Recovering project with ID:", projectId);

    const access = await getOwnedProject(projectId, { includeDeleted: true });
    if (access.status !== 200) {
      return access;
    }

    const updatedProject = await prisma.project.update({
      where: {
        id: access.project.id,
      },
      data: {
        isDeleted: false,
      },
    });

    return { status: 200, data: updatedProject };
  } catch (error) {
    console.log("ERROR", error);
    return { status: 500, error: "Internal server error" };
  }
};

export const deleteAllProjects = async (projectIds: string[]) => {
  try {
    console.log("Deleting all projects with IDs:", projectIds);

    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return { status: 400, error: "No project IDs provided." };
    }

    const checkUser = await onAuthenticateUser();

    if (checkUser.status !== 200 || !checkUser.user) {
      return { status: 403, error: "User not authenticated." };
    }

    const projectsToDelete = await prisma.project.findMany({
      where: {
        id: {
          in: projectIds,
        },
        userId: checkUser.user.id,
      },
    });

    if (projectsToDelete.length === 0) {
      return { status: 404, error: "No projects found for the given IDs." };
    }

    const deletedProjects = await prisma.project.deleteMany({
      where: {
        id: {
          in: projectsToDelete.map((project) => project.id),
        },
      },
    });

    console.log("Deleted projects count:", deletedProjects.count);

    return {
      status: 200,
      message: `${deletedProjects.count} projects successfully deleted.`,
    };
  } catch (error) {
    console.error("ERROR", error);
    return { status: 500, error: "Internal server error." };
  }
};

export const createProject = async (title: string, outlines: OutlineCard[]) => {
  try {
    console.log("Creating project with title:", title);
    console.log("Outlines:", outlines);

    if (!title || !outlines || outlines.length === 0) {
      return { status: 400, error: "Title and outlines are required." };
    }

    const allOutlines = outlines.map((outline) => outline.title);

    const checkUser = await onAuthenticateUser();

    if (checkUser.status !== 200 || !checkUser.user) {
      return { status: 403, error: "User not authenticated" };
    }

    // --- Usage Limit Check ---
    const usageCheck = await checkAndIncrementUsage(checkUser.user.id);
    if (!usageCheck.success) {
      return { 
        status: 403, 
        error: usageCheck.error,
        usage: usageCheck.usage,
        limit: usageCheck.limit 
      };
    }

    const project = await prisma.project.create({
      data: {
        title,
        outlines: allOutlines,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: checkUser.user.id,
      },
    });

    if (!project) {
      return { status: 500, error: "Failed to create project" };
    }

    return { status: 200, data: project };
  } catch (error) {
    console.error("ERROR", error);
    return { status: 500, error: "Internal server error" };
  }
};

export const getProjectById = async (presentationId: string) => {
  try {
    const access = await getOwnedProject(presentationId);
    if (access.status !== 200) {
      return access;
    }

    return { status: 200, data: access.project };
  } catch (error) {
    console.error("ERROR", error);
    return { status: 500, error: "Internal server error" };
  }
};

export const updateSlides = async (projectId: string, slides: JsonValue) => {
  try {
    if (!projectId || !slides) {
      return {
        status: 400,
        error: "Project ID and slides are required.",
      };
    }

    const access = await getOwnedProject(projectId);
    if (access.status !== 200) {
      return access;
    }

    const updatedProject = await prisma.project.update({
      where: {
        id: access.project.id,
      },
      data: {
        slides,
      },
    });

    return {
      status: 200,
      data: updatedProject,
    };
  } catch (error) {
    console.error("ERROR:", error);
    return { status: 500, error: "Internal server error" };
  }
};

export const updateTheme = async (projectId: string, theme: string) => {
  try {
    if (!projectId || !theme) {
      return { status: 400, error: "Project ID and theme are required." };
    }

    const access = await getOwnedProject(projectId);
    if (access.status !== 200) {
      return access;
    }

    const updatedProject = await prisma.project.update({
      where: {
        id: access.project.id,
      },
      data: {
        themeName: theme,
      },
    });

    return { status: 200, data: updatedProject };
  } catch (error) {
    console.error("ERROR:", error);
    return { status: 500, error: "Internal server error" };
  }
};

"use server";

import prisma from "@/lib/prisma";
import { onAuthenticateUser } from "./user";

type OwnedProjectOptions = {
  includeDeleted?: boolean;
};

export async function getAuthenticatedAppUser() {
  const checkUser = await onAuthenticateUser();

  if (checkUser.status !== 200 || !checkUser.user) {
    return {
      status: 403 as const,
      error: "User not authenticated",
    };
  }

  return {
    status: 200 as const,
    user: checkUser.user,
  };
}

export async function getOwnedProject(
  projectId: string,
  options: OwnedProjectOptions = {}
) {
  if (!projectId) {
    return {
      status: 400 as const,
      error: "Project ID is required",
    };
  }

  const auth = await getAuthenticatedAppUser();
  if (auth.status !== 200) {
    return auth;
  }

  const where: {
    id: string;
    userId: string;
    isDeleted?: boolean;
  } = {
    id: projectId,
    userId: auth.user.id,
  };

  if (!options.includeDeleted) {
    where.isDeleted = false;
  }

  const project = await prisma.project.findFirst({
    where,
  });

  if (!project) {
    return {
      status: 404 as const,
      error: "Project not found",
    };
  }

  return {
    status: 200 as const,
    user: auth.user,
    project,
  };
}

/**
 * MCP Data Access — Transport-Agnostic Project Ownership
 *
 * Replaces the existing `getOwnedProject()` from `src/actions/project-access.ts`
 * which depends on Clerk cookies via `onAuthenticateUser()`.
 *
 * This version accepts a `userId` directly from the MCP AuthContext,
 * making it usable from both stdio and HTTP transports.
 */

import prisma from '@/lib/prisma';
import type { Project } from '@/generated/prisma';

interface GetOwnedProjectOptions {
  /** If true, also match soft-deleted projects */
  includeDeleted?: boolean;
}

/**
 * Find a project by ID and enforce ownership via userId.
 *
 * @param projectId - The project cuid to look up
 * @param userId - The authenticated user's internal UUID (from AuthContext)
 * @param opts - Optional flags (includeDeleted)
 * @returns The Project record if found and owned, null otherwise
 */
export async function getOwnedProjectForMcp(
  projectId: string,
  userId: string,
  opts?: GetOwnedProjectOptions
): Promise<Project | null> {
  if (!projectId || !userId) {
    return null;
  }

  const where: {
    id: string;
    userId: string;
    isDeleted?: boolean;
  } = {
    id: projectId,
    userId,
  };

  // By default, exclude soft-deleted projects
  if (!opts?.includeDeleted) {
    where.isDeleted = false;
  }

  const project = await prisma.project.findFirst({ where });

  return project;
}

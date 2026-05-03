/**
 * MCP Presentation Mappers
 *
 * Transform Prisma database models into MCP-safe response objects.
 *
 * Rules:
 * 1. Never leak internal fields (userId, varientId) to MCP clients
 * 2. Rename fields to snake_case (MCP convention)
 * 3. Compute derived fields (slide_count, share_url)
 * 4. Single place to update when the Prisma schema changes
 */

import type { Project } from '@/generated/prisma';

/**
 * MCP-safe presentation response shape.
 * This is what MCP clients receive — never the raw Prisma model.
 */
export interface PresentationMCPResponse {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  slide_count: number;
  theme_name: string;
  is_published: boolean;
  is_deleted: boolean;
  published_at: string | null;
  share_url: string | null;
  outlines: string[];
  slides?: unknown[];
}

interface MapperOptions {
  includeSlides?: boolean;
  baseUrl?: string;
}

/**
 * Map a Prisma Project to an MCP PresentationMCPResponse.
 */
export function projectToPresentation(
  project: Project,
  options?: MapperOptions
): PresentationMCPResponse {
  const baseUrl = options?.baseUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const slidesArray = Array.isArray(project.slides) ? project.slides : [];

  return {
    id: project.id,
    title: project.title,
    created_at: project.createdAt.toISOString(),
    updated_at: project.updatedAt.toISOString(),
    slide_count: slidesArray.length,
    theme_name: project.themeName,
    is_published: project.isPublished,
    is_deleted: project.isDeleted,
    published_at: project.publishedAt?.toISOString() ?? null,
    share_url: project.isPublished ? `${baseUrl}/share/${project.id}` : null,
    outlines: project.outlines,
    ...(options?.includeSlides ? { slides: slidesArray } : {}),
  };
}

/**
 * Map an array of Prisma Projects to MCP responses (without slides for listings).
 */
export function projectsToListItems(
  projects: Project[],
  baseUrl?: string
): PresentationMCPResponse[] {
  return projects.map((p) =>
    projectToPresentation(p, { includeSlides: false, baseUrl })
  );
}

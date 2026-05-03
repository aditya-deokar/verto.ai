/**
 * MCP Resource — verto://templates
 *
 * Read-only catalog of published presentation templates.
 * Returns template metadata (no slide JSON) for LLM context efficiency.
 *
 * Templates are public data — no auth required to browse them.
 * Reuses the Prisma query pattern from src/actions/templates.ts.
 */

import prisma from '@/lib/prisma';
import { registerResourcePlugin } from './registry';
import { RESOURCE_URIS } from '../config/constants';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

function registerTemplatesResource(server: McpServer): void {
  server.resource(
    'templates',
    RESOURCE_URIS.TEMPLATES,
    {
      description:
        'Catalog of available presentation templates with categories, tags, difficulty levels, and metadata. Use this to help users choose a template before creating a presentation.',
      mimeType: 'application/json',
    },
    async (_uri) => {
      try {
        const templates = await prisma.presentationTemplate.findMany({
          where: { isPublished: true },
          orderBy: { usageCount: 'desc' },
          take: 50, // Cap at 50 for token efficiency
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            tags: true,
            difficulty: true,
            slideCount: true,
            themeName: true,
            layoutSequence: true,
            isPremium: true,
            isNew: true,
            isFeatured: true,
            aiEnhanceable: true,
            usageCount: true,
            ratingSum: true,
            ratingCount: true,
            authorName: true,
            createdAt: true,
            // NOTE: slides excluded for token efficiency
          },
        });

        // Compute average rating for each template
        const templatesWithRating = templates.map((t) => ({
          ...t,
          average_rating:
            t.ratingCount > 0
              ? Math.round((t.ratingSum / t.ratingCount) * 10) / 10
              : null,
          created_at: t.createdAt.toISOString(),
        }));

        return {
          contents: [
            {
              uri: RESOURCE_URIS.TEMPLATES,
              mimeType: 'application/json',
              text: JSON.stringify({
                templates: templatesWithRating,
                total: templatesWithRating.length,
              }),
            },
          ],
        };
      } catch (error) {
        console.error('[MCP Resource] Error loading templates:', error);

        return {
          contents: [
            {
              uri: RESOURCE_URIS.TEMPLATES,
              mimeType: 'application/json',
              text: JSON.stringify({
                error: 'Failed to load templates. Try again later.',
                templates: [],
              }),
            },
          ],
        };
      }
    }
  );
}

// Self-register
registerResourcePlugin({
  name: 'templates',
  register: registerTemplatesResource,
});

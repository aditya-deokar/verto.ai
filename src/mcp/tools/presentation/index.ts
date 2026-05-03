/**
 * MCP Presentation Tools — Plugin Registration
 *
 * Registers all presentation-domain tools with the MCP server.
 * Each tool is defined with its name, description, Zod schema,
 * and handler wrapped with auth resolution + error boundary.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerToolPlugin } from '../registry';
import { TOOL_NAMES, PAGINATION } from '../../config/constants';
import { handlePresentationList } from './list';
import { handlePresentationGet } from './get';
import { Errors } from '../_shared/errors';
import { resolveAuth, type TransportType } from '../../auth/middleware';
import { withErrorBoundary } from '../../middleware/error-handler';
import type { PresentationListInput, PresentationGetInput } from './schemas';

/**
 * The transport type for tools registered in this plugin.
 * Default to 'http' — stdio.ts overrides this via setTransportType().
 */
let currentTransport: TransportType = 'http';

/**
 * Allow transport entry points to set the active transport type.
 */
export function setTransportType(transport: TransportType): void {
  currentTransport = transport;
}

/**
 * Register all presentation tools.
 */
function registerPresentationTools(server: McpServer): void {
  // ─── Phase 1: Read-Only Tools ────────────────────────────────

  server.tool(
    TOOL_NAMES.PRESENTATION_LIST,
    'List all presentations owned by the authenticated user. Returns metadata only (no slide content) for token efficiency. Supports cursor-based pagination, sorting, and optional inclusion of soft-deleted items.',
    {
      cursor: z.string().optional()
        .describe('Pagination cursor from a previous response. Omit for the first page.'),
      limit: z.number().int().min(1).max(PAGINATION.MAX_PAGE_SIZE).default(PAGINATION.DEFAULT_PAGE_SIZE)
        .describe(`Number of presentations per page. Default: ${PAGINATION.DEFAULT_PAGE_SIZE}, Max: ${PAGINATION.MAX_PAGE_SIZE}.`),
      include_deleted: z.boolean().default(false)
        .describe('If true, also returns soft-deleted presentations.'),
      sort_by: z.enum(['updated_at', 'created_at', 'title']).default('updated_at')
        .describe('Field to sort results by.'),
      sort_order: z.enum(['asc', 'desc']).default('desc')
        .describe('Sort direction.'),
    },
    async (args, _extra) => {
      const auth = await resolveAuth(currentTransport);
      if (!auth) return Errors.unauthorized();

      const handler = withErrorBoundary(
        TOOL_NAMES.PRESENTATION_LIST,
        handlePresentationList,
        currentTransport
      );

      return handler(args as PresentationListInput, auth);
    }
  );

  server.tool(
    TOOL_NAMES.PRESENTATION_GET,
    'Get a single presentation by ID. Returns full metadata and optionally the complete slide JSON. Set include_slides to false for metadata-only (saves tokens).',
    {
      presentation_id: z.string().min(1)
        .describe('The unique identifier of the presentation (cuid format).'),
      include_slides: z.boolean().default(true)
        .describe('If true, includes the full slide JSON content. Set to false for metadata-only.'),
    },
    async (args, _extra) => {
      const auth = await resolveAuth(currentTransport);
      if (!auth) return Errors.unauthorized();

      const handler = withErrorBoundary(
        TOOL_NAMES.PRESENTATION_GET,
        handlePresentationGet,
        currentTransport
      );

      return handler(args as PresentationGetInput, auth);
    }
  );

  // ─── Phase 2: Mutation Tools ─────────────────────────────────
  // TODO: Import and register presentation_create
  // TODO: Import and register presentation_delete
  // TODO: Import and register presentation_recover
  // TODO: Import and register presentation_delete_permanently
  // TODO: Import and register presentation_update_slides
  // TODO: Import and register presentation_update_theme
  // TODO: Import and register presentation_publish
  // TODO: Import and register presentation_unpublish

  // ─── Phase 3: AI Generation ──────────────────────────────────
  // TODO: Import and register presentation_generate

  console.error('[MCP] Presentation plugin: 2 tools registered (list, get)');
}

// Self-register as a plugin
registerToolPlugin({
  name: 'presentation',
  register: registerPresentationTools,
});

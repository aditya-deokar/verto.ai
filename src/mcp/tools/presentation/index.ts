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
import { TOOL_NAMES, PAGINATION, LIMITS } from '../../config/constants';
import { Errors } from '../_shared/errors';
import { resolveAuth, type TransportType } from '../../auth/middleware';
import { withErrorBoundary } from '../../middleware/error-handler';

// ─── Phase 1: Read-Only Handlers ───────────────────────────────
import { handlePresentationList } from './list';
import { handlePresentationGet } from './get';

// ─── Phase 2: Mutation Handlers ────────────────────────────────
import { handlePresentationCreate } from './create';
import { handlePresentationDelete } from './delete';
import { handlePresentationRecover } from './recover';
import { handlePresentationDeletePermanently } from './delete-permanently';
import { handlePresentationUpdateSlides } from './update-slides';
import { handlePresentationUpdateTheme } from './update-theme';
import { handlePresentationPublish } from './publish';
import { handlePresentationUnpublish } from './unpublish';

// ─── Typed Inputs ──────────────────────────────────────────────
import type {
  PresentationListInput,
  PresentationGetInput,
  PresentationCreateInput,
  PresentationDeleteInput,
  PresentationRecoverInput,
  PresentationDeletePermanentlyInput,
  PresentationUpdateSlidesInput,
  PresentationUpdateThemeInput,
  PresentationPublishInput,
  PresentationUnpublishInput,
} from './schemas';

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
  // ═══════════════════════════════════════════════════════════════
  // Phase 1: Read-Only Tools
  // ═══════════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════════
  // Phase 2: Mutation Tools
  // ═══════════════════════════════════════════════════════════════

  server.tool(
    TOOL_NAMES.PRESENTATION_CREATE,
    'Create a new presentation with a title and slide outlines. Each outline becomes a slide placeholder. Returns the created presentation with metadata. Usage limits are enforced.',
    {
      title: z.string().min(1).max(LIMITS.MAX_TITLE_LENGTH)
        .describe('The title of the new presentation.'),
      outlines: z.array(
        z.object({
          title: z.string().min(1).max(LIMITS.MAX_TITLE_LENGTH),
          order: z.number().int().min(0),
        })
      ).min(1).max(LIMITS.MAX_OUTLINES)
        .describe('Slide outline cards. Each has a title and display order.'),
      request_id: z.string().uuid().optional()
        .describe('Client-generated UUID for idempotent creation.'),
    },
    async (args, _extra) => {
      const auth = await resolveAuth(currentTransport);
      if (!auth) return Errors.unauthorized();

      const handler = withErrorBoundary(
        TOOL_NAMES.PRESENTATION_CREATE,
        handlePresentationCreate,
        currentTransport
      );

      return handler(args as PresentationCreateInput, auth);
    }
  );

  server.tool(
    TOOL_NAMES.PRESENTATION_DELETE,
    'Soft-delete a presentation. The presentation can be recovered later using presentation_recover. Idempotent: calling on an already-deleted presentation returns success.',
    {
      presentation_id: z.string().min(1)
        .describe('ID of the presentation to soft-delete.'),
    },
    async (args, _extra) => {
      const auth = await resolveAuth(currentTransport);
      if (!auth) return Errors.unauthorized();

      const handler = withErrorBoundary(
        TOOL_NAMES.PRESENTATION_DELETE,
        handlePresentationDelete,
        currentTransport
      );

      return handler(args as PresentationDeleteInput, auth);
    }
  );

  server.tool(
    TOOL_NAMES.PRESENTATION_RECOVER,
    'Recover a soft-deleted presentation, restoring it to active status. Idempotent: calling on an active presentation returns success.',
    {
      presentation_id: z.string().min(1)
        .describe('ID of the soft-deleted presentation to recover.'),
    },
    async (args, _extra) => {
      const auth = await resolveAuth(currentTransport);
      if (!auth) return Errors.unauthorized();

      const handler = withErrorBoundary(
        TOOL_NAMES.PRESENTATION_RECOVER,
        handlePresentationRecover,
        currentTransport
      );

      return handler(args as PresentationRecoverInput, auth);
    }
  );

  server.tool(
    TOOL_NAMES.PRESENTATION_DELETE_PERMANENTLY,
    'PERMANENTLY delete presentations from the database. This action CANNOT be undone. Requires confirm: true to proceed. Only deletes presentations you own. Maximum 20 IDs per call.',
    {
      presentation_ids: z.array(z.string().min(1)).min(1).max(LIMITS.MAX_PERMANENT_DELETE_BATCH)
        .describe('Array of presentation IDs to permanently delete.'),
      confirm: z.literal(true)
        .describe('Must be exactly true to confirm permanent deletion. Prevents accidental data loss.'),
    },
    async (args, _extra) => {
      const auth = await resolveAuth(currentTransport);
      if (!auth) return Errors.unauthorized();

      const handler = withErrorBoundary(
        TOOL_NAMES.PRESENTATION_DELETE_PERMANENTLY,
        handlePresentationDeletePermanently,
        currentTransport
      );

      return handler(args as PresentationDeletePermanentlyInput, auth);
    }
  );

  server.tool(
    TOOL_NAMES.PRESENTATION_UPDATE_SLIDES,
    'Replace ALL slides in a presentation with the provided Slide[] array. This is a FULL REPLACEMENT — not a patch. Always use presentation_get first to read current slides, modify the array, then call this tool with the complete updated array.',
    {
      presentation_id: z.string().min(1)
        .describe('The unique identifier of the presentation to update.'),
      slides: z.array(z.object({
        id: z.string(),
        slideName: z.string(),
        type: z.string(),
        content: z.any(),
        slideOrder: z.number().optional(),
        className: z.string().optional(),
      })).describe('The complete Slide[] array. Replaces all existing slides.'),
    },
    async (args, _extra) => {
      const auth = await resolveAuth(currentTransport);
      if (!auth) return Errors.unauthorized();

      const handler = withErrorBoundary(
        TOOL_NAMES.PRESENTATION_UPDATE_SLIDES,
        handlePresentationUpdateSlides,
        currentTransport
      );

      return handler(args as PresentationUpdateSlidesInput, auth);
    }
  );

  server.tool(
    TOOL_NAMES.PRESENTATION_UPDATE_THEME,
    "Change the visual theme of a presentation. Use the 'verto://themes' resource to browse valid theme names before calling this tool.",
    {
      presentation_id: z.string().min(1)
        .describe('The unique identifier of the presentation to update.'),
      theme_name: z.string().min(1)
        .describe("Name of the theme to apply. Use the 'verto://themes' resource for valid names."),
    },
    async (args, _extra) => {
      const auth = await resolveAuth(currentTransport);
      if (!auth) return Errors.unauthorized();

      const handler = withErrorBoundary(
        TOOL_NAMES.PRESENTATION_UPDATE_THEME,
        handlePresentationUpdateTheme,
        currentTransport
      );

      return handler(args as PresentationUpdateThemeInput, auth);
    }
  );

  server.tool(
    TOOL_NAMES.PRESENTATION_PUBLISH,
    'Make a presentation publicly shareable via a unique share URL. Idempotent: calling on an already-published presentation returns the existing share URL.',
    {
      presentation_id: z.string().min(1)
        .describe('ID of the presentation to publish.'),
    },
    async (args, _extra) => {
      const auth = await resolveAuth(currentTransport);
      if (!auth) return Errors.unauthorized();

      const handler = withErrorBoundary(
        TOOL_NAMES.PRESENTATION_PUBLISH,
        handlePresentationPublish,
        currentTransport
      );

      return handler(args as PresentationPublishInput, auth);
    }
  );

  server.tool(
    TOOL_NAMES.PRESENTATION_UNPUBLISH,
    'Remove public access from a presentation. The share URL will no longer work. Idempotent: calling on an already-unpublished presentation returns success.',
    {
      presentation_id: z.string().min(1)
        .describe('ID of the presentation to unpublish.'),
    },
    async (args, _extra) => {
      const auth = await resolveAuth(currentTransport);
      if (!auth) return Errors.unauthorized();

      const handler = withErrorBoundary(
        TOOL_NAMES.PRESENTATION_UNPUBLISH,
        handlePresentationUnpublish,
        currentTransport
      );

      return handler(args as PresentationUnpublishInput, auth);
    }
  );

  // ─── Phase 3: AI Generation ──────────────────────────────────
  // TODO: Import and register presentation_generate

  console.error('[MCP] Presentation plugin: 10 tools registered (2 read, 8 mutation)');
}

// Self-register as a plugin
registerToolPlugin({
  name: 'presentation',
  register: registerPresentationTools,
});

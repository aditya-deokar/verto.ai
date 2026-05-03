/**
 * MCP Resource — verto://presentations
 *
 * Read-only listing of all presentations owned by the authenticated user.
 * Returns metadata only (no slide content) for LLM context efficiency.
 *
 * NOTE: MCP resources don't have per-request auth context.
 * This resource queries using the session-level auth (from transport init).
 * For now, it returns an instructional message when auth is unavailable.
 */

import { registerResourcePlugin } from './registry';
import { RESOURCE_URIS } from '../config/constants';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

function registerPresentationsResource(server: McpServer): void {
  server.resource(
    'presentations',
    RESOURCE_URIS.PRESENTATIONS,
    {
      description:
        'List of all presentations owned by the authenticated user with metadata (no slide content). Use the presentation_list tool for paginated access with filtering.',
      mimeType: 'application/json',
    },
    async (_uri) => {
      // Resources don't receive auth context in MCP protocol.
      // Return a guidance message directing agents to use the tool instead.
      return {
        contents: [
          {
            uri: RESOURCE_URIS.PRESENTATIONS,
            mimeType: 'application/json',
            text: JSON.stringify({
              message:
                'Use the presentation_list tool to retrieve your presentations with pagination and filtering support.',
              usage: {
                tool: 'presentation_list',
                example_args: { limit: 20, sort_by: 'updated_at', sort_order: 'desc' },
              },
            }),
          },
        ],
      };
    }
  );
}

// Self-register
registerResourcePlugin({
  name: 'presentations',
  register: registerPresentationsResource,
});

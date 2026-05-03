/**
 * MCP Transport — stdio Entry Point
 *
 * Standalone entry point for stdio-based MCP clients.
 * Run with: npx tsx src/mcp/transport/stdio.ts
 *
 * Used by:
 * - Claude Desktop
 * - Claude Code
 * - Cursor
 * - Windsurf
 * - Any MCP client that supports stdio transport
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer } from '../server';
import { registerAllTools } from '../tools/registry';
import { registerAllResources } from '../resources/registry';

// Import tool/resource plugins to trigger self-registration
import '../tools/presentation/index';
import '../resources/presentations';
import '../resources/templates';
import '../resources/themes';

async function main(): Promise<void> {
  console.error('─────────────────────────────────────────────');
  console.error('  Verto AI MCP Server (stdio transport)');
  console.error('─────────────────────────────────────────────');

  // 1. Create server
  const server = createMcpServer();

  // 2. Register all tools and resources
  registerAllTools(server);
  registerAllResources(server);

  // 3. Connect stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[MCP] ✓ Server connected via stdio transport');
  console.error('[MCP] Ready to accept requests');
}

main().catch((error) => {
  console.error('[MCP] Fatal error during startup:', error);
  process.exit(1);
});

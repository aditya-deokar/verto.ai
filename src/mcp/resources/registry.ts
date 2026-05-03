/**
 * MCP Resource Registry
 *
 * Central registration point for all MCP resources.
 * Resources are read-only data sources that provide context to LLMs.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export interface ResourcePlugin {
  /** Human-readable name for logging */
  name: string;
  /** Registration function that adds resources to the server */
  register: (server: McpServer) => void;
}

const plugins: ResourcePlugin[] = [];

/**
 * Register a resource plugin.
 */
export function registerResourcePlugin(plugin: ResourcePlugin): void {
  plugins.push(plugin);
}

/**
 * Register all resource plugins with the MCP server.
 * Called once during server initialization.
 */
export function registerAllResources(server: McpServer): void {
  for (const plugin of plugins) {
    plugin.register(server);
    console.error(`[MCP] ✓ Registered resource plugin: ${plugin.name}`);
  }

  console.error(`[MCP] Total resource plugins registered: ${plugins.length}`);
}

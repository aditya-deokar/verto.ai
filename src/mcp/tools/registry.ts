/**
 * MCP Tool Registry — Plugin Pattern
 *
 * Tool domains register themselves as plugins.
 * New domains (e.g., templates, mobile designs) can be added
 * by creating a new folder and calling registerToolPlugin().
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export interface ToolPlugin {
  /** Human-readable name for logging */
  name: string;
  /** Registration function that adds tools to the server */
  register: (server: McpServer) => void;
}

const plugins: ToolPlugin[] = [];

/**
 * Register a tool plugin. Call this from each domain's index.ts.
 * Plugins are registered in the order they are imported.
 */
export function registerToolPlugin(plugin: ToolPlugin): void {
  plugins.push(plugin);
}

/**
 * Register all tool plugins with the MCP server.
 * Called once during server initialization.
 */
export function registerAllTools(server: McpServer): void {
  for (const plugin of plugins) {
    plugin.register(server);
    console.error(`[MCP] ✓ Registered tool plugin: ${plugin.name}`);
  }

  console.error(`[MCP] Total tool plugins registered: ${plugins.length}`);
}

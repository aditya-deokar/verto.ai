/**
 * MCP Module — Public Entry Point
 *
 * Re-exports the key factories for external consumption.
 * Import from '@/mcp' to access the server and registries.
 */

export { createMcpServer } from './server';
export { registerAllTools } from './tools/registry';
export { registerAllResources } from './resources/registry';
export type { AuthContext, UserTier } from './auth/types';
export type { McpToolResponse } from './tools/_shared/response';
export type { ToolHandler } from './middleware/error-handler';

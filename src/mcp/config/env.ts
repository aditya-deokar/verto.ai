/**
 * MCP Server Environment Configuration
 *
 * Zod-validated environment variables for the MCP server.
 * Fails fast with descriptive errors on startup if config is invalid.
 */

import { z } from 'zod';
import { MCP_SERVER_NAME, MCP_SERVER_VERSION } from './constants';

const mcpEnvSchema = z.object({
  // ─── MCP Server Config ─────────────────────────────────────
  MCP_SERVER_NAME: z.string().default(MCP_SERVER_NAME),
  MCP_SERVER_VERSION: z.string().default(MCP_SERVER_VERSION),

  // ─── Authentication ────────────────────────────────────────
  /** Bcrypt hash of the MCP API key (for stdio transport auth) */
  VERTO_MCP_API_KEY_HASH: z.string().optional(),
  /** Clerk secret key — already present in the existing .env */
  CLERK_SECRET_KEY: z.string().optional(),

  // ─── Rate Limiting ─────────────────────────────────────────
  MCP_RATE_LIMIT_RPM: z.coerce.number().int().positive().default(120),
  MCP_RATE_LIMIT_CONCURRENT: z.coerce.number().int().positive().default(10),

  // ─── Database ──────────────────────────────────────────────
  /** PostgreSQL connection string — already present in the existing .env */
  DATABASE_URL: z.string().min(1),

  // ─── Application ───────────────────────────────────────────
  /** Base URL for generating share links */
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default('http://localhost:3000'),
});

export type McpEnv = z.infer<typeof mcpEnvSchema>;

/** Cached environment after first validation */
let _cachedEnv: McpEnv | null = null;

/**
 * Validate and return MCP environment configuration.
 * Caches the result after first successful validation.
 * Throws with formatted error details if validation fails.
 */
export function validateMcpEnv(): McpEnv {
  if (_cachedEnv) return _cachedEnv;

  const result = mcpEnvSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    console.error(`\n❌ MCP Server: Invalid environment configuration\n${formatted}\n`);
    throw new Error('MCP environment validation failed. See above for details.');
  }

  _cachedEnv = result.data;
  return _cachedEnv;
}

/** Reset cached env (useful for testing) */
export function resetMcpEnvCache(): void {
  _cachedEnv = null;
}

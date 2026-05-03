/**
 * MCP Middleware — Error Handler
 *
 * Global error boundary that wraps every tool handler.
 * Catches unhandled exceptions, logs them, and returns sanitized errors.
 */

import type { McpToolResponse } from '../tools/_shared/response';
import { Errors } from '../tools/_shared/errors';
import { logAuditEntry, createTimer, createTraceId } from './audit-logger';
import type { AuthContext } from '../auth/types';
import type { TransportType } from '../auth/middleware';

/**
 * Tool handler function signature.
 */
export type ToolHandler<TArgs = Record<string, unknown>> = (
  args: TArgs,
  auth: AuthContext
) => Promise<McpToolResponse>;

/**
 * Wrap a tool handler with error boundary + audit logging.
 *
 * Usage:
 *   const safeHandler = withErrorBoundary('presentation_list', handler, 'http');
 */
export function withErrorBoundary<TArgs = Record<string, unknown>>(
  toolName: string,
  handler: ToolHandler<TArgs>,
  transport: TransportType
): (args: TArgs, auth: AuthContext) => Promise<McpToolResponse> {
  return async (args: TArgs, auth: AuthContext): Promise<McpToolResponse> => {
    const timer = createTimer();
    const traceId = createTraceId();

    try {
      const result = await handler(args, auth);

      logAuditEntry({
        timestamp: new Date().toISOString(),
        trace_id: traceId,
        user_id: auth.userId,
        tool_name: toolName,
        status: result.isError ? 'error' : 'success',
        latency_ms: timer(),
        transport,
      });

      return result;
    } catch (error) {
      const latencyMs = timer();

      console.error(`[MCP] Unhandled error in ${toolName}:`, error);

      logAuditEntry({
        timestamp: new Date().toISOString(),
        trace_id: traceId,
        user_id: auth.userId,
        tool_name: toolName,
        status: 'error',
        latency_ms: latencyMs,
        transport,
        error_code: 'INTERNAL_ERROR',
      });

      return Errors.internal();
    }
  };
}

/**
 * MCP Middleware — Audit Logger
 *
 * Structured logging for every MCP tool invocation.
 * All logs go to stderr (stdout is reserved for MCP protocol in stdio transport).
 */

import { randomUUID } from 'crypto';

export interface AuditLogEntry {
  timestamp: string;
  trace_id: string;
  user_id: string;
  tool_name: string;
  status: 'success' | 'error';
  latency_ms: number;
  transport: 'stdio' | 'http';
  error_code?: string;
}

/**
 * Create a new trace ID for request correlation.
 */
export function createTraceId(): string {
  return randomUUID();
}

/**
 * Log an audit entry as structured JSON to stderr.
 */
export function logAuditEntry(entry: AuditLogEntry): void {
  const log = {
    level: entry.status === 'error' ? 'error' : 'info',
    component: 'mcp',
    event: 'tool_invocation',
    ...entry,
  };

  console.error(JSON.stringify(log));
}

/**
 * Measure execution time helper.
 */
export function createTimer(): () => number {
  const start = performance.now();
  return () => Math.round(performance.now() - start);
}

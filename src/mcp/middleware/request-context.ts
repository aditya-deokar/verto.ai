import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import type { ServerNotification, ServerRequest } from '@modelcontextprotocol/sdk/types.js';
import type { TransportType } from '../auth/middleware';

export type McpRequestExtra = RequestHandlerExtra<ServerRequest, ServerNotification>;

export interface McpRequestContext {
  transport: TransportType;
  traceId?: string;
  sessionId?: string;
  requestId?: string;
  clientInfo?: string;
  headers?: Record<string, string | undefined>;
  requestSizeBytes?: number;
}

export function getHeadersFromExtra(
  extra?: McpRequestExtra
): Record<string, string | undefined> | undefined {
  const headers = extra?.requestInfo?.headers;
  if (!headers) {
    return undefined;
  }

  const record: Record<string, string | undefined> = {};

  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }

  for (const [key, value] of Object.entries(headers)) {
    record[key] = Array.isArray(value) ? value.join(', ') : value;
  }

  return record;
}

export function getClientInfoFromHeaders(
  headers?: Record<string, string | undefined>
): string | undefined {
  return (
    headers?.['x-mcp-client-info'] ??
    headers?.['x-client-info'] ??
    headers?.['user-agent'] ??
    headers?.['User-Agent']
  );
}

export function createRequestContext(
  transport: TransportType,
  extra?: McpRequestExtra,
  args?: unknown
): McpRequestContext {
  const headers = getHeadersFromExtra(extra);
  const requestId =
    extra?.requestId === undefined || extra.requestId === null
      ? undefined
      : String(extra.requestId);

  return {
    transport,
    sessionId: extra?.sessionId,
    requestId,
    headers,
    clientInfo: getClientInfoFromHeaders(headers),
    requestSizeBytes:
      args === undefined ? 0 : Buffer.byteLength(JSON.stringify(args), 'utf8'),
  };
}

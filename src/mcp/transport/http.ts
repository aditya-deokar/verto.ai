/**
 * MCP Transport — Streamable HTTP (Next.js API Route)
 *
 * Handles MCP protocol over HTTP for remote/production clients.
 *
 * The SDK v1 StreamableHTTPServerTransport expects Node.js http module
 * objects (IncomingMessage, ServerResponse). Since Next.js App Router
 * uses Web standard Request/Response, we bridge the gap by using
 * a lightweight Node.js HTTP server internally for protocol handling.
 *
 * Endpoint: POST /api/mcp  (JSON-RPC messages)
 *           DELETE /api/mcp (session termination)
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
import { createMcpServer } from '../server';
import { registerAllTools } from '../tools/registry';
import { registerAllResources } from '../resources/registry';

// Import tool/resource plugins to trigger self-registration
import '../tools/presentation/index';
import '../resources/presentations';
import '../resources/templates';
import '../resources/themes';

/**
 * In-memory session store for HTTP transport.
 * Maps session IDs to transport instances.
 *
 * TODO (Phase 4): Replace with Redis for multi-instance deployments.
 */
const sessions = new Map<string, StreamableHTTPServerTransport>();

/** Lazy-initialized server singleton */
let _server: McpServer | null = null;

function getServer(): McpServer {
  if (!_server) {
    _server = createMcpServer();
    registerAllTools(_server);
    registerAllResources(_server);
    console.error('[MCP] ✓ HTTP server initialized');
  }
  return _server;
}

/**
 * Convert a Web API Request to Node.js IncomingMessage.
 */
async function webRequestToNodeRequest(request: Request): Promise<{
  req: IncomingMessage & { auth?: AuthInfo };
  body: unknown;
}> {
  const url = new URL(request.url);
  const body = request.method !== 'GET' && request.method !== 'HEAD'
    ? await request.json().catch(() => undefined)
    : undefined;

  // Create a fake IncomingMessage
  const socket = new Socket();
  const req = new IncomingMessage(socket) as IncomingMessage & { auth?: AuthInfo };
  req.method = request.method;
  req.url = url.pathname + url.search;

  // Copy headers
  request.headers.forEach((value, key) => {
    req.headers[key.toLowerCase()] = value;
  });

  return { req, body };
}

/**
 * Capture Node.js ServerResponse as a Web API Response.
 */
function captureNodeResponse(): {
  res: ServerResponse;
  getResponse: () => Promise<Response>;
} {
  const socket = new Socket();
  const req = new IncomingMessage(socket);
  const res = new ServerResponse(req);

  let resolvePromise: (value: Response) => void;
  const responsePromise = new Promise<Response>((resolve) => {
    resolvePromise = resolve;
  });

  // Buffer the response data
  const chunks: Buffer[] = [];

  // Override write methods to capture data
  const origWrite = res.write.bind(res);
  const origEnd = res.end.bind(res);

  res.write = function (chunk: unknown, ...args: unknown[]): boolean {
    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
    }
    return origWrite(chunk, ...args as [BufferEncoding, (() => void)?]);
  } as typeof res.write;

  res.end = function (chunk?: unknown, ...args: unknown[]): ServerResponse {
    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
    }

    const headers = new Headers();
    const rawHeaders = res.getHeaders();
    for (const [key, value] of Object.entries(rawHeaders)) {
      if (value !== undefined) {
        headers.set(key, Array.isArray(value) ? value.join(', ') : String(value));
      }
    }

    const body = Buffer.concat(chunks);
    resolvePromise!(
      new Response(body.length > 0 ? body : null, {
        status: res.statusCode,
        headers,
      })
    );

    return origEnd(...args as [(() => void)?]) as ServerResponse;
  } as typeof res.end;

  return { res, getResponse: () => responsePromise };
}

/**
 * Handle POST requests — JSON-RPC messages from MCP clients.
 */
export async function handlePost(request: Request): Promise<Response> {
  try {
    const sessionId = request.headers.get('mcp-session-id');
    let transport: StreamableHTTPServerTransport;

    if (sessionId && sessions.has(sessionId)) {
      transport = sessions.get(sessionId)!;
    } else {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => crypto.randomUUID(),
      });

      const server = getServer();
      await server.connect(transport);

      const newSessionId = transport.sessionId;
      if (newSessionId) {
        sessions.set(newSessionId, transport);
      }
    }

    const { req, body } = await webRequestToNodeRequest(request);
    const { res, getResponse } = captureNodeResponse();

    await transport.handleRequest(req, res, body);

    return await getResponse();
  } catch (error) {
    console.error('[MCP HTTP] Error handling POST:', error);
    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Handle GET requests — SSE event stream for server-initiated notifications.
 */
export async function handleGet(request: Request): Promise<Response> {
  const sessionId = request.headers.get('mcp-session-id');

  if (!sessionId || !sessions.has(sessionId)) {
    return new Response(
      JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'No active session. Send a POST first.' },
        id: null,
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const transport = sessions.get(sessionId)!;
  const { req } = await webRequestToNodeRequest(request);
  const { res, getResponse } = captureNodeResponse();

  await transport.handleRequest(req, res);

  return await getResponse();
}

/**
 * Handle DELETE requests — session termination.
 */
export async function handleDelete(_request: Request): Promise<Response> {
  const sessionId = _request.headers.get('mcp-session-id');

  if (sessionId && sessions.has(sessionId)) {
    const transport = sessions.get(sessionId)!;
    await transport.close();
    sessions.delete(sessionId);
  }

  return new Response(null, { status: 204 });
}

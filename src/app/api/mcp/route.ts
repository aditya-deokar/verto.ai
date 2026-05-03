/**
 * MCP API Route — Next.js App Router Handler
 *
 * Endpoint: /api/mcp
 *
 * Exposes the Verto AI MCP server via Streamable HTTP transport.
 * Supports POST (JSON-RPC), GET (SSE), and DELETE (session cleanup).
 *
 * This route is added to Clerk's public route matcher since
 * MCP auth is handled internally (API key or Clerk session).
 */

import { handlePost, handleGet, handleDelete } from '@/mcp/transport/http';

export async function POST(request: Request): Promise<Response> {
  return handlePost(request);
}

export async function GET(request: Request): Promise<Response> {
  return handleGet(request);
}

export async function DELETE(request: Request): Promise<Response> {
  return handleDelete(request);
}

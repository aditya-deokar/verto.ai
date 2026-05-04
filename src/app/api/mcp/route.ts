/**
 * MCP API Route - Next.js App Router Handler
 */

import {
  handlePost,
  handleGet,
  handleDelete,
  handleOptions,
} from '@/mcp/transport/http';

export async function POST(request: Request): Promise<Response> {
  return handlePost(request);
}

export async function GET(request: Request): Promise<Response> {
  return handleGet(request);
}

export async function DELETE(request: Request): Promise<Response> {
  return handleDelete(request);
}

export async function OPTIONS(request: Request): Promise<Response> {
  return handleOptions(request);
}

import { headers } from 'next/headers';

async function getBaseUrl(): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') ?? 'localhost:3000';
  const protocol = host.startsWith('localhost') || host.startsWith('127.0.0.1')
    ? 'http'
    : 'https';

  return `${protocol}://${host}`;
}

export async function GET(): Promise<Response> {
  const baseUrl = await getBaseUrl();

  return Response.json({
    resource: `${baseUrl}/api/mcp`,
    bearer_methods_supported: ['header'],
    resource_name: 'Verto AI MCP Server',
    resource_documentation: `${baseUrl}/docs/mcp/04-usage-guide`,
  });
}

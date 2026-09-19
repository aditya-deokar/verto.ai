/**
 * Minimal MCP Apps host, used by scripts/mcp-apps/basic-host-smoke.mjs.
 *
 * This is the other half of a widget: a real `AppBridge` speaking the real
 * `ui/*` protocol over postMessage to a real iframe, backed by a real MCP
 * client and server. Nothing about the handshake is faked, so a widget that
 * works here works against a conforming host.
 *
 * The server is a stub: every tool records its arguments and returns a canned
 * result. That is what lets the harness assert what a button actually did,
 * rather than asserting that the source mentions a tool name.
 */

import { AppBridge, PostMessageTransport } from '@modelcontextprotocol/ext-apps/app-bridge';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

interface ToolCallRecord {
  name: string;
  arguments: Record<string, unknown>;
  /** True when the host refused the call because the tool is not app-visible. */
  refused?: boolean;
}

interface HostHarness {
  mount(
    widgetHtml: string,
    toolResult: unknown,
    options?: { theme?: 'light' | 'dark'; appVisibleTools?: string[] }
  ): Promise<void>;
  /** Tool calls the widget made through the bridge, oldest first. */
  toolCalls(): ToolCallRecord[];
  /** Follow-up messages the widget asked the host to post to the model. */
  messages(): string[];
  /** Links the widget asked the host to open. */
  links(): string[];
  /** Queues the result the stub server returns for the next call to `name`. */
  stubTool(name: string, result: unknown): void;
  /** Makes the stub server fail the next call to `name`. */
  failTool(name: string, message: string): void;
  reset(): void;
}

declare global {
  interface Window {
    __VERTO_HOST__: HostHarness;
  }
}

const toolCalls: ToolCallRecord[] = [];
const messages: string[] = [];
const links: string[] = [];
const stubbedResults = new Map<string, unknown>();
const failures = new Map<string, string>();

/**
 * Tools the server declared `visibility: ['model','app']` (or `['app']`).
 *
 * SEP-1865 leaves this gate to the host: `AppBridge` proxies whatever the
 * app asks for, and the host is what refuses a tool the app may not see. The
 * harness enforces it here so a widget calling a model-only tool fails the
 * same way it would in ChatGPT or Claude, rather than quietly succeeding.
 */
let appVisibleTools: Set<string> | null = null;

/** Default structured result: enough shape for the widgets' parsers. */
function defaultResult(name: string, args: Record<string, unknown>): unknown {
  return {
    success: true,
    tool: name,
    echo: args,
  };
}

const server = new Server(
  { name: 'verto-stub', version: '0.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [] }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const name = request.params.name;
  const args = (request.params.arguments ?? {}) as Record<string, unknown>;

  const record: ToolCallRecord = { name, arguments: args };
  toolCalls.push(record);

  if (appVisibleTools && !appVisibleTools.has(name)) {
    record.refused = true;
    return {
      isError: true,
      content: [{
        type: 'text' as const,
        text: `Host refused: tool "${name}" is not visible to apps.`,
      }],
    };
  }

  const failure = failures.get(name);
  if (failure !== undefined) {
    failures.delete(name);
    return {
      isError: true,
      content: [{ type: 'text' as const, text: failure }],
    };
  }

  const structured = stubbedResults.has(name)
    ? stubbedResults.get(name)
    : defaultResult(name, args);

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(structured) }],
    structuredContent: structured as Record<string, unknown>,
  };
});

let bridge: AppBridge | null = null;

async function mount(
  widgetHtml: string,
  toolResult: unknown,
  options: { theme?: 'light' | 'dark'; appVisibleTools?: string[] } = {}
): Promise<void> {
  appVisibleTools = options.appVisibleTools ? new Set(options.appVisibleTools) : null;
  document.body.innerHTML = '<iframe id="widget" style="width:1100px;height:900px;border:0"></iframe>';

  const client = new Client({ name: 'verto-basic-host', version: '0.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);

  bridge = new AppBridge(
    client,
    { name: 'verto-basic-host', version: '0.0.0' },
    { openLinks: {}, serverTools: {}, logging: {}, updateModelContext: {} }
  );

  bridge.onmessage = async (params) => {
    for (const block of params.content ?? []) {
      if (block.type === 'text') messages.push(block.text);
    }
    return {};
  };

  bridge.onopenlink = async (params) => {
    links.push(params.url);
    return {};
  };

  const iframe = document.getElementById('widget') as HTMLIFrameElement;

  const ready = new Promise<void>((resolve) => {
    bridge!.oninitialized = () => resolve();
  });

  // The widget sends `ui/initialize` the moment its script runs, and
  // postMessage into a window nobody is listening on is simply dropped. So the
  // host has to be listening before the document exists: the iframe starts on
  // about:blank, the bridge connects to that same WindowProxy, and only then
  // does the widget load into it.
  const transport = new PostMessageTransport(iframe.contentWindow!, iframe.contentWindow!);
  await bridge.connect(transport);

  iframe.srcdoc = widgetHtml;
  await ready;

  bridge.setHostContext({
    theme: options.theme ?? 'light',
    platform: 'web',
    deviceCapabilities: { touch: false, hover: true },
    availableDisplayModes: ['inline', 'fullscreen'],
  });

  await bridge.sendToolResult({
    structuredContent: toolResult as Record<string, unknown>,
    content: [{ type: 'text', text: JSON.stringify(toolResult) }],
  });
}

window.__VERTO_HOST__ = {
  mount,
  toolCalls: () => toolCalls.slice(),
  messages: () => messages.slice(),
  links: () => links.slice(),
  stubTool: (name, result) => stubbedResults.set(name, result),
  failTool: (name, message) => failures.set(name, message),
  reset: () => {
    toolCalls.length = 0;
    messages.length = 0;
    links.length = 0;
    stubbedResults.clear();
    failures.clear();
  },
};

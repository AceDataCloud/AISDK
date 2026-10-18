import { createMCPClient } from '@ai-sdk/mcp';

/** Connect only to a fixed Ace service endpoint; tool definitions come from MCP. */
export async function connectService(service, options = {}, clientFactory = createMCPClient) {
  const apiKey = options.apiKey ?? process.env.ACEDATACLOUD_API_KEY;
  if (!apiKey?.trim()) throw new Error('Set a server-side Ace application API key.');
  if (apiKey !== apiKey.trim() || apiKey.startsWith('Bearer ')) {
    throw new Error('Pass the raw API key without whitespace or a Bearer prefix.');
  }
  const mode = options.mode ?? 'read-only';
  if (!['read-only', 'generate'].includes(mode)) throw new Error('Unknown tool mode.');
  if (mode === 'generate' && typeof options.authorize !== 'function') {
    throw new Error('Generation requires an application-controlled authorize callback.');
  }
  const allowed = [...service.readTools, ...(mode === 'generate' ? service.writeTools : [])];
  const requested = options.tools ?? allowed;
  if (requested.length === 0 || requested.some(name => !allowed.includes(name))) {
    throw new Error('Requested tool is outside this service and mode allowlist.');
  }
  const client = await clientFactory({
    transport: {
      type: 'http', url: service.endpoint,
      headers: { Authorization: `Bearer ${apiKey}` },
    },
  });
  try {
    const discovered = await client.tools();
    const missing = requested.filter(name => !discovered[name]);
    if (missing.length) throw new Error(`MCP tool contract changed: missing ${missing.join(', ')}`);
    let closed = false;
    const tools = Object.fromEntries(requested.map(name => {
      const original = discovered[name];
      const billable = service.writeTools.includes(name);
      return [name, {
        ...original,
        metadata: { ...original.metadata, acedatacloud: { service: service.id, billable } },
        execute: async (input, executionOptions) => {
          if (closed) throw new Error('This tool connection is closed.');
          if (billable && service.id === 'gpt-image' &&
              (typeof input?.model !== 'string' || !input.model.startsWith('gpt-image-'))) {
            throw new Error('Select an explicit public gpt-image-* model for GPT Image tools.');
          }
          if (billable && await options.authorize({ service: service.id, toolName: name, input }) !== true) {
            throw new Error('Generation was not authorized by the application.');
          }
          // Never retry an ambiguous paid submission; preserve the MCP result/task handle.
          return original.execute(input, executionOptions);
        },
      }];
    }));
    return {
      tools,
      service: service.id,
      close: async () => { if (!closed) { closed = true; await client.close(); } },
    };
  } catch (error) {
    await client.close();
    throw error;
  }
}

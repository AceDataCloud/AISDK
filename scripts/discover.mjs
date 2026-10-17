// Free protocol discovery only: initialize/tools/list, never tools/call.
import { createMCPClient } from '@ai-sdk/mcp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const services = JSON.parse(await readFile(new URL('../services.json', import.meta.url), 'utf8'));
const results = [];
for (const service of services) {
  let client;
  try {
    client = await createMCPClient({ transport: { type: 'http', url: service.endpoint, ...(process.env.ACEDATACLOUD_API_KEY ? { headers: { Authorization: `Bearer ${process.env.ACEDATACLOUD_API_KEY}` } } : {}) } });
    const tools = await client.tools();
    const required = [...service.readTools, ...service.writeTools];
    const missing = required.filter(name => !tools[name]);
    results.push({ service: service.id, endpoint: service.endpoint,
      status: missing.length ? 'CONTRACT_DRIFT' : 'PASS', missing,
      matched: required.filter(name => tools[name]), totalDiscovered: Object.keys(tools).length });
  } catch (error) {
    results.push({ service: service.id, endpoint: service.endpoint, status: 'BLOCKED', error: error.message });
  } finally { await client?.close(); }
}
const report = { asOf: new Date().toISOString(), operations: ['initialize', 'tools/list'],
  toolCalls: 0, paidRequests: 0, results };
await mkdir('artifacts', { recursive: true });
await writeFile('artifacts/discovery.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));

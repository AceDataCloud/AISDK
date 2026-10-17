import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { connectService } from '../shared/connector.js';
import { generateText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { z } from 'zod';

const services = JSON.parse(readFileSync(new URL('../services.json', import.meta.url)));
function fixture(service) {
  const calls = [];
  let closed = 0;
  let config;
  const definitions = Object.fromEntries([...service.readTools, ...service.writeTools, 'unrelated_admin_tool'].map(name => [name, {
    description: name, inputSchema: z.object({ prompt: z.string().optional(), task_id: z.string().optional() }),
    execute: async input => { calls.push({ name, input }); return { task_id: 'original-task', state: 'pending' }; },
  }]));
  const client = { tools: async () => definitions, close: async () => { closed++; } };
  return { calls, definitions, factory: async c => { config = c; return client; }, get config() { return config; }, get closed() { return closed; } };
}
for (const service of services) {
  test(`${service.name}: fixed endpoint, raw token, read-only default and task handle`, async () => {
    const f = fixture(service);
    const c = await connectService(service, { apiKey: 'fixture-key' }, f.factory);
    assert.deepEqual(Object.keys(c.tools), service.readTools);
    assert.equal(f.config.transport.url, service.endpoint);
    assert.equal(f.config.transport.headers.Authorization, 'Bearer fixture-key');
    const result = await c.tools[service.readTools[0]].execute({ task_id: 'original-task' }, {});
    assert.equal(result.task_id, 'original-task');
    assert.equal(result.state, 'pending');
    await c.close(); await c.close(); assert.equal(f.closed, 1);
    await assert.rejects(c.tools[service.readTools[0]].execute({}, {}), /closed/);
  });
  test(`${service.name}: paid tool blocked unless callback accepts this call`, async () => {
    const f = fixture(service); const name = service.writeTools[0];
    await assert.rejects(connectService(service, { apiKey: 'fixture-key', mode: 'generate' }, f.factory), /authorize/);
    const c = await connectService(service, { apiKey: 'fixture-key', mode: 'generate', authorize: () => false }, f.factory);
    const input = { prompt: 'x', ...(service.id === 'gpt-image' ? { model: 'gpt-image-1' } : {}) };
    await assert.rejects(c.tools[name].execute(input, {}), /not authorized/);
    assert.equal(f.calls.length, 0); await c.close();
    const c2 = await connectService(service, { apiKey: 'fixture-key', mode: 'generate', authorize: ({toolName}) => toolName === name }, f.factory);
    assert.deepEqual(await c2.tools[name].execute(input, {}), { task_id: 'original-task', state: 'pending' });
    assert.equal(f.calls.length, 1); await c2.close();
  });
  test(`${service.name}: fail closed on missing tool or foreign tool`, async () => {
    const f=fixture(service); delete f.definitions[service.readTools[0]];
    await assert.rejects(connectService(service, { apiKey: 'fixture-key' }, f.factory), /contract changed/);
    assert.equal(f.closed, 1);
    await assert.rejects(connectService(service, { apiKey: 'fixture-key', tools: ['unrelated_admin_tool'] }, f.factory), /allowlist/);
    await assert.rejects(connectService(service, { apiKey: 'Bearer fixture-key' }, f.factory), /raw API key/);
  });
}
test('AI SDK executes a selected service tool and sends its task handle back to the model', async () => {
  const service=services[0], f=fixture(service), name=service.writeTools[0]; let requests=0;
  const c=await connectService(service,{apiKey:'fixture-key',mode:'generate',authorize:()=>true},f.factory);
  const model=createOpenAICompatible({name:'fixture',baseURL:'https://fixture.invalid/v1',apiKey:'fixture',fetch:async (url,init)=>{
    requests++;const body=JSON.parse(init.body);const common={id:'fixture',model:'fixture',object:'chat.completion',created:1,usage:{prompt_tokens:12,completion_tokens:3,total_tokens:15}};
    if(requests===1) return Response.json({...common,choices:[{index:0,finish_reason:'tool_calls',message:{role:'assistant',content:null,tool_calls:[{id:'call',type:'function',function:{name,arguments:'{"prompt":"fixture"}'}}]}}]});
    const reply=body.messages.find(m=>m.role==='tool');assert.match(reply.content,/original-task/);assert.match(reply.content,/pending/);
    return Response.json({...common,choices:[{index:0,finish_reason:'stop',message:{role:'assistant',content:'Task original-task is pending.'}}]});
  }}).chatModel('fixture');
  const {stepCountIs}=await import('ai');
  const result=await generateText({model,tools:c.tools,prompt:'fixture',stopWhen:stepCountIs(2),maxRetries:0});
  assert.equal(result.text,'Task original-task is pending.');assert.equal(f.calls.length,1);assert.equal(requests,2);await c.close();
});
test('GPT Image cannot route a media request to another model family', async () => {
  const service=services.find(s=>s.id==='gpt-image'); const f=fixture(service);
  const c=await connectService(service,{apiKey:'fixture-key',mode:'generate',authorize:()=>true},f.factory);
  for (const model of [undefined,'nano-banana','gpt-4o']) {
    await assert.rejects(c.tools.openai_generate_image.execute({prompt:'x',model},{}),/gpt-image/);
  }
  assert.equal(f.calls.length,0);await c.close();
});

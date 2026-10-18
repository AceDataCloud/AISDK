// Exercise the real installed MCP SDK conversion; no HTTP or paid request.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createMCPClient } from '@ai-sdk/mcp';

test('current MCP SDK supports call options, raw errors and explicit zero retries', async () => {
  let transport;
  const calls=[];
  transport={
    start: async()=>{},
    close: async()=>{transport.onclose?.();},
    send: async message=>{
      if(!('id' in message))return;
      let result;
      if(message.method==='initialize') result={protocolVersion:'2025-03-26',capabilities:{tools:{}},serverInfo:{name:'local-fixture',version:'1'}};
      else if(message.method==='tools/list') result={tools:[{name:'task_lookup',description:'Local fixture only',inputSchema:{type:'object',properties:{task_id:{type:'string'}},required:['task_id']}}]};
      else if(message.method==='tools/call') { calls.push(message.params);result={isError:true,content:[{type:'text',text:'fixture 403'}]}; }
      else throw new Error('Unexpected method '+message.method);
      queueMicrotask(()=>transport.onmessage({jsonrpc:'2.0',id:message.id,result}));
    },
  };
  const client=await createMCPClient({transport,maxRetries:0,protocolVersionDiscovery:false});
  try {
    const tools=await client.tools();
    // Explicit options are used by our wrapper; undefined is also supported in current SDK.
    const result=await tools.task_lookup.execute({task_id:'saved-id'},{});
    assert.equal(result.isError,true);assert.equal(result.content[0].text,'fixture 403');
    assert.deepEqual(calls,[{name:'task_lookup',arguments:{task_id:'saved-id'}}]);
    assert.equal(typeof tools.task_lookup.toModelOutput,'function');
  } finally { await client.close(); }
});

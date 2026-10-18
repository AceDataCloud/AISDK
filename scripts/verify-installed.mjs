// Imports independent packages, connects and lists allowlisted tools; never executes them.
import { createSunoTools } from '@acedatacloud/ai-sdk-suno';
import { createSeedanceTools } from '@acedatacloud/ai-sdk-seedance';
import { createHappyHorseTools } from '@acedatacloud/ai-sdk-happyhorse';
import { createGPTImageTools } from '@acedatacloud/ai-sdk-gpt-image';
import { createNanoBananaTools } from '@acedatacloud/ai-sdk-nano-banana';
import { mkdir, writeFile } from 'node:fs/promises';
const results=[];
for(const factory of [createSunoTools,createSeedanceTools,createHappyHorseTools,createGPTImageTools,createNanoBananaTools]){
  const connection=await factory();
  try { results.push({service:connection.service,tools:Object.keys(connection.tools),status:'PASS'}); }
  finally { await connection.close(); }
}
const report={asOf:new Date().toISOString(),results,toolCalls:0,paidRequests:0};
await mkdir('artifacts',{recursive:true});
await writeFile('artifacts/installed-connectors.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));

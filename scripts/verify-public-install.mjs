// Public npm installation and integrity readback, no secrets/MCP/model calls.
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
const slugs=['suno','seedance','happyhorse','gpt-image','nano-banana'];
const dir=mkdtempSync(join(tmpdir(),'ace-public-install-'));
writeFileSync(join(dir,'package.json'),'{"private":true,"type":"module"}\n');
execFileSync('npm',['install','--ignore-scripts','--no-audit','--no-fund','--registry=https://registry.npmjs.org',...slugs.map(s=>'@acedatacloud/ai-sdk-'+s+'@0.1.0'),'ai@7.0.143','zod@4.1.8'],{cwd:dir,stdio:'inherit'});
const lock=JSON.parse(readFileSync(join(dir,'package-lock.json')));
const packages=[];
for(const slug of slugs){
 const name='@acedatacloud/ai-sdk-'+slug;
 const info=JSON.parse(execFileSync('npm',['view',name+'@0.1.0','version','dist.integrity','dist.tarball','--registry=https://registry.npmjs.org','--json'],{encoding:'utf8'}));
 const installed=lock.packages['node_modules/'+name];
 if(info.version!=='0.1.0'||installed.version!=='0.1.0'||info['dist.integrity']!==installed.integrity)throw new Error('Public package integrity mismatch');
 packages.push({name,version:info.version,integrity:installed.integrity,tarball:info['dist.tarball']});
}
execFileSync(process.execPath,['--input-type=module','-e',`import assert from 'node:assert/strict';
for(const slug of ${JSON.stringify(slugs)}){const m=await import('@acedatacloud/ai-sdk-'+slug);assert.equal(Object.keys(m).length,1);assert.equal(typeof Object.values(m)[0],'function');}
console.log('All five public npm package imports passed; no connections or tool calls.');`],{cwd:dir,stdio:'inherit'});
mkdirSync('artifacts',{recursive:true});
writeFileSync('artifacts/public-install.json',JSON.stringify({asOf:new Date().toISOString(),packages,source:'official registry ordinary install, no scripts',status:'PASS',toolCalls:0,paidRequests:0},null,2)+'\n');

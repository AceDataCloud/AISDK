import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

for(const mode of ['processing','already-accepted','mismatch']){
  test(`publisher ${mode}: no repeated accepted write and exact integrity`,()=>{
    const dir=mkdtempSync(join(tmpdir(),'ace-publish-state-'));
    for(const sub of ['bin','package','archives'])mkdirSync(join(dir,sub));
    writeFileSync(join(dir,'package/package.json'),JSON.stringify({name:'@acedatacloud/ai-sdk-gpt-image',version:'0.1.0'}));
    const tar=join(dir,'archives/fixture.tgz');execFileSync('tar',['-czf',tar,'-C',dir,'package']);
    const integrity='sha512-'+createHash('sha512').update(readFileSync(tar)).digest('base64');
    writeFileSync(join(dir,'bin/npm'),`#!${process.execPath}\n`+String.raw`
      const fs=require('node:fs');const args=process.argv.slice(2);
      const file=process.env.STATE;const s=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):{reads:0,writes:0};
      if(args[0]==='publish'){s.writes++;fs.writeFileSync(file,JSON.stringify(s));process.exit(0);}
      s.reads++;fs.writeFileSync(file,JSON.stringify(s));
      if(process.env.MODE==='mismatch'){console.log(JSON.stringify({version:'0.1.0','dist.integrity':'sha512-other'}));process.exit(0);}
      if(s.reads<=2){console.log(JSON.stringify({error:{code:'E404'}}));process.exit(1);}
      console.log(JSON.stringify({version:'0.1.0','dist.integrity':process.env.INTEGRITY}));
    `,{mode:0o755});
    writeFileSync(join(dir,'clock.mjs'),'globalThis.setTimeout = callback => { queueMicrotask(callback); return 0; };');
    const r=spawnSync(process.execPath,['--import',join(dir,'clock.mjs'),resolve('scripts/publish-artifacts.mjs'),'archives'],{
      cwd:dir,encoding:'utf8',timeout:10000,env:{...process.env,PATH:join(dir,'bin')+':'+process.env.PATH,STATE:join(dir,'npm-state.json'),MODE:mode,INTEGRITY:integrity,NPM_ALREADY_ACCEPTED:mode==='already-accepted'?'gpt-image':''},
    });
    const state=JSON.parse(readFileSync(join(dir,'npm-state.json')));
    assert.equal(state.writes,mode==='processing'?1:0,r.stderr);
    if(mode==='mismatch'){assert.notEqual(r.status,0);assert.match(r.stderr,/integrity differs/);}
    else {assert.equal(r.status,0,r.stderr);const report=JSON.parse(readFileSync(join(dir,'publication-state.json')));assert.equal(report.states[0].status,'PUBLIC_VERIFIED');}
  });
}

// Only trusted main + existing publisher token. Never republish an accepted version.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
const dir=process.argv[2]??'packages';
const accepted=new Set((process.env.NPM_ALREADY_ACCEPTED??'').split(',').map(x=>x.trim()).filter(Boolean));
const allowed=['suno','seedance','happyhorse','gpt-image','nano-banana'];
if([...accepted].some(x=>!allowed.includes(x)))throw new Error('Unknown previously accepted package');
const states=[];
const save=()=>writeFileSync('publication-state.json',JSON.stringify({asOf:new Date().toISOString(),publisher:process.env.NPM_PUBLISHER??'verified-by-whoami',states},null,2)+'\n');
function lookup(name){
  const r=spawnSync('npm',['view',`${name}@0.1.0`,'version','dist.integrity','--registry=https://registry.npmjs.org','--json','--fetch-retries=0','--fetch-timeout=15000'],{encoding:'utf8'});
  let d;try{d=JSON.parse(r.stdout);}catch{return {error:'INVALID_RESPONSE'};}
  if(r.status===0)return {version:d.version,integrity:d['dist.integrity']};
  return {error:d.error?.code??'LOOKUP_FAILED'};
}
function check(state,found){
  if(found.error)return false;
  if(found.version!=='0.1.0'||found.integrity!==state.integrity)throw new Error(`Existing ${state.name} version/integrity differs; no overwrite`);
  state.status='PUBLIC_VERIFIED';state.registry=found;save();return true;
}
for(const file of readdirSync(dir).filter(x=>x.endsWith('.tgz')).sort()){
  const path=resolve(dir,file);
  const manifest=JSON.parse(execFileSync('tar',['-xOf',path,'package/package.json'],{encoding:'utf8'}));
  const match=/^@acedatacloud\/ai-sdk-(suno|seedance|happyhorse|gpt-image|nano-banana)$/.exec(manifest.name);
  if(!match||manifest.version!=='0.1.0')throw new Error('Unexpected package identity');
  const state={name:manifest.name,version:manifest.version,slug:match[1],integrity:'sha512-'+createHash('sha512').update(readFileSync(path)).digest('base64'),status:'NOT_SUBMITTED'};
  states.push(state);save();
  const found=lookup(manifest.name);
  if(check(state,found))continue;
  if(found.error!=='E404')throw new Error(`Registry ${found.error}; no new publication for ${manifest.name}`);
  if(accepted.has(match[1])){
    state.status='ACCEPTED_PENDING_PUBLIC';state.note='Previous run returned npm publish success; no republish';save();continue;
  }
  const r=spawnSync('npm',['publish',path,'--access','public','--provenance','--ignore-scripts','--registry=https://registry.npmjs.org','--fetch-retries=0','--fetch-timeout=15000'],{stdio:'inherit'});
  if(r.status!==0){state.status='SUBMISSION_RESULT_UNCERTAIN';save();throw new Error(`Inspect ${manifest.name} before any retry`);}
  state.status='ACCEPTED_PENDING_PUBLIC';state.acceptedAt=new Date().toISOString();save();
  check(state,lookup(manifest.name));
}
// New npm packages can remain 404 while processing. Recheck reads only, never publish twice.
for(let attempt=0;attempt<12 && states.some(x=>x.status!=='PUBLIC_VERIFIED');attempt++){
  await new Promise(resolve=>setTimeout(resolve,10000));
  for(const state of states.filter(x=>x.status!=='PUBLIC_VERIFIED'))check(state,lookup(state.name));
}
save();
console.log(JSON.stringify(states,null,2));
if(states.some(x=>x.status!=='PUBLIC_VERIFIED'))process.exitCode=2;

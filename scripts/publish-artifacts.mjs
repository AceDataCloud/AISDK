// Run only in the manually authorized release job with an existing publisher token.
import { readdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
const dir=process.argv[2]??'packages';
for(const file of readdirSync(dir).filter(name=>name.endsWith('.tgz')).sort()){
  const path=`${dir}/${file}`;
  const manifest=JSON.parse(execFileSync('tar',['-xOf',path,'package/package.json'],{encoding:'utf8'}));
  if(!/^@acedatacloud\/ai-sdk-(suno|seedance|happyhorse|gpt-image|nano-banana)$/.test(manifest.name)||manifest.version!=='0.1.0'){
    throw new Error('Unexpected release package identity');
  }
  const view=spawnSync('npm',['view',`${manifest.name}@${manifest.version}`,'version','dist.integrity','--registry=https://registry.npmjs.org','--json','--fetch-retries=0','--fetch-timeout=15000'],{encoding:'utf8'});
  if(view.status===0){
    const existing=JSON.parse(view.stdout);
    const integrity='sha512-'+createHash('sha512').update(readFileSync(path)).digest('base64');
    if(existing.version!==manifest.version||existing['dist.integrity']!==integrity)throw new Error('Existing version differs; never overwrite a release');
    console.log(`${manifest.name}@${manifest.version} already exists; no republish`);continue;
  }
  let response;
  try{response=JSON.parse(view.stdout);}catch{throw new Error(`Registry lookup failed before ${manifest.name}; no publish attempted`);}
  if(response.error?.code!=='E404')throw new Error(`Registry lookup ${response.error?.code}; no publish attempted`);
  const result=spawnSync('npm',['publish',path,'--access','public','--provenance','--ignore-scripts','--registry=https://registry.npmjs.org','--fetch-retries=0','--fetch-timeout=15000'],{stdio:'inherit'});
  if(result.status!==0)throw new Error(`Publication failed for ${manifest.name}; inspect registry before retry`);
  const version=execFileSync('npm',['view',`${manifest.name}@${manifest.version}`,'version','dist.integrity','--registry=https://registry.npmjs.org','--json'],{encoding:'utf8'});
  const published=JSON.parse(version);
  const integrity='sha512-'+createHash('sha512').update(readFileSync(path)).digest('base64');
  if(published.version!==manifest.version||published['dist.integrity']!==integrity)throw new Error('Published version/integrity readback mismatch');
}

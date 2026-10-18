import { readFileSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const services=JSON.parse(readFileSync(new URL('../services.json',import.meta.url)));
mkdirSync('artifacts/packs',{recursive:true});
for(const s of services){
  const p=JSON.parse(readFileSync(`packages/${s.id}/package.json`));
  const r=spawnSync('npm',['pack','--ignore-scripts','--json','--pack-destination','artifacts/packs',`./packages/${s.id}`],{encoding:'utf8'});
  if(r.status!==0)throw new Error(r.stderr);
  const [pack]=JSON.parse(r.stdout);
  const names=pack.files.map(f=>f.path);
  for(const required of ['dist/index.js','dist/index.d.ts','dist/connector.js','README.md','README_zh-CN.md','LICENSE']){
    if(!names.includes(required))throw new Error(`${p.name} missing ${required}`);
  }
  if(names.some(n=>n.includes('.env')||n.includes('test')||n.includes('artifacts')))throw new Error('Unexpected package file');
  console.log(`${p.name}: ${pack.filename}, ${names.length} files, integrity ${pack.integrity}`);
}

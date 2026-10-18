import { mkdir, readFile, writeFile, cp } from 'node:fs/promises';
import { marked } from 'marked';
const services = JSON.parse(await readFile('services.json','utf8'));
await mkdir('_site',{recursive:true});
await cp('docs/assets','_site/assets',{recursive:true});
const html = (title, content) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>body{font:16px/1.65 system-ui;margin:2rem auto;max-width:960px;padding:0 1rem;color:#17212d}pre{overflow:auto;background:#f2f5f8;padding:1rem}img{max-width:100%;height:auto}table{border-collapse:collapse}td,th{border:1px solid #ccd4dd;padding:.5rem}a{color:#086eaa}aside{background:#fff5dc;padding:1rem}</style></head><body><nav><a href="./index.html">AI SDK tools by Ace Data Cloud</a></nav><aside>Official Ace integration documentation. Registry approval and actual generation are separate validation stages; this documentation is not a product execution screenshot.</aside>${content}</body></html>`;
for(const s of services){
  for(const [file,slug] of [['README.md',s.id],['README_zh-CN.md',s.id+'-zh']]){
    let md=await readFile(`packages/${s.id}/${file}`,'utf8');
    md=md.replaceAll('README_zh-CN.md',s.id+'-zh.html').replaceAll('README.md',s.id+'.html');
    await writeFile(`_site/${slug}.html`,html(s.name+' by Ace Data Cloud',marked.parse(md)));
  }
}
const list=services.map(s=>`<li><a href="${s.id}.html">${s.name} by Ace Data Cloud</a> · <a href="${s.id}-zh.html">中文</a></li>`).join('');
await writeFile('_site/index.html',html('Ace Data Cloud AI SDK integrations',`<h1>Independent AI SDK media tools</h1><p>Connect the service you need with an independently installable package and your Ace application API key.</p><ul>${list}</ul><p><a href="https://github.com/AceDataCloud/AISDK/releases/tag/v0.1.0">v0.1.0 release and checksums</a> · <a href="https://github.com/AceDataCloud/AISDK">Source and release status</a></p>`));

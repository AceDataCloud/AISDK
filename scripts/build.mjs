import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
const services = JSON.parse(await readFile(new URL('../services.json', import.meta.url), 'utf8'));
for (const service of services) {
  const dir = new URL(`../packages/${service.id}/dist/`, import.meta.url);
  await mkdir(dir, { recursive: true });
  await copyFile(new URL('../shared/connector.js', import.meta.url), new URL('connector.js', dir));
  await writeFile(new URL('index.js', dir), `import { connectService } from './connector.js';\nconst service = ${JSON.stringify(service)};\nexport const ${service.factory} = options => connectService(service, options);\n`);
  const types = await readFile(new URL('../shared/index.d.ts', import.meta.url), 'utf8');
  await writeFile(new URL('index.d.ts', dir), types + `\nexport declare function ${service.factory}(options?: AceMediaOptions): Promise<AceMediaConnection>;\n`);
}

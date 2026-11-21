# ACE Music tools for the Vercel AI SDK

Use the ACE Music hosted MCP server to write songs and lyrics, upload MP3 references, make covers, blend two tracks, and look up the original task in an AI SDK application.

Build and package from this checkout with Node.js 22 or later:

```sh
npm ci
npm run build
npm pack ./packages/acemusic
```

Install the resulting tarball alongside `ai` and `zod`. Keep your [application API key](https://platform.acedata.cloud/console/applications) on the server as `ACEDATACLOUD_API_KEY`.

```js
import { createAceMusicTools } from '@acedatacloud/ai-sdk-acemusic';

const connection = await createAceMusicTools();
try {
  console.log(Object.keys(connection.tools));
} finally {
  await connection.close();
}
```

The default connection exposes five read-only tools. To expose the six billable tools use `mode: 'generate'` and supply an application-controlled `authorize` callback that checks the individual tool and arguments. Keep the original task ID and query it until terminal. [Tool catalog](https://acemusic.mcp.acedata.cloud/.well-known/mcp/server-card.json) · [API guide](https://platform.acedata.cloud/documents/acemusic)

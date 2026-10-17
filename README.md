# Ace Data Cloud tools for Vercel AI SDK

Five independently installable, service-branded AI SDK tool packages, backed by existing Ace hosted MCP services. Default read-only tools, explicit application approval for paid generation, preserved async task handles and no automatic paid retries.

| Service | Package | Integration guide |
| --- | --- | --- |
| Suno by Ace Data Cloud | `@acedatacloud/ai-sdk-suno` | [English](packages/suno/README.md) · [中文](packages/suno/README_zh-CN.md) |
| Seedance by Ace Data Cloud | `@acedatacloud/ai-sdk-seedance` | [English](packages/seedance/README.md) · [中文](packages/seedance/README_zh-CN.md) |
| HappyHorse by Ace Data Cloud | `@acedatacloud/ai-sdk-happyhorse` | [English](packages/happyhorse/README.md) · [中文](packages/happyhorse/README_zh-CN.md) |
| GPT Image by Ace Data Cloud | `@acedatacloud/ai-sdk-gpt-image` | [English](packages/gpt-image/README.md) · [中文](packages/gpt-image/README_zh-CN.md) |
| Nano Banana by Ace Data Cloud | `@acedatacloud/ai-sdk-nano-banana` | [English](packages/nano-banana/README.md) · [中文](packages/nano-banana/README_zh-CN.md) |

## Status

Initial source PR/release candidate; no official registry listing or new paid generation is claimed. Each npm package is separate; one repository/shared connector avoids duplicate protocol code. AI SDK's official Tools Registry requires npm publication, current SDK testing and an integration-specific guide before submission. This repository is not a Vercel first-party provider or AI Gateway listing.

## Development

```bash
npm ci --ignore-scripts
npm run build
npm test
npm run check
# Optional hosted discovery; only initialize/tools/list, no tools/call:
npm run verify:discovery
```

Core service implementation stays in [MCPs](https://github.com/AceDataCloud/MCPs). Images and task/price contracts are documented per service. Never commit `.env` or print credentials. Only publish reviewed artifacts; source PR merge, npm publication, registry review, normal installation and a real task/bill are independent stages.

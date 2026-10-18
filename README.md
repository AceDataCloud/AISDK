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

Source PR #1 is merged. Independent v0.1.0 GitHub release artifacts are being prepared; npm publication and official Tools Registry listing are separate stages. No new paid generation is claimed. Each npm package is separate; one repository/shared connector avoids duplicate protocol code. AI SDK's official Tools Registry requires npm publication, current SDK testing and an integration-specific guide before submission. This repository is not a Vercel first-party provider or AI Gateway listing.

## Development

```bash
npm ci --ignore-scripts
npm run build
npm test
npm run check
npm run verify:packages
# Optional hosted discovery; only initialize/tools/list, no tools/call:
npm run verify:discovery
```

Core service implementation stays in [MCPs](https://github.com/AceDataCloud/MCPs). Images and task/price contracts are documented per service. Never commit `.env` or print credentials. Only publish reviewed artifacts; source PR merge, npm publication, registry review, normal installation and a real task/bill are independent stages.

Hosted verification on 2026-10-18: all five package entry points connected with an existing application key and exposed the expected read-only tool subset. Only initialization/discovery ran; no tools/call or paid generation. See [evidence](docs/evidence/installed-connectors-20261018.json). Five packed tarballs also installed/imported in a clean npm project.

## Release validation

The manually dispatched Release validation workflow checks current AI SDK 7.0.143 / MCP 2.0.78 / compatible 3.0.71 against the connector-relevant protocol behavior and type surface, then packs the five artifacts. Optional npm publication uses only an already available repository/org `NPM_TOKEN`; it does not create tokens, change scope membership, or grant permissions. Default is validation only. Network and identity failures are recorded separately.

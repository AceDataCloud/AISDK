# HappyHorse by Ace Data Cloud：AI SDK 工具

这是 Ace Data Cloud 维护的 HappyHorse 接入，不冒充模型原厂或 Vercel 官方。独立包 `@acedatacloud/ai-sdk-happyhorse` 复用现有托管 MCP；目标是进入 [AI SDK Tools Registry](https://ai-sdk.dev/resources/tools)，**0.1.0 已发布npm并核对integrity，官方工具目录尚未收录**。

1. 直接安装 `npm install @acedatacloud/ai-sdk-happyhorse ai@^7 zod@^4`（Node ≥22）。npm与GitHub正式包已发布，官方Tools Registry收录及收费生成另行验收。
2. 打开 [Ace Applications](https://platform.acedata.cloud/console/applications?utm_source=vercel_ai_sdk&utm_medium=integration&utm_campaign=evergreen&utm_content=happyhorse_zh_api_key)，注册或登录，找到 General application；没有则 Initialize General Application。复制 API Key，或 Keys / Manage Keys → Create 单独命名 Key，核有效期、用量限制、Allowed APIs、服务权限和余额。[当前价格](https://platform.acedata.cloud/models?utm_source=vercel_ai_sdk&utm_medium=integration&utm_campaign=evergreen&utm_content=happyhorse_zh_pricing)。
3. 将原始 token 放服务器 `ACEDATACLOUD_API_KEY`，不是浏览器，不带 Bearer 前缀；账户管理 token 不适用。调用 `createHappyHorseTools()` 得到默认只读工具，不会自动生成。
4. 应用完成用户确认后才启用 `mode:'generate'` 和逐调用 `authorize` 回调，再把 `connection.tools` 交给模型。保存 create 返回的原 task ID，用 `happyhorse_get_task` 查询至终态；超时不重复提交。最终媒体由应用自己的图片/音频/视频组件展示。

![Applications 获取 Key](https://raw.githubusercontent.com/AceDataCloud/SunoDify/8d3d03570e73324220f111f7fe343da0792a8071/_assets/tutorial/get-api-key-en.png)
![创建独立 Key](https://raw.githubusercontent.com/AceDataCloud/SunoDify/8d3d03570e73324220f111f7fe343da0792a8071/_assets/tutorial/create-api-key-en.png)

图为既有 SunoDify Ace 控制台原图，2026-10-18 复用，来源 commit 8d3d035；不是 AI SDK 新增 UI。完整 TypeScript 示例、工具名单和错误处理见 [英文说明](README.md)。401 核 Key/权限，429 保留限流含义，pending 继续查同一任务；工具目录能加载不证明余额或收费生成成功。Token/用量不是美元账单，按当前套餐换算并核使用历史。本轮仅免费协议验证与工具发现，没有新付费生成。

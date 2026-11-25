# Vercel AI SDK 的 ACE Music 工具

在仓库根目录用 Node.js 22+ 运行 `npm ci`、`npm run build` 和 `npm pack ./packages/acemusic`。在应用中安装生成的包和 `ai`、`zod`，将[应用密钥](https://platform.acedata.cloud/console/applications)保存在服务端的 `ACEDATACLOUD_API_KEY`。

调用 `createAceMusicTools()` 可以查询模型、能力和已有任务。应用选择 `mode: 'generate'` 并通过 `authorize` 确认具体请求后，可以创作歌曲和歌词、上传参考、翻唱或双轨融合。保存首次返回的任务 ID，使用同一 ID 查询到终态，再关闭连接。完整示例见 [README](README.md)。

# 应用目录素材

[应用图标素材](/app-assets)以真实图片统一预览桌面目录使用的素材，同时展示原项目资源、候选图和来源记录。它使用外链媒体元数据，不改变 `packages/icons/svg` 的 canonical SVG、IconifyJSON、UnoCSS 图标名或 npm 图标导出。

## 一份元数据，独立的媒体频道

权威清单是 `assets/catalog/app-assets.json`，文档构建把同一份文件发布到 [/app-assets/manifest.json](/app-assets/manifest.json)。构建不下载图片，不读取另一个仓库，不存入 PNG / WebP 二进制，也不将 raster 图片包装成 SVG 或 base64。

```json
{
  "schemaVersion": 1,
  "assets": [
    {
      "slug": "cook",
      "desktopAsset": {
        "kind": "official",
        "version": "v2",
        "usage": "desktop-selected",
        "thumbnail": { "url": "固定公共 HTTPS WebP", "width": 256, "height": 256, "mime": "image/webp", "bytes": 7344, "sha256": "存储对象哈希" },
        "master": { "url": "固定公共 HTTPS PNG", "width": 1024, "height": 1024, "mime": "image/png", "bytes": 0, "sha256": "存储对象哈希" },
        "source": { "repository": "YunYouJun/cook", "path": "public/brand/cook-app-icon.svg", "commit": "源码提交", "sha256": "原文件哈希" }
      },
      "applicationIdentity": { "status": "formal_app_icon", "notes": "已核实的来源说明" },
      "websitePublication": { "status": "verified-resource" },
      "candidates": []
    }
  ]
}
```

上述是字段说明，完整有效值以下载清单为准。所有资产都有名称、说明和检索标签。`desktopAsset.thumbnail` 是消费者同步桌面固定 URL 的入口；候选或旧图不能被同步工具当作当前默认。PNG 主图与 WebP 都记录固定对象 URL、尺寸、MIME、字节数与 SHA-256。

## 明确区分三件事

- **桌面采用**：`desktopAsset.usage = desktop-selected` 表示当前目录选择，`kind` 区分正式来源和生成素材。当前 28 项默认包含 17 个正式来源与 11 个生成桌面变体。
- **应用身份**：`applicationIdentity` 记录正式图标、专属 mark、选用标记、旧图待确认、通用 favicon、框架默认或第三方品牌。空目录 logo 不等于应用原来没有图标。
- **网站发布**：`websitePublication` 的 `verified-resource` 仅表示指定公开资源已核实；`declared-only` 表示站点声明可见但图片访问未确认；`unverified` 表示本目录未核实。Git source commit 不代表线上部署 commit。

16 个新生成素材均保持候选品牌身份。5 个应用已有明确正式图标，桌面优先使用正式来源的 v2 导出，其 v1 新图保留在 `candidates` 作对照。其余 11 个生成图可作为桌面目录变体，不自动替换应用网站 favicon 或原生图标。

`previousIcon` 保留可追溯的原项目图片或站点旧图。旧图访问失败时页面显示提示和来源链接，不用另一个未知图片代替。Explosions 的框架默认图标和 WC GitHub Corners 的第三方 favicon 可推荐以后建立独立品牌；本次没有执行网站品牌发布。

## 维护与验证

新版本使用新 COS 对象路径；不覆盖已声明 immutable 的旧资源。仅在来源和采用状态核实后更新默认 `desktopAsset`，其余版本作为明确的候选保留。不要记录本机路径、临时下载 token、凭据或签名 URL。

WebP 缩略图按原始存储对象校验。COS 对 PNG 的匿名读取可能经过 imageSlim，导致响应字节与上传对象不同；PNG SHA-256 指向存储对象，不能用经过转换的响应宣称字节一致。

页面提供 32px、56px、128px 和无遮罩 / 圆角预览。显示的是静态缩略图，不代表已完成 Apple Icon Composer 原生分层交付。已有产品的原生原稿归档流程继续独立维护。

本地验收运行 `pnpm test`、`pnpm lint`、`pnpm typecheck` 与 `pnpm docs:build`。单元检查离线验证 slug、固定公共 HTTPS、版本、尺寸、MIME、哈希、采用 / 候选状态；组件检查搜索、筛选、尺寸和图片失败处理。媒体可达性与实际外观在浏览器中单独检查。

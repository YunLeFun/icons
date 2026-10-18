# App 原稿与平台资源

`YunLeFun/icons` 同时管理两类来源：

| 类型 | 规范来源 | 消费方式 |
| --- | --- | --- |
| SVG 主体与完整图标 | `packages/icons/svg` + `metadata.json` | `@yunlefun/icons`、Iconify、UnoCSS |
| PNG 插画与 Apple `.icon` 原稿 | `assets/apps/<product>/<version>` + `manifest.json` | 显式同步固定版本，在应用内导出平台资源 |

完整插画保留原始文件格式。原生资源清单不参与 SVG 构建，也不作为 Iconify 图标名称发布。

## 暴力电驴 v2

当前归档包含珊瑚红电驴、金色闪电和青色速度线的原图、1024 px 方形主图、生成提示词，以及单图层 Icon Composer 项目。原稿位于 `assets/apps/dayun-kicker/v2`，来源为 `YunLeFun/dayun-kicker` 中已确认的图标设计。

在游戏仓库运行：

```sh
pnpm icons:sync --source /path/to/YunLeFun/icons
pnpm icons:check
pnpm icons:export
```

同步会验证清单与 SHA-256，再更新游戏内的原稿副本；导出使用游戏内的固定副本。普通构建和 CI 不依赖中心仓库的 checkout。`icons:export` 需要安装 Xcode 26 或更新版本的 macOS；Windows / Linux 直接消费已保存的平台产物。

中心原稿统一管理视觉与 Composer 设置，消费项目保存 ICNS、Dock PNG、iOS Asset Catalog 与 Web 图标。版本变更时一起更新清单、副本和导出产物，以便定位发布所使用的原稿。

## 云生 v4

云生采用晴空蓝底板、白云与明黄星星，接触处加入浅蓝柔影。完整应用图标和独立 Logo 已进入目录，可搜索「云生」「yunsheng」「life」：

| 用途 | Iconify | UnoCSS |
| --- | --- | --- |
| 轻阴影应用图标 | `ylf:life-app-icon` | `i-ylf-life-app-icon` |
| 平面独立 Logo | `ylf:life-mark` | `i-ylf-life-mark` |

<div style="display:flex;gap:32px;align-items:center;margin:24px 0">
  <span class="i-ylf-life-app-icon" style="font-size:96px" role="img" aria-label="云生轻阴影应用图标" />
  <span class="i-ylf-life-mark" style="font-size:96px" role="img" aria-label="云生平面独立 Logo" />
</div>

中心原稿位于 `assets/apps/life/v4`，包含 1024 px 静态 PNG、可编辑 SVG、`currentColor` 单色版、分层 `.icon` 项目和 SHA-256 清单。单色版随原稿保存，不扩展集合的 `mark` / `app-icon` 两种变体。

消费仓库为 `YunYouJun/life`。清单中的 `AppIcon.icon/` 对应消费仓库的 `apple/Life/Resources/AppIcon.icon/`，其余生产输入对应 `assets/brand/`；两边保留相同的 `manifest.json`。iOS、Android 和 Web 消费已导出的本地资源。

## 添加产品

在 `assets/apps` 建立产品 / 版本目录，记录文件 SHA-256、生成或设计来源、消费者及导出方式。提供可编辑的 SVG 前景后，再按照[贡献图标](contributing.md)接入 SVG 集合，保持显式的 `-mark` / `-app-icon` 变体。

未来 GZA /《广州行动》的主图标在品牌切换阶段另行确认；本归档中的 v2 继续对应《暴力电驴》。

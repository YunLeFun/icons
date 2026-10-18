# App 原稿归档

本目录集中管理 PNG 插画与 Apple Icon Composer 等 App 原稿。SVG / Iconify 集合继续使用 `packages/icons/svg`；原生资源按产品和版本保存，不进入 `@yunlefun/icons` 的 SVG 构建。

## 当前资源

| 产品 | 版本 | 资源清单 | 消费项目 |
| --- | --- | --- | --- |
| 暴力电驴 / Dayun Kicker | v2 | [manifest.json](dayun-kicker/v2/manifest.json) | [YunLeFun/dayun-kicker](https://github.com/YunLeFun/dayun-kicker) |
| 云生 / Yunsheng | v4 | [manifest.json](life/v4/manifest.json) | [YunYouJun/life](https://github.com/YunYouJun/life) |

`dayun-kicker/v2` 保存生成原图、1024 px sRGB 方形主图、提示词和 `DayunKicker.icon`。它是一个完整插画图层，尚未拆分出透明前景 mark；未来 GZA 图标另行设计。

`life/v4` 保存轻阴影云星应用图标、平面独立 Logo、单色版、可编辑白云柔影图层和双层 `AppIcon.icon`。对应 SVG 集合中的 `life-app-icon` / `life-mark`，详见[云生原稿说明](life/v4/README.md)。

## 维护与消费

1. 在这里更新原稿、Composer 布局及生成说明。替换视觉版本时建立新版本目录，保留已发布版本。
2. 在 `manifest.json` 记录产品、版本、原稿来源、目录和每个文件的 SHA-256；清单中的 `files` 只列可同步的生产输入。
3. 在消费项目显式同步固定版本，再执行平台导出。当前游戏提供 `pnpm icons:sync --source /path/to/icons`。
4. 提交消费项目内的清单、副本和平台导出，让 CI 与离线打包独立完成；普通构建不读取其他 checkout，也不请求远端资源。

暴力电驴的同步命令复制清单列出的五个输入文件，并在写入前验证全部哈希。游戏仓库的 `pnpm icons:check` 检查本地副本，`pnpm icons:check --source /path/to/icons` 额外检查与中心原稿的一致性。

macOS ICNS、Dock PNG、iOS Asset Catalog 和 Web 小尺寸图标由游戏内 `pnpm icons:export` 生成，随应用一起维护。新增可编辑 SVG 主体时，再按[贡献规范](../../docs/guide/contributing.md)提供 `-mark` / `-app-icon` 两种变体及 provenance。

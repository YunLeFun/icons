# 云生 · 轻阴影云星 v4

云朵托起一颗星，收藏人生的闪光时刻。设计来自 `YunYouJun/life/assets/brand`，采用 YunLeFun Design 的晴空蓝 `#2563EB`、明黄 `#FACC15` 和云白 `#FFFFFF`。

| 文件 | 用途 |
| --- | --- |
| `life-app-icon.svg` | 带局部浅蓝接触柔影的无遮罩方形应用图标 |
| `life-app-icon-1024.png` | 1024 × 1024、sRGB、不透明静态输出 |
| `life-mark.svg` | 蓝云黄星的透明平面 Logo |
| `life-mark-mono.svg` | 相同轮廓的 `currentColor` 平面单色版 |
| `life-cloud-shadow.svg` | 白云与柔影的可编辑透明图层 |
| `AppIcon.icon` | 星星 SVG + 白云 PNG 的原生分层项目 |
| `manifest.json` | 生产输入的 SHA-256 清单 |

阴影只作用于云面：品牌蓝 18% 不透明度、下移 0.55、模糊标准差 0.65，使用 64 × 64 参考网格。星星的 Composer 系统投影关闭，避免重复叠加；其余平台外观由 Apple 渲染。白云 SVG 通过 Resvg 导出 1024 px 透明 sRGB PNG，再供 Composer 使用。

SVG 集合提供 `ylf:life-app-icon` 和 `ylf:life-mark`；图标目录可按「云生」「yunsheng」「life」检索。单色版随原稿归档，不增加第三种 Iconify 变体。

消费仓库中，`AppIcon.icon/` 映射到 `apple/Life/Resources/AppIcon.icon/`，其余生产文件映射到 `assets/brand/`。`assets/brand/manifest.json` 保存同一份清单。消费项目据此导出 iOS Asset Catalog、Android 启动图标及 Web favicon；普通构建读取本地副本。

更新时同时维护 SVG 集合、此目录的生产输入和清单，并同步消费项目副本。前一版平面构图保存在消费项目的 `assets/brand/archive/cloud-star-v3/`。

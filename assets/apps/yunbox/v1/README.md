# 云匣 · 三角圆点收纳匣 v1

白色匣盖与匣身收纳品牌标志的 ▲●，▲ 朝上表示 push。设计来自 `YunLeFun/yunbox/assets/brand`，采用晴空蓝渐变 `#55AAFF → #2563EB` 和云白 `#FFFFFF`，使用 64 × 64 参考网格。

| 文件 | 用途 |
| --- | --- |
| `yunbox-app-icon.svg` | 无遮罩的方形应用图标，渐变底板 + 白色匣子 |
| `yunbox-mark.svg` | 晴空蓝透明平面 Logo |
| `YunBox.icon` | macOS 26 Icon Composer 分层项目 |
| `manifest.json` | 生产输入的 SHA-256 清单 |

`YunBox.icon` 按应用图标拆层：背景是自上而下的线性渐变填充，前景组包含匣盖 `lid.svg` 与匣身 `body.svg` 两个矢量图层，匣身以 evenodd 镂空 ▲ 与 ●。图层 SVG 为 1024 px 画布、`viewBox="0 0 64 64"`，几何与 `yunbox-app-icon.svg` 完全一致。前景组关闭半透明，保留默认外观中的纯白匣子；中性投影 50%。深色、Clear 与着色外观由系统根据图层自动生成。全部为矢量，无需 PNG。

只声明 macOS 平台；iOS 暂无计划。可用 Xcode 自带的 `ictool` 预览各外观：

```sh
ictool YunBox.icon --export-image --output-file dark.png --platform macOS --rendition Dark --width 1024 --height 1024 --scale 1
```

SVG 集合提供 `ylf:yunbox-app-icon` 和 `ylf:yunbox-mark`（经 SVGO 优化，路径写法不同、几何相同）。

消费仓库 `YunLeFun/yunbox` 将清单中的全部文件同步到 `assets/brand/`，并保存同一份 `manifest.json`。`script/build_and_run.sh` 用 `actool` 把 `YunBox.icon` 编译为 `Assets.car` 并写入 `CFBundleIconName`；旧系统兜底的 `AppIcon.icns` 仍由 `yunbox-app-icon.svg` 渲染。

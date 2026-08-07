# 贡献图标

图标从 SVG 源文件单向生成，不直接编辑 `icons.json`。

## 流程

1. 确认图标来自 YunLeFun 品牌或应用仓库，并找到可追溯的 SVG 源文件。
2. 应用必须同时提供 `<product>-mark` 与 `<product>-app-icon`；品牌可以只提供 `-mark`。
3. 在 `packages/icons/metadata.json` 添加变体角色、检索标签和 GitHub 源链接。派生资产必须设置 `source.sync: false` 并说明 `derivation`。
4. 新仓库需要先在 `icons.config.ts` 登记本地 checkout，然后运行 `pnpm icons:collect` 收集可直接同步的上游 SVG。
5. 运行完整校验。

```bash
pnpm build
pnpm test
pnpm lint
pnpm typecheck
pnpm docs:build
```

构建链会执行 SVG 清理与 SVGO 优化，并检查 SVG 文件和元数据是否一一对应。

`pnpm icons:collect:check` 只比较 `source.sync: true` 的子应用源文件与仓库内 SVG 快照，不写文件。派生变体由本仓库管理 canonical SVG，但仍保留上游 provenance。默认从本仓库的同级目录查找其他 YunLeFun 仓库，可通过 `YLF_REPOSITORIES_ROOT` 覆盖仓库根目录。普通构建不会访问这些仓库。

## 视觉规范

YunLeFun 图标以 Apple Human Interface Guidelines 的图标原则和官方生产模板作为视觉参考基线：

- [App icons — Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Icons — Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/icons)
- [Apple Design Resources](https://developer.apple.com/design/resources/)

Apple 的网格、居中、安全区域和光学校准原则用于指导视觉一致性，不表示 YunLeFun 图标需要复制 Apple 的平台外观。落地到本仓库时遵循以下约定：

- 规范预览以 `0 0 64 64` 作为归一化参考网格；canonical SVG 保留来源仓库的原始 viewBox，构建时不强制重绘坐标。
- 独立主体建议占画布约 80%，优先放在 `6 6 52 52` 参考区域内。
- 圆弧、尖角和视觉重量较轻的部分可以光学越界；非背景关键内容通常不超出 `4..60`。
- 背景色块可以铺满画布；不要为了模拟系统效果预先裁切圆角，最终遮罩交给使用图标的平台。
- `-mark` 的画布保持透明，不嵌入平台底板；`-app-icon` 的背景必须覆盖完整方形画布。
- `-app-icon` 不得使用透明圆角、外层 `rx` 或预烘焙的系统阴影；预览器和操作系统只应用一次遮罩。
- 按视觉重量居中，不以几何包围盒完全相同作为目标；比较时需要计入描边宽度和圆角端点。
- 至少在 16、24、32 和 64 px 下检查识别度、视觉大小与同组图标的一致性。
- 应用标记优先保持其来源仓库的品牌配色。品牌规范与参考网格冲突时，保留品牌特征并在元数据中说明例外。

## 命名

- 仅使用小写 kebab-case。
- 产品使用稳定短名加变体后缀，例如 `drive-mark`、`drive-app-icon`。
- 图标名必须严格等于 `<product>-<variant>`；当前变体仅允许 `mark` 和 `app-icon`。
- `<product>` 只作为同一产品资产的分组标识，不创建 `drive.svg` 这类无后缀 SVG，也不添加指向某个变体的 alias。
- 消费方必须根据场景显式选择变体；仓库不定义容易产生歧义的“默认图标”。
- 不为同一图形创建重复文件；多个应用共用品牌标记时使用 `brand-mark`。
- 不把来源不明或仅用于页面装饰的 SVG 收入应用图标集。

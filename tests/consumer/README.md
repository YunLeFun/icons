# 发布产物消费者验收

[本次修复前后截图与验收结果](./evidence/README.md)

```bash
pnpm install --frozen-lockfile
pnpm consumer:browser:install # 首次运行安装 Chromium；Linux CI 使用 --with-deps
pnpm consumer:check           # 构建包 → pack → 独立安装 → 类型检查 → 生产构建 → 浏览器验收
pnpm consumer:preview         # 打开生成样例的 Vite 预览地址
```

仅准备样例：`pnpm consumer:prepare`。生成项目位于 `.artifacts/consumer/project`，包含真实 `icons.tgz`、独立 `package.json` / lockfile、下载组件和四个单图标入口，可复制到仓库外运行：

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm preview
```

样例主页面比较所有图标，`/single/uno/`、`/single/iconify/`、`/single/vue/`、`/single/react/` 展示只使用 `brand-mark` 的独立生产构建。`pnpm dev` 可修改样例实时预览。每次 prepare 会重新创建这个生成目录；持久修改应放在 `fixture/` 模板中。

## 验收范围

| 路径 | 数据来源 | 验收 |
| --- | --- | --- |
| UnoCSS | 已安装 tarball 的 `icons.json`，仅在构建时读取 | 全部图标、双实例、单色/品牌色、单图标 CSS |
| Iconify Vue | 已安装 tarball 的 `icons.json`；单图标页使用 `icons/brand-mark` | 全部图标、片段引用、实例隔离、单图标模块与渲染 |
| Vue SFC / React TSX | 同一份目录下载生成器 + 已安装 tarball 的数据 | 8 枚代表图标双实例、真正编译、严格类型检查、浏览器像素与模块检查 |
| SVG / 元数据 / 单图标 JSON | 所有包导出路径 | 内容完整、名称一致、继承尺寸正确、SVG 有/无扩展名都能解析 |

组件文件是**目录下载导出**，不是凭空假设的 npm Vue/React 组件入口。`prepare.mjs` 将正式下载生成器复制进独立项目，再在那里解析包数据；生成的组件只依赖 Vue 或 React。Vue 示例采用一个小型 SFC 表格，React 通过 portals 填入对应单元格。

代表图标覆盖 `advjs-studio-app-icon`（径向/线性渐变、滤镜）、`advjs-mark` / `drive-app-icon`（渐变）、`home-mark`（遮罩）、`smap-app-icon`（描边属性）、`brand-mark` / `design-mark`（currentColor）、`go-far-away-mark`（混合配色）。当前优化后的集合没有 clipPath/use，另加一个明确标记的 **reference-probe**，覆盖裁剪、渐变继承和 href 片段引用；它不会写入发布包。

浏览器只访问本地生产构建，外部请求、JS 异常或 console 警告均使验收失败。先对两种 CSS 颜色下的渲染与独立 SVG 参考图比较，再检查文档 ID 唯一性与每个引用归属，最后修改首个实例的渐变/遮罩/裁剪，要求第二个实例像素完全不变。所有 mark 要保留透明像素，所有 app-icon 要覆盖不透明方形画布，全部图标都必须有可见像素。

像素比较在同一次 Chromium 运行内完成：每通道差异超过 20 算作差异像素，允许不足 1% 的边缘栅格化差异；实例隔离要求零差异。因此 CI 不依赖某台电脑的字体或旧截图基线。提交的截图是问题证据，不用于自动覆盖断言。

## UnoCSS 混色限制

`go-far-away-mark` 的主体使用 currentColor，细节使用固定蓝绿配色。UnoCSS 自动选择 mask 后会把全部可见内容染为 CSS color。这是 CSS 图片/遮罩的能力限制，不能同时继承外部 currentColor 并保留局部固定颜色。样例明确标注这枚图标，并用独立 alpha-mask 参考图校验其单色输出；Iconify、Vue 和 React 仍必须与原始完整配色一致。需要完整配色时使用这些组件或固定配色的 `go-far-away-app-icon`，不要依赖 `?bg` 继承外部 color。

## 按需体积

四个入口分别构建，均不加载展示页的全量 safelist。验收检查产物模块及 CSS：

- UnoCSS 只有一个图标选择器和 SVG data URI，CSS 小于 5 KB；浏览器 JS 不含图标包。
- Iconify 只保留一个 `icons/brand-mark.json`；不得出现包根集合、`icons.json` 或元数据模块。
- 下载组件只能保留 `YlfBrandMark`，不得出现其他生成组件或图标包运行时模块。
- 单图标数据/组件代码小于 5 KB，Vue/React 自身体积另计。所有单入口还必须真实渲染。

`addCollection(icons)` 与 `icons.icons[name]` 都是全量集合接口；从对象中取一项不能保证移除其余图形。按需 Iconify 用新增的单图标 JSON 入口。

## 结果与发布门禁

结果在 `.artifacts/consumer/results/`：`report.json`、`bundles.json`、`all-icons.png`、`id-isolation.png`。`report.json` 记录每个图标/路径/颜色的差异及失败；`bundles.json` 区分总产物大小和图标自身大小。

`pnpm release:preflight` 已包含本验收。CI 与 tag 发布流程都会安装 Chromium，在预检失败时阻止后续步骤，并上传验收证据。运行验收不会修改版本、提交、推送或发布。

生成的含 SVG ID 的组件需要 Vue 3.5+ 或 React 18+，通过框架 useId 保持实例独立。多个独立 Vue 应用需配置不同的 `app.config.idPrefix`，多个 React 根需配置不同的 `identifierPrefix`，SSR 时使用相同配置。参考 [Vue useId](https://vuejs.org/api/composition-api-helpers.html#useid)、[React useId](https://react.dev/reference/react/useId) 和 [UnoCSS icons](https://unocss.dev/presets/icons)。本门禁运行 Chromium，不声称覆盖所有浏览器或 SSR hydration。

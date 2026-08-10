# YunLeFun Icons

YunLeFun 品牌、官方站点、效率工具与趣味应用的统一 SVG、Iconify 和 UnoCSS 图标集。

[浏览图标目录](https://icons.yunle.fun/)

## 当前能力

- `packages/icons/svg/*.svg` 作为唯一图形源
- 应用资产显式区分 `-mark` 透明主体层和 `-app-icon` 无遮罩完整图标
- 构建时清洗 SVG 并生成 IconifyJSON 格式的 `icons.json`
- 发布包 `@yunlefun/icons` 提供图标数据、名称类型与检索元数据
- 元数据使用 `brand`、`official-site`、`utility`、`fun-app` 表达产品分类
- UnoCSS 使用 `i-ylf-<name>` 类名按需渲染
- VitePress 图标目录支持主体、完整图标和 Apple HIG 启发的平台效果分类预览
- 图标目录可复制 SVG，并下载独立 SVG、Vue SFC 与 React TSX 组件
- 每枚图标记录上游仓库与源文件路径
- 有独立站点的产品在元数据与目录卡片中提供快速跳转链接
- 图标目录显示自动同步或派生维护状态

## 设计规范

图标视觉规范以 [Apple App Icons HIG](https://developer.apple.com/design/human-interface-guidelines/app-icons)、[Apple Icons HIG](https://developer.apple.com/design/human-interface-guidelines/icons) 和 [Apple Design Resources](https://developer.apple.com/design/resources/) 作为参考基线，并在 [YunLeFun 贡献规范](./docs/guide/contributing.md#视觉规范) 中定义 `64 × 64` 归一化参考网格、安全区域、光学校准与小尺寸检查规则；canonical SVG 保留来源仓库的原始 viewBox。

### 资产分层

- `<product>-mark`：透明主体层，用于界面、导航、品牌组合，也可作为 Icon Composer 的前景输入。
- `<product>-app-icon`：背景与主体组成的满幅方形构图，不包含平台圆角，用于静态图标、营销导出和最终效果预览。

Icon Composer 的实际分层交付使用 `-mark` 前景并在 Composer 中配置背景；`-app-icon` 是无遮罩的完整参考构图，不是预裁圆角的上架文件。

所有可消费的图标名都必须显式包含变体后缀。`<product>` 只作为元数据中的产品分组标识，不代表默认图标；集合不提供 `ylf:drive` 这类无后缀名称或兼容 alias。

## 开发

```bash
pnpm install
pnpm build
pnpm test
pnpm docs:dev
```

完整校验：

```bash
pnpm build
pnpm test
pnpm lint
pnpm typecheck
pnpm docs:build
```

## UnoCSS

```ts
import { defineConfig, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetIcons({
      collections: {
        ylf: () => import('@yunlefun/icons/icons.json', { with: { type: 'json' } })
          .then(module => module.default),
      },
    }),
  ],
})
```

```html
<span class="i-ylf-play-mark" />
<span class="i-ylf-play-app-icon" />
```

## Iconify

`@yunlefun/icons/icons.json` 是标准 IconifyJSON 数据，可加载到 Iconify 运行时或其他兼容工具中：

```ts
import { addCollection } from '@iconify/vue'
import icons from '@yunlefun/icons/icons.json'

addCollection(icons)
```

图标名称使用 `ylf:<product>-<variant>`，例如 `ylf:drive-mark` 和 `ylf:drive-app-icon`。必须明确选择变体，`ylf:drive` 不是有效名称。

## 添加图标

1. 除纯品牌外的产品同时添加 `<product>-mark` 和 `<product>-app-icon`；品牌可以只提供 `-mark`。
2. 在 `packages/icons/metadata.json` 为每个资产添加变体角色、检索信息和来源；如产品有独立站点，同时添加 `website`。
3. 如果来源是新的子应用仓库，在 `icons.config.ts` 登记它的本地 checkout。
4. 运行 `pnpm icons:collect`，更新标记为 `source.sync: true` 的上游 SVG。
5. 运行 `pnpm build && pnpm test && pnpm docs:build`。

构建会拒绝无元数据 SVG、无对应 SVG 的元数据、重复名称和不符合 kebab-case 的名称。

## 同步子应用图标

`icons.config.ts` 统一维护集合信息、输入输出路径、包元数据、颜色策略与子应用仓库映射。默认假设各 YunLeFun 仓库与本仓库位于同一父目录；也可以通过 `YLF_REPOSITORIES_ROOT` 指定仓库根目录。派生变体保留上游 provenance 和派生说明，但不由收集命令直接覆盖。

```bash
pnpm icons:collect:check # 仅检查上游图标是否发生变化
pnpm icons:collect       # 更新仓库内的规范 SVG 快照
```

普通 `build` 始终只读取仓库内的 SVG，不访问网络，也不依赖其他仓库存在。

## 发布 npm

发布包使用 GitHub Actions 与 npm Trusted Publishing（OIDC），工作流不会保存长期 `NPM_TOKEN`。正式版本使用 `latest` dist-tag；`alpha`、`beta` 等预发布版本会使用对应的预发布标识作为 dist-tag。

本地准备版本：

```bash
pnpm release:preflight        # 完整校验与 pack dry-run
pnpm release                 # 交互选择版本，更新 CHANGELOG、提交并创建 tag
git push origin main --follow-tags
```

也可以明确指定版本类型，例如 `pnpm release -- --release patch`。`bumpp` 不会自动推送，只有显式推送 `v*` tag 才会触发 `.github/workflows/publish.yml`。

### 首次发布与 OIDC 初始化

npm 要求包已经存在后才能配置 Trusted Publisher。对于尚未创建的包，不要先推送发布 tag；维护者需要先在 `packages/icons` 完成一次交互式公开发布，然后使用 npm 11.15 或更新版本建立信任关系：

```bash
cd packages/icons
npm publish
npm trust github @yunlefun/icons \
  --file publish.yml \
  --repo YunLeFun/icons \
  --allow-publish
```

信任配置中的 workflow filename 必须精确填写 `publish.yml`。配置完成后，后续 tag 发布只使用 GitHub OIDC，并由 npm 自动生成 provenance。建议确认 OIDC 首次发布成功后，在 npm 包设置中禁用传统写入 token。

## License

[MIT](./LICENSE)

# YunLeFun Icons

YunLeFun 品牌与应用图标的统一 SVG、Iconify 和 UnoCSS 图标集。

[浏览图标目录](https://icons.yunle.fun/)

## 当前能力

- `packages/icons/svg/*.svg` 作为唯一图形源
- 应用资产显式区分 `-mark` 透明主体层和 `-app-icon` 无遮罩完整图标
- 构建时清洗 SVG 并生成 IconifyJSON 格式的 `icons.json`
- 发布包 `@yunlefun/icons` 提供图标数据、名称类型与检索元数据
- UnoCSS 使用 `i-ylf-<name>` 类名按需渲染
- VitePress 图标目录支持主体、完整图标和 Apple HIG 启发的平台效果分类预览
- 每枚图标记录上游仓库与源文件路径

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

1. 应用同时添加 `<product>-mark` 和 `<product>-app-icon`，品牌可以只提供 `-mark`。
2. 在 `packages/icons/metadata.json` 为每个资产添加变体角色、检索信息和来源。
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

## License

[MIT](./LICENSE)

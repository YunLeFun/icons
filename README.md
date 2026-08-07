# YunLeFun Icons

YunLeFun 品牌与应用图标的统一 SVG、Iconify 和 UnoCSS 图标集。

[浏览图标目录](https://icons.yunle.fun/)

## 当前能力

- `packages/icons/svg/*.svg` 作为唯一图形源
- 构建时清洗 SVG 并生成 IconifyJSON 格式的 `icons.json`
- 发布包 `@yunlefun/icons` 提供图标数据、名称类型与检索元数据
- UnoCSS 使用 `i-ylf-<name>` 类名按需渲染
- VitePress 图标目录支持中英文搜索、复制类名与 Iconify 名称，并提供 Apple HIG 启发的平台参考线和多尺寸预览
- 每枚图标记录上游仓库与源文件路径

## 设计规范

图标视觉规范以 [Apple App Icons HIG](https://developer.apple.com/design/human-interface-guidelines/app-icons)、[Apple Icons HIG](https://developer.apple.com/design/human-interface-guidelines/icons) 和 [Apple Design Resources](https://developer.apple.com/design/resources/) 作为参考基线，并在 [YunLeFun 贡献规范](./docs/guide/contributing.md#视觉规范) 中定义 `64 × 64` 画布、安全区域、光学校准与小尺寸检查规则。

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
<span class="i-ylf-play" />
```

## Iconify

`@yunlefun/icons/icons.json` 是标准 IconifyJSON 数据，可加载到 Iconify 运行时或其他兼容工具中：

```ts
import { addCollection } from '@iconify/vue'
import icons from '@yunlefun/icons/icons.json'

addCollection(icons)
```

图标名称使用 `ylf:<name>`，例如 `ylf:drive`。

## 添加图标

1. 在 `packages/icons/metadata.json` 添加同名元数据和来源。
2. 如果来源是新的子应用仓库，在 `icons.config.ts` 登记它的本地 checkout。
3. 运行 `pnpm icons:collect`，将子应用 SVG 规范化后收集到 `packages/icons/svg/<name>.svg`。
4. 运行 `pnpm build && pnpm test && pnpm docs:build`。

构建会拒绝无元数据 SVG、无对应 SVG 的元数据、重复名称和不符合 kebab-case 的名称。

## 同步子应用图标

`icons.config.ts` 统一维护集合信息、输入输出路径、包元数据、颜色策略与子应用仓库映射。默认假设各 YunLeFun 仓库与本仓库位于同一父目录；也可以通过 `YLF_REPOSITORIES_ROOT` 指定仓库根目录。

```bash
pnpm icons:collect:check # 仅检查上游图标是否发生变化
pnpm icons:collect       # 更新仓库内的规范 SVG 快照
```

普通 `build` 始终只读取仓库内的 SVG，不访问网络，也不依赖其他仓库存在。

## License

[MIT](./LICENSE)

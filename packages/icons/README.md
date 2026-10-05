# @yunlefun/icons

YunLeFun 品牌、官方站点、效率工具与趣味应用的 SVG、IconifyJSON 和 UnoCSS 图标集合。

```bash
pnpm add @yunlefun/icons
```

```ts
import { iconMetadata, iconNames, icons } from '@yunlefun/icons'
```

- `@yunlefun/icons/icons.json`：IconifyJSON 集合
- `@yunlefun/icons/icons/<name>`：单枚 Iconify 图标 JSON，含完整尺寸，可按需导入
- `@yunlefun/icons/metadata.json`：名称、标签、变体、独立站点和来源信息
- `@yunlefun/icons/svg/<name>.svg`：规范 SVG 文件

图标名称必须包含明确变体，例如 `ylf:drive-mark` 或 `ylf:drive-app-icon`。

按需使用 Iconify Vue：

```vue
<script setup lang="ts">
import { Icon } from '@iconify/vue'
import brandMark from '@yunlefun/icons/icons/brand-mark'
</script>

<template>
  <Icon :icon="brandMark" />
</template>
```

包根的 `icons` 和 `icons.json` 提供完整集合；从集合对象中取一项仍可能引入整套图标。UnoCSS 应在构建配置中读取集合，仅生成使用到的类名。

`go-far-away-mark` 含固定蓝绿细节和 currentColor 主体；UnoCSS 默认输出单色遮罩。需要完整配色时使用 Iconify 或图标目录下载的 Vue/React 组件。含 SVG 定义的下载组件通过 useId 隔离实例，需要 Vue 3.5+ / React 18+。

[图标目录](https://icons.yunle.fun/) · [GitHub](https://github.com/YunLeFun/icons)

## License

源代码和 SVG 文件依据 [MIT License](./LICENSE) 授权。YunLeFun、云乐坊、相关产品名称、Logo 和品牌标记的使用同时受[商标政策](./TRADEMARKS.md)约束；MIT License 不授予商标权。

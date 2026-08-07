# 接入指南

`@yunlefun/icons` 同时提供 IconifyJSON 数据、UnoCSS 外部图标包入口和带类型的元数据。

## 安装

```bash
pnpm add @yunlefun/icons
pnpm add -D unocss
```

## UnoCSS

在 `uno.config.ts` 中将包内 IconifyJSON 注册为 `ylf` 集合：

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

随后直接使用 `i-ylf-<name>`：

```html
<span class="i-ylf-brand text-6" />
<span class="i-ylf-play text-8" />
```

动态拼接类名时，需要将完整类名加入 UnoCSS `safelist`：

```ts
import { iconNames } from '@yunlefun/icons'

export default defineConfig({
  safelist: iconNames.map(name => `i-ylf-${name}`),
})
```

## Iconify

集合前缀是 `ylf`，标准名称为 `ylf:<name>`。

```ts
import { addCollection } from '@iconify/vue'
import icons from '@yunlefun/icons/icons.json'

addCollection(icons)
```

```vue
<template>
  <Icon icon="ylf:drive" />
</template>
```

## 数据接口

```ts
import {
  iconMetadata,
  iconNames,
  icons,
  prefix,
} from '@yunlefun/icons'
```

- `icons`：完整 IconifyJSON 集合。
- `iconNames`：只读图标名称数组，可用于类型约束和 safelist。
- `iconMetadata`：中英文名称、标签、样式类型与来源。
- `prefix`：固定为 `ylf`。

## 色彩行为

`brand` 是单色图标，可通过 `color` 改色。应用图标保留产品原始色板，UnoCSS 会自动使用适合多色 SVG 的背景图模式。

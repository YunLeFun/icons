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
<span class="i-ylf-brand-mark text-6" />
<span class="i-ylf-play-mark text-8" />
<span class="i-ylf-play-app-icon text-8" />
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
  <Icon icon="ylf:drive-mark" />
  <Icon icon="ylf:drive-app-icon" />
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
- `iconNames`：全部规范资产名称，可用于类型约束和 safelist；每个名称都显式包含 `-mark` 或 `-app-icon`。
- `iconMetadata`：中英文名称、标签、样式类型与来源。
- `prefix`：固定为 `ylf`。

## 色彩行为

`brand-mark` 是单色图标，可通过 `color` 改色。应用图标保留产品原始色板，UnoCSS 会自动使用适合多色 SVG 的背景图模式。

## 主体与完整图标

- `-mark` 不包含满幅底板，适合界面内容和 Icon Composer 前景层。
- `-app-icon` 包含完整方形背景，但不包含平台圆角遮罩。
- `<product>` 只用于元数据分组，不是图标名称。调用时必须明确选择变体，例如使用 `ylf:drive-mark` 或 `ylf:drive-app-icon`，不能使用 `ylf:drive`。
- 集合不提供无后缀名称，也不提供指向某个变体的兼容 alias。

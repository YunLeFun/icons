# 接入指南

`@yunlefun/icons` 同时提供 IconifyJSON 数据、UnoCSS 外部图标包入口和带类型的元数据。

## 安装

```bash
pnpm add @yunlefun/icons
pnpm add -D unocss
```

也可以直接在[图标目录](/)切换到所需主体层或完整图标，然后复制 SVG，或下载独立的 `.svg`、Vue `.vue` 与 React `.tsx` 文件。下载组件不依赖本图标包，保留规范 viewBox、品牌色与 `currentColor` 行为。

含渐变、遮罩或裁剪定义的下载组件使用框架 `useId`，重复挂载时每个实例有独立 SVG ID；需要 Vue 3.5+ / React 18+。同页多个独立应用应分别设置 Vue 的 `app.config.idPrefix` 或 React 的 `identifierPrefix`，SSR 时保持服务端和客户端配置一致。独立 SVG 适合 `<img>`；重复内联原始 SVG 时仍需自行隔离 ID。

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

按需导入单枚图标：

```vue
<script setup lang="ts">
import { Icon } from '@iconify/vue'
import driveMark from '@yunlefun/icons/icons/drive-mark'
</script>

<template>
  <Icon :icon="driveMark" />
</template>
```

需要运行时通过字符串选择整个集合时，可以使用下面的 `addCollection`。它会引入完整集合；`icons.icons[name]` 也不能保证 tree-shaking，应在体积敏感场景使用上面的单图标入口。

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
- `iconMetadata`：中英文名称、标签、产品分类、样式类型与来源。
- `prefix`：固定为 `ylf`。

## 色彩行为

`brand-mark` 和 `design-mark` 是单色图标，可通过 `color` 改色。固定配色的产品图标由 UnoCSS 使用背景图模式。

`go-far-away-mark` 同时包含 currentColor 主体和固定蓝绿细节。UnoCSS 默认选择 mask，会将细节一起染为单色；强制 `?bg` 也不能继承页面的 currentColor。需要完整配色时使用 Iconify、下载的 Vue/React 组件，或固定配色的 `go-far-away-app-icon`。

仓库中的[消费者验收说明](https://github.com/YunLeFun/icons/blob/main/tests/consumer/README.md)提供本地 tarball 消费样例、浏览器对比截图和按需体积检查。发布预检通过 `pnpm consumer:check` 运行该流程。

## 主体与完整图标

- `-mark` 不包含满幅底板，适合界面内容和 Icon Composer 前景层。
- `-app-icon` 包含完整方形背景，但不包含平台圆角遮罩。
- `<product>` 只用于元数据分组，不是图标名称。调用时必须明确选择变体，例如使用 `ylf:drive-mark` 或 `ylf:drive-app-icon`，不能使用 `ylf:drive`。
- 集合不提供无后缀名称，也不提供指向某个变体的兼容 alias。

## 与设计系统协作

[Design](https://ui.yunle.fun/) 管理设计规范、组件和 `vitepress-theme-yunlefun`；本仓库独立管理图形、来源元数据和 Iconify 发布。两个仓库通过包依赖和导航链接连接。

Design 使用 `ylf:design-mark`（跟随 `currentColor`）与 `ylf:design-app-icon`（品牌蓝方形图标）；文档与 Wiki 复用 `ylf:brand-mark`。修改图形时只更新这里的 SVG，再升级消费者依赖。

## 共享文档主题

本站复用 `vitepress-theme-yunlefun` 的导航、搜索、Markdown 排版与亮暗设计变量，和[设计系统](https://ui.yunle.fun/)、[文档](https://docs.yunle.fun/)保持一致。图标目录保留主体／完整图标／平台预览、尺寸、辅助线、复制与下载功能，产品图标保留原有配色。

工作台网格、面板与透明棋盘格从主题的 `workbench.css` 按需引入，站点不再复制一套全局配色。

<script setup lang="ts">
import type { AssetFilter } from './app-assets'
import { computed, shallowRef } from 'vue'
import AppAssetCard from './AppAssetCard.vue'
import AppAssetFilters from './AppAssetFilters.vue'
import { appAssetManifest, filterAppAssets } from './app-assets'

const query = shallowRef('')
const filter = shallowRef<AssetFilter>('all')
const size = shallowRef(56)
const rounded = shallowRef(true)
const assets = appAssetManifest.assets
const visibleAssets = computed(() => filterAppAssets(assets, query.value, filter.value))
const officialCount = assets.filter(asset => asset.desktopAsset.kind === 'official').length
const generatedCount = assets.length - officialCount
</script>

<template>
  <main class="app-assets-shell">
    <header class="app-assets-heading">
      <p class="app-assets-eyebrow">YunLeFun · App artwork</p>
      <h1>应用图标素材</h1>
      <p class="app-assets-intro">统一查看桌面目录使用的图标、原项目资源、生成候选与维护者选用记录。SVG / Iconify 品牌集合继续独立维护。</p>
      <p class="app-assets-summary">{{ assets.length }} 个桌面图标 · {{ officialCount }} 个正式来源 · {{ generatedCount }} 个生成变体</p>
      <p class="app-assets-note">“桌面采用”表示目录当前选择；生成来源与维护者选用分别记录。一般生成变体保持候选品牌身份，Saier 的历史画笔稿已获维护者选用为应用图标；网站发布状态仍需单独核实。</p>
    </header>
    <AppAssetFilters v-model:query="query" v-model:filter="filter" v-model:size="size" v-model:rounded="rounded" :count="visibleAssets.length" />
    <div v-if="visibleAssets.length" class="app-assets-grid">
      <AppAssetCard v-for="asset in visibleAssets" :key="asset.slug" :asset="asset" :size="size" :rounded="rounded" />
    </div>
    <div v-else class="app-assets-empty" role="status"><p>没有找到匹配的素材</p><button type="button" @click="query = ''; filter = 'all'">清除筛选</button></div>
    <footer class="app-assets-footer"><p>静态图只模拟缩略图与圆角；不代表原生 Icon Composer 分层交付。</p><a href="/guide/app-artwork">元数据契约与维护方式 →</a> · <a href="/app-assets/manifest.json">完整 JSON 清单 ↗</a></footer>
  </main>
</template>

<style scoped>
.app-assets-shell { max-width: 1280px; margin: 0 auto; padding: 56px 32px 80px; color: var(--ylf-c-text); }
.app-assets-heading { max-width: 820px; }
.app-assets-eyebrow { margin: 0 0 12px; color: var(--ylf-c-brand); font: 11px var(--ylf-font-mono); letter-spacing: .08em; }
.app-assets-heading h1 { margin: 0; font-family: var(--ylf-font-heading); font-size: clamp(32px, 4vw, 48px); font-weight: 650; letter-spacing: -.025em; line-height: 1.2; }
.app-assets-intro { margin: 18px 0 0; color: var(--ylf-c-text-2); font-size: 15px; line-height: 1.8; }
.app-assets-summary { margin: 18px 0 0; font-size: 13px; }
.app-assets-note { margin: 10px 0 0; color: var(--ylf-c-text-2); font-size: 12px; line-height: 1.8; }
.app-assets-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); align-items: start; gap: 18px; }
.app-assets-empty { display: grid; justify-items: center; gap: 12px; padding: 64px 16px; border: 1px solid var(--ylf-c-border); border-radius: var(--ylf-radius); }
.app-assets-empty p { margin: 0; color: var(--ylf-c-text-2); }
.app-assets-empty button { color: var(--ylf-c-brand); font: inherit; cursor: pointer; }
.app-assets-empty button:focus-visible, .app-assets-footer a:focus-visible { outline: 2px solid var(--ylf-c-brand); outline-offset: 3px; }
.app-assets-footer { margin-top: 32px; color: var(--ylf-c-text-2); font-size: 12px; line-height: 1.7; }
.app-assets-footer a { color: var(--ylf-c-brand); }
@media (max-width: 1000px) { .app-assets-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 680px) { .app-assets-shell { padding: 32px 16px 64px; } .app-assets-grid { grid-template-columns: minmax(0, 1fr); } }
</style>

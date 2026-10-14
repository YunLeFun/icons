<script setup lang="ts">
import type { AssetFilter } from './app-assets'
import { previewSizes } from './app-assets'

defineProps<{ count: number }>()
const query = defineModel<string>('query', { required: true })
const filter = defineModel<AssetFilter>('filter', { required: true })
const size = defineModel<number>('size', { required: true })
const rounded = defineModel<boolean>('rounded', { required: true })
const filters: { value: AssetFilter, label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'official', label: '正式来源' },
  { value: 'generated', label: '生成变体' },
  { value: 'comparison', label: '有对照资源' },
]
</script>

<template>
  <div class="asset-controls">
    <div class="asset-search-row">
      <label for="app-assets-search">搜索素材</label>
      <input id="app-assets-search" v-model="query" type="search" placeholder="应用名称、slug 或来源仓库">
      <span class="asset-count" aria-live="polite">{{ count }} 项</span>
    </div>
    <div class="asset-control-row">
      <div class="asset-options" role="group" aria-label="素材来源筛选">
        <button v-for="option in filters" :key="option.value" type="button" :aria-pressed="filter === option.value" @click="filter = option.value">{{ option.label }}</button>
      </div>
      <div class="asset-options" role="group" aria-label="预览尺寸">
        <button v-for="option in previewSizes" :key="option" type="button" :aria-pressed="size === option" @click="size = option">{{ option }}px</button>
      </div>
      <button type="button" class="asset-mask-toggle" :aria-pressed="rounded" @click="rounded = !rounded">圆角预览</button>
    </div>
  </div>
</template>

<style scoped>
.asset-controls { display: grid; gap: 16px; margin: 28px 0; }
.asset-search-row { display: flex; align-items: center; gap: 16px; padding: 12px 16px; border: 1px solid var(--ylf-c-border); border-radius: var(--ylf-radius-sm); background: var(--ylf-c-surface); }
.asset-search-row label, .asset-count { flex: none; color: var(--ylf-c-text-2); font-size: 12px; }
.asset-search-row input { width: 100%; min-width: 0; color: var(--ylf-c-text); font: inherit; background: transparent; border: 0; outline: none; }
.asset-search-row:focus-within { outline: 2px solid var(--ylf-c-brand); outline-offset: 3px; }
.asset-control-row { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
.asset-options { display: flex; flex-wrap: wrap; gap: 4px; }
.asset-options button, .asset-mask-toggle { padding: 7px 12px; border: 1px solid var(--ylf-c-border); border-radius: var(--ylf-radius-sm); background: var(--ylf-c-surface); color: var(--ylf-c-text-2); font: inherit; font-size: 12px; cursor: pointer; }
.asset-options button[aria-pressed="true"], .asset-mask-toggle[aria-pressed="true"] { border-color: var(--ylf-c-brand); color: var(--ylf-c-brand); background: var(--ylf-c-brand-soft); }
.asset-control-row button:focus-visible { outline: 2px solid var(--ylf-c-brand); outline-offset: 3px; }
@media (max-width: 600px) { .asset-search-row { flex-wrap: wrap; gap: 8px; } .asset-search-row input { flex: 1 1 100%; order: 3; } .asset-count { margin-left: auto; } }
</style>

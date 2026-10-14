<script setup lang="ts">
import type { AppAsset } from './app-assets'
import { computed } from 'vue'
import AssetImage from './AssetImage.vue'
import { formatBytes, identityLabels, publicationLabels } from './app-assets'

const props = defineProps<{ asset: AppAsset, size: number, rounded: boolean }>()
const identityLabel = computed(() => identityLabels[props.asset.applicationIdentity.status])
const source = computed(() => props.asset.desktopAsset.source)
const sourceLabel = computed(() => source.value.repository || source.value.tool || '正式品牌资源')
const adoption = computed(() => props.asset.desktopAsset.adoption)
const archived = computed(() => props.asset.previousIcon?.archivedArtwork)
</script>

<template>
  <article class="app-asset-card" :data-asset="asset.slug">
    <div class="asset-card-heading">
      <div><h2>{{ asset.title }}</h2><p class="asset-slug">{{ asset.slug }}</p></div>
      <span class="asset-kind" :data-kind="asset.desktopAsset.kind">{{ asset.desktopAsset.kind === 'official' ? '正式来源' : '生成变体' }}</span>
    </div>
    <AssetImage :url="asset.desktopAsset.thumbnail.url" :label="`${asset.title}：桌面当前图标`" :size="size" :rounded="rounded" />
    <div class="asset-file-row"><span>{{ adoption ? '已选用新版图标' : '桌面采用' }} · {{ asset.desktopAsset.version }}</span><span>256px WebP · {{ formatBytes(asset.desktopAsset.thumbnail.bytes) }}</span></div>
    <p class="asset-description">{{ asset.description }}</p>
    <div class="asset-actions">
      <a :href="asset.desktopAsset.thumbnail.url" target="_blank" rel="noopener noreferrer">256px 缩略图 ↗</a>
      <a :href="asset.desktopAsset.master.url" target="_blank" rel="noopener noreferrer">1024px PNG ↗</a>
    </div>
    <dl class="asset-provenance">
      <div><dt>应用身份</dt><dd>{{ identityLabel }}</dd></div>
      <div v-if="adoption"><dt>新版选用</dt><dd>维护者已确认 · {{ adoption.approvedAt }}</dd></div>
      <div><dt>站点核实</dt><dd>{{ publicationLabels[asset.websitePublication.status] }}</dd></div>
      <div><dt>素材来源</dt><dd><a v-if="source.url" :href="source.url" target="_blank" rel="noopener noreferrer">{{ sourceLabel }} ↗</a><span v-else>{{ sourceLabel }}</span></dd></div>
    </dl>
    <p v-if="adoption" class="asset-candidate-note">维护者选用此画笔稿作为新版应用图标；站点发布状态单独核实。</p>
    <p v-else-if="asset.desktopAsset.kind === 'generated'" class="asset-candidate-note">仅作为桌面目录变体；未替换应用正式品牌。</p>
    <details v-if="asset.previousIcon || asset.candidates.length" class="asset-comparison">
      <summary>原图与候选对照</summary>
      <div class="asset-comparison-grid">
        <figure v-if="asset.previousIcon">
          <AssetImage :url="asset.previousIcon.url" :label="`${asset.title}：原项目资源`" :size="56" />
          <figcaption>{{ asset.previousIcon.label }}<a :href="asset.previousIcon.source?.url || asset.previousIcon.url" target="_blank" rel="noopener noreferrer">查看来源 ↗</a></figcaption>
        </figure>
        <figure v-if="archived">
          <AssetImage :url="archived.thumbnail.url" :label="`${asset.title}：已归档的上一版桌面图`" :size="56" :rounded="rounded" />
          <figcaption>上一版桌面图 · 已归档<a :href="archived.master.url" target="_blank" rel="noopener noreferrer">1024px 原图 ↗</a></figcaption>
        </figure>
        <figure v-for="candidate in asset.candidates" :key="candidate.thumbnail.url">
          <AssetImage :url="candidate.thumbnail.url" :label="`${asset.title}：未采用候选图`" :size="56" :rounded="rounded" />
          <figcaption>生成候选 · 未采用<a :href="candidate.master.url" target="_blank" rel="noopener noreferrer">1024px 原图 ↗</a></figcaption>
        </figure>
      </div>
    </details>
    <details class="asset-evidence">
      <summary>来源与校验记录</summary>
      <p>{{ asset.applicationIdentity.notes }}</p>
      <p v-if="source.path"><strong>来源路径</strong> {{ source.path }}</p>
      <p v-if="source.commit"><strong>源码 commit</strong> {{ source.commit }}</p>
      <p><strong>WebP SHA-256</strong> {{ asset.desktopAsset.thumbnail.sha256 }}</p>
      <p><strong>PNG 存储对象 SHA-256</strong> {{ asset.desktopAsset.master.sha256 }}</p>
      <p v-if="archived"><strong>上一版桌面图 WebP SHA-256</strong> {{ archived.thumbnail.sha256 }}</p>
      <p v-if="asset.websitePublication.iconUrl"><a :href="asset.websitePublication.iconUrl" target="_blank" rel="noopener noreferrer">站点声明或已核实的图标资源 ↗</a></p>
      <p class="asset-evidence-note">源码 commit、素材采用与站点发布分别核实；采用记录不代表发布，已核实状态以对应的公开资源链接为准。</p>
    </details>
  </article>
</template>

<style scoped>
.app-asset-card { min-width: 0; padding: 20px; border: 1px solid var(--ylf-c-border); border-radius: var(--ylf-radius); background: var(--ylf-c-surface); }
.asset-card-heading { display: flex; align-items: start; justify-content: space-between; gap: 10px; margin-bottom: 16px; }
.asset-card-heading h2 { margin: 0; padding: 0; border: 0; font-size: 18px; line-height: 1.5; }
.asset-slug { margin: 2px 0 0; color: var(--ylf-c-text-2); font: 11px var(--ylf-font-mono); }
.asset-kind { flex: none; padding: 3px 7px; border-radius: var(--ylf-radius-sm); color: var(--ylf-c-brand); background: var(--ylf-c-brand-soft); font-size: 11px; }
.asset-kind[data-kind="generated"] { color: var(--ylf-accent-coral-text); background: var(--ylf-accent-coral-soft); }
.asset-file-row { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 6px; margin-top: 10px; color: var(--ylf-c-text-2); font-size: 11px; }
.asset-description { min-height: 42px; margin: 14px 0; color: var(--ylf-c-text-2); font-size: 12px; line-height: 1.7; }
.asset-actions { display: flex; flex-wrap: wrap; gap: 10px; padding-bottom: 14px; border-bottom: 1px solid var(--ylf-c-border); }
.asset-actions a, .asset-provenance a, .asset-comparison a, .asset-evidence a { color: var(--ylf-c-brand); font-size: 12px; text-decoration: none; }
.asset-actions a:hover, .asset-provenance a:hover, .asset-comparison a:hover, .asset-evidence a:hover { text-decoration: underline; }
.asset-provenance { display: grid; gap: 7px; margin: 14px 0 0; font-size: 11px; line-height: 1.6; }
.asset-provenance div { display: grid; grid-template-columns: 58px minmax(0, 1fr); gap: 8px; }
.asset-provenance dt { color: var(--ylf-c-text-3); }
.asset-provenance dd { margin: 0; overflow-wrap: anywhere; }
.asset-candidate-note { margin: 12px 0 0; color: var(--ylf-c-text-2); font-size: 11px; line-height: 1.6; }
.asset-comparison, .asset-evidence { margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--ylf-c-border); }
.asset-comparison summary, .asset-evidence summary { color: var(--ylf-c-text-2); font-size: 12px; cursor: pointer; }
.asset-comparison-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 12px; }
.asset-comparison-grid figure { min-width: 0; margin: 0; }
.asset-comparison-grid :deep(.asset-image-frame) { min-height: 90px; }
.asset-comparison-grid figcaption { margin-top: 8px; color: var(--ylf-c-text-2); font-size: 10px; line-height: 1.7; }
.asset-comparison-grid figcaption a { display: block; font-size: 10px; }
.asset-evidence p { margin: 12px 0 0; color: var(--ylf-c-text-2); font-size: 11px; line-height: 1.7; overflow-wrap: anywhere; }
.app-asset-card :where(a, summary):focus-visible { outline: 2px solid var(--ylf-c-brand); outline-offset: 3px; }
</style>

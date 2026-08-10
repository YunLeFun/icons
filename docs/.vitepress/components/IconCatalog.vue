<script setup lang="ts">
import type { IconCategory, IconMetadata, IconVariant } from '@yunlefun/icons'
import type { IconPreviewSettings } from './icon-preview'
import { iconMetadata } from '@yunlefun/icons'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  defaultIconPreviewSettings,
  getIconPreviewTemplateStyle,
  iconPreviewModes,
  iconPreviewSizes,
  iconPreviewStorageKey,
  iconPreviewTemplates,
  parseIconPreviewSettings,
} from './icon-preview'
import { createIconAsset, createSvgSource } from './icon-download'
import type { IconDownloadFormat } from './icon-download'

type CategoryFilter = 'all' | IconCategory
type CopyKind = 'class' | 'iconify' | 'svg'

interface IconProduct {
  id: string
  title: string
  titleZh: string
  description: string
  category: IconCategory
  website?: string
  variants: Partial<Record<IconVariant, IconMetadata>>
  searchText: string
}

const query = ref('')
const category = ref<CategoryFilter>('all')
const copiedValue = ref('')
const previewMode = ref(defaultIconPreviewSettings.mode)
const previewTemplate = ref(defaultIconPreviewSettings.template)
const previewSize = ref(defaultIconPreviewSettings.size)
const previewGuides = ref(defaultIconPreviewSettings.guides)
const previewSettingsReady = ref(false)
let copiedTimer: number | undefined

const categoryOptions: { label: string, value: CategoryFilter }[] = [
  { label: '全部', value: 'all' },
  { label: '品牌', value: 'brand' },
  { label: '官方站点', value: 'official-site' },
  { label: '效率工具', value: 'utility' },
  { label: '趣味应用', value: 'fun-app' },
]

const iconProducts: IconProduct[] = [...new Set(iconMetadata.map(icon => icon.product))].map((productId) => {
  const entries = iconMetadata.filter(icon => icon.product === productId)
  const primary = entries.find(icon => icon.variant === 'mark') ?? entries[0]
  const variants = Object.fromEntries(entries.map(icon => [icon.variant, icon])) as Partial<Record<IconVariant, IconMetadata>>

  return {
    id: productId,
    title: primary.title,
    titleZh: primary.titleZh,
    description: primary.description,
    category: primary.category,
    website: primary.website,
    variants,
    searchText: entries.flatMap(icon => [
      icon.name,
      icon.title,
      icon.titleZh,
      icon.description,
      icon.category,
      icon.style,
      icon.website ?? '',
      ...icon.tags,
    ]).join(' ').toLocaleLowerCase(),
  }
})

const filteredProducts = computed(() => {
  const normalizedQuery = query.value.trim().toLocaleLowerCase()

  return iconProducts.filter((product) => {
    const categoryMatches = category.value === 'all' || product.category === category.value
    if (!categoryMatches)
      return false

    if (!normalizedQuery)
      return true

    return product.searchText.includes(normalizedQuery)
  })
})

const selectedPreviewMode = computed(() => {
  return iconPreviewModes.find(option => option.id === previewMode.value)
    ?? iconPreviewModes[0]
})

const selectedPreviewTemplate = computed(() => {
  return iconPreviewTemplates.find(option => option.id === previewTemplate.value)
    ?? iconPreviewTemplates[0]
})

const previewStyle = computed(() => getIconPreviewTemplateStyle(
  previewMode.value,
  selectedPreviewTemplate.value,
  previewSize.value,
))

function previewVariant(product: IconProduct): IconMetadata | undefined {
  const requestedVariant = previewMode.value === 'mark'
    ? product.variants.mark
    : product.variants['app-icon']

  return requestedVariant ?? (isMarkOnlyPreview(product) ? product.variants.mark : undefined)
}

function isMarkOnlyPreview(product: IconProduct): boolean {
  return previewMode.value !== 'mark'
    && product.category === 'brand'
    && !product.variants['app-icon']
    && Boolean(product.variants.mark)
}

function previewStyleForProduct(product: IconProduct): Record<string, string> {
  return isMarkOnlyPreview(product)
    ? getIconPreviewTemplateStyle('mark', selectedPreviewTemplate.value, previewSize.value)
    : previewStyle.value
}

function previewModeForProduct(product: IconProduct) {
  return isMarkOnlyPreview(product) ? 'mark' : previewMode.value
}

function previewVariantLabel(product: IconProduct): string {
  const icon = previewVariant(product)
  if (!icon)
    return 'N/A'

  if (isMarkOnlyPreview(product))
    return 'MARK ONLY'

  return icon.variant === 'app-icon' ? 'APP ICON' : 'MARK'
}

function previewAriaLabel(product: IconProduct): string {
  return isMarkOnlyPreview(product)
    ? `${product.titleZh} · 主体层（未提供完整图标）`
    : `${product.titleZh} · ${selectedPreviewMode.value.label}`
}

function copyProductIcon(product: IconProduct, kind: CopyKind) {
  const icon = previewVariant(product)
  if (icon)
    return copyIcon(icon.name, kind)
}

function isProductIconCopied(product: IconProduct, kind: CopyKind): boolean {
  const icon = previewVariant(product)
  return icon ? copiedValue.value === copyValue(icon.name, kind) : false
}

function copyValue(name: string, kind: CopyKind) {
  if (kind === 'class')
    return `i-ylf-${name}`

  if (kind === 'iconify')
    return `ylf:${name}`

  return createSvgSource(name as IconMetadata['name'])
}

async function writeClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  textarea.remove()
}

async function copyIcon(name: string, kind: CopyKind) {
  const value = copyValue(name, kind)
  await writeClipboard(value)
  copiedValue.value = value

  if (copiedTimer)
    window.clearTimeout(copiedTimer)

  copiedTimer = window.setTimeout(() => {
    copiedValue.value = ''
  }, 1800)
}

function downloadProductIcon(product: IconProduct, format: IconDownloadFormat, event: Event) {
  const icon = previewVariant(product)
  if (!icon)
    return

  const asset = createIconAsset(icon.name, format)
  const href = URL.createObjectURL(new Blob([asset.content], { type: asset.mimeType }))
  const anchor = document.createElement('a')
  anchor.href = href
  anchor.download = asset.filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(href), 1000)

  const details = (event.currentTarget as HTMLElement).closest('details')
  details?.removeAttribute('open')
}

function sourceStatusLabel(icon: IconMetadata): string {
  return icon.source.sync ? 'SYNC' : 'DERIVED'
}

function sourceStatusDescription(icon: IconMetadata): string {
  return icon.source.sync
    ? '由收集命令从上游源文件直接同步'
    : icon.source.derivation ?? '基于上游源文件派生维护'
}

function savePreviewSettings() {
  if (!previewSettingsReady.value)
    return

  const settings: IconPreviewSettings = {
    mode: previewMode.value,
    template: previewTemplate.value,
    size: previewSize.value,
    guides: previewGuides.value,
  }

  try {
    window.localStorage.setItem(iconPreviewStorageKey, JSON.stringify(settings))
  }
  catch (error) {
    console.warn('Unable to persist icon preview settings.', error)
  }
}

onMounted(() => {
  try {
    const settings = parseIconPreviewSettings(window.localStorage.getItem(iconPreviewStorageKey))
    previewMode.value = settings.mode
    previewTemplate.value = settings.template
    previewSize.value = settings.size
    previewGuides.value = settings.guides
  }
  catch (error) {
    console.warn('Unable to restore icon preview settings.', error)
  }

  previewSettingsReady.value = true
})

watch([previewMode, previewTemplate, previewSize, previewGuides], savePreviewSettings)

onBeforeUnmount(() => {
  if (copiedTimer)
    window.clearTimeout(copiedTimer)
})
</script>

<template>
  <main class="catalog-shell">
    <header class="catalog-masthead">
      <div class="masthead-brand">
        <span
          class="masthead-brand-symbol i-ylf-brand-mark"
          role="img"
          aria-label="云乐坊品牌图标"
        />
        <span class="masthead-brand-code" aria-hidden="true">YLF / ICONS</span>
      </div>
      <div class="masthead-copy">
        <p class="catalog-eyebrow">
          YunLeFun Icon Collection
        </p>
        <h1>云乐坊图标</h1>
        <p class="catalog-intro">
          云乐坊品牌、官方站点、效率工具与趣味应用图标的统一来源。浏览主体层、完整构图与平台效果，复制即可使用。
        </p>
      </div>
      <dl class="masthead-stats">
        <div>
          <dt>Collection</dt>
          <dd>ylf</dd>
        </div>
        <div>
          <dt>Products</dt>
          <dd>{{ iconProducts.length.toString().padStart(2, '0') }}</dd>
        </div>
        <div>
          <dt>Assets</dt>
          <dd>{{ iconMetadata.length.toString().padStart(2, '0') }}</dd>
        </div>
      </dl>
    </header>

    <section class="catalog-workbench" aria-label="图标目录">
      <aside class="catalog-rail">
        <div class="rail-section">
          <p class="rail-label">
            Filter
          </p>
          <div class="filter-list" aria-label="按类型筛选">
            <button
              v-for="option in categoryOptions"
              :key="option.value"
              type="button"
              :class="{ active: category === option.value }"
              :aria-pressed="category === option.value"
              :data-testid="`category-filter-${option.value}`"
              @click="category = option.value"
            >
              <span>{{ option.label }}</span>
              <span>{{ option.value === 'all' ? iconProducts.length : iconProducts.filter(product => product.category === option.value).length }}</span>
            </button>
          </div>
        </div>

        <div class="rail-note">
          <span class="rail-rule" />
          <p>主体层保持透明；完整图标使用满幅方形背景，由平台统一应用遮罩。</p>
        </div>
      </aside>

      <div class="catalog-content">
        <div class="search-row">
          <label for="icon-search">Search</label>
          <input
            id="icon-search"
            v-model="query"
            data-testid="icon-search"
            type="search"
            autocomplete="off"
            placeholder="名称、产品、中文标签…"
          >
          <span class="result-count" aria-live="polite">{{ filteredProducts.length }} / {{ iconProducts.length }}</span>
        </div>

        <section class="preview-toolbar" aria-label="图标预览设置">
          <div class="preview-toolbar-heading">
            <p>YunLeFun Preview Reference</p>
            <strong>{{ selectedPreviewMode.label }}</strong>
            <span>{{ selectedPreviewMode.description }}</span>
            <span v-if="previewMode === 'platform'">
              {{ selectedPreviewTemplate.label }} · {{ selectedPreviewTemplate.width }} × {{ selectedPreviewTemplate.height }} reference
            </span>
            <span v-if="previewMode === 'platform'" class="preview-platform-note">
              {{ selectedPreviewTemplate.note }}
            </span>
            <span v-else>
              64 × 64 normalized canvas
            </span>
            <a
              href="https://developer.apple.com/design/human-interface-guidelines/app-icons"
              target="_blank"
              rel="noreferrer"
            >
              参考 Apple HIG，非 Apple 官方模板
            </a>
          </div>

          <div class="preview-toolbar-controls">
            <fieldset class="preview-control preview-mode-control">
              <legend>Asset layer</legend>
              <div class="preview-options preview-mode-options">
                <button
                  v-for="option in iconPreviewModes"
                  :key="option.id"
                  type="button"
                  :aria-pressed="previewMode === option.id"
                  :class="{ active: previewMode === option.id }"
                  :data-testid="`preview-mode-${option.id}`"
                  @click="previewMode = option.id"
                >
                  {{ option.label }}
                </button>
              </div>
            </fieldset>

            <div class="preview-context-controls">
              <fieldset v-if="previewMode === 'platform'" class="preview-control preview-template-control">
                <legend>Platform reference</legend>
                <div class="preview-options">
                  <button
                    v-for="option in iconPreviewTemplates"
                    :key="option.id"
                    type="button"
                    :aria-pressed="previewTemplate === option.id"
                    :class="{ active: previewTemplate === option.id }"
                    :data-testid="`preview-template-${option.id}`"
                    @click="previewTemplate = option.id"
                  >
                    {{ option.shortLabel }}
                  </button>
                </div>
              </fieldset>

              <fieldset class="preview-control preview-size-control">
                <legend>Display size</legend>
                <div class="preview-options preview-size-options">
                  <button
                    v-for="size in iconPreviewSizes"
                    :key="size"
                    type="button"
                    :aria-pressed="previewSize === size"
                    :class="{ active: previewSize === size }"
                    :data-testid="`preview-size-${size}`"
                    @click="previewSize = size"
                  >
                    {{ size }}
                  </button>
                </div>
              </fieldset>

              <button
                class="preview-guide-toggle"
                type="button"
                :aria-pressed="previewGuides"
                data-testid="preview-guides"
                @click="previewGuides = !previewGuides"
              >
                <span aria-hidden="true" />
                {{ previewGuides ? '隐藏辅助线' : '显示辅助线' }}
              </button>
            </div>

            <div class="preview-guide-legend" aria-label="辅助线图例">
              <span><i class="legend-center" />中心</span>
              <span><i class="legend-safe" />安全区</span>
              <span><i class="legend-optical" />光学越界</span>
              <span><i class="legend-keyline" />{{ previewMode === 'platform' ? '输出边界 / 系统遮罩' : '参考关键线 / 输出边界' }}</span>
            </div>
          </div>
        </section>

        <div v-if="filteredProducts.length" class="icon-grid" data-testid="icon-grid">
          <article v-for="product in filteredProducts" :key="product.id" class="icon-card" :data-icon="product.id">
            <div class="icon-preview">
              <div
                class="preview-stage"
                :data-template="previewTemplate"
                :data-mask="selectedPreviewTemplate.mask"
                :data-mode="previewModeForProduct(product)"
                :style="previewStyleForProduct(product)"
              >
                <div class="preview-canvas">
                  <div class="preview-artboard">
                    <span
                      v-if="previewVariant(product)"
                      :class="[`i-ylf-${previewVariant(product)?.name}`, 'icon-glyph']"
                      role="img"
                      :aria-label="previewAriaLabel(product)"
                    />
                    <span v-else class="preview-unavailable">仅提供主体层</span>
                  </div>
                  <div
                    v-if="previewGuides && previewVariant(product)"
                    class="preview-guides"
                    aria-hidden="true"
                  >
                    <span class="guide-center guide-center-x" />
                    <span class="guide-center guide-center-y" />
                    <span class="guide-optical" />
                    <span class="guide-safe" />
                    <span class="guide-keyline-circle" />
                    <span class="guide-mask" />
                  </div>
                </div>
                <span class="preview-size-badge">{{ previewSize }}px</span>
              </div>
              <span class="icon-style">
                {{ previewVariantLabel(product) }}
              </span>
            </div>

            <div class="icon-card-copy">
              <p class="icon-number">
                {{ String(iconProducts.indexOf(product) + 1).padStart(2, '0') }}
              </p>
              <h2>{{ product.titleZh }}</h2>
              <p class="icon-name">
                {{ previewVariant(product)?.name ?? product.id }}
              </p>
              <p class="icon-description">
                {{ previewVariant(product)?.description ?? product.description }}
              </p>
            </div>

            <div class="copy-actions">
              <button
                type="button"
                :disabled="!previewVariant(product)"
                :data-testid="`copy-class-${product.id}`"
                @click="copyProductIcon(product, 'class')"
              >
                {{ isProductIconCopied(product, 'class') ? '已复制' : '复制 class' }}
              </button>
              <button
                type="button"
                :disabled="!previewVariant(product)"
                @click="copyProductIcon(product, 'iconify')"
              >
                {{ isProductIconCopied(product, 'iconify') ? '已复制' : '复制 Iconify' }}
              </button>
              <button
                type="button"
                :disabled="!previewVariant(product)"
                :data-testid="`copy-svg-${product.id}`"
                @click="copyProductIcon(product, 'svg')"
              >
                {{ isProductIconCopied(product, 'svg') ? '已复制' : '复制 SVG' }}
              </button>
              <details class="download-menu">
                <summary :aria-disabled="!previewVariant(product)">
                  下载源码
                </summary>
                <div class="download-options">
                  <button
                    v-for="format in (['svg', 'vue', 'react'] as const)"
                    :key="format"
                    type="button"
                    :disabled="!previewVariant(product)"
                    :data-testid="`download-${format}-${product.id}`"
                    @click="downloadProductIcon(product, format, $event)"
                  >
                    <span>{{ format === 'react' ? 'React' : format.toUpperCase() }}</span>
                    <small>{{ format === 'svg' ? '.svg' : format === 'vue' ? '.vue' : '.tsx' }}</small>
                  </button>
                </div>
              </details>
            </div>

            <div v-if="previewVariant(product)" class="source-meta">
              <span
                class="source-status"
                :data-sync="previewVariant(product)?.source.sync"
                :title="sourceStatusDescription(previewVariant(product)!)"
              >
                {{ sourceStatusLabel(previewVariant(product)!) }}
              </span>
              <a
                v-if="product.website"
                class="source-link website-link"
                :href="product.website"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="`${product.titleZh}：访问站点`"
                :data-testid="`website-link-${product.id}`"
              >
                访问站点 ↗
              </a>
              <a
                class="source-link"
                :href="previewVariant(product)?.source.url"
                target="_blank"
                rel="noreferrer"
              >
                {{ previewVariant(product)?.source.repository }} / source
              </a>
            </div>
          </article>
        </div>

        <div v-else class="empty-state" data-testid="empty-state">
          <p>没有匹配的图标。</p>
          <button type="button" @click="query = ''; category = 'all'">
            清除筛选
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

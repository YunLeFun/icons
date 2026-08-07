<script setup lang="ts">
import type { IconCategory } from '@yunlefun/icons'
import type { IconPreviewSettings } from './icon-preview'
import { iconMetadata } from '@yunlefun/icons'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  defaultIconPreviewSettings,
  getIconPreviewTemplateStyle,
  iconPreviewSizes,
  iconPreviewStorageKey,
  iconPreviewTemplates,
  parseIconPreviewSettings,
} from './icon-preview'

type CategoryFilter = 'all' | IconCategory
type CopyKind = 'class' | 'iconify'

const query = ref('')
const category = ref<CategoryFilter>('all')
const copiedValue = ref('')
const previewTemplate = ref(defaultIconPreviewSettings.template)
const previewSize = ref(defaultIconPreviewSettings.size)
const previewGuides = ref(defaultIconPreviewSettings.guides)
const previewSettingsReady = ref(false)
let copiedTimer: number | undefined

const categoryOptions: { label: string, value: CategoryFilter }[] = [
  { label: '全部', value: 'all' },
  { label: '品牌', value: 'brand' },
  { label: '应用', value: 'application' },
]

const filteredIcons = computed(() => {
  const normalizedQuery = query.value.trim().toLocaleLowerCase()

  return iconMetadata.filter((icon) => {
    const categoryMatches = category.value === 'all' || icon.category === category.value
    if (!categoryMatches)
      return false

    if (!normalizedQuery)
      return true

    const searchText = [
      icon.name,
      icon.title,
      icon.titleZh,
      icon.description,
      icon.category,
      icon.style,
      ...icon.tags,
    ].join(' ').toLocaleLowerCase()

    return searchText.includes(normalizedQuery)
  })
})

const selectedPreviewTemplate = computed(() => {
  return iconPreviewTemplates.find(option => option.id === previewTemplate.value)
    ?? iconPreviewTemplates[0]
})

const previewStyle = computed(() => getIconPreviewTemplateStyle(
  selectedPreviewTemplate.value,
  previewSize.value,
))

function copyValue(name: string, kind: CopyKind) {
  return kind === 'class' ? `i-ylf-${name}` : `ylf:${name}`
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

function savePreviewSettings() {
  if (!previewSettingsReady.value)
    return

  const settings: IconPreviewSettings = {
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
    previewTemplate.value = settings.template
    previewSize.value = settings.size
    previewGuides.value = settings.guides
  }
  catch (error) {
    console.warn('Unable to restore icon preview settings.', error)
  }

  previewSettingsReady.value = true
})

watch([previewTemplate, previewSize, previewGuides], savePreviewSettings)

onBeforeUnmount(() => {
  if (copiedTimer)
    window.clearTimeout(copiedTimer)
})
</script>

<template>
  <main class="catalog-shell">
    <header class="catalog-masthead">
      <div class="masthead-index" aria-hidden="true">
        YLF / 001
      </div>
      <div class="masthead-copy">
        <p class="catalog-eyebrow">
          YunLeFun Asset Registry
        </p>
        <h1>图标，保持同一来源。</h1>
        <p class="catalog-intro">
          从规范 SVG 生成 Iconify 数据，并用 UnoCSS 在真实页面中验证。搜索一个应用，复制即可使用。
        </p>
      </div>
      <dl class="masthead-stats">
        <div>
          <dt>Collection</dt>
          <dd>ylf</dd>
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
              @click="category = option.value"
            >
              <span>{{ option.label }}</span>
              <span>{{ option.value === 'all' ? iconMetadata.length : iconMetadata.filter(icon => icon.category === option.value).length }}</span>
            </button>
          </div>
        </div>

        <div class="rail-note">
          <span class="rail-rule" />
          <p>颜色图标保留产品原始配色；单色图标继承当前文本颜色。</p>
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
            placeholder="名称、应用、中文标签…"
          >
          <span class="result-count" aria-live="polite">{{ filteredIcons.length }} / {{ iconMetadata.length }}</span>
        </div>

        <section class="preview-toolbar" aria-label="图标预览设置">
          <div class="preview-toolbar-heading">
            <p>YunLeFun Preview Reference</p>
            <strong>{{ selectedPreviewTemplate.label }}</strong>
            <span>{{ selectedPreviewTemplate.width }} × {{ selectedPreviewTemplate.height }} reference</span>
            <a
              href="https://developer.apple.com/design/human-interface-guidelines/app-icons"
              target="_blank"
              rel="noreferrer"
            >
              参考 Apple HIG，非 Apple 官方模板
            </a>
          </div>

          <fieldset class="preview-control preview-template-control">
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

          <div class="preview-guide-legend" aria-label="辅助线图例">
            <span><i class="legend-center" />中心</span>
            <span><i class="legend-safe" />安全区</span>
            <span><i class="legend-optical" />光学越界</span>
            <span><i class="legend-keyline" />关键线 / 遮罩</span>
          </div>
        </section>

        <div v-if="filteredIcons.length" class="icon-grid" data-testid="icon-grid">
          <article v-for="icon in filteredIcons" :key="icon.name" class="icon-card" :data-icon="icon.name">
            <div class="icon-preview">
              <div
                class="preview-stage"
                :data-template="previewTemplate"
                :data-mask="selectedPreviewTemplate.mask"
                :style="previewStyle"
              >
                <div class="preview-artboard">
                  <span
                    :class="[`i-ylf-${icon.name}`, 'icon-glyph']"
                    role="img"
                    :aria-label="icon.titleZh"
                  />
                </div>
                <div v-if="previewGuides" class="preview-guides" aria-hidden="true">
                  <span class="guide-center guide-center-x" />
                  <span class="guide-center guide-center-y" />
                  <span class="guide-optical" />
                  <span class="guide-safe" />
                  <span class="guide-keyline-circle" />
                  <span class="guide-mask" />
                </div>
                <span class="preview-size-badge">{{ previewSize }}px</span>
              </div>
              <span class="icon-style">{{ icon.style === 'color' ? 'COLOR' : 'MONO' }}</span>
            </div>

            <div class="icon-card-copy">
              <p class="icon-number">
                {{ String(iconMetadata.indexOf(icon) + 1).padStart(2, '0') }}
              </p>
              <h2>{{ icon.titleZh }}</h2>
              <p class="icon-name">
                {{ icon.name }}
              </p>
              <p class="icon-description">
                {{ icon.description }}
              </p>
            </div>

            <div class="copy-actions">
              <button
                type="button"
                :data-testid="`copy-class-${icon.name}`"
                @click="copyIcon(icon.name, 'class')"
              >
                {{ copiedValue === copyValue(icon.name, 'class') ? '已复制' : '复制 class' }}
              </button>
              <button type="button" @click="copyIcon(icon.name, 'iconify')">
                {{ copiedValue === copyValue(icon.name, 'iconify') ? '已复制' : '复制 Iconify' }}
              </button>
            </div>

            <a class="source-link" :href="icon.source.url" target="_blank" rel="noreferrer">
              {{ icon.source.repository }} / source
            </a>
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

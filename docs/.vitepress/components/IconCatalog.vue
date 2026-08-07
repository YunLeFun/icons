<script setup lang="ts">
import type { IconCategory } from '@yunlefun/icons'
import { iconMetadata } from '@yunlefun/icons'
import { computed, onBeforeUnmount, ref } from 'vue'

type CategoryFilter = 'all' | IconCategory
type CopyKind = 'class' | 'iconify'

const query = ref('')
const category = ref<CategoryFilter>('all')
const copiedValue = ref('')
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

        <div v-if="filteredIcons.length" class="icon-grid" data-testid="icon-grid">
          <article v-for="icon in filteredIcons" :key="icon.name" class="icon-card" :data-icon="icon.name">
            <div class="icon-preview">
              <span
                :class="[`i-ylf-${icon.name}`, 'icon-glyph']"
                role="img"
                :aria-label="icon.titleZh"
              />
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

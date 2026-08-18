import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import IconCatalog from '../.vitepress/components/IconCatalog.vue'
import { iconPreviewStorageKey } from '../.vitepress/components/icon-preview'

describe('IconCatalog preview controls', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('labels the preview as a YunLeFun reference', () => {
    const wrapper = mount(IconCatalog)

    expect(wrapper.get('.masthead-brand-symbol').classes()).toContain('i-ylf-brand-mark')
    expect(wrapper.get('h1').text()).toBe('云乐坊图标')
    expect(wrapper.text()).toContain('YunLeFun Preview Reference')
    expect(wrapper.text()).toContain('参考 Apple HIG，非 Apple 官方模板')
    expect(wrapper.get('[data-testid="preview-mode-platform"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('[data-testid="preview-template-ios"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('[data-testid="preview-size-128"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('[data-testid="preview-guides"]').attributes('aria-pressed')).toBe('false')
    expect(wrapper.findAll('.icon-card')).toHaveLength(14)
    expect(wrapper.get('[data-icon="cards"] .icon-glyph').classes()).toContain('i-ylf-cards-app-icon')
    expect(wrapper.get('[data-icon="cook"] .icon-glyph').classes()).toContain('i-ylf-cook-app-icon')
    expect(wrapper.get('[data-icon="drive"] .icon-glyph').classes()).toContain('i-ylf-drive-app-icon')
    expect(wrapper.get('[data-icon="brand"] .icon-glyph').classes()).toContain('i-ylf-brand-mark')
    expect(wrapper.get('[data-icon="brand"] .icon-glyph').attributes('aria-label')).toContain('未提供完整图标')
    expect(wrapper.get('[data-icon="brand"] .preview-stage').attributes('data-mode')).toBe('mark')
    expect(wrapper.get('[data-icon="brand"] .preview-stage').attributes('style')).toContain('--preview-mask-radius: 0')
    expect(wrapper.get('[data-icon="brand"] .icon-style').text()).toBe('MARK ONLY')
    expect(wrapper.get('[data-testid="copy-class-brand"]').attributes('disabled')).toBeUndefined()
    expect(wrapper.get('[data-icon="brand"] .source-status').text()).toBe('SYNC')
    expect(wrapper.get('[data-icon="drive"] .source-status').text()).toBe('DERIVED')
  })

  it('links products to their independent sites when available', () => {
    const wrapper = mount(IconCatalog)
    const appsLink = wrapper.get('[data-testid="website-link-apps"]')

    expect(appsLink.attributes('href')).toBe('https://apps.yunle.fun/')
    expect(appsLink.attributes('target')).toBe('_blank')
    expect(appsLink.attributes('rel')).toBe('noopener noreferrer')
    expect(appsLink.attributes('aria-label')).toBe('云乐坊应用中心：访问站点')
    expect(wrapper.find('[data-testid="website-link-skykeeper"]').exists()).toBe(false)
  })

  it('filters products by their published category', async () => {
    const wrapper = mount(IconCatalog)

    await wrapper.get('[data-testid="category-filter-fun-app"]').trigger('click')
    await nextTick()

    expect(wrapper.findAll('.icon-card')).toHaveLength(6)
    expect(wrapper.find('[data-icon="cards"]').exists()).toBe(true)
    expect(wrapper.find('[data-icon="cook"]').exists()).toBe(true)
    expect(wrapper.find('[data-icon="play"]').exists()).toBe(true)
    expect(wrapper.find('[data-icon="go-far-away"]').exists()).toBe(true)
    expect(wrapper.find('[data-icon="drive"]').exists()).toBe(false)
  })

  it('copies and downloads the currently previewed variant', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    const createObjectURL = vi.fn().mockReturnValue('blob:ylf-icon')
    const revokeObjectURL = vi.fn()
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL })

    const wrapper = mount(IconCatalog)
    await wrapper.get('[data-testid="copy-svg-drive"]').trigger('click')

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('id="ylf-drive-app-icon-svgID0"'))

    const downloadMenu = wrapper.get('[data-icon="drive"] .download-menu')
    downloadMenu.element.setAttribute('open', '')
    await wrapper.get('[data-testid="download-vue-drive"]').trigger('click')

    expect(createObjectURL).toHaveBeenCalledOnce()
    expect(anchorClick).toHaveBeenCalledOnce()
    expect(revokeObjectURL).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1000)
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:ylf-icon')
    expect(downloadMenu.attributes('open')).toBeUndefined()
  })

  it('switches between mark, complete icon, and platform output', async () => {
    const wrapper = mount(IconCatalog)

    await wrapper.get('[data-testid="preview-mode-app-icon"]').trigger('click')
    await nextTick()

    expect(wrapper.get('[data-icon="drive"] .icon-glyph').classes()).toContain('i-ylf-drive-app-icon')
    expect(wrapper.get('[data-icon="drive"] .preview-stage').attributes('style')).toContain('--preview-mask-radius: 0')
    expect(wrapper.get('[data-icon="brand"] .icon-glyph').classes()).toContain('i-ylf-brand-mark')
    expect(wrapper.get('[data-icon="brand"] .icon-style').text()).toBe('MARK ONLY')

    await wrapper.get('[data-testid="preview-mode-platform"]').trigger('click')
    await nextTick()

    expect(wrapper.get('[data-testid="preview-template-ios"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('[data-icon="drive"] .preview-stage').attributes('data-mode')).toBe('platform')
    expect(wrapper.get('[data-icon="drive"] .preview-stage').attributes('style')).toContain('--preview-mask-radius: 22%')
  })

  it('switches templates, sizes, and guide overlays accessibly', async () => {
    const wrapper = mount(IconCatalog)

    await wrapper.get('[data-testid="preview-mode-platform"]').trigger('click')
    await wrapper.get('[data-testid="preview-template-tvos"]').trigger('click')
    await wrapper.get('[data-testid="preview-size-24"]').trigger('click')
    await wrapper.get('[data-testid="preview-guides"]').trigger('click')
    await nextTick()

    const stage = wrapper.get('[data-icon="drive"] .preview-stage')
    expect(wrapper.get('[data-testid="preview-template-tvos"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('[data-testid="preview-size-24"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('[data-testid="preview-guides"]').attributes('aria-pressed')).toBe('true')
    expect(stage.attributes('data-mask')).toBe('landscape')
    expect(stage.attributes('data-mode')).toBe('platform')
    expect(stage.attributes('style')).toContain('--preview-canvas-width: 24px')
    expect(stage.attributes('style')).toContain('--preview-canvas-height: 14.4px')
    expect(stage.attributes('style')).toContain('--preview-icon-size: 24px')
    expect(wrapper.findAll('.guide-mask')).toHaveLength(14)
    expect(wrapper.text()).toContain('正式提交需单独准备 800 × 480 分层资产')
  })

  it('shows normalized safety guides for transparent marks', async () => {
    const wrapper = mount(IconCatalog)

    await wrapper.get('[data-testid="preview-mode-mark"]').trigger('click')
    await wrapper.get('[data-testid="preview-guides"]').trigger('click')
    await nextTick()

    expect(wrapper.get('[data-testid="preview-guides"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('[data-icon="drive"] .preview-stage').attributes('style')).toContain('--preview-keyline-size: 80%')
    expect(wrapper.get('[data-icon="drive"] .icon-glyph').classes()).toContain('i-ylf-drive-mark')
    expect(wrapper.get('[data-icon="brand"] .icon-style').text()).toBe('MARK')
    expect(wrapper.findAll('.preview-guides')).toHaveLength(14)
    expect(wrapper.text()).toContain('参考关键线 / 输出边界')
  })

  it('persists and restores preview settings', async () => {
    const firstWrapper = mount(IconCatalog)

    await firstWrapper.get('[data-testid="preview-mode-platform"]').trigger('click')
    await firstWrapper.get('[data-testid="preview-template-watchos"]').trigger('click')
    await firstWrapper.get('[data-testid="preview-size-32"]').trigger('click')
    await firstWrapper.get('[data-testid="preview-guides"]').trigger('click')
    await nextTick()

    expect(JSON.parse(window.localStorage.getItem(iconPreviewStorageKey) ?? '')).toEqual({
      mode: 'platform',
      template: 'watchos',
      size: 32,
      guides: true,
    })

    firstWrapper.unmount()
    const restoredWrapper = mount(IconCatalog)
    await nextTick()

    expect(restoredWrapper.get('[data-testid="preview-mode-platform"]').attributes('aria-pressed')).toBe('true')
    expect(restoredWrapper.get('[data-testid="preview-template-watchos"]').attributes('aria-pressed')).toBe('true')
    expect(restoredWrapper.get('[data-testid="preview-size-32"]').attributes('aria-pressed')).toBe('true')
    expect(restoredWrapper.get('[data-testid="preview-guides"]').attributes('aria-pressed')).toBe('true')
  })
})

import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import IconCatalog from '../.vitepress/components/IconCatalog.vue'
import { iconPreviewStorageKey } from '../.vitepress/components/icon-preview'

describe('IconCatalog preview controls', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    document.body.innerHTML = ''
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
    expect(wrapper.findAll('.icon-card')).toHaveLength(8)
    expect(wrapper.get('[data-icon="drive"] .icon-glyph').classes()).toContain('i-ylf-drive-app-icon')
  })

  it('switches between mark, complete icon, and platform output', async () => {
    const wrapper = mount(IconCatalog)

    await wrapper.get('[data-testid="preview-mode-app-icon"]').trigger('click')
    await nextTick()

    expect(wrapper.get('[data-icon="drive"] .icon-glyph').classes()).toContain('i-ylf-drive-app-icon')
    expect(wrapper.get('[data-icon="drive"] .preview-stage').attributes('style')).toContain('--preview-mask-radius: 0')
    expect(wrapper.get('[data-icon="brand"] .preview-unavailable').text()).toBe('仅提供主体层')
    expect(wrapper.get('[data-icon="brand"] .icon-style').text()).toBe('N/A')

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

    const stage = wrapper.get('.preview-stage')
    expect(wrapper.get('[data-testid="preview-template-tvos"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('[data-testid="preview-size-24"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('[data-testid="preview-guides"]').attributes('aria-pressed')).toBe('true')
    expect(stage.attributes('data-mask')).toBe('landscape')
    expect(stage.attributes('data-mode')).toBe('platform')
    expect(stage.attributes('style')).toContain('--preview-canvas-width: 24px')
    expect(stage.attributes('style')).toContain('--preview-canvas-height: 14.4px')
    expect(stage.attributes('style')).toContain('--preview-icon-size: 24px')
    expect(wrapper.findAll('.guide-mask')).toHaveLength(7)
    expect(wrapper.text()).toContain('正式提交需单独准备 800 × 480 分层资产')
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

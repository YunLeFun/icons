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

    expect(wrapper.text()).toContain('YunLeFun Preview Reference')
    expect(wrapper.text()).toContain('参考 Apple HIG，非 Apple 官方模板')
    expect(wrapper.get('[data-testid="preview-guides"]').attributes('aria-pressed')).toBe('false')
  })

  it('switches templates, sizes, and guide overlays accessibly', async () => {
    const wrapper = mount(IconCatalog)

    await wrapper.get('[data-testid="preview-template-tvos"]').trigger('click')
    await wrapper.get('[data-testid="preview-size-24"]').trigger('click')
    await wrapper.get('[data-testid="preview-guides"]').trigger('click')
    await nextTick()

    const stage = wrapper.get('.preview-stage')
    expect(wrapper.get('[data-testid="preview-template-tvos"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('[data-testid="preview-size-24"]').attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('[data-testid="preview-guides"]').attributes('aria-pressed')).toBe('true')
    expect(stage.attributes('data-mask')).toBe('landscape')
    expect(stage.attributes('style')).toContain('--preview-template-ratio: 800 / 480')
    expect(stage.attributes('style')).toContain('--preview-icon-size: 24px')
    expect(wrapper.findAll('.guide-mask')).toHaveLength(8)
  })

  it('persists and restores preview settings', async () => {
    const firstWrapper = mount(IconCatalog)

    await firstWrapper.get('[data-testid="preview-template-watchos"]').trigger('click')
    await firstWrapper.get('[data-testid="preview-size-32"]').trigger('click')
    await firstWrapper.get('[data-testid="preview-guides"]').trigger('click')
    await nextTick()

    expect(JSON.parse(window.localStorage.getItem(iconPreviewStorageKey) ?? '')).toEqual({
      template: 'watchos',
      size: 32,
      guides: true,
    })

    firstWrapper.unmount()
    const restoredWrapper = mount(IconCatalog)
    await nextTick()

    expect(restoredWrapper.get('[data-testid="preview-template-watchos"]').attributes('aria-pressed')).toBe('true')
    expect(restoredWrapper.get('[data-testid="preview-size-32"]').attributes('aria-pressed')).toBe('true')
    expect(restoredWrapper.get('[data-testid="preview-guides"]').attributes('aria-pressed')).toBe('true')
  })
})

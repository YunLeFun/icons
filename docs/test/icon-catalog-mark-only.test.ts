import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import IconCatalog from '../.vitepress/components/IconCatalog.vue'

// A brand product without a complete icon falls back to its transparent mark in every preview mode.
vi.mock('@yunlefun/icons', async (importOriginal) => {
  const original = await importOriginal<typeof import('@yunlefun/icons')>()
  return { ...original, iconMetadata: original.iconMetadata.filter(icon => icon.name !== 'brand-app-icon') }
})

describe('IconCatalog mark-only brand products', () => {
  afterEach(() => {
    window.localStorage.clear()
    document.body.innerHTML = ''
  })

  it('previews the mark and labels the missing complete icon', () => {
    const wrapper = mount(IconCatalog)
    const card = wrapper.get('[data-icon="brand"]')

    expect(card.get('.icon-glyph').classes()).toContain('i-ylf-brand-mark')
    expect(card.get('.icon-glyph').attributes('aria-label')).toContain('未提供完整图标')
    expect(card.get('.preview-stage').attributes('data-mode')).toBe('mark')
    expect(card.get('.preview-stage').attributes('style')).toContain('--preview-mask-radius: 0')
    expect(card.get('.icon-style').text()).toBe('MARK ONLY')
    expect(card.get('.source-status').text()).toBe('SYNC')
  })
})

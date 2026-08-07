import type { IconifyJSON } from '@iconify/types'
import { createGenerator, presetIcons } from 'unocss'
import { describe, expect, it } from 'vitest'
import iconsConfig from '../../../icons.config'
import iconsJSON from '../icons.json' with { type: 'json' }
import metadataJSON from '../metadata.json' with { type: 'json' }
import { iconNames } from '../src'

const icons = iconsJSON as IconifyJSON

describe('@yunlefun/icons', () => {
  it('exports a complete Iconify collection', () => {
    const exportedIconNames = Object.keys(icons.icons).sort()
    const metadataNames = metadataJSON.map(item => item.name).sort()

    expect(icons.prefix).toBe(iconsConfig.prefix)
    expect(exportedIconNames).toEqual(metadataNames)
    expect(exportedIconNames.length).toBeGreaterThan(0)
    expect(icons.info).toEqual(iconsConfig.collection)
    expect(iconNames).toEqual(exportedIconNames)
    expect(icons.aliases).toBeUndefined()

    for (const icon of Object.values(icons.icons))
      expect(icon.body).toMatch(/^</)
  })

  it('applies configured color strategies', () => {
    expect(icons.icons['brand-mark'].body).toContain('currentColor')
    expect(icons.icons['apps-app-icon'].body).toContain('#0078e7')
    expect(icons.icons['apps-app-icon'].body).toContain('#fff')
  })

  it('provides explicitly named mark and app-icon variants', () => {
    const products = [...new Set(metadataJSON.map(item => item.product))]

    for (const product of products) {
      const entries = metadataJSON.filter(item => item.product === product)
      expect(entries.some(item => item.variant === 'mark')).toBe(true)

      for (const entry of entries)
        expect(entry.name).toBe(`${entry.product}-${entry.variant}`)

      if (entries[0].category === 'application')
        expect(entries.some(item => item.variant === 'app-icon')).toBe(true)
    }
  })

  it('renders every icon through UnoCSS preset-icons', async () => {
    const generator = await createGenerator({
      presets: [
        presetIcons({
          collections: {
            ylf: () => icons,
          },
        }),
      ],
    })
    const tokens = iconNames.map(name => `i-ylf-${name}`)
    const { css } = await generator.generate(tokens.join(' '))

    for (const token of tokens)
      expect(css).toContain(`.${token}`)
  })
})

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
    expect(icons.icons['go-far-away-mark'].body).toContain('currentColor')
    expect(icons.icons['go-far-away-mark'].body).toContain('#1e91fd')
    expect(icons.icons['go-far-away-mark'].body).toContain('#82c14a')
    expect(icons.icons['go-far-away-app-icon'].body).not.toContain('currentColor')
  })

  it('provides explicitly named mark and app-icon variants', () => {
    const products = [...new Set(metadataJSON.map(item => item.product))]

    for (const product of products) {
      const entries = metadataJSON.filter(item => item.product === product)
      expect(entries.some(item => item.variant === 'mark')).toBe(true)

      for (const entry of entries)
        expect(entry.name).toBe(`${entry.product}-${entry.variant}`)

      if (entries[0].category !== 'brand')
        expect(entries.some(item => item.variant === 'app-icon')).toBe(true)
    }
  })

  it('provides consistent HTTPS website links for products that have sites', () => {
    const expectedWebsites: Record<string, string | undefined> = {
      apps: 'https://apps.yunle.fun/',
      brand: 'https://www.yunle.fun/',
      cms: 'https://cms.yunle.fun/',
      drive: 'https://drive.yunle.fun/',
      'go-far-away': 'https://go-far-away.yyj.moe/',
      home: 'https://www.yunle.fun/',
      play: 'https://play.yunle.fun/',
      skykeeper: undefined,
      support: 'https://support.yunle.fun/',
    }
    const products = [...new Set(metadataJSON.map(item => item.product))]

    expect(products.sort()).toEqual(Object.keys(expectedWebsites).sort())

    for (const product of products) {
      const entries = metadataJSON.filter(item => item.product === product)
      const websites = entries.map(entry => 'website' in entry ? entry.website : undefined)

      expect(new Set(websites).size).toBe(1)
      expect(websites[0]).toBe(expectedWebsites[product])
      if (websites[0])
        expect(new URL(websites[0]).protocol).toBe('https:')
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

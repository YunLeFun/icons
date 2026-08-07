import type { IconifyJSON } from '@iconify/types'
import { createGenerator, presetIcons } from 'unocss'
import { describe, expect, it } from 'vitest'
import iconsConfig from '../../../icons.config'
import iconsJSON from '../icons.json' with { type: 'json' }
import metadataJSON from '../metadata.json' with { type: 'json' }

const icons = iconsJSON as IconifyJSON

describe('@yunlefun/icons', () => {
  it('exports a complete Iconify collection', () => {
    const iconNames = Object.keys(icons.icons).sort()
    const metadataNames = metadataJSON.map(item => item.name).sort()

    expect(icons.prefix).toBe(iconsConfig.prefix)
    expect(iconNames).toEqual(metadataNames)
    expect(iconNames.length).toBeGreaterThan(0)
    expect(icons.info).toEqual(iconsConfig.collection)

    for (const icon of Object.values(icons.icons))
      expect(icon.body).toMatch(/^</)
  })

  it('applies configured color strategies', () => {
    expect(icons.icons.brand.body).toContain('currentColor')
    expect(icons.icons.apps.body).toContain('#0078e7')
    expect(icons.icons.apps.body).toContain('#fff')
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
    const tokens = Object.keys(icons.icons).map(name => `i-ylf-${name}`)
    const { css } = await generator.generate(tokens.join(' '))

    for (const token of tokens)
      expect(css).toContain(`.${token}`)
  })
})

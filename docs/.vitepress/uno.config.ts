import { iconNames } from '@yunlefun/icons'
import { defineConfig, presetIcons } from 'unocss'

export default defineConfig({
  safelist: iconNames.map(name => `i-ylf-${name}`),
  presets: [
    presetIcons({
      collections: {
        ylf: () => import('@yunlefun/icons/icons.json', { with: { type: 'json' } })
          .then(module => module.default),
      },
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
})

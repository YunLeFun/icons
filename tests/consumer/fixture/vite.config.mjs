import { readFileSync } from 'node:fs'
import vue from '@vitejs/plugin-vue'
import collection from '@yunlefun/icons/icons.json' with { type: 'json' }
import { defineConfig, presetIcons } from 'unocss'
import UnoCSS from 'unocss/vite'

export default {
  plugins: [
    vue(),
    UnoCSS(defineConfig({
      presets: [presetIcons({ collections: { ylf: () => ({ ...collection, icons: { ...collection.icons, 'reference-probe': JSON.parse(readFileSync('generated/probe.json', 'utf8')) } }) } })],
      safelist: JSON.parse(readFileSync('generated/rows.json', 'utf8')).map(row => `i-ylf-${row.name}`),
    })),
  ],
  esbuild: { jsx: 'automatic' },
}

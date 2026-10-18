import { resolve } from 'node:path'
import { generateBrandAssets } from 'vitepress-theme-yunlefun/brand-assets'

// Regenerate after a brand-mark or theme palette change, then commit docs/public.
await generateBrandAssets({
  outDir: resolve(import.meta.dirname, '../public'),
  icon: 'brand-mark',
  title: '云乐坊图标',
})

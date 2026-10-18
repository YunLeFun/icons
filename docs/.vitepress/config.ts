import { resolve } from 'node:path'
import { copyFile, mkdir } from 'node:fs/promises'
import { defineConfig } from 'vitepress'
import { withYunlefun, yunlefunMarkdown, zhThemeConfig } from 'vitepress-theme-yunlefun/config'
import { publishCanonicalIconAssets } from './published-icon-assets.ts'

export default defineConfig(withYunlefun({
  lang: 'zh-CN',
  title: '云乐坊图标',
  description: '云乐坊品牌与产品图标集',
  cleanUrls: true,
  sitemap: {
    hostname: 'https://icons.yunle.fun',
  },
  buildEnd: async ({ outDir }) => {
    await publishCanonicalIconAssets(
      resolve(import.meta.dirname, '../../packages/icons/svg'),
      outDir,
    )
    const metadataDir = resolve(outDir, 'app-assets')
    await mkdir(metadataDir, { recursive: true })
    await copyFile(resolve(import.meta.dirname, '../../assets/catalog/app-assets.json'), resolve(metadataDir, 'manifest.json'))
  },
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['link', { rel: 'icon', href: '/favicon-32.png', sizes: '32x32', type: 'image/png' }],
    ['link', { rel: 'icon', href: '/favicon-16.png', sizes: '16x16', type: 'image/png' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    ['meta', { name: 'theme-color', content: '#f8fafc', media: '(prefers-color-scheme: light)' }],
    ['meta', { name: 'theme-color', content: '#0b111c', media: '(prefers-color-scheme: dark)' }],
  ],
  markdown: { config: md => md.use(yunlefunMarkdown) },
  themeConfig: {
    ...zhThemeConfig,
    brand: { icon: 'brand-mark' },
    nav: [
      { text: '图标目录', link: '/' },
      { text: '应用素材', link: '/app-assets' },
      { text: '设计系统', link: 'https://ui.yunle.fun/' },
      { text: '接入指南', link: '/guide/usage' },
    ],
    sidebar: [
      {
        text: '使用',
        items: [
          { text: '接入指南', link: '/guide/usage' },
          { text: '贡献图标', link: '/guide/contributing' },
          { text: '应用素材契约', link: '/guide/app-artwork' },
          { text: 'App 原稿与平台资源', link: '/guide/app-assets' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/YunLeFun/icons' },
    ],
    footer: {
      message: 'SVG source, Iconify data, one catalog.',
      copyright: 'Copyright © 2026 YunLeFun',
    },
  },
}))

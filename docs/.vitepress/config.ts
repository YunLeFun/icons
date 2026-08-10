import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'YunLeFun Icons',
  description: '云乐坊品牌与产品图标集',
  cleanUrls: true,
  sitemap: {
    hostname: 'https://icons.yunle.fun',
  },
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    ['meta', { name: 'theme-color', content: '#F4F1E8' }],
  ],
  themeConfig: {
    logo: '/favicon.svg',
    nav: [
      { text: '图标目录', link: '/' },
      { text: '接入指南', link: '/guide/usage' },
    ],
    sidebar: [
      {
        text: '使用',
        items: [
          { text: '接入指南', link: '/guide/usage' },
          { text: '贡献图标', link: '/guide/contributing' },
        ],
      },
    ],
    search: {
      provider: 'local',
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/YunLeFun/icons' },
    ],
    footer: {
      message: 'SVG source, Iconify data, one catalog.',
      copyright: 'Copyright © 2026 YunLeFun',
    },
  },
})

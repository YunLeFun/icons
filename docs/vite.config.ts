import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'
import unoConfig from './.vitepress/uno.config.ts'

export default defineConfig({
  plugins: [
    UnoCSS(unoConfig),
  ],
})

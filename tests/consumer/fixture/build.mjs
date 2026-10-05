import { Buffer } from 'node:buffer'
import { writeFile } from 'node:fs/promises'
import vue from '@vitejs/plugin-vue'
import collection from '@yunlefun/icons/icons.json' with { type: 'json' }
import { defineConfig, presetIcons } from 'unocss'
import UnoCSS from 'unocss/vite'
import { build } from 'vite'

const modules = {}
await build({
  plugins: [{
    name: 'record-consumer-modules',
    generateBundle(_options, bundle) {
      for (const [name, item] of Object.entries(bundle)) {
        if (item.type === 'chunk')
          modules[name] = Object.fromEntries(Object.entries(item.modules).map(([id, value]) => [id, value.renderedLength]))
      }
    },
  }],
})
await writeFile('dist/modules.json', JSON.stringify(modules, null, 2))

// Independent entry builds ensure gallery imports/safelists cannot hide tree-shaking regressions.
for (const driver of ['uno', 'iconify', 'vue', 'react']) {
  const result = await build({
    configFile: false,
    publicDir: false,
    plugins: [vue(), UnoCSS(defineConfig({ presets: [presetIcons({ collections: { ylf: () => collection } })], safelist: driver === 'uno' ? ['i-ylf-brand-mark'] : [] }))],
    esbuild: { jsx: 'automatic' },
    build: { outDir: `dist/single/${driver}`, rollupOptions: { input: `single/${driver}.${driver === 'react' ? 'tsx' : 'ts'}` } },
  })
  const outputs = Array.isArray(result) ? result.flatMap(item => item.output) : result.output
  const manifest = outputs.map(item => ({
    file: item.fileName,
    bytes: Buffer.byteLength(item.type === 'chunk' ? item.code : item.source),
    modules: item.type === 'chunk' ? Object.fromEntries(Object.entries(item.modules).map(([id, value]) => [id, value.renderedLength])) : {},
  }))
  await writeFile(`dist/single/${driver}/modules.json`, JSON.stringify(manifest, null, 2))
  await writeFile(`dist/single/${driver}/index.html`, `<!doctype html><html><head><title>Single ${driver} icon</title>${outputs.filter(item => item.fileName.endsWith('.css')).map(item => `<link rel="stylesheet" href="./${item.fileName}">`).join('')}</head><body style="margin:0;color:#0891b2"><div id="app"></div>${outputs.filter(item => item.type === 'chunk' && item.isEntry).map(item => `<script type="module" src="./${item.fileName}"></script>`).join('')}</body></html>`)
}

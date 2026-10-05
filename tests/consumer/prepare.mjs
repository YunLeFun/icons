import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { cp, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../..')
const output = resolve(root, '.artifacts/consumer')
const project = resolve(output, 'project')
const run = (command, args, cwd = project) => execFileSync(command, args, { cwd, stdio: 'inherit' })

await mkdir(output, { recursive: true })
await rm(project, { recursive: true, force: true })
await cp(resolve(here, 'fixture'), project, { recursive: true })
run('pnpm', ['pack', '--out', resolve(project, 'icons.tgz')], resolve(root, 'packages/icons'))

const { devDependencies } = JSON.parse(await readFile(resolve(here, 'package.json'), 'utf8'))
const dependencies = { '@yunlefun/icons': 'file:./icons.tgz' }
for (const name of Object.keys(devDependencies)) {
  if (['@playwright/test', 'pngjs'].includes(name))
    continue
  // Exact installed versions are pinned by the repository lockfile, not registry "latest".
  dependencies[name] = JSON.parse(await readFile(resolve(here, 'node_modules', name, 'package.json'), 'utf8')).version
}
await writeFile(resolve(project, 'package.json'), `${JSON.stringify({
  name: 'yunlefun-icons-packed-consumer',
  private: true,
  type: 'module',
  scripts: {
    generate: 'tsx generate.mjs',
    typecheck: 'vue-tsc --noEmit',
    build: 'pnpm generate && pnpm typecheck && node build.mjs',
    dev: 'vite --host 127.0.0.1',
    preview: 'vite preview --host 127.0.0.1',
  },
  dependencies,
}, null, 2)}\n`)
// A nested workspace prevents pnpm from resolving @yunlefun/icons to the source checkout.
await writeFile(resolve(project, 'pnpm-workspace.yaml'), 'packages: []\nallowBuilds:\n  esbuild: true\n')
await cp(resolve(root, 'docs/.vitepress/components/icon-download.ts'), resolve(project, 'icon-download.ts'))
run('pnpm', ['install', '--ignore-scripts', '--no-frozen-lockfile'])
const installed = await realpath(resolve(project, 'node_modules/@yunlefun/icons'))
assert.ok(installed.startsWith(`${project}/node_modules/`), `Package escaped the consumer: ${installed}`)
const manifest = JSON.parse(await readFile(resolve(installed, 'package.json'), 'utf8'))
for (const group of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
  for (const [name, version] of Object.entries(manifest[group] ?? {}))
    assert.doesNotMatch(version, /^(?:catalog|workspace|file|link):/, `${name} is not portable`)
}
run('pnpm', ['build'])
console.log(`Standalone packed consumer: ${project}`)

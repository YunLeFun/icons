import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

const directory = await mkdtemp(resolve(tmpdir(), 'yunlefun-icons-pack-'))
try {
  const tarball = resolve(directory, 'icons.tgz')
  execFileSync('pnpm', ['pack', '--out', tarball], { stdio: 'inherit' })
  const manifest = JSON.parse(execFileSync('tar', ['-xOf', tarball, 'package/package.json'], { encoding: 'utf8' }))
  for (const group of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
    for (const [name, version] of Object.entries(manifest[group] || {}))
      assert.doesNotMatch(version, /^(?:catalog|workspace|file|link):/, `${name} must install outside the workspace`)
  }
  console.log('Packed dependencies use portable registry specifiers.')
}
finally {
  await rm(directory, { recursive: true, force: true })
}

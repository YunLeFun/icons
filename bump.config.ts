import { defineConfig } from 'bumpp'

export default defineConfig({
  files: [
    'packages/icons/package.json',
  ],
  commit: 'chore(release): v%s',
  execute: 'pnpm changelog',
  push: false,
  tag: 'v%s',
})

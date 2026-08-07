// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  ignores: [
    'packages/icons/icons.json',
    'packages/icons/src/generated.ts',
    'docs/.vitepress/cache/**',
    'docs/.vitepress/dist/**',
  ],
})

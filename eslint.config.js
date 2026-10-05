// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  ignores: [
    'packages/icons/icons.json',
    'packages/icons/src/generated.ts',
    'docs/.vitepress/cache/**',
    'docs/.vitepress/dist/**',
    '.artifacts/**',
    'packages/icons/icons/**',
  ],
}, {
  // These files are executable acceptance/build scripts, not library entry points.
  files: ['tests/consumer/**/*.mjs'],
  rules: {
    'antfu/no-top-level-await': 'off',
    'no-console': 'off',
  },
})

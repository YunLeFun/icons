// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  ignores: [
    // Icon Composer owns the JSON serialization inside native icon bundles.
    'assets/apps/**/*.icon/**',
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

// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}'],
    ignores: ['components/ui/hugeicons-icon.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@hugeicons/react-native',
              message: 'Use @/components/ui/hugeicons-icon so HugeiconsIcon defaults pointerEvents to none.',
            },
          ],
        },
      ],
    },
  },
]);

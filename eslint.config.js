import airbnb from 'eslint-config-flat-airbnb'
import eslintConfigPrettier from 'eslint-config-prettier'
import reactRefresh from 'eslint-plugin-react-refresh'

export default airbnb(
  {
    typescript: {
      overrides: {
        '@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: true }],
      },
    },
    react: {
      overrides: {
        'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.tsx'] }],
        'react/jsx-props-no-spreading': 'off',
        'react/require-default-props': 'off',
      },
    },
    imports: { cycle: true },
    overrides: {
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-void': ['error', { allowAsStatement: true }],
      'import/prefer-default-export': 'off',
      'import/extensions': 'off',
      'jsx-a11y/label-has-associated-control': [
        'error',
        {
          controlComponents: ['PasswordField', 'SearchableSelect', 'FormSelect'],
          depth: 5,
        },
      ],
    },
  },
  {
    ignores: [
      'dist',
      'node_modules',
      'playwright-report',
      'test-results',
      'legacy',
      'src/routeTree.gen.ts',
      'supabase/functions',
      'eslint.config.js',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['src/routes/**/*.tsx'],
    rules: {
      '@typescript-eslint/only-throw-error': 'off',
    },
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        URL: 'readonly',
        fetch: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-plusplus': 'off',
      'no-restricted-syntax': 'off',
      'prefer-template': 'off',
      'prefer-destructuring': 'off',
      'import/no-extraneous-dependencies': 'off',
      'no-await-in-loop': 'off',
      'no-continue': 'off',
    },
  },
  {
    files: ['e2e/**/*.ts'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },
  eslintConfigPrettier,
)

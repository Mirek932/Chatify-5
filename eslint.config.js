import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.ts'],
    ignores: ['node_modules/**', 'dist/**'], // ✅ skip node_modules + dist
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        window: true,
        document: true,
        localStorage: true,
        setTimeout: true,
        clearTimeout: true,
        setInterval: true,
        clearInterval: true,
        console: true,
        URLSearchParams: true,
        io: true,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: prettierPlugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs['recommended-type-checked'].rules,
      'prettier/prettier': 'warn',
      'no-plusplus': 'off',
      'no-underscore-dangle': 'off',
      'import/prefer-default-export': 'off',
    },
  },
  prettierConfig,
];

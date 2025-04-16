import { fileURLToPath } from 'node:url'
import { includeIgnoreFile } from '@eslint/compat'
import svelte from 'eslint-plugin-svelte'
import tseslint from 'typescript-eslint'

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url))

export default tseslint.config(
  includeIgnoreFile(gitignorePath),
  ...svelte.configs['flat/recommended'],
  ...svelte.configs['flat/prettier'],

  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],

    languageOptions: {
      parserOptions: {
        projectService: true,
        parser: tseslint.parser,
        extraFileExtensions: ['.svelte'],
      },
    },

    rules: {
      'svelte/no-at-html-tags': 'off',
    },
  },
)

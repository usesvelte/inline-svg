import { fileURLToPath } from 'node:url'
import tseslint from 'typescript-eslint'
import svelte from 'eslint-plugin-svelte'
import { defineConfig } from 'eslint/config'
import { includeIgnoreFile } from '@eslint/config-helpers'

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url))

export default defineConfig(
  includeIgnoreFile(gitignorePath),
  ...tseslint.configs.recommended,
  ...svelte.configs['flat/recommended'],
  ...svelte.configs['flat/prettier'],
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js', '**/*.ts'],

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

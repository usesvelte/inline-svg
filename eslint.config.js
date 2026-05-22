import path from 'node:path'
import tseslint from 'typescript-eslint'
import svelte from 'eslint-plugin-svelte'
import { defineConfig } from 'eslint/config'
import { includeIgnoreFile } from '@eslint/config-helpers'

const ignorePath = path.join(import.meta.dirname, '.gitignore')

export default defineConfig([
  includeIgnoreFile(ignorePath, {
    gitignoreResolution: true,
  }),
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
])

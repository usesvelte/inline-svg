import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'
import { compile } from 'svelte/compiler'
import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { inlineSvg } from './src/vite/index.js'

function ssrVariant(): Plugin {
  return {
    name: 'inline-svg:ssr-variant',
    transform(_code, id) {
      const [filename, query] = id.split('?')
      if (query !== 'ssr' || filename === undefined || !filename.endsWith('.svelte')) return
      const source = readFileSync(filename, 'utf8')
      const compiled = compile(source, {
        filename,
        dev: true,
        runes: true,
        generate: 'server',
      })
      return { code: compiled.js.code, map: compiled.js.map }
    },
  }
}

export default defineConfig({
  plugins: [svelte(), inlineSvg(), ssrVariant()],
  resolve: {
    conditions: ['browser'],
  },
  test: {
    environment: 'node',
  },
})

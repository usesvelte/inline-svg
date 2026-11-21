import { defineConfig } from 'astro/config'
import svelte from '@astrojs/svelte'
import inlineSvg from '@usesvelte/inline-svg/astro'

export default defineConfig({
  integrations: [svelte(), inlineSvg()],
})

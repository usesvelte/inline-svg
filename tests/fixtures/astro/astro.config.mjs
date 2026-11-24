import { defineConfig } from 'astro/config'
import svelte from '@astrojs/svelte'
import inlineSvg from '@usesvelte/inline-svg/astro'

const withoutInlineSvg = process.env.E2E_WITHOUT_INLINE_SVG === '1'

export default defineConfig({
  integrations: withoutInlineSvg ? [svelte()] : [svelte(), inlineSvg()],
})

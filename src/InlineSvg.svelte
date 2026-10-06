<script lang="ts">
  import { SVGS } from './_internal/icons.js'
  import type { InlineSvgProps } from './types.js'

  const { name, ...customSvgAttrs }: InlineSvgProps = $props()

  const EMPTY: (typeof SVGS)[string] = { attrs: {}, content: '' }
  const svg = $derived(SVGS[name] ?? missingIcon(name))

  function missingIcon(iconName: string) {
    console.warn(`[inline-svg] "${iconName}" was not found in the icons directory`)
    return EMPTY
  }
</script>

<svg xmlns="http://www.w3.org/2000/svg" {...svg.attrs} {...customSvgAttrs}>
  {@html svg.content}
</svg>

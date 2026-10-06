<script module lang="ts">
  const warned: Record<string, true> = {}

  function missingIcon(iconName: string) {
    if (warned[iconName] !== true) {
      warned[iconName] = true
      console.warn(`[inline-svg] "${iconName}" was not found in the icons directory`)
    }

    return { attrs: {}, content: '' }
  }
</script>

<script lang="ts">
  import { SVGS } from './_internal/icons.js'
  import type { InlineSvgProps } from './types.js'

  const { name, ...customSvgAttrs }: InlineSvgProps = $props()

  const svg = $derived(SVGS[name] ?? missingIcon(name))
</script>

<svg xmlns="http://www.w3.org/2000/svg" {...svg.attrs} {...customSvgAttrs}>
  {@html svg.content}
</svg>

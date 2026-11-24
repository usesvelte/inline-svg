<script module lang="ts">
  // Null prototype: "__proto__" and other inherited keys must work as icon names.
  const warned: Record<string, true> = Object.create(null)

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

  function getSvg(iconName: string): (typeof SVGS)[string] {
    // Indexing a plain object would resolve inherited keys such as "toString".
    if (!Object.prototype.hasOwnProperty.call(SVGS, iconName)) return missingIcon(iconName)
    return SVGS[iconName]!
  }

  const svg = $derived(getSvg(name))
</script>

<svg xmlns="http://www.w3.org/2000/svg" {...svg.attrs} {...customSvgAttrs}>
  {@html svg.content}
</svg>

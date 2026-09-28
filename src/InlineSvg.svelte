<script lang="ts">
  import { SVGS } from './_internal/icons.js'
  import { parseSvg } from './_internal/parse-svg.js'
  import type { InlineSvgProps } from './types.js'

  const { name, ...customSvgAttrs }: InlineSvgProps = $props()

  const svg = $derived(parseSvg(SVGS[name], name))
</script>

<svg xmlns="http://www.w3.org/2000/svg" {...svg.attrs} {...customSvgAttrs}>
  {@html svg.content}
</svg>

<script>
  /**
   * @typedef {import('./types.ts').InlineSvgProps} InlineSvgProps
   */

  /** @type {string} */
  let svgContent = $state('')
  /** @type {Record<string, string>} */
  let svgAttrs = $state({})

  /** @type {InlineSvgProps} */
  const { name, ...customSvgAttrs } = $props()

  /**
   * @param {string} raw
   * Svg component in plain text
   * @returns {{ attrs: Record<string, string>, content: string }}
   * Attributes of the svg and its contents are returned separated within an object
   */
  function parseInlineSvg(raw) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(raw, 'image/svg+xml')
    const svg = doc.querySelector('svg')

    if (svg == null) {
      console.warn(`Invalid format: ${name} svg`)
      return { attrs: {}, content: raw }
    }

    /** @type {string} */
    const content = svg.innerHTML
    /** @type {Record<string, string>} */
    const attrs = {}

    for (const attr of svg.attributes) {
      attrs[attr.name] = attr.value
    }

    return { attrs, content }
  }

  /**
   * @param {string} name
   * Name of the svg to render
   */
  function loadIcon(name) {
    /** @type {Record<string, string>} */
    const svgModules = import.meta.glob('/src/icons/**/*.svg', {
      eager: true,
      query: '?raw',
      import: 'default',
    })
    const raw = svgModules[`/src/icons/${name}.svg`]
    const { attrs, content } = parseInlineSvg(raw)
    svgAttrs = attrs
    svgContent = content
  }

  $effect(() => {
    if (name) loadIcon(name)
  })
</script>

<svg xmlns="http://www.w3.org/2000/svg" {...svgAttrs} {...customSvgAttrs}>
  {@html svgContent}
</svg>

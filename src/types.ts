import type { SVGAttributes } from 'svelte/elements'

export interface InlineSvgProps extends Omit<SVGAttributes<SVGSVGElement>, 'className' | 'classList'> {
  /**
   * Name of the svg to render: a file of the icons directory, without its `.svg` extension.
   *
   * The `inlineSvg` Vite plugin generates a declaration that types the real names as the `IconName`
   * union of the `virtual:usesvelte/inline-svg` module, which you can import wherever you need
   * it: `import type { IconName } from 'virtual:usesvelte/inline-svg'`.
   */
  name: string
}

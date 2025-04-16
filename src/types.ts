import type { SVGAttributes } from 'svelte/elements'

export interface InlineSvgProps extends Omit<SVGAttributes<SVGSVGElement>, 'className' | 'classList'> {
  /** Name of the svg to render */
  name: string
}

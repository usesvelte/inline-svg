import { icons } from 'virtual:usesvelte/inline-svg/icons'

/**
 * Markup of every svg of the icons directory, keyed by the name given to `InlineSvg`.
 *
 * The content is injected at build time by the `inlineSvg` Vite plugin, which is the only way to
 * read the consumer's own files without shipping them inside the library.
 */
export const SVGS: Record<string, string> = icons

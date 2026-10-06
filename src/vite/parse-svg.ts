const CLOSING_SVG_TAG = /<\/svg\s*>/gi
const OPENING_SVG_TAG = /<svg(?=[\s/>])([^>]*?)(\/?>|$)/i
const ATTRIBUTE = /(?:([^\s"'<>/=]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))|([^\s"'<>/=]+)/g

export interface ParsedSvg {
  /** Attributes of the root `<svg>` element */
  attrs: Record<string, string>
  /** Markup of everything inside the root `<svg>` element */
  content: string
}

const EMPTY: ParsedSvg = { attrs: {}, content: '' }

function warn(message: string): ParsedSvg {
  console.warn(`[inline-svg] ${message}`)
  return EMPTY
}

function collectAttrsFromMarkup(markup: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  for (const match of markup.matchAll(ATTRIBUTE)) {
    if (match[1] != null) attrs[match[1]] = match[2] ?? match[3] ?? match[4] ?? ''
    else if (match[5] != null) attrs[match[5]] = ''
  }
  return attrs
}

/**
 * Parses the markup of an svg with a plain regular expression, separating the attributes of the
 * root element from its contents. Runs in Node, inside the vite plugin, so that the server and the
 * client receive the same parsed result.
 */
function parseMarkup(raw: string, name: string): ParsedSvg {
  const opening = OPENING_SVG_TAG.exec(raw)
  if (opening == null) return warn(`"${name}" has no <svg> element`)

  const start = (opening.index ?? 0) + opening[0].length
  const attrs = collectAttrsFromMarkup(opening[1] ?? '')

  if (opening[2] === '/>') return { attrs, content: '' }

  const closing = [...raw.matchAll(CLOSING_SVG_TAG)].pop()
  const lastClosing = closing?.index ?? -1
  if (lastClosing === -1) return warn(`"${name}" has an unclosed <svg> element`)

  return { attrs, content: raw.slice(start, lastClosing) }
}

/**
 * Separates the attributes of an svg from its contents, so that both can be rendered by the
 * component.
 *
 * @param raw Markup of the svg, as read from the file
 * @param name Name of the icon, only used to report errors
 */
export function parseSvg(raw: string | undefined, name: string): ParsedSvg {
  if (raw == null || raw.trim() === '') return warn(`"${name}" was not found in the icons directory`)

  return parseMarkup(raw, name)
}

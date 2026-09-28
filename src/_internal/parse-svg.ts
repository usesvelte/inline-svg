const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

const OPENING_SVG_TAG = /<svg(?=[\s/>])([^>]*?)(\/?>|$)/i
const CLOSING_SVG_TAG = /<\/svg\s*>/gi
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

function collectAttrs(element: Element): Record<string, string> {
  const attrs: Record<string, string> = {}
  for (const attr of element.attributes) attrs[attr.name] = attr.value
  return attrs
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
 * Parses an svg with the DOM, which is the most accurate way, but only available on the browser.
 */
function parseWithDom(raw: string, name: string): ParsedSvg {
  const doc = new DOMParser().parseFromString(raw, 'image/svg+xml')
  const root = doc.documentElement

  if (root == null || doc.querySelector('parsererror') != null) {
    return warn(`"${name}" is not a valid xml document`)
  }

  if (root.namespaceURI !== SVG_NAMESPACE || root.localName !== 'svg') {
    return warn(`"${name}" has a <${root.localName}> element as root, expected <svg>`)
  }

  return { attrs: collectAttrs(root), content: root.innerHTML }
}

/**
 * Same as {@link parseWithDom} but without a DOM, for environments like the server, where the
 * markup of an svg is parsed with a plain regular expression instead.
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

  return typeof DOMParser === 'undefined' ? parseMarkup(raw, name) : parseWithDom(raw, name)
}

const ATTRIBUTE = /(?:([^\s"'<>/=]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))|([^\s"'<>/=]+)/g

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
}

export interface ParsedSvg {
  /** Attributes of the root `<svg>` element */
  attrs: Record<string, string>
  /** Markup of everything inside the root `<svg>` element */
  content: string
}

const warned = new Set<string>()

function warn(name: string, message: string): ParsedSvg {
  if (!warned.has(name)) {
    warned.add(name)
    console.warn(`[inline-svg] ${message}`)
  }
  return { attrs: {}, content: '' }
}

function decodeEntities(value: string): string {
  if (!value.includes('&')) return value

  return value.replace(/&(?:#(\d+)|#x([0-9a-fA-F]+)|([a-zA-Z]+));/g, (match, dec, hex, named) => {
    if (dec == null && hex == null) return NAMED_ENTITIES[named] ?? match

    const code = dec != null ? Number(dec) : Number.parseInt(hex, 16)
    return code <= 0x10ffff ? String.fromCodePoint(code) : match
  })
}

function collectAttrsFromMarkup(markup: string): Record<string, string> {
  const attrs: Record<string, string> = {}
  for (const match of markup.matchAll(ATTRIBUTE)) {
    if (match[1] != null) attrs[match[1]] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? '')
    else if (match[5] != null) attrs[match[5]] = ''
  }
  return attrs
}

/**
 * Index of the `>` that closes the tag opened at `start`, skipping the ones inside quoted
 * attribute values, or -1 when the tag is never closed.
 */
function findTagEnd(raw: string, start: number): number {
  let quote = ''

  for (let index = start + 1; index < raw.length; index++) {
    const char = raw.charAt(index)
    if (quote !== '') {
      if (char === quote) quote = ''
    } else if (char === '"' || char === "'") {
      quote = char
    } else if (char === '>') {
      return index
    }
  }

  return -1
}

/**
 * Index of the `>` that closes the `<!DOCTYPE ...>` opened at `start`, honouring the `[...]` of an
 * internal subset, or -1 when it is never closed.
 */
function findDoctypeEnd(raw: string, start: number): number {
  let brackets = 0
  let quote = ''

  for (let index = start + 2; index < raw.length; index++) {
    const char = raw.charAt(index)
    if (quote !== '') {
      if (char === quote) quote = ''
    } else if (char === '"' || char === "'") {
      quote = char
    } else if (char === '[') {
      brackets++
    } else if (char === ']') {
      brackets--
    } else if (char === '>' && brackets === 0) {
      return index
    }
  }

  return -1
}

/**
 * Index of the first character after the misc of a document (whitespace, processing instructions,
 * comments and doctype), or -1 when one of them is never closed.
 */
function skipMisc(raw: string, from: number): number {
  let index = from

  while (index < raw.length) {
    const char = raw.charAt(index)

    if (char !== '<') {
      if (/\s/.test(char)) index++
      else break
      continue
    }

    if (raw.startsWith('<?', index)) {
      const end = raw.indexOf('?>', index + 2)
      if (end === -1) return -1
      index = end + 2
    } else if (raw.startsWith('<!--', index)) {
      const end = raw.indexOf('-->', index + 4)
      if (end === -1) return -1
      index = end + 3
    } else if (raw.startsWith('<!', index)) {
      const end = findDoctypeEnd(raw, index)
      if (end === -1) return -1
      index = end + 1
    } else {
      break
    }
  }

  return index
}

function isSvgOpening(raw: string, start: number): boolean {
  if (!raw.startsWith('<svg', start)) return false
  const next = raw.charAt(start + 4)
  return next === '' || /[\s/>]/.test(next)
}

/**
 * Parses the markup of an svg with a plain scanner, so the server and the client, which both run
 * this code from the virtual module of the vite plugin, always receive the same result. The
 * scanner skips the prolog (comments, processing instructions and doctype), reads the attributes
 * of the root `<svg>` respecting quoted `>` characters, and walks the tree with a stack to return
 * the exact content of the root element and to reject markup that is not well-formed xml.
 */
function parseMarkup(raw: string, name: string): ParsedSvg {
  const openingStart = skipMisc(raw, 0)
  if (openingStart === -1) return warn(name, `"${name}" is not a valid xml document`)
  if (!isSvgOpening(raw, openingStart)) return warn(name, `"${name}" has no <svg> element`)

  const openingEnd = findTagEnd(raw, openingStart)
  if (openingEnd === -1) return warn(name, `"${name}" has an unclosed <svg> element`)

  const selfClosing = raw.charAt(openingEnd - 1) === '/'
  const attrs = collectAttrsFromMarkup(raw.slice(openingStart + 4, openingEnd - (selfClosing ? 1 : 0)))
  if (selfClosing) return { attrs, content: '' }

  const stack = ['svg']
  let index = openingEnd + 1

  while (index < raw.length) {
    if (raw.startsWith('<!--', index)) {
      const end = raw.indexOf('-->', index + 4)
      if (end === -1) return warn(name, `"${name}" is not a valid xml document`)
      index = end + 3
      continue
    }

    if (raw.startsWith('<![CDATA[', index)) {
      const end = raw.indexOf(']]>', index + 9)
      if (end === -1) return warn(name, `"${name}" is not a valid xml document`)
      index = end + 3
      continue
    }

    if (raw.startsWith('<?', index)) {
      const end = raw.indexOf('?>', index + 2)
      if (end === -1) return warn(name, `"${name}" is not a valid xml document`)
      index = end + 2
      continue
    }

    if (raw.charAt(index) !== '<') {
      index++
      continue
    }

    const tagEnd = findTagEnd(raw, index)
    if (tagEnd === -1) return warn(name, `"${name}" has an unclosed <svg> element`)

    if (raw.startsWith('</', index)) {
      const tag = raw.slice(index + 2, tagEnd).trim()
      if (stack.pop() !== tag) return warn(name, `"${name}" is not a valid xml document`)
      if (stack.length === 0) {
        if (skipMisc(raw, tagEnd + 1) !== raw.length) {
          return warn(name, `"${name}" is not a valid xml document`)
        }
        return { attrs, content: raw.slice(openingEnd + 1, index) }
      }
      index = tagEnd + 1
      continue
    }

    const tag = /^<\s*([^\s/>]+)/.exec(raw.slice(index, tagEnd))?.[1]
    if (tag == null) return warn(name, `"${name}" is not a valid xml document`)

    if (raw.charAt(tagEnd - 1) !== '/') stack.push(tag)
    index = tagEnd + 1
  }

  return warn(name, `"${name}" has an unclosed <svg> element`)
}

/**
 * Separates the attributes of an svg from its contents, so that both can be rendered by the
 * component.
 *
 * @param raw Markup of the svg, as read from the file
 * @param name Name of the icon, only used to report errors
 */
export function parseSvg(raw: string | undefined, name: string): ParsedSvg {
  if (raw == null || raw.trim() === '') return warn(name, `"${name}" was not found in the icons directory`)

  return parseMarkup(raw, name)
}

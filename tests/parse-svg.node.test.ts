// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { parseSvg } from '../src/vite/parse-svg.js'
import { readFixture } from './fixtures/index.js'

const GITHUB = readFixture('github.svg')

describe('parseSvg (server)', () => {
  it('is not able to use a DOM', () => {
    expect(typeof DOMParser).toBe('undefined')
  })

  it('separates the attributes from the content of a real icon', () => {
    const { attrs, content } = parseSvg(GITHUB, 'github')

    expect(attrs).toEqual({
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      width: '24',
      height: '24',
    })
    expect(content).toContain('<path')
    expect(content).toContain("stroke='red'")
    expect(content).toContain('d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37')
  })

  it('reads the attributes of every quoting style', () => {
    const { attrs } = parseSvg(`<svg a="1" b='2' c=3 disabled></svg>`, 'attrs')

    expect(attrs).toEqual({ a: '1', b: '2', c: '3', disabled: '' })
  })

  it('returns the content of the root element', () => {
    const { content } = parseSvg('<svg><svg /></svg>', 'nested')

    expect(content).toBe('<svg />')
  })

  it('rejects markup after the root element instead of swallowing it', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(parseSvg('<svg><path /></svg></svg>', 'trailing')).toEqual({ attrs: {}, content: '' })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('not a valid xml document'))

    warn.mockRestore()
  })

  it('ignores the xml prolog', () => {
    const { attrs } = parseSvg('<?xml version="1.0"?><svg width="1" />', 'prolog')

    expect(attrs).toEqual({ width: '1' })
  })

  it('skips a comment that mentions an svg', () => {
    const { attrs, content } = parseSvg(readFixture('comment-before.svg'), 'comment-before')

    expect(attrs).toEqual({ xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24' })
    expect(content).toContain('<path')
    expect(content).not.toContain('en docs')
  })

  it('keeps a > that sits inside a quoted attribute', () => {
    const { attrs, content } = parseSvg(readFixture('attr-with-gt.svg'), 'attr-with-gt')

    expect(attrs['aria-label']).toBe('a > b')
    expect(content).toContain('<path')
  })

  it('decodes the entities of the attributes', () => {
    const { attrs } = parseSvg(readFixture('entities.svg'), 'entities')

    expect(attrs['title']).toBe('a & b')
  })

  it('ignores a trailing comment that contains a closing tag', () => {
    const { content } = parseSvg(readFixture('trailing-comment.svg'), 'trailing-comment')

    expect(content).toContain('<path')
    expect(content).not.toContain('<!--')
  })

  it('rejects a document whose root is not an svg', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(parseSvg(readFixture('wrapped-root.svg'), 'wrapped-root')).toEqual({ attrs: {}, content: '' })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no <svg> element'))

    warn.mockRestore()
  })

  it('rejects malformed xml', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(parseSvg(readFixture('malformed.svg'), 'malformed')).toEqual({ attrs: {}, content: '' })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('not a valid xml document'))

    warn.mockRestore()
  })

  it('reports a missing icon instead of rendering it', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(parseSvg(undefined, 'missing')).toEqual({ attrs: {}, content: '' })
    expect(parseSvg('   ', 'blank')).toEqual({ attrs: {}, content: '' })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"missing" was not found'))
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"blank" was not found'))

    warn.mockRestore()
  })

  it('reports markup without a svg element', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(parseSvg('<div />', 'not-an-svg')).toEqual({ attrs: {}, content: '' })
    expect(parseSvg('<svg width="1"', 'unclosed')).toEqual({ attrs: {}, content: '' })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no <svg> element'))
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('unclosed <svg> element'))

    warn.mockRestore()
  })

  it('returns a fresh empty icon for every failure', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(parseSvg(undefined, 'fresh-a').attrs).not.toBe(parseSvg(undefined, 'fresh-b').attrs)

    warn.mockRestore()
  })
})

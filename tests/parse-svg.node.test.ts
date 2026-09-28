// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { parseSvg } from '../src/_internal/parse-svg.js'
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

  it('only uses the first opening tag and the last closing one', () => {
    const { content } = parseSvg('<svg><svg /></svg></svg>', 'nested')

    expect(content).toBe('<svg /></svg>')
  })

  it('ignores the xml prolog', () => {
    const { attrs } = parseSvg('<?xml version="1.0"?><svg width="1" />', 'prolog')

    expect(attrs).toEqual({ width: '1' })
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
})

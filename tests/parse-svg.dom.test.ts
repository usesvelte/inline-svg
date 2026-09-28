// @vitest-environment happy-dom
import { describe, expect, it, vi } from 'vitest'
import { parseSvg } from '../src/_internal/parse-svg.js'
import { readFixture } from './fixtures/index.js'

const GITHUB = readFixture('github.svg')

describe('parseSvg (browser)', () => {
  it('separates the attributes from the content of a real icon', () => {
    const { attrs, content } = parseSvg(GITHUB, 'github')

    expect(attrs).toEqual({
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      width: '24',
      height: '24',
    })
    expect(content).toContain('<path')
    expect(content).toContain('stroke="red"')
    expect(content).toContain('d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37')
  })

  it('keeps the namespaces of the file instead of forcing its own', () => {
    const { attrs } = parseSvg(GITHUB, 'github')
    expect(attrs['xmlns']).toBe('http://www.w3.org/2000/svg')
  })

  it('rejects a document whose root is not an svg', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(parseSvg('<div><svg /></div>', 'not-an-svg')).toEqual({ attrs: {}, content: '' })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('expected <svg>'))

    warn.mockRestore()
  })

  it('rejects malformed xml', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(parseSvg('<svg><path></svg>', 'broken')).toEqual({ attrs: {}, content: '' })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('not a valid xml document'))

    warn.mockRestore()
  })

  it('never renders the raw markup of an invalid svg', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(parseSvg('<not-svg />', 'nope').content).toBe('')

    warn.mockRestore()
  })
})

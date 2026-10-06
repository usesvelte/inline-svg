// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { parseSvg } from '../src/vite/parse-svg.js'
import { readFixture } from './fixtures/index.js'

const GITHUB = readFixture('github.svg')

describe('parseSvg (browser)', () => {
  it('parses the same markup as the server, so hydration cannot diverge', () => {
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
})

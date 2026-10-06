// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

vi.mock('virtual:usesvelte/inline-svg/icons', () => ({
  icons: {
    github: { attrs: { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24' }, content: '<path d="..." />' },
    'frontend/svelte': { attrs: { xmlns: 'http://www.w3.org/2000/svg' }, content: '<path ... />' },
  },
}))

const { SVGS } = await import('../src/_internal/icons.js')

describe('icons', () => {
  it('exposes the parsed svgs the vite plugin inlined, keyed by icon name', () => {
    expect(Object.keys(SVGS)).toEqual(['github', 'frontend/svelte'])
    expect(SVGS['github']?.content).toContain('<path')
    expect(SVGS['frontend/svelte']?.content).toContain('<path')
  })
})

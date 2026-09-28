// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { readFixture } from './fixtures/index.js'

vi.mock('virtual:usesvelte/inline-svg/icons', () => ({
  icons: { github: readFixture('github.svg'), 'frontend/svelte': readFixture('frontend/svelte.svg') },
}))

const { SVGS } = await import('../src/_internal/icons.js')

describe('icons', () => {
  it('exposes the markup the vite plugin inlined, keyed by icon name', () => {
    expect(Object.keys(SVGS)).toEqual(['github', 'frontend/svelte'])
    expect(SVGS['github']).toContain('<path')
    expect(SVGS['frontend/svelte']).toContain('<svg')
  })
})

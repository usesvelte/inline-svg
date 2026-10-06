// @vitest-environment happy-dom
import { render } from 'svelte/server'
import { hydrate, mount, tick, unmount } from 'svelte'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
// @ts-expect-error the server variant is resolved by the ssr-variant plugin of vitest.config.ts
import InlineSvgSsr from '../src/InlineSvg.svelte?ssr'
import { parseSvg } from '../src/vite/parse-svg.js'
import { readFixture } from './fixtures/index.js'
import InlineSvg from '../src/InlineSvg.svelte'
import { probe } from './probe.svelte.js'
import Harness from './harness.svelte'

vi.mock('virtual:usesvelte/inline-svg/icons', () => ({
  icons: {
    github: parseSvg(readFixture('github.svg'), 'github'),
    'frontend/svelte': parseSvg(readFixture('frontend/svelte.svg'), 'frontend/svelte'),
  },
}))

const PROPS = { name: 'github', class: 'icon', width: 32 }

let target: HTMLElement
let instance: ReturnType<typeof mount> | undefined

beforeEach(() => {
  probe.name = 'github'
  probe.className = 'icon'
  target = document.createElement('div')
  document.body.append(target)
})

afterEach(() => {
  if (instance !== undefined) {
    unmount(instance)
    instance = undefined
  }
  target.remove()
  vi.restoreAllMocks()
})

it('renders the icon on the server', () => {
  const { body } = render(InlineSvgSsr, { props: PROPS })

  expect(body).toContain('<svg')
  expect(body).toContain('class="icon"')
  expect(body).toContain('width="32"')
  expect(body).toContain('<path')
  expect(body).not.toContain('name="github"')
})

it('hydrates the server markup without warnings', async () => {
  const { body } = render(InlineSvgSsr, { props: PROPS })
  target.innerHTML = body
  const htmlBefore = target.innerHTML
  const warn = vi.spyOn(console, 'warn')

  hydrate(InlineSvg, { target, props: PROPS })
  await tick()

  const warnings = warn.mock.calls.flat().join('\n')
  expect(warnings).not.toContain('hydration_')
  expect(warnings).not.toContain('Failed to hydrate')
  expect(target.innerHTML).toBe(htmlBefore)
})

it('updates the forwarded props when the state changes', async () => {
  instance = mount(Harness, { target })

  expect(target.querySelector('svg')?.getAttribute('class')).toBe('icon')

  probe.className = 'updated'
  await tick()

  expect(target.querySelector('svg')?.getAttribute('class')).toBe('updated')
})

it('replaces the svg content when the name changes', async () => {
  instance = mount(Harness, { target })

  expect(target.querySelector('svg')?.innerHTML).toContain('M9 19c')

  probe.name = 'frontend/svelte'
  await tick()

  const html = target.querySelector('svg')?.innerHTML
  expect(html).toContain('M94.1566')
  expect(html).not.toContain('M9 19c')
})

it('warns and renders an empty svg for a missing icon', async () => {
  const warn = vi.spyOn(console, 'warn')
  instance = mount(Harness, { target })

  probe.name = 'not-exist'
  await tick()

  expect(warn).toHaveBeenCalledWith('[inline-svg] "not-exist" was not found in the icons directory')
  const svg = target.querySelector('svg')
  expect(svg?.innerHTML).toBe('')
  expect(svg?.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg')
})

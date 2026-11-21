// @vitest-environment node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { AstroIntegration } from 'astro'
import inlineSvg from '../src/astro/index.js'
import { readFixture } from './fixtures/index.js'

const PKG = '@usesvelte/inline-svg'
const VIRTUAL_ID = 'virtual:usesvelte/inline-svg'
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`

type ViteConfigUpdate = {
  plugins?: { name?: string }[]
  resolve?: { noExternal?: string[] }
  ssr?: { noExternal?: string[] }
}

type SetupConfig = {
  integrations?: { name?: string }[]
  vite?: { plugins?: unknown[] }
}

type SetupHook = (context: {
  config: SetupConfig
  updateConfig: (config: { vite: ViteConfigUpdate }) => void
  logger: { warn: (message: string) => void }
}) => void | Promise<void>

type PluginHooks = {
  configResolved: (config: { root: string }) => void
  load: (this: { warn: (message: string) => void; addWatchFile: (id: string) => void }, id: string) => string | null
}

/** Runs `astro:config:setup` the way Astro does and returns what the integration asked to merge. */
function setup(options?: Parameters<typeof inlineSvg>[0], config: SetupConfig = {}) {
  const updateConfig = vi.fn<(config: { vite: ViteConfigUpdate }) => void>()
  const logger = { warn: vi.fn<(message: string) => void>() }
  const mergedConfig: SetupConfig = {
    integrations: config.integrations ?? [],
    vite: { plugins: config.vite?.plugins ?? [] },
  }
  // Assignability check: inlineSvg() is an AstroIntegration, nothing looser.
  const integration: AstroIntegration = inlineSvg(options)
  const hook = integration.hooks['astro:config:setup'] as SetupHook | undefined

  expect(hook, 'astro:config:setup must be a function').toBeTypeOf('function')
  hook?.({ config: mergedConfig, updateConfig, logger })

  expect(updateConfig, 'the integration must update the config exactly once').toHaveBeenCalledTimes(1)
  const vite = updateConfig.mock.calls[0]?.[0].vite
  expect(vite, 'the integration must update the vite config').toBeDefined()

  return { integration, updateConfig, vite: vite!, logger }
}

/**
 * Own icons directory: the dir option has to resolve against the project root of the consumer,
 * and this keeps the assertion off this repo's own layout.
 */
let root: string

beforeAll(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'inline-svg-astro-'))
  fs.mkdirSync(path.join(root, 'icons/frontend'), { recursive: true })
  fs.writeFileSync(path.join(root, 'icons/github.svg'), readFixture('github.svg'))
  fs.writeFileSync(path.join(root, 'icons/frontend/svelte.svg'), readFixture('frontend/svelte.svg'))
})

afterAll(() => fs.rmSync(root, { recursive: true, force: true }))

describe('inlineSvg astro integration', () => {
  it('exposes the Astro integration shape', () => {
    const { integration } = setup()
    expect(integration.name).toBe(PKG)
    expect(integration.hooks['astro:config:setup']).toBeTypeOf('function')
  })

  it('is exported as both the default and the named export', async () => {
    const mod = await import('../src/astro/index.js')
    expect(mod.default).toBe(mod.inlineSvg)
    expect(mod.inlineSvg).toBe(inlineSvg)
  })

  it('registers the vite plugin', () => {
    const { vite } = setup()
    expect(vite.plugins).toHaveLength(1)
    expect(vite.plugins?.[0]?.name).toBe('usesvelte:inline-svg')
  })

  it('marks the package as noExternal on both the modern and the legacy location', () => {
    const { vite } = setup()
    expect(vite.resolve?.noExternal).toContain(PKG)
    expect(vite.ssr?.noExternal).toContain(PKG)
  })

  it('forwards the plugin options, so dir keeps pointing at the svgs', () => {
    const { vite } = setup({ dir: 'icons', types: false })
    const plugin = vite.plugins?.[0] as unknown as PluginHooks | undefined
    expect(plugin).toBeDefined()

    plugin!.configResolved({ root })
    const module = plugin!.load.call({ warn: vi.fn(), addWatchFile: vi.fn() }, RESOLVED_VIRTUAL_ID)

    expect(module).toContain('"github"')
    expect(module).toContain('"frontend/svelte"')
  })

  it('warns when @astrojs/svelte is missing from the integrations', () => {
    const { logger } = setup()
    expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('@astrojs/svelte'))
  })

  it('does not warn when @astrojs/svelte is already present', () => {
    const { logger } = setup(undefined, { integrations: [{ name: '@astrojs/svelte' }] })
    expect(logger.warn).not.toHaveBeenCalled()
  })

  it('does not register the plugin twice when the consumer already added it', () => {
    const { vite } = setup(undefined, { vite: { plugins: [{ name: 'usesvelte:inline-svg' }] } })
    expect(vite.plugins).toHaveLength(0)
    expect(vite.resolve?.noExternal).toContain(PKG)
    expect(vite.ssr?.noExternal).toContain(PKG)
  })
})

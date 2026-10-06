// @vitest-environment node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { inlineSvg } from '../src/vite/index.js'
import { isIconFile } from '../src/vite/paths.js'
import { readFixture } from './fixtures/index.js'

const VIRTUAL_ID = 'virtual:usesvelte/inline-svg/icons'
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`

type PluginContext = { warn: (message: string) => void; addWatchFile: (id: string) => void }

type Hooks = {
  config: () => { optimizeDeps: { exclude: string[] } }
  configResolved: (config: { root: string }) => void
  load: (this: PluginContext, id: string) => string | null
  resolveId: (id: string) => string | null
  watchChange: (this: { environment: { moduleGraph: ModuleGraphStub } }, id: string, change: { event: string }) => void
  hotUpdate: (
    this: { environment: { moduleGraph: ModuleGraphStub } },
    options: { file: string },
  ) => ModuleNode[] | undefined
  handleHotUpdate: (options: { file: string; server: { moduleGraph: ModuleGraphStub } }) => ModuleNode[] | undefined
}

type ModuleNode = { id: string }
type ModuleGraphStub = {
  getModuleById: (id: string) => ModuleNode | undefined
  invalidateModule: (mod: ModuleNode) => void
}

function setup(dir?: string) {
  const warn = vi.fn()
  const hooks = inlineSvg(dir == null ? {} : { dir }) as unknown as Hooks
  const graph = moduleGraphStub()

  return {
    warn,
    graph,
    config: () => hooks.config(),
    configResolved: (config: { root: string }) => hooks.configResolved(config),
    load: (id: string) => hooks.load.call({ warn, addWatchFile: vi.fn() }, id),
    resolveId: (id: string) => hooks.resolveId(id),
    watchChange: (id: string, change: { event: string }) =>
      hooks.watchChange.call({ environment: { moduleGraph: graph } }, id, change),
    hotUpdate: (file: string) => hooks.hotUpdate.call({ environment: { moduleGraph: graph } }, { file }),
    handleHotUpdate: (file: string) => hooks.handleHotUpdate({ file, server: { moduleGraph: graph } }),
  }
}

function moduleGraphStub() {
  const iconsModule: ModuleNode = { id: RESOLVED_VIRTUAL_ID }

  return {
    iconsModule,
    getModuleById: (id: string) => (id === RESOLVED_VIRTUAL_ID ? iconsModule : undefined),
    invalidateModule: vi.fn(),
  }
}

let root: string

beforeAll(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'inline-svg-'))
  fs.mkdirSync(path.join(root, 'src/icons/frontend'), { recursive: true })
  // Real .svg files, so the plugin is exercised against the same markup a user ships.
  fs.writeFileSync(path.join(root, 'src/icons/github.svg'), readFixture('github.svg'))
  fs.writeFileSync(path.join(root, 'src/icons/frontend/svelte.svg'), readFixture('frontend/svelte.svg'))
  fs.writeFileSync(path.join(root, 'src/icons/README.md'), 'not an icon')
})

afterAll(() => fs.rmSync(root, { recursive: true, force: true }))

describe('inlineSvg', () => {
  it('is not pre-bundled by vite, so the icons are always read fresh', () => {
    expect(setup().config()).toEqual({ optimizeDeps: { exclude: ['@usesvelte/inline-svg'] } })
  })

  it('refreshes the virtual module when an svg is added, changed or removed', () => {
    const plugin = setup()
    plugin.configResolved({ root })

    expect(plugin.hotUpdate(path.join(root, 'src/icons/github.svg'))).toEqual([plugin.graph.iconsModule])
    expect(plugin.hotUpdate(path.join(root, 'src/icons/added.svg'))).toEqual([plugin.graph.iconsModule])
    expect(plugin.graph.invalidateModule).toHaveBeenCalledWith(plugin.graph.iconsModule)

    expect(plugin.hotUpdate(path.join(root, 'src/App.svelte'))).toBeUndefined()
    expect(plugin.hotUpdate(path.join(root, 'src/icons/README.md'))).toBeUndefined()
    expect(plugin.graph.invalidateModule).toHaveBeenCalledTimes(2)
  })

  it('refreshes the virtual module through the vite 5 hook as well', () => {
    const plugin = setup()
    plugin.configResolved({ root })

    expect(plugin.handleHotUpdate(path.join(root, 'src/icons/github.svg'))).toEqual([plugin.graph.iconsModule])
    expect(plugin.graph.invalidateModule).toHaveBeenCalledWith(plugin.graph.iconsModule)
  })

  it('refreshes the virtual module when an svg is created or deleted during a watch build', () => {
    const plugin = setup()
    plugin.configResolved({ root })

    plugin.watchChange(path.join(root, 'src/icons/added.svg'), { event: 'create' })
    plugin.watchChange(path.join(root, 'src/icons/github.svg'), { event: 'delete' })

    expect(plugin.graph.invalidateModule).toHaveBeenCalledWith(plugin.graph.iconsModule)
    expect(plugin.graph.invalidateModule).toHaveBeenCalledTimes(2)
  })

  it('ignores updates and files outside the icons dir during a watch build', () => {
    const plugin = setup()
    plugin.configResolved({ root })

    plugin.watchChange(path.join(root, 'src/icons/github.svg'), { event: 'update' })
    plugin.watchChange(path.join(root, 'src/App.svelte'), { event: 'create' })

    expect(plugin.graph.invalidateModule).not.toHaveBeenCalled()
  })

  it('only resolves its own virtual module', () => {
    const plugin = setup()
    plugin.configResolved({ root })

    expect(plugin.resolveId(VIRTUAL_ID)).toBe(RESOLVED_VIRTUAL_ID)
    expect(plugin.resolveId('./icons.js')).toBeNull()
    expect(plugin.load('./icons.js')).toBeNull()
  })

  it('parses every svg of the icons directory', () => {
    const plugin = setup()
    plugin.configResolved({ root })

    const output = plugin.load(RESOLVED_VIRTUAL_ID)

    expect(output).toContain(
      '"github": {"attrs":{"xmlns":"http://www.w3.org/2000/svg","viewBox":"0 0 24 24","width":"24","height":"24"}',
    )
    expect(output).toContain('"frontend/svelte": {"attrs":')
    expect(output).toContain('"content":')
    expect(output).not.toContain('__svg')
  })

  it('ignores files that are not svg', () => {
    const plugin = setup()
    plugin.configResolved({ root })

    expect(plugin.load(RESOLVED_VIRTUAL_ID)).not.toContain('README')
  })

  it('picks up svgs that were added after the module was first loaded', () => {
    const freshRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'inline-svg-fresh-'))
    const plugin = setup()
    plugin.configResolved({ root: freshRoot })

    try {
      expect(plugin.load(RESOLVED_VIRTUAL_ID)).toBe('export const icons = {}')

      fs.mkdirSync(path.join(freshRoot, 'src/icons'), { recursive: true })
      fs.writeFileSync(path.join(freshRoot, 'src/icons/vite.svg'), readFixture('frontend/svelte.svg'))

      expect(plugin.load(RESOLVED_VIRTUAL_ID)).toContain('"vite": {"attrs":')
    } finally {
      fs.rmSync(freshRoot, { recursive: true, force: true })
    }
  })

  it('warns instead of failing when the directory does not exist', () => {
    const plugin = setup('src/missing-icons')
    plugin.configResolved({ root })

    expect(plugin.load(RESOLVED_VIRTUAL_ID)).toBe('export const icons = {}')
    expect(plugin.warn).toHaveBeenCalledWith(expect.stringContaining('icons directory not found'))
  })

  it('warns when the directory exists but holds no svg', () => {
    const emptyIcons = fs.mkdtempSync(path.join(os.tmpdir(), 'inline-svg-empty-'))
    fs.writeFileSync(path.join(emptyIcons, 'README.md'), 'not an icon')

    try {
      const plugin = setup(path.relative(root, emptyIcons))
      plugin.configResolved({ root })

      expect(plugin.load(RESOLVED_VIRTUAL_ID)).toContain('export const icons = {\n}')
      expect(plugin.warn).toHaveBeenCalledWith(expect.stringContaining('no svg found'))
    } finally {
      fs.rmSync(emptyIcons, { recursive: true, force: true })
    }
  })

  it('does nothing when the virtual module is not in the module graph yet', () => {
    const hooks = inlineSvg() as unknown as Hooks
    const invalidateModule = vi.fn()
    const emptyGraph = { getModuleById: () => undefined, invalidateModule }
    hooks.configResolved({ root })

    const file = path.join(root, 'src/icons/github.svg')

    expect(hooks.hotUpdate.call({ environment: { moduleGraph: emptyGraph } }, { file })).toBeUndefined()
    expect(hooks.handleHotUpdate({ file, server: { moduleGraph: emptyGraph } })).toBeUndefined()
    expect(invalidateModule).not.toHaveBeenCalled()
  })

  it('reads the directory from the project root, not from the cwd', () => {
    const plugin = setup()
    plugin.configResolved({ root: path.join(root, 'src') })

    expect(plugin.load(RESOLVED_VIRTUAL_ID)).toBe('export const icons = {}')
  })
})

describe('isIconFile', () => {
  it('matches svg files of the icons dir whatever the path separator is', () => {
    expect(isIconFile('C:/proj/src/icons/a.svg', 'C:\\proj\\src\\icons')).toBe(true)
    expect(isIconFile('C:/proj/src/icons2/a.svg', 'C:\\proj\\src\\icons')).toBe(false)
    expect(isIconFile('/root/src/App.svelte', '/root/src/icons')).toBe(false)
  })
})

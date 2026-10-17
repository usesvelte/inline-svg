// @vitest-environment node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { inlineSvg, type InlineSvgPluginOptions } from '../src/vite/index.js'
import { isIconFile } from '../src/vite/paths.js'
import { readFixture } from './fixtures/index.js'

const VIRTUAL_ID = 'virtual:usesvelte/inline-svg'
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

function setup(options: InlineSvgPluginOptions = {}) {
  const warn = vi.fn()
  const graph = moduleGraphStub()
  const hooks = inlineSvg(options) as unknown as Hooks

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
  fs.writeFileSync(path.join(root, 'src/icons/MAYUS.SVG'), readFixture('github.svg'))
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

  it('matches the extension case-insensitively', () => {
    const plugin = setup()
    plugin.configResolved({ root })

    expect(plugin.load(RESOLVED_VIRTUAL_ID)).toContain('"MAYUS":')
  })

  it.skipIf(process.platform === 'win32')('follows svgs that are symbolic links', () => {
    const link = path.join(root, 'src/icons/link.svg')
    fs.symlinkSync(path.join(root, 'src/icons/github.svg'), link)

    try {
      const plugin = setup()
      plugin.configResolved({ root })

      expect(plugin.load(RESOLVED_VIRTUAL_ID)).toContain('"link":')
    } finally {
      fs.rmSync(link)
    }
  })

  it('warns when two files map to the same icon name', () => {
    const dupes = fs.mkdtempSync(path.join(os.tmpdir(), 'inline-svg-dupes-'))
    fs.mkdirSync(path.join(dupes, 'src/icons'), { recursive: true })
    fs.writeFileSync(path.join(dupes, 'src/icons/case.svg'), readFixture('github.svg'))
    fs.writeFileSync(path.join(dupes, 'src/icons/case.SVG'), readFixture('frontend/svelte.svg'))

    try {
      const plugin = setup()
      plugin.configResolved({ root: dupes })

      plugin.load(RESOLVED_VIRTUAL_ID)

      expect(plugin.warn).toHaveBeenCalledWith(
        expect.stringContaining('duplicate icon name: "case" (case.SVG, case.svg)'),
      )
    } finally {
      fs.rmSync(dupes, { recursive: true, force: true })
    }
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
    const plugin = setup({ dir: 'src/missing-icons' })
    plugin.configResolved({ root })

    expect(plugin.load(RESOLVED_VIRTUAL_ID)).toBe('export const icons = {}')
    expect(plugin.warn).toHaveBeenCalledWith(expect.stringContaining('icons directory not found'))
  })

  it('warns instead of failing when the dir option points to a file', () => {
    const file = path.join(root, 'src/icon-dir.svg')
    fs.writeFileSync(file, readFixture('github.svg'))

    try {
      const plugin = setup({ dir: 'src/icon-dir.svg' })
      plugin.configResolved({ root })

      expect(plugin.load(RESOLVED_VIRTUAL_ID)).toBe('export const icons = {}')
      expect(plugin.warn).toHaveBeenCalledWith(expect.stringContaining('not a directory'))
    } finally {
      fs.rmSync(file)
    }
  })

  it('warns when the directory exists but holds no svg', () => {
    const emptyIcons = fs.mkdtempSync(path.join(os.tmpdir(), 'inline-svg-empty-'))
    fs.writeFileSync(path.join(emptyIcons, 'README.md'), 'not an icon')

    try {
      const plugin = setup({ dir: path.relative(root, emptyIcons) })
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

function tempIcons(...names: string[]) {
  const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'inline-svg-types-'))
  for (const name of names) {
    const file = path.join(projectRoot, 'src/icons', `${name}.svg`)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, readFixture('github.svg'))
  }
  return projectRoot
}

function rmProject(projectRoot: string) {
  fs.rmSync(projectRoot, { recursive: true, force: true })
}

describe('inlineSvg icon names types', () => {
  it('generates a declaration next to the svgs with the icons as the Icon union', () => {
    const project = tempIcons('check', 'frontend/svelte')
    const typesFile = path.join(project, 'src/icons/inline-svg.d.ts')

    try {
      const plugin = setup()
      plugin.configResolved({ root: project })

      plugin.load(RESOLVED_VIRTUAL_ID)

      const declaration = fs.readFileSync(typesFile, 'utf8')
      expect(declaration).toBe(
        [
          '// Generated by @usesvelte/inline-svg. Do not edit.',
          `declare module 'virtual:usesvelte/inline-svg' {`,
          '  /** Names of the svgs of the icons directory, typed by the inlineSvg vite plugin */',
          '  export type IconName =',
          '    | "check"',
          '    | "frontend/svelte"',
          '}',
          '',
        ].join('\n'),
      )
    } finally {
      rmProject(project)
    }
  })

  it('only rewrites the declaration when the icon names change', () => {
    const project = tempIcons('check')

    try {
      const plugin = setup()
      plugin.configResolved({ root: project })
      plugin.load(RESOLVED_VIRTUAL_ID)

      const write = vi.spyOn(fs, 'writeFileSync')
      plugin.load(RESOLVED_VIRTUAL_ID)

      expect(write).not.toHaveBeenCalled()
      write.mockRestore()
    } finally {
      rmProject(project)
    }
  })

  it('regenerates the declaration when svgs are added or removed', () => {
    const project = tempIcons('check')
    const typesFile = path.join(project, 'src/icons/inline-svg.d.ts')

    try {
      const plugin = setup()
      plugin.configResolved({ root: project })
      plugin.load(RESOLVED_VIRTUAL_ID)

      const cross = path.join(project, 'src/icons/cross.svg')
      fs.writeFileSync(cross, readFixture('frontend/svelte.svg'))
      plugin.load(RESOLVED_VIRTUAL_ID)
      expect(fs.readFileSync(typesFile, 'utf8')).toContain('"cross"')

      fs.rmSync(cross)
      plugin.load(RESOLVED_VIRTUAL_ID)
      expect(fs.readFileSync(typesFile, 'utf8')).not.toContain(`"cross"`)
    } finally {
      rmProject(project)
    }
  })

  it('writes an empty declaration when the icons directory holds no svg', () => {
    const project = tempIcons()

    try {
      fs.mkdirSync(path.join(project, 'src/icons'), { recursive: true })
      const plugin = setup()
      plugin.configResolved({ root: project })

      plugin.load(RESOLVED_VIRTUAL_ID)

      const declaration = fs.readFileSync(path.join(project, 'src/icons/inline-svg.d.ts'), 'utf8')
      expect(declaration).toContain('export type IconName = never')
    } finally {
      rmProject(project)
    }
  })

  it('can point the declaration to another path, creating its directories', () => {
    const project = tempIcons('check')

    try {
      const plugin = setup({ types: 'types/icons.d.ts' })
      plugin.configResolved({ root: project })

      plugin.load(RESOLVED_VIRTUAL_ID)

      expect(fs.readFileSync(path.join(project, 'types/icons.d.ts'), 'utf8')).toContain('"check"')
    } finally {
      rmProject(project)
    }
  })

  it('never writes the declaration when the types option is false', () => {
    const project = tempIcons('check')

    try {
      const plugin = setup({ types: false })
      plugin.configResolved({ root: project })

      plugin.load(RESOLVED_VIRTUAL_ID)

      expect(fs.existsSync(path.join(project, 'src/icons/inline-svg.d.ts'))).toBe(false)
    } finally {
      rmProject(project)
    }
  })

  it('never overwrites a declaration that it did not generate', () => {
    const project = tempIcons('check')
    const typesFile = path.join(project, 'src/icons/inline-svg.d.ts')
    fs.writeFileSync(typesFile, 'declare module "hand-written" {}\n')

    try {
      const plugin = setup()
      plugin.configResolved({ root: project })

      plugin.load(RESOLVED_VIRTUAL_ID)

      expect(fs.readFileSync(typesFile, 'utf8')).toBe('declare module "hand-written" {}\n')
      expect(plugin.warn).toHaveBeenCalledWith(expect.stringContaining('was not generated by @usesvelte/inline-svg'))
    } finally {
      rmProject(project)
    }
  })

  it('removes its own stale declaration when the icons cannot be read, keeping foreign files', () => {
    const project = tempIcons()
    const ours = path.join(project, 'ours.d.ts')
    const foreign = path.join(project, 'foreign.d.ts')
    fs.writeFileSync(
      ours,
      '// Generated by @usesvelte/inline-svg. Do not edit.\ndeclare module "virtual:usesvelte/inline-svg" {}\n',
    )
    fs.writeFileSync(foreign, 'declare module "hand-written" {}\n')

    try {
      const stale = setup({ types: 'ours.d.ts' })
      stale.configResolved({ root: project })
      stale.load(RESOLVED_VIRTUAL_ID)

      expect(fs.existsSync(ours)).toBe(false)
      expect(stale.warn).toHaveBeenCalledWith(expect.stringContaining('icons directory not found'))

      const kept = setup({ types: 'foreign.d.ts' })
      kept.configResolved({ root: project })
      kept.load(RESOLVED_VIRTUAL_ID)

      expect(fs.readFileSync(foreign, 'utf8')).toBe('declare module "hand-written" {}\n')
    } finally {
      rmProject(project)
    }
  })
})

describe('isIconFile', () => {
  it('matches svg files of the icons dir whatever the path separator is', () => {
    expect(isIconFile('C:/proj/src/icons/a.svg', 'C:\\proj\\src\\icons')).toBe(true)
    expect(isIconFile('C:/proj/src/icons2/a.svg', 'C:\\proj\\src\\icons')).toBe(false)
    expect(isIconFile('/root/src/App.svelte', '/root/src/icons')).toBe(false)
  })
})

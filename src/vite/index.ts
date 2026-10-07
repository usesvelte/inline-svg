import fs from 'node:fs'
import path from 'node:path'
import { normalizePath, type Plugin } from 'vite'
import { parseSvg } from './parse-svg.js'
import { isIconFile } from './paths.js'

const VIRTUAL_MODULE_ID = 'virtual:usesvelte/inline-svg/icons'
const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`

export interface InlineSvgPluginOptions {
  /**
   * Directory that contains the svgs, relative to the project root.
   *
   * @default 'src/icons'
   */
  dir?: string
}

function findSvgs(dir: string): string[] {
  return fs
    .readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => {
      if (!entry.name.toLowerCase().endsWith('.svg')) return false
      try {
        return fs.statSync(path.join(entry.parentPath, entry.name)).isFile()
      } catch {
        return false
      }
    })
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort()
}

function toIconName(file: string, dir: string): string {
  return path
    .relative(dir, file)
    .split(path.sep)
    .join('/')
    .replace(/\.svg$/i, '')
}

/**
 * Re-reads the virtual module when one of the svgs is added, changed or removed, so that the
 * icons of the directory are always the ones the dev server hands over to the browser.
 */
function refreshIconsModule<T>(
  file: string,
  iconsDirPosix: string,
  getModule: (id: string) => T | undefined,
  invalidateModule: (mod: T) => void,
): T[] | undefined {
  if (!isIconFile(file, iconsDirPosix)) return

  const icons = getModule(RESOLVED_VIRTUAL_MODULE_ID)
  if (!icons) return

  invalidateModule(icons)

  return [icons]
}

/**
 * Makes the svgs of the icons directory available to `InlineSvg` as a virtual module, so that the
 * library never has to reach into the consumer's filesystem from `node_modules`.
 */
export function inlineSvg(options: InlineSvgPluginOptions = {}): Plugin {
  const dir = options.dir ?? 'src/icons'

  let iconsDir = path.resolve(dir)
  let iconsDirPosix = normalizePath(iconsDir)

  return {
    name: 'usesvelte:inline-svg',

    config() {
      return {
        // The library is served as source, otherwise the icons virtual module would be
        // inlined into the pre-bundled dependency and new svgs would need a restart.
        optimizeDeps: {
          exclude: ['@usesvelte/inline-svg'],
        },
      }
    },

    configResolved(config) {
      iconsDir = path.resolve(config.root, dir)
      iconsDirPosix = normalizePath(iconsDir)
    },

    resolveId(id) {
      return id === VIRTUAL_MODULE_ID ? RESOLVED_VIRTUAL_MODULE_ID : null
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_MODULE_ID) return null

      const stat = fs.statSync(iconsDir, { throwIfNoEntry: false })
      if (stat == null) {
        this.warn(`icons directory not found: ${iconsDir}. Is the "dir" option of inlineSvg() correct?`)
        return 'export const icons = {}'
      }
      if (!stat.isDirectory()) {
        this.warn(`icons path is not a directory: ${iconsDir}. "dir" must point to a directory`)
        return 'export const icons = {}'
      }

      let files: string[]
      try {
        files = findSvgs(iconsDir)
      } catch (error) {
        this.warn(`icons directory cannot be read: ${iconsDir}. ${error}`)
        return 'export const icons = {}'
      }

      if (files.length === 0) this.warn(`no svg found in: ${iconsDir}`)

      for (const file of files) this.addWatchFile(file)

      const names = new Map<string, string[]>()
      for (const file of files) {
        const name = toIconName(file, iconsDir)
        const group = names.get(name)
        if (group) group.push(file)
        else names.set(name, [file])
      }
      for (const [name, group] of names) {
        if (group.length > 1) {
          const sources = group.map((file) => path.relative(iconsDir, file)).join(', ')
          this.warn(`duplicate icon name: "${name}" (${sources})`)
        }
      }

      const entries = files.map((file) => {
        const name = toIconName(file, iconsDir)
        const raw = fs.readFileSync(file, 'utf8')
        const { attrs, content } = parseSvg(raw, name)
        return `  ${JSON.stringify(name)}: ${JSON.stringify({ attrs, content })},`
      })

      return ['export const icons = {', ...entries, '}', ''].join('\n')
    },

    watchChange(id, change) {
      if (change.event !== 'create' && change.event !== 'delete') return
      const { environment } = this
      if (!('moduleGraph' in environment)) return
      refreshIconsModule(
        id,
        iconsDirPosix,
        (moduleId) => environment.moduleGraph.getModuleById(moduleId),
        (mod) => environment.moduleGraph.invalidateModule(mod),
      )
    },

    hotUpdate({ file }) {
      return refreshIconsModule(
        file,
        iconsDirPosix,
        (id) => this.environment.moduleGraph.getModuleById(id),
        (mod) => this.environment.moduleGraph.invalidateModule(mod),
      )
    },

    // Vite 5 does not know about the `hotUpdate` hook yet.
    handleHotUpdate({ file, server }) {
      return refreshIconsModule(
        file,
        iconsDirPosix,
        (id) => server.moduleGraph.getModuleById(id),
        (mod) => server.moduleGraph.invalidateModule(mod),
      )
    },
  }
}

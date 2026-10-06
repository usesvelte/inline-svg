import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'
import { parseSvg } from './parse-svg.js'

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
    .filter((entry) => entry.isFile() && entry.name.endsWith('.svg'))
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort()
}

function toIconName(file: string, dir: string): string {
  return path
    .relative(dir, file)
    .split(path.sep)
    .join('/')
    .replace(/\.svg$/, '')
}

/**
 * Re-reads the virtual module when one of the svgs is added, changed or removed, so that the
 * icons of the directory are always the ones the dev server hands over to the browser.
 */
function refreshIconsModule<T>(
  file: string,
  iconsDir: string,
  getModule: (id: string) => T | undefined,
  invalidateModule: (mod: T) => void,
): T[] | undefined {
  if (!file.startsWith(iconsDir + path.sep) || !file.endsWith('.svg')) return

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
    },

    resolveId(id) {
      return id === VIRTUAL_MODULE_ID ? RESOLVED_VIRTUAL_MODULE_ID : null
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_MODULE_ID) return null

      if (!fs.existsSync(iconsDir)) {
        this.warn(`icons directory not found: ${iconsDir}. Is the "dir" option of inlineSvg() correct?`)
        return 'export const icons = {}'
      }

      const files = findSvgs(iconsDir)
      if (files.length === 0) this.warn(`no svg found in: ${iconsDir}`)

      const entries = files.map((file) => {
        const name = toIconName(file, iconsDir)
        const raw = fs.readFileSync(file, 'utf8')
        const { attrs, content } = parseSvg(raw, name)
        return `  ${JSON.stringify(name)}: ${JSON.stringify({ attrs, content })},`
      })

      return ['export const icons = {', ...entries, '}', ''].join('\n')
    },

    hotUpdate({ file }) {
      return refreshIconsModule(
        file,
        iconsDir,
        (id) => this.environment.moduleGraph.getModuleById(id),
        (mod) => this.environment.moduleGraph.invalidateModule(mod),
      )
    },

    // Vite 5 does not know about the `hotUpdate` hook yet.
    handleHotUpdate({ file, server }) {
      return refreshIconsModule(
        file,
        iconsDir,
        (id) => server.moduleGraph.getModuleById(id),
        (mod) => server.moduleGraph.invalidateModule(mod),
      )
    },
  }
}

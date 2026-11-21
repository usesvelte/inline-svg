import type { AstroIntegration } from 'astro'
import { inlineSvg as inlineSvgPlugin } from '../vite/index.js'
import type { InlineSvgPluginOptions } from '../vite/index.js'

export type { InlineSvgPluginOptions }

const PKG = '@usesvelte/inline-svg'
const SVELTE_INTEGRATION = '@astrojs/svelte'
const PLUGIN_NAME = 'usesvelte:inline-svg'

type NamedPlugin = { name?: unknown }

/** Vite plugin options can be nested arrays or falsy; only objects can carry a plugin name. */
function hasPlugin(plugins: unknown, name: string): boolean {
  if (!Array.isArray(plugins)) return false

  return plugins.some((plugin) => {
    if (Array.isArray(plugin)) return hasPlugin(plugin, name)
    if (!plugin || typeof plugin !== 'object') return false
    return (plugin as NamedPlugin).name === name
  })
}

/**
 * Astro integration that wires the library up in one line.
 *
 * It registers the `inlineSvg` Vite plugin and marks `@usesvelte/inline-svg` as `noExternal` for
 * the server environments. The second part is not optional: Vite externalizes dependencies in SSR
 * by default, and an externalized copy of this package is loaded straight by Node, which can
 * neither compile the shipped `.svelte` file nor resolve the `virtual:usesvelte/inline-svg`
 * module, so the icons would never reach `InlineSvg`.
 *
 * @example
 * ```js
 * // astro.config.mjs
 * import inlineSvg from '@usesvelte/inline-svg/astro'
 *
 * export default defineConfig({
 *   integrations: [inlineSvg()],
 * })
 * ```
 */
export function inlineSvg(options?: InlineSvgPluginOptions): AstroIntegration {
  return {
    name: PKG,
    hooks: {
      'astro:config:setup': ({ config, updateConfig, logger }) => {
        if (!config.integrations.some((integration) => integration.name === SVELTE_INTEGRATION)) {
          logger.warn(
            `${PKG} needs ${SVELTE_INTEGRATION} to compile .svelte files. ` +
              'Add it to the Astro integrations array if you have not already.',
          )
        }

        const plugins = hasPlugin(config.vite?.plugins, PLUGIN_NAME) ? [] : [inlineSvgPlugin(options)]

        updateConfig({
          vite: {
            plugins,
            // Modern location (Vite 6+), the one Astro itself points at in its error messages.
            resolve: { noExternal: [PKG] },
            // Legacy location, kept so the integration also works on older Vite.
            ssr: { noExternal: [PKG] },
          },
        })
      },
    },
  }
}

export default inlineSvg

declare module 'virtual:usesvelte/inline-svg' {
  /** Parsed attributes and content of every svg of the icons directory, keyed by name */
  export const icons: Record<string, import('../vite/parse-svg.js').ParsedSvg>
}

// Same shape as the inline-svg.d.ts file the vite plugin generates next to the svgs:
// a script file (without imports or exports), the only place where a virtual module id can be
// declared.
declare module 'virtual:usesvelte/inline-svg' {
  /** Names of the svgs of the icons directory, typed by the inlineSvg vite plugin */
  export type IconName = 'check' | 'frontend/svelte'
}

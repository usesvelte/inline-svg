<div align="center">

# `@usesvelte/inline-svg`

<div>
  <img alt="GitHub License" src="https://img.shields.io/github/license/usesvelte/inline-svg">
  <img alt="NPM Version" src="https://img.shields.io/npm/v/%40usesvelte%2Finline-svg">
  <a rel="noopener noreferrer" target="_blank" href="https://erian.dev">
    <img src="https://img.shields.io/badge/created%20by-@eriandev-02ABB2.svg" alt="Created by Erick Vargas">
  </a>
</div>

</div>

## Install

**pnpm**

```bash
pnpm install -D @usesvelte/inline-svg
```

## Setup

The svgs are read at build time by a Vite plugin, so the plugin is required and has to be
registered in `vite.config.js` (or `vite.config.ts`):

```js
import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { inlineSvg } from '@usesvelte/inline-svg/vite'

export default defineConfig({
  plugins: [inlineSvg(), sveltekit()],
})
```

By default the svgs are read from `src/icons`. Use the `dir` option for any other location:

```js
inlineSvg({ dir: 'src/lib/assets/icons' })
```

The directory does not need to exist yet: if it is missing, `dir` points to a file or it contains
no svgs, the plugin prints a warning in the terminal instead of failing the build.

The svgs are inlined at build time, so `InlineSvg` renders the same markup on the server and on
the client, without touching the filesystem at runtime.

## Usage

> [!IMPORTANT]
> The svg to be used must be inside the icons directory, `src/icons` by default.

```svelte
<script>
  import { InlineSvg } from '@usesvelte/inline-svg'
</script>

<!-- Render the svg from "src/icons/github.svg" -->
<InlineSvg name="github" />

<!-- Render the svg from "src/icons/frontend/frameworks/svelte.svg" -->
<InlineSvg name="frontend/frameworks/svelte" />
```

Any other attribute of the svg, such as `class` or `width`, is forwarded to the rendered element.
The attributes of the file are only default values: the props passed to `InlineSvg` override them
(the component spreads `{...svg.attrs} {...customSvgAttrs}`), so you can also change them at
runtime.

Case is preserved: `src/icons/Mayus.svg` is rendered with `name="Mayus"`.
The extension itself is matched case-insensitively, so `MAYUS.SVG` is picked up too,
and files that are symbolic links are followed.

### Missing icons

If `name` does not match any file in the icons directory, `InlineSvg` logs a warning in the
console (only once per name) and renders an empty `<svg>`:

```console
[inline-svg] "not-an-icon" was not found in the icons directory
```

The build does not fail, and the server and the client render the same empty element.

## Icon file rules

- The root element must be `<svg>`. Comments, an xml prolog or a `DOCTYPE` before it are allowed.
- `xmlns` is recommended but not required; the component always renders
  `xmlns="http://www.w3.org/2000/svg"`.
- The markup has to be well-formed xml: tags balanced, attributes quoted. A `>` inside a quoted
  attribute value is fine.
- Entities in attributes are decoded (`&amp;` becomes `&`) before rendering.
- A file that breaks these rules produces a warning in the terminal at build time and renders as
  an empty `<svg>`, just like a missing icon.
- Two files that map to the same name (they can only differ in case, since the extension is
  matched case-insensitively) produce a warning at build time; the last one in alphabetical order
  wins.

## Dev server and HMR

In the dev server the svgs are re-read automatically: adding, editing or removing an svg in the
icons directory refreshes the component on its own.

Two caveats:

- With `vite build --watch`, svgs added _after_ the watch started may not be picked up (a Vite 5
  limitation); restart the watch in that case.
- If the icons directory is created _after_ the dev server started, restart the dev server: the
  plugin reads the directory on every request, but the watcher cannot subscribe to a directory
  that did not exist yet.

## Checks

- `pnpm build` — builds `dist/`.
- `pnpm check` — svelte-check, eslint, prettier, `publint` and `attw` against the packed
  tarball. It inspects the published files, so run `pnpm build` first.
- `pnpm test` — runs the test suite.

## Troubleshooting

The icon does not render? Work through this checklist:

1. The `name` matches the real path and case of the file relative to the icons directory.
2. The `dir` option points to the directory you expect (it is relative to the project root).
3. The build terminal shows the plugin warnings: missing directory, `dir` pointing to a file,
   empty directory and duplicate icon names are all reported there.
4. The icons directory existed before the dev server started; restart it if it was created later.

## Credits

This is a more up-to-date version of [svelte-inline-svg](https://github.com/robinscholz/svelte-inline-svg)

## License

[MIT License](https://github.com/usesvelte/inline-svg/blob/main/LICENSE) © 2026 [Erick Vargas](https://github.com/eriandev)

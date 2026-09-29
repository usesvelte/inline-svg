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

The svgs are read at build time by a Vite plugin, so it has to be registered in `vite.config.js`:

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

## Credits

This is a more current version of [svelte-inline-svg](https://github.com/robinscholz/svelte-inline-svg)

## License

[MIT License](https://github.com/usesvelte/inline-svg/blob/main/LICENSE) © 2026 [Erick Vargas](https://github.com/eriandev)

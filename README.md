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
pnpm install --save-dev @usesvelte/inline-svg
```

**yarn**
```bash
yarn add --save-dev @usesvelte/inline-svg
```

## Usage
> [!IMPORTANT]  
> The svg to be used must be inside the `src/icons` folder.

```html
<script>
  import { InlineSvg } from '@usesvelte/inline-svg'
</script>

<!-- Render the svg from "/src/icons/github.svg" -->
<InlineSvg name="github" />

<!-- Render the svg from "/src/icons/frontend/frameworks/svelte.svg" -->
<InlineSvg name="frontend/frameworks/svelte" />
```

## Credits
This is a more current version of [svelte-inline-svg](https://github.com/robinscholz/svelte-inline-svg)

## License
[MIT License](https://github.com/usesvelte/inline-svg/blob/main/LICENSE) © 2025 [Erick Vargas](https://github.com/eriandev)

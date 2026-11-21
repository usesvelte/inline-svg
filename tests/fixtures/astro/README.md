# Astro fixture

Minimal Astro app that consumes the library through `@usesvelte/inline-svg/astro`, used to verify
the integration end to end: `src/pages/index.astro` renders `InlineSvg name="check"` and
`src/icons/check.svg` is the svg it has to inline.

Run it from the repository root: the fixture links the package with `link:../../..`, so it always
sees this working copy, but it resolves the package through its `exports`, i.e. from `dist/`.

```bash
pnpm build
pnpm --dir tests/fixtures/astro install  # once, it has its own lockfile
pnpm --dir tests/fixtures/astro dev      # http://localhost:4321 renders the inline <svg>
pnpm --dir tests/fixtures/astro build    # dist/index.html contains the inline <svg> too
```

Both must render the real svg markup, with no `Cannot find module
'virtual:usesvelte/inline-svg'` and no `Unknown file extension ".svelte"` in the terminal.

Negative check: dropping `inlineSvg()` from `integrations` in `astro.config.mjs` makes the build
fail while resolving `virtual:usesvelte/inline-svg`, which is what the integration prevents.

`pnpm test.astro` from the repository root automates both checks: it builds the library, installs
the fixture, builds it, asserts the inline SVG in `dist/index.html` and runs the negative check.
It is also part of CI.

Generated files (`dist/`, `.astro/` and `src/icons/inline-svg.d.ts`) are ignored by git.

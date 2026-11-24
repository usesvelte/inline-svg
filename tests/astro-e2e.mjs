import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const fixtureDir = path.join(root, 'tests/fixtures/astro')
const htmlPath = path.join(fixtureDir, 'dist/index.html')

function run(args, options = {}) {
  const result = spawnSync('pnpm', args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options,
  })

  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`pnpm ${args.join(' ')} failed with exit code ${result.status}`)

  return result
}

// The fixture resolves the package through its exports, so dist/ has to exist first.
run(['build'])
run(['--dir', 'tests/fixtures/astro', 'install', '--frozen-lockfile'])
run(['--dir', 'tests/fixtures/astro', 'build'])

const html = readFileSync(htmlPath, 'utf8')
if (!html.includes('<svg') || !html.includes('M20 6 9 17l-5-5')) {
  throw new Error('The Astro fixture did not render the inline SVG.')
}

// The fixture reads this variable instead of rewriting its tracked config.
const result = spawnSync('pnpm', ['--dir', 'tests/fixtures/astro', 'build'], {
  cwd: root,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: process.platform === 'win32',
  env: { ...process.env, E2E_WITHOUT_INLINE_SVG: '1' },
})
const output = `${result.stdout ?? ''}${result.stderr ?? ''}`

if (result.status === 0) {
  throw new Error('The Astro build unexpectedly succeeded without the integration.')
}
if (!output.includes('virtual:usesvelte/inline-svg')) {
  throw new Error(`Expected a virtual module resolution error, got:\n${output}`)
}

console.log('Astro integration E2E: inline SVG and negative check passed.')

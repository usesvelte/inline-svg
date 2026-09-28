import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** Absolute path of the directory holding the real .svg files used by the tests. */
export const FIXTURES_DIR = path.dirname(fileURLToPath(import.meta.url))

/** Reads one of the real .svg fixtures by its name relative to this directory. */
export function readFixture(name: string): string {
  return fs.readFileSync(path.join(FIXTURES_DIR, name), 'utf8')
}

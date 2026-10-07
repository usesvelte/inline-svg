function toPosix(file: string): string {
  return file.replace(/\\/g, '/')
}

export function isIconFile(file: string, iconsDir: string): boolean {
  return toPosix(file).startsWith(toPosix(iconsDir) + '/') && file.toLowerCase().endsWith('.svg')
}

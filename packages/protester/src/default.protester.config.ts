/**
 * Timeout for a test file in ms.
 */
export const timeout = 5000
/**
 * The root directory of your test files.
 */
export const rootDir = ''
/**
 * The globs are matched against the files
 * using [picomatch](https://github.com/micromatch/picomatch).
 */
export const testFileGlobs = [
  '!node_modules',
  '!.git',
  '*.test.js'
]

import pathLib from 'path'
import mkdirp from 'mkdirp'
import { copyFile } from 'fs/promises'

import { tempDir, srcDir } from '../config.js'

/**
 * Copies "srcPath" to the /_sx/_temp/ directory.
 * @param {string} srcPath 
 */
export async function copyToTemp (srcPath) {
  const relativeSrcPath = pathLib.relative(srcDir, srcPath)
  const targetPath = pathLib.join(tempDir, relativeSrcPath)
  await mkdirp(pathLib.dirname(targetPath))
  await copyFile(srcPath, targetPath)
}

export default copyToTemp
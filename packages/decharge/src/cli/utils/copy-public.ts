import pathLib from 'path'
import mkdirp from 'mkdirp'
import { copyFile } from 'fs/promises'

import { publicDir, distDir } from '../config.js'

// TODO: unify this and copy-to-temp.ts

/**
 * Copies "srcPath" to the /.decharge directory.
 */
export async function copyPublic (srcPath: string): Promise<void> {
  const relativeSrcPath = pathLib.relative(publicDir, srcPath)
  const targetPath = pathLib.join(distDir, relativeSrcPath)
  await mkdirp(pathLib.dirname(targetPath))
  await copyFile(srcPath, targetPath)
}

export default copyPublic

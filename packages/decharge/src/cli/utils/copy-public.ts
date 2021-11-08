import pathLib from 'path'
import { copy } from 'fs-extra'

import { publicDir, distDir } from '../../common/current-config.js'

// TODO: unify this and copy-to-temp.ts

/**
 * Copies "srcPath" to the /.decharge directory.
 */
export async function copyPublic (srcPath: string): Promise<void> {
  const relativeSrcPath = pathLib.relative(publicDir, srcPath)
  const targetPath = pathLib.join(distDir, relativeSrcPath)
  await copy(srcPath, targetPath)
}

export default copyPublic

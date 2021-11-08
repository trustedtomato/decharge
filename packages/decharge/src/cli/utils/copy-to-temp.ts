import pathLib from 'path'
import { copy } from 'fs-extra'

import { tempDir, srcDir } from '../../common/current-config.js'

/**
 * Copies "srcPath" to the /.decharge directory.
 */
export async function copyToTemp (srcPath: string): Promise<void> {
  const relativeSrcPath = pathLib.relative(srcDir, srcPath)
  const targetPath = pathLib.join(tempDir, relativeSrcPath)
  await copy(srcPath, targetPath)
}

export default copyToTemp

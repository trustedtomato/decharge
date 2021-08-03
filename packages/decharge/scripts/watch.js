import { watch } from 'chokidar'
import fs from 'fs-extra'
import execa from 'execa'

async function copyRaw (srcPath) {
  const targetPath = srcPath.replace(/^src\//, 'dist/')
  await fs.copy(srcPath, targetPath)
}

watch('src', {
  ignored: /\.[jt]sx?$/
})
  .on('add', copyRaw)
  .on('change', copyRaw)

execa('npx', ['tsc', '--watch'], {
  stdio: 'inherit'
})

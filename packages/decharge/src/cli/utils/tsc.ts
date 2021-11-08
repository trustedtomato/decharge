import execa from 'execa'
import { tscBinPath } from '../../common/current-config.js'

export default async function (
  outDir: string, {
    watch = false
  } : {
    watch?: boolean
  } = {}
) {
  const args = ['--outDir', outDir]
  if (watch) {
    args.push('--watch')
  }
  await execa(tscBinPath, args, {
    stdout: 'inherit',
    stderr: 'inherit'
  })
}

import { spawn } from 'child_process'
import { tscBinPath } from '../../common/current-config.js'

export default function (outDir: string) {
  spawn(tscBinPath, ['--outDir', outDir, '--watch'], {
    stdio: 'inherit'
  })
}

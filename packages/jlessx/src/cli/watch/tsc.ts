import { spawn } from 'child_process'
import { tscBinPath } from '../config.js'

export default function (outDir: string) {
  spawn(tscBinPath, ['--outDir', outDir, '--watch'], {
    stdio: 'inherit'
  })
}

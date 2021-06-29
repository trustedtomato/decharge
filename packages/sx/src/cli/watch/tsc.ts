import { spawn } from 'child_process'
import { tscBinPath } from '../config.js'

export default function (outDir) {
  spawn(tscBinPath, ['--outDir', outDir, '--watch'], {
    stdio: 'inherit'
  })
}
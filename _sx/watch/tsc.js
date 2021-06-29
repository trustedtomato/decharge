import { spawn } from 'child_process'

export default function (outDir) {
  spawn('tsc', ['--outDir', outDir, '--watch'], {
    stdio: 'inherit'
  })
}
import { promisify } from 'util'
import childProcess from 'child_process'
const execFile = promisify(childProcess.execFile)
import { tscBinPath } from '../config.js'

export default async function (outDir: string) {
  const { stdout, stderr } = await execFile(tscBinPath, ['--outDir', outDir])
  if (stdout) {
    process.stdout.write(stdout)
  }
  if (stderr) {
    process.stderr.write(stderr)
  }
}
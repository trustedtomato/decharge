import { promisify } from 'util'
import childProcess from 'child_process'
import { tscBinPath } from '../../common/config.js'
const execFile = promisify(childProcess.execFile)

export default async function (outDir: string) {
  const { stdout, stderr } = await execFile(tscBinPath, ['--outDir', outDir])
  if (stdout) {
    process.stdout.write(stdout)
  }
  if (stderr) {
    process.stderr.write(stderr)
  }
}

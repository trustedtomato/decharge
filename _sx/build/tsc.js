import { promisify } from 'util'
import childProcess from 'child_process'
const execFile = promisify(childProcess.execFile)

export default async function (outDir) {
  const { stdout, stderr } = await execFile('tsc', ['--outDir', outDir])
  if (stdout) {
    process.stdout.write(stdout)
  }
  if (stderr) {
    process.stderr.write(stderr)
  }
}
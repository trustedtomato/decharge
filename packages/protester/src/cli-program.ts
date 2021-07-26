import { Worker } from 'worker_threads'
import readdirp from 'readdirp'
import * as config from './config.js'
import waitForEvent from 'p-event'
import chalk from 'chalk'
import pathLib from 'path'
import { formatAnsi } from './utils/format-ansi.js'

interface TestResult {
  passed: number
  failed: number
  failure: boolean
}

function displayTestResult (result: TestResult) {
  const strParts: string[] = []
  if (result.failed > 0) {
    strParts.push(chalk.redBright(`${result.failed} failed`))
  }
  strParts.push(
    chalk.greenBright(`${result.passed} passed`),
    chalk.gray(`${result.failed + result.passed} overall`)
  )
  return strParts.join(' ')
}

function displayPath (path: string): string {
  const pathParts = path
    .split(pathLib.sep)
  const dirname = chalk.gray(pathParts
    .slice(0, -1)
    .map(part => part + pathLib.sep)
    .join('')
  )
  const basename = pathParts[pathParts.length - 1]
  return dirname + basename
}

async function testFile (fullPath: string, name: string): Promise<TestResult> {
  console.log(`${chalk.gray('Testing')} ${displayPath(name)}...`)

  let failure = false

  const subLogTypeMaxLength = 15
  const subLogMaxLineLength = 80
  const subLogIndent = 4

  const subLog = ({
    isError = false,
    type,
    data
  }: {
    isError?: boolean
    type: string,
    data: string
  }) => {
    let typeColorFunc = chalk.gray
    if (isError) {
      typeColorFunc = chalk.redBright
      failure = true
    }

    const typeStr = typeColorFunc(type.padEnd(subLogTypeMaxLength))

    const log = formatAnsi(
      typeStr + data, {
        maxLineLength: subLogMaxLineLength,
        extraIndent: subLogIndent,
        firstIndent: subLogIndent
      }
    )

    console.log(log)
  }

  const worker = new Worker(new URL('./cli-program.worker.js', import.meta.url))
  worker.postMessage(fullPath)
  worker.on('message', ({ type, value }) => {
    if (type === 'console-log') {
      subLog({ type: 'console.log', data: value })
    } else if (type === 'console-error') {
      subLog({ type: 'console.error', data: value })
    } else if (type === 'log-failed-test') {
      subLog({ type: 'failed-test', data: `${value.name}\n${value.error}`, isError: true })
    } else if (type === 'error') {
      subLog({ type: 'error!', data: value, isError: true })
    }
  })

  const result = await (async function () {
    try {
      const { value: { passed, failed } } = await waitForEvent(worker, 'message', {
        filter: event => event.type === 'finish',
        rejectionEvents: ['error', 'exit'],
        timeout: config.timeout
      })
      return { passed, failed, failure }
    } catch (err) {
      subLog({ type: 'fatal error!', data: err, isError: true })
      return { passed: 0, failed: 1, failure: true }
    }
  })()

  subLog({ type: 'result', data: displayTestResult(result) })
  await worker.terminate()

  return result
}

export default async function (testFilePath: string) {
  const results: TestResult[] = []

  // If there is a testFilePath given, only test that file.
  if (testFilePath) {
    const result = await testFile(pathLib.resolve(process.cwd(), testFilePath), testFilePath)
    results.push(result)
  } else {
    for await (const { fullPath, path } of readdirp(config.rootDir, {
      fileFilter: config.testFileGlobs
    })) {
      const result = await testFile(fullPath, path)
      results.push(result)
    }

    console.log('')
    console.log(chalk.bold('Summary'))

    const passedTestFiles = results.reduce((passed, res) => res.failed === 0 ? passed + 1 : passed, 0)
    const failedTestFiles = results.reduce((failed, res) => res.failed !== 0 ? failed + 1 : failed, 0)
    const passedTests = results.reduce((passed, res) => res.passed + passed, 0)
    const failedTests = results.reduce((failed, res) => res.failed + failed, 0)

    if (failedTestFiles > 0) {
      console.log('Test files:',
        chalk.redBright(`${failedTestFiles} failed`),
        chalk.greenBright(`${passedTestFiles} passed`),
        chalk.gray(`${failedTestFiles + passedTestFiles} overall`)
      )
    } else {
      console.log('Test files:',
        chalk.greenBright(`${passedTestFiles} passed`),
        chalk.gray(`${passedTestFiles} overall`)
      )
    }

    if (failedTests > 0) {
      console.log('Tests:     ',
        chalk.redBright(`${failedTests} failed`),
        chalk.greenBright(`${passedTests} passed`),
        chalk.gray(`${failedTests + passedTests} overall`)
      )
    } else {
      console.log('Tests:     ',
        chalk.greenBright(`${passedTests} passed`),
        chalk.gray(`${passedTests} overall`)
      )
    }
  }

  const failure = results.some(result => result.failure)

  console.log(`Exiting with ${failure ? 'failure' : 'success'}.`)
  process.exitCode = failure ? 1 : 0
}

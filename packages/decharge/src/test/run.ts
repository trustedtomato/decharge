import { Worker } from 'worker_threads'
import readdirp from 'readdirp'
import config from './config.js'
import waitForEvent from 'p-event'
import chalk from 'chalk'
import wrapAnsi from 'wrap-ansi'

const formatAnsi = (text: string, { wrap, extraIndent, firstIndent }: { wrap: number, extraIndent: number, firstIndent: number }) => {
  const indent = firstIndent + extraIndent
  const firstIndentStr = ''.padEnd(firstIndent)
  const indentStr = ''.padEnd(indent)
  return (
    firstIndentStr +
    text.slice(0, firstIndent) +
    wrapAnsi(text.slice(firstIndent), wrap - indent, {
      hard: true
    }).replace(/\n/g, `\n${indentStr}`)
  )
}

let failed = false

const testFile = async (fullPath: string, name: string) => {
  console.log(`Testing ${name}...`)

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
    data: any[]
  }) => {
    const typeStr = (isError
      ? chalk.redBright
      : chalk.gray
    )(type.padEnd(subLogTypeMaxLength))

    const dataStr = data.join(' ')

    const log = formatAnsi(
      typeStr + dataStr, {
        wrap: subLogMaxLineLength,
        extraIndent: subLogIndent,
        firstIndent: subLogIndent
      }
    )

    console.log(log)
  }

  const worker = new Worker(new URL('./run.worker.js', import.meta.url))
  worker.postMessage(fullPath)
  worker.on('message', ({ type, value }) => {
    if (type === 'console-log') {
      subLog({ type: 'console.log', data: value })
    } else if (type === 'console-error') {
      subLog({ type: 'console.error', data: value })
    } else if (type === 'log-failed-test') {
      failed = true
      subLog({ type: 'failed-test', data: [`${value.name}\n${value.error}`], isError: true })
    } else if (type === 'error') {
      failed = true
      subLog({ type: 'error!', data: [value], isError: true })
    }
  })
  try {
    const { value: { passed, failed } } = await waitForEvent(worker, 'message', {
      filter: event => event.type === 'finish',
      rejectionEvents: ['error', 'exit'],
      timeout: config.timeout
    })
    await worker.terminate()
    return { passed, failed }
  } catch (err) {
    failed = true
    subLog({ type: 'fatal error!', data: [err], isError: true })
    await worker.terminate()
    return { passed: 0, failed: 1 }
  }
}

const testResults: { filename: string, result: { passed: number, failed: number } }[] = []

for await (const { fullPath, path } of readdirp(config.root, {
  fileFilter: [
    '*.test.js'
  ]
})) {
  const result = await testFile(fullPath, path)
  testResults.push({
    filename: path,
    result
  })
}

console.log('')
console.log(chalk.bold('Summary'))

const passedTestFiles = testResults.reduce((passed, res) => res.result.failed === 0 ? passed + 1 : passed, 0)
const failedTestFiles = testResults.reduce((failed, res) => res.result.failed !== 0 ? failed + 1 : failed, 0)
const passedTestResults = testResults.reduce((passed, res) => res.result.passed + passed, 0)
const failedTestResults = testResults.reduce((failed, res) => res.result.failed + failed, 0)

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

if (failedTestResults > 0) {
  console.log('Tests:     ',
    chalk.redBright(`${failedTestResults} failed`),
    chalk.greenBright(`${passedTestResults} passed`),
    chalk.gray(`${failedTestResults + passedTestResults} overall`)
  )
} else {
  console.log('Tests:     ',
    chalk.greenBright(`${passedTestResults} passed`),
    chalk.gray(`${passedTestResults} overall`)
  )
}

process.exitCode = failed ? 1 : 0

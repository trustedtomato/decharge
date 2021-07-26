import { test } from './lib.js'
import pathLib from 'path'
import { parentPort } from 'worker_threads'
import util from 'util'

const inspect = (msg: unknown) => util.inspect(msg, {
  breakLength: 40,
  colors: true
})

global.console.log = (...args: any[]) => {
  parentPort!!.postMessage({
    type: 'console-log',
    value: args.map(arg => inspect(arg)).join(' ')
  })
}

global.console.error = (...args: any[]) => {
  parentPort!!.postMessage({
    type: 'console-error',
    value: args.map(arg => inspect(arg)).join(' ')
  })
}

// By default, unhandled promises are silently ignored.
// Let's forward them instead.
process.on('unhandledRejection', (error) => {
  parentPort!!.postMessage({
    type: 'error',
    value: inspect(error)
  })
})

process.on('uncaughtExceptionMonitor', (error) => {
  parentPort!!.postMessage({
    type: 'error',
    value: inspect(error)
  })
})

parentPort!!.once('message', async (filePath) => {
  test.logFailedTest = (name, error) => {
    parentPort!!.postMessage({
      type: 'log-failed-test',
      value: {
        name,
        error: inspect(error)
      }
    })
  }
  try {
    await import(
      pathLib.resolve(process.cwd(), filePath)
    )
    await Promise.allSettled(test.pending)
  } catch (error) {
    parentPort!!.postMessage({
      type: 'error',
      value: inspect(error)
    })
  }
  parentPort!!.postMessage({
    type: 'finish',
    value: {
      passed: test.passed,
      failed: test.failed
    }
  })
})

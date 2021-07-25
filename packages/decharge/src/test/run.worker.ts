import { test } from './lib.js'
import pathLib from 'path'
import { parentPort } from 'worker_threads'

global.console.log = (...args: any[]) => {
  parentPort!!.postMessage({
    type: 'console-log',
    value: args
  })
}

global.console.error = (...args: any[]) => {
  parentPort!!.postMessage({
    type: 'console-error',
    value: args
  })
}

// By default, unhandled promises are silently ignored.
// Let's forward them instead.
process.on('unhandledRejection', (error) => {
  parentPort!!.postMessage({
    type: 'error',
    value: error
  })
})

process.on('uncaughtExceptionMonitor', (error) => {
  parentPort!!.postMessage({
    type: 'error',
    value: error
  })
})

parentPort!!.once('message', async (filePath) => {
  test.logFailedTest = (name, error) => {
    parentPort!!.postMessage({
      type: 'log-failed-test',
      value: {
        name,
        error
      }
    })
  }
  try {
    await import(
      pathLib.resolve(process.cwd(), filePath)
    )
    await Promise.all(test.pending)
  } catch (error) {
    parentPort!!.postMessage({
      type: 'error',
      value: error
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

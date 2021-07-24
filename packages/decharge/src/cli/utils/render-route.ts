import { Worker } from 'worker_threads'
import waitForEvent from 'p-event'

/**
 * Only the [dynamic routes] in "path" will be transformed.
 */
export async function renderRoute (path: string, baseDir: string): Promise<Map<string, string>> {
  // Using a worker here because else the imports would stay in the cache.
  // Another way to invalidate caches would be to append query strings at the
  // end of imports, but that would cause a memory leak.
  const worker = new Worker(new URL('./render-route.worker.js', import.meta.url))
  worker.postMessage({ path, baseDir })
  worker.on('message', ({ type, value }) => {
    if (type === 'console-log') {
      console.log(...value)
    } else if (type === 'console-error') {
      console.error(...value)
    } else if (type === 'error') {
      console.error(value)
      worker.terminate()
    }
  })

  try {
    const files = await waitForEvent(worker, 'message', {
      filter: event => event.type === 'result',
      rejectionEvents: ['error', 'exit']
    })
    await worker.terminate()
    return files.value
  } catch (err) {
    console.error(`Problem with route: ${path}`)
    console.error(err)
    return new Map()
  }
}

export default renderRoute

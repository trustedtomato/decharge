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
  const files = await waitForEvent(worker, 'message')
  await worker.terminate()
  return files
}

export default renderRoute

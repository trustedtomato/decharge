import { Worker } from 'worker_threads'
import waitForEvent from 'p-event'

/**
 * Only the [dynamic routes] in "path" will be transformed.
 * @param {string} path The path from the "routes" directory.
 * @param {string} baseDir The "routes" directory.
 * @returns {Promise<Map<string, string>>}
 */
export async function renderRoute (path, baseDir) {
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
import { Worker } from 'worker_threads'
import { makeClassNameIterator } from '../../common/make-class-name-iterator.js'
import { RpcProvider } from 'worker-rpc'
import mkdirp from 'mkdirp'
import { distGeneratedDir } from '../../common/current-config.js'
import pathLib from 'path'
import { Lock } from './lock.js'

interface ComplexComponentNonCustomState {
  ownDirAbsolutePath: string | null
}

const globalState = {
  complexComponentSetups: new Map<string, {
    setupOptions: any,
    nonCustomState: ComplexComponentNonCustomState,
    customState: any,
    customStateLock: Lock
  }>(),
  complexComponentOwnDirIterator: makeClassNameIterator()
}

/**
 * Only the [dynamic routes] in "path" will be transformed.
 */
export async function renderRoute (path: string, baseDir: string): Promise<Map<string, string>> {
  // Using a worker here because else the imports would stay in the cache.
  // Another way to invalidate caches would be to append query strings at the
  // end of imports, but that would cause a memory leak.
  const worker = new Worker(new URL('../../common/render-route.worker.js', import.meta.url))
  const rpcProvider = new RpcProvider((message, transfer) => worker.postMessage(message, transfer))
  worker.on('message', (e) => rpcProvider.dispatch(e))

  rpcProvider.registerRpcHandler('console-log', (value: any[]) => {
    console.log(...value)
  })

  rpcProvider.registerRpcHandler('console-error', (value: any[]) => {
    console.error(...value)
  })

  rpcProvider.registerRpcHandler('error', async (value: any) => {
    console.error(value)
    await worker.terminate()
  })

  rpcProvider.registerRpcHandler('global-state/setup-complex-component', async (setupOptions: {
    id: string,
    generateOwnDir: boolean
  }): Promise<ComplexComponentNonCustomState> => {
    const { id, generateOwnDir } = setupOptions

    if (globalState.complexComponentSetups.has(id)) {
      return globalState.complexComponentSetups.get(id)!!.nonCustomState
    }

    let ownDirAbsolutePath: string | null = null
    if (generateOwnDir) {
      const ownDirPath = globalState.complexComponentOwnDirIterator.next().value
      ownDirAbsolutePath = pathLib.join(distGeneratedDir, ownDirPath)
      await mkdirp(ownDirAbsolutePath)
    }

    const complexComponentSetup = {
      setupOptions,
      customState: null,
      customStateLock: new Lock(),
      nonCustomState: {
        ownDirAbsolutePath
      }
    }

    globalState.complexComponentSetups.set(id, complexComponentSetup)
    return complexComponentSetup.nonCustomState
  })

  try {
    const files = await Promise.race<Map<string, string>>([
      new Promise<never>((resolve, reject) => {
        rpcProvider.error.addHandler(error => {
          console.error('error occured')
          reject(error)
        })
        worker.on('error', err => reject(err))
        worker.on('exit', exitCode => reject(exitCode))
      }),
      rpcProvider.rpc<any, Map<string, string>>('render-route', { path, baseDir })
    ])
    worker.unref()
    return files
  } catch (error) {
    process.exitCode = 1
    console.error(`Problem with route: ${path}`)
    console.error(error)
    return new Map()
  }
}

export default renderRoute

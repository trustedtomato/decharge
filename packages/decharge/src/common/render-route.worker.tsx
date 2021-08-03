import pathLib from 'path'
import { parentPort } from 'worker_threads'
import { RpcProvider } from 'worker-rpc'
import { renderPage } from './render.js'
import { DynamicRoute, SimpleRoute } from '../types/Route.js'

/**
 * Returns the path where the compiled JS route file should be put.
 * For example: "posts/hello-world.js" will be "posts/hello-world/index.html".
 * NOTE: it doesn't transform [square-bracketed] paths,
 * that should be done before calling this function.
 */
const jsPathToHtmlPath = (jsRoutePath: string): string => {
  if (jsRoutePath.endsWith('/index.js') || jsRoutePath === 'index.js') {
    return jsRoutePath.replace(/\.js$/, '.html')
  }
  return jsRoutePath.replace(/\.js$/, '/index.html')
}

const rpcProvider = new RpcProvider((message, transfer) => parentPort!!.postMessage(message, transfer))
parentPort!!.on('message', (e) => rpcProvider.dispatch(e))

// Have to override console methods because of this bug: https://github.com/nodejs/node/issues/30491
console.log = (...args: any[]) => {
  rpcProvider.rpc('console-log', args)
}

console.error = (...args: any[]) => {
  rpcProvider.rpc('console-error', args)
}

// By default, unhandled promises are silently ignored.
// Let's forward them instead.
process.on('unhandledRejection', (error) => {
  rpcProvider.rpc('error', error)
})

process.on('uncaughtExceptionMonitor', (error) => {
  rpcProvider.rpc('error', error)
})

export const globalState = {
  setupComplexComponent (setupOptions: {
    id: string,
    generateOwnDir: boolean
  }): Promise<{
    ownDirAbsolutePath: string
  }> {
    return rpcProvider.rpc('global-state/setup-complex-component', setupOptions)
  }
}

rpcProvider.registerRpcHandler(
  'render-route',
  async ({ baseDir, path }: { baseDir: string, path: string }) => {
    const files: Map<string, string> = new Map()

    const srcPath = pathLib.join(baseDir, path)
    const route = (await import(
      // The current working directory should be the project root.
      pathLib.resolve(process.cwd(), srcPath)
    )).default as (DynamicRoute<unknown> | SimpleRoute)

    const dataList = typeof route === 'function'
      // simple route
      ? [{}]
      // dynamic route
      : route.dataList

    const Page = typeof route === 'function'
      // simple route
      ? route
      // dynamic route
      : route.Page

    // TODO: generate all of the pages at once with Promise.all
    for (const [index, data] of dataList.entries()) {
      const targetPath = jsPathToHtmlPath(
        path
          // Expand the [square-bracketed] parts in the path.
          // @ts-ignore
          .replace(/\[(.*?)\]/g, (_, name) => data?.[name] ?? '')
      )
      if (!pathLib.join(baseDir, targetPath).startsWith(baseDir)) {
        throw new Error(`Build error: ${path} wants to create a page which would be outside of the target directory.`)
      }
      files.set(targetPath, `<!DOCTYPE html>${await renderPage(() => <Page data={data} index={index} />)}`)
    }

    return files
  }
)

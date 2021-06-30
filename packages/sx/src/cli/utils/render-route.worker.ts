import pathLib from 'path'
import { parentPort } from 'worker_threads'
import render from '../../common/render.js'

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

parentPort.once('message', async ({ baseDir, path }: { baseDir: string, path: string }) => {
  const files: Map<string, string> = new Map()

  const srcPath = pathLib.join(baseDir, path)
  const route = await import(
    // The current working directory should be the project root.
    pathLib.resolve(process.cwd(), srcPath)
  )
  const propsList = route.propsList ?? [{}]

  // TODO: generate all of the pages at once with Promise.all
  for (const props of propsList) {
    const targetPath = jsPathToHtmlPath(
      path
        // Expand the [square-bracketed] parts in the path.
        .replace(/\[(.*?)\]/g, (_, name) => props[name] ?? '')
    )
    if (!pathLib.join(baseDir, targetPath).startsWith(baseDir)) {
      throw new Error(`Build error: ${path} wants to create a page which would be outside of the target directory.`)
    }
    const jsx = await route.default(props)
    files.set(targetPath, `<!DOCTYPE html>${await render(jsx)}`)
  }

  parentPort.postMessage(files)
})
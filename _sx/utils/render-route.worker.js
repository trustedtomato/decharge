import pathLib from 'path'
import { parentPort } from 'worker_threads'
import * as preactRenderer from './preact-renderer.js'

/**
 * Returns the path where the compiled JS route file should be put.
 * For example: "posts/hello-world.js" will be "posts/hello-world/index.html".
 * NOTE: it doesn't transform [square-bracketed] paths,
 * that should be done before calling this function.
 * @param {string} jsRoutePath
 * @returns {string}
 */
const jsPathToHtmlPath = (jsRoutePath) => {
  if (jsRoutePath.endsWith('/index.js') || jsRoutePath === 'index.js') {
    return jsRoutePath.replace(/\.js$/, '.html')
  } else {
    return jsRoutePath.replace(/\.js$/, '/index.html')
  }
}

parentPort.once('message', async ({ baseDir, path }) => {
  const files = new Map()
  
  let srcPath = pathLib.join(baseDir, path)
  const route = await import(
    // The current working directory should be the project root.
    pathLib.resolve(process.cwd(), srcPath)
  )
  const propsList = route.propsList ?? [{}]

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
    preactRenderer.init(jsx)
    files.set(targetPath, preactRenderer.serialize())
  }

  parentPort.postMessage(files)
})
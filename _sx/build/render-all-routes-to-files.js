import { writeFile } from 'fs/promises';
import mkdirp from 'mkdirp'
import pathLib from 'path'
import readdirp from 'readdirp'
import renderRoute from '../utils/render-route.js'

const id = x => x

/**
 * Renders all routes in the routesDir to targetDir. 
 * @param {{ routesDir: string, targetDir: string, transform: (x: string) => string }} param0 
 */
export async function renderAllRoutesToFiles ({
  routesDir,
  targetDir,
  transform = id
}) {  
  const pathCreatorRoutePaths = new Map()

  for await (const {
    // path will be relative to routesDir.
    path: routePath
  } of readdirp(routesDir, { fileFilter: '*.js' })) {
    const newFiles = await renderRoute(routePath, routesDir)

    for (const [path, content] of newFiles) {
      if (pathCreatorRoutePaths.has(path)) {
        throw new Error(`Both ${pathCreatorRoutePaths.get(path)} and ${routePath} tries to create the same file: ${path}`)
      }
      pathCreatorRoutePaths.set(path, routePath)
      const absolutePath = pathLib.join(targetDir, path)
      await mkdirp(pathLib.dirname(absolutePath))
      await writeFile(absolutePath, transform(content))
    }
  }
}

export default renderAllRoutesToFiles
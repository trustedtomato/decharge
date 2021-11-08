import fs from 'fs-extra'
import pathLib from 'path'
import readdirp from 'readdirp'
import { id } from '../utils/id.js'
import renderRoute from '../utils/render-route.js'

/**
 * Renders all routes in the routesDir to targetDir.
 */
export async function renderAllRoutesToFiles ({
  routesDir,
  targetDir,
  transform = id
}: {
  routesDir: string,
  targetDir: string,
  transform?: (x: string) => string
}) {
  const pathCreatorRoutePaths = new Map()

  // TODO: parallelize!
  for await (const {
    // path will be relative to routesDir.
    path: routePath
  } of readdirp(routesDir, { fileFilter: '*.js' })) {
    console.log(routePath)
    const newFiles = await renderRoute(routePath, routesDir)

    for (const [path, content] of newFiles) {
      if (pathCreatorRoutePaths.has(path)) {
        throw new Error(`Both ${pathCreatorRoutePaths.get(path)} and ${routePath} tries to create the same file: ${path}`)
      }
      pathCreatorRoutePaths.set(path, routePath)
      const absolutePath = pathLib.join(targetDir, path)
      await fs.outputFile(absolutePath, transform(content))
    }
  }
}

export default renderAllRoutesToFiles

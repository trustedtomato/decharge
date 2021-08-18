import { fileURLToPath } from 'url'
import { resolve, relative, join, dirname } from 'path'
import { Config } from './Config.js'

const config = new Config(
  await (async () => {
    try {
      const userConfig = await import(
        resolve(
          process.cwd(),
          'decharge.config.js'
        )
      )
      return userConfig
    } catch (err) {
      // TODO: error handling
      return undefined
    }
  })()
)

export const generatedClassNamePrefix = config.generatedClassNamePrefix

// Make paths absolute.
export const srcDir = resolve(process.cwd(), config.srcDir)
export const routesDir = resolve(srcDir, config.routesDir)
export const tempDir = resolve(process.cwd(), config.tempDir)
export const tempRoutesDir = resolve(tempDir, relative(srcDir, routesDir))
export const distDir = resolve(process.cwd(), config.distDir)
export const distGeneratedDir = resolve(distDir, config.distGeneratedDir)
export const publicDir = resolve(process.cwd(), config.publicDir)

if (!routesDir.startsWith(srcDir)) {
  throw new Error(`Invalid decharge config file: Routes directory (${routesDir}) must be inside src directory (${srcDir})!`)
}

// Local paths.
const __dirname = dirname(fileURLToPath(import.meta.url))
export const projectRoot = join(__dirname, '../..')
export const tscBinPath = join(projectRoot, 'node_modules/.bin/tsc')
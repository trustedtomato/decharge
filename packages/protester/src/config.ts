import { resolve } from 'path'
import * as defaultConfig from './default.protester.config.js'

const config = await (async () => {
  try {
    const userConfig = await import(
      resolve(
        process.cwd(),
        'protester.config.js'
      )
    )
    return {
      ...defaultConfig,
      ...userConfig.default,
      ...userConfig
    }
  } catch (err) {
    // TODO: error handling
    return defaultConfig
  }
})()

// make paths absolute
export const rootDir: string = resolve(process.cwd(), config.rootDir)

export const timeout: number = config.timeout
export const testFileGlobs: string[] = config.testFileGlobs

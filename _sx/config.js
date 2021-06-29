import { resolve } from 'path'

const config = await import(
  resolve(
    process.cwd(),
    'sx.config.js'
  )
)

// Make paths absolute.
export const srcDir = resolve(process.cwd(), config.srcDir)
export const routesDir = resolve(process.cwd(), config.routesDir)
export const tempDir = resolve(process.cwd(), config.tempDir)
export const tempRoutesDir = resolve(process.cwd(), config.tempRoutesDir)
export const distDir = resolve(process.cwd(), config.distDir)
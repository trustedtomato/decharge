import pathLib from 'path'
import { renderAllRoutesToFiles } from './render-all-routes-to-files.js'
import { minifyHtml } from './minify-html.js'
import tsc from './tsc.js'
import readdirp from 'readdirp'
import copyToTemp from '../utils/copy-to-temp.js'
import { tempDir, srcDir, distDir, tempRoutesDir } from '../config.js'

// Copy not ts/js/tsx/jsx files to _temp,
// since they are not handled by tsc.
for await (const { fullPath } of readdirp(srcDir, {
  fileFilter: [
    '!*.[tj]s',
    '!*.[tj]sx'
  ]
})) {
  await copyToTemp(fullPath)
}

await tsc(tempDir)
await renderAllRoutesToFiles({
  routesDir: tempRoutesDir,
  targetDir: distDir,
  transform: minifyHtml
})
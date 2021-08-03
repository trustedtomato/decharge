import readdirp from 'readdirp'
import fs from 'fs-extra'
import pathLib from 'path'
import execa from 'execa'

// clean
await fs.rm('dist', {
  recursive: true,
  force: true
})

// copy non-ts files
for await (const { path, fullPath } of readdirp('src', {
  fileFilter: [
    '!*.[tj]s',
    '!*.[tj]sx'
  ]
})) {
  await fs.copy(fullPath, pathLib.join('dist', path))
}

// build ts files
execa('npx', ['tsc'], { stdio: 'inherit' })

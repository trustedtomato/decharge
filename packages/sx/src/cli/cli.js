import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { routesDir } from './config.js'
import fs from 'fs/promises'
import { constants as fsConstants } from 'fs'

yargs(hideBin(process.argv))
  .check(async () => {
    try {
      await fs.access(routesDir, fsConstants.R_OK)
      return true
    } catch (err) {
      return new Error(
`Can only run sx commands from sx projects! This isn't an sx project, \
since the routes directory (${routesDir}) doesn't exist \
(or at least it isn't readable).`
      )
    }
  })
  .command(await import('./build/cli.js'))
  .command(await import('./watch/cli.js'))
  .argv
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { routesDir } from '../common/current-config.js'
import fs from 'fs-extra'

// eslint-disable-next-line no-unused-expressions
yargs(hideBin(process.argv))
  .check(async () => {
    if (await fs.pathExists(routesDir)) {
      return true
    }

    return new Error(
`Can only run decharge commands from decharge projects! This isn't a decharge project, \
since the routes directory (${routesDir}) doesn't exist \
(or at least it isn't readable).`
    )
  })
  .command(await import('./build/cli.js'))
  .command(await import('./watch/cli.js'))
  .argv

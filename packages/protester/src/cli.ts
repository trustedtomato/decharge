import minimist from 'minimist'
import { stripIndent } from 'common-tags'

const argv = minimist(process.argv.slice(2), {
  alias: {
    help: ['h']
  }
})

if (argv.help) {
  console.log(stripIndent`
    Usage: protester [test-file-path] [--help | -h]    
  `)
  process.exit()
}

const program = await import('./cli-program.js')
program.default(argv._[0])

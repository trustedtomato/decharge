import { parseSync } from '@babel/core'
import precinct from 'precinct'

export function parseDependencies (jsFileString: string) {
  const parseResult = parseSync(jsFileString, {
    presets: [
      [
        '@babel/preset-env'
      ]
    ],
    caller: {
      name: 'Node.js',
      supportsDynamicImport: true,
      supportsExportNamespaceFrom: true,
      supportsStaticESM: true,
      supportsTopLevelAwait: true
    }
  })
  if (parseResult === null) {
    throw new Error('babel returned null in parse-dependencies!')
  }
  return precinct(
    parseResult, {
      type: 'es6'
    }
  )
}

export default parseDependencies

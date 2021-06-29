import { parseSync } from '@babel/core'
import precinct from 'precinct'

export function parseDependencies (jsFileString) {
  return precinct(
    parseSync(jsFileString, {
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
    }), {
      type: 'es6'
    }
  )
}

export default parseDependencies
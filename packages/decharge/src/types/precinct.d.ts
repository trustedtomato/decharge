// This is a reduced version of it precinct's API!
declare module 'precinct' {
  import { ParseResult } from '@babel/core'

  type moduleTypes = 'amd' | 'commonjs' | 'css' | 'es6' | 'less' | 'sass' | 'scss' | 'stylus' | 'ts' | 'tsx'

  export default function precinct (
    content: string | ParseResult,
    options: {
      type: moduleTypes
    }
  ): string[]
}

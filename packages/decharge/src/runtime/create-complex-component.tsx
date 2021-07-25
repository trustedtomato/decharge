import type { JSX } from 'preact/jsx-runtime'
import { usePageContext } from './hooks.js'
import { oneLine } from 'common-tags'

export function css ([startString, ...restString]: TemplateStringsArray, ...vars: unknown[]) {
  const result: string[] = [startString]
  for (let i = 0; i < vars.length; i++) {
    result.push(String(vars[i]), restString[i])
  }
  return result.join('')
}

export function createComplexComponent<T> ({
  id,
  Component,
  style,
  script
}: {
  id: string,
  Component: (props: T & { generatedClassName: string }) => JSX.Element,
  style?: string,
  script?: string | Function
}) {
  const ComplexComponent = (props: T): JSX.Element => {
    const pageContext = usePageContext()
    if (pageContext === null) {
      throw new Error('Cannot setup complex component without a page context!')
    }

    const stringScript = script && String(script)
    if (
      stringScript && !(
        // enable this syntax: function () {
        stringScript.startsWith('f') ||
        // enable this syntax: () => {
        stringScript.startsWith('(')
      )
    ) {
      throw new Error(oneLine`
        The script property in createComplexComponent must have
        the old function syntax (script: function () { ... })
        or the arrow function syntax (script: () => { ... }).
        You can also reference functions
        which were defined using these syntaxes,
        but that's not a good practice if they are not controlled
        by you, since they can change the function's syntax anytime.
      `)
    }

    const generatedClassName = pageContext.setupComplexComponent({
      id,
      style,
      script: stringScript
    })
    return <Component {...({ ...props, generatedClassName })} />
  }
  return ComplexComponent
}

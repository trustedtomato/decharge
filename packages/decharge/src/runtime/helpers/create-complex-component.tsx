import type { JSX } from 'preact/jsx-runtime'
import { usePageContext } from '../hooks/index.js'
import { oneLine, TemplateTag } from 'common-tags'

export const css = new TemplateTag({})

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
  const stringScript = script && String(script)

  // Not all stringified functions can be executed without transformation.
  // For example, method syntaxed ones can't, try:
  // eval("script () { alert('hello') }")
  // For this reason, only those kinds of definitions are allowed
  // which don't require any transformation.
  if (
    stringScript && !(
      // enable this syntax: function () {
      /^function\s*\(/.test(stringScript) ||
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

  const ComplexComponent = (props: T): JSX.Element => {
    const pageContext = usePageContext()
    if (pageContext === null) {
      throw new Error('Cannot setup complex component without a page context!')
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

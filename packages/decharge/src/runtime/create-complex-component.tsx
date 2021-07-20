import type { JSX } from 'preact/jsx-runtime'
import { usePageContext } from './hooks.js'

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
    const generatedClassName = pageContext.setupComplexComponent({
      id,
      style,
      script: String(script)
    })
    return <Component {...({ ...props, generatedClassName })} />
  }
  return ComplexComponent
}

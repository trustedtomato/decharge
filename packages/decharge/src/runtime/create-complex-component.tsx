import { useContext } from 'preact/hooks'
import type { JSX } from 'preact/jsx-runtime'
import { SetupComplexComponentContext } from '../common/render.js'

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
  Component: (props: T & { className: string }) => JSX.Element,
  style?: string,
  script?: string | Function
}) {
  const ComplexComponent = (props: T): JSX.Element => {
    const setupComplexComponent = useContext(SetupComplexComponentContext)
    if (setupComplexComponent === null) {
      throw new Error('Cannot setup complex component in a non-rendering context!')
    }
    const className = setupComplexComponent({
      id,
      style,
      script: String(script)
    })
    return <Component {...({ ...props, className })} />
  }
  return ComplexComponent
}

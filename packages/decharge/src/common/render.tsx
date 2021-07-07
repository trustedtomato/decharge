import { render as preactRender, createContext, JSX } from 'preact'
import { JSDOM } from 'jsdom'
import { useState } from 'preact/hooks'
import { makeClassNameIterator } from './make-class-name-iterator.js'
import transformStyle from './transform-style.js'

const jsdom = new JSDOM('<!DOCTYPE html>')
const document = jsdom.window.document
global.document = document

export const RenderingDelayContext = createContext<Set<Promise<unknown>> | null>(null)
export const ScriptsContext = createContext<string[] | null>(null)
export const StylesContext = createContext<string[] | null>(null)

interface SetupComplexComponentOptions {
  id: string
  script?: string
  style?: string
}

export const SetupComplexComponentContext = createContext<((options: SetupComplexComponentOptions) => string) | null>(null)

function startRender (jsx: JSX.Element) {
  const root = document.createElement('x-root')
  document.body.appendChild(root)

  preactRender(jsx, root)
  return {
    finalize () {
      const html = root.innerHTML
      // Nicely unrender Preact component.
      preactRender(null, root)
      root.remove()
      return html
    }
  }
}

/** Renders a JSX component to HTML. */
export async function render (jsx: JSX.Element) {
  const delayerPromises: Set<Promise<unknown>> = new Set()
  const classNames: Map<string, string> = new Map()
  const classNameIterator = makeClassNameIterator()

  const ToRender = () => {
    const [scripts, setScripts] = useState([] as string[])
    const [styles, setStyles] = useState([] as string[])

    function setupComplexComponent ({
      id,
      style,
      script
    }: SetupComplexComponentOptions): string {
      if (classNames.has(id)) {
        // @ts-ignore
        return classNames.get(id)
      }
      const className = classNameIterator.next().value
      classNames.set(id, className)
      if (style) {
        setStyles([...styles, transformStyle(style, className)])
      }
      if (script) {
        setScripts([...scripts, `(${script})(${JSON.stringify(className)});`])
      }
      return className
    }

    return (
      <RenderingDelayContext.Provider value={delayerPromises}>
      <ScriptsContext.Provider value={scripts}>
      <StylesContext.Provider value={styles}>
      <SetupComplexComponentContext.Provider value={setupComplexComponent}>
        {jsx}
      </SetupComplexComponentContext.Provider>
      </StylesContext.Provider>
      </ScriptsContext.Provider>
      </RenderingDelayContext.Provider>
    )
  }

  const rendering = startRender(<ToRender />)
  do {
    const pendingDelayerPromises = [...delayerPromises]
    await Promise.all(pendingDelayerPromises)
    for (const resolvedDelayerPromise of pendingDelayerPromises) {
      delayerPromises.delete(resolvedDelayerPromise)
    }
  } while (delayerPromises.size > 0)
  return rendering.finalize()
}

export default render

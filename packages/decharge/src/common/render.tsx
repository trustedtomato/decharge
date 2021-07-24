import { render as preactRender, createContext, JSX, ComponentChildren } from 'preact'
import globalJsdom from 'global-jsdom'
import { useState } from 'preact/hooks'
import { useConst } from '../runtime/hooks.js'
import { makeClassNameIterator } from './make-class-name-iterator.js'
import transformStyle from './transform-style.js'
import { generatedClassNamePrefix } from './config.js'

// TODO: make this configurable and document it!
// (flooding the global object and not just the document property, see previous version)
globalJsdom('<!DOCTYPE html>', {
  url: 'https://example.com'
})

export interface PageContextType {
  scripts: string[],
  styles: string[],
  setupComplexComponent: (options: {
    id: string
    script?: string
    style?: string
  }) => string
}

export interface RenderingContextType {
  delayerPromises: Set<Promise<unknown>>,
}

export const RenderingContext = createContext<RenderingContextType | null>(null)
export const PageContext = createContext<PageContextType | null>(null)

/** Renders a JSX component to HTML. */
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

/**
 * Renders a decharge component to HTML.
 * If pageContextToUse is not used, Component will be treated as a page.
 */
export async function render (Component: () => JSX.Element, pageContextToUse?: PageContextType) {
  const delayerPromises: Set<Promise<unknown>> = new Set()

  const RenderWrapper = ({ children }: { children: ComponentChildren }) => {
    const [scripts, setScripts] = useState([] as string[])
    const [styles, setStyles] = useState([] as string[])
    const classNames = useConst<Map<string, string>>(() => new Map())
    const classNameIterator = useConst(() => makeClassNameIterator())

    const pageContext: PageContextType = pageContextToUse ?? {
      scripts,
      styles,
      setupComplexComponent: ({
        id,
        style,
        script
      }): string => {
        if (classNames.has(id)) {
          // @ts-ignore
          return classNames.get(id)
        }
        const className = `${generatedClassNamePrefix}${classNameIterator.next().value}`
        classNames.set(id, className)
        if (style) {
          setStyles([...styles, transformStyle(style, className)])
        }
        if (script) {
          setScripts([...scripts, `(${script})(${JSON.stringify(className)});`])
        }
        return className
      }
    }

    return (
      <PageContext.Provider value={pageContext}>
      <RenderingContext.Provider value={{
        delayerPromises
      }}>
        {children}
      </RenderingContext.Provider>
      </PageContext.Provider>
    )
  }

  const rendering = startRender(<RenderWrapper><Component /></RenderWrapper>)
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

import { render as preactRender, createContext, JSX } from 'preact'
import globalJsdom from 'global-jsdom'
import { useState } from 'preact/hooks'
import { useConst } from '../runtime/hooks/index.js'
import { makeClassNameIterator } from './make-class-name-iterator.js'
import transformStyle from './transform-style.js'
import { generatedClassNamePrefix } from './current-config.js'

// TODO: make this configurable and document it!
// (flooding the global object and not just the document property, see previous version)
globalJsdom('<!DOCTYPE html>', {
  url: 'https://example.com'
})

export interface SetupComplexComponentResult {
  className: string
  ownDirPath?: string
}

export interface PageContextType {
  scripts: string[],
  styles: string[],
  setupComplexComponent: (
    options: {
      id: string
      script?: string
      style?: string,
      generateOwnDir?: boolean
    }
  ) => Promise<SetupComplexComponentResult>
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
 * Renders a decharge page to HTML.
 */
export async function renderPage (Page: () => JSX.Element): Promise<string> {
  const PageWithContext = () => {
    const [scripts, setScripts] = useState([] as string[])
    const [styles, setStyles] = useState([] as string[])
    const complexComponentSetups = useConst<Map<string, SetupComplexComponentResult>>(() => new Map())
    const classNameIterator = useConst(() => makeClassNameIterator())

    const pageContext: PageContextType = {
      scripts,
      styles,
      setupComplexComponent: async ({
        id,
        style,
        script,
        generateOwnDir = false
      }) => {
        if (complexComponentSetups.has(id)) {
          return complexComponentSetups.get(id)!!
        }
        const generatedClassName = `${generatedClassNamePrefix}${classNameIterator.next().value}`
        if (style) {
          setStyles([...styles, transformStyle(style, generatedClassName)])
        }
        if (script) {
          setScripts([...scripts, `(${script})(${JSON.stringify(generatedClassName)});`])
        }
        const result: SetupComplexComponentResult = {
          className: generatedClassName
        }
        if (!process.env.TESTING) {
          const { globalState } = await import('./render-route.worker.js')
          const { ownDirAbsolutePath } = await globalState.setupComplexComponent({
            id,
            generateOwnDir
          })
          result.ownDirPath = ownDirAbsolutePath
        }
        complexComponentSetups.set(id, result)
        return result
      }
    }

    return <PageContext.Provider value={pageContext}>
      <Page />
    </PageContext.Provider>
  }

  return await render(() => <PageWithContext />)
}

/**
 * Renders a decharge component - with the given page context - to HTML.
 */
export async function renderComponent (Component: () => JSX.Element, pageContext: PageContextType): Promise<string> {
  return await render(() =>
    <PageContext.Provider value={pageContext}>
      <Component />
    </PageContext.Provider>
  )
}

/**
 * Renders a decharge component to HTML.
 */
async function render (Component: () => JSX.Element) {
  const delayerPromises: Set<Promise<unknown>> = new Set()

  const rendering = startRender(
    <RenderingContext.Provider value={{
      delayerPromises
    }}>
      <Component />
    </RenderingContext.Provider>
  )

  do {
    const pendingDelayerPromises = [...delayerPromises]
    await Promise.all(pendingDelayerPromises)
    for (const resolvedDelayerPromise of pendingDelayerPromises) {
      delayerPromises.delete(resolvedDelayerPromise)
    }
  } while (delayerPromises.size > 0)
  return rendering.finalize()
}

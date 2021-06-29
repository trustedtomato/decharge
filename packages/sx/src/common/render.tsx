import { render as preactRender, createContext } from 'preact'
import { JSDOM } from 'jsdom'

const jsdom = new JSDOM('<!DOCTYPE html>')
const document = jsdom.window.document
global.document = document

export const RenderDelay = createContext<Set<Promise<unknown>>>(null)

function startRender (jsx) {
  const root = document.createElement('x-root');
  document.body.appendChild(root);
  
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
export async function render (jsx) {
  const delayerPromises: Set<Promise<unknown>> = new Set()
  const rendering = startRender(
    <RenderDelay.Provider value={delayerPromises}>{jsx}</RenderDelay.Provider>
  )
  // TODO: disable any types in TypeScript for type safety.
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
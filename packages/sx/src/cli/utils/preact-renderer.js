import { render, h } from 'preact'
import { JSDOM } from 'jsdom'

const jsdom = new JSDOM('<!DOCTYPE html>')
const document = jsdom.window.document
global.document = document

export function startRender (jsx) {
  const root = document.createElement('x-root');
  document.body.appendChild(root);
  
  render(jsx, root)
  return {
    finalize () {
      const html = root.innerHTML
      // Nicely unrender Preact component.
      render(null, root)
      root.remove()
      return html
    }
  }
}

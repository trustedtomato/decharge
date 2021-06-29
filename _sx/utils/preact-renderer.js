import { render } from 'preact'
import { JSDOM } from 'jsdom'

const jsdom = new JSDOM('<!DOCTYPE html>')
const document = jsdom.window.document
global.document = document
let root

const parent = document.createElement('x-root');
document.body.appendChild(parent);

export function init (jsx) {
  root = render(jsx, parent, root)
}

export function serialize () {
  return jsdom.serialize()
    .replace(/^<!DOCTYPE html><html><head><\/head><body><x-root>/, '<!DOCTYPE html>')
    .replace(/<\/x-root><\/body><\/html>$/, '')
}
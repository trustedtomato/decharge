import { renderPage } from './render.js'
import { test } from 'protester'

test('renders sync component properly', async (assert) => {
  const tru = true
  assert.equal(await renderPage(() => <>Test</>), 'Test')
  assert.equal(await renderPage(() => <div>{ tru ? 'Test' : 'Not test' }</div>), '<div>Test</div>')
})

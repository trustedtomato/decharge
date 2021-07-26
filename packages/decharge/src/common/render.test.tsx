import { render } from './render.js'
import { test } from 'protester'

test('renders sync component properly', async (assert) => {
  const tru = true
  assert.equal(await render(() => <>Test</>), 'Test')
  assert.equal(await render(() => <div>{ tru ? 'Test' : 'Not test' }</div>), '<div>Test</div>')
})

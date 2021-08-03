import type { ComponentChildren } from 'preact'
import { renderPage } from '../../common/render.js'
import { test } from 'protester'
import { createAsyncComponent } from './create-async-component.js'
import { setTimeout } from 'timers/promises'

test('createAsyncComponent works as expected', async assert => {
  assert.expectedAssertionCount = 1

  const AsyncComponent = createAsyncComponent<{ children: ComponentChildren }>(async ({ children }) => {
    await setTimeout(100)
    return () => <>
      Hello { children }!
    </>
  })

  const result = await renderPage(() => <AsyncComponent>Test</AsyncComponent>)

  assert.equal(result, 'Hello Test!')
})

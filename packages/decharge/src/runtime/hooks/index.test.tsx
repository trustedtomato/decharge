import { test } from 'protester'
import { render } from '../../common/render.js'
import { useConst, useState, useRenderBlocker, useRerenderingRef, useConstAsync } from './index.js'
import { setTimeout } from 'timers/promises'

test('useState\'s setState triggers exactly one rerender + blocks rendering', async assert => {
  assert.expectedAssertionCount = 3

  let renderIteration = 0
  const result = await render(() => {
    const [state, setState] = useState('default-value')
    if (renderIteration === 0) {
      assert.equal(state, 'default-value')
    } else if (renderIteration === 1) {
      assert.equal(state, 'updated-value')
    } else {
      assert.fail('Expected only one rerender!')
    }
    renderIteration++
    setState('updated-value')
    return <>{state}</>
  })
  assert.equal(
    result,
    'updated-value',
    'useState did not successfully block rendering!'
  )
})

test('useConst hook only runs once', async assert => {
  assert.expectedAssertionCount = 1

  let i = 0
  const result = await render(() => {
    const [, setState] = useState('default-value')
    useConst(() => {
      i++
    })
    setState('updated-value')
    return <>{ i }</>
  })
  assert.equal(result, '1')
})

test('useRenderBlocker blocks rendering', async assert => {
  assert.expectedAssertionCount = 1

  const result = await render(() => {
    const [state, setState] = useState('default-value')
    const renderBlocker = useRenderBlocker()
    // Note that this is intentionally not useConstAsync,
    // so that only useRenderBlocker blocks rendering.
    useConst(async () => {
      await setTimeout(100)
      setState('updated-value')
      renderBlocker.release()
    })
    return <>{state}</>
  })

  assert.equal(result, 'updated-value')
})

test('useRerenderingRef really rerenders + has the expected ref', async assert => {
  assert.expectedAssertionCount = 3

  let renderIteration = 0

  await render(() => {
    const ref = useRerenderingRef<HTMLDivElement>()
    if (renderIteration === 0) {
      assert.equal(ref.current, null)
    } else if (renderIteration === 1) {
      assert.equal(ref.current!!.nodeName, 'DIV')
      assert.equal(ref.current!!.textContent!!.trim(), 'Test')
    }
    renderIteration++
    return <main>
      <div ref={ref}>
        Test
      </div>
    </main>
  })
})

test('useConstAsync works as expected', async assert => {
  assert.expectedAssertionCount = 3

  let nthRender = 0

  const result = await render(() => {
    nthRender++
    const asyncValue = useConstAsync(async () => {
      await setTimeout(100)
      return 'async-value'
    })
    if (nthRender === 1) {
      assert.equal(asyncValue, null)
    } else if (nthRender === 2) {
      assert.equal(asyncValue, 'async-value')
    }
    return <>{asyncValue}</>
  })

  assert.equal(result, 'async-value')
})

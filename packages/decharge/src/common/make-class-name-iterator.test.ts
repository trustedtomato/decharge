import { makeClassNameIterator } from './make-class-name-iterator.js'
import { test } from '../test/lib.js'

test('iterates over classNames correctly', (assert) => {
  assert.expectedAssertionCount = 7
  const iterator = makeClassNameIterator()
  assert.equal(iterator.next().value, 'a') // 1
  assert.equal(iterator.next().value, 'b') // 2
  let previous = iterator.next().value
  for (const current of iterator) {
    switch (previous) {
      case 'z':
        assert.equal(current, 'aa') // 3
        break
      case 'az':
        assert.equal(current, 'a0') // 4
        break
      case 'a9':
        assert.equal(current, 'a-') // 5
        break
      case 'a_':
        assert.equal(current, 'ba') // 6
        break
      case 'ba':
        assert.equal(current, 'bb') // 7
        return
    }
    previous = current
  }
})

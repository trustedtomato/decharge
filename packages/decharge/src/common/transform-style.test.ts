import { transformStyle } from './transform-style.js'
import { test } from '../test/lib.js'

test('correctly substituting .this with the className', (assert) => {
  assert.equal(transformStyle('.this{color:red;}', 'potato'), '.potato{color:red;}')
  assert.equal(transformStyle('.this .that{color:red;}', 'potato'), '.potato .that{color:red;}')
  assert.equal(transformStyle('.this[attr=ibute]{color:red;}', 'potato'), '.potato[attr=ibute]{color:red;}')
  assert.equal(transformStyle('.this,.that{color:red;}', 'potato'), '.potato,.that{color:red;}')
  assert.equal(transformStyle('.other{color:blue;}.this,.that{color:red;}', 'potato'), '.other{color:blue;}.potato,.that{color:red;}')
})

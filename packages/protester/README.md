# Protester

A testing library + binary for Node.js which can handle your ES modules.
It uses a different worker for each of your files to prevent hangup
and to create (nearly) full isolation.
*Note that this also means that you can't import anything which utilises `parentPort` from the `worker_threads` module.*
This most probably means your worker files.

## Usage

Protester doesn't flood your global object because I find that behaviour quite unpleasant.
You have to import the testing functions from the `protester` package.
Example:

```js
import { test } from 'protester'

// You should always use the assert object given here
// because it's hooked into protester.
test('name of the test', assert => {
  assert.equal(true, true)
})
```

The `assert` object contains the asserting methods which [chai's assert object provides](https://www.chaijs.com/api/assert/).

### Async tests

You can send an async function as a callback in `test`.
It's a good practice to assert the number of assertions
in a test. For that, there is an `expectedAssertionCount` property
on the assert object.
Example:

```js
import { test } from 'protester'
import { setTimeout as delay } from 'timers/promises'

// You should always use the assert object given here
// because it's hooked into protester.
test('name of the async test', async assert => {
  assert.expectedAssertionCount = 1

  await delay(500)

  assert.equal(true, true)
})
```

### Running the tests

You can simply run `protester` to run all of your tests
and `protester [test-file-path]` to run a single test.
Use `protester --help` for the complete set of options.

### Configuration

Create a `protester.config.js` in your project's root directory.
You can both export your options one-by-one or in a huge object with export default.
Check `src/default.protester.config.ts` for all the options, the default values and the descriptions.
import chai from 'chai'

const assertionCount = Symbol('assertion-count')

const baseAssertExtraProps = {
  expectedAssertionCount: null as number | null,
  [assertionCount]: 0
}

const baseAssert = {
  ...chai.assert,
  ...baseAssertExtraProps
}

export const test = Object.assign(
  async (name: string, callback: (assert: typeof baseAssert) => Promise<void> | void) => {
    const assert = { ...baseAssert }

    const proxy = new Proxy(assert, {
      get (target, property, receiver) {
        if (!Object.prototype.hasOwnProperty.call(baseAssertExtraProps, property)) {
          target[assertionCount] += 1
        }
        return Reflect.get(target, property, receiver)
      }
    })

    try {
      const pendingTest = callback(proxy)
      test.pending.push(pendingTest)
      await pendingTest
    } catch (err) {
      test.logFailedTest!!(name, err)
      test.failed++
      return
    }

    if (typeof assert.expectedAssertionCount === 'number' && assert.expectedAssertionCount !== assert[assertionCount]) {
      test.logFailedTest!!(
        name,
        new Error(`Expected ${assert.expectedAssertionCount} number of assertions, got ${assert[assertionCount]}`)
      )
      test.failed++
      return
    }

    test.passed++
  }, {
    pending: [] as (void | Promise<void>)[],
    passed: 0,
    failed: 0,
    logFailedTest: null as (null | ((name: string, error: Error) => void))
  }
)

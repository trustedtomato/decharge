/**
 * When trigger gets called, starts debouncing trigger calls,
 * and when all the debouncing promises finish,
 * all the trigger parameters which were collected
 * since the initial trigger was made
 * are sent to the "triggerable" function in one chunk.
 * @example
 * ```js
 * const d = new Debouncer((params) => console.log(params))
 * d.addDebouncingPromise(delay(1000))
 * d.trigger('a')
 * d.trigger('b')
 * await delay(500)
 * d.trigger('c')
 * await delay(750)
 * // Before the delay finishes, ['a', 'b', 'c'] is logged.
 * d.trigger('d')
 * console.log('this will be logged earlier than [\'d\'] because the Debouncer is async.')
 * // No debouncing promises are active, so ['d'] is logged.
 * ```
 */
export class Debouncer<T> {
  private running: Promise<void> | null = null
  private debouncingPromises: Set<unknown> = new Set()
  private paramsArray: T[] = []

  constructor (private readonly triggerable: (paramsArray: T[]) => void) {}

  addDebouncingPromise (promise: Promise<unknown>) {
    this.debouncingPromises.add(promise)
  }

  /**
   * Waits for the given debouncingPromises to finish,
   * then fires "triggerable" if "trigger" was called during debouncing.
   */
  startDebouncing () {
    if (!this.running) {
      const debounce = async (): Promise<void> => {
        const pendingDebouncingPromises = [...this.debouncingPromises]
        await Promise.all(pendingDebouncingPromises)
        for (const resolvedDebouncingPromise of pendingDebouncingPromises) {
          this.debouncingPromises.delete(resolvedDebouncingPromise)
        }
        if (this.debouncingPromises.size > 0) {
          return debounce()
        }
        if (this.paramsArray.length > 0) {
          this.triggerable(this.paramsArray)
          this.paramsArray = []
        }
      }

      this.running = debounce().then(() => {
        this.running = null
      })
    }
    return this.running
  }

  trigger (params: T) {
    this.paramsArray.push(params)
    this.startDebouncing()
  }
}

export default Debouncer

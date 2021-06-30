export class Debouncer<T> {
  triggered = false
  debouncingPromises: Set<unknown> = new Set()
  paramsArray: T[] = []

  constructor (private readonly triggerable: (paramsArray: T[]) => void) {}

  addDebouncingPromise (promise: Promise<unknown>) {
    this.debouncingPromises.add(promise)
  }

  trigger (params: T) {
    this.paramsArray.push(params)
    if (this.triggered) {
      return
    }
    this.triggered = true
    const debounce = async (): Promise<void> => {
      const pendingDebouncingPromises = [...this.debouncingPromises]
      await Promise.all(pendingDebouncingPromises)
      for (const resolvedDebouncingPromise of pendingDebouncingPromises) {
        this.debouncingPromises.delete(resolvedDebouncingPromise)
      }
      if (this.debouncingPromises.size > 0) {
        return debounce()
      }
      this.triggerable(this.paramsArray)
      this.paramsArray = []
      this.triggered = false
    }
    debounce()
  }
}

export default Debouncer

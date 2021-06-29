export class Debouncer {
  constructor (triggerable) {
    this.triggerable = triggerable
    this.triggered = false
    this.debouncingPromises = new Set()
    this.paramsArray = []
  }
  addDebouncingPromise (promise) {
    this.debouncingPromises.add(promise)
  }
  trigger (params) {
    this.paramsArray.push(params)
    if (this.triggered) {
      return
    }
    this.triggered = true
    const debounce = async () => {
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
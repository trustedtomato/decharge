export class Lock {
  private lastAcquisition: Promise<void> = Promise.resolve()
  release = (): void => {}

  acquire (): Promise<void> {
    const lastAcquisition = this.lastAcquisition
    this.lastAcquisition = this.lastAcquisition
      .then(() => new Promise<void>(resolve => {
        this.release = () => {
          resolve()
        }
      }))
    return lastAcquisition
  }
}

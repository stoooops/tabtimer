// Timer class encapsulates the timer logic
export default class Timer {
  private timerId: number | null = null
  private startTime: number | null = null
  public elapsedTime: number = 0

  constructor(private callback: () => void, private interval: number) {}

  // Start the timer
  start() {
    this.startTime = Date.now()
    this.timerId = setInterval(() => {
      if (this.startTime === null) {
        return
      }
      this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000)
      this.callback()
    }, this.interval)
  }

  // Stop the timer and reset the elapsed time
  stop() {
    if (this.timerId === null) {
      return
    }
    clearInterval(this.timerId)
    this.timerId = null
    this.startTime = null
    this.elapsedTime = 0
  }

  // Pause the timer and save the elapsed time in seconds
  pause() {
    if (this.timerId === null) {
      return
    }
    clearInterval(this.timerId)
    this.timerId = null
    if (this.startTime === null) {
      return
    }
    this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000)
  }

  // Resume the timer and restore the elapsed time
  resume() {
    this.startTime = Date.now() - this.elapsedTime * 1000
    this.timerId = setInterval(() => {
      if (this.startTime === null) {
        return
      }
      this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000)
      this.callback()
    }, this.interval)
  }
}

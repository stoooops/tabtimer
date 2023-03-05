export enum TimerType {
  COUNTUP = 'countup',
  FOCUS = 'focus',
}

enum TimerState {
  NOT_STARTED = 'not_started',
  RUNNING = 'running',
  PAUSED = 'paused',
}

// Timer class encapsulates the timer logic
export default class Timer {
  private timerId: number | null = null
  private startTime: number | null = null
  private pauseTime: number | null = null
  private elapsedPause: number = 0
  public elapsed: number = 0
  public state: TimerState = TimerState.NOT_STARTED

  constructor(public type: TimerType, private interval: number) {}

  tick() {
    if (this.startTime === null) {
      return
    }
    // const before = this.elapsed
    this.elapsed = Date.now() - this.startTime - this.elapsedPause
    // const after = this.elapsed
    // console.log(`${this.type} tick ${before} -> ${after}`)
  }

  // Start the timer
  start() {
    if (this.state === TimerState.RUNNING) {
      return
    }
    if (this.state === TimerState.PAUSED) {
      // error condition unexpected
      throw new Error('Cannot start a paused timer, must resume')
    }
    if (this.state !== TimerState.NOT_STARTED) {
      // error condition unexpected
      throw new Error('Cannot start a timer that is not in the NOT_STARTED state')
    }
    this.state = TimerState.RUNNING
    this.startTime = Date.now()
    this.timerId = setInterval(this.tick.bind(this), this.interval)
  }

  // Stop the timer and reset the elapsed time
  stop() {
    if (this.state === TimerState.NOT_STARTED) {
      return
    }
    if (this.state !== TimerState.RUNNING && this.state !== TimerState.PAUSED) {
      // error condition unexpected
      throw new Error('Cannot stop a timer that is not in the RUNNING or PAUSED state')
    }
    if (this.timerId === null) {
      throw new Error(`timerId is null but state is ${this.state}`)
    }
    clearInterval(this.timerId)
    this.timerId = null
    this.startTime = null
    this.elapsed = 0
    this.pauseTime = null
    this.elapsedPause = 0
  }

  pause() {
    if (this.state === TimerState.PAUSED) {
      console.warn(`${this.type} timer is already paused`)
      return
    }
    if (this.state !== TimerState.RUNNING) {
      throw new Error(`Cannot pause a timer that is not in the RUNNING state. (state = ${this.state})`)
    }
    this.state = TimerState.PAUSED
    this.pauseTime = Date.now()
    if (this.timerId === null) {
      throw new Error(`timerId is null but state is ${this.state}`)
    }
    clearInterval(this.timerId)
  }

  unpause() {
    if (this.state === TimerState.RUNNING) {
      console.warn(`${this.type} timer is already running`)
      return
    }
    if (this.state !== TimerState.PAUSED) {
      throw new Error(`Cannot unpause a timer that is not in the PAUSED state. (state = ${this.state})`)
    }
    this.state = TimerState.RUNNING
    this.elapsedPause += Date.now() - this.pauseTime!
    this.timerId = setInterval(this.tick.bind(this), this.interval)
  }
}

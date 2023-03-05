import Timer, { TimerType } from './Timer'
function nowTime(): string {
  return `${new Date().toLocaleTimeString('en-US', { hour12: false })}`
}

export default class Model {
  private countupTimer: Timer
  private focusTimer: Timer
  private lastFocusCallbackElapsed: number = 0
  constructor() {
    // Create two instances of the Timer class: countupTimer and focusTimer
    this.countupTimer = new Timer(TimerType.COUNTUP, 1000, this.countupCallback.bind(this))
    this.countupTimer.start()
    this.focusTimer = new Timer(TimerType.FOCUS, 1000, this.focusCallback.bind(this))
    this.focusTimer.start()

    // Listen for the visibilitychange event and handle it
    document.addEventListener('visibilitychange', this.handleVisibilityChange)

    // Listen for the blur event and handle it
    window.addEventListener('blur', this.handleBlur)

    // Listen for the focus event and handle it
    window.addEventListener('focus', this.handleFocus)

    // daemon to log the "elapsed" state every 3 seconds
    setInterval(() => {
      console.log(JSON.stringify(this.elapsed()))
    }, 3000)
  }

  countupCallback = (elapsed: number) => {
    // do nothing
  }

  // add diff to the storage
  focusCallback = (elapsed: number) => {
    const diff = elapsed - this.lastFocusCallbackElapsed
    localStorage.setItem('focusTimer_elapsed_today', String(this.getStorageElapsedToday() + diff))
    this.lastFocusCallbackElapsed = elapsed
  }

  private getStorageElapsedToday(): number {
    return Number(localStorage.getItem('focusTimer_elapsed_today'))
  }

  elapsed(): Record<string, Record<string, string | number>> {
    return {
      countup: {
        elapsed: this.elapsedCountupTime(),
        state: this.countupTimer.state,
      },
      focus: {
        elapsed: this.elapsedFocusTime(),
        state: this.focusTimer.state,
      },
      today: {
        elapsed: this.getStorageElapsedToday(),
        state: this.focusTimer.state, // same as focus timer
      },
    }
  }

  elapsedCountupTime(): number {
    return this.countupTimer.elapsed
  }

  elapsedFocusTime(): number {
    return this.focusTimer.elapsed
  }

  // Handle the blur event by pausing the focus timer
  handleBlur = () => {
    this.focusTimer.pause()
    console.log(`${nowTime()} (blur) Pause ${TimerType.FOCUS} timer @ ${this.focusTimer.elapsed}`)
  }

  // Handle the focus event by resuming the focus timer
  handleFocus = () => {
    this.focusTimer.unpause()
    console.log(`${nowTime()} (focus) Resume ${TimerType.FOCUS} timer @ ${this.focusTimer.elapsed}`)
  }

  // Handle the visibilitychange event by pausing or resuming the focus timer
  handleVisibilityChange = () => {
    if (document.hidden) {
      this.focusTimer.pause()
      console.log(`${nowTime()} (visibilitychange:hidden) Pause ${TimerType.FOCUS} timer @ ${this.focusTimer.elapsed}`)
    } else {
      this.focusTimer.unpause()
      console.log(
        `${nowTime()} (visibilitychange:!hidden) Resume ${TimerType.FOCUS} timer @ ${this.focusTimer.elapsed}`
      )
    }
  }
}

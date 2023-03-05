import Timer, { TimerType } from './Timer'

function nowTime(): string {
  return `${new Date().toLocaleTimeString('en-US', { hour12: false })}`
}

export default class Model {
  private countupTimer: Timer
  private focusTimer: Timer
  constructor() {
    // Create two instances of the Timer class: countupTimer and focusTimer
    this.countupTimer = new Timer(TimerType.COUNTUP, 1000)
    this.countupTimer.start()
    this.focusTimer = new Timer(TimerType.FOCUS, 1000)
    this.focusTimer.start()

    // Listen for the visibilitychange event and handle it
    document.addEventListener('visibilitychange', this.handleVisibilityChange)

    // Listen for the blur event and handle it
    window.addEventListener('blur', this.handleBlur)

    // Listen for the focus event and handle it
    window.addEventListener('focus', this.handleFocus)
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

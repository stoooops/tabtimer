import Timer from './Timer'

export default class Model {
  private countupTimer: Timer
  private focusTimer: Timer
  constructor() {
    // Create two instances of the Timer class: countupTimer and focusTimer
    this.countupTimer = new Timer(() => {}, 1000)
    this.countupTimer.start()
    this.focusTimer = new Timer(() => {}, 1000)
    this.focusTimer.start()

    // Listen for the visibilitychange event and handle it
    document.addEventListener('visibilitychange', this.handleVisibilityChange)

    // Listen for the blur event and handle it
    window.addEventListener('blur', this.handleBlur)

    // Listen for the focus event and handle it
    window.addEventListener('focus', this.handleFocus)
  }

  elapsedCountupTime() {
    return this.countupTimer.elapsedTime
  }

  elapsedFocusTime() {
    return this.focusTimer.elapsedTime
  }

  // Handle the blur event by pausing the focus timer
  handleBlur = () => {
    this.focusTimer.pause()
    console.log('(blur) Pause focus timer @ ' + this.focusTimer.elapsedTime)
  }

  // Handle the focus event by resuming the focus timer
  handleFocus = () => {
    this.focusTimer.resume()
    console.log('(focus) Resume focus timer @ ' + this.focusTimer.elapsedTime)
  }

  // Handle the visibilitychange event by pausing or resuming the focus timer
  handleVisibilityChange = () => {
    if (document.hidden) {
      this.focusTimer.pause()
      console.log('(visibilitychange:hidden) Pause focus timer @ ' + this.focusTimer.elapsedTime)
    } else {
      this.focusTimer.resume()
      console.log('(visibilitychange:!hidden) Resume focus timer @ ' + this.focusTimer.elapsedTime)
    }
  }
}

import Timer, { TimerState, TimerType } from './Timer'
function nowTime(): string {
  return `${new Date().toLocaleTimeString('en-US', { hour12: false })}`
}

function isResetTime(): boolean {
  const now = new Date()
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
  const nextMidnight = new Date(midnight.getTime() + 24 * 60 * 60 * 1000)
  return now >= midnight && now < nextMidnight
}

interface Storage {
  get: (key: string, defaultValue: any, storageArea: 'sync' | 'local' | 'managed') => Promise<any>
  set: (key: string, value: any, storageArea: 'sync' | 'local' | 'managed') => Promise<void>
}

export const storage: Storage = {
  get: (key: string, defaultValue: any, storageArea: 'sync' | 'local' | 'managed') => {
    const keyObj = defaultValue === undefined ? key : { [key]: defaultValue }
    return new Promise((resolve, reject) => {
      chrome.storage[storageArea].get(keyObj, (items: any) => {
        const error = chrome.runtime.lastError
        if (error) {
          reject(error)
        } else {
          resolve(items[key])
        }
      })
    })
  },
  set: (key: string, value: any, storageArea: 'sync' | 'local' | 'managed') => {
    return new Promise((resolve, reject) => {
      chrome.storage[storageArea].set({ [key]: value }, () => {
        const error = chrome.runtime.lastError
        if (error) {
          reject(error)
        } else {
          resolve()
        }
      })
    })
  },
}

const KEY = 'focusTimer_elapsed_today'

export default class Model {
  private countupTimer: Timer
  private focusTimer: Timer
  private lastFocusCallbackElapsed: number = 0
  private started: boolean = false
  constructor() {
    // ensure chrome.storage is initialized
    console.log('chrome', chrome)
    console.log('chrome.storage', chrome.storage)
    console.log('chrome.storage.local', chrome.storage.local)
    // Create two instances of the Timer class: countupTimer and focusTimer
    this.countupTimer = new Timer(TimerType.COUNTUP, 1000, this.countupCallback.bind(this))
    this.focusTimer = new Timer(TimerType.FOCUS, 1000, this.focusCallback.bind(this))
  }

  start() {
    if (this.started) {
      throw new Error('Model timers already started')
    }
    this.started = true
    this.countupTimer.start()
    this.focusTimer.start()

    // Listen for the visibilitychange event and handle it
    document.addEventListener('visibilitychange', this.handleVisibilityChange)

    // Listen for the blur event and handle it
    window.addEventListener('blur', this.handleBlur)

    // Listen for the focus event and handle it
    window.addEventListener('focus', this.handleFocus)

    // daemon to log debug info
    setInterval(() => {
      this.readElapsed().then((result) => {
        console.log(JSON.stringify(result))
      })
    }, 1000)

    // Check if it's midnight and reset timers and storage values
    setInterval(() => {
      if (isResetTime()) {
        this.resetTimers()
        this.resetStorageValues()
      }
    }, 60 * 1000) // check every minute
  }

  countupCallback = (elapsed: number) => {
    // do nothing
  }

  // add diff to the storage
  focusCallback = (elapsed: number) => {
    const diff = elapsed - this.lastFocusCallbackElapsed
    if (diff < 0) {
      // this can happen if the callback interrupts the focusTimer vs lastFocusCallbackElapsed which are not atomic
      console.warn(`RACE Focus callback diff is negative: ${diff}`)
      return
    }
    console.log(`Focus callback ${elapsed} - ${this.lastFocusCallbackElapsed} = ${diff}`)
    this.readStorageElapsedToday().then((storedVal) => {
      const val = storedVal + diff
      console.log(`Updating local storage ${KEY} = ${val}...`)
      storage
        .set(KEY, val, 'local')
        .then(() => {})
        .then(() => {
          console.log(`Updated local storage ${KEY} = ${val}`)
        })
    })
    this.lastFocusCallbackElapsed = elapsed
  }

  private readStorageElapsedToday(): Promise<number> {
    return storage.get(KEY, 0, 'local')
  }

  private resetStorageValues(): Promise<void> {
    console.log(`Resetting local storage ${KEY} = 0...`)
    return storage.set(KEY, 0, 'local').then(() => {
      console.log(`Reset local storage ${KEY} = 0`)
    })
  }

  readElapsed(): Promise<Record<string, Record<string, number | TimerState>>> {
    return this.readStorageElapsedToday().then((storageResult) => {
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
          elapsed: storageResult,
          state: this.focusTimer.state, // same as focus timer
        },
      }
    })
  }

  elapsedCountupTime(): number {
    return this.countupTimer.elapsed
  }

  elapsedFocusTime(): number {
    return this.focusTimer.elapsed
  }

  private resetTimers(): void {
    this.countupTimer.reset()
    this.focusTimer.reset()
    this.lastFocusCallbackElapsed = 0
  }

  reset(): void {
    console.log(`${nowTime()} Resetting timers`)
    this.resetTimers()
    this.resetStorageValues()
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

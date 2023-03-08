import Timer, { TimerState, TimerType } from './Timer'
function nowTime(): string {
  return `${new Date().toLocaleTimeString('en-US', { hour12: false })}`
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
  private started: boolean = false
  private resetTimersAtTime: Date
  private previousStorageUpdateElapsedValue: number = 0
  private previousStorageUpdateTime: Date = new Date(0, 0, 0, 0, 0, 0)
  private key: string
  constructor() {
    // ensure chrome.storage is initialized
    console.log('chrome', chrome)
    console.log('chrome.storage', chrome.storage)
    console.log('chrome.storage.local', chrome.storage.local)
    // Create two instances of the Timer class: countupTimer and focusTimer
    this.countupTimer = new Timer(TimerType.COUNTUP, 1000, () => ({}))
    this.focusTimer = new Timer(TimerType.FOCUS, 1000, this.updateStorageValues.bind(this))
    const hostname = window.location.hostname
    // remove subdomains
    const parts = hostname.split('.')
    while (parts.length > 2) {
      parts.shift()
    }
    this.key = `${KEY}_${parts.join('.')}`

    this.resetTimersAtTime = this.getResetTime()
  }

  getResetTime(): Date {
    const now = new Date()
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0)
    const nextMidnight = new Date(midnight.getTime() + 24 * 60 * 60 * 1000)
    return nextMidnight
  }

  isResetTime(): boolean {
    return new Date() > this.resetTimersAtTime
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

    const millisecondsUntilResetTime = this.resetTimersAtTime.getTime() - new Date().getTime()
    const secondsUntilResetTime = millisecondsUntilResetTime / 1000
    const minutesUntilResetTime = secondsUntilResetTime / 60
    const hoursUntilResetTime = minutesUntilResetTime / 60
    const daysUntilResetTime = hoursUntilResetTime / 24
    const ms = millisecondsUntilResetTime % 1000
    const s = Math.floor(secondsUntilResetTime % 60)
    const m = Math.floor(minutesUntilResetTime % 60)
    const h = Math.floor(hoursUntilResetTime % 24)
    const d = Math.floor(daysUntilResetTime)
    console.log(`Schedule reset timers at ${this.resetTimersAtTime.toISOString()} in ${d}d ${h}h ${m}m ${s}s ${ms}ms`)
    setTimeout(() => {
      console.log(`Resetting timers due to reset time ${this.resetTimersAtTime.toISOString()}`)
      this.reset()
    }, millisecondsUntilResetTime)
  }

  // add diff to the storage
  updateStorageValues = (elapsed: number) => {
    // calculate the diff between the last time we updated the storage and now
    const diff = elapsed - this.previousStorageUpdateElapsedValue
    if (diff < 0) {
      // this can happen if the callback interrupts the focusTimer vs lastFocusCallbackElapsed which are not atomic
      console.warn(`RACE Focus callback diff is negative: ${diff}`)
      return
    }
    if (new Date().getTime() - this.previousStorageUpdateTime.getTime() < 10000) {
      console.log(`${diff}ms since last update, skipping`)
      return
    }

    // update the storage
    console.log(`updateStorageValues ${elapsed} - ${this.previousStorageUpdateElapsedValue} = ${diff}`)
    this.readStorageElapsedToday().then((storedVal) => {
      const val = storedVal + diff
      console.log(`Updating local storage ${this.key} = ${val}...`)
      storage.set(this.key, val, 'local').then(() => {
        console.log(`Updated local storage ${this.key} = ${val}`)
        // update the previous value
        this.previousStorageUpdateElapsedValue = elapsed
        this.previousStorageUpdateTime = new Date()
      })
    })
  }

  public readStorageElapsedToday(): Promise<number> {
    return storage.get(this.key, 0, 'local')
  }

  private resetStorageValues(): Promise<void> {
    console.log(`Resetting local storage ${this.key} = 0...`)
    return storage.set(this.key, 0, 'local').then(() => {
      console.log(`Reset local storage ${this.key} = 0`)
    })
  }

  readElapsed(): Promise<Record<string, Record<string, number | TimerState>>> {
    return this.readStorageElapsedToday().then((storageResult) => {
      const focusElapsed = this.elapsedFocusTime()
      let diff = focusElapsed - this.previousStorageUpdateElapsedValue
      if (diff < 0) {
        diff = 0
      }
      return {
        countup: {
          elapsed: this.elapsedCountupTime(),
          state: this.countupTimer.state,
        },
        focus: {
          elapsed: focusElapsed,
          state: this.focusTimer.state,
        },
        today: {
          elapsed: storageResult + diff,
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
    this.previousStorageUpdateElapsedValue = 0
  }

  reset(): void {
    console.log(`${nowTime()} Resetting timers`)
    this.resetTimers()
    this.resetStorageValues()
    this.resetTimersAtTime = this.getResetTime()
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

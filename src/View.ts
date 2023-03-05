import Model from './Model'
import { TimerType } from './Timer'

// Pad a number with leading zeros to make it two digits long
function pad(num: number): string {
  return num.toString().padStart(2, '0')
}

// Format a time in seconds as hh:mm:ss
function formatTime(millis: number): `${string}:${string}:${string}` {
  const seconds = Math.floor(millis / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  return `${pad(hours)}:${pad(minutes % 60)}:${pad(seconds % 60)}`
}

function nowTime(): string {
  return `${new Date().toLocaleTimeString('en-US', { hour12: false })}`
}

export default class View {
  private div: HTMLDivElement
  private timerType: TimerType = TimerType.FOCUS
  constructor(private model: Model) {
    this.div = document.createElement('div')
    this.div.style.position = 'fixed'
    this.div.style.top = '0'
    this.div.style.left = '50%'
    this.div.style.transform = 'translateX(-50%)'
    this.div.style.padding = '5px 10px'
    this.div.style.background = '#333'
    this.div.style.borderRadius = '0 0 5px 5px'
    this.div.style.boxShadow = '0px 0px 5px 0px rgba(0, 0, 0, 0.2)'
    this.div.style.zIndex = '9999'
    this.div.style.color = '#FFF'
    this.div.style.textAlign = 'center'
    this.div.style.fontFamily = 'monospace'
    this.div.style.fontSize = '14px'
    this.div.style.cursor = 'pointer'

    const triangle = document.createElement('div')
    triangle.style.width = '0'
    triangle.style.height = '0'
    triangle.style.borderStyle = 'solid'
    triangle.style.borderWidth = '0 15px 15px 15px'
    triangle.style.borderColor = 'transparent transparent #333 transparent'
    triangle.style.position = 'absolute'
    triangle.style.top = '-15px'
    triangle.style.left = '50%'
    triangle.style.transform = 'translateX(-50%)'

    this.div.appendChild(triangle)
    this.updateTimerText()
    this.div.addEventListener('click', this.handleClick)

    document.body.appendChild(this.div)
  }

  changeTimerType = () => {
    if (this.timerType === TimerType.COUNTUP) {
      this.timerType = TimerType.FOCUS
    } else if (this.timerType === TimerType.FOCUS) {
      this.timerType = TimerType.COUNTUP
    } else {
      console.error(`Invalid timer type: ${this.timerType}`)
    }
  }

  handleClick = () => {
    this.changeTimerType()
    this.updateTimerText()
  }

  // Update the timer text every second
  updateTimerText() {
    const elapsed = this.model.elapsed()
    // console.log(`${nowTime()} ${JSON.stringify(elapsed)}`)

    if (this.timerType in elapsed) {
      this.div.innerText = `${this.timerType[0]} ${formatTime(elapsed[this.timerType].elapsed as number)}`
    }
  }
}

import Model from './Model'

// Pad a number with leading zeros to make it two digits long
function pad(num: number): string {
  return num.toString().padStart(2, '0')
}

// Format a time in seconds as hh:mm:ss
function formatTime(time: number): `${string}:${string}:${string}` {
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time - hours * 3600) / 60)
  const seconds = time - hours * 3600 - minutes * 60
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

export default class View {
  private div: HTMLDivElement
  private timerType: string
  constructor(private model: Model) {
    this.model = model
    this.timerType = 'focus'
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
    if (this.timerType === 'countup') {
      this.timerType = 'focus'
    } else if (this.timerType === 'focus') {
      this.timerType = 'countup'
    } else {
      console.error('Invalid timer type: ' + this.timerType)
    }
  }

  handleClick = () => {
    this.changeTimerType()
    this.updateTimerText()
  }

  // Update the timer text every second
  updateTimerText() {
    let elapsedTime = undefined
    if (this.timerType === 'countup') {
      elapsedTime = this.model.elapsedCountupTime()
    } else if (this.timerType === 'focus') {
      elapsedTime = this.model.elapsedFocusTime()
    } else {
      console.error('Invalid timer type: ' + this.timerType)
    }
    console.log(`${this.timerType} elapsedTime: ${elapsedTime}`)

    if (elapsedTime !== undefined) {
      this.div.innerText = `${this.timerType[0]} ${formatTime(elapsedTime)}`
    }
  }
}

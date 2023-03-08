import Model from './Model'
import View from './View'

export default class Controller {
  constructor(private model: Model, private view: View) {
    setInterval(() => this.view.updateDisplayText(), 1000)

    // daemon to log debug info
    setInterval(() => {
      this.model.readElapsed().then((result) => {
        console.log(JSON.stringify(result))
      })
    }, 1000)
  }

  reset() {
    this.model.reset()
    this.view.updateDisplayText()
  }
}

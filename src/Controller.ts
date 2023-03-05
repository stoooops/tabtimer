import Model from './Model'
import View from './View'

export default class Controller {
  constructor(private model: Model, private view: View) {
    setInterval(() => this.view.updateTimerText(), 1000)
  }
}

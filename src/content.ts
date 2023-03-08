import Controller from './Controller'
import Model from './Model'
import View from './View'

const model = new Model()
const view = new View(model)
const controller = new Controller(model, view)
model.start()

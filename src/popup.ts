console.log('popup.js loaded')

import Model from './Model'

document.addEventListener('DOMContentLoaded', () => {
  const model = new Model()

  console.log('DOMContentLoaded')
  const reloadBtn = document.getElementById('reload-btn')
  const resetBtn = document.getElementById('reset-btn')

  resetBtn?.addEventListener('click', () => {
    console.log('reset')
    model.reset()
  })

  reloadBtn?.addEventListener('click', () => {
    console.log('reload')
    model.reset()
    chrome.runtime.reload()
  })
})

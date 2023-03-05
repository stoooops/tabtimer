document.addEventListener('DOMContentLoaded', () => {
  const reloadBtn = document.querySelector('#reload-btn')

  reloadBtn?.addEventListener('click', () => {
    chrome.runtime.reload()
  })
})

document.addEventListener('DOMContentLoaded', () => {
  const reloadBtn = document.querySelector('#reload-btn')

  reloadBtn?.addEventListener('click', () => {
    console.log('reload')
    localStorage.setItem('focusTimer_elapsed_today', String(0))
    chrome.runtime.reload()
  })
})

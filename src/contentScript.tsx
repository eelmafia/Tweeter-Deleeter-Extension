window.addEventListener('message', (event) => {
  if (event.source !== window) return
  if (event.data.type === 'DELEETER_TOKENS' || event.data.type === 'DELEETER_UPDATE') {
      chrome.runtime.sendMessage(event.data)
  }
})
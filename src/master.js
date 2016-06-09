function getBackgroundPage() {
  return chrome.extension.getBackgroundPage();
}

function renderMessage(message) {
  document.getElementById('content').textContent = message;
}

document.addEventListener('DOMContentLoaded', function() {
  var message = 'Tab Control is active. \n' + 'You can duplicate any tab by pressing Alt+Shift+D';
  renderStatus(message);
});

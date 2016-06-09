function getBackgroundPage() {
  return chrome.extension.getBackgroundPage();
}

function renderMessage(message) {
  document.getElementById('content').textContent = message;
}

document.addEventListener('DOMContentLoaded', function() {
  var message = 'Tab Control is active. \n' 
  message += 'Duplicate Tabs: Alt+Shift+D' + '\n';
  message += 'Toggle mute: Alt+Shift+M';
  renderMessage(message);
});

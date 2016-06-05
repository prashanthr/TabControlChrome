console.log('background page running');
chrome.commands.onCommand.addListener(function(command) {
        console.log('Command:', command);
});

document.addEventListener('mousedown', function(ev) {
  console.log('ev', ev);
  console.log('MB1', ev.buttons & 1) // 1 if clicked, 0 if not
  console.log('MB2', ev.buttons & 2)
  console.log('MB3', ev.buttons & 4)
  console.log('MB4', ev.buttons & 8) // usually browser-back
  console.log('MB5', ev.buttons & 16)// usually browser-forward
})

document.addEventListener('click', function(ev) {
  console.log('ev', ev);
})
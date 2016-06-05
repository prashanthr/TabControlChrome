console.log('background page running');
chrome.commands.onCommand.addListener(function(command) {
        console.log('Command:', command);
});
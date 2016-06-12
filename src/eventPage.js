console.log('Background page running [eventPage.js]');
var tabCache = [];
chrome.commands.onCommand.addListener(function(command) {
        handleCommand(command);
});

function handleCommand(command) {
	console.log('Command Registered:', command);
	switch(command) {
		case 'duplicate-tab':
			getCurrentTab((tabs) => {
				console.log('Current Tabs', tabs);
				duplicateTab(tabs[0]);
			});
			break;
		case 'mute-tab':
			getCurrentTab((tabs) => {
				muteTab(tabs[0]);
			});
			break;
		case 'jump':
			console.log('jumper');
		default:			
			break;
	}
}

function getCurrentTab(callback) {
	return chrome.tabs.query({active: true}, callback);
}

//Duplicates the tab and switches to it
function duplicateTab(tab) {
	chrome.tabs.duplicate(tab.id, null);
}

//Toggles mute
function muteTab(tab) {
	chrome.tabs.update(tab.id, {muted: !tab.mutedInfo.muted}, null);
}

function activateTab(tabId){
  chrome.tabs.update(tabId, {selected: true});
}

function getTabsInCurrentWindow(callback) {
  var queryInfo = {    
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {    
    callback(tabs);
  });
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    /*if (request.greeting == "hello")
      sendResponse({farewell: "goodbye"});*/
  	if(request) {
  		if(request.type === 'cmd') {
  			handleCommand(request.data);
  		}
  	}
});
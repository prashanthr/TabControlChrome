console.log('Background page running [eventPage.js]');
var tabCache = {
	current: null,
	previous: null
};
//Listeners
chrome.commands.onCommand.addListener(function(command) {
    handleCommand(command);
});
chrome.tabs.onActivated.addListener(function (activeInfo) {
	tabCache.previous = tabCache.current;
	tabCache.current = activeInfo.tabId;
});

//Handlers
function handleCommand(command) {
	console.log('Command Registered:', command);
	switch(command) {
		case 'duplicate-tab':
			getCurrentTab((tabs) => {				
				duplicateTab(tabs[0]);
			});
			break;
		case 'mute-tab':
			getCurrentTab((tabs) => {
				muteTab(tabs[0]);
			});
			break;
		case 'jump':
			jumpTab();
			break;
		case 'scroll':
			scrollTab();
			break;	
		default:			
			break;
	}
}

function jumpTab() {
	console.log('tabCache', tabCache);
	if(tabCache.current 
		&& tabCache.previous 
		&& tabCache.current !== null 
		&& tabCache.previous !== null) {		
		activateTab(tabCache.previous);
	}
}

function scrollTab() {
	getTabsInCurrentWindow(function(tabs) {
		console.log('tabs', tabs);
		getCurrentTab(function(ts) {			
			let currentTabIndex = findTabIndex(tabs, ts[0]);
			console.log(currentTabIndex);
			if(currentTabIndex !== -1) {
				let nextTabIndex = currentTabIndex === tabs.length - 1 ? 0 : currentTabIndex + 1;
				activateTab(tabs[nextTabIndex].id);
			}
		});
	});
}

function findTabIndex(tabs, tab) {
	let index = -1;
	if(tabs && tab) {
		index = tabs.findIndex((t) => {
			return t.id === tab.id;
		});
	}
	return index;
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
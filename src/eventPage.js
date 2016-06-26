console.log('Background page running [eventPage.js]');
//Init State
var tabState = {
	current: null,
	previous: null
};

var tabCache = []

var cmdCache = [];//IMouseAction
var cmdState = [{
		type: null,
		button: 0, //Left
		time: null,
	},
	{
		type: null,
		button: 1, //Middle
		time: null,
	},	
	{
		type: null,
		button: 2, //Right
		time: null,
	}
];


//Listeners
chrome.commands.onCommand.addListener(function(command) {
    handleCommand(command);
});
chrome.tabs.onActivated.addListener(function (activeInfo) {
	var currentTabId = activeInfo.tabId;
	/*if(isInvalidTabId(currentTabId)) {
		return;
	}*/
	//Tab State
	tabState.previous = tabState.current 
			? tabState.current : currentTabId;
	tabState.current = currentTabId;

});
chrome.tabs.onRemoved.addListener(function(removeInfo) {	
	//Handle tab state when a tab in tab state is closed
	if(tabState.previous === removeInfo.tabId) {
		getCurrentTabId((id) => {
			tabState.previous = (id !== null) 
				? id 
				: null;
		});				
	}
	else if(tabState.current === removeInfo){
		//Active listener already kicks in
	}	
});

//Message Sender
function sendTabMessage(tabId, message) {
	chrome.tabs.sendMessage(tabId, message);	
}


//Message Listener
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

  		if(request.type === 'mouseEvent') {
  			handleMouseEvent(request.data);
  		}
  	}
});

//Handlers
function handleCommand(command) {
	console.log('Command Registered:', command);
	let tabSwitchEventHandled = false;
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
			tabSwitchEventHandled = true;
			break;
		case 'scroll':
			scrollTab();
			tabSwitchEventHandled = true;
			break;	
		default:			
			break;
	}
	if(tabSwitchEventHandled) {
		getCurrentTabId(function (tabId) {
			sendTabMessage(tabId, {type: 'tabSwitch', complete: true});
		});
	} 	
}

function handleMouseEvent(event) {
	console.log('event');
	addCmdToCache(event);
	updateState(event);
	handleEvent();
}

//Actions
function jumpTab() {
	console.log('tabState', tabState);
	if(tabState.current 
		&& tabState.previous 
		&& tabState.current !== null 
		&& tabState.previous !== null) {		
		activateTab(tabState.previous);
	} else {
		console.log('Cannot jump. Current or previous tab does not exist or is invalid');
	}
}

function scrollTab() {
	getTabsInCurrentWindow(function(tabs) {
		getCurrentTab(function(ts) {			
			let tab = ts[0];
			let currentTabIndex = findTabIndex(tabs, tab);
			console.log(currentTabIndex);
			if(currentTabIndex !== -1) {
				let nextTabIndex = currentTabIndex === tabs.length - 1 ? 0 : currentTabIndex + 1;
				let nextTab = tabs[nextTabIndex];
				/*while(isInvalidTab(nextTab)) {
					nextTabIndex = nextTabIndex === tabs.length - 1 ? 0 : nextTabIndex + 1;
					nextTab[nextTabIndex]; 
				}*/
				activateTab(nextTab.id);
			}
		});
	});
}

function findTabIndex(tabs, tab) {
	index = tabs.findIndex((t) => {
			return t.id === tab.id;
		});	
	return index;
}

function getCurrentTab(callback) {
	return chrome.tabs.query({active: true, currentWindow: true}, callback);	
}

function getCurrentTabId(callback) {
	getTabsInCurrentWindow(function(tabs) {
		getCurrentTab(function(ts) {			
			let currentTabIndex = findTabIndex(tabs, ts[0]);
			let tabId = currentTabIndex !== -1 
			? tabs[currentTabIndex].id : null;
			callback(tabId);
		})
	});
}

function getCurrentTabInWindow(callback) {
	getTabsInCurrentWindow(function(tabs) {
		getCurrentTab(function(ts) {			
			let currentTabIndex = findTabIndex(tabs, ts[0]);
			let tab = currentTabIndex !== -1 
			? tabs[currentTabIndex] : null;
			callback(tabId);
		})
	});
}

function isInvalidTabId(tabId) {
	getTabById(tabId, function(tabs) {
		if(tabs && tabs.length > 0) {
			var tab = tabs[0];
			return isInvalidTab(tab);
		}
	});
	
}

function isInvalidTab(tab) {
	return tab && tab.url 
			? tab.url.startsWith('chrome://') : false;	
}

function getTabById(tabId, callback) {
	chrome.tabs.query({id: tabId}, callback);
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
  chrome.tabs.update(tabId, {active: true});
}

function getTabsInCurrentWindow(callback) {
  var queryInfo = {    
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {    
    callback(tabs);
  });
}

//State Management
function addCmdToCache(event) {
	cmdCache.unshift({
		type: event.type,
		button: event.button,
		time: Date.now()
	});
}

function updateState(event) {
	let cmdIndex = getCmdStateIndex(event.button);
	if(cmdIndex !== -1) {
		cmdState[cmdIndex].type = event.type;
		cmdState[cmdIndex].time = Date.now();
	}
}

function resetCommandState() {
	var now = Date.now();
	cmdState = [{
		type: null,
		button: 0, //Left
		time: now,
	},
	{
		type: null,
		button: 1, //Middle
		time: now,
	},	
	{
		type: null,
		button: 2, //Right
		time: now,
	}];
}

function getCmdState(button) {
	let cmd = cmdState.find((cmd) => {
		return cmd.button === button
	});
	return cmd;
}
function getCmdStateIndex(button) {
	let cmdIndex = cmdState.findIndex((cmd) => {
		return cmd.button === button
	});
	return cmdIndex;
}

function handleEvent() {
	console.log('cmdState', cmdState);
	let rightMouse = getCmdState(2);
	let leftMouse = getCmdState(0);
	if(rightMouse.type === 'mouseup' || (leftMouse.type === 'mouseup' && rightMouse.type === 'mouseup')) {
		resetCommandState();
	}
	if(leftMouse.type === 'mousedown' && rightMouse.type === 'mousedown') {
		console.log('Tab jump command detected');
		handleCommand('jump');
	} else if(leftMouse.type === 'mousewheel' && rightMouse.type === 'mousedown') {
		console.log('Mouse scroll command detected');
		handleCommand('scroll');
	} 	
}

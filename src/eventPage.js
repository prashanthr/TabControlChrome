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
	tabState.previous = tabState.current;
	tabState.current = activeInfo.tabId;
});
chrome.tabs.onRemoved(function(removeInfo) {	
	if(tabState.previous === removeInfo.tabId) {

	}	
});

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
	}
}

function scrollTab() {
	getTabsInCurrentWindow(function(tabs) {
		getCurrentTab(function(ts) {			
			console.log('tabs', tabs);
			console.log('ts', ts);
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
	index = tabs.findIndex((t) => {
			return t.id === tab.id;
		});	
	return index;
}

function getCurrentTab(callback) {
	return chrome.tabs.query({active: true, currentWindow: true}, callback);	
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
	if(leftMouse.type === 'mousedown' && rightMouse.type === 'mousedown') {
		console.log('Tab jump command detected');
		handleCommand('jump');
	} else if(leftMouse.type === 'mousewheel' && rightMouse.type === 'mousedown') {
		console.log('Mouse scroll command detected');
		handleCommand('scroll');
	}
}

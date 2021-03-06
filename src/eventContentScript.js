console.log('Content script running [eventContentScript.js]');
document.body.addEventListener('mousedown', captureMouseEvent, true);
document.body.addEventListener('mouseup', captureMouseEvent, true);
document.body.addEventListener('mousewheel', captureMouseEvent, true);

function log(msg) {
	console.log(msg);
}

/*chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
  console.log(response.farewell);
});*/

sendRuntimeMessage({greeting: "hello"}, log);

//These should probably be managed in the background script
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


function sendRuntimeMessage(message, callback) {
	chrome.runtime.sendMessage(message, callback);
}
function captureMouseEvent(event) {
	console.log('cmdEvent', event.button, event.type);
	/*addCmdToCache(event);
	updateState(event);
	handleEvent();*/
	sendRuntimeMessage({type: 'mouseEvent', data: { 
		button: event.button,
		type: event.type
	}}, log);
}


function handleEvent() {
	console.log('cmdState', cmdState);
	let rightMouse = getCmdState(2);
	let leftMouse = getCmdState(0);
	if(leftMouse.type === 'mousedown' && rightMouse.type === 'mousedown') {
		console.log('Tab jump command detected');
		sendRuntimeMessage({type: 'cmd', data: 'jump'}, log);
	} else if(leftMouse.type === 'mousewheel' && rightMouse.type === 'mousedown') {
		console.log('Mouse scroll command detected');
		sendRuntimeMessage({type: 'cmd', data: 'scroll'}, log);
	}
}

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
console.log('Content script running [eventContentScript.js]');
document.body.addEventListener('mousedown', captureMouseEvent, true);
document.body.addEventListener('mouseup', captureMouseEvent, true);

function log(msg) {
	console.log(msg);
}

/*chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
  console.log(response.farewell);
});*/

sendRuntimeMessage({greeting: "hello"}, log);

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
	console.log('cmdEvent', event);
	addCmdToCache(event);
	updateState(event);
	handleEvent();
}

function handleEvent() {
	console.log('cmdState', cmdState);
	let rightMouse = getCmdState(2);
	let leftMouse = getCmdState(0);
	if(leftMouse.type === 'mousedown' && rightMouse.type === 'mousedown') {
		console.log('Tab jump command detected');
		sendRuntimeMessage({type: 'cmd', data: 'jump'}, log);
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


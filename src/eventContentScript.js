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
		which: 1,
		time: null,
	},
	{
		type: null,
		which: 2,
		time: null,
	},	
	{
		type: null,
		which: 3,
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
}

function addCmdToCache(event) {
	cmdCache.unshift({
		type: event.type,
		which: event.which,
		time: Date.now()
	});
}
function updateState(event) {
	let cmdIndex = getCmdStateIndex(event.which);
	if(cmdIndex !== -1) {
		cmdState[cmdIndex].type = event.type;
		cmdState[cmdIndex].time = Date.now();
	}
}

function getCmdState(which) {
	let cmd = cmdState.find((cmd) => {
		return cmd.which === which
	});
	return cmd;
}
function getCmdStateIndex(which) {
	let cmdIndex = cmdState.findIndex((cmd) => {
		return cmd.which === which
	});
	return cmdIndex;
}


console.log('Background page running [eventPage.js]');
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
		default:			
			break;
	}
}

function getCurrentTab(callback) {
	return chrome.tabs.query({active: true}, callback);
}

function duplicateTab(tab) {
	chrome.tabs.duplicate(tab.id, null);
}
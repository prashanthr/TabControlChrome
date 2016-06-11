console.log('Content script running [eventContentScript.js]');
chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
  console.log(response.farewell);
});
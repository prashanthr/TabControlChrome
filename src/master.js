function getCurrentTabUrl(callback) {  
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {    
    var tab = tabs[0];    
    var url = tab.url;

    console.log('tab', tab);

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });
}

function getTabsInCurrentWindow(callback) {
  var queryInfo = {    
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {    
    callback(tabs);
  });
}

function activateTab(tabId){
  chrome.tabs.update(tabId, {selected: true});
}

function switchTab() {
  getTabsInCurrentWindow(function(tabs){
    console.log(tabs);

    //renderStatus(tabs);
    //activateTab()
  });
}

function getBackgroundPage() {
  return chrome.extension.getBackgroundPage();
}

function renderStatus(statusText) {
  document.getElementById('content').textContent = statusText;
}

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url) {
      renderStatus('Current URL: ' + url);
    });
  switchTab();
});

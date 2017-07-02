/*
 * SiteXML detector Chrome extension
 * Background script
 *
 * Licence MIT
 *
 * (c) Michael Zelensky 2017
 * */

var app = {
    tabsData : {},
    getHost : function (url) {
        var a = document.createElement('a');
        a.href = url;
        return a.hostname;
    },
    connect : function (tabid) {
        return port = chrome.tabs.connect(tabid, {name: "sitexml"});
    }
};

//
chrome.tabs.onUpdated.addListener(function(tabid, changeinfo, tab) {
    var port,
        host = app.getHost(tab.url);
    if (changeinfo.status && changeinfo.status.toLowerCase() === 'complete') {
        if (!app.tabsData[tabid] || app.tabsData[tabid].host !== host) {
            console.log('Retrieving information. TabId: ', tabid, " host: ", host);
            app.tabsData[tabid] = {
                host: host,
                sitexmlLoaded : false,
                port: undefined
            };
            chrome.browserAction.setIcon({path:"sitexml_bw.png"});
            app.tabsData[tabid].host = host;
            port = app.connect(tabid);
            app.tabsData[tabid].port = port;
            console.log('Trying to use port; tabid: ', tabid, "host: ", host);
            port.postMessage({sitexml: "doCheck"}, function (response) {});
            port.onMessage.addListener(
                function(request, sender, sendResponse) {
                    if (request.sitexml == "loaded") {
                        console.log(app.tabsData[tabid].host, "supports sitexml!");
                        app.tabsData[tabid].sitexmlLoaded = true;
                        // See if the checked tab is still current
                        // (you can switch to another tab which the check is being performed)
                        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                            if (tabs[0].id === tabid) {
                                chrome.browserAction.setIcon({path:"sitexml.png"});
                            }
                        });
                    }
                });
        }
    }
});

//
chrome.tabs.onActivated.addListener(function(tab) {
    chrome.browserAction.setIcon({path:"sitexml_bw.png"});
    console.log(app.tabsData);
    if (app.tabsData[tab.tabId]) {
        if (app.tabsData[tab.tabId].sitexmlLoaded) {
            chrome.browserAction.setIcon({path:"sitexml.png"});
        }
    } else {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            console.log('Connection lost, reloading page. Tabid: ', tabs[0].id);
            chrome.tabs.sendMessage(tabs[0].id, {sitexml: "reload"}, function(response) {});
        });
    }
});
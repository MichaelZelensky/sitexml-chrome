/*
* SiteXML detector Chrome extension
* Content script
*
* Licence MIT
*
* (c) Michael Zelensky 2017
* */

//scope isolation
(function() {
    var app = {
        port: undefined
    };

    //
    chrome.runtime.onConnect.addListener(function(port) {
        if (port.name === 'sitexml') {
            console.log('Connected!');
            app.port = port;
            port.onMessage.addListener(
                function(request, sender, sendResponse) {
                    if (request.sitexml == "doCheck") {
                        var a = document.createElement('a'),
                            hostname, siteXML;
                        a.href = document.location.href;
                        hostname = a.hostname;
                        siteXML = new sitexml(a.protocol + "//" + hostname);
                        siteXML.loadSitexml();
                    }
                });
        }
    });

    //
    window.addEventListener('sitexml.is.loaded', function() {
        if (app.port) {
            app.port.postMessage({sitexml: "loaded"});
        }
    });

    //
    window.addEventListener('sitexml.is.not.valid', function() {
        if (app.port) {
            app.port.postMessage({sitexml: "not.valid"});
        }
    });
})();
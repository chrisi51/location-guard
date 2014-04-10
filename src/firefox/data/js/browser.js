// implements browser_base.js

Browser.prototype.init = function () {
    browser.log('initializing');

    browser.storage._init();

    switch(this._script) {
    case 'main':
	browser._main_script();
        browser.gui._init();
        browser._install_update();
	break;

    case 'content':
        // sets up low level communication
        extension.onMessage.addListener(browser.handleMessage);
	break;
    }
    browser.gui.refreshAllIcons();

};

// handle installation and upgrade 
Browser.prototype._install_update = function(){
    
    var self = require("sdk/self");

    if(self.loadReason == "install") {
        Util.events.fire('browser.install');
    }
    else if(self.loadReason == "upgrade"){
	Util.events.fire('browser.update');
    }
}

Browser.prototype._main_script = function() {

    browser.workers = [];

    var array = require('sdk/util/array');
    var data = require("sdk/self").data;
    const { createMessageChannel, messageContentScriptFile } = require('messaging');

    // user tabs

    var pagemod = require("sdk/page-mod").PageMod({
        include: ['*'],
        attachTo: ["top"],//excludes iframes
        contentScriptWhen: 'start', // TODO THIS IS TRICKY
        contentScriptFile: [messageContentScriptFile, 
                            data.url("js/util.js"), 
                            data.url("js/browser_base.js"), 
                            data.url("js/browser.js"), 
                            data.url("js/laplace.js"),
                            data.url("js/content.js")],
        contentScriptOptions: {
            channelName: 'whatever you want',
            // Set the following to false if you want to communicate between
            // the "extension" and a content script instead of the page.
            endAtPage: false
        },

        onAttach: function(worker) {
            worker["channel"] = createMessageChannel(pagemod.contentScriptOptions, worker.port);
            worker.channel.onMessage.addListener(browser.handleMessage);
                                            
            array.add(browser.workers, worker);
            status();
            worker.on('pageshow', function() { array.add(browser.workers, this); status();});
            worker.on('pagehide', function() { array.remove(browser.workers, this); status();});
            worker.on('detach', function() { array.remove(browser.workers, this); status();});

            worker.tab.on('activate', function(tab){
                browser.log(tab.url + ' activated');
                browser.gui.refreshIcon(null);//tabId is ignored
            });
            worker.tab.on('pageShow', function(tab){
                browser.log(tab.url + ' pageShow');
                browser.gui.refreshIcon(null);//tabId is ignored
            });
        }
    });

    // options page

    var pagemod = require("sdk/page-mod").PageMod({
        include: [data.url("options.html*")],
//        attachTo: ["top"], //excludes iframes
        contentScriptWhen: 'start', // sets up comm. before running the page scripts
        contentScriptFile: [messageContentScriptFile], 
        contentScriptOptions: {
            channelName: 'whatever you want',
            endAtPage: true //sets up communication with the page, not its content script
        },
        onAttach: function(worker) {
            worker["channel"] = createMessageChannel(pagemod.contentScriptOptions, worker.port);
            worker.channel.onMessage.addListener(browser.handleMessage);
                                            
            array.add(browser.workers, worker);
            status();
            worker.on('pageshow', function() { array.add(browser.workers, this); status();});
            worker.on('pagehide', function() { array.remove(browser.workers, this); status();});
            worker.on('detach', function() { array.remove(browser.workers, this); status();});

            worker.tab.on('activate', function(tab){
                browser.log(tab.url + ' activated');
                browser.gui.refreshIcon(null);//tabId is ignored
            });
            worker.tab.on('pageShow', function(tab){
                browser.log(tab.url + ' pageShow');
                browser.gui.refreshIcon(null);//tabId is ignored
            });
        }
    });


    var status = function () {
        browser.log('# of workers: ' + browser.workers.length);
        for (var i=0; i<browser.workers.length; i++) {
            browser.log('#'+ i + ": " + browser.workers[i].tab.url);
        }     
    }


}


//// low level communication

var id = function (msg,sender,sendResponse){sendResponse(msg)};
Browser.prototype.messageHandlers = {};
Browser.prototype.messageHandlers['id'] = id;

Browser.prototype.handleMessage = function(msg,sender,sendResponse) {
    // browser.log('handling: ' + JSON.stringify(msg) + 
    //             '\n from :'+ JSON.stringify(sender) + 
    //             '\n response :'+ JSON.stringify(sendResponse));
    browser.messageHandlers[msg.type].apply(null,[msg.message,sender,sendResponse]);
}

Browser.prototype.sendMessage = function (tabId, type, message, cb) {
    if (browser._script == 'main'){
        for (var i=0; i<browser.workers.length; i++) {
            if (browser.workers[i].tab.id == tabId) { 
                // browser.log('-> ' + browser.workers[i].tab.url + JSON.stringify(message));
                browser.workers[i].channel.sendMessage({'type': type, 'message': message},cb);
            }
            else {if (i == browser.workers.length) browser.log('no destination '+tabId)}
        }    
    }
    // content or popup
    else {
        // browser.log(' -> main' + JSON.stringify(message));
        extension.sendMessage({'type': type, 'message': message},cb);
    }
};



//////////////////// rpc ///////////////////////////
//
//
// handler is a   function(...args..., tabId, replyHandler)
Browser.Rpc.prototype.register = function(name, handler) {
    // set onMessage listener if called for first time
    if(!browser.rpc._methods) {
	browser.rpc._methods = {};
        browser.messageHandlers['rpc'] = browser.rpc._listener;
    }
    browser.rpc._methods[name] = handler;
}

// onMessage listener. Received messages are of the form
// { method: ..., args: ... }
//
Browser.Rpc.prototype._listener = function(message, tabId, replyHandler) {
	//blog("RPC: got message", [message, sender, replyHandler]);

    var handler = browser.rpc._methods[message.method];
    if(!handler) {
        browser.log('No handler for '+message.method);
        return;
    }
    
    // add tabId and replyHandler to the arguments
    var args = message.args || [];
    args.push(tabId, replyHandler);
    
    handler.apply(null, args);
};

Browser.Rpc.prototype.call = function(tabId, name, args, cb) {
    var message = { method: name, args: args };

    browser.sendMessage(tabId, 'rpc', message, cb)
}


//////////////////// storage ///////////////////////////

Browser.Storage.prototype._key = "global";	// store everything under this key
Browser.Storage.prototype._init = function(){
    if (browser._script == 'main') {
        
        var ss = require("sdk/simple-storage").storage;
        
        browser.storage.get = function(cb) {
            var st = ss[browser.storage._key];
            
            // default values
            if(!st) {
            // browser.log('initializing settings');
	        st = browser.storage._default;
	        browser.storage.set(st);
            }
            // browser.log('returning st');
            cb(st);
        };

        browser.storage.set = function(st) {
            // browser.log('setting st');
            ss[browser.storage._key] = st;
        };

        browser.storage.clear = function() {
            // browser.log('clearing st');
            delete ss[browser.storage._key];
        };

        browser.rpc.register('storage.get',function(tabId,replyHandler){
            browser.storage.get(replyHandler);
        });

        browser.rpc.register('storage.set',function(st,tabId,replyHandler){
            browser.storage.set(st);
            replyHandler();
        });
        browser.rpc.register('storage.clear',function(){
            browser.storage.clear();
        });

    }
    // content and popup
    else{
        
        browser.storage.get = function(cb) {
            // browser.log('getting state');
            browser.rpc.call(null,'storage.get',null,cb);
        }

        browser.storage.set = function(st) {
            // browser.log('setting state');
            browser.rpc.call(null,'storage.set',[st]);
        }

        browser.storage.clear = function() {
            // browser.log('clearing state');
            browser.rpc.call(null,'storage.clear');
        }

    }
}


//////////////////// gui ///////////////////////////

// only called by main
Browser.Gui.prototype._init = function(){

    var array = require('sdk/util/array');

    browser.gui["badge"] = {
        theBadge : null,
        visible : false,
        enabled : false,
        disable : function(title) {  // visible but disabled
            browser.log('disabling button');
            if (!browser.gui.badge.visible) {
                this.enable("");
            }
            this.enabled = false;
            browser.gui.badge.theBadge.setIcon({path: 'images/pin_disabled_38.png'});
            browser.gui.badge.theBadge.setTitle({title : title});
        },
        enable : function(title) {     // visible and enabled
            browser.log('enabling button');

            if (!browser.gui.badge.visible) {
                browser.gui.badge.visible = true;

                browser.gui.badge.theBadge = require('browserAction').BrowserAction({
                    default_icon: 'images/pin_38.png',
                    default_title: title,
                    default_popup: 'popup.html',
                });
                browser.gui.badge.theBadge.onMessage.addListener(browser.handleMessage);
                array.add(browser.workers, {"tab" : {"id" : "popup", "url" : "popup"}, 'channel': browser.gui.badge.theBadge});
            }
            browser.gui.badge.enabled = true;
            browser.gui.badge.theBadge.setIcon({path: 'images/pin_38.png'});
            browser.gui.badge.theBadge.setTitle({title : title});
        },
        hide : function() {
            browser.log('hiding button');
            if (browser.gui.badge.visible) {
                browser.gui.badge.visible = false;
                browser.gui.badge.enabled = false;
                browser.gui.badge.theBadge.destroy();
                array.remove(browser.workers, {"tab" : {"id" : "popup", "url" : "popup"}, 'channel': browser.gui.badge.theBadge});
            }
        },   
    };

    var tabs = require("sdk/tabs");

    browser.gui._getActiveTab = function(){
        browser.log('active tab: '+tabs.activeTab.url);
        return tabs.activeTab;
    }
    
    browser.rpc.register('getActiveTabUrl', function(tabId, replyHandler) {
        var tab = browser.gui._getActiveTab();
        replyHandler(tab.url);
    });

    browser.rpc.register('refreshIcon', function(tabId) {
    	browser.gui.refreshIcon(tabId);
    });

    var data = require("sdk/self").data;

    browser.gui._showOptions = function(anchor){
        var url = data.url('options.html') + (anchor || '');
        tabs.open(url);

	// var baseUrl = chrome.extension.getURL('html/options.html');
	// var fullUrl = baseUrl + (anchor || '');
	// chrome.tabs.query({ url: baseUrl }, function(tabs) {
	// 	blog("tabs",tabs);
	// 	if (tabs.length)
	// 		chrome.tabs.update(tabs[0].id, { active: true, url: fullUrl });
	// 	else
	// 		chrome.tabs.create({ url: fullUrl });
	// });
    }

    browser.rpc.register('showOptions', function(anchor) {
        browser.log('showing options');        
        browser.gui._showOptions(anchor);
    });


    var prefsModule = require("sdk/simple-prefs");
    prefsModule.on("optionButton", function() {
        console.log("options was clicked");
        browser.gui._showOptions();
    })

}

Browser.Gui.prototype.refreshIcon = function(tabId) {
    browser.log('refreshing icon');
    if(browser._script == 'main') {

        var tab = browser.gui._getActiveTab();

	Util.getIconInfo(tab.id, function(info) {
                browser.log('got info for refreshIcon: ' + JSON.stringify(info));
	        if(info.hidden) {
                    browser.gui.badge.hide();
	        } else {
                    if (!info.private) {
                        browser.gui.badge.disable(info.title);
                    }
                    else {
                        browser.gui.badge.enable(info.title);
                    }
	        }
	});
    }
    // content popup
    else {
	// cannot do it in the content script, delegate to the main
	// in this case tabId can be null, the main script will get the tabId
	// from the rpc call
        
	browser.rpc.call(null, 'refreshIcon', null);
    }
};

Browser.Gui.prototype.refreshAllIcons = function() {
    browser.gui.refreshIcon(null)
};

Browser.Gui.prototype.showOptions = function(anchor) {
    browser.log('calling showOptions');
    if(browser._script == 'main') {
        browser.gui._showOptions(anchor);
    }
    else {
        browser.rpc.call(null,'showOptions',[anchor],null);
    }
};

Browser.Gui.prototype.getActiveTabUrl = function(handler) {
    browser.rpc.call(null,'getActiveTabUrl',[],handler)
}


// in chrome, apart from the current console, we also log to the background page, if possible and loaded
//
Browser.prototype.log = function(a, b) {
    if(!browser.debugging) return;
    
    console.error(browser._script + ": " + a, b);
}


// // this was used to test nested rpc calls with content script
// browser.rpc.call(tab.id, 'test',null, function(inf){browser.log('finally displaying: ' + inf);});

// // this was a test function, to use in content.js, to show that registering on content script side works
// // what doesn't work is nested calls, in particular everything goes ok until replyHandler is called 
// // and the argument that arrives on the other side is null
// browser.rpc.register('test',function(tabId, replyHandler){
//     browser.log('sending test');
//     browser.storage.get(function(st) {
//         replyHandler('test');
//     });
// });


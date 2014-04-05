// Browser class for Google Chrome. For documentation of the various methods,
// see browser_base.js
//

Browser.prototype.init = function(script) {
	browser._script = script;

	switch(script) {
		case 'main':
			browser._main_script();
			break;

		case 'content':
			break;
	}
};

// all browser-specific code that runs in the main script goes here
//
Browser.prototype._main_script = function() {
	// fire browser.install/update events
	//
	chrome.runtime.onInstalled.addListener(function(details) {
		if(details.reason == "install")
			Util.events.fire('browser.install');

		else if(details.reason == "update")
			Util.events.fire('browser.update');
	});

	// some operations cannot be done by other scripts, so we set
	// handlers to do them in the main script
	//
	browser.rpc.register('refreshIcon', function(tabId) {
		browser.gui.refreshIcon(tabId);
	});
}


//////////////////// rpc ///////////////////////////
//
//
Browser.Rpc.prototype.register = function(name, handler) {
	// set onMessage listener if called for first time
	if(!browser.rpc._methods) {
		browser.rpc._methods = {};
		chrome.runtime.onMessage.addListener(browser.rpc._listener);
	}
	browser.rpc._methods[name] = handler;
}

// onMessage listener. Received messages are of the form
// { method: ..., args: ... }
//
Browser.Rpc.prototype._listener = function(message, sender, replyHandler) {
	blog("RPC: got message", [message, sender, replyHandler]);

	var handler = browser.rpc._methods[message.method];
	if(!handler) return;

	// add tabId and replyHandler to the arguments
	var args = message.args || [];
	var tabId = sender.tab ? sender.tab.id : null;
	args.push(tabId, replyHandler);

	return handler.apply(null, args);
};

Browser.Rpc.prototype.call = function(tabId, name, args, cb) {
	var message = { method: name, args: args };
	if(!cb) cb = function() {};							// we get error of not cb is passed

	if(tabId)
		chrome.tabs.sendMessage(tabId, message, cb);
	else
		chrome.runtime.sendMessage(null, message, cb);
}


//////////////////// storage ///////////////////////////
//
// implemented using chrome.storage.local
//
// Note: chrome.storage.local can be used from any script (main, content,
//       popup, ...) and it always accesses the same storage, so no rpc
//       is needed for storage!
//
Browser.Storage.prototype._key = "global";	// store everything under this key

Browser.Storage.prototype.get = function(cb) {
	chrome.storage.local.get(browser.storage._key, function(items) {
		var st = items[browser.storage._key];

		// default values
		if(!st) {
			st = browser.storage._default;
			browser.storage.set(st);
		}
		cb(st);
	});
};

Browser.Storage.prototype.set = function(st) {
	blog('saving st', st);
	var items = {};
	items[browser.storage._key] = st;
	chrome.storage.local.set(items);
};

Browser.Storage.prototype.clear = function() {
	chrome.storage.local.clear();
};


//////////////////// gui ///////////////////////////
//
//
Browser.Gui.prototype.refreshIcon = function(tabId) {
	if(browser._script == 'content') {
		// cannot do it in the content script, delegate to the main
		// in this case tabId can be null, the main script will get the tabId
		// from the rpc call

		browser.rpc.call(null, 'refreshIcon');
		return;
	}

	Util.getIconInfo(tabId, function(info) {
		if(!info || info.hidden) {
			chrome.pageAction.hide(tabId);

		} else {
			chrome.pageAction.setIcon({
				tabId: tabId,
				path: {
					19: '/images/' + (info.private ? 'pin_19.png' : 'pin_disabled_19.png'),
					38: '/images/' + (info.private ? 'pin_38.png' : 'pin_disabled_38.png')
				}
			});
			chrome.pageAction.setTitle({
				tabId: tabId,
				title: info.title
			});
			chrome.pageAction.show(tabId);
		}
	});
};

Browser.Gui.prototype.refreshAllIcons = function() {
	chrome.tabs.query({}, function(tabs) {
		for(var i = 0; i < tabs.length; i++)
			browser.gui.refreshIcon(tabs[i].id);
	});
};

Browser.Gui.prototype.showOptions = function(anchor) {
	var baseUrl = chrome.extension.getURL('options.html');
	var fullUrl = baseUrl + (anchor || '');

	chrome.tabs.query({ url: baseUrl }, function(tabs) {
		blog("tabs",tabs);
		if (tabs.length)
			chrome.tabs.update(tabs[0].id, { active: true, url: fullUrl });
		else
			chrome.tabs.create({ url: fullUrl });
	});
};

Browser.Gui.prototype.getActiveTabUrl = function(handler) {
	chrome.tabs.query(
		{ active: true,               // Select active tabs
		  lastFocusedWindow: true     // In the current window
		}, function(tabs) {
			// there can be only one;
			// we call getUrl from the content script (avoid asking for 'tabs' permisison)
			//
			browser.rpc.call(tabs[0].id, 'getState', [], function(state) {
				handler(state.url);
			});
		}
	);
};


// in chrome, apart from the current console, we also log to the background page, if possible and loaded
//
Browser.prototype.log = function(a, b) {
	if(!browser.debugging) return;

	console.log(a, b);

	var bp;
	if(chrome.extension && chrome.extension.getBackgroundPage)
		bp = chrome.extension.getBackgroundPage();

	if(bp && bp.console != console)		// avoid logging twice
		bp.console.log(a, b);
}


// utility class, loaded in various places
//
// It should contain only browser-independent functions, browser-specific
// functionality should go to browser/*.js
//

var Util = {
	extractDomain: function(url) {
		var match = /\/\/([^\/]+)/.exec(url);
		return match ? match[1] : "";
	},
	extractAnchor: function(url) {
		var match = /#(.+)/.exec(url);
		return match ? match[1] : "";
	},
	clone: function(obj) {
		// Note: JSON stringify/parse doesn't work for cloning native objects such as Position and PositionError
		//
		var t = typeof obj;
		if(obj === null || t === 'undefined' || t === 'boolean' || t === 'string' || t === 'number')
			return obj;
		if(t !== 'object')
			return null;

		var o = {};
		for (var k in obj)
			o[k] = Util.clone(obj[k]);
		return o;
	},

	// Get icon information for a specific tabId. Returns:
	//   { hidden:   true if the icon should be hidden,
	//     private:  true if we are in a private mode,
	//     title:    icon's title }
	//
	// Note: we have this method here (instead of inside the content script) so
	//       that the rpc call and the storage access are serialized, instead of nested.
	//       Firefox has issues with nested calls (we should fix this at some point)
	//
	getIconInfo: function(tabId, handler) {
		Browser.rpc.call(tabId, 'getState', [], function(state) {
			if(!state) {
				// this is not a tab with content script loaded, hide icon
				handler({ hidden: true, private: false, title: "" });
				return;
			}

			Browser.storage.get(function(st) {
				var domain = Util.extractDomain(state.callUrl);
				var level = st.domainLevel[domain] || st.defaultLevel;
				var location = st.domainLocation[domain] || st.defaultLocation;

				var info = {
					hidden:  st.hideIcon || !state.apiCalled,
					apiCalled: state.apiCalled,
					private: !st.paused && level != 'real',
					title:
						st.paused		? "Location Spoofer is paused" :
						level == 'real'	? "Using your real location" :
						level == 'fixed'? "Using a fixed location" :
						"Privacy level: " + level
				};
				handler(info);
			});
		});
	},

	events: {
		_listeners: {},

		addListener: function(name, fun) {
			if(!this._listeners[name])
				this._listeners[name] = [];
			this._listeners[name].push(fun);
		},

		fire: function(name) {
			var list = this._listeners[name];
			if(!list) return;

			for(var i = 0; i < list.length; i++)
				list[i]();
		}
	}
};


// PostRPC provides RPC functionality through message passing. Both postMessage
// and Firefox's port object are supported
//
// sendObj: object for sending messages (window or port)
// receiveObj: object for receiving messages
//
// The case when sendObj == receiveObj == window is supported. In this
// case sent messages will be also received by us, and ignored.
//
function _PostRPC() {		// include all code here to inject easily

	PostRPC = function(name, sendObj, receiveObj) {
		this._id = Math.floor(Math.random()*1000000);
		this._ns = '__PostRPC_' + name;
		this._sendObj = sendObj;
		this._calls = {};
		this._methods = {};

		if(!receiveObj) return;		// send-only RPC

		if(receiveObj.emit) {
			receiveObj.on(this._ns, this._receiveMessage.bind(this));
		} else {
			var _this = this;
			receiveObj.addEventListener("message", function(event) {
				var data = event.data && event.data[_this._ns];		// everything is inside ns, to minimize conflicts with other message
				if(data)
					_this._receiveMessage(data);
			}, false);
		}
	};

	// public methods
	PostRPC.prototype.register = function(name, fun) {
		this._methods[name] = fun;
	};
	PostRPC.prototype.call = function(method, args, handler) {
		var callId;
		if(handler) {
			callId = Math.floor(Math.random()*1000000);
			this._calls[callId] = handler;
		}
		if(!args) args = [];

		this._sendMessage({ method: method, args: args, callId: callId, from: this._id });
	};

	// private methods for sending/receiving messages
	PostRPC.prototype._sendMessage = function(message) {
		if(this._sendObj.emit)
			this._sendObj.emit(this._ns, message);
		else {
			// everything is inside ns, to minimize conflicts with other messages
			var temp = {};
			temp[this._ns] = message;
			this._sendObj.postMessage(temp, "*");
		}
	}

	PostRPC.prototype._receiveMessage = function(data) {
		if(data.method) {
			// message call
			if(data.from == this._id) return;						// we made this call, the other side should reply
			if(!this._methods[data.method]) {						// not registered
				Browser.log('PostRPC: no handler for '+data.method);
				return;
			}

			// pass returnHandler, used to send back the result
			var replyHandler;
			if(data.callId) {
				var _this = this;
				replyHandler = function() {
					var args = Array.prototype.slice.call(arguments);	// arguments in real array
					_this._sendMessage({ callId: data.callId, value: args });
				};
			} else {
				replyHandler = function() {};		// no result expected, use dummy handler
			}

			var dataArgs = Array.prototype.slice.call(data.args);	// cannot modify data.args in Firefox 32, clone as workaround
			dataArgs.push(replyHandler);

			this._methods[data.method].apply(null, dataArgs);

		} else {
			// return value
			var c = this._calls[data.callId];
			delete this._calls[data.callId];
			if(!c) return;											// return value for the other side, or no return handler
			c.apply(null, data.value);
		}
	}
}
_PostRPC();
// Base class for browser-specific functionality
// Subclasses should implement the API defined here
//
var Browser = {
	debugging: true,				// set this to false on production
	testing: false,					// set to true to run tests on load

	// Browser.init(script)
	//
	// Initializes the Browser library. 'script' is the type of scrpit loading the
	// library, it can be one of:
	//   main
	//   content
	//   popup
	//   options
	//
	init: function(script) {},

	// Browser.rpc
	//
	// Class implementing rpc calls between the main script and content script
	// running in tabs. It is used both internally in the Browser library
	// and externally in the extension's scripts.
	//
	rpc: {
		// Browser.rpc.register(name, handler)
		//
		// Registers a method to be callable from other scripts.
		// handler should be a function
		//    function(...args..., tabId, replyHandler)
		//
		// The function receives any arguments passed during the call (see Browser.rpc.call)
		// Moreover, two extra arguments are automatically added:
		//   tabId:         the tabId of the caller, or null if the call is made from the main script
		//   replyHandler:  function for asynchronously returning a result by calling replyHandler(result)
		//
		// IMPORTANT: If handler does not immediately return a result but stores replyHandler to do it asynchronously later,
		// it should return a true value to keep replyHandler open.
		//
		register: function(name, handler) {},

		// Browser.rpc.call(tabId, name, args, handler)
		//
		// Calls a remote method.
		//   tabId:    tab id of the script to call, or null to call the main script
		//   name:     method name
		//   args:     array of arguments to pass
		//   handler:  function(res), will be called when the result is received
		//
		// If the call cannot be made to the specific tabId, handler will be called with no arguments.
		//
		call: function(tabId, name, args, handler) {}
	},

	// Browser.storage
	//
	// Class implementing the extensions persistent storage.
	// The storage is a single object containing options, cache and everything
	// else that needs to be stored. It is fetched and stored as a whole.
	//
	storage: {
		// browser.storage.get(handler)
		//
		// fetches the storage object and passes it to the handler.
		// The default object is returned if the storage is empty.
		//
		get: function(handler) {},

		// browser.storage.set(st, handler)
		//
		// Stores the give storage object. Calls the handler when finished.
		//
		set: function(st, handler) {},

		// browser.storage.clear(handler)
		//
		// Clears the storage. Calls the handler when finished.
		//
		clear: function(handler) {},

		// default storage object
		//
		_default: {
			paused: false,
			hideIcon: false,
			cachedPos: {},
			fixedPos: {
				latitude: -4.448784,
				longitude: -171.24832
			},
			fixedPosNoAPI: true,
			updateAccuracy: true,
			epsilon: 2,
			levels: {
				low: {
					radius: 200,
					cacheTime: 10,
				},
				medium: {
					radius: 500,
					cacheTime: 30,
				},
				high: {
					radius: 2000,
					cacheTime: 60,
				}
			},
			defaultLevel: "medium",
			defaultLocation: "real",
			domainLevel: {},
			domainLocation: {},
		}
	},

	// Browser.gui
	//
	// Class controlling the browser's GUI. The main GUI element is the extension's icon. Each tab has
	// a possibly different icon, whose information can be obtained by calling the rpc method 'getIconInfo'
	// of the content script. The method should return an object:
	//   { hidden:   true if the icon should be hidden,
	//     private:  true if we are in a private mode,
	//     title:    icon's title }
	//
	// The GUI is free to render the icon in any way based on the above info. It can also render it
	// at any moment, by calling getIconInfo to get the info object.
	// When refreshIcon or refreshAllIcons are called the icons should be refreshed.
	//
	gui: {
		// Browser.gui.refreshIcon(tabId)
		//
		// Refreshes the icon of the tab with the given 'tabId'
		// If tabId is undefined/null then
		//  - if called from a content script it refreshes the icon of the content script's tab
		//  - outside the content script it raises error
		// getIconInfo should be called to get the icon's info
		//
		refreshIcon: function(tabId) {},

		// Browser.gui.refreshAllIcons()
		//
		// Refreshes the icons of all tabs.
		// getIconInfo should be called to get the icon's info
		//
		refreshAllIcons: function() {},

		// Browser.gui.showPage(name)
		//
		// Shows an internal html page by opening a new tab, or focusing an old tab if it's already open
		// (at most one internal page should be open)
		//
		showPage: function(name) {},

		// Browser.gui.getActiveCallUrl(handler)
		//
		// Gets the callUrl of the active tab and passes it to 'handler'
		//
		getActiveCallUrl: function(handler) {},

		// Browser.gui.resizePopup(width, height)
		//
		// Resizes the popup to the given width/height, closes it if width/height are null
		//
		resizePopup: function(width, height) {},
	},

	// Browser.log(text, value)
	//
	// Logs the given text/value pair
	//
	log: function(text, value) {
		if(!Browser.debugging) return;

		console.log(text, value);
	}
};

// for quick logging
function blog() {
	Browser.log.apply(Browser, arguments);
}

// implements browser_base.js

Browser.init = function (script) {
	Browser._script = script;
	Browser.log('initializing', script);

	if(script == 'main') {
		Browser._main_script();
		Browser.storage._init();
		Browser.gui._init();
		Browser._install_update();
	} else {
		// setup the internal RPC with the main script, on which the higher-level Browser.rpc is based
		// If we run in a content script we use self.port
		// If we run in a normal page we use window (messageProxy.js will then forward the messages)
		//
		var sendObj = self.port || window;
		Browser._internal_rpc = new PostRPC('internal', sendObj, sendObj);
		Browser._internal_rpc.register('internalCall', Browser.rpc._listener);
	}
};

// handle installation and upgrade
Browser._install_update = function(){

	var self = require("sdk/self");

	if(self.loadReason == "install") {
		Util.events.fire('browser.install');
	}
	else if(self.loadReason == "upgrade"){
		Util.events.fire('browser.update');
	}
}

Browser._main_script = function() {
	exports.Browser = Browser;
	exports.Util = Util;

	var data = require("sdk/self").data;

	// make resource://location-spoofer/... likes to point to our data dir
	require('./resource').set('location-spoofer', data.url(''));

	// refresh icon when a tab is activated
	//
	require('sdk/tabs').on('activate', function (tab) {
		Browser.gui.refreshIcon(tab.id);
		Browser.gui._hidePopup();			// firefox hides panel automatically on mouse click, but not on Ctrl-T tab change
	});

	Browser.workers = [];

	// content script insertion
	// all http[s] pages: insert content.js
	//
	require("sdk/page-mod").PageMod({
		include: ['*'],
		attachTo: ["top", "frame"],
		contentScriptWhen: 'start', // TODO THIS IS TRICKY
		contentScriptFile: [data.url("js/util.js"),
							data.url("js/browser_base.js"),
							data.url("js/browser.js"),
							data.url("js/laplace.js"),
							data.url("js/content.js")],
		onAttach: Browser._onWorkerAttach,
	});

	// our internal pages (options, demo, popup): insert only messageProxy for communication
	//
	require("sdk/page-mod").PageMod({
		include: ["resource://location-spoofer/*"],
		contentScriptWhen: 'start', // sets up comm. before running the page scripts
		contentScriptFile: [data.url("js/messageProxy.js")],
		onAttach: Browser._onWorkerAttach,
	});
}

// executed when a worker is created, each worker corresponds to a page
// we need to setup internal RPC, and to keep track of workers in Browser.workers to
// allow for main -> page communication
//
Browser._onWorkerAttach = function(worker) {
	var array = require('sdk/util/array');

	worker._internal_rpc = new PostRPC('internal', worker.port, worker.port);
	worker._internal_rpc.register('internalCall', function(call, replyHandler) {
		// add tabId and pass to Browser.rpc
		call.tabId = worker.tab.id;
		return Browser.rpc._listener(call, replyHandler);
	});

	array.add(Browser.workers, worker);

	if(!worker.on) return;		// dummy 'popup' worker, has no events

	// pagehide: called when user moves away from the page (closes tab or moves back/forward).
	// the worker is not valid anymore so we need to remove it.
	// in case of back/forward, the tab is still active and the icon needs to be removed, so we call refreshIcon.
	// in case of tab close, the "activate" even of the new tab will be called anyway, so the icon will be refreshed there.
	//
	worker.on('pagehide', function() {
		array.remove(Browser.workers, this);

		if(this.tab)								// moving back/forward, the tab is still active so the icon must be refreshed
			Browser.gui.refreshIcon(this.tab.id);

		Browser.gui._hidePopup();					// firefox hides panel automatically on mouse click, but not on Ctrl-W tab close
	});

	// pageshow: called when page is shown, either the first time, or when navigating history (back/forward button)
	// When havigating history, an old (hidden) worker is reused instead of creating a new one. So we need to put it
	// back to Browser.workers
	//
	worker.on('pageshow', function() {
		array.add(Browser.workers, this);
	});
}

Browser._find_worker = function(tabId) {
	for (var i = 0; i < Browser.workers.length; i++)
		if (Browser.workers[i].tab && Browser.workers[i].tab.id == tabId)
			return Browser.workers[i];
	return null;
}



//////////////////// rpc ///////////////////////////
//
Browser.rpc._methods = {};

// handler is a   function(...args..., tabId, replyHandler)
Browser.rpc.register = function(name, handler) {
	this._methods[name] = handler;
}

// internal RPC listener. 'call' is of the form
// { method: ..., args: ..., tabId: ... }
//
Browser.rpc._listener = function(call, replyHandler) {
	var handler = Browser.rpc._methods[call.method];
	if(!handler) {
		replyHandler();		// if the call cannot be made, call handler with no arguments
		return;
	}

	// add tabId and replyHandler to the arguments
	var args = call.args || [];
	args.push(call.tabId, replyHandler);

	return handler.apply(null, args);
};

Browser.rpc.call = function(tabId, name, args, cb) {
	var call = { method: name, args: args };

	if (Browser._script == 'main') {
		var worker = Browser._find_worker(tabId);
		if(worker) {
			worker._internal_rpc.call('internalCall', [call], cb);
		} else {
			if(cb) cb();				// cannot connect, call cb with no arguments
		}

	} else {
		// content or popup
		Browser._internal_rpc.call('internalCall', [call], cb);
	}
}


//////////////////// storage ///////////////////////////

Browser.storage._key = "global";		// store everything under this key
Browser.storage._init = function() {
	// only called in main script
	Browser.rpc.register('storage.get',function(tabId, handler) {
		Browser.storage.get(handler);
	});
	Browser.rpc.register('storage.set',function(st, tabId, handler) {
		Browser.storage.set(st, handler);
	});
	Browser.rpc.register('storage.clear',function(tabId, handler) {
		Browser.storage.clear(handler);
	});
}

Browser.storage.get = function(handler) {
	if (Browser._script == 'main') {
		var ss = require("sdk/simple-storage").storage;
		var st = ss[Browser.storage._key];

		// default values
		if(!st) {
			st = Browser.storage._default;
			Browser.storage.set(st);
		}
		handler(st);

	} else {
		Browser.rpc.call(null, 'storage.get', null, handler);
	}
};

Browser.storage.set = function(st, handler) {
	if (Browser._script == 'main') {
		var ss = require("sdk/simple-storage").storage;
		ss[Browser.storage._key] = st;
		if(handler) handler();

	} else {
		Browser.rpc.call(null, 'storage.set', [st], handler);
	}
};

Browser.storage.clear = function(handler) {
	if (Browser._script == 'main') {
		var ss = require("sdk/simple-storage").storage;
		delete ss[Browser.storage._key];
		if(handler) handler();

	} else {
		Browser.rpc.call(null, 'storage.clear', [], handler);
	}
};


//////////////////// gui ///////////////////////////

// only called by main
Browser.gui._init = function(){

	var Cu = require("chrome").Cu;
	Cu.import("resource://gre/modules/Services.jsm");

	Browser.gui._fennec = Services.wm.getMostRecentWindow("navigator:browser").NativeWindow != undefined;

	if(Browser.gui._fennec) {
		// enable workaround for options not appearing in fennec: https://bugzilla.mozilla.org/show_bug.cgi?id=1243467
		require("fennec-addon-preferences-workaround");

		Cu.import("resource://gre/modules/PageActions.jsm");
		Cu.import("resource://gre/modules/NetUtil.jsm");

	} else {
		// The fact that we create/destroy the button multiple times doesn't play well with Firefox about:customizing page.
		// For instance if the user presses "remove from toolbar" and we keep creating/destroying, we'll get errors:
		//    https://bugzilla.mozilla.org/show_bug.cgi?id=1150907
		// Sometimes (hard to reproduce) the customizing page will even get in a "stuck" state.
		//
		// To avoid these issues, and since our button emulated a "pageaction" button anyway, we don't allow customization. More precisely:
		//  - "move to menu" is disabled, if pressed the button immediately returns in the toolbar
		//  - "remove from toolbar" is caught, and sets the "hide icon" option. The user needs to re-enable it in the options page
		//  - the button does not appear in about:customizing
		//
		Cu.import("resource:///modules/CustomizableUI.jsm");

		this._widgetId =															// widget id used internally by CustomizableUI, see https://github.com/mozilla/addon-sdk/blob/master/lib/sdk/ui/button/toggle.js
			('toggle-button--' + require("sdk/self").id.toLowerCase()+ '-' + "location_spoofer").
			replace(/[^a-z0-9_-]/g, '');

		CustomizableUI.addListener({
			onWidgetRemoved: function(widgetId) {
				if(widgetId != Browser.gui._widgetId) return;

				// button removed from toolbar. if "move to menu" was pressed it will be added to the menu immediately (but it's not there yet).
				// if "remove from toolbar" was pressed it will remained "unused". so we wait 10msecs and see what happened.
				//
				require("sdk/timers").setTimeout(function() {
					if(CustomizableUI.getPlacementOfWidget(widgetId)) {
						// button was moved to Menu, notify user that this is not supported
						require("sdk/notifications").notify({
							text: "This icon cannot be moved to Menu.",
							iconURL: require("sdk/self").data.url('images/pin_38.png')
						});

					} else {
						// button is "unused", remove and update settings
						Browser.storage.get(function(st) {
							st.hideIcon = true;
							Browser.storage.set(st, function() {
								Browser.gui.refreshAllIcons();
							});
						});
					}

					// in both cases we put the button back in the toolbar
					CustomizableUI.addWidgetToArea(Browser.gui._widgetId, CustomizableUI.AREA_NAVBAR);
				}, 10);
			}
		});
	}

	// register rpc methods
	//
	Browser.rpc.register('getActiveCallUrl', function(tabId, replyHandler) {
		Browser.gui.getActiveCallUrl(replyHandler);
		return true;	// replyHandler will be used later
	});

	Browser.rpc.register('refreshIcon', function(tabId, callerTabId) {
		Browser.gui.refreshIcon(tabId || callerTabId);		// null tabId in the content script means refresh its own tab
	});

	Browser.rpc.register('refreshAllIcons', this.refreshAllIcons.bind(this));
	Browser.rpc.register('showPage',        this.showPage.bind(this));
	Browser.rpc.register('resizePopup',     this.resizePopup.bind(this));

	// register options button
	//
	var prefsModule = require("sdk/simple-prefs");
	prefsModule.on("optionButton", function() {
		Browser.log("options was clicked");
		Browser.gui.showPage("options.html");
	})
}

Browser.gui._getActiveTab = function(){
	var tabs = require("sdk/tabs");
	return tabs.activeTab;
}

Browser.gui._refreshButton = function(info) {
	var { ToggleButton } = require('sdk/ui/button/toggle');
	var { data } = require("sdk/self");

	if(!info || info.hidden) {
		if(this._button) {
			this._button.destroy();
			this._button = null;
		}

	} else {
		var icon = {
			19: data.url('images/' + (info.private ? 'pin_19.png' : 'pin_disabled_19.png')),
			38: data.url('images/' + (info.private ? 'pin_38.png' : 'pin_disabled_38.png')),
			50: data.url('images/' + (info.private ? 'pin_50.png' : 'pin_disabled_50.png')),
		};

		if(!this._button) {
			this._button = ToggleButton({
				id: "location_spoofer",
				label: "Location Spoofer",
				icon: icon,
				onChange: function(state) {
					if(state.checked)
						Browser.gui._showPopup();
				},
			});

			// make sure it's in the main toolbar
			CustomizableUI.addWidgetToArea(Browser.gui._widgetId, CustomizableUI.AREA_NAVBAR);

		} else {
			this._button.icon = icon;
			this._button.label = info.title;
		}
	}
}

Browser.gui._hidePopup = function() {
	if(Browser.gui._panel)
		Browser.gui._panel.hide();
}

Browser.gui._showPopup = function() {
	var { data } = require("sdk/self");

	// we create a dummy worker with tabId = "popup" and add it in Brower.workers, so that
	// communication with the popup happens in the same way as with all tabs
	//
	var worker = {
		tab: { id: "popup", url: "popup" }
	};

	// hide previous panel, if any
	this._hidePopup();

	// we create a new panel each time, and destroy it when it's hidden (simulate chrome's bejaviour)
	// the panel starts hidden, it will be shown by Browser.gui.resizePopup
	//
	var panel = require("sdk/panel").Panel({
		contentURL: data.url("popup.html"),

		contentScriptWhen: 'start',								// sets up comm. before running the page scripts
		contentScriptFile: [data.url("js/messageProxy.js")],	// needed for communication

		onHide: function() {
			if(Browser.gui._button)
				Browser.gui._button.state("window", { checked: false });

			if(Browser.gui._panel == panel)
				Browser.gui._panel = null;
			panel.destroy();

			require('sdk/util/array').remove(Browser.workers, worker);
		},
	});
	Browser.gui._panel = panel;

	// prepare RPC, add to workers array
	worker.port = panel.port;
	Browser._onWorkerAttach(worker);
}

Browser.gui._refreshPageAction = function(info) {
	var nw = Services.wm.getMostRecentWindow("navigator:browser").NativeWindow;

	if(this._pageaction)
		PageActions.remove(this._pageaction);
	if(this._menu)
		 nw.menu.remove(this._menu);

	if(!info.apiCalled) {
		// no API call, show nothing
		return;

	} else if(info.hidden) {
		// if the API is called by the icon is hidden, add menu
		this._menu = nw.menu.add({
			name: "Location Spoofer",
			callback: require('./PopupFennec').show
		});

	} else {
		// load and cache icon in base64
		var icon = 'images/' + (info.private ? "pin_50.png" : "pin_disabled_50.png");
		if(!this._base64_cache)
			this._base64_cache = {};
		if(!this._base64_cache[icon])
			this._base64_cache[icon] = require('sdk/base64').encode( load_binary(icon) );

		this._pageaction = PageActions.add({
			icon: "data:image/png;base64," + this._base64_cache[icon],
			title: "Location Spoofer",
			clickCallback: require('./PopupFennec').show
		});
	}

	/*
	nw.toast.show("Location Spoofer is enabled", "long", {
		button: {
			label: "SHOW",
			callback: require('./PopupFennec').show
		}
	});
	*/
}

// the following 5 are the public methods of Browser.gui
//
Browser.gui.refreshIcon = function(tabId) {
	Browser.log('refreshing icon', tabId);

	if(Browser._script == 'main') {
		// refreshIcon is supposed to change the icon of a specific tab (or the active tab if tabId = null). In firefox
		// the icon is actually _global_, we update it on every tab change. So refreshIcon only needs to refresh the _active_
		// tab's icon (i.e. when tabId == null or tabId == activeTab.id).
		//
		if(tabId == undefined)
			throw "tabId not set";
		if(tabId != Browser.gui._getActiveTab().id)
			return;		// asked to refresh a non-active tab, nothing to do

		Util.getIconInfo(tabId, function(info) {
			Browser.log('got info for refreshIcon', info);

			if(Browser.gui._fennec)
				Browser.gui._refreshPageAction(info);
			else
				Browser.gui._refreshButton(info);
		});

	} else {
		// content popup
		// cannot do it in the content script, delegate to the main
		Browser.rpc.call(null, 'refreshIcon', [tabId]);
	}
};

Browser.gui.refreshAllIcons = function() {
	if(Browser._script == 'main')
		// in firefox the icon is global, we only need to refresh the active tab
		Browser.gui.refreshIcon(Browser.gui._getActiveTab().id);
	else
		Browser.rpc.call(null, 'refreshAllIcons');
};

Browser.gui.showPage = function(name) {
	Browser.log('showPage', name);

	if(Browser._script == 'main') {
		// if there is any tab showing an internal page, activate and update it, otherwise open new
		//
		var data = require("sdk/self").data;
		var baseUrl = 'resource://location-spoofer/';
		var fullUrl = baseUrl + name;

		if(this._fennec) {
			// sdk/tabs doesn't enumerate tabs correctly in fennec
			// maybe bug: https://bugzilla.mozilla.org/show_bug.cgi?id=844859
			// So we use BrowserApp instead
			//
			var ba = Services.wm.getMostRecentWindow("navigator:browser").BrowserApp;
			var tabs = ba.tabs;

			for(var i = 0; i < tabs.length; i++) {
				var url = tabs[i].window.location.href;
				if(url.search(baseUrl) != -1) {
					ba.selectTab(tabs[i]);
					if(url != fullUrl)		// if identical avoid reload
						tabs[i].browser.loadURI(fullUrl);
					return;
				}
			}

			ba.addTab(fullUrl);

		} else {
			var tabs = require("sdk/tabs");

			for(var i = 0; i < tabs.length; i++) {
				if(tabs[i].url.search(baseUrl) != -1) {
					if(tabs[i].url != fullUrl)		// avoid refresh
						tabs[i].url = fullUrl;
					tabs[i].activate();
					return;
				}
			}
			tabs.open(fullUrl);
		}

	} else {
		Browser.rpc.call(null, 'showPage', [name], null);
	}
};

Browser.gui.getActiveCallUrl = function(handler) {
	if(Browser._script == 'main') {
		// Note: the callUrl might come from a frame inside the page, from a different url than tab.url
		// We need to get it from the content script using the getState rpc call
		//
		var tab = Browser.gui._getActiveTab();
		Browser.rpc.call(tab.id, 'getState', [], function(state) {
			handler(state.callUrl);
		});
	} else {
		// cannot do it in the content script, delegate to the main
		Browser.rpc.call(null, 'getActiveCallUrl', [], handler)
	}
}

Browser.gui.resizePopup = function(width, height) {
	if(Browser._script == 'main') {
		if(!Browser.gui._panel) return;

		if(width && height) {
			Browser.gui._panel.resize(width, height);
			Browser.gui._panel.show({ position: Browser.gui._button });
		} else {
			// close
			Browser.gui._panel.hide();
		}

	} else {
		Browser.rpc.call(null, 'resizePopup', [width, height]);
	}
};


Browser.log = function() {
	if(!Browser.debugging) return;

    var args = Array.prototype.slice.call(arguments);	// convert to real array
	args.unshift(Browser._script + ":");

	console.log.apply(console, args);
}


// loads a binary file from the data directory
// same as data.load, but data.load does string conversion, and fails for binary
// files. It's a slight modification of readURISync (which is used by data.load)
// https://github.com/mozilla/addon-sdk/blob/master/lib/sdk/net/url.js
//
function load_binary(uri) {
	var data = require("sdk/self").data;
	var channel = NetUtil.newChannel(data.url(uri), null);
	var stream = channel.open();
	var count = stream.available();
	var data = NetUtil.readInputStreamToString(stream, count);
	stream.close();
	return data;
}

// main script
// Here we only handle the install/update events
// Browser-specific functionality for the main script, if needed, is added by browser/*.js
//

Browser.log('starting');

Util.events.addListener('browser.install', function() {
	// show demo on first install
	Browser.gui.showPage('demo.html');
});

Util.events.addListener('browser.update', function() {
	// upgrade options from previous versions
	Browser.storage.get(function(st) {
		if(st.fixedPosNoAPI == null)
			st.fixedPosNoAPI = true;

		Browser.storage.set(st);
	});
});

Browser.init('main');

if(Browser.testing) {
	// test for nested calls, and for correct passing of tabId
	//
	Browser.rpc.register('nestedTestMain', function(tabId, replyHandler) {
		blog("in nestedTestMain, call from ", tabId, "calling back nestedTestTab");

		Browser.rpc.call(tabId, 'nestedTestTab', [], function(res) {
			blog("got from nestedTestTab", res, "adding '_foo' and sending back");
			replyHandler(res + '_foo');
		});

		// we MUST return true to signal that replyHandler will be used at a later
		// time (when we get the reply of nestedTestTab). Returning false will
		// fail in FF and some versions of Chrome. We mention this in the
		// specification of Browser.rpc.register
		return true;
	});
}

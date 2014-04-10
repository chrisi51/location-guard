// main script
// Here we only handle the install/update events
// Browser-specific functionality for the main script, if needed, is added by browser/*.js
//

browser = new Browser.Main();
browser.log('starting');

Util.events.addListener('browser.install', function() {
	// show FAQ on first install
	browser.gui.showOptions('#faq');
});

Util.events.addListener('browser.update', function() {
	// upgrade options from previous versions
	browser.storage.get(function(st) {
		if(st.fixedPosNoAPI == null)
			st.fixedPosNoAPI = true;

		browser.storage.set(st);
	});
});

browser.init();

function Tabs(scope, container) {
	this.scope = scope;
	this.children = [];
	this.container = container;

	this.$ = {};
	this.$.container = $(container);

	this.tabs = [];
	this.tabIndex = {};

	// to handle headers
	this.tabChangedListeners = [];
	this.tabClosedListeners = [];

	this.currentTab = null;

	// trying to guarantee id uniqueness
	this.timestamp = Date.now();
	this.id = "tablist_" + this.timestamp;

	this.init();
}
Tabs.prototype.init = function () {
	this.html = Tabs.Template(this);
	this.$.html = $(this.html);
	//this.$.html.find('.nav-tabs').tabdrop({showTitle:true,keepi18n:true});
	var s = new ScrollyTab(this.$.html.find(".nav-tabs"));
	this.$.container.append(this.$.html);

	this.$.labels = this.$.html.closestChildren(".nav.nav-tabs");
	this.$.tabs = this.$.html.closestChildren(".tab-content");

	this.i18n();
};
Tabs.prototype.i18n = function () {
	this.$.html.i18n();
	//this.$.html.find('.nav-tabs').tabdrop('layout');
};
Tabs.prototype.getTabById = function (id) {
	return this.tabIndex[id];
};
Tabs.prototype.newTab = function (i18n, json, cantClose) {
	if (!!this.tabIndex[json.id]) return;

	var info = {
		timestamp: this.timestamp,
		"title-i18n": i18n,
		id: json.id,
		tid: json.tid,
		title: json.title,
		name: json.name,
		cantClose: cantClose,
	};
	var containers = {
		labels: this.$.labels,
		content: this.$.tabs,
	};

	var t = new Tab(this, containers, this, info);
	this.tabs.push(t);
	this.children.push(t);
	this.tabIndex[t.id.replace(/(^\/+|\/+$)/g, "")] = t;

	return t;
};
Tabs.prototype.changeTab = function (tab) {
	if (this.tabs.indexOf(tab) < 0) return;

	tab.show();

	this.currentTab = tab;

	this.notifyChanged(tab);
};
Tabs.prototype.notifyChanged = function (tab, preventPush) {
	for (var i = 0; i < this.tabChangedListeners.length; i++) {
		this.tabChangedListeners[i](tab.id);
	}

	if (window.nav && !preventPush) {
		window.nav.tabChanged(tab.id);
	}
	this.currentTab = tab;
};
Tabs.prototype.closeTab = function () {
	// check unsaved
	// pop up if needed
	if (this.unsaved) {
		return;
	}
};
Tabs.prototype.closeMe = function (tab) {
	this.tabs.splice(this.tabs.indexOf(tab), 1);
	this.children.splice(this.children.indexOf(tab), 1);
	delete this.tabIndex[tab.id.replace(/(^\/+|\/+$)/g, "")];
	if (this.currentTab === tab) {
		this.tabs[0].show();
		this.tabs[0].shown();
	}
};
Tabs.prototype.getCurrentTab = function () {
	return this.currentTab;
};
Tabs.prototype.onTabChange = function (callback) {
	this.tabChangedListeners.push(callback);
};
Tabs.prototype.onTabClose = function (callback) {
	this.tabClosedListeners.push(callback);
};
Tabs.prototype._ = scopeInterface;
Tabs.prototype.is = scopeCompare;

Tabs.Template = Handlebars.templates["view/tabs"];

function Tab(scope, containers, host, info) {
	this.scope = scope;
	this.children = [];
	this.containers = containers;
	this.host = host;
	this.info = info;
	this.id = this.info.id;

	if (this.info.title) this.title = Handlebars.compile(this.info.title);

	this.cantClose = this.info.cantClose;
	this.$ = {};

	this.components = [];

	this.boundElements = [];

	this.init();
}
Tab.prototype.init = function () {
	this.$.label = $(Tabs.Template(this.info, { data: { label: true } }));
	this.$.a = $(this.$.label.children("a").get(0));
	this.$.content = $(Tabs.Template(this.info, { data: { tab: true } }));

	this.containers.labels.append(this.$.label);
	this.containers.content.append(this.$.content);

	this.setupEvents();

	this.nav = this._("^navController").get(0);

	this.i18n();
};
Tab.prototype.i18n = function (data) {
	if (this.title) {
		this.$.label.find(".title").html(this.title(data || {}) || "&nbsp;");
	} else {
		this.$.label.find("[data-i18n]").each(function () {
			var $this = $(this);
			$this.text(Handlebars.compile(i18n.t($this.data("i18n")))(data));
		});
	}

	this.$.content.find(".innerTab").i18n();

	this.updateUnsaved();
};
Tab.prototype.applyContextData = function (data) {
	for (var i = 0; i < this.children.length; i++) {
		if (this.children[i].applyContextData)
			this.children[i].applyContextData(data);
	}
};
Tab.prototype.setTitle = function (title) {
	this.$.label.find(".title").html(title);
};
Tab.prototype.setErrorTitle = function (title) {
	this.title = title;
	this.$.label.find(".title").html(title).attr("data-i18n", "");
};
Tab.prototype.getTitle = function () {
	return this.$.label.text();
};
Tab.prototype.updateTitle = function (data) {
	this.i18n(data);
};
Tab.prototype.setupEvents = function () {
	var self = this;
	this.$.a.on("shown.bs.tab", function (ev) {
		if (ev.relatedEvent) self.shown();
	});
	this.$.a.on("hidden.bs.tab", function (ev) {
		self.hidden();
	});
	this.$.a.children(".close-icon").on("click", function (ev) {
		self.tryClose();
	});

	this.$.label.on("mousedown", function (ev) {
		if (ev.which === 2) {
			ev.preventDefault();
			ev.stopPropagation();
			self.tryClose();
			return false;
		}
	});
	//this.$.a.on('mousedown', );
};
Tab.prototype.isShown = function () {
	return this.$.content.is(":visible");
};
Tab.prototype.shown = function (preventPush) {
	var self = this;
	this.host.notifyChanged(this, preventPush);
	for (var i = 0; i < this.boundElements.length; i++) {
		this.boundElements[i].show();
	}
	this._("_*").each(function (v) {
		if (v.refresh) v.refresh();
	});
};
Tab.prototype.hidden = function () {
	for (var i = 0; i < this.boundElements.length; i++) {
		this.boundElements[i].hide();
	}
};
Tab.prototype.bind = function (el) {
	this.boundElements.push(el);
};
Tab.prototype.hide = function () {
	/* nop */
};
Tab.prototype.show = function (push) {
	this.$.a.tab("show");
	this.shown(!push);
};
Tab.prototype.close = function () {
	this.setUnsaved(false);

	this._("1_*").remove();

	while (this.children.length > 0) {
		this.children[0].remove && this.children[0].remove();
		this.children.shift();
	}

	this.$.label.remove();
	this.$.content.remove();
	this.host.closeMe(this);
	for (var i = 0; i < this.boundElements.length; i++) {
		this.boundElements[i].remove();
	}
	window.nav.setUnsaved(false, this.id, this.host.section, this.title);
};
Tab.prototype.tryClose = function () {
	if (this.cantClose) {
		return;
	}

	var self = this;
	if (this.unsaved) {
		Tools.Modals.confirmDiscardData()
			.then(function () {
				self.setUnsaved(false);
				self.close();
			})
			.catch(function () {});
	} else {
		this.close();
	}
};
Tab.prototype.addComponent = function (comp) {
	this.children.push(comp);
	this.components.push(comp);
};
Tab.prototype.setBusy = function (busy) {
	this.busy = busy;
	if (busy) {
		this.$.a.addClass("busy");
	} else {
		this.$.a.removeClass("busy");
	}
};
Tab.prototype.setUnsaved = function (unsaved) {
	if (this.unsaved === unsaved) return;
	this.unsaved = unsaved;
	this.updateUnsaved();
};
Tab.prototype.updateUnsaved = function () {
	if (this.unsaved) {
		this.$.a.addClass("unsaved");
	} else {
		this.$.a.removeClass("unsaved");
	}
	this.nav.setUnsaved(
		this.unsaved,
		this.id,
		this.host.scope.section,
		this.getTitle()
	);
};
Tab.prototype.isUnsaved = function () {
	return this.unsaved;
};
Tab.prototype.setError = function (iserror, error) {
	this.iserror = iserror;
	if (iserror) {
		this.$.a.addClass("error");
		if (error) {
			this.setErrorTitle(error);
			this.sendError(error);
		}
	} else {
		this.$.a.removeClass("error");
	}
};
Tab.prototype.sendError = function (error) {
	for (var i = 0; i < this.boundElements.length; i++) {
		if (this.boundElements[i].setError) this.boundElements[i].setError(error);
	}
};
Tab.prototype.setId = function () {
	// check if available on host
	// cange indata
};
Tab.prototype.getContainer = function () {
	return this.$.content;
};
Tab.prototype._ = scopeInterface;
Tab.prototype.is = scopeCompare;

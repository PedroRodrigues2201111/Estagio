function View() {
	this.$ = {};

	this.headers = {};
	this.$.headers = {};
	this.tabs = {};

	this.currentTab = null;

	this.components = [];
}
View.prototype.init = function () {
	var self = this;

	this.initActions();

	this.json.tabIndex = {};
	this.json.tabs.forEach(function (v) {
		self.json.tabIndex[v.id] = v;
	});
	this.html = View.Template(this.json);

	this.$.html = $(this.html);
	// this.$.html.find('.nav-tabs').tabdrop({showTitle:true, keepi18n:true});
	var s = new ScrollyTab(this.$.html.find(".nav-tabs"));

	this.$.container.append(this.$.html);

	this.$.headers = this.$.container.children(".header-wrapper");
	this.$.contents = this.$.container.children(".view-content");

	// make header sticky
	this.$.headers.sticky({
		responsiveWidth: true,
		topSpacing: 0,
		className: "stuck",
		getWidthFrom: this.$.headers.closest(".content-wrapper"),
	});

	this.tabs = new Tabs(this, this.$.contents.get(0));
	this.children.push(this.tabs);

	this.json.tabs.forEach(function (v) {
		// tab templates for instancing as needed
		if (v.defer) return;

		self.newTab(v.id, {});
	});

	this.changeTab(this.json.default);
};
View.prototype.newTab = function (tab, json, title) {
	var self = this;
	var newTab = {};
	var tabJson = JSON.simpleCopy(this.json.tabIndex[tab]);
	// init tab
	var title = title || tabJson["title-i18n"];

	json.context = tabJson.id;
	json.view = this.json.id;
	tabJson.name = tabJson.id;

	if (json.id !== undefined) {
		tabJson.tid = json.id;
		tabJson.id = tabJson.id + "/" + json.id;
	}

	var cantClose = tabJson.cantClose;
	newTab.tab = this.tabs.newTab(title, tabJson, cantClose);

	// add content structure top tab
	newTab.content = View.Template(tabJson, { data: { content: true } });
	newTab.$ = {};
	newTab.$.content = newTab.tab.getContainer();
	var $html = $(newTab.content);
	newTab.$.content.append($html);
	newTab.tab.i18n();

	var s = new ScrollyTab($html.find(".nav-tabs"));

	newTab.$.content
		.find(".content-tabs .nav-tabs")
		.on("shown.bs.tab", ".innerTab > a", function (e) {
			newTab.$.content
				.find($(this).attr("href"))
				.find(".component")
				.each(function () {
					var $this = $(this).data("componentRef");
					if ($this && $this.refresh) {
						$this.refresh();
					}
				});
		});

	// create and bind header to tab
	var header = new Header(this, this.$.headers, this.json.headers[tab]);
	this.children.push(header);
	newTab.header = header;
	newTab.tab.bind(newTab.header);

	// insert components into structure
	// add callbackness
	newTab.$.content.find(".component").each(function (i, el) {
		self.initTabContent(i, el, json, newTab.tab);
	});

	setTimeout(function () {
		$(window).trigger("resize");
		$.AdminLTE.layout.fix();
	}, 10);

	if (
		tabJson.on &&
		tabJson.on.ready &&
		this.Actions &&
		this.Actions.view &&
		this.Actions.view[tabJson.on.ready]
	) {
		setTimeout(function () {
			self.Actions.view[tabJson.on.ready](tab, json, newTab.tab);
		}, 10);
	}

	return newTab;
};
View.prototype.initTabContent = function (i, el, json, tab) {
	var self = this;
	var $el = $(el);
	var instance = $el.data("component");

	// Error for non existing component
	if (!window.Instances[instance]) {
		console.error("Component " + instance + " does not exist.");
	} else {
		var comp = JSON.simpleCopy(window.Instances[instance]);

		var tmplt = null;
		if (comp.type.indexOf(".") > -1) {
			var cI = window.Templates;
			comp.type.split(".").forEach(function (v) {
				if (!cI[v]) {
					console.error("Error. " + v + " doesn't exist.");
				}
				cI = cI[v];
			});
			tmplt = cI;
		} else {
			tmplt = window.Templates[comp.type];
		}

		if (
			comp.override &&
			self.Actions.overrides &&
			self.Actions.overrides[comp.override]
		) {
			try {
				comp = self.Actions.overrides[comp.override].call(self, comp);
			} catch (e) {
				console.error(e);
			}
		}

		try {
			var component = new tmplt(tab, el, comp.opts, json);
			this.components.push(component);
			tab.addComponent(component);
		} catch (e) {
			console.error(e);
		}
	}
};
View.prototype.changeTab = function (tab, data) {
	if (!this.tabs.getTabById(tab).isShown()) {
		this.tabs.getTabById(tab).show(true);
		this.currentTab = tab;
	}
	this.tabs.getTabById(tab).applyContextData(data);
};
View.prototype.makeTab = function (tab) {
	/* nop, deprecating */
};
View.prototype.refresh = function () {
	this.$.headers.sticky("update");
};
View.prototype.getUrl = function (url) {
	return this.json.urls[url];
};
View.prototype.getUrls = function () {
	return this.json.urls;
};
View.prototype.getDefaultTab = function (tab) {
	for (var i = 0; i < this.json.tabs.length; i++) {
		if (!this.json.tabs[i].deferred) return this.json.tabs[i].id;
	}
};
View.prototype._ = scopeInterface;
View.prototype.is = function (t) {
	if (t === "view") return true;
	return scopeCompare.call(this, t);
};

View.prototype.changeOrMakeTab = function (tab, id, data, title) {
	var tabId = tab + (id !== undefined && id !== "" ? "/" + id : "");
	if (this.tabs.getTabById(tabId)) {
		// if so, change to it
		this.changeTab(tabId, data);
	} else if (this.tabs.getTabById(tab)) {
		// if so, change to it
		this.changeTab(tab, data);
	} else if (this.json.tabIndex[tab]) {
		// otherwise, make a new one
		var tabab = this.newTab(
			tab,
			{
				id: id,
				data: data,
			},
			title
		);
		tabab.tab.show(true);
	} else {
		// not found
	}
};
View.prototype.tabExists = function (tab) {
	return !!this.json.tabIndex[tab];
};

View.Template = Handlebars.templates["view/view"];

window.Templates.view = View;

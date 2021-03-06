function Header(scope, container, json) {
	this.container = container;
	this.$ = {};
	this.scope = scope;
	this.$.container = $(this.container);
	this.json = JSON.simpleCopy(json);

	this.view = this._("<view")[0];

	this.waitList = {};
	this.readyList = {};

	this.init();
}
Header.prototype.checkPermissions = function (uPerm) {
	this.$.html.find(".has-permissions").each(function (_, el) {
		el.classList.remove(
			...[...el.classList].filter((c) => c.indexOf("-by-permission") > 0)
		);

		let bP = Object.entries(el.dataset)
			.filter((d) => d[0].indexOf("permission") === 0)
			.map(([p, state]) => [p.slice(10), state]);

		let states = bP
			.filter(([prm]) => !uPerm.find((p) => comparePermission(prm, p)))
			.map(([_, state]) => state + "-by-permission")
			.filter((v, i, a) => a.indexOf(v) === i);

		el.classList.add(...states);
	});
};
Header.prototype.init = function () {
	var self = this;

	var actions = self._("^view").get(0).Actions.header;

	this.html = Header.Template(this.json);
	this.$.html = $(this.html);
	this.$.container.append(this.$.html);

	this.updatePermissions = (p) => this.checkPermissions(p);
	main.permissions.bind(this.updatePermissions);

	// bind sidebar toggle when bar is stuck
	this.$.html.find(".sidebar-toggle").on("click", window.toggleSidebar);

	var bindButton = function (b) {
		self.$.html.find('[data-id="' + b.id + '"]').on("click", function (ev) {
			var $btn = $(this);
			ev.preventDefault();

			if (this.classList.contains("disabled")) return;
			if (this.classList.contains("disabled-by-permission")) return;

			var action = $(this).data("btn-action");

			var Q = self.json.buttons.slice();
			var q, btn, cmp, after;
			while (Q.length >= 1 && !btn) {
				q = Q.pop();
				if (q.buttons) {
					for (var i = 0; i < q.buttons.length; i++) {
						Q.push(q.buttons[i]);
					}
				} else if (q.id === action) {
					btn = q;
				}
			}
			var tab = self.view.tabs.getCurrentTab();

			if (!btn) return;

			if (btn.action) {
				if (btn.action.type === "close") {
					tab.tryClose();
				} else if (btn.action.type === "forceClose") {
					tab.close();
				} else if (btn.action.type === "tab") {
					if (btn.action.field) {
						self.view.changeOrMakeTab(btn.action.name, data[btn.action.field]);
					} else if (btn.action.hasOwnProperty("id")) {
						self.view.changeOrMakeTab(btn.action.name, btn.action.id);
					} else {
						self.view.changeOrMakeTab(btn.action.name);
					}
				} else if (btn.action.type === "component") {
					var target = btn.action.action.split(".");
					var component = target[0];
					var field = target[1];
					cmp = self.readyList[component];

					if (cmp.constructor.name === "Grid") {
						if (field === "refresh") {
							cmp.refresh();
						}
					} else if (cmp.constructor.name === "Form") {
						if (field === "post") {
							if (!cmp.validate()) {
								Tools.Notifications.invalidForm();
							} else {
								$btn.boxBusy("black", "transparent", ".75em", "fa-cog");
								$btn.addClass("disabled");
								cmp
									.post()
									.then(function (res) {
										$btn.removeClass("disabled");
										$btn.boxUnBusy();

										if (btn.action.after === "close") {
											tab.tryClose();
										} else if (btn.action.after === "forceClose") {
											tab.close();
										} else if (btn.action.after === "refresh") {
											cmp.refresh(true);
										} else {
											if (actions[btn.action.after]) {
												actions[btn.action.after]();
											}
										}
									})
									.catch(function (err) {
										console.error(err);

										$btn.removeClass("disabled");
										$btn.boxUnBusy();

										//     Tools.Notifications.error( i18n.t(err.message) || JSON.tryParse(err.message));
									});
							}
						} else if (field === "reset") {
							cmp.reset();
						}
					}
				} else if (btn.action.type === "api") {
					var url = self.view.getUrl(btn.action.url) || btn.action.url;
					var data = null;

					url = url.fillWith({
						id: tab.info.tid,
						tab: tab.info.name,
					});

					if (!url)
						console.warn(
							'Url "' + url + '" for button "' + btn.id + '" not found.'
						);

					if (btn.action.field) {
						var target = btn.action.field.split(".");
						var component = target[0];
						var field = target[1];
						var prop = target[2] || null;
						var fv;

						cmp = self.readyList[component];
						if (cmp.constructor.name === "Grid") {
							if (field === "selected") {
								fv = cmp.getSelected();
								if (Array.isArray(fv.list))
									fv.list = fv.list.map(function (v) {
										return v[prop];
									});

								data = fv;
							} else {
								console.error(
									'Only "selected" value is implemented on grids api actions'
								);
							}
						} else if (cmp.constructor.name === "Form") {
							data = { list: [cmp._(">" + field)[0].get()], length: 1 };
							//console.error('No form api actions implemented yet');
						}
					} else {
					}

					var box;
					if (btn.action.text === "delete") {
						box = Tools.Modals.confirmDelete();
					} else if (typeof btn.action.text === "string") {
						box = Tools.Modals.custom({
							message: btn.action.text,
							title: btn.action.title,
							ok: "app.core.ok",
							cancel: "app.core.cancel",
						});
					} else if (typeof btn.action.text === "object") {
						box = Tools.Modals.custom(btn.action.text);
					} else {
						box = Tools.Modals.confirmAction();
					}

					box
						.then(function () {
							$btn.boxBusy("black", "transparent", ".75em", "fa-cog");
							$btn.addClass("disabled");
							if (cmp) cmp.$.container.boxBusy();
							Tools.Ajax.completePost(url, data)
								.then(function (res) {
									if (cmp) cmp.$.container.boxUnBusy();

									$btn.removeClass("disabled");
									$btn.boxUnBusy();

									if (btn.action.after) {
										(Array.isArray(btn.action.after)
											? btn.action.after
											: [btn.action.after]
										).forEach((a) => {
											if (a.indexOf(".") !== -1) {
												after = a.split(".")[1];
												cmp = tab._(">" + a.split(".")[0])[0];
											} else {
												after = a;
											}

											if (cmp.constructor.name === "Grid") {
												if (after === "refresh") {
													if (cmp) cmp.refresh();
												}
											} else if (cmp.constructor.name === "Form") {
												if (a === "close") {
													tab.tryClose();
												} else if (a === "forceClose") {
													tab.close();
												}
											} else {
												// check view for action
												if (actions[after]) {
													actions[after]();
												}
											}
										});
									}
									if (res.xhr.status == 200) {
										try {
											const data = JSON.parse(res.xhr.responseText);
											if (typeof data === "object") {
												Tools.Notifications.success(data.notification || null);
											} else {
												Tools.Notifications.success(data || null);
											}
										} catch (e) {
											Tools.Notifications.success(res.xhr.responseText || null);
										}
									} else if (res.xhr.status == 202) {
										Tools.Notifications.info("app.core.processing");
									}
								})
								.catch(function (err) {
									$btn.removeClass("disabled");
									$btn.boxUnBusy();
									try {
										Tools.Notifications.error(i18n.t(JSON.parse(err.message)));
									} catch (e) {
										Tools.Notifications.error(
											err.message
												? i18n.t(err.message)
												: "Network error: " + err.status
										);
									}

									if (cmp) cmp.$.container.boxUnBusy();
								});
						})
						.catch(function (err) {
							console.error(err);
						});
				} else if (btn.action.type === "custom") {
					if (actions[btn.action.action]) {
						actions[btn.action.action].apply(this, [self, tab, $btn]);
					} else {
						console.warn(
							'No custom button handler "' +
								btn.action.action +
								'" for button "' +
								btn.name +
								'".'
						);
					}
				} else {
					console.warn(
						'Unknown action "' +
							btn.action.type +
							'" for button "' +
							btn.name +
							'".'
					);
				}
			} else if (actions[action]) {
				actions[action].apply(this, [self, tab, $btn]);
			}
		});
	};

	var compare = function (a, o, b) {
		return {
			">": function () {
				return a > b;
			},
			"<": function () {
				return a < b;
			},
			">=": function () {
				return a >= b;
			},
			"==": function () {
				return a == b;
			},
			"!=": function () {
				return a != b;
			},
		}[o](a, b);
	};

	var prepareButtons = function (b) {
		var binds = [];

		if (b.states) {
			b.states.forEach(function (s) {
				if (s.field) {
					binds.push(s.field.split(".")[0]);
				}
			});
		}

		if (b.buttons) {
			b.buttons.forEach(prepareButtons);
		} else {
			// foreach action / state
			// check field[0]

			if (b.action && b.action.field) {
				binds.push(b.action.field.split(".")[0]);
			}
		}
		binds = binds.filter(function (b, i, a) {
			return a.indexOf(b) === i;
		});
		if (binds.length > 0) {
			// wait for components to be ready
			var html = self.$.html
				.find('[data-id="' + b.id + '"]')
				.addClass("disabled");
			var bounds = 0;
			binds.forEach(function (bind) {
				self.onComponentInit(bind, function () {
					bounds++;
					if (bounds === binds.length) {
						html.removeClass("disabled");
						// add state binds

						var states = {};

						if (b.states) {
							b.states.forEach(function (s) {
								var target = s.field.split(".");
								var component = target[0];
								var field = target[1];
								var prop = target[2] || null;
								var fv;
								states[s.class] = [];

								var cmp = self.readyList[component];
								if (cmp.constructor.name === "Grid") {
									if (field === "selected") {
										var gridSelection = function (fv) {
											if (prop !== null) fv = fv[prop];

											if (compare(fv, s.condition, s.value)) {
												if (states[s.class].indexOf(s) === -1)
													states[s.class].push(s);
												//html.addClass(s.class);
											} else {
												if (states[s.class].indexOf(s) !== -1)
													states[s.class].splice(states[s.class].indexOf(s), 1);
												//html.removeClass(s.class);
											}
											states.forEach(function (v, k) {
												if (v.length === 0) html.removeClass(s.class);
												else html.addClass(s.class);
											});
										};
										cmp.onChange(gridSelection);
										gridSelection(cmp.getSelected());
									} else {
										console.log("Non existant field");
									}
								} else if (cmp.constructor.name === "Form") {
									if (field === "changed") {
										cmp.onChange(function () {
											if (cmp.isChanged()) {
												if (states[s.class].indexOf(s) !== -1)
													states[s.class].splice(states[s.class].indexOf(s), 1);
												//html.removeClass(s.class);
											} else {
												if (states[s.class].indexOf(s) === -1)
													states[s.class].push(s);
												//html.addClass(s.class);
											}
											states.forEach(function (v, k) {
												if (v.length === 0) html.removeClass(s.class);
												else html.addClass(s.class);
											});
										});
									} else if (field === "unchanged") {
										cmp.onChange(function () {
											if (cmp.isChanged()) {
												if (states[s.class].indexOf(s) === -1)
													states[s.class].push(s);
												//html.addClass(s.class);
											} else {
												if (states[s.class].indexOf(s) !== -1)
													states[s.class].splice(states[s.class].indexOf(s), 1);
												//html.removeClass(s.class);
											}
											states.forEach(function (v, k) {
												if (v.length === 0) html.removeClass(s.class);
												else html.addClass(s.class);
											});
										});
									} else {
										var fld = cmp._(">" + field)[0];
										if (fld) {
											fld.onChange(function (id, val) {
												if (Array.isArray(s.values)) {
													if (s.values.indexOf(val) > -1) {
														if (states[s.class].indexOf(s) === -1)
															states[s.class].push(s);
														//html.addClass(s.class);
													} else {
														if (states[s.class].indexOf(s) !== -1)
															states[s.class].splice(
																states[s.class].indexOf(s),
																1
															);
														//html.removeClass(s.class);
													}
												} else {
													if (val === s.values) {
														if (states[s.class].indexOf(s) === -1)
															states[s.class].push(s);
														//html.addClass(s.class);
													} else {
														if (states[s.class].indexOf(s) !== -1)
															states[s.class].splice(
																states[s.class].indexOf(s),
																1
															);
														//html.removeClass(s.class);
													}
												}
												states.forEach(function (v, k) {
													if (v.length === 0) html.removeClass(s.class);
													else html.addClass(s.class);
												});
											});
											var getted = fld.get();
											if (Array.isArray(s.values)) {
												if (s.values.indexOf(getted) > -1) {
													if (states[s.class].indexOf(s) === -1)
														states[s.class].push(s);
													//html.addClass(s.class);
												} else {
													if (states[s.class].indexOf(s) !== -1)
														states[s.class].splice(
															states[s.class].indexOf(s),
															1
														);
													//html.removeClass(s.class);
												}
											} else {
												if (getted === s.values) {
													if (states[s.class].indexOf(s) === -1)
														states[s.class].push(s);
													//html.addClass(s.class);
												} else {
													if (states[s.class].indexOf(s) !== -1)
														states[s.class].splice(
															states[s.class].indexOf(s),
															1
														);
													//html.removeClass(s.class);
												}
											}
											states.forEach(function (v, k) {
												if (v.length === 0) html.removeClass(s.class);
												else html.addClass(s.class);
											});
										} else {
											console.warn("Field " + field + " not found.");
										}
									}
								}
							});
						}
						bindButton(b);
					}
				});
			});
		} else {
			// init
			bindButton(b);
		}
		// wait for binds
	};
	if (this.json.buttons) this.json.buttons.forEach(prepareButtons);

	// init button actions
	this.$.html.on("click", ".header-button", function (ev) {
		ev.preventDefault();
		ev.stopPropagation();
		var $this = $(this);

		$this
			.closest(".float-header")
			.find(".open")
			.filter(function () {
				return $(this).has($this).length === 0 && this !== $this[0];
			})
			.removeClass("open");

		if ($this.hasClass("dropdown")) {
			$this.toggleClass("open");
			return;
		}

		if ($this.hasClass("disabled")) {
			return;
		}
	});

	//  this.$.wrapper = this.$.html.parent();
	this.$.wrapper = this.$.html;

	this.hide();

	this.i18n();
};
Header.prototype.i18n = function () {
	this.$.html.i18n();
};
Header.prototype.remove = function () {
	delete this.host;
	delete this.view;
	main.permissions.offChange(this.updatePermissions);
	this.$.wrapper.remove();
};
Header.prototype.onComponentInit = function (name, func) {
	if (this.readyList[name]) {
		func(this.readyList[name]);
	} else {
		if (!this.waitList[name]) {
			this.waitList[name] = [];
		}
		this.waitList[name].push(func);
	}
};
Header.prototype.componentReady = function (name, component) {
	this.readyList[name] = component;
	if (this.waitList[name]) {
		for (var i = 0; i < this.waitList[name].length; i++) {
			this.waitList[name][i](component);
		}
		delete this.waitList[name];
	}
};
Header.prototype.hide = function () {
	this.$.wrapper.hide();
};
Header.prototype.show = function () {
	this.$.wrapper.show();
};
Header.prototype.setError = function (error) {
	this.$.wrapper.find("[data-error-" + error + "]").each(function (i, el) {
		var $this = $(this);
		$this.addClass($this.data("error-" + error));
	});
};
Header.prototype.getElement = function () {
	this.$.wrapper;
};
Header.prototype.is = scopeCompare;
Header.prototype._ = scopeInterface;

Header.Template = Handlebars.templates["view/header"];

window.Templates.header = Header;

function Menu(scope, container, json) {
  this.container = container;
  this.$ = {};
  this.$.container = $(this.container);
  this.scope = scope;
  this.json = json;
  this.init();
}
Menu.prototype.init = function() {
  this.html = Menu.Template(
    { items: this.json.menu },
    {
      helpers: {
        getUrl: function(viewName) {
          if (window.Views[viewName] && window.Views[viewName].json)
            return window.Views[viewName].json.url;

          return viewName;
        }
      }
    }
  );

  this.$.html = $(this.html);

  this.$.container.append(this.$.html);
  this.i18n();
};
Menu.prototype.i18n = function() {
  this.$.html.i18n();
};
Menu.prototype.getSectionByUrl = function(url) {
  return urlMap[url];
};
Menu.prototype.getUrlBySection = function(section) {
  var k = Object.keys(window.urlMap).find(function(k) {
    return window.urlMap[k] === section;
  });
  return k;
};
Menu.prototype.nav = function(view) {
  view = this.getUrlBySection(view) || view;
  var target = this.$.html.find('[data-view="' + view + '"]').parent();
  if (target.length === 0) {
    console.error("View " + view + " not found in menu.");
    return;
  }

  var target = target;
  var contains = this.$.html.find(".treeview-menu").has(target);
  var toClose = this.$.html.find("li.active  > .treeview-menu").not(contains);
  var toOpen = this.$.html.find("li:not(.active) > .treeview-menu").has(target);

  if (document.body.classList.contains("sidebar-collapse")) {
    toClose.css("display", "none");

    toOpen.css("display", "block");
  } else {
    toClose.stop().slideUp($.AdminLTE.options.animationSpeed, function() {
      $(this).css("height", "auto");
    });

    toOpen.stop().slideDown($.AdminLTE.options.animationSpeed, function() {
      $(this).css("height", "auto");
    });
  }
  toClose.parent("li").removeClass("active");
  toOpen.parent("li").addClass("active");

  setTimeout(function() {
    $.AdminLTE.layout.fix();
  }, $.AdminLTE.options.animationSpeed);

  this.$.html.find(".active:not(.treeview)").removeClass("active");
  target.addClass("active");
};
Menu.prototype.close = function(id) {
  this.$.html
    .find("#" + id)
    .children(".treeview-menu")
    .stop()
    .slideUp($.AdminLTE.options.animationSpeed)
    .parent("li")
    .removeClass("active");
};
Menu.prototype.getContainer = function() {
  return this.$.container;
};
Menu.prototype._ = scopeInterface;
Menu.prototype.is = scopeCompare;

Menu.Template = Handlebars.templates["view/menu"];

window.Templates.menu = Menu;

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

function Template( scope, container, json, opts ){
  this.scope = scope;
  this.opts = opts;
  this.container = container;
  this.json = JSON.simpleCopy(json);
  
  this.view = this._('^view').get(0);
  this.actions = this.view.Actions.template || {};
  
  this.tab = this._('^tab')[0];
  this.host = this.tab;
  
  this.url = (this.view.getUrl(this.json.url) || this.json.url).fillWith(opts);

  this.$ = {};
  this.$.container = $(this.container);
  this.$.container.data('componentRef', this);
  this.$.html = null;

  this.init();
}
Template.prototype.init = function(){
  var self = this;
  
  this.$.html = $('<div></div>');
  this.$.container.append(this.$.html);
  window.staticTemplates = window.staticTemplates || {};
  
  if( this.json.css )
    this.css = $('<style>'+this.json.css.join('\n')+'</style>').appendTo($('head'));
  
  this.st = window.staticTemplates;
  this.template = this.template || Handlebars.compile( 
    ( this.json.template.join ? this.json.template.join('') : this.json.template ) 
  );

  if( this.json.on && this.json.on.ready && this.actions && this.actions[this.json.on.ready] )
    this.onReady = this.actions[this.json.on.ready];

}
Template.prototype.refresh = function(){
  if( this.$.container.is(':visible') ){
    this.update();
  }
}
Template.prototype.update = function(){
  var self = this;
  
  this.$.html = $('<div></div>');
  this.$.container.boxBusy();
  
  this.render(function( $html ){
    self.$.container.empty();
    self.$.container.append( $html );
    self.bind();
    self.i18n();
    self.$.container.boxUnBusy();
    self.onReady && self.onReady(self);
  });
}
Template.prototype.getTemplate = function( id, callback ){
  var self = this;
  
  if( !this.st[id] ){
    this.st[id] = {};
    this.st[id].id = id;
    this.st[id].isLoading = true;
    this.st[id].callbacks = this.st[id].callbacks || [];
    this.st[id].callbacks.push( callback );
    
    Tools.Ajax.defaultGet( './include/static_templates/'+id+'.hbs' )
    .then(function( data ){
      self.st[id].template = Handlebars.compile( data );
      self.st[id].callbacks.forEach(function(cb){
        setTimeout(function(){
          cb( self.st[id] );
        },0);
      });
      self.st[id].isLoading = false;
    }).catch(function(err){
      //console.log('Failed to load '+id+'.hbs template.');
      
      self.st[id].template = function(e){return e};
      self.st[id].callbacks.forEach(function(cb){
        setTimeout(function(){
          cb( self.st[id] );
        },0);
      });
      self.st[id].isLoading = false;
    });
  }else if( this.st[id].isLoading ){
    this.st[id].callbacks = this.st[id].callbacks || [];
    this.st[id].callbacks.push( callback );
  }else{
    callback( this.st[id] );
  }
}
Template.prototype.render = function( callback ){
  var self = this;
  var method = Tools.Ajax.defaultGet;
  
  if( this.json.method ){
    if( this.json.method.toLowerCase() === 'post' ){
      method = Tools.Ajax.defaultPost;
    }else if( this.json.method.toLowerCase() === 'get' ){
      method = Tools.Ajax.defaultGet;
    }
  }
  
  method( this.url )
  .then(function(data){
    self.data = data.data || data;
    self.renderTemplate( self.$.html, {
      template: self.template,
      id: 'main'
    }, self.data, function($html){
      callback($html);
    });
    
  }).catch(function(err){
    self.error( err.status );
  });
}   
Template.prototype.error = function( err ){
  var error = Errors({type:"Template", status: err});
  
  this.$.container.prepend(error.html);
  error.html.html.find('.closebtn').remove();
}
Template.prototype.renderTemplate = function( $container, template, data, callback ){
  var self = this;
  var $contents = $container.contents().detach();
  
  var $html = $(template.template( data , {helpers: this.actions.helpers || {}}));
  
  $container.replaceWith( $html );
  
  $html.parent().find('div.content').replaceWith( $contents );
  
  var promises = [];
  
  $html.find('[data-template]:not([data-template] [data-template])').each(function(){
    var $this = $(this);
    promises.push(function( callback ){
      self.getTemplate( $this.data('template'), function(template){
        self.renderTemplate( $this, template, ({}).deepMerge(data).deepMerge($this.data('data')||{}), callback );
      });
    });
  });
  
  if( promises.length === 0 ){
    callback($html);
  }else{
    for( var i = 0, j = 0 ; i < promises.length ; i++ ){
      var p = promises[i];
      p(function(){
        j++;
        if( j === promises.length ){
          callback($html);
        }
      });
    }
  }
}         
Template.prototype.i18n = function(){
  this.$.container.i18n();
  
  if( this.json.setsTitle )
    if( this.host.updateTitle )
      this.host.updateTitle( this.data );
}    
Template.prototype.remove = function(){
  if( this.css )
    this.css.remove();
}

Template.prototype.bind = function(){
  var self = this;
  
  this.$.container.find('[data-action]').each(function(){
    var $this = $(this);
    if( $this.data('bound') )
      return;
    var a = $this.data('action');
    var events = ['click'];
    if( self.actions[a] ){
      if( $this.data('events') ){
        events = $this.data('events').split(',');
      }
      
      $this.on(events.join(' '), function(ev){
        self.actions[a](ev, $this, self.data, self);
      });      
    }else{
      //console.log('Action ' + a + ' for ' + self.json.id + ' doesn\'t exist;');
      // warn
    }
    $this.data('bound', true);
  });
}
Template.prototype._ = scopeInterface;
Template.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('Template').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};

window.Templates.template = Template;
function Uploader( scope, container, json ){
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);

  this.init();
  this.bind();
  this.i18n();
}
Uploader.prototype.init = function(){
  this.html = Uploader.Template(this.json);
  this.$.html = $(this.html);
  this.$.container.append(this.$.html);


  this.errorCallbacks = [];
  this.successCallbacks = [];

  this.evs = {
    error: this.errorCallbacks,
    success: this.successCallbacks
  };

  var opts = {
    showPreview: !!this.json.preview,
    allowedFileExtensions: this.json.fileTypes,
    uploadUrl: this.json.url,
    showAjaxErrorDetails: false
  };

  this.fi = this.$.html.fileinput(opts);

  this.$.container.find('.fileinput-remove-button > span')
    .attr('data-i18n', 'common.remove');

  this.$.container.find('.fileinput-cancel-button > span')
    .attr('data-i18n', 'common.cancel');

  this.$.container.find('.fileinput-upload-button > span')
    .attr('data-i18n', 'common.upload');

  this.$.container.find('.btn-file > span')
    .attr('data-i18n', 'common.browse');
}
Uploader.prototype.bind = function(){
  var self = this;
  this.fi.on('fileuploaded', function( ev ) {
    self.resolveSuccess(ev);
  }).on('fileuploaderror', function( ev ) {
    self.resolveError(ev);
  });
}
Uploader.prototype.on = function( ev, callback ){
  if( this.evs[ev] ){
    this.evs[ev].push(callback);
  } else {
    console.log('No such event.');
  }
  return this;
}
Uploader.prototype.resolveSuccess = function( ev ){
  for( var i = 0 ; i < this.successCallbacks.length ; i++ ){
    this.successCallbacks[i]( ev );
  }
}
Uploader.prototype.resolveError = function( ev ){
  for( var i = 0 ; i < this.errorCallbacks.length ; i++ ){
    this.errorCallbacks[i]( ev );
  }
}
Uploader.prototype.fail = function( callback ){
  this.on( 'error' , callback );
  return this;
}
Uploader.prototype.done = function( callback ){
  this.on( 'success' , callback );
  return this;
}
Uploader.prototype.i18n = function(){
  this.$.html.i18n();
}

Uploader.Template = Handlebars.templates['components/uploader'];

window.Templates.uploader = Uploader;
function Errors( opts ){
  return Errors.make(opts);
}
Errors.make = function( opts ){
  opts.deepMerge( Errors.parseStatus( opts.status ) );
  
  html = Errors.Template( opts );

  $html = $( html );

  $html.i18n();
  
  if( opts.status === 401 ){
    main._('>authcontroller')[0].lock(function(){
      $html.find('.retrybtn').trigger('click');
    });
  }
  
  return {
    html: $html,
    opts: opts
  };
}
Errors.parseStatus = function( status ){
  switch( status ){
    case 400:
      return {
        'error': 'bad-request', 
        'severity': 'danger',
        'title-i18n': 'app.errors.error',
        'msg-i18n': 'app.errors.400'
      };
    case 401:
      return {
   //     'cantRetry': true,
        'error': 'unauthorized', 
        'severity': 'danger',
        'title-i18n': 'app.errors.error',
        'msg-i18n': 'app.errors.401'
      };
    case 403:
      return {
        'cantRetry': true,
        'error': 'forbidden', 
        'severity': 'danger',
        'title-i18n': 'app.errors.error',
        'msg-i18n': 'app.errors.403'
      };
    case 404:
      return {
        'error': 'not-found', 
        'severity': 'danger',
        'title-i18n': 'app.errors.error',
        'msg-i18n': 'app.errors.404'
      };
    case 500:
      return {
        'error': 'server-error', 
        'severity': 'danger',
        'title-i18n': 'app.errors.error',
        'msg-i18n': 'app.errors.500'
      };
    case 1501:
      return {
        'error': 'no-data', 
        'severity': 'danger',
        'title-i18n': 'app.errors.error',
        'msg-i18n': 'app.errors.no-data'
      }
    case 1502:
      return {
        'error': 'no-data', 
        'severity': 'danger',
        'title-i18n': 'app.errors.error',
        'msg-i18n': 'app.errors.no-data'
      }
    case 1523:
      return {
        'error': 'no-data', 
        'severity': 'danger',
        'title-i18n': 'app.errors.error',
        'msg-i18n': 'app.errors.no-data'
      }
    case 'no-data':
      return {
        'error': 'no-data', 
        'severity': 'discrete',
        'title-i18n': 'app.errors.info',
        'msg-i18n': 'app.errors.no-data'
      }
    default:
      return {
        'error': 'unknown', 
        'severity': 'danger',
        'title-i18n': 'app.errors.error',
        'msg-i18n': 'app.errors.unknown'
      };
  }
}



Errors.PostError = function( status, message, xhr ) {
  this.message = message;
  if( xhr ){
    this.statusText = xhr.statusText;
  }
  this.code = status;
  this.status = status;
  this.name = "PostError";
  this.stack = (new Error()).stack;
}
Errors.PostError.prototype = Object.create(Error.prototype);
Errors.PostError.prototype.constructor = Errors.PostError;

Errors.LoginError = function( status, message ) {
  this.message = message;
  this.code = status;
  this.status = status;
  this.name = "LoginError";
  this.stack = (new Error()).stack;
}
Errors.LoginError.prototype = Object.create(Error.prototype);
Errors.LoginError.prototype.constructor = Errors.LoginError;

Errors.Template = Handlebars.templates['errors/errors'];

window.Templates.errors = Errors;

function Form(scope, container, json, opts) {
	this.container = container;
	this.json = JSON.simpleCopy(json);

	this.name = this.json.name;
	this.lastLoad = 0;

	this.scope = scope;
	this.host = this._("^tab").get(0);
	this.tab = this.host;
	this.view = this._("^view").get(0);

	this.actions = this.view.Actions.form;
	this.cmpId = this.json.id;

	this.opts = opts;

	this.on = {};

	this.on.start = function () {};
	this.on.preComponent = function (data, cb, form) {
		cb(data);
	};
	this.on.postComponent = function (data, cb, form) {
		cb(data);
	};
	this.on.preLoad = function (data, cb, form) {
		cb(data);
	};
	this.on.postLoad = function (data, cb, form) {
		cb(data);
	};
	this.on.preSave = function (data, cb, form) {
		cb(data);
	};
	this.on.postSave = function (data, cb, form) {
		cb(data);
	};
	this.on.ready = function () {};
	this.on.dataApplied = function () {};

	this.$ = {};
	this.$.container = $(this.container);
	this.$.container.data("componentRef", this);

	this.changeListeners = [];

	this.children = [];
	this.changes = {};

	this.json.deepMerge(this.opts);

	this.data = {};
	this.originalData = {};

	this.id = this.opts.id;

	var self = this;
	this.init()
		.then(function () {
			self.on.ready(self);

			self.host &&
				self.host.boundElements.forEach(function (h) {
					if (h.componentReady) h.componentReady(self.cmpId, self);
				});
			return null;
		})
		.catch(function (err) {
			console.error(err);
		});
}
Form.prototype.init = function () {
	var self = this;

	this.initPromise = new Promise(function (resolve, reject) {
		self.ts = Date.now();
		self.json.ts = self.ts;

		self.fnComponent = Form.defaultPost;
		if (self.json.fnComponent && self.actions[self.json.fnComponent])
			self.fnComponent = self.actions[self.json.fnComponent];

		if (self.json.on) {
			if (self.json.on.preComponent && self.actions[self.json.on.preComponent])
				self.on.preComponent = self.actions[self.json.on.preComponent];
			if (
				self.json.on.postComponent &&
				self.actions[self.json.on.postComponent]
			)
				self.on.postComponent = self.actions[self.json.on.postComponent];
			if (self.json.on.dataApplied && self.actions[self.json.on.dataApplied])
				self.on.dataApplied = self.actions[self.json.on.dataApplied];
		}
		if (self.json.events) {
			var alerts = main.alerts;
			var actions = self.actions;

			self.json.events.forEach(function (v, k) {
				var _k = k.split(".");
				var ns = _k[0];
				var event = _k[1];
				var action = null;

				if (v[0] === ":") {
					v = v.substring(1);
					action = function (data) {
						actions[v](self, data);
					};
				}

				if (!action) {
					console.error('No such handler "' + v + '" for event "' + k + '".');
				}

				alerts.on(ns, event, action);
			});
		}
		return self
			.getComponent()
			.then(function () {
				self.ready = true;
				self.html = Form.Template(self.json);

				self.$.html = $(self.html);
				self.$.container.append(self.$.html);

				self.fnLoad = Form.defaultPost;
				if (self.json.fnLoad && self.actions[self.json.fnLoad])
					self.fnLoad = self.actions[self.json.fnLoad];

				self.fnSave = Form.defaultPost;
				if (self.json.fnSave && self.actions[self.json.fnSave])
					self.fnSave = self.actions[self.json.fnSave];

				if (self.json.on) {
					if (self.json.on.preLoad && self.actions[self.json.on.preLoad])
						self.on.preLoad = self.actions[self.json.on.preLoad];
					if (self.json.on.postLoad && self.actions[self.json.on.postLoad])
						self.on.postLoad = self.actions[self.json.on.postLoad];
					if (self.json.on.preSave && self.actions[self.json.on.preSave])
						self.on.preSave = self.actions[self.json.on.preSave];
					if (self.json.on.postSave && self.actions[self.json.on.postSave])
						self.on.postSave = self.actions[self.json.on.postSave];
					if (self.json.on.ready && self.actions[self.json.on.ready])
						self.on.ready = self.actions[self.json.on.ready];
					if (self.json.on.change && self.actions[self.json.on.change])
						self.onChange(self.actions[self.json.on.change]);
				}

				// init inputs
				self.initInputs();

				return self
					.load()
					.then(function (data) {
						self.applyFieldBinds();

						// Open first tab
						self.$.html
							.closestChildren(".nav.nav-tabs")
							.find("a:first")
							.tab("show");
						//self.$.html.find('.nav-tabs').tabdrop({showTitle:true,keepi18n:true});
						var s = new ScrollyTab(self.$.html.closestChildren(".nav-tabs"));

						self.bind();
						self.i18n();
						self.refresh();

						resolve();

						self.dataReady = true;

						return null;
					})
					.catch(function (err) {
						console.error(err);
						self.host && self.host.setError(true, err.code);
					});
			})
			.catch(function (err) {
				console.error(err);
			});
	});

	return this.initPromise;
};
Form.prototype.bind = function () {
	var self = this;
	this.$.html.find('a[data-toggle="tab"]').on("shown.bs.tab", function (e) {
		for (var i = 0; i < self.children.length; i++) self.children[i].refresh();
	});
};
Form.prototype.i18n = function () {
	this.$.html.find(".nav.nav-tabs").i18n();
	//this.$.html.find('.nav-tabs').tabdrop('layout');

	if (this.json.setsTitle)
		if (this.host && this.host.updateTitle)
			this.host.updateTitle(this.originalData);
};
Form.prototype.readonly = function (set) {
	if (typeof set === "undefined") return this.isReadOnly;

	this.isReadOnly = !!set;

	for (var i = 0; i < this.children.length; i++) {
		this.children[i].readonly &&
			!this.children[i].json.readonly &&
			!this.children[i].json.readOnly &&
			!this.children[i].json.disabled &&
			this.children[i].readonly(this.isReadOnly);
	}
};
Form.prototype.getComponent = function () {
	if (this.isGettingComponent) return promiseStub();

	var self = this;
	var data = {
		id: this.opts.id,
		tab: this.host && this.host.info.name,
		context: this.opts.context,
		view: this.opts.view,
	};
	var url = null;
	if (this.json.componentUrl)
		url = this.view.getUrl(this.json.componentUrl)
			? renderCached(this.view.getUrl(this.json.componentUrl), data)
			: renderCached(this.json.componentUrl, data);

	var p = new Promise(function (resolve, reject) {
		if (!url) {
			resolve();
			return;
		}
		self.isGettingComponent = true;
		self.$.container.boxBusy();
		self.host && self.host.setBusy(true);
		self.on.preComponent(data, function (data) {
			return Form.defaultPost(data, url)
				.then(function (cmp_data) {
					var data = cmp_data.data;
					self.on.postComponent(data, function (data) {
						self.isGettingComponent = false;
						self.$.container.boxUnBusy();
						if (Object.keys(data).length > 0 && data.data) {
							self.json.deepMerge(data.data.opts);
							resolve(data);
						} else {
							var error = Errors({ type: "Form", status: 1502 });
							self.displayError(error);

							reject(new Errors.PostError(1502, "empty-component"));
						}
					});
				})
				.catch(function (err) {
					var error = Errors({ type: "Form", status: err.code });
					self.displayError(error);

					self.isGettingComponent = false;
					self.$.container.boxUnBusy();

					reject(err);
				});
		});
	});
	return p;
};
Form.prototype.applyContextData = function (data) {
	console.log(data);
};
Form.prototype.validate = function () {
	var valid = true;
	for (var i = 0; i < this.children.length; i++) {
		valid = this.children[i].validate() !== false && valid;
	}
	return valid;
};
Form.prototype.prePost = function () {
	for (var i = 0; i < this.children.length; i++) {
		if (this.children[i].prePost) this.children[i].prePost();
	}
};
Form.prototype.setSaved = function () {
	for (var i = 0; i < this.children.length; i++) this.children[i].saveData();

	this.checkUnsaved();
};
Form.prototype.refresh = function (force) {
	if (!this.ready || (this.json.cantReload && !force)) return;

	if (
		force ||
		(!this.isChanged() && !this.isLoading && this.lastLoad + 60000 < Date.now())
	) {
		this.load();
	}

	for (var i = 0; i < this.children.length; i++) this.children[i].refresh();
};
Form.prototype.remove = function () {
	while (this.children.length > 0) {
		this.children[0].remove && this.children[0].remove();
		this.children.shift();
	}
	if (this.$.html) this.$.html.remove();
};
Form.prototype.load = function (settings) {
	if (this.isLoading) return promiseStub();

	settings = settings || {};

	var self = this;

	var data = {
		id: self.id,
		fields: self.json.fields.map(function (v) {
			return v.id;
		}),
		context: {
			id: this.opts.id,
			tab: this.host && this.host.info.name,
			context: this.opts.context,
			view: this.opts.view,
		},
		opts: this.opts,
	};
	var url = null;
	if (this.json.getUrl)
		url = this.view.getUrl(this.json.getUrl)
			? renderCached(this.view.getUrl(this.json.getUrl), data)
			: renderCached(this.json.getUrl, data);

	var p = new Promise(function (resolve, reject) {
		if (!url) {
			if (self.json.defaultData) {
				self.applyData(self.json.defaultData);
			}
			resolve(self.json.defaultData);
			return null;
		}
		self.isLoading = true;
		self.$.container.boxBusy();
		self.host && self.host.setBusy(true);

		self.on.preLoad(data, function (data) {
			var load = function () {
				Form.defaultPost(data, url)
					.then(function (cmp_data) {
						var data = cmp_data.data;
						self.on.postLoad(
							data,
							function (data) {
								self.host && self.host.setBusy(false);
								if (Object.keys(data).length > 0 && data.data) {
									self.lastLoad = Date.now();
									self.originalData = data.data;
									self.applyData(data.data);
									self.isLoading = false;
									self.$.container.boxUnBusy();
									// apply permission states
									resolve(data);
								} else {
									self.isLoading = false;
									self.$.container.boxUnBusy();
									var error = Errors({ type: "Form", status: 1501 });
									self.displayError(error);

									reject(new Errors.PostError(1501, "no-data"));
								}
							},
							self
						);
						return null;
					})
					.catch(function (err) {
						var error = Errors({ type: "Form", status: err.code });

						self.displayError(error, load);

						self.isLoading = false;
						self.$.container.boxUnBusy();
						self.host && self.host.setBusy(false);

						//reject( err );
					});
			};
			load();
		});
		return null;
	});
	return p;
};

Form.prototype.displayError = function (err, cb) {
	var self = this;
	var $html = err.html;
	this.$.container.prepend($html);

	$html.find("button.retrybtn").on("click", function () {
		cb && cb();
		$html.remove();
	});
	if (self.host && !self.host.cantClose && !self.view.json.noTabs) {
		$html.find("button.closebtn").on("click", function () {
			self.host.close();
		});
	} else {
		$html.find("button.closebtn").remove();
	}
};
Form.prototype.displayPostError = function (err) {
	var error = Errors({ type: "Form", status: err });
	this.$.container.prepend(error.html);

	error.html.find("button.closebtn").on("click", function () {
		error.html.remove();
	});
};
Form.prototype.initInputs = function () {
	var self = this;

	// find it
	this.$.html.find("[data-placeholder]").each(function () {
		// get it
		var $el = $(this);

		// make it
		var nf = self.makeField($el, $el.data("placeholder"));

		// bind it
		nf.onChange(function (id, value, changed) {
			// check it
			self.checkUnsaved(id, changed);
			// loop it
			for (var i = 0; i < self.changeListeners.length; i++) {
				// update it
				self.changeListeners[i](id, value, changed);
			}
		});

		// technologic
	});
};
Form.prototype.onChange = function (callback) {
	this.changeListeners.push(callback);
};
Form.prototype.onReady = function (callback) {
	var self = this;
	this.initPromise
		.then(function () {
			return callback(self);
		})
		.catch(function (err) {
			console.error("Error in Form[ " + self.json.id + " ] onReady.", err);
		});
};

Form.prototype.makeField = function ($el, field) {
	var j = this.json.fields[field];
	if (!j) {
		console.error(field + " not declared.");
	}
	var nf = new Form.Fields[j.type](this, $el, j);
	this.children.push(nf);
	return nf;
};
Form.prototype.clear = function () {
	for (var i = 0; i < this.children.length; i++)
		this.children[i].clear && this.children[i].clear();

	this.$.html.closestChildren(".nav.nav-tabs").find("a:first").tab("show");
};
Form.prototype.reset = function () {
	for (var i = 0; i < this.children.length; i++) this.children[i].reset();
};
Form.prototype.checkUnsaved = function (id, changed) {
	if (this.json.cantSave) return;

	if (!changed && this.changes[id]) {
		delete this.changes[id];
	} else if (changed) {
		this.changes[id] = true;
	}

	this.host && this.host.setUnsaved(this.isChanged());
};
Form.prototype.isChanged = function () {
	return Object.keys(this.changes).length > 0;
};
Form.prototype.isBusy = function () {
	return this.children.reduce(function (p, c) {
		var b = p || (c.isBusy && c.isBusy());
		return b;
	}, false);
};
Form.prototype.whenReady = function () {
	var ps = this.children
		.filter(function (c) {
			return c.whenReady && c.isBusy();
		})
		.map(function (c) {
			return c.whenReady();
		});

	return Promise.all(ps);
};
Form.prototype.post = function (settings) {
	var self = this;

	if (this.isPosting) return promiseStub();

	var data = {
		id: self.id,
		fields: self.json.fields.map(function (v) {
			return v.id;
		}),
		context: {
			id: this.opts.id,
			tab: this.host && this.host.info.name,
			context: this.opts.context,
			view: this.opts.view,
		},
		opts: this.opts,
	};

	settings = settings || {};
	var url = this.view.getUrl(this.json.postUrl)
		? renderCached(this.view.getUrl(this.json.postUrl), data)
		: renderCached(this.json.postUrl, data);

	this.isPosting = true;
	this.$.container.boxBusy();
	var form_data = this.getData();

	this.prePost();

	return new Promise(function (resolve, reject) {
		var st = function () {
			self.on.preSave.call(self, form_data, function (data) {
				Form.defaultPost(data, url)
					.then(function (cmp_data) {
						var data = cmp_data.data;
						self.on.postSave(data, function (data) {
							cmp_data.data = data;
							if (settings.reset) {
								self.reset();
							} else {
								self.originalData = form_data;
								self.setSaved();
							}

							if (data && data.notification && cmp_data.xhr.status === 200) {
								Tools.Notifications.success(data.notification);
							}

							if (data && data.data) {
								self.applyData(data.data);
							}

							self.isPosting = false;
							self.$.container.boxUnBusy();

							resolve(cmp_data);
						});
						return null;
					})
					.catch(function (err) {
						if (typeof err.message === "string" && err.message != "") {
							try {
								let msg = JSON.parse(err.message);
								if (typeof msg === "object") {
									msg = msg.message;
								}
								Tools.Notifications.error(i18n.t(msg));
							} catch (e) {
								Tools.Notifications.error(i18n.t(err.message));
							}
						} else if (
							typeof err.statusText === "string" &&
							err.statusText != ""
						) {
							Tools.Notifications.error(i18n.t(err.statusText));
						} else {
							Tools.Notifications.error("app.core.unsaved-error");
						}
						self.isPosting = false;
						self.$.container.boxUnBusy();
						reject(err);
					});
			});
		};

		if (self.isBusy()) {
			self.$.container.boxBusy();
			self.whenReady().then(function () {
				st();
			});
		} else {
			st();
		}
	});
};
Form.prototype.getField = function (field) {
	var f = this._("_" + field).get(0);
	if (f) {
		return f.get();
	} else {
		return this.originalData[field];
	}
};
Form.prototype.applyData = function (data) {
	this.data = data;
	for (var i = 0; i < this.children.length; i++) {
		this.children[i].setData(data);
	}

	if (this.on && this.on.dataApplied) {
		this.on.dataApplied(this);
	}
};
Form.prototype.set = function (data) {
	for (var i = 0; i < this.children.length; i++) {
		this.children[i].setData(data, true);
	}
};
Form.prototype.applyFieldBinds = function () {
	for (var i = 0; i < this.children.length; i++) {
		this.children[i].applyFieldBinds();
	}
};
Form.prototype.getData = function () {
	var data = JSON.simpleCopy(this.originalData);

	for (var i = 0; i < this.children.length; i++) {
		data.deepMerge(this.children[i].getData());
	}
	return data;
};
Form.prototype.get = Form.prototype.getData;

Form.defaultPost = function (data, url) {
	return Tools.Ajax.completePost(url, data);
};
Form.prototype._ = scopeInterface;
Form.prototype.is = scopeCompare;

Form.Template = Handlebars.templates["form/form"];
Form.Fields = {};

window.Templates.form = Form;

function Filters(scope, container, json) {
	this.scope = scope;
	this.children = [];
	this.container = container;
	this.$ = {};
	this.$.container = $(this.container);
	this.json = json;

	this.gridJson = scope.json;

	this.init();
}
Filters.prototype.init = function () {
	this.html = Filters.Template();
	this.$.html = $(this.html);

	this.filters = [];

	this.$.container.append(this.$.html);

	// Apply selectize to requires columns
	this.autocompleteFilters = this.gridJson.autocompleteFilters || [];
	this.autocompleteAllTextFilters =
		this.gridJson.autocompleteAllTextFilters || false;

	this.setupEvents();

	this.i18n();
};
Filters.prototype.i18n = function () {
	this.$.html.i18n();
};
Filters.prototype.setupEvents = function () {
	var self = this;

	this.$.html.find(".panel-heading").on("click", function () {
		var c = $(this).closest(".filter-container");
		if (c.hasClass("collapsed")) {
			c.find(".panel-body").slideDown(200);
		} else {
			c.find(".panel-body").slideUp(200);
		}
		c.toggleClass("collapsed");
	});

	this.$.html.find(".new-filter").on("click", function () {
		if (self.children.length > 0) self.add(null, null, null, null, true);
		self.add();
	});
	this.$.html.find(".clear-filters").on("click", function () {
		self.removeAll();
	});

	this.$.html.find(".apply-filter").on("click", function () {
		self.scope.refresh(true);
	});

	this.$.count = this.$.html.find('[data-id="filter-count"]');
	this.updateCount();
};
Filters.prototype.get = function () {
	return this.children
		.map(function (f) {
			return f.get();
		})
		.filter(function (f) {
			return (
				f != null &&
				((f.value != null && f.value === f.value) || f.logicalOperator != null)
			);
		});
};
Filters.prototype.getLocalized = function () {
	return this.children
		.map(function (f) {
			return f.getLocalized();
		})
		.filter(function (f) {
			return (
				f != null &&
				((f.value != null && f.value === f.value) || f.logicalOperator != null)
			);
		});
};
Filters.prototype.updateCount = function () {
	if (this.children.length > 0) {
		this.$.count.parent().show();
		this.$.count.text(Math.ceil(this.children.length / 2));
	} else {
		this.$.count.parent().hide();
	}
};
Filters.prototype.removeAll = function () {
	var children = [...this.children];
	children.forEach((f) => f.remove());
	// this.children.splice(0, 0);
	this.updateCount();
};
Filters.prototype.remove = function (filter) {
	this.children.splice(this.children.indexOf(filter), 1);
	this.updateCount();
};
Filters.prototype.fixLevels = function () {
	let min = Math.min(...this.children.map((c) => c.level));
	if (min > 0) {
		for (let c of this.children) {
			c.setLevel(c.level - min);
		}
	}
};
Filters.prototype.addSafe = function (
	selected,
	constraint,
	values,
	focusText,
	isSplit,
	level = 0
) {
	if (this.children.length > 0) this.add(null, null, null, null, true);
	this.add(selected, constraint, values, focusText, isSplit, level);
};
Filters.prototype.add = function (
	selected,
	constraint,
	values,
	focusText,
	isSplit,
	level = 0
) {
	if (isSplit) {
		var nfhr = new FilterHR(
			this,
			this.$.html.find(".container"),
			this.json,
			values,
			level
		);
		this.children.push(nfhr);
		return;
	}

	var nf = new Filter(
		this,
		this.$.html.find(".container"),
		this.json,
		selected,
		constraint,
		values,
		(f) =>
			this.autocompleteAllTextFilters ||
			this.autocompleteFilters.indexOf(f) > -1,
		level
	);
	this.children.push(nf);
	// add to filters
	var c = this.$.container.find(".filter-container");

	if (c.hasClass("collapsed")) {
		c.find(".panel-body").slideDown(200);
		c.removeClass("collapsed");
	}
	this.updateCount();
	if (focusText) {
		nf.$.html.find(".filter-value input").first().focus();
	}
};

Filters.prototype.is = scopeCompare;
Filters.prototype._ = scopeInterface;

Filters.Template = Handlebars.templates["grid/filters"];

window.Templates.filters = Filters;

function Filter(
	scope,
	container,
	json,
	selected,
	currentConstraint,
	values,
	shouldAutocomplete,
	level
) {
	this.scope = scope;
	this.container = container;
	this.$ = {};
	this.$.container = $(this.container);
	this.json = json;

	this.grid = this._("^grid")[0];
	this.shouldAutocomplete = shouldAutocomplete;

	this.selected = selected;

	this.currentField = null;
	this.currentType = null;
	this.currentConstraint = currentConstraint || null;
	this.currentValues = [];
	this.level = level;

	this.initialValues = values || null;

	this.init();
}

Filter.prototype.init = function () {
	var self = this;
	this.html = Filters.Template(this.json, {
		data: {
			filter: true,
			selected: this.selected,
		},
	});

	this.$.html = $(this.html);
	this.$.container.append(this.$.html);
	this.$.constraint = this.$.html.find(".constraint-container");

	this.initPromise = new Promise((res) => res());

	this.makeHandlers();

	this.typemap = {};
	this.filterTypes = ["string", "date", "number", "boolean"];
	for (var i = 0; i < this.json.length; i++) {
		this.typemap[this.json[i].field] = this.typemap[this.json[i].field] || {};
		if (this.filterTypes.indexOf(this.json[i].type) > -1) {
			this.typemap[this.json[i].field].type = this.json[i].type;
		} else {
			this.typemap[this.json[i].field].type = this.json[i].subtype;
			this.typemap[this.json[i].field].as = this.json[i].type;
		}
	}

	this.setupDom();

	this.updateConstraints();
	// this.updateInputs();
	// this.i18n();

	if (this.initialValues) {
		this.$.html
			.find(".constraint .filter-value .form-group:not(.hidden) input")
			.each(function (i) {
				var $this = $(this);
				let classes = this.classList;
				if (classes.contains("datesinglepicker")) {
					let val = moment(self.initialValues[i]).format(
						main.formats.date.toUpperCase()
					);
					$(this).data("daterangepicker").setStartDate(val);
					//	$(this).val(val).trigger("change");
				} else if (classes.contains("datetimesinglepicker")) {
					let val = moment(self.initialValues[i]).format(
						main.formats.date.toUpperCase() + " " + main.formats.time
					);
					$(this).data("daterangepicker").setStartDate(val);
				} else if (classes.contains("datetimerangepicker")) {
					let val = moment(self.initialValues[i]).format(
						main.formats.date.toUpperCase() + " " + main.formats.time
					);
					let val1 = moment(self.initialValues[i + 1]).format(
						main.formats.date.toUpperCase() + " " + main.formats.time
					);
					$(this).data("daterangepicker").setStartDate(val);
					$(this).data("daterangepicker").setEndDate(val1);
				} else {
					$(this).val(self.initialValues[i]).trigger("change");
				}
			});
		this.initialValues = null;
	}

	this.setLevel(this.level);
};
Filter.prototype.i18n = function () {
	this.initComponents();
	/*
  this.$.html.find("select").each(function() {
    var s = this.selectize;
    if (!s) return;

    var val = s.getValue();
    s.destroy();
    $(this).val(val);
  });*/

	this.$.html.i18n();

	this.$.html.find("select.constraint-select:not(.selectized)").selectize({
		onDelete: function () {
			return false;
		},
	});
	this.$.html.find("select.field-select:not(.selectized)").selectize({
		onDelete: function () {
			return false;
		},
	});
};
Filter.prototype.get = function () {
	var f = {
		field: this.currentField,
		constraint: this.currentConstraint,
		type: this.currentType,
		value: this.currentValues[0],
		value1: this.currentValues[1] || null,
		level: this.level,
	};

	if (this.typemap[this.currentField].as === "percentage") {
		if (f.value) f.value = f.value / 100;
		if (f.value1) f.value1 = f.value1 / 100;
	}

	return f;
};
Filter.prototype.getAdjacents = function () {
	var i = this.scope.children.indexOf(this);
	return [
		i > 0 ? this.scope.children[i - 1] : null,
		this.scope.children[i + 1] || null,
	];
};
Filter.prototype.setLevel = function (level) {
	console.log(level);
	this.level = level;
	this.$.html.css({
		//	"margin-left": this.level * 20 + "px",
		//	background: `rgba(0, 0, 0, ${this.level * 0.2})`,
		"border-left": `${this.level * 20}px solid rgba(0,0,0,${this.level * 0.1})`,
	});
};
Filter.prototype.getLocalized = function () {
	var f = this.get();
	f.localization = this.$.html
		.find(".constraint")
		.not(".hidden")
		.find(".constraint-select option:selected")
		.text();

	return f;
};
Filter.prototype.initComponents = function () {
	this.$.html.find(".datetimesinglepicker").each(function () {
		if (this.value && $(this).data("daterangepicker")) {
			var old = moment(
				this.value,
				$(this).data("daterangepicker").locale.format
			);
		}

		var format = JSON.simpleCopy(
			i18n.t("components.daterangepicker.locale", { returnObjectTrees: true })
		);
		format.format = i18n.t("formats.datetime");

		$(this).daterangepicker({
			locale: {
				format: main.formats.date.toUpperCase() + " " + main.formats.time,
			},
			timePicker24Hour: true,
			autoUpdateInput: true,
			showWeekNumbers: true,
			singleDatePicker: true,
			timePicker: true,
			showDropdowns: true,
		});

		if (old) {
			this.value = old.format($(this).data("daterangepicker").locale.format);
		}
	});

	this.$.html.find(".datesinglepicker").each(function () {
		if (this.value && $(this).data("daterangepicker")) {
			var old = moment(
				this.value,
				$(this).data("daterangepicker").locale.format
			);
		}

		var format = JSON.simpleCopy(
			i18n.t("components.daterangepicker.locale", { returnObjectTrees: true })
		);
		format.format = i18n.t("formats.date");

		$(this).daterangepicker({
			locale: {
				format: main.formats.date.toUpperCase(),
			},
			autoUpdateInput: true,
			showWeekNumbers: true,
			singleDatePicker: true,
			showDropdowns: true,
		});

		if (old) {
			this.value = old.format($(this).data("daterangepicker").locale.format);
		}
	});

	this.$.html.find(".datetimerangepicker").each(function () {
		if (this.value && $(this).data("daterangepicker")) {
			var old_s = moment($(this).data("daterangepicker").startDate);
			var old_e = moment($(this).data("daterangepicker").endDate);
		}

		var format = JSON.simpleCopy(
			i18n.t("components.daterangepicker.locale", { returnObjectTrees: true })
		);
		format.format = i18n.t("formats.datetime");

		$(this).daterangepicker({
			locale: {
				format: main.formats.date.toUpperCase() + " " + main.formats.time,
			},
			startDate: moment().hour(0).minute(0),
			endDate: moment().hour(23).minute(45),
			timePicker24Hour: true,
			autoUpdateInput: true,
			timePickerIncrement: 15,
			showWeekNumbers: true,
			timePicker: true,
			showDropdowns: true,
			linkedCalendars: false,
		});

		if (old_s && old_e) {
			$(this).data("daterangepicker").setStartDate(old_s);
			$(this).data("daterangepicker").setEndDate(old_e);
		}
	});

	if (
		this.currentType === "string" &&
		this.shouldAutocomplete(this.currentField)
	) {
		const field = this.currentField;
		const opts = {
			id: `filterSelect_${field}_${Date.now()}`,
			type: "Select",
			searchUrl: this.scope.scope.settings.url,
			fields: [field],
			valueField: field,
			searchFields: [field],
			resultsTemplate: `<div>{{${field}}}</div>`,
			selectedTemplate: `<div>{{${field}}}</div>`,
			trimNullValues: true,
			allowNull: true,
			ignoreChange: true,
			allowNewOption: true,
			newOptionPrompt: "Pesquisar por ",
		};

		const select = new Form.Fields.Select(
			this,
			this.$.constraint
				.find(".constraint:not(.hidden) .filter-value .form-group")
				.empty(),
			opts
		);

		select.onChange(() => this.updateValues());
		select.set(
			this.currentValues[0] || (this.initialValues && this.initialValues[0])
		);
	}
	this.setupDom();
};
Filter.prototype.makeHandlers = function () {
	const self = this;
	this.handleRemove = (_) => self.removeSelf();
	this.handleUpdateConstraints = (_) => self.updateConstraints();
	this.handleUpdateInputs = (_) => self.updateInputs();
	this.handleUpdateValues = (_) => self.updateValues();
	this.handleRefresh = (ev) => ev.which == 13 && true; //self.grid.refresh(true);
};
Filter.prototype.setupDom = function () {
	var self = this;

	this.$.html
		.find(".rm-fltr")
		.off("click", this.handleRemove)
		.on("click", this.handleRemove);

	this.$.html
		.find(".field-select")
		.off("change", this.handleUpdateConstraints)
		.on("change", this.handleUpdateConstraints);

	this.$.html
		.find(".constraint-select")
		.off("change", this.handleUpdateInputs)
		.on("change", this.handleUpdateInputs);

	this.$.html
		.find("input")
		.off("ifChecked ifUnchecked change", this.handleUpdateValues)
		.on("ifChecked ifUnchecked change", this.handleUpdateValues);

	this.$.html
		.find("input")
		.off("keyup", this.handleRefresh)
		.on("keyup", this.handleRefresh);
};
Filter.prototype.updateConstraints = function () {
	this.currentField = this.$.html.find(".field-select").val();

	this.currentType = this.typemap[this.currentField].type;

	this.$.constraint.empty().append(
		Filters.Template(this.json, {
			data: {
				constraint: true,
				fieldType: this.currentType,
			},
		})
	);

	this.updateInputs();
	this.i18n();
};
Filter.prototype.removeSelf = function () {
	const self = this;
	console.log("removing self");
	const [up, down] = this.getAdjacents();
	let sibling = null;

	self.remove();

	// Filtros s?? t??m liga????es ao mesmo nivel e abaixo
	// Filtros com liga????es t??m sempre uma ao mesmo nivel

	if (up && up.level === this.level) {
		sibling = up.getAdjacents()[0];
		up.remove();
	} else if (down && down.level === this.level) {
		sibling = down.getAdjacents()[1];
		down.remove();
	}

	if (sibling) {
		let adj = sibling.getAdjacents().filter((x) => x);
		if (adj.length === 0) {
			sibling.setLevel(0);
		} else if (adj.length === 1) {
			sibling.setLevel(adj[0].level);
		} else if (adj.length === 2) {
			sibling.setLevel(Math.max(...adj.map((x) => x.level)));
		}
	}

	this.scope.fixLevels();
};
Filter.prototype.remove = function () {
	const self = this;

	self.scope.remove(self);
	this.$.html.slideUp(300, function () {
		self.$.html.remove();
	});
};
Filter.prototype.updateInputs = function () {
	var select = this.$.html
		.find(".constraint")
		.not(".hidden")
		.find("select.constraint-select");
	var _c = select.val();
	if (this._loaded) {
		this.currentConstraint = _c;
	} else {
		this.currentConstraint = this.currentConstraint || _c;
		select.val(this.currentConstraint);
		this._loaded = true;
	}
	var input = {
		string: {
			contains: "string",
			excludes: "string",
			equals: "string",
		},
		date: {
			lessThan: "date",
			greaterThan: "date",
			during: "date-day",
			between: "date-dual",
		},
		number: {
			greaterThan: "number",
			lessThan: "number",
			equals: "number",
			between: "number-dual",
			notEqual: "number",
		},
		boolean: {
			equals: "boolean",
			notEqual: "boolean",
		},
	}[this.currentType][this.currentConstraint];

	this.$.html.find(".filter-value").children().addClass("hidden");

	this.$.html
		.find(".filter-value")
		.children(".filter-" + input)
		.removeClass("hidden");
	this.updateValues();
};
Filter.prototype.updateValues = function () {
	var self = this;
	this.currentValues = [];
	this.$.html
		.find(".filter-value")
		.children()
		.not(".hidden")
		.find("input.filter-val")
		.each(function () {
			if ($(this).data("daterangepicker")) {
				self.currentValues.push(
					$(this).data("daterangepicker").startDate.format()
				);
				if ($(this).is(".datetimerangepicker"))
					self.currentValues.push(
						$(this).data("daterangepicker").endDate.format()
					);
			} else if (this.type === "number") {
				self.currentValues.push(parseFloat(this.value));
			} else {
				self.currentValues.push(
					this.type === "checkbox" ? this.checked : this.value
				);
			}
		});

	this.$.html.find(".filter-value select").each(function () {
		self.currentValues.push($(this).val());
	});
};

Filter.prototype.is = scopeCompare;
Filter.prototype._ = scopeInterface;

function FilterHR(scope, container, json, values, level) {
	this.scope = scope;
	this.container = container;
	this.$ = {};
	this.$.container = $(this.container);
	this.json = json;

	this.grid = this._("^grid")[0];

	this.logicalOperator = values || "AND";
	this.level = level || 0;

	this.init();
}

FilterHR.prototype.init = function () {
	var self = this;
	this.html = `
		<div style="display:flex;align-items:center;">
			<button style="margin: 0 5px 0 5px" class="btn btn-xs btn-default">
				<i class="fa fa-fw fa-chevron-left"></i>
			</button>
			<span style="margin: 5px;">E3</span>
			<div style="display: inline-block" class="checkbox checkbox-slider--c checkbox-slider-success">
				<label>
					<input ${
						this.logicalOperator === "OR" ? "checked" : ""
					} type="checkbox" data-id="operation">
					<span style="padding-left:22px;"></span>
				</label>
			</div>
			<span style="margin: 5px;">OU3</span>
			<button style="margin-left: 5px;" class="btn btn-xs btn-default">
				<i class="fa fa-fw fa-chevron-right"></i>
			</button>
			<div style="flex-grow:1;">	<hr /> </div>
		</div>
	`;

	this.$.html = $(this.html);
	this.$.container.append(this.$.html);
	this.$.constraint = this.$.html.find(".constraint-container");

	this.setLevel(this.level);
	this.bind();
};
FilterHR.prototype.bind = function () {
	this.$.html.find("input").on("change", (ev) => {
		this.logicalOperator = ev.currentTarget.checked ? "OR" : "AND";
	});
	this.$.html
		.find(".fa-chevron-left")
		.parent()
		.on("click", (_) => {
			if (this.level > 0) {
				this.setLevel(this.level - 1);

				var adjacents = this.getAdjacents();

				for (const a of adjacents) {
					if (a === null) continue;
					let aa = a.getAdjacents().map((x) => (x === null ? -1 : x.level));
					a.setLevel(Math.max(...aa));
				}
			}
		});

	this.$.html
		.find(".fa-chevron-right")
		.parent()
		.on("click", (_) => {
			console.log("stuff", this.scope.children);
			var adjacents = this.getAdjacents();
			var siblings = adjacents.flatMap((a) => a.getAdjacents());
			var edges = [siblings[0], siblings[3]];

			if (
				this.level > 0 &&
				Math.max(...edges.map((x) => (x === null ? -1 : x.level))) < this.level
			)
				return;

			this.setLevel(this.level + 1);

			console.log(adjacents);
			for (const a of adjacents) {
				console.log(a.level, this.level);
				if (a.level < this.level) a.setLevel(this.level);
			}
		});
};

FilterHR.prototype.setLevel = function (level) {
	this.level = level;
	this.$.html.css({
		//	"margin-left": this.level * 20 + "px",
		//	background: `rgba(0, 0, 0, ${this.level * 0.2})`,
		"border-left": `${this.level * 20}px solid rgba(0,0,0,${this.level * 0.1})`,
	});
};
FilterHR.prototype.getAdjacents = function () {
	var i = this.scope.children.indexOf(this);
	return [
		i > 0 ? this.scope.children[i - 1] : null,
		this.scope.children[i + 1] || null,
	];
};
FilterHR.prototype.i18n = function () {};
FilterHR.prototype.get = function () {
	return {
		logicalOperator: this.logicalOperator,
		level: this.level,
	};
};
FilterHR.prototype.getLocalized = function () {
	return {
		logicalOperator: this.logicalOperator,
		level: this.level,
	};
};
FilterHR.prototype.setupDom = function () {
	var self = this;
};
FilterHR.prototype.remove = function () {
	var self = this;
	console.log("removing HR");
	self.scope.remove(self);
	this.$.html.slideUp(300, function () {
		console.log("removing HR cb");
		self.$.html.remove();
	});
};

FilterHR.prototype.is = scopeCompare;
FilterHR.prototype._ = scopeInterface;

function Grid(scope, container, json, opts) {
	this.scope = scope;
	this.children = [];
	this.opts = opts;
	this.container = container;
	this.view = this._("^view").get(0);
	this.actions = this.view.Actions.grid;

	this.updatePermissions = (_) => this.refresh();
	this.permissions = main.permissions.onChange(this.updatePermissions);

	this.tab = this._("<tab")[0];

	this.$ = {};
	this.$.container = $(this.container);
	this.$.container.data("componentRef", this);

	this.changeListeners = [];

	this.on = {};
	this.on.ready = function () {};

	this.storage = this._("<mainController")[0].storage;

	this.json = JSON.simpleCopy(json);

	this.id = this.json.id;

	var self = this;
	this.init()
		.then(function () {
			self.on.ready(self);
		})
		.catch(function (err) {
			console.error(err);
		});
}
Grid.prototype.init = function () {
	var self = this;
	// merge options
	this.initPromise = new Promise(function (resolve, reject) {
		// Check permissions on Columns
		self.json.fields = self.json.fields.filter((f) => {
			if (!f.permissions) return true;

			var K = Object.keys(f.permissions);
			var userPermissions = main.permissions.get();

			for (let i = 0; i < K.length; i++) {
				if (userPermissions.indexOf(K[i]) === -1) return false;
			}

			return true;
		});

		if (self.json.on) {
			if (self.json.on.ready && self.actions[self.json.on.ready])
				self.on.ready = self.actions[self.json.on.ready];
		}
		self.json.datatable = self.json.datatable || {};
		self.json.datatable.columns = Grid.factory.columns(
			self.json.fields,
			self.actions,
			self
		);

		var settings = {}.deepMerge(Grid.dataTablesDefaults);

		if (self.json.datatable) settings.deepMerge(self.json.datatable);

		self.fixed = 1;
		// Add the buttons as the second column
		if (self.json.buttons && self.json.buttons.length > 0) {
			self.json.datatable.columns.unshift(
				Grid.factory.buttons(self.json.buttons, self)
			);
			settings.colReorder.fixedColumnsLeft = 2;
			self.fixed = 2;
		}

		if (self.json.order) {
			settings.order = self.json.order;
		}

		if (self.json["no-pages"]) {
			self.$.container.addClass("no-pages");
		}

		if (settings.order) {
			settings.order = settings.order.map(function (v) {
				return [v[0] + self.fixed, v[1]];
			});
		} else {
			settings.order = [];
		}

		self.visibles = {};

		self.json.fields
			.filter(function (f) {
				return f.visibility !== "none" && f.field !== undefined;
			})
			.forEach(function (f) {
				self.visibles[f.field] =
					f.visibility !== "hidden" && f.type !== "hidden";
			});

		// Not supported
		// Breaks both cell selection, footers, and causes issues with ColVis
		settings.colReorder = false;

		// Add the checkboxes as the first column
		self.json.datatable.columns.unshift(Grid.factory.checkboxes(self));

		// Build our .get function
		if (!self.view.getUrls()[self.json.getUrl]) {
			/*console.error('Can\'t find "getUrl" for grid.');
      return;*/
			settings.url = self.json.getUrl.fillWith(self.opts);
		} else {
			settings.url = self.view.getUrls()[self.json.getUrl].fillWith(self.opts);
		}
		settings.ajax = Grid.factory.ajaxGet(settings.url, self);

		self.settings = settings;

		if (!self.json.hasOwnProperty("controls")) {
			self.json.controls = JSON.simpleCopy(Grid.defaultControls);
		} else {
			if (self.json.controls !== false)
				self.json.controls = JSON.simpleCopy(Grid.defaultControls).deepMerge(
					self.json.controls
				);
		}

		self.html = Grid.Template(self.json, {
			helpers: {
				getFieldTitle: function (title) {
					try {
						return self.json.fields.find(function (f) {
							return f.field === title;
						}).i18n;
					} catch (e) {
						console.log(e);
					}
				},
			},
		});
		self.$.html = $(self.html);

		self.$.table = self.$.html.filter("table");

		self.$.table.append("<thead></thead>").append("<tfoot><tr></tr></tfoot>");
		self.$.container.append(
			$('<div style="padding: 5px;" class="box">').append(self.$.html)
		);

		self.setupDataTable();

		self.bindLiveEvents();

		self.lastState = self.storage.get("grids." + self.json.id);
		self.currentFontSize = 1;
		if (self.lastState) {
			self.setPage(self.lastState.page);
			self.setVisibility(self.lastState.visibility);
			self.setResultsPerPage(self.lastState.resultsPerPage);
			self.lastState.filters.forEach(function (f) {
				console.log(f.logicalOperator);
				self.filters.add(
					f.field,
					f.constraint,
					f.logicalOperator != null ? f.logicalOperator : [f.value, f.value1],
					null,
					f.logicalOperator != null,
					f.level
				);
			});
			self.$.table[0].style.setProperty(
				"font-size",
				self.lastState.textSize + "em",
				"important"
			);
			self.currentFontSize = self.lastState.textSize;
			try {
				self.setOrder(self.lastState.sort).draw();
			} catch (err) {}
		} else {
			self.lastState = JSON.simpleCopy(self.getState());
		}

		self.processState();

		self.tab.boundElements.forEach(function (h) {
			if (h.componentReady) h.componentReady(self.json.id, self);
		});

		self.firstLoad = true;
		self.deferred = true; //self.json.defer;

		self.i18n();

		self.$.dtWrapper.on("draw.dt", function () {
			self.$.dtWrapper.i18n();
		});

		resolve();
	});

	return this.initPromise;
};
Grid.prototype.eventActions = function (act) {
	var self = this;
	var actions = {
		refresh: function () {
			self.refresh();
		},
	};
	return actions[act];
};
Grid.prototype.bindLiveEvents = function (p) {
	var self = this;
	this.$.search = this.$.container.find(".grid-search > input");
	this.$.search.on("keyup", function (ev) {
		if (ev.which === 13) self.refresh();
	});

	if (!this.json.events) return;

	var alerts = this._("<maincontroller").find(">alertcontroller")[0];
	var actions = this.actions;

	this.json.events.forEach(function (v, k) {
		var _k = k.split(".");
		var ns = _k[0];
		var event = _k[1];
		var action = null;

		if (v[0] === ":") {
			v = v.substring(1);
			action = actions[v];
		} else {
			action = self.eventActions(v);
		}

		if (!action) {
			console.error('No such handler "' + v + '" for event "' + k + '".');
		}

		alerts.on(ns, event, action);
	});
};
Grid.prototype.setPage = function (p) {
	this.dt.api().page(p);
};
Grid.prototype.setVisibility = function (v) {
	var self = this;
	var vis = self.$.html.find(".grid-vis .menu");
	v.forEach(function (v, k) {
		vis
			.children('[data-field="' + k + '"]')
			.find("input")
			.prop("checked", v)
			.trigger("click");
	});
};
Grid.prototype.setOrder = function (o) {
	if (o.length === 0) return;

	return this.dt.api().order(o);
};
Grid.prototype.setResultsPerPage = function (l) {
	this.dt.api().page.len(l);
};
Grid.prototype.onReady = function (callback) {
	var self = this;
	this.initPromise
		.then(function () {
			callback(self);
		})
		.catch(function () {
			console.warn("Error in Grid[ " + self.json.id + " ] onReady.");
		});
};
Grid.prototype.postGet = function () {
	for (var i = 0; i < this.changeListeners.length; i++) {
		this.changeListeners[i](this.getSelected(), this);
	}
};

Grid.prototype.i18n = function () {
	var oLang = i18n.t("plugins.datatables", { returnObjectTrees: true });

	// Change inner language object
	this.dt.fnSettings().oLanguage.deepMerge(oLang);

	// Redraw what little is possible
	this.dt._fnDraw();

	// Manually update other elements without redrawing them (to keep bindings)

	// starting with 'records per page'
	var len = this.$.container.find(".dataTables_length label").get(0);

	// remove all nodes until only the Select is left
	for (var i = 0; len.childNodes.length > 1; ) {
		if (len.childNodes[i].nodeName === "#text") {
			len.removeChild(len.childNodes[i]);
		} else {
			i++;
		}
	}

	var len_menu = len.childNodes[0];

	var len_parts = oLang.sLengthMenu.split("_MENU_");
	var len_after = document.createTextNode(len_parts[1]);

	if (len_parts[0]) {
		var len_before = document.createTextNode(len_parts[0]);
		len.insertBefore(len_before, len_menu);
	}
	if (len_parts[1]) {
		var len_after = document.createTextNode(len_parts[1]);
		len.appendChild(len_after);
	}

	// Handle table headers
	this.$.container.i18n();
};
Grid.prototype.setupDataTable = function () {
	var self = this;

	this.settings.dom =
		'<"table-responsive"t><"footwheel"<"pull-left"i><"pull-right"p><"center-block text-center"l>>';
	this.settings.footerCallback = function (row, data, start, end, display) {
		if (!self.dt) return;

		var api = self.dt.api();
		$(api.table().footer()).html("");
		if (!self.footerData || !self.footers) {
			return;
		}
		self.dt
			.find("tfoot")
			.append(
				$(
					"<tr>" +
						"<td></td>".repeat(
							self.$.dtWrapper.find("thead > tr > th").length
						) +
						"</tr>"
				)
			);

		self.footerData.forEach(function (v) {
			if (self.footers[v.column] === undefined) {
				return;
			}

			var col = api.column(v.column + ":name")[0][0];

			api.column(v.column + ":name").footer("" + v.value + " ");

			var th = $(api.table().footer()).children().children()[col];
			var $th = $(th);

			$th.html(
				(self.footers[v.column].i18n
					? '<div data-i18n="' +
					  self.footers[v.column].i18n +
					  '">' +
					  i18n.t(self.footers[v.column].i18n) +
					  "</div> "
					: "") +
					v.value +
					" "
			);
		});
	};

	if (this.json.groupSelect) {
		let rowGroupClick = function (rows) {
			const $rows = [];
			rows.every(function () {
				$rows.push($(this.node()));
			});

			if ($rows.every(($r) => $r.find(".col_check input").is(":checked"))) {
				$rows.forEach(($r) =>
					$r.find(".col_check input").each(function () {
						this.checked = false;
						$(this).closest("tr").removeClass("selected");
					})
				);
			} else {
				$rows.forEach(($r) =>
					$r.find(".col_check input").each(function () {
						this.checked = true;
						$(this).closest("tr").addClass("selected");
					})
				);
			}

			self.$.dtWrapper
				.find("tbody")
				.trigger("selects.process")
				.trigger("checkbox.process");
		};

		this.settings.rowGroup.startRender = (rows, group) => {
			let $btn = $(`
				<button type="button" class="btn-flat btn btn-xs btn-default">
					${group}
				</button>
			`);
			$btn.on("click", (_) => rowGroupClick(rows));
			return $btn;
		};
	}

	this.dataTable = this.$.table.DataTable(this.settings);
	if (this.json.defaultGroup) {
		let colIndex = self.dataTable
			.column(this.json.defaultGroup + ":name")
			.index();

		self.dataTable.order.fixed({
			pre: self.json["pre-sort"]
				? [
						...self.json["pre-sort"],
						[colIndex, "desc"],
						...self.json["pre-post-sort"],
				  ]
				: [colIndex, "desc"],
		});
		self.dataTable.rowGroup().dataSrc(this.json.defaultGroup).draw("gui");
		this.$.html.find(".grid-row-grouping select").val(this.json.defaultGroup);
	} else {
		this.dataTable.rowGroup().disable();
	}

	this.dt = this.$.table.dataTable();

	window.gg = this.dt;

	this.$.dtWrapper = this.$.table.closest(".dataTables_wrapper");
	this.setupGridTools();
	this.setupEvents();
	this.setupGridFilters();

	// setup search field
	// TODO
};
Grid.prototype.setupGridTools = function () {
	var self = this;
	var $tbody = this.$.table.find("tbody");

	this.selectionMode = "rows";

	// Create a hidden container to copy from
	var copyContainer = document.createElement("textarea");

	this.$.container
		.find(".grid-export .menu > li[data-id]")
		.on("click", function () {
			var data = JSON.simpleCopy(self.lastData);
			var format = $(this).data("id");
			//    data.format = format;

			data.titles = self.json.fields.reduce(function (p, v) {
				p[v.field] = i18n.t(v.i18n);
				return p;
			}, {});

			if (data.hasOwnProperty("start")) delete data.start;
			if (data.hasOwnProperty("draw")) delete data.draw;
			if (data.hasOwnProperty("length")) delete data.length;

			var title = i18n.t(self._("<tab")[0].boundElements[0].json["title-i18n"]);

			if (data.hasOwnProperty("search"))
				data.search = self.filters.getLocalized();

			data.viewTitle = title;

			data.visibility = self.visibles
				.map(function (f, k) {
					return [k, f];
				})
				.filter(function (f) {
					return f[1];
				})
				.map(function (f) {
					return f[0];
				});

			self.$.container.boxBusy();

			Tools.Ajax.defaultPost(self.settings.url, data)
				.then(function (b) {
					var list = [];

					var fieldIndex = {};
					data.fields.forEach(function (field) {
						fieldIndex[field] = self.json.fields.find(function (f) {
							return f.field === field;
						});
					});

					if (format === "csv") {
						// make headers
						list.push(
							data.fields
								.map(function (f) {
									if (data.visibility.indexOf(f) === -1) return false;
									return data.titles[f];
								})
								.filter(function (f) {
									return f !== false;
								})
						);

						// push data
						list = list
							.concat(
								b.data.map(function (d) {
									return data.fields
										.map(function (f) {
											if (data.visibility.indexOf(f) === -1) return false;
											if (fieldIndex[f].type === "date") {
												return moment(d[f]).format(
													i18n.t("app.formats.datetime")
												);
											}

											if (d[f] && d[f]["$id"]) {
												delete d[f]["$id"];
											}

											return d[f];
										})
										.filter(function (f) {
											return f !== false;
										})
										.join(",");
								})
							)
							.join("\n");
					} else if (format === "json") {
						// push data
						var titles = {};
						data.titles.forEach(function (v, k) {
							if (data.visibility.indexOf(k) === -1) return;
							titles[k] = v;
						});
						list = JSON.stringify({
							data: b.data.map(function (d) {
								var o = {};
								data.fields.forEach(function (f) {
									if (data.visibility.indexOf(f) === -1) return;
									o[f] = d[f];
								});
								return o;
							}),
							titles: titles,
						});
					} else if (format === "xlsx") {
						var gnn = function (num) {
							if (num < 1) return "";

							var ltrs = " ABCDEFGHIJKLMNOPQRSTUVWXYZ";

							var str = "";

							while (num > 0) {
								str = ltrs.charAt(num % 26) + str;
								num = (num / 26) | 0;
							}
							return str;
						};
						list = {};

						list[1] = data.fields
							.map(function (f) {
								if (data.visibility.indexOf(f) === -1) return false;
								return {
									value: data.titles[f],
									type: "str",
									s: 2,
								};
							})
							.filter(function (f) {
								return f !== false;
							});
						var ll = {};
						for (var i = 0; i < list[1].length; i++) {
							ll[gnn(i + 1)] = list[1][i];
						}
						list[1] = ll;

						b.data.forEach(function (d, i) {
							i = i + 1; // account for headers
							list[i + 1] = {};
							var j = 1;
							data.fields.forEach(function (f) {
								var type = fieldIndex[f].subtype || fieldIndex[f].type;
								if (data.visibility.indexOf(f) === -1) return;

								if (type === "date") {
									if (d[f] != null) {
										console.log(d[f], moment(d[f]));
										list[i + 1][gnn(j)] = {
											value:
												/*(moment(d[f]).format("X") -
													new Date().getTimezoneOffset() * 60)*/
												moment.utc(d[f]).format("X") / 86400 + 25569,
											type: "d",
										};
									} else {
										list[i + 1][gnn(j)] = {
											value: null,
											type: "d",
										};
									}
								} else if (type === "number") {
									list[i + 1][gnn(j)] = {
										value: d[f],
										type: "n",
									};
								} else if (type === "boolean") {
									list[i + 1][gnn(j)] = {
										value:
											d[f] === true ||
											d[f] === "S" ||
											d[f] === "1" ||
											d[f] === 1
												? 1
												: 0,
										type: "b",
									};
								} else {
									list[i + 1][gnn(j)] = {
										value: d[f],
										type: "str",
									};
								}

								j++;
							});
						});
						list = (function () {
							var zip = new JSZip();

							var xlsx_rels = Grid.Template(
								{ list: list },
								{ data: { xlsx_rels: true } }
							)
								.replace(/^\s+\</g, "<")
								.replace(/\>\s+\</g, "><")
								.replace(/\>\s+$/g, ">");

							zip.file(
								"_rels/.rels",
								new Blob(["\uFEFF" + xlsx_rels], {
									type: "text/xml;charset=utf-8",
								})
							);

							var xlsx_workbook_rels = Grid.Template(
								{ list: list },
								{ data: { xlsx_workbook_rels: true } }
							)
								.replace(/^\s+\</g, "<")
								.replace(/\>\s+\</g, "><")
								.replace(/\>\s+$/g, ">");

							zip.file(
								"xl/_rels/workbook.xml.rels",
								new Blob(["\uFEFF" + xlsx_workbook_rels], {
									type: "text/xml;charset=utf-8",
								})
							);

							var xlsx_content_types = Grid.Template(
								{ list: list },
								{ data: { xlsx_content_types: true } }
							)
								.replace(/^\s+\</g, "<")
								.replace(/\>\s+\</g, "><")
								.replace(/\>\s+$/g, ">");

							zip.file(
								"[Content_Types].xml",
								new Blob(["\uFEFF" + xlsx_content_types], {
									type: "text/xml;charset=utf-8",
								})
							);

							var xlsx_workbook = Grid.Template(
								{ list: list },
								{ data: { xlsx_workbook: true } }
							)
								.replace(/^\s+\</g, "<")
								.replace(/\>\s+\</g, "><")
								.replace(/\>\s+$/g, ">");

							zip.file(
								"xl/workbook.xml",
								new Blob(["\uFEFF" + xlsx_workbook], {
									type: "text/xml;charset=utf-8",
								})
							);

							var xlsx_styles = Grid.Template(
								{ list: list },
								{ data: { xlsx_styles: true } }
							)
								.replace(/^\s+\</g, "<")
								.replace(/\>\s+\</g, "><")
								.replace(/\>\s+$/g, ">");

							zip.file(
								"xl/styles.xml",
								new Blob(["\uFEFF" + xlsx_styles], {
									type: "text/xml;charset=utf-8",
								})
							);

							var xlsx_sheet = Grid.Template(
								{ list: list },
								{ data: { xlsx_sheet: true } }
							)
								.replace(/^\s+\</g, "<")
								.replace(/\>\s+\</g, "><")
								.replace(/\>\s+$/g, ">");

							zip.file(
								"xl/worksheets/sheet.xml",
								new Blob(["\uFEFF" + xlsx_sheet], {
									type: "text/xml;charset=utf-8",
								})
							);

							zip.generateAsync({ type: "blob" }).then(function (data) {
								download(
									data,
									title + ".xlsx",
									"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
								);
								self.$.container.boxUnBusy();
							});
						})();
						return;
					}

					download(
						list,
						title + "." + format,
						{
							html: "text/html",
							xls: "application/vnd.ms-excel",
							xlsx:
								"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
							xml: "application/vnd.ms-excel",
							csv: "plain/text",
							pdf: "application/pdf",
						}[format]
					);
					self.$.container.boxUnBusy();
				})
				.catch(function () {
					console.warn("err", arguments);
				});
		});
	var $prompt = this.$.html.find(".grid-copy-prompt");
	copyContainer.addEventListener("focus", function () {
		this.select();
		if ($(this).val().length > 0) $prompt.addClass("active");
	});
	copyContainer.addEventListener("blur", function () {
		$prompt.removeClass("active");
	});
	self.allSelected = false;
	var $status = self.$.container.find(".select-everything");
	$status.on("click", "a", function () {
		if (!self.allSelected) {
			self.allSelected = true;
			$status
				.html(
					i18n.t("app.grid.selected-all").fillWith({
						selected: self.curPageSize,
						total: self.totalSelectable,
					})
				)
				.addClass("active");

			for (var i = 0; i < self.changeListeners.length; i++) {
				self.changeListeners[i](self.getSelected(), self);
			}
		} else {
			self.allSelected = false;

			$status.addClass("hidden").removeClass("active");
			self.$.dtWrapper
				.find(".col_check input:checked")
				.each(function () {
					this.checked = false;
					$(this).closest("tr").removeClass("selected");
				})
				.closest("tbody")
				.trigger("selects.process")
				.trigger("checkbox.process");
		}
	});
	copyContainer.className = "hiddenCopyField hidden-xs";
	$("body").append(copyContainer);

	// Unselect and clean text from container if user clicks outside
	var tc = this.$.dtWrapper;

	// add only on mode
	var modes = {
		rows: {
			button: this.$.container.find(
				'.grid-select-mode-options > i[data-mode="rows"]'
			),
			start: function () {
				modes.rows.button.addClass("selected");
				$tbody.on("click", "tr", handleRowClick);
				$tbody.addClass("row-select");
			},
			stop: function () {
				modes.rows.button.removeClass("selected");
				$tbody.off("click", "tr", handleRowClick);
				$tbody.removeClass("row-select");
			},
		},
		cells: {
			button: this.$.container.find(
				'.grid-select-mode-options > i[data-mode="cells"]'
			),
			start: function () {
				$tbody.on("mousedown", "td", beginCellSelection);
				$(window).on("mousedown", clearCellSelection);

				$tbody.find("td").eq(self.fixed).addClass("first-selected-cell");

				modes.cells.button.addClass("selected");
				$tbody.addClass("cell-select");
			},
			stop: function () {
				$tbody.off("mousedown", "td", beginCellSelection);
				$(window).off("mousedown", clearCellSelection);

				$tbody
					.find(".td-selected")
					.removeClass("td-selected top bottom left right first-selected-cell");

				modes.cells.button.removeClass("selected");
				$tbody.removeClass("cell-select");
			},
		},
		text: {
			button: this.$.container.find(
				'.grid-select-mode-options > i[data-mode="text"]'
			),
			start: function () {
				modes.text.button.addClass("selected");
			},
			stop: function () {
				modes.text.button.removeClass("selected");
			},
		},
	};
	function clearCellSelection() {
		$tbody
			.find(".td-selected")
			.removeClass("td-selected top bottom left right");
	}
	function beginCellSelection(ev) {
		ev.stopPropagation();

		var $this = $(this);

		if ($this.index() < self.fixed) {
			return;
		}

		if (ev.shiftKey) {
			$(window).on("mouseup", endCellSelection);
			$tbody.on("mouseover", "td", moveCellSelection);
			$this.trigger("mouseover");
			$this.trigger("mouseup");
			return;
		}

		$tbody.find(".first-selected-cell").removeClass("first-selected-cell");
		$this.addClass("first-selected-cell");

		$(window).on("mouseup", endCellSelection);
		$tbody.on("mouseover", "td", moveCellSelection);
		$this.trigger("mouseover");
	}

	function moveCellSelection(ev) {
		var $this = $(this);
		var $other = $tbody.find(".first-selected-cell");
		var lX, hX, lY, hY;
		var oi = $other.index(),
			ti = $this.index(),
			opi = $other.parent().index(),
			tpi = $this.parent().index();
		if (oi > ti) {
			lX = ti;
			hX = oi;
		} else {
			lX = oi;
			hX = ti;
		}
		if (opi > tpi) {
			lY = tpi;
			hY = opi;
		} else {
			lY = opi;
			hY = tpi;
		}

		if (hX < self.fixed) {
			return;
		}

		if (lX < self.fixed) {
			lX = self.fixed;
		}

		$tbody
			.children("tr")
			.children("td.td-selected")
			.removeClass("td-selected top bottom left right");
		$tbody
			.children("tr")
			.slice(lY, hY + 1)
			.each(function (i) {
				var trs = $(this)
					.children("td")
					.slice(lX, hX + 1)
					.addClass("td-selected");
				if (i === 0) {
					trs.addClass("top");
				}
				if (i === hY - lY) {
					trs.addClass("bottom");
				}
				trs.first().addClass("left");
				trs.last().addClass("right");
			});
	}
	function endCellSelection(ev) {
		$(window).off("mouseup", endCellSelection);
		$tbody.off("mouseover", "td", moveCellSelection);
		$tbody.trigger("selects.process");
	}

	this.$.html
		.find(".grid-row-grouping select")
		.on("click", function (ev) {
			ev.stopPropagation();
		})
		.on("change", function (ev) {
			if (this.value === "none") {
				self.dataTable.order.fixed({
					pre: [],
				});
				self.dataTable.rowGroup().disable().draw();
			} else {
				let colIndex = self.dataTable
					.column(self.json.defaultGroup + ":name")
					.index();
				self.dataTable.order.fixed({
					pre: self.json["pre-sort"]
						? [
								...self.json["pre-sort"],
								[colIndex, "desc"],
								...self.json["pre-post-sort"],
						  ]
						: [colIndex, "desc"],
				});
				self.dataTable.rowGroup().enable().dataSrc(this.value).draw("gui");
			}
		});

	var currentSize = 1;
	this.$.html.find(".grid-text-options-options > i").on("click", function (ev) {
		ev.preventDefault();
		ev.stopPropagation();
		var $this = $(this);

		var sizes = [0.7, 0.85, 1, 1.2, 1.5];
		currentSize =
			sizes[
				Math.min(
					sizes.length - 1,
					Math.max(
						0,
						sizes.indexOf(currentSize) +
							($this.data("mode") === "minus" ? -1 : 1)
					)
				)
			];
		self.currentFontSize = currentSize;
		self.$.table[0].style.setProperty(
			"font-size",
			currentSize + "em",
			"important"
		);
		self.processState();

		//fontSize = currentSize + "em !important";
		//self.$.table.css("font-size", currentSize + "em !important");
	});

	this.$.html.find(".grid-select-mode-options > i").on("click", function () {
		var $this = $(this);
		var mode = $this.data("mode");

		if (modes[mode]) {
			modes[self.selectionMode].stop();
			modes[mode].start();
			self.selectionMode = mode;
		}
	});

	$tbody.on("checkbox.process", function () {
		if ($tbody.find('input[type="checkbox"]:not(:checked)').length > 0) {
			self.$.dtWrapper
				.find('thead input[type="checkbox"]')
				.prop("checked", false);
			if ($tbody.find('input[type="checkbox"]:checked').length > 0) {
				self.$.dtWrapper
					.find('thead input[type="checkbox"]')
					.prop("indeterminate", true)
					.data("indeterminate", true);
			} else {
				self.$.dtWrapper
					.find('thead input[type="checkbox"]')
					.prop("indeterminate", false)
					.data("indeterminate", false);
			}
			self.allSelected = false;
			self.$.container
				.find(".select-everything")
				.addClass("hidden")
				.removeClass("active");
		} else {
			self.$.dtWrapper
				.find('thead input[type="checkbox"]')
				.prop("checked", true)
				.prop("indeterminate", false)
				.data("indeterminate", false);
		}
	});
	this.$.dtWrapper.on("draw.dt", function () {
		$tbody.trigger("checkbox.process");
	});

	$tbody.on("change", 'input[type="checkbox"]', function (ev) {
		var $this = $(this);
		var $tr = $this.closest("tr");

		ev.preventDefault();
		ev.stopPropagation();

		if (this.checked) {
			$tr.addClass("selected");
		} else {
			$tr.removeClass("selected");
		}

		$tbody.trigger("selects.process");
		$tbody.trigger("checkbox.process");
	});

	$tbody.on("selects.process", function (ev) {
		// Get this from json
		if (self.selectionMode === "rows") {
			// if rows

			var selects = self.$.dtWrapper.find("tr.selected").toArray();
			var selectIds = [];
			var info = [];
			for (var i = 0; i < selects.length; i++) {
				var pos = self.dt.fnGetPosition(selects[i]);
				var row = self.dt.fnGetData(pos);

				// Ids from selected users. might be useful for multiple deletes
				selectIds.push(row.UserId);

				info.push(
					self.json.fields
						.map(function (v) {
							return v.copyTemplate(row);
						})
						.join("\t")
				);
			}
			copyContainer.value = info.join("\n");
			copyContainer.focus();
			copyContainer.select();
		} else if (self.selectionMode === "cells") {
			// get api
			var api = self.dt.api();

			// get selecteds
			var trs = $tbody
				.find("tr:has(.td-selected)")
				.map(function () {
					var tr = this;
					var $tr = $(tr);

					var rowData = api.row(tr).data();

					return $tr
						.children(".td-selected")
						.map(function () {
							var td = this;

							var colIndex = api.cell(td).index().column;
							var field = api.column(colIndex).dataSrc();

							if (self.colIndex[field].copyTemplate) {
								return self.colIndex[field].copyTemplate(rowData);
							}
						})
						.get()
						.join("\t");
				})
				.get()
				.join("\n");
			copyContainer.value = trs;
			copyContainer.focus();
			copyContainer.select();
		}

		// fire change listeners
		for (var i = 0; i < self.changeListeners.length; i++) {
			self.changeListeners[i](self.getSelected(), self);
		}
	});

	var dt = Date.now();
	var $topCheck = $(
		'<div class="checkboxb checkbox-primary checkbox-inline"><input id="all_cb_' +
			dt +
			'" type="checkbox" /><label for="all_cb_' +
			dt +
			'"></label></div>'
	);
	this.$.dtWrapper.find("thead th:first-child").prepend($topCheck);

	this.$.html
		.find(".grid-status-buttons .grid-select-options > .grid-select-all")
		.on("click", function () {
			self.$.dtWrapper
				.find(".col_check input:not(:checked)")
				.each(function () {
					this.checked = true;
					$(this).closest("tr").addClass("selected");
				})
				.closest("tbody")
				.trigger("selects.process")
				.trigger("checkbox.process");

			if (self.curPageSize < self.totalSelectable)
				self.$.container
					.find(".select-everything")
					.html(
						i18n.t("app.grid.selected-page").fillWith({
							selected: self.curPageSize,
							total: self.totalSelectable,
						})
					)
					.removeClass("hidden");
		});
	this.$.html
		.find(".grid-status-buttons .grid-select-options > .grid-select-none")
		.on("click", function () {
			self.$.dtWrapper
				.find(".col_check input:checked")
				.each(function () {
					this.checked = false;
					$(this).closest("tr").removeClass("selected");
				})
				.closest("tbody")
				.trigger("selects.process")
				.trigger("checkbox.process");
		});
	this.$.html
		.find(".grid-status-buttons .grid-select-options > .grid-select-inverse")
		.on("click", function () {
			self.$.dtWrapper
				.find(".col_check input")
				.each(function () {
					this.checked = !this.checked;
					$(this).closest("tr").toggleClass("selected");
				})
				.closest("tbody")
				.trigger("selects.process")
				.trigger("checkbox.process");
		});

	$topCheck.find("input").on("change", function (ev) {
		if (this.checked && !$(this).data("indeterminate")) {
			self.$.dtWrapper
				.find(".col_check input:not(:checked)")
				.each(function () {
					this.checked = true;
					$(this).closest("tr").addClass("selected");
				})
				.closest("tbody")
				.trigger("selects.process");

			if (self.curPageSize < self.totalSelectable)
				self.$.container
					.find(".select-everything")
					.html(
						i18n.t("app.grid.selected-page").fillWith({
							selected: self.curPageSize,
							total: self.totalSelectable,
						})
					)
					.removeClass("hidden");
		} else {
			this.checked = false;
			self.$.dtWrapper
				.find(".col_check input:checked")
				.each(function () {
					this.checked = false;
					$(this).closest("tr").removeClass("selected");
				})
				.closest("tbody")
				.trigger("selects.process");

			self.allSelected = false;
			self.$.container
				.find(".select-everything")
				.addClass("hidden")
				.removeClass("active");
		}
		$(this).data("indeterminate", false);
	});

	function handleRowClick(ev) {
		var $this = $(this);

		if ($(ev.target).is("a") || $(ev.target).parent().is("a")) return;

		if ($(ev.target).closest("td").index() < self.fixed) return;

		if ($(ev.target).is(".grid-btn")) return;

		if ($this.parent().children("tr.previous").length === 0) {
			$this.parent().children("tr:first").addClass("previous");
		}

		// replication of windows Explorer Selection behaviour
		//   to be honest I'm not a fan of using css classes for row states

		if (ev.shiftKey && ev.ctrlKey) {
			if ($this.hasClass("previous")) {
			} else if ($this.prevAll(".previous").length > 0) {
				$this.prevUntil(".previous").addClass("selected");
				$this.siblings(".previous").addClass("selected");
			} else if ($this.nextAll(".previous").length > 0) {
				$this.nextUntil(".previous").addClass("selected");
				$this.siblings(".previous").addClass("selected");
			}

			$this.addClass("selected");
		} else if (ev.shiftKey) {
			$this.siblings("tr").removeClass("selected");

			if ($this.hasClass("previous")) {
			} else if ($this.prevAll(".previous").length > 0) {
				$this.prevUntil(".previous").addClass("selected");
				$this.siblings(".previous").addClass("selected");
			} else if ($this.nextAll(".previous").length > 0) {
				$this.nextUntil(".previous").addClass("selected");
				$this.siblings(".previous").addClass("selected");
			}
			$this.addClass("selected");
		} else if (ev.ctrlKey) {
			$this.siblings("tr").removeClass("previous");
			$this.toggleClass("selected").addClass("previous");
		} else {
			$this.siblings("tr").removeClass("selected");
			$this.siblings("tr").removeClass("previous");
			$this.addClass("selected").addClass("previous");
		}

		$this
			.parent()
			.children("tr.selected")
			.find('input[type="checkbox"]')
			.prop("checked", true);
		$this
			.parent()
			.children("tr:not(.selected)")
			.find('input[type="checkbox"]')
			.prop("checked", false);

		if (self.$.table.find("td > .checkboxb > input:not(:checked)").length > 0) {
			self.$.table.find("th > .checkboxb > input").prop("checked", false);
		} else {
			self.$.table.find("th > .checkboxb > input").prop("checked", true);
		}

		$tbody.trigger("selects.process");
		$tbody.trigger("checkbox.process");

		ev.preventDefault();
	}

	modes[this.selectionMode].start();
};
Grid.prototype.onChange = function (callback) {
	this.changeListeners.push(callback);
};
Grid.prototype.setupGridFilters = function () {
	var self = this;
	// hijack search input

	// create filter area
	if (!(this.json.noFilters || this.json["no-filters"])) {
		this.$filters = $("<div />");
		this.$.container.children(".box").prepend(this.$filters);
		this.filters = new Filters(this, this.$filters, this.json.fields);
		this.children.push(this.filters);

		// add filter button bindings
		this.$.dtWrapper
			.find("thead th.has-filter")
			.prepend('<i class="glyphicon glyphicon-filter grid-filter"></i>');

		function newFilter(ev) {
			if (self.filters.children.length > 0)
				self.filters.add(null, null, null, null, true);
			self.filters.add(
				self.dt.api().column(this.parentNode).dataSrc(),
				undefined,
				undefined,
				true
			);

			ev.preventDefault();
			ev.stopPropagation();
		}
		this.$.dtWrapper.find("thead .grid-filter").on("click", newFilter);
	}

	var visMenu = this.$.html.find(".grid-status-buttons .grid-vis .menu");
	this.json.fields.forEach(function (v) {
		if (v.visibility !== "none" && v.type !== "hidden") {
			var $html = $(
				"" +
					'<li data-field="' +
					v.field +
					'">' +
					'  <div class="checkbox checkbox-slider--c checkbox-slider-success checkbox-slider-sm">' +
					"    <label>" +
					'      <input type="checkbox"' +
					(v.visibility !== "hidden" ? " checked" : "") +
					">" +
					'      <span class="small" data-i18n="' +
					v.i18n +
					'">  </span>' +
					"    </label>" +
					"  </div>" +
					"</li>"
			);

			$html.find(".checkbox").on("click", function (ev) {
				ev.preventDefault();
				var $this = $(this);
				var $li = $this.closest("li");
				var api = self.dt.api();
				var $check = $li.find("input")[0];

				if (
					self.visibles
						.map(function (v) {
							return v;
						})
						.filter(function (v) {
							return v;
						}).length === 1 &&
					$check.checked
				)
					return false;

				$check.checked = !$check.checked;
				var f = $li.data("field");

				// Get the column API object
				var column = self.dt.api().column(f + ":name");

				// Toggle the visibility
				try {
					column.visible($check.checked);

					if ($check.checked) {
						$(
							$(api.table().footer()).children().children()[column[0][0]]
						).show();
					} else {
						$(
							$(api.table().footer()).children().children()[column[0][0]]
						).hide();
					}

					self.visibles[f] = $check.checked;
				} catch (e) {}

				self.processState();

				$(column.header()).i18n();

				if (!self.json["no-filters"]) {
					self.$.dtWrapper
						.find("thead th.has-filter:not(:has(.grid-filter))")
						.prepend(
							$('<i class="fa fa-fw fa-filter grid-filter"></i>').on(
								"click",
								newFilter
							)
						);
				}
				$this
					.closest("tbody")
					.find(".td-selected")
					.removeClass("td-selected top bottom left right first-selected-cell");
				return false;
			});

			visMenu.append($html);
		}
	});

	this.$.html.find(".grid-status-buttons .fa-refresh").on("click", function () {
		self.refresh();
	});

	var main = self._("<mainController")[0];
	this.$.html.find(".grid-status-buttons .fa-save").on("click", function () {
		var d = self.getState();
		main.storage.set("grids." + self.json.id, d);
		$(this).css("color", appColors["green"]);
		self.lastState = JSON.simpleCopy(d);
	});
};
Grid.prototype.setupSubCompenent = function (
	el,
	opts,
	info,
	data,
	row,
	callback
) {
	var self = this;
	el.find("[data-component]").each(function () {
		var $this = $(this);
		var $controls = $(el).find(".controls");
		var instance = $this.data("component");
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
			self.view.Actions.overrides &&
			self.view.Actions.overrides[comp.override]
		) {
			try {
				comp = self.view.Actions.overrides[comp.override].call(self, comp);
			} catch (e) {
				console.error(e);
			}
		}

		try {
			var component = new tmplt(self, this, comp.opts, info || self.scope.opts);
			self.children.push(component);
		} catch (e) {
			console.error(e);
		}

		if (comp.type === "form" && !opts.readonly) {
			$controls.html(`
        <div data-id="save" class="btn btn-flat btn-success btn-sm">Save</div>
        <div data-id="cancel" class="btn btn-flat btn-default btn-sm">Cancel</div>
      `);
			$controls.find('[data-id="save"]').on("click", function () {
				var $btn = $(this);
				if (!component.validate()) {
					Tools.Notifications.invalidForm();
				} else {
					$btn.boxBusy("black", "transparent", ".75em", "fa-cog");
					$btn.addClass("disabled");
					component
						.post()
						.then(function (res) {
							$btn.removeClass("disabled");
							$btn.boxUnBusy();
							if (res.xhr.status == 200) {
								Tools.Notifications.success(res.xhr.responseText || null);
							} else if (res.xhr.status == 202) {
								Tools.Notifications.info("app.core.processing");
							}
							component.remove();
							el.remove();
							callback && callback();
						})
						.catch(function (err) {
							console.error(err);

							$btn.removeClass("disabled");
							$btn.boxUnBusy();

							//   Tools.Notifications.error( i18n.t(err.message) || JSON.tryParse(err.message));
						});
				}
			});
			$controls.find('[data-id="cancel"]').on("click", function () {
				component.remove();
				el.remove();
				callback && callback();
			});
		} else {
			$controls.html(`
        <div data-id="close" class="btn btn-flat btn-default btn-sm">Close</div>
      `);
			$controls.find('[data-id="close"]').on("click", function () {
				component.remove();
				el.remove();
				callback && callback();
			});
		}
	});
};
Grid.prototype.setupEvents = function () {
	var self = this;

	// setup button events
	this.$.dtWrapper.on(
		"click",
		"button.grid-btn:not(.disabled):not(.disabled-by-permission)",
		function (ev) {
			var pos = self.dt.fnGetPosition($(this).closest("tr").get(0));
			var $btn = $(this);
			var action = $(this).data("btn-name");
			var btn = self.json.buttons.find(function (b) {
				return b.name === action;
			});
			var data = self.dt.fnGetData(pos);

			if (btn.action) {
				if (btn.action.type === "modalComponent") {
				} else if (btn.action.type === "innerComponent") {
					var $tr = $btn.closest("tr");
					var ntr = $(`
          <tr></tr>
          <tr class="inline-component">
            <td colspan="${$tr.children("td").length}">
              <div class="component" data-component="${
								btn.action.opts.component
							}"></div>
              <div class="controls pull-right">
              </div>
            </td>
          </tr>
        `);
					$tr.after(ntr);

					$tr.addClass("inline-open");
					$btn.addClass("disabled");
					self.setupSubCompenent(
						ntr,
						btn.action.opts,
						{
							id: data[btn.action.opts.idField],
						},
						data,
						$tr,
						function () {
							$tr.removeClass("inline-open");
							$btn.removeClass("disabled");
							self.refresh();
						}
					);
				} else if (btn.action.type === "tab") {
					if (btn.action.view) {
						nav.goto({
							section: btn.action.view,
							tab: btn.action.name,
							tid: btn.action.field ? data[btn.action.field] : btn.action.id,
						});
					} else {
						self.view.changeOrMakeTab(
							btn.action.name,
							btn.action.field
								? btn.action.field[0] == "-"
									? "-" + data[btn.action.field.slice(1)]
									: data[btn.action.field]
								: btn.action.id
						);
					}
				} else if (btn.action.type === "api") {
					var url = self.view.getUrl(btn.action.url) || btn.action.url;

					if (!url)
						console.warn(
							'Url "' + url + '" for button "' + btn.name + '" not found.'
						);

					url = url.fillWith({
						id: self.tab.info.tid,
						tab: self.tab.info.name,
						// "context": self.scope.json.id,
						view: nav.getCurrentSection(),
					});

					var grid = self;
					var ids = {
						list: [data[btn.action.field]],
						length: 1,
					};

					var box;
					if (btn.action.text === "delete") {
						box = Tools.Modals.confirmDelete();
					} else if (typeof btn.action.text === "string") {
						box = Tools.Modals.custom({
							message: btn.action.text,
							title: btn.action.title,
							ok: "app.core.ok",
							cancel: "app.core.cancel",
						});
					} else if (typeof btn.action.text === "object") {
						box = Tools.Modals.custom(btn.action.text);
					} else {
						box = Tools.Modals.confirmAction();
					}

					$btn.boxBusy("black", "transparent", ".6em", "fa-cog");
					$btn.addClass("disabled");
					grid.$.container.boxBusy();

					box
						.then(function () {
							Tools.Ajax.completePost(url, ids)
								.then(function (res) {
									grid.$.container.boxUnBusy();
									$btn.removeClass("disabled");
									$btn.boxUnBusy();

									if (btn.action.after === "refresh") grid.refresh();

									if (res.xhr.status == 200) {
										try {
											const data = JSON.parse(res.xhr.responseText);
											if (typeof data === "object") {
												Tools.Notifications.success(data.notification || null);
											} else {
												Tools.Notifications.success(data || null);
											}
										} catch (e) {
											Tools.Notifications.success(res.xhr.responseText || null);
										}
									} else if (res.xhr.status == 202) {
										Tools.Notifications.info("app.core.processing");
									}
								})
								.catch(function (err) {
									console.error(err);
									$btn.removeClass("disabled");
									$btn.boxUnBusy();

									try {
										Tools.Notifications.error(i18n.t(JSON.parse(err.message)));
									} catch (e) {
										Tools.Notifications.error(i18n.t(err.message));
									}

									grid.$.container.boxUnBusy();
								});
						})
						.catch(function () {
							$btn.removeClass("disabled");
							$btn.boxUnBusy();
							grid.$.container.boxUnBusy();
						});
				} else if (btn.action.type === "custom") {
					if (self.actions[btn.action.action]) {
						self.actions[btn.action.action].call(this, data, self, $btn);
					} else {
						console.warn(
							'No custom button handler "' +
								btn.action.action +
								'" for button "' +
								btn.name +
								'".'
						);
					}
				} else {
					console.warn(
						'Unknown action "' +
							btn.action.type +
							'" for button "' +
							btn.name +
							'".'
					);
				}
			} else if (self.actions[action]) {
				self.actions[action].call(this, data, self, $btn);
			}
		}
	);

	// setup processingevent
	this.$.table.on("processing.dt", function (e, settings, processing) {
		if (processing) {
			self.$.dtWrapper.boxBusy();
			self.isbusy = true;

			self.processState();
		} else {
			self.$.dtWrapper.boxUnBusy();
			self.isbusy = false;
		}
	});
};
Grid.prototype.processState = function () {
	if (JSON.stringify(this.lastState) === JSON.stringify(this.getState())) {
		this.$.html.find(".fa-save").css("color", appColors["green"]);
	} else {
		this.$.html.find(".fa-save").css("color", appColors["yellow"]);
	}
};
Grid.prototype.getSelected = function () {
	var self = this;
	var data = [];

	if (this.allSelected && this.filters) {
		return {
			search: this.filters.get(),
			length: this.totalSelectable,
		};
	}

	this.$.dtWrapper.find(".selected").each(function () {
		var pos = self.dt.fnGetPosition(this);
		var row = self.dt.fnGetData(pos);
		if (Array.isArray(row)) return;
		data.push(row);
	});

	return {
		list: data,
		length: data.length,
	};
};
Grid.prototype.getState = function () {
	var page = this.dt.api().page.info();
	return {
		filters: this.filters ? this.filters.get() : [],
		//   page: page.page,
		resultsPerPage: page.length,
		textSize: this.currentFontSize,
		sort: this.dt.api().order(),
		visibility: this.visibles,
	};
};
Grid.prototype.setState = function (state) {};
Grid.prototype.error = function (err) {
	console.error(err);
	var self = this;
	var error = Errors({ type: "Grid", status: err });

	this.$.dtWrapper.boxUnBusy();
	this.$.dtWrapper.prepend(error.html);

	error.html.find(".closebtn").on("click", function () {
		self.isbusy = false;
		error.html.remove();
	});

	error.html.find(".retrybtn").on("click", function () {
		self.refresh(true);
		error.html.remove();
	});
};
Grid.prototype.refresh = function (force) {
	this.deferred = false;
	if ((!this.isbusy && this.dt && this.dt.is(":visible")) || force) {
		this.dt._fnDraw();
		this.$.dtWrapper.find("thead .checkboxb > input").prop("checked", false);
	}
};
Grid.defaultControls = {
	copyPrompt: true,
	selectionModes: {
		rows: true,
		cells: true,
		text: true,
	},
	textOptions: true,
	select: true,
	visibility: true,
	export: true,
	save: true,
	refresh: true,
};
Grid.factory = {
	ajaxGet: function (_url, self) {
		return function (data, callback, settings) {
			if (self.deferred) {
				callback({ data: [] });
				return;
			}
			if (!self.firstLoad) {
				// self.firstLoad = true;
				return;
			}
			// get filters here
			// get sorts here
			// build request

			if (data.order) {
				data.sort = [];
				data.order.forEach(function (v) {
					data.sort.push({
						sortBy: data.columns[v.column].data,
						sortDir: v.dir,
					});
				});
				delete data.order;
			}

			if (data.columns) delete data.columns;

			if (data.search) delete data.search;

			data.fields = self.json.fields.map(function (v) {
				return v.field;
			});

			if (self.footers)
				data.footer = self.footers.map(function (v, k) {
					return {
						column: k,
						operation: v.op,
					};
				});

			if (self.filters) {
				data.search = self.filters.get();
			}

			if (self.json.search && self.$.search) {
				data.query = self.$.search.val();
				data.searchFields = self.json.search;
			}

			self.lastData = data;
			Tools.Ajax.defaultPost(self.settings.url, data)
				.then(function (res) {
					self.footerData = res.footer;

					if (res.recordsFiltered <= data.start) {
						self.dt.api().page("first").draw("gui");
					}

					if (res.columnFormat) {
						res.data.forEach(function (d) {
							res.columnFormat.forEach(function (v) {
								v.column.forEach(function (c) {
									if (c in d) {
										d[c] = strFormat("{0:" + v.inputMask + "}", d[c]);
									}
								});
							});
						});
						res.footer.forEach(function (f) {
							res.columnFormat.forEach(function (v) {
								if (v.column.indexOf(f.column) > -1) {
									f.value = strFormat("{0:" + v.inputMask + "}", f.value);
								}
							});
						});
					}

					self.totalSelectable = res.recordsFiltered;
					self.curPageSize = res.data.length;
					self.lastReceived = res;

					callback(res);

					self.postGet();
				})
				.catch(function (err) {
					console.error(err);
					self.error(err.status);
				});
		};
	},
	checkboxes: function () {
		var html =
			"" +
			'<div class="checkboxb col_check checkbox-primary checkbox-inline">' +
			'  <input id="{{id}}" type="checkbox" /><label for="{{id}}"></label>' +
			"</div>";

		return {
			title: "",
			render: function (data, type, row, meta) {
				return html.fillWith({
					id: "checkbox_row_" + meta.row + "_" + meta.settings.sInstance,
				});
			},
			searchable: false,
			orderable: false,
			width: "15px",
			"min-width": "15px",
		};
	},
	buttons: function (json, self) {
		return {
			title: "<i class='fa fa-gears'></i>",
			render: function (_data, _type, row, _meta) {
				// check for actions/buttonCallback
				var buttonHtml = Grid.Template(
					{ buttons: json },
					{
						data: {
							buttons: true,
							row: row,
							permissions: main.permissions.get(),
						},
					}
				);
				var html = buttonHtml;

				return self.actions && self.actions.buttonCallback
					? self.actions.buttonCallback("<div>" + html + "</div>", row)
					: html;
			},
			searchable: false,
			orderable: false,
			className: "text-center adjust-td",
			width: "1px",
		};
	},
	columns: function (cols, actions, self) {
		var columns = [];
		self.colIndex = {};
		var col, nc;
		for (var i = 0; i < cols.length; i++) {
			col = cols[i];
			self.colIndex[col.field] = col;
			nc = {};
			nc.data = col.field;
			nc.name = col.field;
			nc.className = "";
			nc.className += col.className || "";

			col.copyTemplate = Handlebars.compile(
				col.copyTemplate || "{{" + col.field + "}}"
			);

			if (col.type === "hidden") {
				continue;
			}

			if (col.visibility === "hidden") {
				nc.visible = false;
			} else if (col.visibility === "none") {
				nc.visible = false;
				nc.className += " none";
			}

			if (col["min-width"]) {
				nc.className += " adjust-td";
			}

			if (col.footer) {
				self.footers = self.footers || {};
				self.footers[col.field] = {
					i18n: col.footer["label-i18n"],
					op: col.footer.operation,
				};
			}

			nc["title-i18n"] = col.i18n;

			nc.title = '<span data-i18n="' + nc["title-i18n"] + '"></span>';

			if (col["no-sort"]) {
				nc.orderable = false;
			} else {
				nc.orderable = true;
			}

			nc.className += " type-" + col.type;

			if (!self.json["no-filters"] && col.field && !col["no-filter"]) {
				nc.searchable = nc.orderable && true;
				if (nc.searchable) nc.className += " has-filter";
			}

			if (col.render) {
				if (Array.isArray(col.render)) {
					col.render = col.render.join("");
				}
				if (actions && actions[col.render]) {
					nc.render = actions[col.render];
				} else {
					nc.render = Grid.factory.renderTemplate.call(
						self,
						col.render,
						col.unsafe
					);
				}
			} else if (col.type === "boolean") {
				nc.render = Grid.factory.renderBoolean;
				nc.className += " dt-center";
			} else if (col.type === "string-i18n") {
				nc.render = Grid.factory.renderI18n;
				nc.className = nc.className.replace("has-filter", "");
				//   nc.orderable = false;
				nc.searchable = false;
			} else if (col.type === "date") {
				nc.render = Grid.factory.renderDate;
			} else if (col.type === "datetime") {
				nc.render = Grid.factory.renderDateTime;
			} else if (col.type === "percentage") {
				nc.render = Grid.factory.renderPercentage;
			} else if (col.type === "sparkBar") {
				nc.render = Grid.factory.renderSparkBar(col.color);
			} else if (!col.unsafe) {
				nc.render = Grid.factory.safeRender;
			}

			if (col.isButton) {
				nc.render = Grid.factory.colButton(nc.render, col.buttonOpts, self);
			}

			if (col.callback) {
				if (actions && actions[col.callback]) {
					nc.createdCell = actions[col.callback];
				}
			}

			columns.push(nc);
		}
		return columns;
	},
	colButton: function (render, buttonOpts, self) {
		return (col, type, row) => {
			const btn = Grid.Template(
				{ ...buttonOpts, content: render(col, type, row) },
				{ data: { single_button: true } }
			);

			return buttonOpts.override &&
				self.actions &&
				self.actions[buttonOpts.override]
				? self.actions[buttonOpts.override](btn, col, row)
				: btn;
		};
	},
	safeRender: function (data) {
		if (typeof data === "string") return data.escapeHtml();

		return data;
	},
	escapeHtml: function (text) {
		return text.replace(/[\"&<>]/g, function (a) {
			return {
				'"': "&quot;",
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
			}[a];
		});
	},
	renderTemplate: function (tmplt) {
		var d = {
			helpers: (this.view.Actions && this.view.Actions.helpers) || {},
		};
		var tmplt = Handlebars.compile(tmplt);
		return function (data, type, row) {
			try {
				var a = tmplt(row, d);
			} catch (e) {
				console.error(e);
			}
			return a;
		};
	},
	renderI18n: function (data, type, row) {
		return i18n.t(data);
	},
	renderBoolean: function (data, type, row) {
		if (!data || data === "false") return '<i class="fa fa-fw fa-times">';
		return '<i class="fa fa-fw fa-check">';
	},
	renderSparkBar: function (color) {
		return function (data, type, row) {
			if (data === null) return "";

			var val = data | 0;
			return `
        <div style="width:70px!important;height:20px;padding: 0px 14px;">
          <div class="bar bard" 
            style="text-align:right;width:${Math.max(
							Math.min(val, 100),
							0
						)}%;height:15px;position: relative;"
          >
            <div class="tooltip top" style="z-index: 1000;position:absolute;right: -4px;opacity: 1;margin-top: -8px;">     
              <div class="tooltip-arrow" style="width: 5px;overflow: hidden;right: 1px;left: inherit;bottom: 4px;border-width: 5px 3px 0;">  
              </div>       
              <span class="tooltip-inner" style="color: white;font-size: 9px;font-weight: normal;padding: 1px 4px;"> 
                ${val}%
              </span> 
            </div> 
          </div> 
          <div class="bar" style="width:100%;height:5px;background-color:#eeeeee;border-radius:1px;">
            <div style="width:${Math.max(
							Math.min(val, 100),
							0
						)}%;height: 100%;border-radius:1px;background-color:${color}">
            </div>
          </div>
        </div>
      `;
		};
	},
	renderPercentage: function (data, type, row) {
		return data * 100 + "%";
	},
	renderDate: function (data, type, row) {
		var date = moment.utc(data);
		if (date.isValid()) {
			return date.format(
				main.formats.date.toUpperCase() + " " + main.formats.time
			);
		} else {
			return "-";
		}
	},
	renderDateTime: function (data, type, row) {
		var date = moment.utc(data);
		if (date.isValid()) {
			return date.format(
				main.formats.date.toUpperCase() + " " + main.formats.time
			);
		} else {
			return "-";
		}
	},
};

Grid.prototype.remove = function () {
	main.permissions.offChange(this.updatePermissions);
};
Grid.prototype._ = scopeInterface;
Grid.prototype.is = scopeCompare;

Grid.dataTablesDefaults = {
	order: [],
	rowGroup: {},
	colReorder: {
		fixedColumnsLeft: 1,
	},
	lengthMenu: [
		[10, 25, 50, 100, 150, 10000000],
		[10, 25, 50, 100, 150, "Todos"],
	],
	autoWidth: false,
	processing: true,
	deferLoading: true,
	serverSide: true,
	columns: [
		{
			// default buttons column.
			title: "",
			render: "",
		},
	],
};

Grid.Template = Handlebars.templates["grid/grid"];

window.Templates.grid = Grid;

var Widgets = {};
Widgets.defaultColors = defaultColors;
Widgets.defaultColorPairs = defaultColorPairs;
Widgets.colors2 = [
	"#f44336",
	"#E91E63",
	"#9C27B0",
	"#673AB7",
	"#3F51B5",
	"#2196F3",
	"#03A9F4",
	"#00BCD4",
	"#009688",
	"#4CAF50",
	"#8BC34A",
	"#CDDC39",
	"#FFEB3B",
	"#FFC107",
	"#FF9800",
	"#FF5722",
];

Widgets.chartProto = function () {};
Widgets.chartProto.prototype.init = function () {
	var html = Widgets.Template(this.json, {
		data: {
			chart: true,
		},
	});

	this.$.html = $(html);
	this.$.container.append(this.$.html);
	this.$.container.data("componentRef", this);

	this.$.legend = this.$.html.find(".legend");
	this.$.chart = this.$.html.find(".chart");
	this.$.body = this.$.html.find(".box-body");
	this.$.title = this.$.html.find(".chart-title");

	this.bind();

	this.preInit = false;
	//this.initChart();
};
Widgets.chartProto.prototype.update = function () {
	this.$.chart.empty();

	this.$.title
		.closest(".box-header")
		.children(".box-tools")
		.find(".badge")
		.remove();

	this.$.chart.find(".mini-err").remove();

	if (this.collapsed === "auto") this.$.body.show();

	if (this._d) delete this._d;

	this.initChart();
};
Widgets.chartProto.prototype.get = function (callback) {
	var self = this;

	// ToDo: add filter data

	Tools.Ajax.defaultGet(this.url)
		.then(function (data) {
			callback(data);
		})
		.then(function (err) {
			self.error(err.status);
		});
};
Widgets.chartProto.prototype.error = function (err) {
	this.$.chart.boxUnBusy();
	err = Errors({
		type: "Widget",
		status: err,
	});
	this.$.chart.append(err.html);
	this.bindErrors();
	this.$.title
		.closest(".box-header")
		.children(".box-tools")
		.find(".badge")
		.remove();

	this.$.title
		.closest(".box-header")
		.children(".box-tools")
		.prepend(
			'<span data-i18n="' +
				err.opts["title-i18n"] +
				'" class="badge label-' +
				err.opts.severity +
				'"></span>'
		)
		.i18n();

	if (this.collapsed === "auto") this.$.body.hide();

	this.$.title.i18n();
};
Widgets.chartProto.prototype.bindErrors = function () {
	var self = this;
	this.$.chart
		.find(".closebtn")
		.off()
		.on("click", function () {
			self.$.html.find(".body-toggle").trigger("click");
		});
	this.$.chart
		.find(".retrybtn")
		.off()
		.on("click", function () {
			self.$.html.find(".chart-refresh").trigger("click");
		});
};
Widgets.chartProto.prototype.bind = function () {
	var self = this;
	this.collapsed = "auto";

	$(window).on("resize", function () {
		if (self._d && self.$.chart.is(":visible")) {
			if (self.deferring) {
				self.renderChart();
				self.deferring = false;
			} else {
				Plotly.Plots.resize(self.$.chart[0]);
			}
		} else {
			self.deferring = true;
		}
	});

	this.$.html
		.find(".body-toggle")
		.off()
		.on("click", function () {
			var sc = self.collapsed;
			if (sc === "closed" || (sc === "auto" && self.$.body.is(":hidden"))) {
				self.collapsed = "open";
				$(this).attr("data-collapsed", "open");
				self.$.body.slideDown(300, function () {
					if (self.$.chart.is(":visible")) {
						if (self._d && self.deferring) {
							self.renderChart();
							self.deferring = false;
						} else {
							Plotly.Plots.resize(self.$.chart[0]);
						}
					}
				});
			} else if (
				sc === "open" ||
				(sc === "auto" && !self.$.body.is(":hidden"))
			) {
				self.collapsed = "closed";
				$(this).attr("data-collapsed", "closed");
				self.$.body.slideUp(300);
			}
		})
		.on("contextmenu", function (ev) {
			self.collapsed = "auto";
			$(this).attr("data-collapsed", "auto");
			ev.preventDefault();
		});

	this.$.html
		.find(".chart-refresh")
		.off()
		.on("click", function () {
			self.update();
		});

	this.legendHidden = false;
	this.$.html
		.find(".legend-toggle")
		.removeClass("hidden")
		.off()
		.on("click", function () {
			self.legendHidden = !self.legendHidden;
			if (self.legendHidden) {
				self.$.html.find("g.legend").hide();
			} else {
				self.$.html.find("g.legend").show();
			}
		});
};
Widgets.chartProto.prototype.refresh = function () {
	if (!this.preInit) {
		if (this.$.container.is(":visible")) {
			this.preInit = true;
			this.initChart();
		}
	} else if (this._d && this.deferring && this.$.html.is(":visible")) {
		this.deferring = false;
		this.renderChart();
	}
};

Widgets.Template = Handlebars.templates["widgets/widgets"];

window.Templates.widgets = Widgets;

/**
 * AreaPicker
 */

Form.Fields.AreaPicker = function AreaPicker(scope, container, json) {
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._("^form").get(0);

  this.value = null;
  this.original = {
    fields: []
  };

  this.changeListeners = [];

  this.init();
};
Form.Fields.AreaPicker.prototype.init = function() {
  var html = Form.Template(this.json, {
    data: {
      input: true
    }
  });

  this.$.html = $(html);
  if (this.json.visibility === "hidden")
    this.$.container.parent().addClass("hidden");

  this.$.container.append(this.$.html);
  this.$.cont = this.$.container.find("rsel");

  this.vue = vues.areapicker(this.$.cont[0]);

  // this.bind();
  //this.i18n();
};
Form.Fields.AreaPicker.prototype.bind = function() {
  var self = this;

  this.vue.onChange(function() {
    // check if changed
  });
};
Form.Fields.AreaPicker.prototype.i18n = function() {
  this.vue.setLang(i18n.language);
};
Form.Fields.AreaPicker.prototype.readonly = function(set) {
  if (typeof set === "undefined") return this.isReadOnly;

  this.isReadOnly = !!set;
  this.vue.readonly(this.isReadOnly);
  // this.$.input.attr('readonly', this.isReadOnly);
};
Form.Fields.AreaPicker.prototype.getData = function() {
  var d = {};
  d[this.json.id] = this.get();
  return d;
};
Form.Fields.AreaPicker.prototype.get = function() {
  return {
    fields: this.vue.get()
  };
};
Form.Fields.AreaPicker.prototype.setData = function(data, preventSave) {
  var val = data[this.json.id];
  if (val === null || val === undefined) return;

  if (!this.vue.isValidData(val)) return;

  if (!preventSave) this.original = JSON.parse(JSON.stringify(val));

  this.set(val);
};
Form.Fields.AreaPicker.prototype.set = function(val, silent) {
  this.vue.set(val);

  if (!silent) this.doChanges();
};
Form.Fields.AreaPicker.prototype.isChanged = function() {
  var data = this.get();
  var o = this.original;

  if ((o === null || o.length === 0) && (data === null || data.length === 0)) {
    return false;
  }

  if (data.length !== o.length) {
    return true;
  }
  for (var q = 0; q < data.length; q++) {
    if (data[q].rects.length !== o[q].rects.length) {
      return true;
    }

    if (data[q].name !== o[q].name) {
      return true;
    }

    if (data[q].color !== o[q].color) {
      return true;
    }
    for (var qq = 0; qq < data[q].rects.length; qq++) {
      if (data[q].rects[qq].name !== o[q].rects[qq].name) {
        return true;
      }

      if (data[q].rects[qq].coords.top !== o[q].rects[qq].coords.top) {
        return true;
      }
      if (data[q].rects[qq].coords.bottom !== o[q].rects[qq].coords.bottom) {
        return true;
      }
      if (data[q].rects[qq].coords.left !== o[q].rects[qq].coords.left) {
        return true;
      }
      if (data[q].rects[qq].coords.right !== o[q].rects[qq].coords.right) {
        return true;
      }
    }
  }
  return false;
};
Form.Fields.AreaPicker.prototype.reset = function() {
  this.set(this.original);
};
Form.Fields.AreaPicker.prototype.clear = function() {
  this.value = null;
  this.original = null;

  this.vue.set([]);
  this.clearErrors();
};
Form.Fields.AreaPicker.prototype.clearErrors = function() {
  if (!this._tabli)
    this._tabli = $(
      '[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
    ).parent();

  var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
  if (cerrors.indexOf(this.json.id) > -1) {
    cerrors.splice(cerrors.indexOf(this.json.id), 1);
    if (cerrors.length > 0) {
      this._tabli.attr("data-validation-error", cerrors.join(";"));
    } else {
      this._tabli.removeAttr("data-validation-error");
    }
  }
  this.$.html.closest(".form-group").removeClass("has-error");
};
Form.Fields.AreaPicker.prototype.applyFieldBinds = function() {
  var self = this;
  var B = this.json.binds;
  if (!B) return;

  B.forEach(function(b) {
    var t = self.form._("_" + b.to).get(0);
    // create bind
    t.onChange(function() {
      var get = t.get();
      if ((b.field && get ? get[b.field] : get) == b.value) {
        self.do(b.value, b.do, b.to);
      } else {
        self.do(b.value, b.do, b.to, true);
      }
    });
    // apply it
    var get = t.get();
    if ((b.field && get ? get[b.field] : get) == b.value) {
      self.do(b.value, b.do, b.to);
    } else {
      self.do(b.value, b.do, b.to, true);
    }
  });
};
Form.Fields.AreaPicker.prototype.validate = function() {
  var self = this;
  // check if has validation settings
  if (!this.json.validation) return true;

  var errors = []; // i18n keys

  // setup validation elements
  if (!this._tabli)
    this._tabli = $(
      '[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
    ).parent();

  var val = this.json.validation;
  var value = this.get();

  // validate empty
  if (val.required && (!value || (value + "").trim() === "")) {
    // apply error
    // i18n.t('common.errors.required');
    errors.push("app.errors.required-field");
  } else if (val.regex) {
    // make regexes
    if (!this.regexes) {
      this.regexes = {};

      val.regex.forEach(function(v, k) {
        self.regexes[k] = new RegExp(k);
      });
    }

    var vK = Object.keys(val.regex);
    for (var i = 0; i < vK.length; i++) {
      var k = vK[i];
      var r = self.regexes[k];

      if (!r.test(value)) {
        errors.push(val.regex[k]);
      }
    }
  }

  if (val.custom) {
    (Array.isArray(val.custom) ? val.custom : [val.custom]).forEach(function(
      f
    ) {
      var err;
      if (self.form.actions[f]) {
        err = self.form.actions[f](value, self, val);
        if (err) errors.push(err);
      }
    });
  }
  if (errors.length > 0) {
    self.$.container.closestChildren(".for-error").html(
      errors
        .map(function(v) {
          return i18n.t(v);
        })
        .join("<br>")
    );

    this.$.html.closest(".form-group").addClass("has-error");

    var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
    if (cerrors.indexOf(this.json.id) < 0) {
      if (cerrors[0] === "") cerrors = [];
      cerrors.push(this.json.id);
      this._tabli.attr("data-validation-error", cerrors.join(";"));
    }
    return false;
  }

  // unset errors. set success?
  var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
  if (cerrors.indexOf(this.json.id) > -1) {
    cerrors.splice(cerrors.indexOf(this.json.id), 1);
    if (cerrors.length > 0) {
      this._tabli.attr("data-validation-error", cerrors.join(";"));
    } else {
      this._tabli.removeAttr("data-validation-error");
    }
  }
  this.$.html.closest(".form-group").removeClass("has-error");
  return true;
};
Form.Fields.AreaPicker.prototype.do = function(value, action, context, undo) {
  var self = this;
  if (!this.state) this.state = {};

  // Get previous differences
  var psK = Object.keys(this.state);
  var ps = {}; // previous state
  for (var i = 0; i < psK.length; i++) {
    ps[this.state[psK[i]]] = true;
  }

  if (undo) {
    if (this.state[action + "_" + value + "_" + context]) {
      delete this.state[action + "_" + value + "_" + context];
    } else {
      return;
    }
  } else {
    if (!this.state[action + "_" + value + "_" + context]) {
      this.state[action + "_" + value + "_" + context] = action;
    } else {
      return;
    }
  }

  // Get current differences
  var csK = Object.keys(this.state);
  var cs = {}; // current state
  for (var i = 0; i < csK.length; i++) {
    cs[this.state[csK[i]]] = true;
  }

  // Just making bA as a shortcut for bindActions
  var bA = Form.Fields.AreaPicker.bindActions;

  // reset states
  var aK = Object.keys(bA);
  for (var i = 0; i < aK.length; i++) {
    if (ps[aK[i]]) {
      // if in previous
      if (cs[aK[i]]) {
        // and in current
        continue; // same state. do nothing
      }
      bA[aK[i]][1](this); // not in current. undo
    }

    if (cs[aK[i]]) {
      // if only in current
      bA[aK[i]][0](this); // apply state
    }
  }
};
Form.Fields.AreaPicker.bindActions = {
  disable: [
    function(self) {
      // Do
      self.$.input.prop("disabled", true);
    },
    function(self) {
      // Undo
      self.$.input.prop("disabled", false);
    }
  ],
  hide: [
    function(self) {
      // Do
      self.$.container.parent().addClass("hidden");
    },
    function(self) {
      // Undo
      self.$.container.parent().removeClass("hidden");
    }
  ],
  show: [
    function(self) {
      // Do
      self.$.container.parent().removeClass("hidden");
    },
    function(self) {
      // Undo
      self.$.container.parent().addClass("hidden");
    }
  ]
};
Form.Fields.AreaPicker.prototype.doChanges = function() {
  var changed = this.isChanged();
  var val = this.get();

  if (changed && !this.json.muted) {
    this.$.container.closest(".form-group").addClass("changed");
  } else {
    this.$.container.closest(".form-group").removeClass("changed");
  }

  for (var i = 0; i < this.changeListeners.length; i++) {
    this.changeListeners[i](this.json.id, val, changed);
  }
};
Form.Fields.AreaPicker.prototype.saveData = function() {
  this.original = this.get();
  this.doChanges();
};
Form.Fields.AreaPicker.prototype.refresh = function() {};
Form.Fields.AreaPicker.prototype.onChange = function(callback) {
  if (!this.changeListeners) this.changeListeners = [];

  this.changeListeners.push(callback);
};
Form.Fields.AreaPicker.prototype._ = scopeInterface;
Form.Fields.AreaPicker.prototype.is = function(t) {
  if (t === "*") return true;
  return (
    t.toLowerCase() === "AreaPicker".toLowerCase() ||
    t.toLowerCase() === this.json.id.toLowerCase()
  );
};

/**
 * Button
 */

Form.Fields.Button = function Button(scope, container, json) {
	this.scope = scope;
	this.container = container;
	this.json = json;

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;
	this.form = this._("^form").get(0);

	this.changeListeners = [];
	this._state = {
		readonly: {},
		hidden: {},
	};

	this.actions = this.form.actions;

	this.init();
};
Form.Fields.Button.prototype.init = function () {
	var html = Form.Template(this.json, {
		data: {
			input: true,
		},
	});

	this.$.html = $(html);
	this.$.button = this.$.html;
	if (this.json.visibility === "hidden")
		this.$.container.parent().addClass("hidden");

	this.$.container.append(this.$.html);
	this.bind();
	this.i18n();
};
Form.Fields.Button.prototype.bind = function () {
	var self = this;

	this.updatePermissions = (p) => this.checkPermissions(p);
	main.permissions.bind(this.updatePermissions);

	this.$.container.find("button").on("click", function (ev) {
		if (self.actions && self.actions[self.json.action]) {
			self.actions[self.json.action](self, self.form);
		}
		ev.preventDefault();
	});
};
Form.Fields.Button.prototype.i18n = function () {
	this.$.html.i18n();
};
Form.Fields.Button.prototype.remove = function () {
	main.permissions.offChange(this.updatePermissions);
};
Form.Fields.Button.prototype.checkPermissions = function (userPermissions) {
	if (!this.json.permissions) {
		return;
	}

	Object.keys(this.json.permissions).forEach((k) => {
		const permission = k;
		const state = this.json.permissions[k];
		const hasPermission = userPermissions.indexOf(permission) > -1;

		if (state === "readonly") {
			this.readonly(!hasPermission, permission);
		}
	});
};
Form.Fields.Button.prototype.readonly = function (set, namespace) {
	if (typeof namespace === "undefined" && typeof set === "undefined") {
		return Object.keys(this._state.readonly).reduce(
			(acc, k) => acc || this._state.readonly[k],
			false
		);
	}
	if (typeof set === "undefined") {
		return this._state.readonly[namespace];
	}

	namespace = namespace == null ? "anon" : namespace;

	this._state.readonly[namespace] = set;

	this.isReadOnly = Object.keys(this._state.readonly).reduce(
		(acc, k) => acc || this._state.readonly[k],
		false
	);
	this.$.container.find("button").attr("disabled", this.isReadOnly);
};
Form.Fields.Button.prototype.getData = function () {
	// nop
};
Form.Fields.Button.prototype.get = function () {
	// nop
};
Form.Fields.Button.prototype.setData = function () {
	// nop
};
Form.Fields.Button.prototype.set = function () {
	// nop
};
Form.Fields.Button.prototype.reset = function () {};
Form.Fields.Button.prototype.clear = function () {
	// nop
};
Form.Fields.Button.prototype.applyFieldBinds = function () {
	var self = this;
	var B = this.json.binds;
	if (!B) return;

	B.forEach(function (b) {
		var t = self.form._("_" + b.to).get(0);
		// create bind
		t.onChange(function () {
			if (t.get() === b.value) {
				self.do(b.value, b.do, b.to);
			} else {
				self.do(b.value, b.do, b.to, true);
			}
		});
		// apply it
		if (t.get() === b.value) {
			self.do(b.value, b.do, b.to);
		} else {
			self.do(b.value, b.do, b.to, true);
		}
	});
};
Form.Fields.Button.prototype.do = function (value, action, context, undo) {
	var self = this;
	if (!this.state) this.state = {};

	// Get previous differences
	var psK = Object.keys(this.state);
	var ps = {}; // previous state
	for (var i = 0; i < psK.length; i++) {
		ps[this.state[psK[i]]] = true;
	}

	if (undo) {
		if (this.state[action + "_" + value + "_" + context]) {
			delete this.state[action + "_" + value + "_" + context];
		} else {
			return;
		}
	} else {
		if (!this.state[action + "_" + value + "_" + context]) {
			this.state[action + "_" + value + "_" + context] = action;
		} else {
			return;
		}
	}

	// Get current differences
	var csK = Object.keys(this.state);
	var cs = {}; // current state
	for (var i = 0; i < csK.length; i++) {
		cs[this.state[csK[i]]] = true;
	}

	// Just making bA as a shortcut for bindActions
	var bA = Form.Fields.Button.bindActions;

	// reset states
	var aK = Object.keys(bA);
	for (var i = 0; i < aK.length; i++) {
		if (ps[aK[i]]) {
			// if in previous
			if (cs[aK[i]]) {
				// and in current
				continue; // same state. do nothing
			}
			bA[aK[i]][1](this); // not in current. undo
		}

		if (cs[aK[i]]) {
			// if only in current
			bA[aK[i]][0](this); // apply state
		}
	}
};
Form.Fields.Button.bindActions = {
	disable: [
		function (self) {
			// Do
			self.$.button.prop("disabled", true);
		},
		function (self) {
			// Undo
			self.$.button.prop("disabled", false);
		},
	],
	hide: [
		function (self) {
			// Do
			self.$.container.parent().addClass("hidden");
		},
		function (self) {
			// Undo
			self.$.container.parent().removeClass("hidden");
		},
	],
	show: [
		function (self) {
			// Do
			self.$.container.parent().removeClass("hidden");
		},
		function (self) {
			// Undo
			self.$.container.parent().addClass("hidden");
		},
	],
};
Form.Fields.Button.prototype.validate = function () {
	// stub
};
Form.Fields.Button.prototype.saveData = function () {
	this.original = this.get();
	for (var i = 0; i < this.changeListeners.length; i++) {
		this.changeListeners[i](this.json.id, this.get(), this.isChanged());
	}
};
Form.Fields.Button.prototype.refresh = function () {};
Form.Fields.Button.prototype.isChanged = function () {
	return false;
};
Form.Fields.Button.prototype.onChange = function () {
	// nop
};
Form.Fields.Button.prototype._ = scopeInterface;
Form.Fields.Button.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "Button".toLowerCase() ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

/**
 * Calendar
 */

Form.Fields.Calendar = function Calendar(scope, container, json ){
  this.scope = scope;
  this.children = [];
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._('^form').get(0);

  this.value = null;
  this.original = null;

  this.createdEvents = [];
  this.changedEvents = [];
  this.deletedEvents = [];

  this.visibilityCallbacks = [];

  this.changeListeners = [];

  this.init();
}
Form.Fields.Calendar.prototype.init = function(){
  this.editJSON = {
    "id": "editActivity",
    "fields": {
      "UserId": {
        "id": "UserId",
        "type": "Hidden"
      },
      "Name": {
        "id": "Name",
        "type": "Text",
        "validation": {
          "required": true
        },
        "label-i18n": "components.calendar.name"
      },
      "Description": {
        "id": "Description",
        "type": "WYSIWYG",
        "btns": ['btnGrp-semantic','link','horizontalRule','btnGrp-lists'],
        "height": "150px",
        "label-i18n": "components.calendar.description"
      },
      "StartDate": {
        "id": "StartDate",
        "type": "DateTimePicker",
        "validation": {
          "required": true,
          "custom": "valiDates"
        },
        "label-i18n": "components.calendar.startdate"
      },
      "EndDate": {
        "id": "EndDate",
        "type": "DateTimePicker",
        "validation": {
          "required": true,
          "custom": "valiDates"
        },
        "label-i18n": "components.calendar.enddate"
      },
      "Location": {
        "id": "Location",
        "type": "Select",
        "allowNull": true,
        "allowNewOption": true,
        "label-i18n": "components.calendar.location",
        "icon": "fa fa-fw fa-location-arrow",
        "searchUrl": "/Event/api/event/getlocationName",
        "resultsTemplate": "<div><span style=\"font-style: italic\">{{Location}}</span></div>",
        "selectedTemplate": "<div>{{Location}}</div>",
        "searchFields": [
          "Location"
        ],
        "resultFields": [
          "Location"
        ],
        "valueField": "Location",
        "labelField": "Location",
        "fields": [
          "Location"
        ],
      },
      "Speaker": {
        "id": "Speaker",
        "type": "Select",
        "allowNull": true,
        "allowNewOption": true,
        "label-i18n": "components.calendar.speaker",
        "icon": "fa fa-fw fa-user",
        "searchUrl": "/Event/api/event/getSpeakerName",
        "resultsTemplate": "<div><span style=\"font-style: italic\">{{Speaker}}</span></div>",
        "selectedTemplate": "<div>{{Speaker}}</div>",
        "searchFields": [
          "Speaker"
        ],
        "resultFields": [
          "Speaker"
        ],
        "valueField": "Speaker",
        "labelField": "Speaker",
        "fields": [
          "Speaker"
        ],
      },
      "Subject": {
        "id": "Subject",
        "type": "Select",
        "allowNull": true,
        "allowNewOption": true,
        "label-i18n": "components.calendar.subject",
        "icon": "fa fa-fw fa-credit-card",
        "searchUrl": "/Event/api/event/getSubjectName",
        "resultsTemplate": "<div><span style=\"font-style: italic\">{{Subject}}</span></div>",
        "selectedTemplate": "<div>{{Subject}}</div>",
        "searchFields": [
          "Subject"
        ],
        "resultFields": [
          "Subject"
        ],
        "valueField": "Subject",
        "labelField": "Subject",
        "fields": [
          "Subject"
        ],
      },
      "Cover":{
        "id": "Cover",
        "type": "FileInput",
        "url": "/Event/API/Media/UploadFile",
        "label-i18n": "components.calendar.cover",
        "maxFiles": 1
      },
      "Media":{
        "id": "Media",
        "type": "FileInput",
        "url": "/Event/API/Media/UploadFile",
        "label-i18n": "components.calendar.media",
      },
      "Color": {
        "id": "Color",
        "type": "Select",
        "allowNull": false,
        "label-i18n": "components.calendar.color",
        "icon": "fa fa-fw fa-adjust",
        "validation": {
          "required": true
        },
        "resultsTemplate": "<div class='col-sm-6'>  <div class='fc-event {{value}}'>    <span>{{i18n_t text-i18n}}</span>  </div></div>",
        "selectedTemplate": "<div>  <div class='fc-event {{value}}'>    <span>{{i18n_t text-i18n}}</span>  </div></div>",
        "options": [
          {
            "text-i18n": "components.calendar.red",
            "value": "red"
          },
          {
            "text-i18n": "components.calendar.red-white",
            "value": "red-invert"
          },
          {
            "text-i18n": "components.calendar.green",
            "value": "green"
          },
          {
            "text-i18n": "components.calendar.green-white",
            "value": "green-invert"
          },
          {
            "text-i18n": "components.calendar.blue",
            "value": "blue"
          },
          {
            "text-i18n": "components.calendar.blue-white",
            "value": "blue-invert"
          },
          {
            "text-i18n": "components.calendar.orange",
            "value": "orange"
          },
          {
            "text-i18n": "components.calendar.orange-white",
            "value": "orange-invert"
          },
          {
            "text-i18n": "components.calendar.purple",
            "value": "purple"
          },
          {
            "text-i18n": "components.calendar.purple-white",
            "value": "purple-invert"
          },
          {
            "text-i18n": "components.calendar.black",
            "value": "black"
          },
          {
            "text-i18n": "components.calendar.black-white",
            "value": "black-invert"
          }
        ]
      }
    },
    "tabs": [
      {
        "title-i18n": "components.calendar.details",
        "layout": [
          "Color",
          ["Name","Location"],
          ["Speaker","Subject"],
          ["StartDate","EndDate"],
          "Description"
        ]
      },
      {
        "title-i18n": "components.calendar.media",
        "layout": [
          "Cover",
          "Media"
        ]
      }
    ]
  }

  this.evts = {};

  if( this.json.eventClick && this.form.actions[this.json.eventClick] )
    this.evts['eventClick'] = this.form.actions[this.json.eventClick];

  var html = Form.Template( this.json, {data: {
    input: true
  }});
  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');

  this.$.container.append(this.$.html);
  this.$.input = this.$.container.find('.cal');

  this.$.input.fullCalendar({
    defaultDate: moment(),
    schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
    axisFormat: 'HH:mm',
    timeFormat: 'HH:mm',
    slotLabelFormat:"HH:mm",
    eventLimit: 4,
    contentHeight: window.innerHeight - 120,
    weekNumbers: true,
    editable: this.json.readonly !== undefined ? !this.json.readonly: true,
    defaultView: this.json.views ? this.json.views.split(',')[0].trim() : 'month',
    header:{
      left:   'prev,next title',
      center: '',
      right:  this.json.views || 'month,agendaWeek,agendaDay,listMonth'
    }
  });
  this.fc = this.$.input.fullCalendar.bind(this.$.input);

  this.bind();
  this.i18n();
}
Form.Fields.Calendar.prototype.bind = function(){
  var self = this;
  
  this.onVisible(function(){
    this.fc('option', 'eventResizeStart', function(ev, oEv, m, view){
      if(self.json.readonly)
        return;

      if(view.name === 'month'){
        ev.psHour = ev.start.hours();
        ev.psMinute = ev.start.minutes();
        ev.peHour = ev.end.hours();
        ev.peMinute = ev.end.minutes();
      }
    });    
    this.fc('option', 'eventResize', function(ev, oEv, m, view){
      if(self.json.readonly)
        return;

      if(view.name === 'month'){
        ev.start.hours(ev.psHour);
        delete ev.psHour;
        ev.start.minutes(ev.psMinute);
        delete ev.psMinute;
        ev.end.hours(ev.peHour);
        delete ev.peHour;
        ev.end.minutes(ev.peMinute);
        delete ev.peMinute;
      }else{
        ev.occurrence.startDate = ev.start.toISOString();
        ev.occurrence.endDate = ev.end.toISOString();
      }
    });    
    this.fc('option', 'eventDrop', function(ev){
      if(self.json.readonly)
        return;
      var changedOcc = false;
      
      ev.occurrence.startDate = ev.start.toISOString();
      ev.occurrence.endDate = ev.end.toISOString();
      if( ev.occurrence.original ){
        changedOcc = ( changedOcc 
          || !moment.utc(ev.occurrence.startDate).isSame(moment.utc(ev.occurrence.original.startDate))
          || !moment.utc(ev.occurrence.endDate).isSame(moment.utc(ev.occurrence.original.endDate))
        );

        var occIndex = self.changedEvents.indexOf(ev.occurrence);
        if( changedOcc && occIndex === -1 ){
          self.changedEvents.push(ev.occurrence);
        }
        
        if( !changedOcc && occIndex !== -1 ){
          self.changedEvents.splice(occIndex, 1);
        }
      }
      self.doChanges(); 
    });    
    this.fc('option', 'dayClick', function(date){
      if(self.json.readonly)
        return;
      var html = $('<div><div></div></div>');

      Tools.Modals.customMulti({
        title: 'components.calendar.new-activity',
        ok: 'components.calendar.ok',
        preventClose: true,
        cancel: 'components.calendar.cancel',
        html: html
      }).then(function(btn){
        return ({
          ok:function(){
            if( !form.validate() )
              return false;

            form.setSaved();
            var evt = form.getData();

            var oc = {
              "startDate": evt.StartDate,
              "endDate": evt.EndDate
            };

            var newEv = {
              "occurrences": [oc],
              "color": evt.Color,
              "location": evt.Location,
              "title": evt.Name,
              "description": evt.Description,
              "speaker": evt.Speaker,
              "subject": evt.Subject,
              "cover": evt.Cover,
              "media": evt.MEdia
            };

            self.createdEvents.push(newEv);
            self.createdEvents.push(oc);

            self.activities.push(newEv);

            while( self.children.length > 0 ){
              self.children[0].remove && self.children[0].remove();
              self.children.shift();
            }
            self.doChanges();
            self.fc('refetchEvents');
            bootbox.hideAll()
          }
        })[btn]();
      }).catch(function(err){
        
        while( self.children.length > 0 ){
          self.children[0].remove && self.children[0].remove();
          self.children.shift();
        }
        
      });
      
      var form = new window.Templates.form( self, html.children(), self.editJSON, {});
      form.initPromise.then(function(){
        form.applyData({
          StartDate: moment.utc(date).toISOString(),
          EndDate: moment.utc(date).add(1,'hour').toISOString()
        });
        form.setSaved();
      }).catch(function(err){
        console.error(err);
      })
      self.children.push(form)
    })



    this.fc('option', 'eventClick', function(ev){
      // if no action
      if(self.evts.eventClick){
        self.evts.eventClick.call(this, ev, self);
      }

      if(self.json.readonly)
        return;


      var html = $('<div><div></div></div>');

      Tools.Modals.customMulti({
        title: 'components.calendar.edit-activity',
        ok: 'components.calendar.ok',
        cancel: 'components.calendar.cancel',
        preventClose: true,
        buttons:{
          delete: ['components.calendar.delete', 'pull-left btn-danger'],
          newOcc: ['components.calendar.newOccurrence', 'btn-warning'],
          clone: ['components.calendar.clone', 'btn-info']
        },
        html: html
      }).then(function(btn, close){
        return ({
          newOcc: function(){
            form.setSaved();
            var evt = form.getData();

            var oc = {
              startDate: evt.StartDate,
              endDate: evt.EndDate
            }

            ev.activity.occurrences.push(oc);
            self.doChanges();

            while( self.children.length > 0 ){
              self.children[0].remove && self.children[0].remove();
              self.children.shift();
            }
            self.fc('refetchEvents');
            bootbox.hideAll()
          },
          clone: function(){
            form.setSaved();
            var evt = form.getData();

            var oc = {
              startDate: evt.StartDate,
              endDate: evt.EndDate
            }

            var newEv = {
              "occurrences": [oc],
              "color": evt.Color,
              "location": evt.Location,
              "title": evt.Name,
              "description": evt.Description,
              "speaker": evt.Speaker,
              "subject": evt.Subject,
              "cover": evt.Cover,
              "media": evt.MEdia
            };

            self.createdEvents.push(newEv);
            self.createdEvents.push(oc);

            self.activities.push(newEv);

            while( self.children.length > 0 ){
              self.children[0].remove && self.children[0].remove();
              self.children.shift();
            }
            self.doChanges();
            self.fc('refetchEvents');
            bootbox.hideAll()
          },
          ok:function(){
            if( !form.validate() ){
              return false;
            }
            form.setSaved();
            var evt = form.getData();


            // Check for activity changes
            var changedAct = false;
            
            ev.activity.title = evt.Name;
            ev.activity.description = evt.Description;
            ev.activity.color = evt.Color;
            ev.activity.location = evt.Location;
            ev.activity.speaker = evt.Speaker;
            ev.activity.subject = evt.Subject;
            ev.activity.cover = evt.Cover;
            ev.activity.media = evt.Media;
              
            if( ev.activity.original ){
              changedAct = ( changedAct 
                || ev.activity.title !== ev.activity.original.title
                || ev.activity.description !== ev.activity.original.description
                || ev.activity.color !== ev.activity.original.color
                || ev.activity.location !== ev.activity.original.location
                || ev.activity.speaker !== ev.activity.original.speaker
                || ev.activity.subject !== ev.activity.original.subject
                || JSON.stringify(ev.activity.cover) !== JSON.stringify(ev.activity.original.cover)
                || JSON.stringify(ev.activity.media) !== JSON.stringify(ev.activity.original.media)
              );

              var actIndex = self.changedEvents.indexOf(ev.activity);
              if( changedAct && actIndex === -1 ){
                self.changedEvents.push(ev.activity);
              }
              
              if( !changedAct && actIndex !== -1 ){
                self.changedEvents.splice(actIndex, 1);
              }
            }


            // Check for occurrence changes
            var changedOcc = false;

            ev.occurrence.startDate = evt.StartDate;
            ev.occurrence.endDate = evt.EndDate;
            if( ev.occurrence.original ){
              changedOcc = ( changedOcc 
                || !moment.utc(ev.occurrence.startDate).isSame(moment.utc(ev.occurrence.original.startDate))
                || !moment.utc(ev.occurrence.endDate).isSame(moment.utc(ev.occurrence.original.endDate))
              );

              var occIndex = self.changedEvents.indexOf(ev.occurrence);
              if( changedOcc && occIndex === -1 ){
                self.changedEvents.push(ev.occurrence);
              }
              
              if( !changedOcc && occIndex !== -1 ){
                self.changedEvents.splice(occIndex, 1);
              }
            }

            while( self.children.length > 0 ){
              self.children[0].remove && self.children[0].remove();
              self.children.shift();
            }
            self.doChanges();
            self.fc('refetchEvents')
            bootbox.hideAll()
          },
          delete: function(){
            if( ev.occurrence.original ){
              ev.occurrence.deleted = true;
            }else{
              ev.activity.occurrences.splice(ev.activity.occurrences.indexOf(ev.occurrence), 1);
            }
            
            var isEmpty = ev.activity.occurrences.reduce(function( p, c ){
              return p && !!c.deleted;
            }, true);

            if( isEmpty ){
              if( ev.activity.original ){
                ev.activity.deleted = true;
              }else{
                self.createdEvents.splice(self.createdEvents.indexOf(ev.activity), 1);
              }
            }
            while( self.children.length > 0 ){
              self.children[0].remove && self.children[0].remove();
              self.children.shift();
            }
            self.doChanges();
            self.fc('refetchEvents');
            bootbox.hideAll()
          }
        })[btn]();
      }).catch(function(err){
        while( self.children.length > 0 ){
          self.children[0].remove && self.children[0].remove();
          self.children.shift();
        }
      });
      var form = new window.Templates.form( self, html.children(), self.editJSON, {});
      form.initPromise.then(function(){
        form.applyData({
          Name: ev.title,
          Description: ev.description,
          Speaker: ev.speaker,
          Subject: ev.subject,
          Cover: ev.cover,
          Media: ev.media,
          StartDate: ev.start.toISOString(),
          EndDate: ev.end.toISOString(),
          Color: ev.className[0],
          Location: ev.location
        });
        var ppp = form.getData();
      }).catch(function(err){
        console.error(err);
      });
      self.children.push(form);
    });

  });
}
Form.Fields.Calendar.prototype.i18n = function(){
  this.$.html.i18n();	

  this.onVisible(function(){
    this.fc('option', 'locale', i18n.language);
  });
}
Form.Fields.Calendar.prototype.onVisible = function( cb ){
  if( !this.$.input.is(':visible') )
    this.visibilityCallbacks.push(cb);
  else
    cb.apply(this);
}
Form.Fields.Calendar.prototype.getData = function(){
  var d = {};
  d[this.json.id] = this.get();
  return d;
}
Form.Fields.Calendar.prototype.get = function(){
  var obj = {};

  if( this.json.eventField ){
    obj[this.json.eventField] = this.bgEvent;
  }

  var acts = this.activities.map(function(a){
    return {
      id: a.id,
      color: a.color,
      location: a.location,
      title: a.title,
      description: a.description,
      speaker: a.speaker,
      subject: a.subject,
      cover: a.cover,
      media: a.media,
      deleted: a.deleted,
      occurrences: a.occurrences.map(function(o){
        return {
          id: o.id,
          deleted: o.deleted,
          startDate: o.startDate,
          endDate: o.endDate
        }
      })
    }
  });

  obj[this.json.activitiesField] = acts;

  return obj;
}
Form.Fields.Calendar.prototype.setData = function( d ){
  var data = d[this.json.id];
  if( this.json.eventField ){
    this.bgEvent = data[this.json.eventField];
  }

  var acts = [];
  if( this.json.activitiesField ){
    acts = data[this.json.activitiesField];
    acts.forEach(function(a){
      a.original = {
        title: a.title,
        description: a.description,
        speaker: a.speaker,
        subject: a.subject,
        cover: a.cover,
        media: a.media,
        location: a.location,
        color: a.color
      };

      a.occurrences.forEach(function(o){
        o.original = {
          startDate: o.startDate, 
          endDate: o.endDate 
        }
      });
    });
  }

  this.setBG( this.bgEvent );
  this.set( acts );
}
Form.Fields.Calendar.prototype.setBG = function( val ){
  this.onVisible(function(){
    this.fc( 'removeEvents', function(e){ 
      return e.rendering === "background";
    });
  });

  var newEv = {
    title: val.title,
    description: val.description,
    speaker: val.speaker,
    subject: val.subject,
    cover: val.cover,
    media: val.media,
    start: val.startDate,
    end: val.endDate,
    className: val.color,
    rendering: "background",
    allDay: true,
    location: val.location
  };
  this.onVisible(function(){
    this.fc( 'renderEvent', newEv, true );
    // set initial month
    this.fc( 'gotoDate', newEv.start );
  });
}
Form.Fields.Calendar.prototype.set = function( val ){
  var self = this;
  this.onVisible(function(){
    this.fc( 'removeEvents', function(e){ 
      return e.rendering !== "background";
    });
  });

  this.activities = val;

  this.onVisible(function(){
    
    this.fc('addEventSource', {
      events: function( start, end, timezone, callback ){
        var acts = [];

        self.activities.forEach(function(a){
          if( a.deleted )
            return;

          a.occurrences.forEach(function(o){
            if( o.deleted )
              return;

            var newEv = {
              activity: a,
              occurrence: o,

              title: a.title,
              description: a.description,
              speaker: a.speaker,
              subject: a.subject,
              cover: a.cover,
              media: a.media,
              start: o.startDate,
              end: o.endDate,
              className: a.color,
              location: a.location
            };
            
            acts.push(newEv);
          });
        });

        callback( acts );
      }
    });

    return;
  });

  this.doChanges();
}
Form.Fields.Calendar.prototype.isChanged = function(){
  return ( this.changedEvents.length + this.createdEvents.length + this.deletedEvents.length > 0 )
}
Form.Fields.Calendar.prototype.reset = function(){
  this.set( this.original );
}
Form.Fields.Calendar.prototype.clear = function(){
  this.value = null;
  this.original = null;
  this.$.input.val('');
}
Form.Fields.Calendar.prototype.applyFieldBinds = function(){
}
Form.Fields.Calendar.prototype.validate = function(){
  // stub
}
Form.Fields.Calendar.prototype.saveData = function(){
  // stub
}
Form.Fields.Calendar.prototype.refresh = function(){
  if( !this.$.input.is(':visible') )
    return;
  this.fc('render');
  var cb = null;
  while( cb = this.visibilityCallbacks.shift() ){
    cb.apply(this);
  }
}
Form.Fields.Calendar.prototype.doChanges = function(){
  var changed = this.isChanged();
  var val = this.get();

  if( changed && !this.json.muted ){
    this.$.container.closest('.form-group').addClass('changed');
  }else{
    this.$.container.closest('.form-group').removeClass('changed');
  }

  for( var i = 0 ; i < this.changeListeners.length ; i++ ){
    this.changeListeners[i]( this.json.id, val, changed );
  }
}
Form.Fields.Calendar.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];
  this.changeListeners.push( callback );
}
Form.Fields.Calendar.prototype._ = scopeInterface;
Form.Fields.Calendar.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('Calendar').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};

Form.Fields.CheckboxTree = function CheckboxTree(scope, container, json) {
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._("^form").get(0);

  this.value = null;
  this.original = null;

  this.changeListeners = [];

  //this.init();
};
Form.Fields.CheckboxTree.prototype.init = function() {
  if (!this.$.html) {
    var html = Form.Template(this.json, {
      data: {
        input: true
      }
    });

    this.$.html = $(html);
    if (this.json.visibility === "hidden")
      this.$.container.parent().addClass("hidden");

    this.$.container.append(this.$.html);

    this.$.tree = this.$.container.find(".tree-container");
  }
  this.$.tree.jstree({
    core: {
      data: this.t,
      themes: {
        name: "proton"
      }
    },
    plugins: ["checkbox"]
  });

  this.bind();
  //this.i18n(); It's already translated during init
};
Form.Fields.CheckboxTree.prototype.bind = function() {
  var self = this;
  this.$.tree.bind("select_node.jstree", function(e, data) {
    if (data.node.state.selected && !data.node.state.opened)
      data.instance.toggle_node(data.node);

    for (var i = 0; i < self.changeListeners.length; i++) {
      self.changeListeners[i](self.json.id, self.get(), self.isChanged());
    }
  });
  this.$.tree.bind("deselect_node.jstree", function(e, data) {
    for (var i = 0; i < self.changeListeners.length; i++) {
      self.changeListeners[i](self.json.id, self.get(), self.isChanged());
    }
  });
};
Form.Fields.CheckboxTree.prototype.i18n = function() {
  var tree = this.$.tree.jstree(true).settings.app.core.data;
  var treeArray = [];
  var q = [];
  var p = null;
  for (var i = 0; i < tree.length; i++) {
    q.push(tree[i]);
  }
  while ((p = q.shift())) {
    treeArray.push(p);
    if (p.children) {
      for (var i = 0; i < p.children.length; i++) {
        q.push(p.children[i]);
      }
    }
  }
  for (var i = 0; i < treeArray.length; i++) {
    treeArray[i].text = i18n.t(
      this.json.basei18n +
        this.ioriginal[treeArray[i].data.id][this.json.textField]
    );
  }
  this.$.tree.jstree(true).refresh();
};
Form.Fields.CheckboxTree.prototype.getData = function() {
  var d = {};
  d[this.json.id] = this.get();
  return d;
};
Form.Fields.CheckboxTree.prototype.get = function() {
  if (!this.$.html) return;

  var tree = this.$.tree.jstree(true).get_json();

  var treeArray = [];
  var q = [];
  var p = null;
  for (var i = 0; i < tree.length; i++) {
    q.push(tree[i]);
  }
  while ((p = q.shift())) {
    treeArray.push(p);
    if (p.children) {
      for (var i = 0; i < p.children.length; i++) {
        q.push(p.children[i]);
      }
    }
  }

  var d = JSON.parse(JSON.stringify(this.original));
  var di = {};
  for (var i = 0; i < d.length; i++) {
    di[d[i][this.json.idField]] = d[i];
  }
  for (var i = 0; i < treeArray.length; i++) {
    var id = treeArray[i].data.id;
    var dii = di[id];

    if (treeArray[i].children && treeArray[i].children.length > 0) continue;

    if (treeArray[i].state && treeArray[i].state.selected) {
      dii[this.json.checkedField] = true;
    } else {
      dii[this.json.checkedField] = false;
    }
  }
  return d;
};
Form.Fields.CheckboxTree.prototype.setData = function(data) {
  this.original = data[this.json.id];
  this.ioriginal = {};
  for (var i = 0; i < this.original.length; i++) {
    this.ioriginal[this.original[i][this.json.idField]] = this.original[i];
  }

  this.tdata = JSON.parse(JSON.stringify(this.original));
  this.tindex = {};
  for (var i = 0; i < this.tdata.length; i++) {
    this.tindex[this.tdata[i][this.json.idField]] = this.tdata[i];
  }

  this.t = [];
  var pid;
  var pr;
  this.ts = Date.now() + "_";

  for (var i = 0; i < this.tdata.length; i++) {
    if (this.tdata[i][this.json.checkedField])
      this.tdata[i].state = { selected: this.tdata[i][this.json.checkedField] };

    this.tdata[i].text = i18n.t(
      this.json.basei18n + this.tdata[i][this.json.textField]
    );
    this.tdata[i].data = { id: this.tdata[i][this.json.idField] };
    this.tdata[i].id = this.ts + this.tdata[i][this.json.idField];
    pid = this.tdata[i][this.json.parentField];
    if (pid !== null) {
      this.tdata[i].icon = this.tdata[i].icon || "fa fa-fw fa-file-text-o";
      pr = this.tindex[this.tdata[i][this.json.parentField]];
      if (pr) {
        pr.icon = "fa fa-fw fa-folder-o";
        pr.children = pr.children || [];
        pr.children.push(this.tdata[i]);
      }
    } else {
      this.tdata[i].icon = this.tdata[i].icon || "fa fa-fw fa-file-text-o";
      this.t.push(this.tdata[i]);
    }
  }

  for (var i = 0; i < this.tdata.length; i++) {
    if (this.tdata[i].children && this.tdata[i].children.length > 0)
      delete this.tdata[i].state;
  }

  this.init();
};
Form.Fields.CheckboxTree.prototype.set = function() {
  // nop
};
Form.Fields.CheckboxTree.prototype.isChanged = function() {
  if (!this.$.html) return;
  var d = this.original;
  var g = this.get();
  for (var i = 0; i < d.length; i++) {
    if (d[i][this.json.checkedField] !== g[i][this.json.checkedField]) {
      return true;
    }
  }
  return false;
};
Form.Fields.CheckboxTree.prototype.reset = function() {
  this.$.tree.jstree(true).destroy(false);
  var d = {};
  d[this.json.id] = this.original;
  this.setData(d);
};
Form.Fields.CheckboxTree.prototype.clear = function() {};
Form.Fields.CheckboxTree.prototype.applyFieldBinds = function() {};
Form.Fields.CheckboxTree.prototype.saveData = function() {
  this.original = this.get();
  for (var i = 0; i < this.changeListeners.length; i++) {
    this.changeListeners[i](this.json.id, this.get(), this.isChanged());
  }
};
Form.Fields.CheckboxTree.prototype.validate = function() {};
Form.Fields.CheckboxTree.prototype.refresh = function() {};
Form.Fields.CheckboxTree.prototype.onChange = function(callback) {
  if (!this.changeListeners) this.changeListeners = [];

  this.changeListeners.push(callback);
};
Form.Fields.CheckboxTree.prototype._ = scopeInterface;
Form.Fields.CheckboxTree.prototype.is = function(t) {
  if (t === "*") return true;
  return (
    t.toLowerCase() === "CheckboxTree".toLowerCase() ||
    t.toLowerCase() === this.json.id.toLowerCase()
  );
};

/**
 * CodeInput
 */

Form.Fields.CodeInput = function CodeInput(scope, container, json) {
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._("^form").get(0);

  this.value = null;
  this.original = null;

  this.changeListeners = [];

  this.langs = {
    javascript: "javascript",
    json: { name: "javascript", json: true },
    sql: "text/x-mariadb",
    xml: "xml",
    lua: "lua",
    html: "htmlmixed",
    css: "css",
    text: "text/plain",
    handlebars: { name: "handlebars", base: "text/html" }
  };

  this.init();
};
Form.Fields.CodeInput.prototype.init = function() {
  var self = this;
  var html = Form.Template(this.json, {
    data: {
      input: true
    }
  });
  this.$.html = $(html);
  if (this.json.visibility === "hidden")
    this.$.container.parent().addClass("hidden");

  this.$.container.append(this.$.html);
  this.$.input = this.$.container.find("textarea");

  this.cm = CodeMirror.fromTextArea(this.$.input[0], {
    //   viewportMargin: Infinity,
    mode: this.langs[this.json.language] || this.json.language,
    readOnly: !!this.json.readOnly,
    lineNumbers: true,
    theme: "mdn-like",
    keyMap: "sublime"
  });
  setTimeout(function() {
    self.cm.refresh();
  }, 1500);

  this.bind();
  this.i18n();
};
Form.Fields.CodeInput.prototype.bind = function() {
  var self = this;

  this.cm.on("changes", function() {
    self.value = this.value;
    self.doChanges();
  });
};
Form.Fields.CodeInput.prototype.i18n = function() {
  this.$.html.i18n();
};
Form.Fields.CodeInput.prototype.readonly = function(set) {
  if (typeof set === "undefined") return this.isReadOnly;

  this.isReadOnly = !!set;
  this.cm.setOption("readOnly", this.isReadOnly);
};
Form.Fields.CodeInput.prototype.getData = function() {
  var d = {};
  d[this.json.id] = this.get();
  return d;
};
Form.Fields.CodeInput.prototype.get = function() {
  return this.cm.getValue();
};
Form.Fields.CodeInput.prototype.setData = function(data) {
  this.original = data[this.json.id] || "";
  data[this.json.id] = this.original;
  this.set(this.original);
  this.original = this.get();

  this.doChanges();
};
Form.Fields.CodeInput.prototype.set = function(val) {
  this.value = val;
  this.cm.setValue(val);
  this.doChanges();
};
Form.Fields.CodeInput.prototype.doChanges = function() {
  var changed = this.isChanged();
  var val = this.get();

  if (changed && !this.json.muted) {
    this.$.container.closest(".form-group").addClass("changed");
  } else {
    this.$.container.closest(".form-group").removeClass("changed");
  }

  for (var i = 0; i < this.changeListeners.length; i++) {
    this.changeListeners[i](this.json.id, val, changed);
  }
};
Form.Fields.CodeInput.prototype.isChanged = function() {
  var val = this.get();
  return val !== this.original && !(this.original === null && val === "");
};
Form.Fields.CodeInput.prototype.setLanguage = function(lang) {
  this.cm.setOption("mode", this.langs[lang] || lang);
};
Form.Fields.CodeInput.prototype.setReadOnly = function(readonly) {
  this.cm.setOption("readOnly", readonly);
};
Form.Fields.CodeInput.prototype.reset = function() {
  this.set(this.original);
};
Form.Fields.CodeInput.prototype.clear = function() {
  this.value = null;
  this.original = null;
  this.$.input.val("");
  this.clearErrors();
};
Form.Fields.CodeInput.prototype.clearErrors = function() {
  if (!this._tabli)
    this._tabli = $(
      '[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
    ).parent();

  var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
  if (cerrors.indexOf(this.json.id) > -1) {
    cerrors.splice(cerrors.indexOf(this.json.id), 1);
    if (cerrors.length > 0) {
      this._tabli.attr("data-validation-error", cerrors.join(";"));
    } else {
      this._tabli.removeAttr("data-validation-error");
    }
  }
  this.$.html.closest(".form-group").removeClass("has-error");
};
Form.Fields.CodeInput.prototype.applyFieldBinds = function() {
  var self = this;
  var B = this.json.binds;
  if (!B) return;

  B.forEach(function(b) {
    if (b.to) {
      var t = self.form._("_" + b.to).get(0);
      // create bind
      t.onChange(function() {
        var get = t.get();
        if ((b.field && get ? get[b.field] : get) == b.value) {
          self.do(b.value, b.do, b.to);
        } else {
          self.do(b.value, b.do, b.to, true);
        }
      });
      // apply it
      var get = t.get();
      if ((b.field && get ? get[b.field] : get) == b.value) {
        self.do(b.value, b.do, b.to);
      } else {
        self.do(b.value, b.do, b.to, true);
      }
    } else if (b.target) {
      var t = self;

      t.onChange(function() {
        var get = t.get();
        if ((b.field && get ? get[b.field] : get) == b.value) {
          self.doTo({ type: b.type || "field", target: b.target }, b.do, b.to);
        } else {
          self.doTo(
            { type: b.type || "field", target: b.target },
            b.do,
            b.to,
            true
          );
        }
      });

      var get = t.get();
      if ((b.field && get ? get[b.field] : get) == b.value) {
        self.doTo({ type: b.type || "field", target: b.target }, b.do, b.to);
      } else {
        self.doTo(
          { type: b.type || "field", target: b.target },
          b.do,
          b.to,
          true
        );
      }
    }
  });
};
Form.Fields.CodeInput.prototype.validate = function() {
  var self = this;
  // check if has validation settings
  if (!this.json.validation) return true;

  var errors = []; // i18n keys

  // setup validation elements
  if (!this._tabli)
    this._tabli = $(
      '[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
    ).parent();

  var val = this.json.validation;
  var value = this.get();

  // validate empty
  (Array.isArray(val) ? val : [val]).forEach(function(val) {
    if (val.required && (!value || (value + "").trim() === "")) {
      // apply error
      // i18n.t('common.errors.required');
      errors.push("app.errors.required-field");
    } else if (val.regex) {
      // make regexes
      if (!self.regexes) {
        self.regexes = {};

        val.regex.forEach(function(v, k) {
          self.regexes[k] = new RegExp(k);
        });
      }

      var vK = Object.keys(val.regex);
      for (var i = 0; i < vK.length; i++) {
        var k = vK[i];
        var r = self.regexes[k];

        if (!r.test(value)) {
          errors.push(val.regex[k]);
        }
      }
    }

    if (val.custom) {
      (Array.isArray(val.custom) ? val.custom : [val.custom]).forEach(function(
        f
      ) {
        var err;
        if (self.form.actions[f]) {
          err = self.form.actions[f](value, self, val);
          if (err) errors.push(err);
        }
      });
    }
  });
  if (errors.length > 0) {
    self.$.container.closestChildren(".for-error").html(
      errors
        .map(function(v) {
          return i18n.t(v);
        })
        .join("<br>")
    );

    this.$.html.closest(".form-group").addClass("has-error");

    var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
    if (cerrors.indexOf(this.json.id) < 0) {
      if (cerrors[0] === "") cerrors = [];
      cerrors.push(this.json.id);
      this._tabli.attr("data-validation-error", cerrors.join(";"));
    }
    return false;
  }

  // unset errors. set success?
  var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
  if (cerrors.indexOf(this.json.id) > -1) {
    cerrors.splice(cerrors.indexOf(this.json.id), 1);
    if (cerrors.length > 0) {
      this._tabli.attr("data-validation-error", cerrors.join(";"));
    } else {
      this._tabli.removeAttr("data-validation-error");
    }
  }
  this.$.html.closest(".form-group").removeClass("has-error");
  return true;
};
Form.Fields.CodeInput.prototype.do = function(value, action, context, undo) {
  var self = this;
  if (!this.state) this.state = {};

  // Get previous differences
  var psK = Object.keys(this.state);
  var ps = {}; // previous state
  for (var i = 0; i < psK.length; i++) {
    ps[this.state[psK[i]]] = true;
  }

  if (undo) {
    if (this.state[action + "_" + value + "_" + context]) {
      delete this.state[action + "_" + value + "_" + context];
    } else {
      return;
    }
  } else {
    if (!this.state[action + "_" + value + "_" + context]) {
      this.state[action + "_" + value + "_" + context] = action;
    } else {
      return;
    }
  }

  // Get current differences
  var csK = Object.keys(this.state);
  var cs = {}; // current state
  for (var i = 0; i < csK.length; i++) {
    cs[this.state[csK[i]]] = true;
  }

  // Just making bA as a shortcut for bindActions
  var bA = Form.Fields.CodeInput.bindActions;

  // reset states
  var aK = Object.keys(bA);
  for (var i = 0; i < aK.length; i++) {
    if (ps[aK[i]]) {
      // if in previous
      if (cs[aK[i]]) {
        // and in current
        continue; // same state. do nothing
      }
      bA[aK[i]][1](this); // not in current. undo
    }

    if (cs[aK[i]]) {
      // if only in current
      bA[aK[i]][0](this); // apply state
    }
  }
};
Form.Fields.CodeInput.prototype.doTo = function(target, action, context, undo) {
  var self = this;
  if (!this.targetStates) this.targetStates = {};

  if (!this.targetStates[target.type + "_" + target.target])
    this.targetStates[target.type + "_" + target.target] = {};

  // Get previous differences
  var psK = Object.keys(this.targetStates[target.type + "_" + target.target]);
  var ps = {}; // previous state
  for (var i = 0; i < psK.length; i++) {
    ps[this.targetStates[target.type + "_" + target.target][psK[i]]] = true;
  }

  if (undo) {
    if (
      this.targetStates[target.type + "_" + target.target][
        action + "_" + context
      ]
    ) {
      delete this.targetStates[target.type + "_" + target.target][
        action + "_" + context
      ];
    } else {
      return;
    }
  } else {
    if (
      !this.targetStates[target.type + "_" + target.target][
        action + "_" + context
      ]
    ) {
      this.targetStates[target.type + "_" + target.target][
        action + "_" + context
      ] = action;
    } else {
      return;
    }
  }

  // Get current differences
  var csK = Object.keys(this.targetStates[target.type + "_" + target.target]);
  var cs = {}; // current state
  for (var i = 0; i < csK.length; i++) {
    cs[this.targetStates[target.type + "_" + target.target][csK[i]]] = true;
  }

  // Just making bA as a shortcut for bindActions
  var bA = Form.Fields.CodeInput.bindActions;

  // reset states
  var aK = Object.keys(bA);
  for (var i = 0; i < aK.length; i++) {
    if (ps[aK[i]]) {
      // if in previous
      if (cs[aK[i]]) {
        // and in current
        continue; // same state. do nothing
      }
      bA[aK[i]][1](this, target); // not in current. undo
    }

    if (cs[aK[i]]) {
      // if only in current
      bA[aK[i]][0](this, target); // apply state
    }
  }
};
Form.Fields.CodeInput.bindActions = {
  disable: [
    function(self) {
      self.cm.setOption("readOnly", true);
    },
    function(self) {
      self.cm.setOption("readOnly", false);
    }
  ],
  hide: [
    function(self) {
      // Do
      self.$.container.parent().addClass("hidden");
    },
    function(self) {
      // Undo
      self.$.container.parent().removeClass("hidden");
    }
  ],
  show: [
    function(self, target) {
      // Do
      if (target && target.type === "tab") {
        self.form.$.container
          .find('[data-tab-id="' + target.target + '"]')
          .each(function() {
            var $this = $(this);
            var states = JSON.parse(
              decodeURIComponent($this.attr("data-state-shown") || "") || "[]"
            );
            if (states.indexOf(self.json.id) === -1) {
              states.push(self.json.id);
              $this.attr(
                "data-state-shown",
                encodeURIComponent(JSON.stringify(states))
              );
            }
          });
      } else {
        self.$.container.parent().removeClass("hidden");
      }
    },
    function(self, target) {
      // Undo
      if (target && target.type === "tab") {
        self.form.$.container
          .find('[data-tab-id="' + target.target + '"]')
          .each(function() {
            var $this = $(this);
            var states = JSON.parse(
              decodeURIComponent($this.attr("data-state-shown") || "") || "[]"
            );
            if (states.indexOf(self.json.id) > -1) {
              states.splice(states.indexOf(self.json.id), 1);

              if (states.length === 0) {
                $this.removeAttr("data-state-shown");
              } else {
                $this.attr(
                  "data-state-shown",
                  encodeURIComponent(JSON.stringify(states))
                );
              }
            }
          });
      } else {
        self.$.container.parent().addClass("hidden");
      }
    }
  ]
};
Form.Fields.CodeInput.prototype.saveData = function() {
  this.original = this.get();
  for (var i = 0; i < this.changeListeners.length; i++) {
    this.changeListeners[i](this.json.id, this.get(), this.isChanged());
  }
};
Form.Fields.CodeInput.prototype.refresh = function() {
  if (this.cm) this.cm.refresh();
};
Form.Fields.CodeInput.prototype.onChange = function(callback) {
  if (!this.changeListeners) this.changeListeners = [];
  this.changeListeners.push(callback);
};
Form.Fields.CodeInput.prototype._ = scopeInterface;
Form.Fields.CodeInput.prototype.is = function(t) {
  if (t === "*") return true;
  return (
    t.toLowerCase() === "CodeInput".toLowerCase() ||
    t.toLowerCase() === this.json.id.toLowerCase()
  );
};

/**
 * Component
 */

Form.Fields.Component = function Component(scope, container, json) {
	this.scope = scope;
	this.container = container;
	this.json = json;

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;
	this.form = this._("^form").get(0);

	this.value = null;
	this.original = null;

	this.components = [];
	this.children = [];

	this.changeListeners = [];

	this.init();
};
Form.Fields.Component.prototype.init = function () {
	var html = Form.Template(this.json, {
		data: {
			input: true,
		},
	});

	this.$.html = $(html);
	if (this.json.visibility === "hidden")
		this.$.container.parent().addClass("hidden");

	this.$.container.append(this.$.html);

	if (this.json.autoInit) {
		this.initContent();
	}

	this.bind();
	this.i18n();
};
Form.Fields.Component.prototype.initContent = function (info) {
	var self = this;
	info = info || this.json.info;

	this.$.container.find("[data-component]").each(function () {
		var $this = $(this);
		var instance = $this.data("component");
		var comp = JSON.simpleCopy(window.Instances[instance]);

		if (comp === false) {
			console.error(`Component ${instance} not found`);
		}

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
			self.form.view.Actions.overrides &&
			self.form.view.Actions.overrides[comp.override]
		) {
			try {
				comp = self.form.view.Actions.overrides[comp.override].call(self, comp);
			} catch (e) {
				console.error(e);
			}
		}

		try {
			var component = new tmplt(self, this, comp.opts, info || self.scope.opts);
			self.components.push(component);
			self.children.push(component);
		} catch (e) {
			console.error(e);
		}
	});

	this.components.forEach(function (c) {
		if (c.onChange) {
			c.onChange(function (id, value, changed) {
				for (var i = 0; i < self.changeListeners.length; i++) {
					self.changeListeners[i](c.json.id + "." + id, value, changed);
				}
			});
		}
	});
};
Form.Fields.Component.prototype.bind = function () {
	var self = this;
};
Form.Fields.Component.prototype.i18n = function () {
	this.$.html.i18n();
};
Form.Fields.Component.prototype.getData = function () {
	var d = {};

	if (!this.json.noData) d[this.json.id] = this.get();

	return d;
};
Form.Fields.Component.prototype.get = function () {
	var d = {};
	this.children.forEach(function (c) {
		if (c.getData) d[c.json.id] = c.getData();
	});
	return d;
};
Form.Fields.Component.prototype.setData = function (data) {
	// this inits component?
	var d = data[this.json.id];

	if (d) this.set(d);
};
Form.Fields.Component.prototype.set = function (val) {
	var self = this;
	// init here

	for (var i = 0; i < this.children.length; i++) {
		if (this.children[i].applyData)
			this.children[i].applyData(val[this.children[i].json.id]);
	}
};
Form.Fields.Component.prototype.isChanged = function () {
	for (var i = 0; i < this.children.length; i++) {
		if (this.children[i].isChanged & this.children[i].isChanged()) return true;
	}
	return false;
};
Form.Fields.Component.prototype.reset = function () {
	this.children.forEach(function (c) {
		if (c.reset) c.reset();
	});
};
Form.Fields.Component.prototype.clear = function () {
	this.children.forEach(function (c) {
		if (c.clear) c.clear();
	});
};
Form.Fields.Component.prototype.applyFieldBinds = function () {};
Form.Fields.Component.prototype.validate = function () {
	this.children.forEach(function (c) {
		if (c.validate) if (!c.validate()) return false;
	});
	return true;
};
Form.Fields.Component.prototype.saveData = function () {
	this.children.forEach(function (c) {
		if (c.saveData) c.saveData();
	});
};
Form.Fields.Component.prototype.refresh = function () {
	this.children.forEach(function (c) {
		if (c.refresh) c.refresh();
	});
};
Form.Fields.Component.prototype.onChange = function (callback) {
	if (!this.changeListeners) this.changeListeners = [];

	this.changeListeners.push(callback);
};
Form.Fields.Component.prototype._ = scopeInterface;
Form.Fields.Component.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "Component".toLowerCase() ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

/**
 * Computed
 */

Form.Fields.Computed = function Computed(scope, container, json ){
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._('^form').get(0);

  this.value = null;
  this.original = null;

  this.changeListeners = [];

  this.init();
}
Form.Fields.Computed.prototype.init = function(){
  var html = Form.Template( this.json, {data: {
    input: true
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);
  this.$.input = this.$.container.find('input');

  // input mask
  if( this.json.mask ){
    if( this.json.mask === 'email' ){
      Inputmask({alias:'email',placeholder:'??'}).mask(this.$.input[0]);
    }else{
      Inputmask(this.json.mask).mask(this.$.input[0]);
    }
  }

  this.bind();
  this.i18n();
}
Form.Fields.Computed.prototype.bind = function(){
  var self = this;

  this.$.input.on('input change', function( ev ){
    if( self.json.mask ){
      self.value = this.inputmask.unmaskedvalue().split('??').join('');
    }else{
      self.value = this.value;
    }

    self.validate();

    self.doChanges();
  });
}
Form.Fields.Computed.prototype.i18n = function(){
  this.$.html.i18n();
}
Form.Fields.Computed.prototype.readonly = function(set){
  if( typeof set === 'undefined' )
    return this.isReadOnly;

  this.isReadOnly = !!set;
  this.$.input.attr('readonly', this.isReadOnly);
}
Form.Fields.Computed.prototype.getData = function(){
  var d = {};
  d[this.json.id] = this.get();
  return d;
}
Form.Fields.Computed.prototype.get = function(){
  return this.value;
}
Form.Fields.Computed.prototype.setData = function( data, preventSave ){
  var val = data[ this.json.id ];
  if( val === null || val === undefined )
    return;

  if( !preventSave )
    this.original = val;

  this.set( val );
}
Form.Fields.Computed.prototype.set = function( val, silent ){
  this.value = val;
  this.$.input.val( val );

  if( !silent )
    this.doChanges();
}
Form.Fields.Computed.prototype.isChanged = function(){
  return false; // ?
  var val = this.get();
  return val !== this.original &&
    !(this.original === null && val === '' );
}
Form.Fields.Computed.prototype.reset = function(){
  this.set( this.original );
}
Form.Fields.Computed.prototype.clear = function(){
  this.value = null;
  this.original = null;

  this.$.input.val('');
  
  this.clearErrors();
}
Form.Fields.Computed.prototype.clearErrors = function(){
  if( !this._tabli )
    this._tabli = $('[href="#'+this.$.html.closest('.tab-pane').attr('id')+'"]').parent();

  var cerrors = (this._tabli.attr('data-validation-error') || '').split(';');
  if( cerrors.indexOf(this.json.id) > -1 ){
    cerrors.splice(cerrors.indexOf(this.json.id), 1);
    if(cerrors.length > 0){
      this._tabli.attr('data-validation-error', cerrors.join(';') );
    }else{
      this._tabli.removeAttr('data-validation-error');
    }
  }
  this.$.html.closest('.form-group').removeClass('has-error');
}
Form.Fields.Computed.prototype.applyFieldBinds = function(){
  var self = this;
  var B = this.json.binds;
  if(!B) return;

  B.forEach(function(b){
    if( b.to ){
      var t = self.form._('_'+b.to).get(0);
      // create bind
      t.onChange(function(){
        var get = t.get();
        if( ( b.field && get ? get[b.field] : get ) == b.value ){
          self.do(b.value,b.do, b.to);
        }else{
          self.do(b.value,b.do, b.to, true);
        }
      });
      // apply it
      var get = t.get();
      if( ( b.field && get ? get[b.field] : get ) == b.value ){
        self.do(b.value,b.do, b.to);
      }else{
        self.do(b.value,b.do, b.to, true);
      }
    }else if( b.target ){
      var t = self;

      t.onChange(function(){
        var get = t.get();
        if( ( b.field && get ? get[b.field] : get ) == b.value ){
          self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to);
        }else{
          self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to, true);
        }
      });

      var get = t.get();
      if( ( b.field && get ? get[b.field] : get ) == b.value ){
        self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to);
      }else{
        self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to, true);
      }

    }
  });
}
Form.Fields.Computed.prototype.validate = function(){
  var self = this;
  // check if has validation settings
  if( !this.json.validation )
    return true;

  var errors = []; // i18n keys

  // setup validation elements
  if( !this._tabli )
    this._tabli = $('[href="#'+this.$.html.closest('.tab-pane').attr('id')+'"]').parent();


  var val = this.json.validation;
  var value = this.get();

  // validate empty
  if( val.required && ( !value || (value+'').trim() === '' ) ){
    // apply error
    // i18n.t('common.errors.required');
    errors.push('app.errors.required-field');
  }else if( val.regex ){
    // make regexes
    if( !this.regexes ){
      this.regexes = {};

      val.regex.forEach(function( v, k ){
        self.regexes[k] = new RegExp(k);
      });
    }

    var vK = Object.keys(val.regex);
    for( var i = 0 ; i < vK.length ; i++ ){
      var k = vK[i];
      var r = self.regexes[k];

      if( !r.test(value) ){
        errors.push(val.regex[k]);
      }
    }
  }


  if( val.custom ){
    (Array.isArray(val.custom)?val.custom:[val.custom]).forEach(function(f){
      var err;
      if(self.form.actions[f]){
        err = self.form.actions[f]( value, self, val );
        if( err )
          errors.push(err);
      }
    })
  }
  if(errors.length > 0){
    self.$.container.closestChildren('.for-error').html(errors.map(function(v){return i18n.t(v); }).join('<br>'));

    this.$.html.closest('.form-group').addClass('has-error');

    var cerrors = (this._tabli.attr('data-validation-error') || '').split(';');
    if( cerrors.indexOf(this.json.id) < 0 ){
      if(cerrors[0] === '')
        cerrors = [];
      cerrors.push(this.json.id);
      this._tabli.attr('data-validation-error', cerrors.join(';'));
    }
    return false;
  }

  // unset errors. set success?
  var cerrors = (this._tabli.attr('data-validation-error') || '').split(';');
  if( cerrors.indexOf(this.json.id) > -1 ){
    cerrors.splice(cerrors.indexOf(this.json.id), 1);
    if(cerrors.length > 0){
      this._tabli.attr('data-validation-error', cerrors.join(';') );
    }else{
      this._tabli.removeAttr('data-validation-error');
    }
  }
  this.$.html.closest('.form-group').removeClass('has-error');
  return true;
}
Form.Fields.Computed.prototype.do = function( value, action, context, undo ){
  var self = this;
  if(!this.state)
    this.state = {};

  // Get previous differences
  var psK = Object.keys(this.state);
  var ps = {}; // previous state
  for( var i = 0 ; i < psK.length ; i++ ){
    ps[this.state[psK[i]]] = true;
  }

  if(undo){
    if(this.state[action+'_'+value+'_'+context]){
      delete this.state[action+'_'+value+'_'+context];
    }else{
      return;
    }
  }else{
    if(!this.state[action+'_'+value+'_'+context]){
      this.state[action+'_'+value+'_'+context] = action;
    }else{
      return;
    }
  }


  // Get current differences
  var csK = Object.keys(this.state);
  var cs = {}; // current state
  for( var i = 0 ; i < csK.length ; i++ ){
    cs[this.state[csK[i]]] = true;
  }

  // Just making bA as a shortcut for bindActions
  var bA = Form.Fields.Computed.bindActions;

  // reset states
  var aK = Object.keys(bA);
  for( var i = 0 ; i < aK.length ; i++ ){
    if( ps[aK[i]] ){      // if in previous
      if( cs[aK[i]] ){    // and in current
        continue;         // same state. do nothing
      }
      bA[aK[i]][1](this); // not in current. undo
    }

    if( cs[aK[i]] ){      // if only in current
      bA[aK[i]][0](this); // apply state
    }
  }
}
Form.Fields.Computed.prototype.doTo = function( target, action, context, undo ){
  var self = this;
  if(!this.targetStates)
    this.targetStates = {};

  if(!this.targetStates[target.type + '_' + target.target])
    this.targetStates[target.type + '_' + target.target] = {};

  // Get previous differences
  var psK = Object.keys(this.targetStates[target.type + '_' + target.target]);
  var ps = {}; // previous state
  for( var i = 0 ; i < psK.length ; i++ ){
    ps[this.targetStates[target.type + '_' + target.target][psK[i]]] = true;
  }

  if(undo){
    if(this.targetStates[target.type + '_' + target.target][action+'_'+context]){
      delete this.targetStates[target.type + '_' + target.target][action+'_'+context];
    }else{
      return;
    }
  }else{
    if(!this.targetStates[target.type + '_' + target.target][action+'_'+context]){
      this.targetStates[target.type + '_' + target.target][action+'_'+context] = action;
    }else{
      return;
    }
  }


  // Get current differences
  var csK = Object.keys(this.targetStates[target.type + '_' + target.target]);
  var cs = {}; // current state
  for( var i = 0 ; i < csK.length ; i++ ){
    cs[this.targetStates[target.type + '_' + target.target][csK[i]]] = true;
  }

  // Just making bA as a shortcut for bindActions
  var bA = Form.Fields.Computed.bindActions;

  // reset states
  var aK = Object.keys(bA);
  for( var i = 0 ; i < aK.length ; i++ ){
    if( ps[aK[i]] ){      // if in previous
      if( cs[aK[i]] ){    // and in current
        continue;         // same state. do nothing
      }
      bA[aK[i]][1](this, target); // not in current. undo
    }

    if( cs[aK[i]] ){      // if only in current
      bA[aK[i]][0](this, target); // apply state
    }
  }
}
Form.Fields.Computed.bindActions = {
  disable: [
    function( self ){
      self.$.input.attr('disabled', true);
    },
    function( self ){
      self.$.input.attr('disabled', false);
    }
  ],
  hide: [
    function( self ){ // Do
      self.$.container.parent().addClass('hidden');
    },
    function( self ){ // Undo
      self.$.container.parent().removeClass('hidden');
    }
  ],
  show: [
    function( self, target ){ // Do
      if( target && target.type === 'tab' ){
        self.form.$.container.find('[data-tab-id="'+target.target+'"]').each(function(){
          var $this = $(this);
          var states = JSON.parse( decodeURIComponent($this.attr('data-state-shown') || '') || '[]' );
          if( states.indexOf( self.json.id ) === -1 ){
            states.push( self.json.id );
            $this.attr('data-state-shown', encodeURIComponent(JSON.stringify(states)) );
          }
        });
      }else{
        self.$.container.parent().removeClass('hidden');
      }
    },
    function( self, target ){ // Undo
      if( target && target.type === 'tab' ){
        self.form.$.container.find('[data-tab-id="'+target.target+'"]').each(function(){
          var $this = $(this);
          var states = JSON.parse( decodeURIComponent($this.attr('data-state-shown') || '') || '[]' );
          if( states.indexOf( self.json.id ) > -1 ){
            states.splice( states.indexOf( self.json.id ), 1 );

            if( states.length === 0 ){
              $this.removeAttr('data-state-shown');
            }else{
              $this.attr('data-state-shown', encodeURIComponent(JSON.stringify(states)) );
            }
          }
        });
      }else{
        self.$.container.parent().addClass('hidden');
      }
    }
  ]
}
Form.Fields.Computed.prototype.doChanges = function(){
  var changed = this.isChanged();
  var val = this.get();

  if( changed && !this.json.muted ){
    this.$.container.closest('.form-group').addClass('changed');
  }else{
    this.$.container.closest('.form-group').removeClass('changed');
  }

  for( var i = 0 ; i < this.changeListeners.length ; i++ ){
    this.changeListeners[i]( this.json.id, val, changed );
  }
}
Form.Fields.Computed.prototype.saveData = function(){
  this.original = this.get();
  this.doChanges();
}
Form.Fields.Computed.prototype.refresh = function(){

}
Form.Fields.Computed.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];

  this.changeListeners.push( callback );
}
Form.Fields.Computed.prototype._ = scopeInterface;
Form.Fields.Computed.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('Computed').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};
/**
 * DatePicker
 */

Form.Fields.DatePicker = function DatePicker(scope, container, json) {
	this.scope = scope;
	this.container = container;
	this.json = json;

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;
	this.form = this._("^form").get(0);
	this.value = null;
	this.original = null;
	this.changeListeners = [];

	this.init();
};
Form.Fields.DatePicker.prototype.init = function () {
	var html = Form.Template(this.json, {
		data: {
			input: true,
		},
	});

	this.$.html = $(html);
	this.i18nLabel();
	if (this.json.visibility === "hidden")
		this.$.container.parent().addClass("hidden");

	this.$.container.append(this.$.html);
	this.$input = this.$.container.find("input");

	this.$dp = this.$input
		.pickadate({
			monthsFull: i18n.t("plugins.daterangepicker.locale", {
				returnObjectTrees: true,
			})["monthNames"],
			weekdaysShort: i18n.t("plugins.daterangepicker.locale", {
				returnObjectTrees: true,
			})["daysOfWeek"],
		})
		.pickadate("picker");
	this.bind();

	if (this.json.readOnly) {
		this.readonly(true);
	}
};
Form.Fields.DatePicker.prototype.bind = function () {
	var self = this;
	this.$dp.on("set", function () {
		self.doChanges();
	});
	this.$dp.on("close", function () {
		document.activeElement.blur();
	});

	if (this.json.onChange && this.form.actions[this.json.onChange]) {
		this.onChange(function (_, val) {
			self.form.actions[self.json.onChange](val, self.form, null, self);
		});
	}
};
Form.Fields.DatePicker.prototype.i18nLabel = function () {
	this.$.html.i18n();
};
Form.Fields.DatePicker.prototype.i18n = function () {
	var d = null;

	if (this.$dp) {
		d = this.get();
	}

	this.$.html.remove();
	this.init();

	if (d !== null) {
		this.set(d);
	}
};
Form.Fields.DatePicker.prototype.readonly = function (set) {
	if (typeof set === "undefined") return this.isReadOnly;

	this.isReadOnly = !!set;
	this.$input.attr("disabled", this.isReadOnly);
};
Form.Fields.DatePicker.prototype.getData = function () {
	var d = {};
	d[this.json.id] = this.get();
	return d;
};
Form.Fields.DatePicker.prototype.get = function () {
	var val = this.$dp.get("select");
	if (!val) return null;

	return moment(val.obj).format();
};
Form.Fields.DatePicker.prototype.setData = function (data) {
	this.original = data[this.json.id];
	this.set(this.original);
};
Form.Fields.DatePicker.prototype.set = function (val) {
	if (val) {
		this.$dp.set("select", moment(val).toDate());
	} else {
		this.$dp.set("select", null);
	}
	this.doChanges();
};
Form.Fields.DatePicker.prototype.reset = function () {
	this.set(this.original);
};
Form.Fields.DatePicker.prototype.clear = function () {
	this.value = null;
	this.original = null;
	this.set(null);
	this.clearErrors();
};
Form.Fields.DatePicker.prototype.clearErrors = function () {
	if (!this._tabli)
		this._tabli = $(
			'[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
		).parent();

	var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
	if (cerrors.indexOf(this.json.id) > -1) {
		cerrors.splice(cerrors.indexOf(this.json.id), 1);
		if (cerrors.length > 0) {
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		} else {
			this._tabli.removeAttr("data-validation-error");
		}
	}
	this.$.html.closest(".form-group").removeClass("has-error");
};
Form.Fields.DatePicker.prototype.applyFieldBinds = function () {};
Form.Fields.DatePicker.prototype.validate = function () {
	var self = this;
	// check if has validation settings
	if (!this.json.validation) return true;

	var errors = []; // i18n keys

	// setup validation elements
	if (!this._tabli)
		this._tabli = $(
			'[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
		).parent();

	var val = this.json.validation;
	var value = this.get();

	// validate empty
	if (val.required && (!value || (value + "").trim() === "")) {
		// apply error
		// i18n.t('common.errors.required');
		errors.push("app.errors.required-field");
	}

	if (val.custom) {
		(Array.isArray(val.custom) ? val.custom : [val.custom]).forEach(function (
			f
		) {
			var err;
			if (self.form.actions[f]) {
				err = self.form.actions[f](value, self, val);
				if (err) errors.push(err);
			}
		});
	}

	if (errors.length > 0) {
		self.$.container.closestChildren(".for-error").html(
			errors
				.map(function (v) {
					return i18n.t(v);
				})
				.join("<br>")
		);

		this.$.html.closest(".form-group").addClass("has-error");

		var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
		if (cerrors.indexOf(this.json.id) < 0) {
			if (cerrors[0] === "") cerrors = [];
			cerrors.push(this.json.id);
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		}
		return false;
	}

	// unset errors. set success?
	var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
	if (cerrors.indexOf(this.json.id) > -1) {
		cerrors.splice(cerrors.indexOf(this.json.id), 1);
		if (cerrors.length > 0) {
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		} else {
			this._tabli.removeAttr("data-validation-error");
		}
	}
	this.$.html.closest(".form-group").removeClass("has-error");
	return true;
};
Form.Fields.DatePicker.prototype.saveData = function () {
	this.original = this.get();
	this.doChanges();
};
Form.Fields.DatePicker.prototype.refresh = function () {};
Form.Fields.DatePicker.prototype.doChanges = function () {
	var changed = this.isChanged();
	var val = this.get();

	if (changed && !this.json.muted) {
		this.$.container.closest(".form-group").addClass("changed");
	} else {
		this.$.container.closest(".form-group").removeClass("changed");
	}

	for (var i = 0; i < this.changeListeners.length; i++) {
		this.changeListeners[i](this.json.id, val, changed);
	}
};
Form.Fields.DatePicker.prototype.onChange = function (callback) {
	if (!this.changeListeners) this.changeListeners = [];

	this.changeListeners.push(callback);
};
Form.Fields.DatePicker.prototype.isChanged = function () {
	var val = this.get();

	if (!val && !this.original) return false;

	return !moment(val).isSame(moment(this.original).startOf("day"));
};
Form.Fields.DatePicker.prototype._ = scopeInterface;
Form.Fields.DatePicker.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "DatePicker".toLowerCase() ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

/**
 * DatePicker2
 */

Form.Fields.DatePicker2 = function DatePicker2(scope, container, json) {
	this.scope = scope;
	this.container = container;
	this.json = json;

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;
	this.form = this._("^form").get(0);
	this.value = null;
	this.original = null;
	this.changeListeners = [];
	this._state = {
		readonly: {},
		hidden: {},
	};

	this.init();
};
Form.Fields.DatePicker2.prototype.init = function () {
	var html = Form.Template(this.json, {
		data: {
			input: true,
		},
	});

	this.$.html = $(html);
	this.i18nLabel();
	if (this.json.visibility === "hidden")
		this.$.container.parent().addClass("hidden");

	this.$.container.append(this.$.html);
	this.$container = this.$.container.find(".datepicker2-inputs");
	this.$container.hide();
	this.$input = this.$.container.find(".form-control");
	this.$button = this.$.container.find(".datepicker2-button");

	this.dateTimeFormat = "DD-MM-YYYY HH:mm";
	this.dateFormat = "DD-MM-YYYY";
	this.timeFormat = "HH:mm";

	if (this.json.isDate === this.json.isTime) {
		this.isDateTime = true;
		this.dateObj = null;
		this.format = this.dateTimeFormat;
	} else if (this.json.isDate) {
		this.isDate = true;
		this.dateObj = null;
		this.format = this.dateFormat;
	} else if (this.json.isTime) {
		this.isTime = true;
		this.timeObj = null;
		this.format = this.timeFormat;
	}

	if (this.isDateTime || this.isTime) {
		this.$.timeinput = this.$.container.find(".datepicker2-time");
		this.$.timeinput.clockpicker(
			{
				inline: true,
				placement: "bottom",
				align: "left",
				changed: (val) => {
					if (this.isTime) {
						this.timeObj = {
							hours: val.hours,
							minutes: val.minutes,
						};
						this.$input.val(
							`${val.hours
								.toString()
								.padStart(2, "0")}:${val.minutes.toString().padStart(2, "0")}`
						);
					} else {
						if (!this.dateObj) {
							this.dateObj = moment();
							this.$dp.set("select", this.dateObj.toDate());
						}

						this.dateObj.set({
							hours: val.hours,
							minutes: val.minutes,
						});
						this.$input.val(this.dateObj.format(this.format));
					}
					this.clearErrors();
					this.doChanges();
				},
			}.deepMerge(this.json.opts || {})
		);
		this.$.timeinput.clockpicker("show");
	}

	if (this.isDateTime || this.isDate) {
		this.$dateinput = this.$.container.find(".datepicker2-date");
		this.$dp = this.$dateinput
			.pickadate({
				close: "",
				clear: "",
				today: "",
				inline: true,
				closeOnSelect: false,
				monthsFull: i18n.t("plugins.daterangepicker.locale", {
					returnObjectTrees: true,
				})["monthNames"],
				weekdaysShort: i18n.t("plugins.daterangepicker.locale", {
					returnObjectTrees: true,
				})["daysOfWeek"],
				klass: {
					highlighted: "picker__day--no",
				},
			})
			.pickadate("picker");
	}

	this.bind();
	if (this.json.readOnly) {
		this.readonly(true);
	}
	if (this.isDateTime || this.isDate) {
		this.$dp.open(false);
	}
};
Form.Fields.DatePicker2.prototype.bind = function () {
	var self = this;
	this.$button.on("click", (_) => this.$container.toggle());

	if (this.isDateTime || this.isDate) {
		this.$dp.on("set", function (v) {
			var val;
			if (v.select) {
				val = v.select;
			}

			if (!val) return;
			var nd = new Date(val);

			if (!self.dateObj) {
				self.dateObj = moment(nd);
			}

			self.dateObj.set({
				date: nd.getDate(),
				month: nd.getMonth(),
				year: nd.getUTCFullYear(),
			});

			self.clearErrors();
			self.$input.val(self.dateObj.format(self.format));
			self.doChanges();
		});
	}
	this.$input.on("input", function (ev) {
		self.clearErrors();

		if (ev.target.value === "") {
			if (self.isDateTime || self.isDate) {
				self.dateObj = null;
				self.$dp.set("select", null);
			} else {
				self.timeObj = null;
			}

			if (self.isDateTime || self.isTime) {
				self.$.timeinput.clockpicker("toggleView", {
					view: "hours",
					value: {
						hours: 0,
						minutes: 0,
					},
				});
			}

			self.doChanges();
			return;
		}

		if (self.isDateTime || self.isDate) {
			var m = moment(ev.target.value, self.format, true);
			if (m.isValid()) {
				self.dateObj = m;

				if (self.isDateTime) {
					self.$.timeinput.clockpicker("toggleView", {
						view: "hours",
						value: {
							hours: m.hours(),
							minutes: m.minutes(),
						},
					});
				}

				self.$dp.set("select", m.toDate());
				self.doChanges();
			} else {
				self.setErrors(["app.core.invalid-date"]);
			}
		} else {
			try {
				let [hh, mm] = ev.target.value.split(":");
				if (+hh > 23 || +mm > 59) {
					self.setErrors(["app.core.invalid-date"]);
					return;
				}

				self.$.timeinput.clockpicker("toggleView", {
					view: "hours",
					value: {
						hours: +hh,
						minutes: +mm,
					},
				});
				self.timeObj = {
					hours: +hh,
					minutes: +mm,
				};
			} catch (e) {
				self.setErrors(["app.core.invalid-date"]);
			}
		}
	});

	this.updatePermissions = (p) => this.checkPermissions(p);
	main.permissions.bind(this.updatePermissions);
};
Form.Fields.DatePicker2.prototype.i18nLabel = function () {
	this.$.html.i18n();
};
Form.Fields.DatePicker2.prototype.i18n = function () {
	return;
	// TODO
	// months/weekdays only?

	var d = null;

	if (this.$dp) {
		d = this.get();
	}

	this.$.html.remove();
	this.init();

	if (d !== null) {
		this.set(d);
	}
};
Form.Fields.DatePicker2.prototype.remove = function () {
	main.permissions.offChange(this.updatePermissions);
};
Form.Fields.DatePicker2.prototype.checkPermissions = function (
	userPermissions
) {
	if (!this.json.permissions) {
		return;
	}

	Object.keys(this.json.permissions).forEach((k) => {
		const permission = k;
		const state = this.json.permissions[k];
		const hasPermission = userPermissions.indexOf(permission) > -1;

		if (state === "readonly") {
			this.readonly(!hasPermission, permission);
		}
		if (state === "hidden") {
			this.hidden(!hasPermission, permission);
		}
	});
};
Form.Fields.DatePicker2.prototype.hidden = function (set, namespace) {
	if (typeof namespace === "undefined" && typeof set === "undefined") {
		return Object.keys(this._state.hidden).reduce(
			(acc, k) => acc || this._state.hidden[k],
			false
		);
	}

	if (typeof set === "undefined") {
		return this._state.hidden[namespace];
	}

	namespace = namespace == null ? "anon" : namespace;

	this._state.hidden[namespace] = set;

	this.isHidden = Object.keys(this._state.hidden).reduce(
		(acc, k) => acc || this._state.hidden[k],
		false
	);

	if (this.isHidden) {
		this.$.container.addClass("hidden");
	} else {
		this.$.container.removeClass("hidden");
	}
};
Form.Fields.DatePicker2.prototype.readonly = function (set, namespace) {
	if (typeof namespace === "undefined" && typeof set === "undefined") {
		return Object.keys(this._state.readonly).reduce(
			(acc, k) => acc || this._state.readonly[k],
			false
		);
	}
	if (typeof set === "undefined") {
		return this._state.readonly[namespace];
	}

	namespace = namespace == null ? "anon" : namespace;

	this._state.readonly[namespace] = set;

	this.isReadOnly = Object.keys(this._state.readonly).reduce(
		(acc, k) => acc || this._state.readonly[k],
		false
	);

	this.$.html
		.find('button[data-id="close-button"]')
		.attr("disabled", this.isReadOnly);
	this.$input.attr("readonly", this.isReadOnly);
	this.$button.prop("disabled", this.isReadOnly);
	if (this.isReadOnly) {
		this.$container.hide();
	}
};
Form.Fields.DatePicker2.prototype.getData = function () {
	var d = {};
	d[this.json.id] = this.get();
	return d;
};
Form.Fields.DatePicker2.prototype.get = function () {
	if (this.isTime) {
		let val = this.timeObj;
		if (!val) return null;
		let hh = val.hours.toString().padStart(2, "0");
		let mm = val.minutes.toString().padStart(2, "0");
		return `${hh}:${mm}`;
	} else {
		let val = this.dateObj;
		if (!val) return null;
		return moment(val).format();
	}
};
Form.Fields.DatePicker2.prototype.setData = function (data) {
	this.original = data[this.json.id];
	this.set(this.original);
};
Form.Fields.DatePicker2.prototype.set = function (val) {
	if (!val) return;

	if (this.isTime) {
		if (val === "current") {
			val = moment().format("HH.mm");
		}

		let [hh, mm] = val.split(":");
		this.$.timeinput.clockpicker("toggleView", {
			view: "hours",
			value: {
				hours: hh,
				minutes: mm,
			},
		});
		this.timeObj = {
			hours: val.hours,
			minutes: val.minutes,
		};
	} else if (this.isDate) {
		if (val === "current") {
			val = moment();
		}
		let m = moment(val);
		if (!m.isValid()) return;
		this.dateObj = m;

		// Set text input
		this.$input.val(this.dateObj.format(this.format));

		// Set calendar
		this.$dp.set("select", this.dateObj.toDate());
	} else {
		if (val === "current") {
			val = moment();
		}
		let m = moment(val);
		if (!m.isValid()) return;
		this.dateObj = m;

		// Set text input
		this.$input.val(this.dateObj.format(this.format));

		// Set calendar
		this.$dp.set("select", this.dateObj.toDate());

		// Set clock
		this.$.timeinput.clockpicker("toggleView", {
			view: "hours",
			value: {
				hours: this.dateObj.hours(),
				minutes: this.dateObj.minutes(),
			},
		});
	}

	this.doChanges();
};
Form.Fields.DatePicker2.prototype.reset = function () {
	this.set(this.original);
};
Form.Fields.DatePicker2.prototype.clear = function () {
	this.value = null;
	this.original = null;
	this.set(null);
	this.clearErrors();
};
Form.Fields.DatePicker2.prototype.clearErrors = function () {
	if (!this._tabli)
		this._tabli = $(
			'[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
		).parent();

	var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
	if (cerrors.indexOf(this.json.id) > -1) {
		cerrors.splice(cerrors.indexOf(this.json.id), 1);
		if (cerrors.length > 0) {
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		} else {
			this._tabli.removeAttr("data-validation-error");
		}
	}
	this.$.html.closest(".form-group").removeClass("has-error");
};
Form.Fields.DatePicker2.prototype.applyFieldBinds = function () {};
Form.Fields.DatePicker2.prototype.validate = function () {
	var self = this;
	// check if has validation settings
	// if (!this.json.validation) return true;

	var errors = []; // i18n keys

	// setup validation elements
	if (!this._tabli)
		this._tabli = $(
			'[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
		).parent();

	var val = this.json.validation;
	var value = this.get();

	// validate empty
	(Array.isArray(val) ? val : [val]).forEach(function (val) {
		if (!val) return;

		if (val.required && (!value || (value + "").trim() === "")) {
			// apply error
			// i18n.t('common.errors.required');
			errors.push("app.errors.required-field");
		}

		if (val.custom) {
			(Array.isArray(val.custom) ? val.custom : [val.custom]).forEach(function (
				f
			) {
				var err;
				if (self.form.actions[f]) {
					err = self.form.actions[f](value, self, val);
					if (err) errors.push(err);
				}
			});
		}
	});

	if (errors.length > 0) {
		self.$.container.closestChildren(".for-error").html(
			errors
				.map(function (v) {
					return i18n.t(v);
				})
				.join("<br>")
		);

		this.$.html.closest(".form-group").addClass("has-error");

		var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
		if (cerrors.indexOf(this.json.id) < 0) {
			if (cerrors[0] === "") cerrors = [];
			cerrors.push(this.json.id);
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		}
		return false;
	}

	// unset errors. set success?
	var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
	if (cerrors.indexOf(this.json.id) > -1) {
		cerrors.splice(cerrors.indexOf(this.json.id), 1);
		if (cerrors.length > 0) {
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		} else {
			this._tabli.removeAttr("data-validation-error");
		}
	}
	this.$.html.closest(".form-group").removeClass("has-error");
	return true;
};

Form.Fields.DatePicker2.prototype.setErrors = function (errors) {
	this.$.container.closestChildren(".for-error").html(
		errors
			.map(function (v) {
				return i18n.t(v);
			})
			.join("<br>")
	);

	this.$.html.closest(".form-group").addClass("has-error");

	var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
	if (cerrors.indexOf(this.json.id) < 0) {
		if (cerrors[0] === "") cerrors = [];
		cerrors.push(this.json.id);
		this._tabli.attr("data-validation-error", cerrors.join(";"));
	}
};
Form.Fields.DatePicker2.prototype.saveData = function () {
	this.original = this.get();
	this.doChanges();
};
Form.Fields.DatePicker2.prototype.refresh = function () {};
Form.Fields.DatePicker2.prototype.doChanges = function () {
	var changed = this.isChanged();
	var val = this.get();

	if (changed && !this.json.muted) {
		this.$.container.closest(".form-group").addClass("changed");
	} else {
		this.$.container.closest(".form-group").removeClass("changed");
	}

	for (var i = 0; i < this.changeListeners.length; i++) {
		this.changeListeners[i](this.json.id, val, changed);
	}
};
Form.Fields.DatePicker2.prototype.onChange = function (callback) {
	if (!this.changeListeners) this.changeListeners = [];

	this.changeListeners.push(callback);
};
Form.Fields.DatePicker2.prototype.isChanged = function () {
	if (this.json.ignoreChange) return false;
	var val = this.get();

	if (!val && !this.original) return false;

	if (!this.original && val) {
		return true;
	}

	return !moment(val).isSame(moment(this.original), "minute");
};
Form.Fields.DatePicker2.prototype._ = scopeInterface;
Form.Fields.DatePicker2.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "DatePicker2".toLowerCase() ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

/**
 * DateTimePicker
 */

Form.Fields.DateTimePicker = function DateTimePicker(scope, container, json) {
	this.scope = scope;
	this.container = container;
	this.json = json;

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;
	this.form = this._("^form").get(0);

	this.value = null;
	this.original = null;
	this.changeListeners = [];
	this._state = {
		readonly: {},
		hidden: {},
	};
	this.children = [];

	this.init();
};
Form.Fields.DateTimePicker.prototype.init = function () {
	var html = Form.Template(this.json, {
		data: {
			input: true,
		},
	});

	this.$.html = $(html);
	if (this.json.visibility === "hidden")
		this.$.container.parent().addClass("hidden");

	this.$.container.append(this.$.html);

	this.$date = this.$.container.find(".datepicker-date");
	this.$time = this.$.container.find(".datepicker-time");

	this.dateField = new Form.Fields.DatePicker(this, this.$date, {
		id: "_subDate",
		type: "DatePicker",
		muted: true,
	});

	this.timeField = new Form.Fields.TimePicker(this, this.$time, {
		id: "_subTime",
		type: "TimePicker",
		opts: {
			placement: "bottom",
			align: "right",
			isSub: true,
		},
		muted: true,
	});

	this.children.push(this.dateField);
	this.children.push(this.timeField);

	if (this.json.readOnly) {
		this.readonly(true);
	}

	this.i18n();
	this.bind();
};
Form.Fields.DateTimePicker.prototype.bind = function () {
	var self = this;

	this.updatePermissions = (p) => this.checkPermissions(p);
	main.permissions.bind(this.updatePermissions);

	this.$.html.find('button[data-id="close-button"]').on("click", function () {
		self.set(null);
	});
	this.$.html.on("focusin", function () {
		self.$.html.addClass("focused");
	});
	this.$.html.on("focusout blur", function () {
		self.$.html.removeClass("focused");
	});

	this.dateField.onChange(function () {
		self.doChanges();
	});
	this.timeField.onChange(function () {
		self.doChanges();
	});
};
Form.Fields.DateTimePicker.prototype.i18n = function () {
	this.$.container.find("label").i18n();
};
Form.Fields.DateTimePicker.prototype.remove = function () {
	main.permissions.offChange(this.updatePermissions);
};
Form.Fields.DateTimePicker.prototype.checkPermissions = function (
	userPermissions
) {
	if (!this.json.permissions) {
		return;
	}

	Object.keys(this.json.permissions).forEach((k) => {
		const permission = k;
		const state = this.json.permissions[k];
		const hasPermission = userPermissions.indexOf(permission) > -1;

		if (state === "readonly") {
			this.readonly(!hasPermission, permission);
		}
		if (state === "hidden") {
			this.hidden(!hasPermission, permission);
		}
	});
};
Form.Fields.DateTimePicker.prototype.hidden = function (set, namespace) {
	if (typeof namespace === "undefined" && typeof set === "undefined") {
		return Object.keys(this._state.hidden).reduce(
			(acc, k) => acc || this._state.hidden[k],
			false
		);
	}

	if (typeof set === "undefined") {
		return this._state.hidden[namespace];
	}

	namespace = namespace == null ? "anon" : namespace;

	this._state.hidden[namespace] = set;

	this.isHidden = Object.keys(this._state.hidden).reduce(
		(acc, k) => acc || this._state.hidden[k],
		false
	);

	if (this.isHidden) {
		this.$.container.addClass("hidden");
	} else {
		this.$.container.removeClass("hidden");
	}
};
Form.Fields.DateTimePicker.prototype.readonly = function (set, namespace) {
	if (typeof namespace === "undefined" && typeof set === "undefined") {
		return Object.keys(this._state.readonly).reduce(
			(acc, k) => acc || this._state.readonly[k],
			false
		);
	}
	if (typeof set === "undefined") {
		return this._state.readonly[namespace];
	}

	namespace = namespace == null ? "anon" : namespace;

	this._state.readonly[namespace] = set;

	this.isReadOnly = Object.keys(this._state.readonly).reduce(
		(acc, k) => acc || this._state.readonly[k],
		false
	);

	this.$.html
		.find('button[data-id="close-button"]')
		.attr("disabled", this.isReadOnly);
};
Form.Fields.DateTimePicker.prototype.getData = function () {
	var d = {};
	d[this.json.id] = this.get();
	return d;
};
Form.Fields.DateTimePicker.prototype.get = function () {
	var date = this.dateField.get();
	var time = (this.timeField.get() || "").split(":");

	if (date === null) {
		return null;
	}
	return moment(date).hours(time[0]).minutes([time[1]]).format();
};
Form.Fields.DateTimePicker.prototype.setData = function (data) {
	this.original = data[this.json.id];
	this.set(this.original);
};
Form.Fields.DateTimePicker.prototype.set = function (val) {
	if (val) {
		var m = moment(val);
		var time = m.format("HH") + ":" + m.format("mm");

		m.hours(0).minutes(0);

		this.dateField.set(m.format());
		this.timeField.set(time);
	} else {
		this.dateField.set(null);
		this.timeField.set(null);
	}
	this.doChanges();
};
Form.Fields.DateTimePicker.prototype.reset = function () {
	this.set(this.original);
};
Form.Fields.DateTimePicker.prototype.clear = function () {
	this.value = null;
	this.original = null;
	this.set(null);
	this.clearErrors();
};
Form.Fields.DateTimePicker.prototype.clearErrors = function () {
	var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
	if (cerrors.indexOf(this.json.id) > -1) {
		cerrors.splice(cerrors.indexOf(this.json.id), 1);
		if (cerrors.length > 0) {
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		} else {
			this._tabli.removeAttr("data-validation-error");
		}
	}
	this.$.html.closest(".form-group").removeClass("has-error");
};
Form.Fields.DateTimePicker.prototype.applyFieldBinds = function () {};
Form.Fields.DateTimePicker.prototype.validate = function () {
	var self = this;
	// check if has validation settings
	if (!this.json.validation) return true;

	var errors = []; // i18n keys

	// setup validation elements
	if (!this._tabli)
		this._tabli = $(
			'[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
		).parent();

	var val = this.json.validation;
	var value = this.get();

	// validate empty
	if (val.required && (!value || (value + "").trim() === "")) {
		// apply error
		// i18n.t('common.errors.required');
		errors.push("app.errors.required-field");
	}

	if (val.custom) {
		(Array.isArray(val.custom) ? val.custom : [val.custom]).forEach(function (
			f
		) {
			var err;
			if (self.form.actions[f]) {
				err = self.form.actions[f](value, self, val);
				if (err) errors.push(err);
			}
		});
	}
	if (errors.length > 0) {
		self.$.container.closestChildren(".for-error").html(
			errors
				.map(function (v) {
					return i18n.t(v);
				})
				.join("<br>")
		);

		this.$.html.closest(".form-group").addClass("has-error");

		var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
		if (cerrors.indexOf(this.json.id) < 0) {
			if (cerrors[0] === "") cerrors = [];
			cerrors.push(this.json.id);
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		}
		return false;
	}

	// unset errors. set success?
	var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
	if (cerrors.indexOf(this.json.id) > -1) {
		cerrors.splice(cerrors.indexOf(this.json.id), 1);
		if (cerrors.length > 0) {
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		} else {
			this._tabli.removeAttr("data-validation-error");
		}
	}
	this.$.html.closest(".form-group").removeClass("has-error");
	return true;
};
Form.Fields.DateTimePicker.prototype.saveData = function () {
	this.original = this.get();
	this.doChanges();
};
Form.Fields.DateTimePicker.prototype.refresh = function () {};
Form.Fields.DateTimePicker.prototype.doChanges = function () {
	var changed = this.isChanged();
	var val = this.get();

	if (changed && !this.json.muted) {
		this.$.container.closest(".form-group").addClass("changed");
	} else {
		this.$.container.closest(".form-group").removeClass("changed");
	}

	for (var i = 0; i < this.changeListeners.length; i++) {
		this.changeListeners[i](this.json.id, val, changed);
	}
};
Form.Fields.DateTimePicker.prototype.onChange = function (callback) {
	if (!this.changeListeners) this.changeListeners = [];

	this.changeListeners.push(callback);
};
Form.Fields.DateTimePicker.prototype.isChanged = function () {
	var val = this.get();

	if (val == null && this.original == null) return false;

	return !moment(val).isSame(moment(this.original));
};
Form.Fields.DateTimePicker.prototype._ = scopeInterface;
Form.Fields.DateTimePicker.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "DateTimePicker".toLowerCase() ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

/**
 * EditGrid
 */

Form.Fields.EditGrid = function EditGrid(scope, container, json) {
	this.scope = scope;
	this.container = container;
	this.json = json;

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;
	this.form = this._("^form").get(0);

	this.actions = this.form.actions;

	this.edits = this.json.editableFields || {};
	this.hiddens = this.json.hiddenFields || [];

	this.fields = this.json.fields || [];
	this.fieldTypes = this.json.fieldTypes || [];

	this.value = null;
	this.original = null;
	this.isReadOnly = this.json.readOnly || false;
	this.changeListeners = [];

	this.init();
};
Form.Fields.EditGrid.prototype.init = function () {
	var self = this;
	var html = Form.Template(this.json, {
		data: {
			input: true,
		},
	});
	this.$.html = $(html);

	if (this.json.visibility === "hidden")
		this.$.container.parent().addClass("hidden");

	this.$.container.append(this.$.html);

	if (this.json.colCallback && this.actions[this.json.colCallback]) {
		this.renderCol = this.actions[this.json.colCallback];
	} else {
		this.renderCol = function (a) {
			return a;
		};
	}

	if (this.json.rowDataCallback && this.actions[this.json.rowDataCallback]) {
		this.rowData = this.actions[this.json.rowDataCallback];
	} else {
		this.rowData = function (a) {
			return a;
		};
	}

	if (this.json.rowCallback && this.actions[this.json.rowCallback]) {
		this.renderRow = this.actions[this.json.rowCallback];
	} else {
		this.renderRow = function (a) {
			return a;
		};
	}

	if (this.json.dataCallback && this.actions[this.json.dataCallback]) {
		this.dataCallback = this.actions[this.json.dataCallback];
	} else {
		this.dataCallback = function (row, fieldTypes) {
			var obj = {};
			row.find(".input").each(function () {
				var $this = $(this);
				if ($this.is(".selectize-control")) return;

				if ($this.is(":checkbox")) {
					obj[$this.closest("[data-field]").data("field")] =
						$this.is(":checked");
				} else {
					obj[$this.closest("[data-field]").data("field")] = $this.val();
				}
			});
			row.find("[data-field]").each(function () {
				var $this = $(this);
				var field = $this.data("field");
				if (!obj.hasOwnProperty(field)) {
					obj[field] = $this.text();
				}
			});

			var K = Object.keys(obj);
			for (var i = 0; i < K.length; i++) {
				if (fieldTypes[K[i]] === "int") obj[K[i]] = +obj[K[i]];
			}

			return obj;
		};
	}

	this.$.table = this.$.container.find("table");
	this.$.thead = this.$.table.find("thead");

	var editGrid = this;
	this.$.thead.empty().append(
		this.renderCol(
			"<tr>" +
				(editGrid.json.allowDelete && !editGrid.isReadOnly ? "<th></th>" : "") +
				editGrid.fields
					.map(function (v) {
						if (typeof v === "string")
							return (
								'<th class="' +
								(editGrid.hiddens.indexOf(v) === -1 ? "" : "hidden") +
								'" data-field="' +
								v +
								'">' +
								v +
								"</th>"
							);
						return (
							'<th class="' +
							(v.class || "") +
							" " +
							(editGrid.hiddens.indexOf(v.name) === -1 ? "" : "hidden") +
							'" data-field="' +
							v.name +
							'">' +
							v.title +
							"</th>"
						);
					})
					.join("") +
				"</tr>"
		)
	);

	this.$.tbody = this.$.table.find("tbody");

	if (!this.isReadOnly && this.json.allowNew !== false)
		this.$.table.after(
			'<div class="addrow btn btn-xs btn-flat btn-primary"><i class="fa fa-fw fa-plus"></i></div>'
		);

	this.bind();
	this.i18n();
};
Form.Fields.EditGrid.prototype.bind = function () {
	var self = this;
	this.$.table.on("change input", ".input", function () {
		var $this = $(this);
		var val = null;

		if ($this.data("bind")) {
			if ($this.is(":checkbox")) {
				//  $this.siblings('[data-bound="'+$this.data('bind')+'"]').text($this.val());
				val = $this.prop("checked");
			} else {
				$this
					.siblings('[data-bound="' + $this.data("bind") + '"]')
					.text($this.val());
				val = $this.val();
			}
		}

		if (
			self.json.rowChangedCallback &&
			self.actions &&
			self.actions[self.json.rowChangedCallback]
		) {
			self.actions[self.json.rowChangedCallback]();
			// TODO
			// get row data
			// call callback
			// set row data
		}

		if (encodeURIComponent(val) !== $this.data("value") + "") {
			$this.addClass("changed");
		} else {
			$this.removeClass("changed");
		}

		for (var i = 0; i < self.changeListeners.length; i++) {
			self.changeListeners[i](self.json.id, self.get(), self.isChanged());
		}
		self.validate();
	});
	this.$.table.on("click", ".delete", function () {
		if (self.json.noUndo) {
			$(this).closest("tr").remove();
		} else {
			$(this)
				.closest("tr")
				.addClass("deleted")
				.find(".input")
				.prop("disabled", true);
		}

		for (var i = 0; i < self.changeListeners.length; i++) {
			self.changeListeners[i](self.json.id, self.get(), self.isChanged());
		}

		self.validate();
	});
	this.$.table.on("click", ".restore", function () {
		$(this)
			.closest("tr")
			.removeClass("deleted")
			.find(".input")
			.prop("disabled", false);
		for (var i = 0; i < self.changeListeners.length; i++) {
			self.changeListeners[i](self.json.id, self.get(), self.isChanged());
		}
		self.validate();
	});
	this.$.container.find(".addrow").on("click", function () {
		var d = {};
		for (var i = 0; i < self.fields.length; i++) {
			d[
				typeof self.fields[i] === "string"
					? self.fields[i]
					: self.fields[i].name
			] =
				self.fieldTypes[
					typeof self.fields[i] === "string"
						? self.fields[i]
						: self.fields[i].name
				] === "int"
					? 0
					: "";
		}

		d = self.rowData(d, self, self.form);

		var $row = $(self.makeRow(self.fields, d)).addClass("new");

		self.$.tbody.append($row);

		$row.find("select.auto").selectize({
			dropdownParent: "body",
			allowNull: true,
			onDropdownOpen: function () {
				this.clear();
			},
		});

		for (var i = 0; i < self.changeListeners.length; i++) {
			self.changeListeners[i](self.json.id, self.get(), self.isChanged());
		}
		self.validate();
	});
};
Form.Fields.EditGrid.prototype.i18n = function () {
	this.$.html.i18n();
};
Form.Fields.EditGrid.prototype.readonly = function (set) {
	if (typeof set === "undefined") return this.isReadOnly;

	this.isReadOnly = !!set;
	this.$.html
		.parent()
		.find("textarea, input, select")
		.prop("disabled", this.isReadOnly);

	this.$.html.parent().find(".del-btn").toggleClass("hidden", this.isReadOnly);

	this.$.html.parent().find(".addrow").toggleClass("hidden", this.isReadOnly);
};
Form.Fields.EditGrid.prototype.getData = function () {
	var d = {};
	d[this.json.id] = this.get();
	return d;
};
Form.Fields.EditGrid.prototype.get = function () {
	var self = this;
	var d = JSON.simpleCopy(this.original);

	d.data = [];
	d.deleted = [];
	d.new = [];
	d.fullData = [];

	this.$.tbody.children("tr").each(function () {
		var $this = $(this);
		if ($this.is(".deleted.new")) {
			// nope
		} else if ($this.is(".deleted")) {
			d.deleted.push(self.dataCallback($(this), self.fieldTypes));
		} else if ($this.is(".new")) {
			d.fullData.push(self.dataCallback($(this), self.fieldTypes));
			d.new.push(self.dataCallback($(this), self.fieldTypes));
		} else {
			d.fullData.push(self.dataCallback($(this), self.fieldTypes));
			d.data.push(self.dataCallback($(this), self.fieldTypes));
		}
	});

	return d;
};
Form.Fields.EditGrid.prototype.setData = function (data) {
	if (data[this.json.id]) this.set(data[this.json.id]);
};
Form.Fields.EditGrid.prototype.set = function (val) {
	var self = this;
	this.original = val;
	this.fields = val.fields;
	this.fieldTypes = {};
	for (var i = 0; i < val.fieldTypes.length; i++) {
		this.fieldTypes[
			typeof val.fields[i] === "string" ? val.fields[i] : val.fields[i].name
		] = val.fieldTypes[i];
	}

	var data = val.data.map(function (v) {
		return val.fields.map(function (k) {
			return v[typeof k === "string" ? k : k.name];
		});
	});

	this.$.thead.empty().append(
		this.renderCol(
			"<tr>" +
				(this.json.allowDelete && !this.isReadOnly ? "<th></th>" : "") +
				val.fields
					.map(function (v) {
						if (typeof v === "string")
							return (
								'<th class="' +
								(self.hiddens.indexOf(v) === -1 ? "" : "hidden") +
								'" data-field="' +
								v +
								'">' +
								v +
								"</th>"
							);
						return (
							'<th class="' +
							(v.class || "") +
							" " +
							(self.hiddens.indexOf(v.name) === -1 ? "" : "hidden") +
							'" data-field="' +
							v.name +
							'">' +
							v.title +
							"</th>"
						);
					})
					.join("") +
				"</tr>"
		)
	);

	this.$.tbody.empty().append(
		val.data.map(function (v) {
			return self.renderRow(self.makeRow(val.fields, v));
		})
	);

	this.$.tbody.find("select.auto").selectize({
		dropdownParent: "body",
		allowNull: true,
		onDropdownOpen: function () {
			this.clear();
		},
	});

	for (var i = 0; i < self.changeListeners.length; i++) {
		self.changeListeners[i](self.json.id, self.get(), self.isChanged());
	}
};
Form.Fields.EditGrid.prototype.makeRow = function (fields, row) {
	var self = this;
	return `
    <tr>
      ${
				(this.json.allowDelete && !this.isReadOnly
					? `
          <td class="">
            <div class="del-btn delete btn btn-xs btn-flat btn-danger">
              <i class="fa fa-fw fa-times"></i>
            </div>
            <div class="del-btn restore btn btn-xs btn-flat btn-info">
              <i class="fa fa-fw fa-undo"></i>
            </div>
          </td>
        `
					: "") +
				fields
					.map(function (f) {
						var k = typeof f === "string" ? f : f.name;
						return `
              <td class="${
								self.hiddens.indexOf(k) === -1 ? "" : "hidden"
							}" data-field="${k}">
                ${self.makeField(k, row[k])}
              </td>
            `;
					})
					.join("")
			}
    </tr>
  `;
};
Form.Fields.EditGrid.prototype.makeField = function (field, value) {
	var self = this;
	var html;
	var bind_id;

	if (this.edits.hasOwnProperty(field)) {
		switch (this.edits[field].type) {
			case "text":
				if (
					typeof value === "string" &&
					(value.length > 150 || value.indexOf("\n") > -1)
				) {
					html = `
            <textarea 
              ${this.isReadOnly ? "disabled" : ""} 
              class="input" type="text" 
              style="width:100%"
              data-value="${encodeURIComponent(value)}"'
              >${value}</textarea>
          `;
				} else {
					bind_id = Date.now() + "_" + Math.random();
					html = `
            <div style="height:0px;color:transparent;" data-bound="${bind_id}">
              ${value}
            </div>
            <input 
              ${this.isReadOnly ? "disabled" : ""} 
              class="input" 
              style="width:100%" type="text" 
              data-bind="${bind_id}" 
              data-value="${encodeURIComponent(value)}" 
              value="${value}" 
            />
          `;
				}
				break;
			case "textarea":
				html = `
          <textarea${this.isReadOnly ? " disabled" : ""} 
            style="width:100%"
            class="input" type="text" 
            data-value="${encodeURIComponent(value)}"
            >${value}</textarea>
        `;
				break;
			case "number":
				bind_id = Date.now() + "_" + Math.random();
				html = `
          <div style="height:0px;color:transparent;" data-bound="${bind_id}">
            ${value}
          </div>
          <input${this.isReadOnly ? " disabled" : ""} 
            class="input" style="width:100%" type="number" inputmode="numeric"
            data-bind="${bind_id}" data-value="${encodeURIComponent(value)}"'
            value="${value}" 
          />
        `;
				break;
			case "boolean":
				bind_id = Date.now() + "_" + Math.random();
				html = `
          <div style="height:0px;color:transparent;" data-bound="${bind_id}"></div>
          <input${this.isReadOnly ? " disabled" : ""} 
            class="input" style="width:100%" type="checkbox" data-bind="${bind_id}" 
            data-value="${encodeURIComponent(value)}"
            ${value ? " checked " : ""} value="checked" 
          />
        `;
				break;
			case "select":
				html = `
            <select${
							this.isReadOnly ? " disabled" : ""
						} class="input" data-value="${encodeURIComponent(value)}" >'
              ${this.edits[field].options
								.map(function (o) {
									if (typeof o === "string") {
										return `
                    <option value="${o}" ${o === value ? "selected" : ""}>
                      ${o}
                    </option>
                  `;
									} else if (typeof o === "object") {
										if (!self.edits[field].valueField) {
											throw "EditGrid: valueField for " + field + " is missing";
										}
										if (!self.edits[field].labelField) {
											throw "EditGrid: labelField for " + field + " is missing";
										}
										var v = o[self.edits[field].valueField];
										var l = o[self.edits[field].labelField];
										return `
                    <option value="${v}" ${v === value ? "selected" : ""}>
                      ${l}
                    </option>
                  `;
									}
								})
								.join("")}
            </select>
          `;
				break;
			case "autoSelect":
				html = `
        <div style="min-width:${this.edits[field]["min-width"]}">
              <select${
								this.isReadOnly ? " disabled" : ""
							} class="input auto" data-value="${encodeURIComponent(value)}" >'
                ${this.edits[field].options
									.map(function (o) {
										if (typeof o === "string") {
											return `
                      <option value="${o}" ${o === value ? "selected" : ""}>
                        ${o}
                      </option>
                    `;
										} else if (typeof o === "object") {
											if (!self.edits[field].valueField) {
												throw (
													"EditGrid: valueField for " + field + " is missing"
												);
											}
											if (!self.edits[field].labelField) {
												throw (
													"EditGrid: labelField for " + field + " is missing"
												);
											}
											var v = o[self.edits[field].valueField];
											var l = o[self.edits[field].labelField];
											return `
                      <option value="${v}" ${v === value ? "selected" : ""}>
                        ${l}
                      </option>
                    `;
										}
									})
									.join("")}
              </select></div>
            `;
				break;
		}
		return html;
	}

	return value;
};
Form.Fields.EditGrid.prototype.isChanged = function () {
	if (this.$.table.find(".deleted:not(.new)").length > 0) {
		return true;
	}

	if (this.$.table.find(".changed").closest("tr").is(":not(.deleted)")) {
		return true;
	}

	if (this.$.table.find(".new:not(.deleted)").length > 0) {
		return true;
	}

	return false;
};
Form.Fields.EditGrid.prototype.reset = function () {
	// clear
	this.$.thead.empty();
	this.$.tbody.empty();
};
Form.Fields.EditGrid.prototype.clear = function () {
	this.$.tbody.empty();
};
Form.Fields.EditGrid.prototype.applyFieldBinds = function () {
	var self = this;
	var B = this.json.binds;
	if (!B) return;

	B.forEach(function (b) {
		if (b.to) {
			var t = self.form._("_" + b.to).get(0);
			// create bind
			t.onChange(function () {
				var get = t.get();
				if ((b.field && get ? get[b.field] : get) == b.value) {
					self.do(b.value, b.do, b.to);
				} else {
					self.do(b.value, b.do, b.to, true);
				}
			});
			// apply it
			var get = t.get();
			if ((b.field && get ? get[b.field] : get) == b.value) {
				self.do(b.value, b.do, b.to);
			} else {
				self.do(b.value, b.do, b.to, true);
			}
		} else if (b.target) {
			var t = self;

			t.onChange(function () {
				var get = t.get();
				if ((b.field && get ? get[b.field] : get) == b.value) {
					self.doTo({ type: b.type || "field", target: b.target }, b.do, b.to);
				} else {
					self.doTo(
						{ type: b.type || "field", target: b.target },
						b.do,
						b.to,
						true
					);
				}
			});

			var get = t.get();
			if ((b.field && get ? get[b.field] : get) == b.value) {
				self.doTo({ type: b.type || "field", target: b.target }, b.do, b.to);
			} else {
				self.doTo(
					{ type: b.type || "field", target: b.target },
					b.do,
					b.to,
					true
				);
			}
		}
	});
};
Form.Fields.EditGrid.prototype.do = function (value, action, context, undo) {
	var self = this;
	if (!this.state) this.state = {};

	// Get previous differences
	var psK = Object.keys(this.state);
	var ps = {}; // previous state
	for (var i = 0; i < psK.length; i++) {
		ps[this.state[psK[i]]] = true;
	}

	if (undo) {
		if (this.state[action + "_" + value + "_" + context]) {
			delete this.state[action + "_" + value + "_" + context];
		} else {
			return;
		}
	} else {
		if (!this.state[action + "_" + value + "_" + context]) {
			this.state[action + "_" + value + "_" + context] = action;
		} else {
			return;
		}
	}

	// Get current differences
	var csK = Object.keys(this.state);
	var cs = {}; // current state
	for (var i = 0; i < csK.length; i++) {
		cs[this.state[csK[i]]] = true;
	}

	// Just making bA as a shortcut for bindActions
	var bA = Form.Fields.EditGrid.bindActions;

	// reset states
	var aK = Object.keys(bA);
	for (var i = 0; i < aK.length; i++) {
		if (ps[aK[i]]) {
			// if in previous
			if (cs[aK[i]]) {
				// and in current
				continue; // same state. do nothing
			}
			bA[aK[i]][1](this); // not in current. undo
		}

		if (cs[aK[i]]) {
			// if only in current
			bA[aK[i]][0](this); // apply state
		}
	}
};

Form.Fields.EditGrid.prototype.doTo = function (target, action, context, undo) {
	var self = this;
	if (!this.targetStates) this.targetStates = {};

	if (!this.targetStates[target.type + "_" + target.target])
		this.targetStates[target.type + "_" + target.target] = {};

	// Get previous differences
	var psK = Object.keys(this.targetStates[target.type + "_" + target.target]);
	var ps = {}; // previous state
	for (var i = 0; i < psK.length; i++) {
		ps[this.targetStates[target.type + "_" + target.target][psK[i]]] = true;
	}

	if (undo) {
		if (
			this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			]
		) {
			delete this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			];
		} else {
			return;
		}
	} else {
		if (
			!this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			]
		) {
			this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			] = action;
		} else {
			return;
		}
	}

	// Get current differences
	var csK = Object.keys(this.targetStates[target.type + "_" + target.target]);
	var cs = {}; // current state
	for (var i = 0; i < csK.length; i++) {
		cs[this.targetStates[target.type + "_" + target.target][csK[i]]] = true;
	}

	// Just making bA as a shortcut for bindActions
	var bA = Form.Fields.EditGrid.bindActions;

	// reset states
	var aK = Object.keys(bA);
	for (var i = 0; i < aK.length; i++) {
		if (ps[aK[i]]) {
			// if in previous
			if (cs[aK[i]]) {
				// and in current
				continue; // same state. do nothing
			}
			bA[aK[i]][1](this, target); // not in current. undo
		}

		if (cs[aK[i]]) {
			// if only in current
			bA[aK[i]][0](this, target); // apply state
		}
	}
};
Form.Fields.EditGrid.bindActions = {
	disable: [
		function (self) {
			// Do
			self.$.input.prop("disabled", true);
		},
		function (self) {
			// Undo
			self.$.input.prop("disabled", false);
		},
	],
	hide: [
		function (self) {
			// Do
			self.$.container.parent().addClass("hidden");
		},
		function (self) {
			// Undo
			self.$.container.parent().removeClass("hidden");
		},
	],
	show: [
		function (self, target) {
			// Do
			if (target && target.type === "tab") {
				self.form.$.container
					.find('[data-tab-id="' + target.target + '"]')
					.each(function () {
						var $this = $(this);
						var states = JSON.parse(
							decodeURIComponent($this.attr("data-state-shown") || "") || "[]"
						);
						if (states.indexOf(self.json.id) === -1) {
							states.push(self.json.id);
							$this.attr(
								"data-state-shown",
								encodeURIComponent(JSON.stringify(states))
							);
						}
					});
			} else {
				self.$.container.parent().removeClass("hidden");
			}
		},
		function (self, target) {
			// Undo
			if (target && target.type === "tab") {
				self.form.$.container
					.find('[data-tab-id="' + target.target + '"]')
					.each(function () {
						var $this = $(this);
						var states = JSON.parse(
							decodeURIComponent($this.attr("data-state-shown") || "") || "[]"
						);
						if (states.indexOf(self.json.id) > -1) {
							states.splice(states.indexOf(self.json.id), 1);

							if (states.length === 0) {
								$this.removeAttr("data-state-shown");
							} else {
								$this.attr(
									"data-state-shown",
									encodeURIComponent(JSON.stringify(states))
								);
							}
						}
					});
			} else {
				self.$.container.parent().addClass("hidden");
			}
		},
	],
};
Form.Fields.EditGrid.prototype.validate = function () {
	var self = this;
	// check if has validation settings
	if (!this.json.validation) return true;

	var errors = []; // i18n keys

	// setup validation elements
	if (!this._tabli)
		this._tabli = $(
			'[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
		).parent();

	var val = this.json.validation;
	var value = this.get();

	// validate empty

	(Array.isArray(val) ? val : [val]).forEach(function (val) {
		if (val.required && (!value || (value + "").trim() === "")) {
			// apply error
			// i18n.t('common.errors.required');
			errors.push("app.errors.required-field");
		}

		if (val.custom) {
			(Array.isArray(val.custom) ? val.custom : [val.custom]).forEach(function (
				f
			) {
				var err;
				if (self.form.actions[f]) {
					err = self.form.actions[f](value, self, val);
					if (err) errors.push(err);
				}
			});
		}
	});
	if (errors.length > 0) {
		self.$.container.closestChildren(".for-error").html(
			errors
				.map(function (v) {
					return i18n.t(v);
				})
				.join("<br>")
		);

		this.$.html.closest(".form-group").addClass("has-error");

		var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
		if (cerrors.indexOf(this.json.id) < 0) {
			if (cerrors[0] === "") cerrors = [];
			cerrors.push(this.json.id);
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		}
		return false;
	}

	// unset errors. set success?
	var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
	if (cerrors.indexOf(this.json.id) > -1) {
		cerrors.splice(cerrors.indexOf(this.json.id), 1);
		if (cerrors.length > 0) {
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		} else {
			this._tabli.removeAttr("data-validation-error");
		}
	}
	this.$.html.closest(".form-group").removeClass("has-error");
	return true;
};
Form.Fields.EditGrid.prototype.saveData = function () {
	const data = this.get();
	this.set({
		data: data.fullData,
		fieldTypes: data.fieldTypes,
		fields: data.fields,
	});
};
Form.Fields.EditGrid.prototype.refresh = function () {
	// nop
};
Form.Fields.EditGrid.prototype.onChange = function (callback) {
	if (!this.changeListeners) this.changeListeners = [];
	this.changeListeners.push(callback);
};
Form.Fields.EditGrid.prototype._ = scopeInterface;
Form.Fields.EditGrid.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "EditGrid".toLowerCase() ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

/**
 * File
 */

Form.Fields.File = function File(scope, container, json ){
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._('^form').get(0);

  this.value = null;
  this.original = null;

  this.changeListeners = [];

  this.init();
}
Form.Fields.File.prototype.init = function(){
  var html = Form.Template( this.json, {data: {
    input: true
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);
  this.$.input = this.$.container.find('input');

  var opts = {
    showPreview: !!this.json.preview,
    allowedFileExtensions: this.json.fileTypes,
    showAjaxErrorDetails: false,
    showUpload: false,
    showRemove: false,
    showCancel: false,
    theme: 'fa'
  };

  this.fi = this.$.input.fileinput(opts);

  this.bind();
  this.i18n();
}
Form.Fields.File.prototype.bind = function(){
  var self = this;

  this.$.input.on('input change', function( ev ){
    var files = ev.target.files;
    var file = files[0];

    if (files && file) {
      var reader = new FileReader();

      reader.onload = function(readerEvt) {
        var binaryString = readerEvt.target.result;
        var binary = "";
        var bytes = new Uint8Array(binaryString);
        var length = bytes.byteLength;
        for (var i = 0; i < length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        self.value = self.json.base64 ? window.btoa( binary ) : binary;
        self.doChanges();
      };

      reader.readAsArrayBuffer(file);
    }
  });
}
Form.Fields.File.prototype.i18n = function(){
  this.$.html.i18n();
}
Form.Fields.File.prototype.getData = function(){
  var d = {};
  d[this.json.id] = this.get();
  return d;
}
Form.Fields.File.prototype.get = function(){
  return this.value;
}
Form.Fields.File.prototype.setData = function( data ){
}
Form.Fields.File.prototype.set = function(){
}
Form.Fields.File.prototype.isChanged = function(){
  var val = this.get();
  return val !== this.original &&
    !(this.original === null && val === '' );
}
Form.Fields.File.prototype.reset = function(){
  // clear
}
Form.Fields.File.prototype.clear = function(){
  this.value = null;
  this.original = null;

  this.$.input.val('');
}
Form.Fields.File.prototype.applyFieldBinds = function(){
  var self = this;
  var B = this.json.binds;
  if(!B) return;

  B.forEach(function(b){
    var t = self.form._('_'+b.to).get(0);
    // create bind
    t.onChange(function(){
      if( t.get() === b.value ){
        self.do(b.do, b.to);
      }else{
        self.do(b.do, b.to, true);
      }
    });
    // apply it
    if( t.get() === b.value ){
      self.do(b.do, b.to);
    }else{
      self.do(b.do, b.to, true);
    }
  });
}
Form.Fields.File.prototype.do = function( action, context, undo ){
  var self = this;
  if(!this.state)
    this.state = {};

  // Get previous differences
  var psK = Object.keys(this.state);
  var ps = {}; // previous state
  for( var i = 0 ; i < psK.length ; i++ ){
    ps[this.state[psK[i]]] = true;
  }

  if(undo){
    if(this.state[action+'_'+context]){
      delete this.state[action+'_'+context];
    }else{
      return;
    }
  }else{
    if(!this.state[action+'_'+context]){
      this.state[action+'_'+context] = action;
    }else{
      return;
    }
  }


  // Get current differences
  var csK = Object.keys(this.state);
  var cs = {}; // current state
  for( var i = 0 ; i < csK.length ; i++ ){
    cs[this.state[csK[i]]] = true;
  }

  // Just making bA as a shortcut for bindActions
  var bA = Form.Fields.File.bindActions;

  // reset states
  var aK = Object.keys(bA);
  for( var i = 0 ; i < aK.length ; i++ ){
    if( ps[aK[i]] ){      // if in previous
      if( cs[aK[i]] ){    // and in current
        continue;         // same state. do nothing
      }
      bA[aK[i]][1](this); // not in current. undo
    }

    if( cs[aK[i]] ){      // if only in current
      bA[aK[i]][0](this); // apply state
    }
  }
}
Form.Fields.File.prototype.validate = function(){
  var self = this;
  // check if has validation settings
  if( !this.json.validation )
    return true;

  var errors = []; // i18n keys

  // setup validation elements
  if( !this._tabli )
    this._tabli = $('[href="#'+this.$.html.closest('.tab-pane').attr('id')+'"]').parent();


  var val = this.json.validation;
  var value = this.get();

  // validate empty
  if( val.required && ( !value || (value+'').trim() === '' ) ){
    // apply error
    // i18n.t('common.errors.required');
    errors.push('app.errors.required-field');
  }else if( val.regex ){
    // make regexes
    if( !this.regexes ){
      this.regexes = {};

      val.regex.forEach(function( v, k ){
        self.regexes[k] = new RegExp(k);
      });
    }

    var vK = Object.keys(val.regex);
    for( var i = 0 ; i < vK.length ; i++ ){
      var k = vK[i];
      var r = self.regexes[k];

      if( !r.test(value) ){
        errors.push(val.regex[k]);
      }
    }
  }


  if( val.custom ){
    (Array.isArray(val.custom)?val.custom:[val.custom]).forEach(function(f){
      var err;
      if(self.form.actions[f]){
        err = self.form.actions[f]( value, self, val );
        if( err )
          errors.push(err);
      }
    })
  }
  if(errors.length > 0){
    self.$.container.closestChildren('.for-error').html(errors.map(function(v){return i18n.t(v); }).join('<br>'));

    this.$.html.closest('.form-group').addClass('has-error');

    var cerrors = (this._tabli.attr('data-validation-error') || '').split(';');
    if( cerrors.indexOf(this.json.id) < 0 ){
      if(cerrors[0] === '')
        cerrors = [];
      cerrors.push(this.json.id);
      this._tabli.attr('data-validation-error', cerrors.join(';'));
    }
    return false;
  }

  // unset errors. set success?
  var cerrors = (this._tabli.attr('data-validation-error') || '').split(';');
  if( cerrors.indexOf(this.json.id) > -1 ){
    cerrors.splice(cerrors.indexOf(this.json.id), 1);
    if(cerrors.length > 0){
      this._tabli.attr('data-validation-error', cerrors.join(';') );
    }else{
      this._tabli.removeAttr('data-validation-error');
    }
  }
  this.$.html.closest('.form-group').removeClass('has-error');
  return true;
}
Form.Fields.File.prototype.doChanges = function(){
  var changed = this.isChanged();
  var val = this.get();

  if( changed && !this.json.muted ){
    this.$.container.closest('.form-group').addClass('changed');
  }else{
    this.$.container.closest('.form-group').removeClass('changed');
  }

  for( var i = 0 ; i < this.changeListeners.length ; i++ ){
    this.changeListeners[i]( this.json.id, val, changed );
  }
}
Form.Fields.File.prototype.saveData = function(){
  this.original = this.get();
  this.doChanges();
}
Form.Fields.File.prototype.refresh = function(){

}
Form.Fields.File.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];

  this.changeListeners.push( callback );
}
Form.Fields.File.bindActions = {
  disable: [
    function( self ){ // Do
      self.$.input.prop('disabled', true);
    },
    function( self ){ // Undo
      self.$.input.prop('disabled', false);
    }
  ],
  hide: [
    function( self ){ // Do
      self.$.container.parent().addClass('hidden');
    },
    function( self ){ // Undo
      self.$.container.parent().removeClass('hidden');
    }
  ]
}
Form.Fields.File.prototype._ = scopeInterface;
Form.Fields.File.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('File').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};
/**
 * FileExplorer
 */

Form.Fields.FileExplorer = function FileExplorer(scope, container, json ){
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._('^form').get(0);

  this.value = null;
  this.original = null;

  this.changeListeners = [];

  this.init();
}
Form.Fields.FileExplorer.prototype.init = function(){
  var html = Form.Template( this.json, {data: {
    input: true
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);
  this.$.vue = this.$.container.find('.fe-file-explorer');
  this.$.vue.append(Form.Fields.FileExplorer.html);

  this.setup();
  this.bind();
  this.i18n();
}
Form.Fields.FileExplorer.prototype.setup = function(){

  function fileGet( opts, cb ){
    $.ajax({
      data: JSON.stringify( opts ),
      contentType: "application/json",
      url: '/OM/api/config/GetPathInfo',
      type: 'POST'
    }).done(function(data) {
      cb(data);
    }).fail(function(err) {
      DEBUG.error(err);
    });
  }
  var DEBUG = {
    log: function(){
      if( this.debug )
        console.log.apply(console, arguments);
    },
    warn: function(){
      if( this.debug )
        console.warn.apply(console, arguments);
    },
    error: function(){
      if( this.debug )
        console.error.apply(console, arguments);
    },
    debug: true
  }

  function pointy(e){
    var p = {
      pos_threshold: 30,
      press_time: 300,

      touchStart: function(e){
        this.st = Date.now();
        var touch = e.targetTouches[0];
        this.start_pos = {
          x: touch.clientX,
          y: touch.clientY
        };
        this.last_pos = this.start_pos;
        this.total_delta = {
          x: 0,
          y: 0
        };

        var self = this;
        this.press_timeout = setTimeout(function(){
          clearTimeout( self.press_timeout );
          document.removeEventListener('touchmove', self.touchmoveHandler);
          document.removeEventListener('touchend', self.touchendHandler);
          self.press(e);
          // press
        },this.press_time);

        this.touchmoveHandler = function(e){
          self.touchMove(e);
        }
        document.addEventListener('touchmove', this.touchmoveHandler);
        
        this.touchendHandler = function(e){
          clearTimeout( self.press_timeout );
          document.removeEventListener('touchmove', self.touchmoveHandler);
          document.removeEventListener('touchend', self.touchendHandler);
          self.tap(e);
          // tap
        }
        document.addEventListener('touchend', this.touchendHandler);
      },
      touchMove: function(e){
        var touch = e.targetTouches[0];
        this.total_delta = {
          x: touch.clientX - this.start_pos.x,
          y: touch.clientY - this.start_pos.y
        };

        var tdelta = 
            this.total_delta.x * this.total_delta.x 
          + this.total_delta.y * this.total_delta.y;

        if( tdelta > this.pos_threshold*this.pos_threshold ){
          clearTimeout( this.press_timeout );
          document.removeEventListener('touchmove', this.touchmoveHandler);
          document.removeEventListener('touchend', this.touchendHandler);
          // nothing
        }
      },
      listeners: {},
      emit: function(ev, e){
        if(this.listeners[ev]){
          for( var i = 0 ; i < this.listeners[ev].length ; i++ ){
            this.listeners[ev][i](e);
          }
        }
      },
      on: function(ev, cb){
        this.listeners[ev] = this.listeners[ev] || [];
        this.listeners[ev].push(cb);
      },
      onPress: function(cb){
        this.on('press', cb);
      },
      onTap: function(cb){
        this.on('tap', cb);
      },
      press: function(e){
        this.emit('press', e);
      },
      tap: function(e){
        this.emit('tap', e);
      }
    }
    if(e)
      p.touchStart(e);

    return p;
  }
  
  var el = this.$.vue[0];
  var nv = new Vue({
    el: el,
    data: {
      draw: 0,
      loading: false,
      selecting: false,
      fields: [{
        title: 'Name',
        name: 'name',
        visible: true,
        render: function(v){
          return v;
        }
      },{
        title: 'Type',
        name: 'type',
        visible: true,
        sortable: false,
        render: function(u, v){
          if( v.type === 'folder' )
            return 'Folder';

          return (formatMap[v.name.split('.').slice(-1)[0]]||{desc:'Other'}).desc;
        }
      },{
        title: 'Size',
        name: 'length',
        visible: true,
        render: function(v){
          v = v|0;

          if( v === undefined )
            return;
          if( v === 0 )
            return '0 B';
          var i = Math.floor( Math.log(v) / Math.log(1000) );
          return ( v / Math.pow(1000, i) ).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
        }
      },{
        title: 'Created',
        name: 'creationData',
        visible: true,
        render: function(d){
          return (new Date(d)).toLocaleString()
        }
      }],
      path: [],
      currentPage: [],
      total: 0,
      filtered: 0,
      view: 'list',
      history: [[]],
      history_pos: 0,
      perPage: 5,
      sort: 'name',
      filter: '',
      sortdir: 'asc',
      page: 1
    },
    computed: {
      pagesTotal: function(){
        return Math.ceil(this.filtered/this.perPage);
      },
      pageList: function(){
        var pages = [];
        var etc_previous = false
        for( var i = 1 ; i <= this.pagesTotal ; i++ ){
          if( i <= 2 || ( i <= this.page +2 && i >= this.page -2 ) || i >= this.pagesTotal  -1){
            pages.push(i);
            etc_previous = false;
          }else{
            if( !etc_previous ){
              pages.push('...');
              etc_previous = true;
            }
          }
        }
        return pages;
      },
      currentFolder: function(){
        var self = this;
        var current = this.structure;
        for( var i = 0 ; i < this.path.length ; i++ ){
          current = current.children.find(function(c){
            return c.name === self.path[i];
          });
        }
        return current;
      }
    },
    created: function () {
      // `this` points to the vm instance
      DEBUG.log('a is: ' + this.a)
      this.load();
    },
    watch: {
      'path': function(val){
        this.page = 1;
        this.load();
      }
    },
    methods: {
      changePage: function( ev, p ){
        ev.preventDefault();
        if( !ev.target.classList.contains('disabled') ){
          this.page= p;
          this.load();
        }
      },
      refresh: function(){
        this.load();
      },
      changePath: function(){
        
      },
      changeview: function(v){
        this.view = v;
      },
      getFolder: function(opts, cb){
        var self = this;

        this.loading = true;

        fileGet(opts, function(d){
          var data = {
            total: d.recordsTotal,
            filtered: d.recordsFiltered,
            files: d.data.map(function(f){
              return {
                length: f.length,
                name: f.name,
                creationData: f.creationData,
                lastWriteTime: f.lastWriteTime,
                type: f.type
              }
            })
          }
          self.loading = false;
          self.total = data.total;
          self.filtered = data.filtered;
          self.currentPage = data.files;
        });
      },
      selected: function(n){
        this.selecting = n > 0;
      },
      unselect: function(n){
        this.$refs.folder.unselect();
      },
      goto: function(p){
        this.path = p;
        if( this.history_pos > 0 ){
          this.history = this.history.slice(0, this.history_pos*-1);
          this.history_pos = 0;
        }
        this.history.push(this.path.slice());
      },
      down: function(p){
        this.path.push(p);
        if( this.history_pos > 0 ){
          this.history = this.history.slice(0, this.history_pos*-1);
          this.history_pos = 0;
        }
        this.history.push(this.path.slice());
      },
      up: function(){
        if( this.path.length === 0 )
          return;

        this.path.pop();
        if( this.history_pos > 0 ){
          this.history = this.history.slice(0, this.history_pos*-1);
          this.history_pos = 0;
        }
        this.history.push(this.path.slice());
      },
      back: function(){
        if( this.history_pos < this.history.length ){
          this.history_pos++;
          this.path = this.history[(this.history.length-1)-this.history_pos].slice();
        }
      },
      forward: function(){
        if( this.history_pos > 0 ){
          this.history_pos--;
          this.path = this.history[(this.history.length-1)-this.history_pos].slice();
        }
      },
      load: function(){
        this.getFolder({
          path: this.path.join('/'),
          sort: this.sort,
          sortDir: this.sortdir,
          start: (this.page-1)*this.perPage,
          draw: this.draw++,
          filter: this.filter,
          length: this.perPage,
          subFolders: true
        }, function(){})
      },
      search: function(v){
        this.filter = v;
        this.load();
      },
      togglevis: function(field){
        var f = this.fields.find(function(f){
          return f.name === field.name;
        });
        if( !f )
          return;

        if( f.visible === false ){
          f.visible = true;
        }else{
          f.visible = false;
        }
      },
      sortby: function( s ){
        if( this.sort === s ){
          this.sortdir = this.sortdir === 'desc' ? 'asc' : 'desc';
        }else{
          this.sort = s;
          this.sortdir = 'desc';
        }
        this.load();
      }
    },
    components: {
      'action-bar': {
        props: ['view','path','history','history_pos', 'fields','sort','sortdir'],
        name: 'action-bar',
        template: 
          '<div class="fe-action-bar">'
        + '  <div @click="up" v-bind:class="{disabled:path.length===0}" class="btn btn-sm btn-default btn-flat">'
        + '    <i class="fa fa-fw fa-level-up fa-flip-horizontal"></i>'
        + '  </div>'
        + '  <sp></sp>'
        + '  <div @click="back" v-bind:class="{disabled:history_pos>=(history.length-1)}" class="btn btn-sm btn-default btn-flat">'
        + '    <i class="fa fa-fw fa-chevron-left"></i>'
        + '  </div>'
        + '  <div @click="forward" v-bind:class="{disabled:history_pos===0}" class="btn btn-sm btn-default btn-flat">'
        + '    <i class="fa fa-fw fa-chevron-right"></i>'
        + '  </div>'
        + '  <div style="float:right;">'
        + '    <div class="dropdown" style="display:inline-block;" v-if="view === \'list\'">'
        + '      <div href="#" class="btn btn-sm btn-default btn-flat dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">'
        + '        <i class="fa fa-fw fa-eye"></i>'
        + '      </div>'
        + '      <ul class="dropdown-menu dropdown-menu-right">'
        + '        <li @click="togglevis(f, $event)" v-for="f in fields">'
        + '          <a href="#">'
        + '            <i v-bind:class="f.visible!==false?\'fa-check-square-o\':\'fa-square-o\'" class="fa fa-fw"></i>'
        + '            <span>{{f.title}}</span>'
        + '          </a>'
        + '        </li>'
        + '      </ul>'
        + '    </div>'
        + '    <div class="dropdown" style="display:inline-block;">'
        + '      <div href="#" class="btn btn-sm btn-default btn-flat dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">'
        + '        <i class="fa fa-fw fa-sort-amount-asc"></i>'
        + '      </div>'
        + '      <ul class="dropdown-menu dropdown-menu-right">'
        + '        <li v-if="f.sortable !== false" @click="sortby(f, $event)" v-for="f in fields">'
        + '          <a href="#" v-bind:class="sortClass(f)" >'
        + '            <span class="fe-order fa-stack">'
        + '              <i class="fa fa-sort-up fa-stack-1x"></i>'
        + '              <i class="fa fa-sort-down fa-stack-1x"></i>'
        + '            </span>'
        + '            <span>{{f.title}}</span>'
        + '          </a>'
        + '        </li>'
        + '      </ul>'
        + '    </div>'
        + '    <sp></sp>'
        + '    <div class="btn btn-sm btn-default btn-flat" @click="changeview(\'tiles\')" v-bind:class="{active: view === \'tiles\'}">'
        + '      <i class="fa fa-fw fa-th-large"></i>'
        + '    </div>'
        + '    <div class="btn btn-sm btn-default btn-flat" @click="changeview(\'list\')" v-bind:class="{active: view === \'list\'}">'
        + '      <i class="fa fa-fw fa-th-list"></i>'
        + '    </div>'
        + '    <sp></sp>'
        + '    <div class="btn btn-sm btn-default btn-flat" @click="refresh">'
        + '      <i class="fa fa-fw fa-refresh"></i>'
        + '    </div>'
        + '  </div>'
        + '</div>',
        components: {
          'sp': {
            name: 'sp',
            template: '<span style="width:5px;display: inline-block;"></span>'
          }
        },
        methods: {
          refresh: function(){
            this.$emit('refresh');
          },
          back: function(){
            this.$emit('back');
          },
          forward: function(){
            this.$emit('forward');
          },
          up: function(){
            this.$emit('up');
          },
          changeview: function(v){
            this.$emit('changeview', v);
          },
          sortClass: function(f){
            var c = [];

            if( f.sortable !== false )
              c.push('sortable')

            if( this.sort === f.name ){
              c.push(this.sortdir);
            }

            return c;
          },
          togglevis: function(f, ev){
            this.$emit('togglevis', f);
            ev.preventDefault();
            ev.stopPropagation();
            return false;
          },
          sortby: function( f, ev ){
            this.$emit('sortby', f.name);
            ev.preventDefault();
            ev.stopPropagation();
          }
        }
      },
      'nav-bar': {
        name: 'nav-bar',
        props: ['path'],
        data: function(){
          return {
            editing: false,
            searchval: ''
          }
        },
        methods: {
          search:function(){
            this.$emit('search', this.searchval);
          },
          searchinput: function(ev){
            var self = this;

            if( this.timeout ){
              clearTimeout(this.timeout);
            }

            this.timeout = setTimeout(function(){
              self.timeout = null;

              self.search();
            }, 500);
          },
          togglesearch: function(ev){
            ev.currentTarget.classList.toggle('open');

            if( ev.currentTarget.classList.contains('open') ){
              $(ev.currentTarget).parent().find('input').focus();
            }
          },
          nav: function(p){
            this.$emit('nav', p);
          },
          editPath: function(p){
            this.editing = !this.editing;
          }
        },
        template: 
          '<div class="fe-nav-bar">'
        /* TODO
        + '  <div @click="editPath" class="btn btn-xs btn-default btn-flat">'
        + '    <i class="fa fa-fw fa-pencil"></i>'
        + '  </div>'
        + '  <input class="fe-path-edit" v-show="editing" type="text" v-bind:value="\'/\'+path.join(\'/\')" />'
        */
        + '  <breadcrumb v-show="!editing" @nav="nav" :path="path"></breadcrumb>'
        + '  <div class="pull-right fe-dropdown">'
        + '    <div class="btn btn-xs btn-default btn-flat fe-dropper" @click="togglesearch">'
        + '      <i class="fa fa-fw fa-search"></i>'
        + '    </div>'
        + '    <div class="fe-dropped">'
        + '      <div class="input-group input-group-sm">'
        + '        <input style="width: 150px;" type="text" class="form-control" v-model="searchval" @input="searchinput" @keydown.enter="search" />'
        /* TODO
        + '        <span class="input-group-btn">'
        + '          <div class="btn btn-default btn-flat">'
        + '            <i class="fa fa-fw fa-bullseye"></i>'
        + '          </div>'
        + '        </span>'
        */
        + '      </div>'
        + '    </div>'
        + '  </div>'
        + '</div>',
        components: {
          'breadcrumb': {
            name: 'breadcrumb',
            props: ['path'],
            methods: {
              nav: function(p){
                this.$emit('nav', this.path.slice(0, p));
              }
            },
            template: 
              '<div class="fe-breadcrumb">'
            + '  <div v-bind:class="{active : path.length === 0}" class="fe-crumb btn btn-flat btn-default btn-xs" @click="nav(0)">'
            + '    <i class="fa fa-fw fa-home"></i>'
            + '  </div>'

            + '<template v-for="(p, index) in path">'
            + '  <div v-bind:class="{active : index === (path.length-1)}" class="fe-crumb btn btn-flat btn-default btn-xs" @click="nav(index+1)">'
            + '    {{ p }}'
            + '  </div>'
            + '</template>'

            + '</div>'
          }
        }
      },
      'folder': {
        name: 'folder',
        props: ['files', 'loading','view','fields', 'sort', 'sortdir'],
        data: function(){
          return {
            selecting: false
          }
        },
        methods: {
          nav: function(p){
            this.$emit('nav', p);
            this.selecting = false;
            this.$emit('selecting', 0);
          },
          open: function(p){
            this.$emit('open', p);
            this.selecting = false;
            this.$emit('selecting', 0);
          },
          selected: function(p){
            var selected = this.$children.reduce(function(a,f){
              return a+(f.selected?1:0)
            },0);
            this.selecting = ( selected > 0 );
            this.$emit('selecting', selected);
          },
          unselect: function(){
            this.$children.forEach(function(f){
              f.selected = false;
            });
            this.selecting = false;
            this.$emit('selecting', 0);
          },
          sortClass: function(f){
            var c = [];

            if( f.sortable !== false )
              c.push('sortable')

            if( this.sort === f.name ){
              c.push(this.sortdir);
            }

            return c;
          },
          sortby: function( f, ev ){
            if( !ev.currentTarget.classList.contains('sortable') )
              return;

            this.$emit('sortby', f.name);
          }
        },
        template: 
          '<div class="fe-folder">'
        + '  <div v-show="loading" class="fe-loader">'
        + '    <div class="fe-sig"></div>'
        + '  </div>'
        + '  <div v-if="view === \'tiles\'" class="fe-files">'
        + '    <item :fields="fields" :view="view" v-for="file in files" :selecting="selecting" :key="file.name" @nav="nav" @selected="selected" :file="file">'
        + '    </item>'
        + '  </div>'
        + '  <table v-if="view === \'list\'" class="fe-list-files">'
        + '    <tr>'
        + '      <th class="fe-list-icon min-width">'
        + '      </th>'
        + '      <th v-bind:class="sortClass(f)" @click="sortby(f, $event)" v-for="f in fields"  v-if="f.visible !== false">'
        + '        <span>{{f.title}}</span>'
        + '        <span class="fe-order fa-stack">'
        + '          <template v-if="f.sortable !== false" >'
        + '            <i class="fa fa-sort-up fa-stack-1x"></i>'
        + '            <i class="fa fa-sort-down fa-stack-1x"></i>'
        + '          </template>'
        + '        </span>'
        + '      </th>'
        + '    </tr>'
        + '    <tbody>'
        + '      <item :fields="fields" :view="view" v-for="file in files" :selecting="selecting" :key="file.name" @nav="nav" @selected="selected" :file="file">'
        + '      </item>'
        + '    </tbody>'
        + '  </table>'
        + '</div>',
        components: {
          'item': {
            name: 'item',
            props: ['file', 'selecting', 'view', 'fields'],
            data: function(){
              return {
                selected: false,
                touchTimer: null
              }
            },
            template: 
              '<div v-if="view === \'tiles\'" v-bind:class="cssClass" class="fe-tiles-item" '
            + '  @click="select" @dblclick="nav"'
            + '  @touchstart="touchStart"'
            + '  >'
            + '  <div class="fe-tiles-icon">'
            + '    <i v-bind:class="icon" class="fa fa-fw"></i>'
            + '  </div>'
            + '  <div class="fe-desc">'
            + '    <div class="fe-desc-name">{{file.name}}</div>'
            + '    <div class="fe-desc-detail">{{render(fields[1], file)}}</div>'
            + '  </div>'
            + '</div>'
            + '<tr v-else-if="view === \'list\'" v-bind:class="cssClass" class="fe-list-item" '
            + '  @click="select" @dblclick="nav"'
            + '  @touchstart="touchStart"'
            + '  >'
            + '  <td class="fe-list-icon min-width">'
            + '    <i v-bind:class="icon" class="fa fa-fw"></i>'
            + '  </td>'
            + '  <td v-for="f in fields" v-if="f.visible !== false">'
            + '    <span>{{render(f, file)}}</span>'
            + '  </td>'
            + '</tr>',
            computed: {
              cssClass: function(){
                return ['item-'+this.file.type, this.selected?'selected':'']
              },
              icon: function(){
                if( this.file.type === 'folder' )
                  return 'fa-folder-o';

                if( this.file.type === 'file' ){
                  if( this.file.format === 'pdf' )
                    return 'fa-file-pdf-o';
                  if( this.file.format === 'excel' )
                    return 'fa-file-excel-o';
                  if( this.file.format === 'word' )
                    return 'fa-file-word-o';
                  if( this.file.format === 'text' )
                    return 'fa-file-text-o';
                  if( this.file.format === 'image' )
                    return 'fa-file-image-o';
                  if( this.file.format === 'code' )
                    return 'fa-file-code-o';

                  return 'fa-file-o';
                }
                return 'fa-file-o';
              }
            },
            methods: {
              render: function( f, v ){
                if( f.render )
                  return f.render(v[f.name], v)
                return v[f.name]
              },
              touchStart: function(e){
                var self = this;
                var p = pointy(e);
                p.on('tap', function(){
                  DEBUG.log('tap');
                  if( self.selecting ){
                    self.select();
                  }else{
                    self.nav();
                  }
                  self.preventTimer = Date.now() + 100;
                });
                p.on('press', function(){
                  DEBUG.log('press');
                  self.select();
                  self.preventTimer = Date.now() + 100;
                });
              },
              nav: function(e){
                DEBUG.log('nav')
                if( this.file.type === 'folder' ){
                  this.$emit('nav', this.file.name);
                }else{
                  this.$emit('open', this.file.name);
                }
                e && e.preventDefault && e.preventDefault();
              },
              select: function(e){
                DEBUG.log(e && e.type);
                DEBUG.log('select')
                if( e && ( e.type === 'click' && Date.now() < ( this.preventTimer || 0 ) ) )
                  return;
                this.selected = !this.selected;
                this.$emit('selected');
                e && e.preventDefault && e.preventDefault();
              }
            }
          }
        }
      }
    }
  });

  var formatMap = {
    // PDF
    'pdf': {
      format: 'pdf',
      desc: 'PDF'
    },

    // Excel
    'xls': {
      format: 'excel',
      desc: 'Spreadsheet'
    },
    'xlsx': {
      format: 'excel',
      desc: 'Spreadsheet'
    },

    // Word
    'doc': {
      format: 'word',
      desc: 'Word'
    },
    'docx': {
      format: 'word',
      desc: 'Word'
    },

    // Image
    'png': {
      format: 'image',
      desc: 'Image'
    },
    'jpg': {
      format: 'image',
      desc: 'Image'
    },
    'jpeg': {
      format: 'image',
      desc: 'Image'
    },
    'bmp': {
      format: 'image',
      desc: 'Image'
    },
    'gif': {
      format: 'image',
      desc: 'Image'
    },

    // Text
    'txt' : {
      format: 'text',
      desc: 'Text'
    },
    'log' : {
      format: 'text',
      desc: 'Text'
    },

    // Zip
    'zip' : {
      format: 'zip',
      desc: 'Archive file'
    },
    'gz' : {
      format: 'zip',
      desc: 'Archive file'
    },
    'tar' : {
      format: 'zip',
      desc: 'Archive file'
    },
    'bz2' : {
      format: 'zip',
      desc: 'Archive file'
    },
    'rar' : {
      format: 'zip',
      desc: 'Archive file'
    },
    '7z' : {
      format: 'zip',
      desc: 'Archive file'
    },
    'tgz' : {
      format: 'zip',
      desc: 'Archive file'
    },

    // Code
    'js' : {
      format: 'code',
      desc: 'JS file'
    },
    'css' : {
      format: 'code',
      desc: 'CSS file'
    },
    'html' : {
      format: 'code',
      desc: 'HTML'
    },
    'xml' : {
      format: 'code',
      desc: 'XML'
    },
    'json' : {
      format: 'code',
      desc: 'JSON'
    }
  }
}
Form.Fields.FileExplorer.prototype.bind = function(){
  var self = this;
}
Form.Fields.FileExplorer.prototype.i18n = function(){
  this.$.html.i18n();
}
Form.Fields.FileExplorer.prototype.getData = function(){
  var d = {};
  d[this.json.id] = this.get();
  return d;
}
Form.Fields.FileExplorer.prototype.get = function(){
  return this.value;
}
Form.Fields.FileExplorer.prototype.setData = function( data, preventSave ){
  var val = data[ this.json.id ];
  if( val === null || val === undefined )
    return;

  if( !preventSave )
    this.original = val;

  this.set( val );
}
Form.Fields.FileExplorer.prototype.set = function( val, silent ){
  this.value = val;
  this.$.input.val( val );

  if( !silent )
    this.doChanges();
}
Form.Fields.FileExplorer.prototype.isChanged = function(){
  var val = this.get();
  return val !== this.original &&
    !(this.original === null && val === '' );
}
Form.Fields.FileExplorer.prototype.reset = function(){
  this.set( this.original );
}
Form.Fields.FileExplorer.prototype.clear = function(){
  this.value = null;
  this.original = null;

  this.$.input.val('');
}
Form.Fields.FileExplorer.prototype.applyFieldBinds = function(){
  var self = this;
  var B = this.json.binds;
  if(!B) return;

  B.forEach(function(b){
    var t = self.form._('_'+b.to).get(0);
    // create bind
    t.onChange(function(){
      if( t.get() === b.value ){
        self.do(b.value,b.do, b.to);
      }else{
        self.do(b.value,b.do, b.to, true);
      }
    });
    // apply it
    if( t.get() === b.value ){
      self.do(b.value,b.do, b.to);
    }else{
      self.do(b.value,b.do, b.to, true);
    }
  });
}
Form.Fields.FileExplorer.prototype.validate = function(){
  var self = this;
  // check if has validation settings
  if( !this.json.validation )
    return true;

  var errors = []; // i18n keys

  // setup validation elements
  if( !this._tabli )
    this._tabli = $('[href="#'+this.$.html.closest('.tab-pane').attr('id')+'"]').parent();


  var val = this.json.validation;
  var value = this.get();

  // validate empty
  if( val.required && ( !value || (value+'').trim() === '' ) ){
    // apply error
    // i18n.t('common.errors.required');
    errors.push('app.errors.required-field');
  }

  if( val.custom ){
    (Array.isArray(val.custom)?val.custom:[val.custom]).forEach(function(f){
      var err;
      if(self.form.actions[f]){
        err = self.form.actions[f]( value, self, val );
        if( err )
          errors.push(err);
      }
    })
  }

  if(errors.length > 0){
    self.$.container.closestChildren('.for-error').html(errors.map(function(v){return i18n.t(v); }).join('<br>'));

    this.$.html.closest('.form-group').addClass('has-error');

    var cerrors = (this._tabli.attr('data-validation-error') || '').split(';');
    if( cerrors.indexOf(this.json.id) < 0 ){
      if(cerrors[0] === '')
        cerrors = [];
      cerrors.push(this.json.id);
      this._tabli.attr('data-validation-error', cerrors.join(';'));
    }
    return false;
  }

  // unset errors. set success?
  var cerrors = (this._tabli.attr('data-validation-error') || '').split(';');
  if( cerrors.indexOf(this.json.id) > -1 ){
    cerrors.splice(cerrors.indexOf(this.json.id), 1);
    if(cerrors.length > 0){
      this._tabli.attr('data-validation-error', cerrors.join(';') );
    }else{
      this._tabli.removeAttr('data-validation-error');
    }
  }
  this.$.html.closest('.form-group').removeClass('has-error');
  return true;
}
Form.Fields.FileExplorer.prototype.do = function( value, action, context, undo ){
  var self = this;
  if(!this.state)
    this.state = {};

  // Get previous differences
  var psK = Object.keys(this.state);
  var ps = {}; // previous state
  for( var i = 0 ; i < psK.length ; i++ ){
    ps[this.state[psK[i]]] = true;
  }

  if(undo){
    if(this.state[action+'_'+value+'_'+context]){
      delete this.state[action+'_'+value+'_'+context];
    }else{
      return;
    }
  }else{
    if(!this.state[action+'_'+value+'_'+context]){
      this.state[action+'_'+value+'_'+context] = action;
    }else{
      return;
    }
  }


  // Get current differences
  var csK = Object.keys(this.state);
  var cs = {}; // current state
  for( var i = 0 ; i < csK.length ; i++ ){
    cs[this.state[csK[i]]] = true;
  }

  // Just making bA as a shortcut for bindActions
  var bA = Form.Fields.FileExplorer.bindActions;

  // reset states
  var aK = Object.keys(bA);
  for( var i = 0 ; i < aK.length ; i++ ){
    if( ps[aK[i]] ){      // if in previous
      if( cs[aK[i]] ){    // and in current
        continue;         // same state. do nothing
      }
      bA[aK[i]][1](this); // not in current. undo
    }

    if( cs[aK[i]] ){      // if only in current
      bA[aK[i]][0](this); // apply state
    }
  }
}
Form.Fields.FileExplorer.bindActions = {
  disable: [
    function( self ){ // Do
      self.$.input.prop('disabled', true);
    },
    function( self ){ // Undo
      self.$.input.prop('disabled', false);
    }
  ],
  hide: [
    function( self ){ // Do
      self.$.container.parent().addClass('hidden');
    },
    function( self ){ // Undo
      self.$.container.parent().removeClass('hidden');
    }
  ],
  show: [
    function( self ){ // Do
      self.$.container.parent().removeClass('hidden');
    },
    function( self ){ // Undo
      self.$.container.parent().addClass('hidden');
    }
  ]
}
Form.Fields.FileExplorer.prototype.doChanges = function(){
  var changed = this.isChanged();
  var val = this.get();

  if( changed && !this.json.muted ){
    this.$.container.closest('.form-group').addClass('changed');
  }else{
    this.$.container.closest('.form-group').removeClass('changed');
  }

  for( var i = 0 ; i < this.changeListeners.length ; i++ ){
    this.changeListeners[i]( this.json.id, val, changed );
  }
}
Form.Fields.FileExplorer.prototype.saveData = function(){
  this.original = this.get();
  this.doChanges();
}
Form.Fields.FileExplorer.prototype.refresh = function(){

}
Form.Fields.FileExplorer.html = 
    '<div class="fe-main-window">'
  + '  <action-bar '
  + '    @up="up"  '
  + '    @back="back" '
  + '    @forward="forward" '
  + '    @changeview="changeview" '
  + '    @togglevis="togglevis" '
  + '    @sortby="sortby" '
  + '    @refresh="refresh" '
  + '    :view="view"'
  + '    :sort="sort"'
  + '    :sortdir="sortdir"'
  + '    :history="history" '
  + '    :history_pos="history_pos" '
  + '    :fields="fields"'
  + '    :path="path"'
  + '  >'
  + '  </action-bar>'

  + '  <nav-bar v-show="!selecting" '
  + '    @nav="goto" '
  + '    @search="search" '
  + '    :path="path"'
  + '  ></nav-bar>'

  + '  <div v-show="selecting" class="fe-select-controls">'
  + '    <div @click="unselect" class="btn btn-flat btn-default btn-xs">'
  + '      Cancel selection <i class="fa fa-fw fa-times"></i>'
  + '    </div>'
  + '  </div>'
  + '      '
  + '  <folder ref="folder" '
  + '    @selecting="selected" '
  + '    @nav="down" '
  + '    @sortby="sortby" '
  + '    :loading="loading" '
  + '    :files="currentPage"'
  + '    :view="view"'
  + '    :sort="sort"'
  + '    :sortdir="sortdir"'
  + '    :fields="fields"'
  + '    >'
  + '  </folder>'
  + '  <ul class="fe-pages pagination pagination-sm">'
  + '    <li '
  + '      v-bind:class="{\'active\':n===page,\'disabled\':n===\'...\'}" '
  + '      v-for="n in pageList"'
  + '      @click="n!=\'...\'&&changePage($event, n)"'
  + '      >'
  + '      <a href="#">'
  + '        {{n}}'
  + '      </a>'
  + '    </li>'
  + '  </ul>'
  + '</div>'
   ;
Form.Fields.FileExplorer.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];

  this.changeListeners.push( callback );
}
Form.Fields.FileExplorer.prototype._ = scopeInterface;
Form.Fields.FileExplorer.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('FileExplorer').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};
/**
 * FileInput
 */

Form.Fields.FileInput = function FileInput(scope, container, json) {
	this.scope = scope;
	this.children = [];
	this.container = container;
	this.json = json;

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;
	this.form = this._("^form").get(0);

	this.value = null;
	this.original = null;

	this.changeListeners = [];
	this._state = {
		readonly: {},
		hidden: {},
	};

	this.init();
};
Form.Fields.FileInput.prototype.init = function () {
	var html = Form.Template(this.json, {
		data: {
			input: true,
		},
	});
	this.$.html = $(html);
	if (this.json.visibility === "hidden")
		this.$.container.parent().addClass("hidden");

	this.$.container.append(this.$.html);
	this.$.input = this.$.container.find("input");
	this.$.files = this.$.container.find(".files");

	if (this.json.parseCallback) {
		this.parseCallback = this.form.actions[this.json.parseCallback];
	}

	if (this.json.regex) {
		try {
			this.regex = RegExp(this.json.regex);
		} catch (err) {
			console.error(err);
		}
	}
	if (this.json.maxFiles) {
		this.maxFiles = this.json.maxFiles;
	}

	this.url = this.json.url;
	this.files = [];

	this.bind();
	this.i18n();
};
Form.Fields.FileInput.prototype.bind = function () {
	var self = this;
	function sendFiles(files, isLocal) {
		for (var i = 0, file = files[0]; i < files.length; i++, file = files[i]) {
			if (
				self.maxFiles &&
				self.children.filter(function (f) {
					return !f.info.deleted;
				}).length >= self.maxFiles
			)
				return;

			if (self.regex && !self.regex.test(file.name)) return;

			var f = new self.constructor.File(
				self,
				{
					filename: file.name,
					description: file.name,
					mimetype: file.type,
				},
				self.json.url,
				file,
				isLocal
			);
			self.children.push(f);
			self.$.files.append(f.$.html);
		}
	}

	this.$.input.on("input", function (ev) {
		var fs = self.$.input[0].files;
		sendFiles(fs, self.json.noUpload);
	});
	this.$.html
		.on(
			"drag dragstart dragend dragover dragenter dragleave drop",
			function (e) {
				e.preventDefault();
				e.stopPropagation();
			}
		)
		.on("dragover dragenter", function (e) {
			self.$.html.addClass("is-dragover");
		})
		.on("dragleave dragend", function (e) {
			self.$.html.removeClass("is-dragover");
		})
		.on("drop", function (e) {
			self.$.html.removeClass("is-dragover");
			sendFiles(e.originalEvent.dataTransfer.files, self.json.noUpload);
		});
};

Form.Fields.FileInput.File = function File(scope, info, url, file, isLocal) {
	console.log("???? ~ file: fileinput.js ~ line 113 ~ File ~ isLocal", isLocal);

	var self = this;
	this.scope = scope;
	this.info = info;
	this.$ = {};
	this.$.html = $(this.render(info));
	this.$.progress = this.$.html.find(".file-progress");

	this.$.desc = this.$.html.find("input.fi-file-desc");
	this.$.name = this.$.html.find("input.fi-file-name");
	this.$.del = this.$.html.find(".fi-delete");

	this.$.desc.val(info.filename);
	this.$.name.val(info.description);

	this.$.desc
		.on("change input", function () {
			info.filename = this.value;
			this.size = this.value.length;
		})
		.attr("size", info.filename.length);
	this.$.name
		.on("change input", function () {
			info.description = this.value;
			this.size = this.value.length;
		})
		.attr("size", info.description.length);

	this.$.del.on("click", function () {
		info.deleted = true;
		self.$.del.remove();
		self.$.name.prop("disabled", true);
		self.$.progress.remove();
		self.$.desc.parent().remove();
		self.$.html.css("opacity", ".5");

		if (!self.busy) {
			self.$.html.css("border-color", "gray");
		} else {
			self.req.request.ajax.abort();
			self.$.html.css("border-color", "red");
		}
	});

	this.i18n();
	if (isLocal) {
		// readFile / parse
		const reader = new FileReader();
		reader.addEventListener(
			"load",
			() => {
				this.info.data = this.scope.parseCallback(reader.result);
			},
			false
		);

		if (file) {
			reader.readAsText(file, this.scope.json.encoding);
		}
	} else if (url && file) {
		this.upload(url, file);
	} else {
		this.original = JSON.simpleCopy(info);
	}
};
Form.Fields.FileInput.File.prototype.upload = function (url, file) {
	var self = this;
	this.progress = 0;

	this.busy = true;

	self.p = new Promise(function (resolve, reject) {
		self.req = Tools.Ajax.defaultUpload(url, file, {
			"fi-filename": self.info.filename,
			"fi-description": self.info.description,
			"fi-mimetype": self.info.mimetype,
		});
		self.req.upProgress(function (p) {
			self.progress = p;
			self.$.progress.css("width", p * 100 + "%");
		});
		self.req.then(function (id) {
			self.info.id = id;
			self.busy = false;
			resolve();
		});
		self.req.catch(function (err) {
			self.busy = false;
			self.setError();
			resolve();
		});
	});
};
Form.Fields.FileInput.File.prototype.isChanged = function () {
	if (this.info.deleted && !this.original) return false;

	if (!this.original) return true;

	if (this.info.deleted) return true;

	return (
		this.info.filename !== this.original.filename ||
		this.info.description !== this.original.description
	);
};
Form.Fields.FileInput.File.prototype.setError = function () {
	// remove delete button
	this.$.del.remove();
	this.$.name.disable();
	this.$.progress.remove();
	this.$.desc.parent().remove();
	this.$.html.css("border-color", "red");
	this.info.deleted = true;
	this.$.html.css("opacity", ".5");
};
Form.Fields.FileInput.File.prototype.get = function () {
	return this.info;
};
Form.Fields.FileInput.File.prototype.i18n = function () {
	this.$.html.i18n();
};
Form.Fields.FileInput.File.prototype.isBusy = function () {
	return this.busy;
};
Form.Fields.FileInput.File.prototype.whenReady = function () {
	return this.p;
};
Form.Fields.FileInput.File.prototype.render = Handlebars.compile(`
  <div class="file-info">
    <i class="fa fa-times fi-delete"></i>
    <div class="fi-file-details" style="">
      <div>
        <span>File name:</span>
        <input class="fi-file-name" type="text" />
      </div>
      <div>
        <span>Description:</span>
        <input class="fi-file-desc" type="text" />
      </div>
    </div>
    <div class="file-progress"></div>
  </div>
`);

Form.Fields.FileInput.prototype.i18n = function () {
	this.$.html.i18n();
};
Form.Fields.FileInput.prototype.checkPermissions = function (userPermissions) {
	if (!this.json.permissions) {
		return;
	}

	Object.keys(this.json.permissions).forEach((k) => {
		const permission = k;
		const state = this.json.permissions[k];
		const hasPermission = userPermissions.indexOf(permission) > -1;

		if (state === "readonly") {
			this.readonly(!hasPermission, permission);
		}
		if (state === "hidden") {
			this.hidden(!hasPermission, permission);
		}
	});
};
Form.Fields.FileInput.prototype.hidden = function (set, namespace) {
	if (typeof namespace === "undefined" && typeof set === "undefined") {
		return Object.keys(this._state.hidden).reduce(
			(acc, k) => acc || this._state.hidden[k],
			false
		);
	}

	if (typeof set === "undefined") {
		return this._state.hidden[namespace];
	}

	namespace = namespace == null ? "anon" : namespace;

	this._state.hidden[namespace] = set;

	this.isHidden = Object.keys(this._state.hidden).reduce(
		(acc, k) => acc || this._state.hidden[k],
		false
	);

	if (this.isHidden) {
		this.$.container.addClass("hidden");
	} else {
		this.$.container.removeClass("hidden");
	}
};
Form.Fields.FileInput.prototype.readonly = function (set, namespace) {
	if (typeof namespace === "undefined" && typeof set === "undefined") {
		return Object.keys(this._state.readonly).reduce(
			(acc, k) => acc || this._state.readonly[k],
			false
		);
	}
	if (typeof set === "undefined") {
		return this._state.readonly[namespace];
	}

	namespace = namespace == null ? "anon" : namespace;

	this._state.readonly[namespace] = set;

	this.isReadOnly = Object.keys(this._state.readonly).reduce(
		(acc, k) => acc || this._state.readonly[k],
		false
	);
	this.$.input.attr("readonly", this.isReadOnly);
};
Form.Fields.FileInput.prototype.getData = function () {
	var d = {};
	d[this.json.id] = this.get();
	return d;
};
Form.Fields.FileInput.prototype.get = function () {
	return this.children
		.map(function (f) {
			return f.get();
		})
		.filter(function (f) {
			return !f.deleted || !!f.id;
		});
};
Form.Fields.FileInput.prototype.setData = function (data) {
	this.clear();
	this.original = data[this.json.id] || [];

	data[this.json.id] = this.original;
	this.set(this.original);
};
Form.Fields.FileInput.prototype.set = function (val) {
	for (var i = 0, file = val[0]; i < val.length; i++, file = val[i]) {
		var f = new this.constructor.File(this, file);
		this.children.push(f);
		this.$.files.append(f.$.html);
	}
	this.doChanges();
};
Form.Fields.FileInput.prototype.isChanged = function () {
	return this.children.reduce(function (p, c) {
		return p || c.isChanged();
	}, false);
};
Form.Fields.FileInput.prototype.reset = function () {
	this.set(this.original);
};
Form.Fields.FileInput.prototype.clear = function () {
	this.$.files.empty();
	this.children = [];
};
Form.Fields.FileInput.prototype.isBusy = function () {
	return this.children.reduce(function (p, c) {
		return p || (c.isBusy && c.isBusy());
	}, false);
};
Form.Fields.FileInput.prototype.whenReady = function () {
	var ps = this.children
		.filter(function (c) {
			return c.whenReady && c.isBusy();
		})
		.map(function (c) {
			return c.whenReady();
		});

	return Promise.all(ps);
};
Form.Fields.FileInput.prototype.applyFieldBinds = function () {
	var self = this;
	var B = this.json.binds;
	if (!B) return;

	B.forEach(function (b) {
		if (b.to) {
			var t = self.form._("_" + b.to).get(0);
			// create bind
			t.onChange(function () {
				var get = t.get();
				if (
					Array.isArray(get)
						? get.indexOf(b.value) > -1
						: (b.field && get ? get[b.field] : get) == b.value
				) {
					self.do(b.value, b.do, b.to);
				} else {
					self.do(b.value, b.do, b.to, true);
				}
			});
			// apply it
			var get = t.get();
			if (
				Array.isArray(get)
					? get.indexOf(b.value) > -1
					: (b.field && get ? get[b.field] : get) == b.value
			) {
				self.do(b.value, b.do, b.to);
			} else {
				self.do(b.value, b.do, b.to, true);
			}
		} else if (b.target) {
			var t = self;

			t.onChange(function () {
				var get = t.get();
				if ((b.field && get ? get[b.field] : get) == b.value) {
					self.doTo({ type: b.type || "field", target: b.target }, b.do, b.to);
				} else {
					self.doTo(
						{ type: b.type || "field", target: b.target },
						b.do,
						b.to,
						true
					);
				}
			});

			var get = t.get();
			if ((b.field && get ? get[b.field] : get) == b.value) {
				self.doTo({ type: b.type || "field", target: b.target }, b.do, b.to);
			} else {
				self.doTo(
					{ type: b.type || "field", target: b.target },
					b.do,
					b.to,
					true
				);
			}
		}
	});
};
Form.Fields.FileInput.prototype.validate = function () {
	var self = this;
	// check if has validation settings
	if (!this.json.validation) return true;

	var errors = []; // i18n keys

	// setup validation elements
	if (!this._tabli)
		this._tabli = $(
			'[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
		).parent();

	var val = this.json.validation;
	var value = this.get();

	// validate empty
	(Array.isArray(val) ? val : [val]).forEach(function (val) {
		if (val.required && (!value || (value + "").trim() === "")) {
			// apply error
			// i18n.t('common.errors.required');
			errors.push("app.errors.required-field");
		} else if (val.regex) {
			// make regexes
			if (!self.regexes) {
				self.regexes = {};

				val.regex.forEach(function (v, k) {
					self.regexes[k] = new RegExp(k);
				});
			}

			var vK = Object.keys(val.regex);
			for (var i = 0; i < vK.length; i++) {
				var k = vK[i];
				var r = self.regexes[k];

				if (!r.test(value)) {
					errors.push(val.regex[k]);
				}
			}
		}

		if (val.custom) {
			(Array.isArray(val.custom) ? val.custom : [val.custom]).forEach(function (
				f
			) {
				var err;
				if (self.form.actions[f]) {
					err = self.form.actions[f](value, self, val);
					if (err) errors.push(err);
				}
			});
		}
	});
	if (errors.length > 0) {
		self.$.container.closestChildren(".for-error").html(
			errors
				.map(function (v) {
					return i18n.t(v);
				})
				.join("<br>")
		);

		this.$.html.closest(".form-group").addClass("has-error");

		var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
		if (cerrors.indexOf(this.json.id) < 0) {
			if (cerrors[0] === "") cerrors = [];
			cerrors.push(this.json.id);
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		}
		return false;
	}

	// unset errors. set success?
	var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
	if (cerrors.indexOf(this.json.id) > -1) {
		cerrors.splice(cerrors.indexOf(this.json.id), 1);
		if (cerrors.length > 0) {
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		} else {
			this._tabli.removeAttr("data-validation-error");
		}
	}
	this.$.html.closest(".form-group").removeClass("has-error");
	return true;
};
Form.Fields.FileInput.prototype.do = function (value, action, context, undo) {
	console.log(value, action, context, undo);
	var self = this;
	if (!this.state) this.state = {};

	// Get previous differences
	var psK = Object.keys(this.state);
	var ps = {}; // previous state
	for (var i = 0; i < psK.length; i++) {
		ps[this.state[psK[i]]] = true;
	}

	if (undo) {
		if (this.state[action + "_" + value + "_" + context]) {
			delete this.state[action + "_" + value + "_" + context];
		} else {
			return;
		}
	} else {
		if (!this.state[action + "_" + value + "_" + context]) {
			this.state[action + "_" + value + "_" + context] = action;
		} else {
			return;
		}
	}

	// Get current differences
	var csK = Object.keys(this.state);
	var cs = {}; // current state
	for (var i = 0; i < csK.length; i++) {
		cs[this.state[csK[i]]] = true;
	}

	// Just making bA as a shortcut for bindActions
	var bA = Form.Fields.FileInput.bindActions;

	// reset states
	var aK = Object.keys(bA);
	for (var i = 0; i < aK.length; i++) {
		if (ps[aK[i]]) {
			// if in previous
			if (cs[aK[i]]) {
				// and in current
				continue; // same state. do nothing
			}
			bA[aK[i]][1](this); // not in current. undo
		}

		if (cs[aK[i]]) {
			// if only in current
			bA[aK[i]][0](this); // apply state
		}
	}
};
Form.Fields.FileInput.prototype.doTo = function (
	target,
	action,
	context,
	undo
) {
	var self = this;
	if (!this.targetStates) this.targetStates = {};

	if (!this.targetStates[target.type + "_" + target.target])
		this.targetStates[target.type + "_" + target.target] = {};

	// Get previous differences
	var psK = Object.keys(this.targetStates[target.type + "_" + target.target]);
	var ps = {}; // previous state
	for (var i = 0; i < psK.length; i++) {
		ps[this.targetStates[target.type + "_" + target.target][psK[i]]] = true;
	}

	if (undo) {
		if (
			this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			]
		) {
			delete this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			];
		} else {
			return;
		}
	} else {
		if (
			!this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			]
		) {
			this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			] = action;
		} else {
			return;
		}
	}

	// Get current differences
	var csK = Object.keys(this.targetStates[target.type + "_" + target.target]);
	var cs = {}; // current state
	for (var i = 0; i < csK.length; i++) {
		cs[this.targetStates[target.type + "_" + target.target][csK[i]]] = true;
	}

	// Just making bA as a shortcut for bindActions
	var bA = Form.Fields.FileInput.bindActions;

	// reset states
	var aK = Object.keys(bA);
	for (var i = 0; i < aK.length; i++) {
		if (ps[aK[i]]) {
			// if in previous
			if (cs[aK[i]]) {
				// and in current
				continue; // same state. do nothing
			}
			bA[aK[i]][1](this, target); // not in current. undo
		}

		if (cs[aK[i]]) {
			// if only in current
			bA[aK[i]][0](this, target); // apply state
		}
	}
};
Form.Fields.FileInput.bindActions = {
	disable: [
		function (self) {
			self.$.input.attr("disabled", true);
		},
		function (self) {
			self.$.input.attr("disabled", false);
		},
	],
	hide: [
		function (self) {
			// Do
			self.$.container.parent().addClass("hidden");
		},
		function (self) {
			// Undo
			self.$.container.parent().removeClass("hidden");
		},
	],
	show: [
		function (self, target) {
			// Do
			if (target && target.type === "tab") {
				self.form.$.container
					.find('[data-tab-id="' + target.target + '"]')
					.each(function () {
						var $this = $(this);
						var states = JSON.parse(
							decodeURIComponent($this.attr("data-state-shown") || "") || "[]"
						);
						if (states.indexOf(self.json.id) === -1) {
							states.push(self.json.id);
							$this.attr(
								"data-state-shown",
								encodeURIComponent(JSON.stringify(states))
							);
						}
					});
			} else {
				self.$.container.parent().removeClass("hidden");
			}
		},
		function (self, target) {
			// Undo
			if (target && target.type === "tab") {
				self.form.$.container
					.find('[data-tab-id="' + target.target + '"]')
					.each(function () {
						var $this = $(this);
						var states = JSON.parse(
							decodeURIComponent($this.attr("data-state-shown") || "") || "[]"
						);
						if (states.indexOf(self.json.id) > -1) {
							states.splice(states.indexOf(self.json.id), 1);

							if (states.length === 0) {
								$this.removeAttr("data-state-shown");
							} else {
								$this.attr(
									"data-state-shown",
									encodeURIComponent(JSON.stringify(states))
								);
							}
						}
					});
			} else {
				self.$.container.parent().addClass("hidden");
			}
		},
	],
};
Form.Fields.FileInput.prototype.saveData = function () {
	this.setData(this.getData());
	this.doChanges();
};
Form.Fields.FileInput.prototype.refresh = function () {};
Form.Fields.FileInput.prototype.doChanges = function () {
	var changed = this.isChanged();
	var val = this.get();

	if (changed && !this.json.muted) {
		this.$.container.closest(".form-group").addClass("changed");
	} else {
		this.$.container.closest(".form-group").removeClass("changed");
	}

	for (var i = 0; i < this.changeListeners.length; i++) {
		this.changeListeners[i](this.json.id, val, changed);
	}
};
Form.Fields.FileInput.prototype.onChange = function (callback) {
	if (!this.changeListeners) this.changeListeners = [];
	this.changeListeners.push(callback);
};
Form.Fields.FileInput.prototype._ = scopeInterface;
Form.Fields.FileInput.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "FileInput".toLowerCase() ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

/**
 * Hidden
 */

Form.Fields.Hidden = function Hidden(scope, container, json) {
	this.scope = scope;
	this.container = container;
	this.json = json;

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;
	this.form = this._("^form").get(0);

	this.value = null;
	this.original = null;

	this.changeListeners = [];

	this.init();
	this.applyFieldBinds();
};
Form.Fields.Hidden.prototype.init = function () {
	this.$.container.parent().addClass("hidden");
};
Form.Fields.Hidden.prototype.bind = function () {
	// nop
};
Form.Fields.Hidden.prototype.i18n = function () {
	// nop
};
Form.Fields.Hidden.prototype.getData = function () {
	var d = {};
	d[this.json.id] = this.value;
	return d;
};
Form.Fields.Hidden.prototype.get = function () {
	return this.value;
};
Form.Fields.Hidden.prototype.setData = function (data, preventSave) {
	if (!preventSave) this.original = data[this.json.id];

	this.set(this.original);
};
Form.Fields.Hidden.prototype.set = function (val) {
	this.value = val;
	this.doChanges();

	//this.$input.val( val );
};
Form.Fields.Hidden.prototype.isChanged = function () {
	return this.get() !== this.original;
};
Form.Fields.Hidden.prototype.clear = function () {
	this.value = null;
	this.original = null;

	//this.$.html.val('');
};
Form.Fields.Hidden.prototype.validate = function () {
	// stub
};
Form.Fields.Hidden.prototype.saveData = function () {};
Form.Fields.Hidden.prototype.refresh = function () {
	// nop
};
Form.Fields.Hidden.prototype.reset = function () {
	// nop
};
Form.Fields.Hidden.prototype.applyFieldBinds = function () {
	var self = this;
	var B = this.json.binds;
	if (!B) return;

	B.forEach(function (b) {
		if (b.to) {
			var t = self.form._("_" + b.to).get(0);
			// create bind
			t.onChange(function () {
				var get = t.get();
				if ((b.field && get ? get[b.field] : get) == b.value) {
					self.do(b.do, b.to);
				} else {
					self.do(b.do, b.to, true);
				}
			});
			// apply it
			var get = t.get();
			if ((b.field && get ? get[b.field] : get) == b.value) {
				self.do(b.do, b.to);
			} else {
				self.do(b.do, b.to, true);
			}
		} else if (b.target) {
			var t = self;

			t.onChange(function () {
				var get = t.get();
				if ((b.field && get ? get[b.field] : get) == b.value) {
					self.doTo({ type: b.type || "field", target: b.target }, b.do, b.to);
				} else {
					self.doTo(
						{ type: b.type || "field", target: b.target },
						b.do,
						b.to,
						true
					);
				}
			});

			var get = t.get();
			if ((b.field && get ? get[b.field] : get) == b.value) {
				self.doTo({ type: b.type || "field", target: b.target }, b.do, b.to);
			} else {
				self.doTo(
					{ type: b.type || "field", target: b.target },
					b.do,
					b.to,
					true
				);
			}
		}
	});
};
Form.Fields.Hidden.prototype.do = function (action, context, undo) {
	var self = this;
	if (!this.state) this.state = {};

	// Get previous differences
	var psK = Object.keys(this.state);
	var ps = {}; // previous state
	for (var i = 0; i < psK.length; i++) {
		ps[this.state[psK[i]]] = true;
	}

	if (undo) {
		if (this.state[action + "_" + context]) {
			delete this.state[action + "_" + context];
		} else {
			return;
		}
	} else {
		if (!this.state[action + "_" + context]) {
			this.state[action + "_" + context] = action;
		} else {
			return;
		}
	}

	// Get current differences
	var csK = Object.keys(this.state);
	var cs = {}; // current state
	for (var i = 0; i < csK.length; i++) {
		cs[this.state[csK[i]]] = true;
	}

	// Just making bA as a shortcut for bindActions
	var bA = Form.Fields.Hidden.bindActions;

	// reset states
	var aK = Object.keys(bA);
	for (var i = 0; i < aK.length; i++) {
		if (ps[aK[i]]) {
			// if in previous
			if (cs[aK[i]]) {
				// and in current
				continue; // same state. do nothing
			}
			bA[aK[i]][1](this); // not in current. undo
		}

		if (cs[aK[i]]) {
			// if only in current
			bA[aK[i]][0](this); // apply state
		}
	}
};
Form.Fields.Hidden.prototype.doTo = function (target, action, context, undo) {
	var self = this;
	if (!this.targetStates) this.targetStates = {};

	if (!this.targetStates[target.type + "_" + target.target])
		this.targetStates[target.type + "_" + target.target] = {};

	// Get previous differences
	var psK = Object.keys(this.targetStates[target.type + "_" + target.target]);
	var ps = {}; // previous state
	for (var i = 0; i < psK.length; i++) {
		ps[this.targetStates[target.type + "_" + target.target][psK[i]]] = true;
	}

	if (undo) {
		if (
			this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			]
		) {
			delete this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			];
		} else {
			return;
		}
	} else {
		if (
			!this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			]
		) {
			this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			] = action;
		} else {
			return;
		}
	}

	// Get current differences
	var csK = Object.keys(this.targetStates[target.type + "_" + target.target]);
	var cs = {}; // current state
	for (var i = 0; i < csK.length; i++) {
		cs[this.targetStates[target.type + "_" + target.target][csK[i]]] = true;
	}

	// Just making bA as a shortcut for bindActions
	var bA = Form.Fields.Hidden.bindActions;

	// reset states
	var aK = Object.keys(bA);
	for (var i = 0; i < aK.length; i++) {
		if (ps[aK[i]]) {
			// if in previous
			if (cs[aK[i]]) {
				// and in current
				continue; // same state. do nothing
			}
			bA[aK[i]][1](this, target); // not in current. undo
		}

		if (cs[aK[i]]) {
			// if only in current
			bA[aK[i]][0](this, target); // apply state
		}
	}
};
Form.Fields.Hidden.bindActions = {
	show: [
		function (self, target) {
			// Do
			if (target && target.type === "tab") {
				self.form.$.container
					.find('[data-tab-id="' + target.target + '"]')
					.each(function () {
						var $this = $(this);
						var states = JSON.parse(
							decodeURIComponent($this.attr("data-state-shown") || "") || "[]"
						);
						if (states.indexOf(self.json.id) === -1) {
							states.push(self.json.id);
							$this.attr(
								"data-state-shown",
								encodeURIComponent(JSON.stringify(states))
							);
						}
					});
			}
		},
		function (self, target) {
			// Undo
			if (target && target.type === "tab") {
				self.form.$.container
					.find('[data-tab-id="' + target.target + '"]')
					.each(function () {
						var $this = $(this);
						var states = JSON.parse(
							decodeURIComponent($this.attr("data-state-shown") || "") || "[]"
						);
						if (states.indexOf(self.json.id) > -1) {
							states.splice(states.indexOf(self.json.id), 1);

							if (states.length === 0) {
								$this.removeAttribute("data-state-shown");
							} else {
								$this.attr(
									"data-state-shown",
									encodeURIComponent(JSON.stringify(states))
								);
							}
						}
					});
			}
		},
	],
};
Form.Fields.Hidden.prototype.doChanges = function () {
	var changed = this.isChanged();
	var val = this.get();

	for (var i = 0; i < this.changeListeners.length; i++) {
		this.changeListeners[i](this.json.id, val, changed);
	}
};
Form.Fields.Hidden.prototype.onChange = function (callback) {
	if (!this.changeListeners) this.changeListeners = [];

	this.changeListeners.push(callback);
};
Form.Fields.Hidden.prototype._ = scopeInterface;
Form.Fields.Hidden.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "Hidden".toLowerCase() ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

/**
 * Image
 */

Form.Fields.Image = function Image(scope, container, json) {
	this.scope = scope;
	this.container = container;
	this.json = json;

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;
	this.form = this._("^form").get(0);

	this.value = null;
	this.original = null;

	this.changeListeners = [];

	this.init();
};
Form.Fields.Image.prototype.init = function () {
	var html = Form.Template(this.json, {
		data: {
			input: true,
		},
	});

	this.$.html = $(html);
	if (this.json.visibility === "hidden")
		this.$.container.parent().addClass("hidden");

	if (this.json.css) {
		this.$.container.css(this.json.css);
	}

	this.$.container.append(this.$.html);
	this.i18n();
};
Form.Fields.Image.prototype.bind = function () {
	// nop
};
Form.Fields.Image.prototype.i18n = function () {
	this.$.html.i18n();
};
Form.Fields.Image.prototype.getData = function () {
	var d = {};
	d[this.json.id] = this.value;
	return d;
};
Form.Fields.Image.prototype.get = function () {
	return this.value;
};
Form.Fields.Image.prototype.setData = function (data, preventSave) {
	var val = data[this.json.id];
	if (!preventSave) this.original = val;

	this.set(val);
};
Form.Fields.Image.prototype.set = function (val) {
	this.value = val;
	this.$.container
		.find(".form-control-image")
		.attr(
			"src",
			this.json.src === "data" ? "data:image/png;base64," + val : val
		);
};
Form.Fields.Image.prototype.isChanged = function () {
	return this.get() !== this.original;
};
Form.Fields.Image.prototype.clear = function () {
	this.value = null;
	this.original = null;
	this.set("");
};
Form.Fields.Image.prototype.applyFieldBinds = function () {};
Form.Fields.Image.prototype.validate = function () {
	// stub
};
Form.Fields.Image.prototype.saveData = function () {};
Form.Fields.Image.prototype.refresh = function () {
	// nop
};
Form.Fields.Image.prototype.reset = function () {
	// nop
};
Form.Fields.Image.prototype.onChange = function (callback) {
	if (!this.changeListeners) this.changeListeners = [];

	this.changeListeners.push(callback);
};
Form.Fields.Image.prototype._ = scopeInterface;
Form.Fields.Image.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "Image".toLowerCase() ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

/**
 * Link
 *        A
 *       A A
 *
 *     A     A
 *    A A   A A
 */

Form.Fields.Link = function Link(scope, container, json ){
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._('^form').get(0);

  this.value = null;
  this.original = null;

  this.changeListeners = [];

  this.init();
}
Form.Fields.Link.prototype.init = function(){
  var html = Form.Template( this.json, {data: {
   input: true
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);
  this.i18n();
}
Form.Fields.Link.prototype.bind = function(){
 // nop
}
Form.Fields.Link.prototype.i18n = function(){
  this.$.html.i18n();
}
Form.Fields.Link.prototype.getData = function(){
  var d = {};
  d[this.json.id] = this.value;
  return d;
}
Form.Fields.Link.prototype.get = function(){
  return this.value;
}
Form.Fields.Link.prototype.setData = function( data, preventSave ){
  var val = data[ this.json.id ];

  if( !preventSave )
    this.original = val;

  this.set( val );
}
Form.Fields.Link.prototype.set = function( val ){
  this.value = val;
  this.$.container.find('.form-control-link')
    .attr( 'href', val );
  if(this.value == '' || this.value == null){
    this.$.container.find('.form-control-link').addClass('disabled');
  }else{
    this.$.container.find('.form-control-link').removeClass('disabled');
  }
}
Form.Fields.Link.prototype.isChanged = function(){
  return this.get() !== this.original;
}
Form.Fields.Link.prototype.clear = function(){
  this.value = null;
  this.original = null;
  this.set('');
}
Form.Fields.Link.prototype.applyFieldBinds = function(){
}
Form.Fields.Link.prototype.validate = function(){
  // stub
}
Form.Fields.Link.prototype.saveData = function(){
}
Form.Fields.Link.prototype.refresh = function(){
 // nop
}
Form.Fields.Link.prototype.reset = function(){
 // nop
}
Form.Fields.Link.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];

  this.changeListeners.push( callback );
}
Form.Fields.Link.prototype._ = scopeInterface;
Form.Fields.Link.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('Link').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};
/**
 * ListForm
 */

Form.Fields.ListForm = function ListForm(scope, container, json) {
	this.scope = scope;
	this.container = container;
	this.json = json;

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;
	this.form = this._("^form").get(0);

	this.value = [];
	this.original = [];

	this.components = [];
	this.children = [];

	this.changeListeners = [];

	this.init();
};
Form.Fields.ListForm.prototype.init = function () {
	var html = Form.Template(this.json, {
		data: {
			input: true,
		},
	});

	this.render = this.json.render;

	this.$.html = $(html);
	if (this.json.visibility === "hidden")
		this.$.container.parent().addClass("hidden");

	this.$.container.append(this.$.html);
	this.$.ul = this.$.container.find("ul.list-group");
	this.$.listform = this.$.container.find(".listform");
	/*
	this.sortable = Sortable.create(this.$.ul[0], {
		sort: !this.json.noSort,
		animation: 100,
		// forceFallback: true,
		ghostClass: "sort-ghost",
		chosenClass: "sort-chosen",
		onMove: event => {
			return false;
		}
	});*/

	this.bind();
	this.initContent();
	this.i18n();
};
Form.Fields.ListForm.prototype.initContent = function (info) {
	var self = this;
	info = info || this.json.info;

	this.$.container.find("[data-component]").each(function () {
		var $this = $(this);
		var instance = $this.data("component");
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

		try {
			var component = new tmplt(self, this, comp.opts, info || self.scope.opts);
			self.components.push(component);
			self.children.push(component);

			component.initPromise
				.then(function () {
					component.readonly(true);
				})
				.catch(function (err) {
					console.error(err);
				});

			self.innerForm = component;
		} catch (e) {
			console.error(e);
		}
	});

	this.components.forEach(function (c) {
		if (c.onChange) {
			c.onChange(function (id, value, changed) {
				for (var i = 0; i < self.changeListeners.length; i++) {
					self.changeListeners[i](c.json.id + "." + id, value, changed);
				}
			});
		}
	});

	if (this.json.readonly) {
		this.readonly(true);
	}
};
Form.Fields.ListForm.prototype.bind = function () {
	var self = this;

	this.$.addbtn = this.$.container.find(".sort-btns-add");
	this.$.savebtn = this.$.container.find(".sort-btns-save");
	this.$.cancelbtn = this.$.container.find(".sort-btns-cancel");

	this.$.search = this.$.container.find(".list-search");

	this.$.search.on("input", function (ev) {
		const val = ev.target.value;
		const hide = [];
		const show = [];

		self.$.ul.children("li").each((_, li) => {
			var $li = $(li);
			var data = $li.data("data");
			if (
				val === "" ||
				self.json.searchFields.some((s) => data[s] && data[s].indexOf(val) > -1)
			) {
				show.push($li);
			} else {
				hide.push($li);
			}
		});

		hide.forEach((li) => li.addClass("hidden"));
		show.forEach((li) => li.removeClass("hidden"));
	});

	this.$.html
		.find(".list-group-item")
		.off()
		.on("click", function () {
			self.editingLi = $(this);

			self.setActive(self.editingLi);
			self.innerForm.readonly(false);
			self.$.addbtn.attr("disabled", true);
			self.$.savebtn.removeClass("hidden");
			self.$.cancelbtn.removeClass("hidden");
			self.$.listform.removeClass("inactive");
			self.innerForm.applyData($(this).data("data"));
		});

	this.$.savebtn.on("click", function () {
		var li = self.addingLi || self.editingLi;
		// validate subform
		if (!self.innerForm.validate()) return;
		//li.data("data", self.innerForm.get());
		//self.updateItem(li);

		self.innerForm
			.post()
			.then((_) => {
				// Update listform
				self.innerForm.readonly(true);
				self.$.addbtn.attr("disabled", false);
				self.$.savebtn.addClass("hidden");
				self.$.cancelbtn.addClass("hidden");
				self.$.listform.addClass("inactive");
				self.addingLi = null;
				self.editingLi = null;
				self.setActive();

				self.innerForm.clear();
				self.innerForm.setSaved();
				li.remove();
			})
			.catch((_) => {});

		//self.doChanges();
	});

	this.$.cancelbtn.on("click", function () {
		self.setActive();

		self.innerForm.readonly(true);
		self.$.addbtn.attr("disabled", false);
		self.$.savebtn.addClass("hidden");
		self.$.cancelbtn.addClass("hidden");
		self.$.listform.addClass("inactive");

		self.value = self.$.ul
			.children("li")
			.map(function () {
				return $(this).data("data");
			})
			.get();

		self.innerForm.clear();
		self.innerForm.setSaved();

		self.doChanges();
	});
};
Form.Fields.ListForm.prototype.i18n = function () {
	this.$.html.i18n();
};
Form.Fields.ListForm.prototype.setActive = function (li) {
	if (this.highlighted == li || $(li).is(this.highlighted)) return;

	if (li == null) {
		this.highlighted.siblings().removeClass("blocked");
		this.highlighted.removeClass("blocked highlighted");
		this.highlighted = null;
	} else {
		if (this.highlighted == null) {
			li.siblings().addClass("blocked");
			li.addClass("blocked");
		} else {
			this.highlighted.removeClass("highlighted");
		}

		li.addClass("highlighted");
		this.highlighted = li;
	}
};
Form.Fields.ListForm.prototype.addItem = function (data) {
	var $base = $(Form.Template({ type: "Listform-item" }, { data: this.json }));
	var extra = {
		helpers:
			(this.form && this.form.view.Actions && this.form.view.Actions.helpers) ||
			{},
	};
	var html = renderCached(this.render, data, extra);
	$base.find(".sort-content").html(html);
	this.$.ul.append($base);
	$base.data("data", data);

	this.bind();

	this.value = this.$.ul
		.children("li")
		.map(function () {
			return $(this).data("data");
		})
		.get();

	this.validate();
	this.doChanges();

	return $base;
};
Form.Fields.ListForm.prototype.updateItem = function (li) {
	var data = $(li).data("data");
	var extra = {
		helpers:
			(this.form && this.form.view.Actions && this.form.view.Actions.helpers) ||
			{},
	};
	var html = renderCached(this.render, data, extra);
	$(li).find(".sort-content").html(html);

	this.value = this.$.ul
		.children("li")
		.map(function () {
			return $(this).data("data");
		})
		.get();

	this.validate();
	this.doChanges();
};
Form.Fields.ListForm.prototype.readonly = function (set) {
	if (typeof set === "undefined") return this.isReadOnly;

	this.isReadOnly = !!set;

	if (this.isReadOnly) {
		this.$.addbtn.addClass("hidden");
		this.$.ul.addClass("readonly");
	} else {
		this.$.addbtn.removeClass("hidden");
		this.$.ul.removeClass("readonly");
	}
	// disable edit, delete, add
};
Form.Fields.ListForm.prototype.getData = function () {
	var d = {};
	d[this.json.id] = this.get();
	return d;
};
Form.Fields.ListForm.prototype.get = function () {
	return this.value;
};
Form.Fields.ListForm.prototype.setData = function (data, preventSave) {
	var val = data[this.json.id];
	if (val === null || val === undefined) return;

	if (!preventSave) this.original = val;

	this.set(val);
};
Form.Fields.ListForm.prototype.set = function (val) {
	this.$.ul.empty();
	this.value = val;

	for (var i = 0; i < val.length; i++) {
		this.addItem(val[i]);
	}

	this.value = this.$.ul
		.children("li")
		.map(function () {
			return $(this).data("data");
		})
		.get();

	this.doChanges();
};
Form.Fields.ListForm.prototype.isChanged = function () {
	var val = this.get();
	return (
		JSON.stringify(val) !== JSON.stringify(this.original) &&
		!(this.original === null && val === "")
	);
};
Form.Fields.ListForm.prototype.reset = function () {
	this.set(this.original);
};
Form.Fields.ListForm.prototype.clear = function () {
	this.original = null;
};
Form.Fields.ListForm.prototype.applyFieldBinds = function () {
	var self = this;
	var B = this.json.binds;
	if (!B) return;

	B.forEach(function (b) {
		var t = self.form._("_" + b.to).get(0);
		// create bind
		t.onChange(function () {
			var get = t.get();
			if ((b.field && get ? get[b.field] : get) == b.value) {
				self.do(b.value, b.do, b.to);
			} else {
				self.do(b.value, b.do, b.to, true);
			}
		});
		// apply it
		var get = t.get();
		if ((b.field && get ? get[b.field] : get) == b.value) {
			self.do(b.value, b.do, b.to);
		} else {
			self.do(b.value, b.do, b.to, true);
		}
	});
};
Form.Fields.ListForm.prototype.do = function (value, action, context, undo) {
	var self = this;
	if (!this.state) this.state = {};

	// Get previous differences
	var psK = Object.keys(this.state);
	var ps = {}; // previous state
	for (var i = 0; i < psK.length; i++) {
		ps[this.state[psK[i]]] = true;
	}

	if (undo) {
		if (this.state[action + "_" + value + "_" + context]) {
			delete this.state[action + "_" + value + "_" + context];
		} else {
			return;
		}
	} else {
		if (!this.state[action + "_" + value + "_" + context]) {
			this.state[action + "_" + value + "_" + context] = action;
		} else {
			return;
		}
	}

	// Get current differences
	var csK = Object.keys(this.state);
	var cs = {}; // current state
	for (var i = 0; i < csK.length; i++) {
		cs[this.state[csK[i]]] = true;
	}

	// Just making bA as a shortcut for bindActions
	var bA = Form.Fields.ListForm.bindActions;

	// reset states
	var aK = Object.keys(bA);
	for (var i = 0; i < aK.length; i++) {
		if (ps[aK[i]]) {
			// if in previous
			if (cs[aK[i]]) {
				// and in current
				continue; // same state. do nothing
			}
			bA[aK[i]][1](this); // not in current. undo
		}

		if (cs[aK[i]]) {
			// if only in current
			bA[aK[i]][0](this); // apply state
		}
	}
};
Form.Fields.ListForm.prototype.validate = function () {
	var self = this;
	// check if has validation settings
	if (!this.json.validation) return true;

	var errors = []; // i18n keys

	// setup validation elements
	if (!this._tabli)
		this._tabli = $(
			'[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
		).parent();

	var val = this.json.validation;
	var value = this.get();

	// validate empty
	if (val.required && value.length === 0) {
		// apply error
		// i18n.t('common.errors.required');
		errors.push("app.errors.required-field");
	} else if (val.regex) {
		// make regexes
		if (!this.regexes) {
			this.regexes = {};

			val.regex.forEach(function (v, k) {
				self.regexes[k] = new RegExp(k);
			});
		}

		var vK = Object.keys(val.regex);
		for (var i = 0; i < vK.length; i++) {
			var k = vK[i];
			var r = self.regexes[k];

			if (!r.test(value)) {
				errors.push(val.regex[k]);
			}
		}
	}

	if (val.custom) {
		(Array.isArray(val.custom) ? val.custom : [val.custom]).forEach(function (
			f
		) {
			var err;
			if (self.form.actions[f]) {
				err = self.form.actions[f](value, self, val);
				if (err) errors.push(err);
			}
		});
	}
	if (errors.length > 0) {
		self.$.container.closestChildren(".for-error").html(
			errors
				.map(function (v) {
					return i18n.t(v);
				})
				.join("<br>")
		);

		this.$.html.closest(".form-group").addClass("has-error");

		var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
		if (cerrors.indexOf(this.json.id) < 0) {
			if (cerrors[0] === "") cerrors = [];
			cerrors.push(this.json.id);
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		}
		return false;
	}

	// unset errors. set success?
	var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
	if (cerrors.indexOf(this.json.id) > -1) {
		cerrors.splice(cerrors.indexOf(this.json.id), 1);
		if (cerrors.length > 0) {
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		} else {
			this._tabli.removeAttr("data-validation-error");
		}
	}
	this.$.html.closest(".form-group").removeClass("has-error");
	return true;
};
Form.Fields.ListForm.prototype.doChanges = function () {
	var changed = this.isChanged();
	var val = this.get();

	if (changed && !this.json.muted) {
		this.$.container.closest(".form-group").addClass("changed");
	} else {
		this.$.container.closest(".form-group").removeClass("changed");
	}

	for (var i = 0; i < this.changeListeners.length; i++) {
		this.changeListeners[i](this.json.id, val, changed);
	}
};
Form.Fields.ListForm.prototype.saveData = function () {
	this.original = this.get();
	this.doChanges();
};
Form.Fields.ListForm.prototype.refresh = function () {};
Form.Fields.ListForm.prototype.onChange = function (callback) {
	if (!this.changeListeners) this.changeListeners = [];

	this.changeListeners.push(callback);
};
Form.Fields.ListForm.bindActions = {
	disable: [
		function (self) {
			// Do
			self.$.input.prop("disabled", true);
		},
		function (self) {
			// Undo
			self.$.input.prop("disabled", false);
		},
	],
	hide: [
		function (self) {
			// Do
			self.$.container.parent().addClass("hidden");
		},
		function (self) {
			// Undo
			self.$.container.parent().removeClass("hidden");
		},
	],
};
Form.Fields.ListForm.prototype._ = scopeInterface;
Form.Fields.ListForm.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "ListForm".toLowerCase() ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

/**
 * MultiCheckbox
 */

Form.Fields.MultiCheckbox = function MultiCheckbox(scope, container, json ){
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._('^form').get(0);

  this.value = null;
  this.original = null;

  this.changeListeners = [];

  // this.init();
  // Only inits on .setData
  //   or options 

  // if options
  //   setData
  //   init 
  //   data == [obj]
  if( this.json.options ){
    /*var d = {};
    d[this.json.id] = this.json.options;
    this.setData( d );*/
    this.original = this.json.options;
    this.init();
  }
}
Form.Fields.MultiCheckbox.prototype.init = function(){
  this.data = JSON.simpleCopy( this.original );
  this.dataIndex = {};
  this.originalIndex = {};

  this.tri = this.json.triState || false;

  var obj = [];
  var d;

  if( this.original ){
    for( var i = 0 ; i < this.original.length ; i++ ){
      d = {};

      d["id"] = this.original[i][this.json.idField];
      this.original[i][this.json.valueField] = this.original[i][this.json.valueField] || false;
      this.data[i][this.json.valueField] = this.data[i][this.json.valueField] || false;
      d["value"] = this.original[i][this.json.valueField];
      if( this.json.labelField ){
        d["label"] = this.original[i][this.json.labelField];
      }else if( this.json.i18nField ){
        d["label-i18n"] = this.json['base-i18n']
          + this.original[i][this.json.i18nField].replace(/\s/g,'_');
      }

      obj.push(d);
      this.dataIndex[d["id"]] = this.data[i];
      this.originalIndex[d["id"]] = this.original[i];
    }
  }
  var html = Form.Template( this.json, {data: {
    input: true,
    data: obj
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);

  this.bind();
  this.applyFieldBinds();
  this.i18n();
}
Form.Fields.MultiCheckbox.prototype.bind = function(){
  var self = this;

  this.$.container.find('.checkbox-filter > input').on('input change',function(ev){
    var f = this.value.toLowerCase();

    if( f === '' ){
      self.$.html.find('.multicheckbox').show()
    }else{
      self.$.html.find('.checkboxb > label > span').each(function(){
        var $this = $(this);
        if( $this.text().toLowerCase().indexOf( f ) > -1 ){
          $this.closest('.multicheckbox').show();
        }else{
          $this.closest('.multicheckbox').hide();
        }
      });
    }
  });

  this.$.html.find('.checkboxb > input').on('change', function( ev, state ){
    var id = $(this).closest('div.checkboxb').data('id');

    if( !self.json.radio ){
      if( self.dataIndex[id][self.json.valueField] === "indeterminate" ){
        this.indeterminate = false;
        self.dataIndex[id][self.json.valueField] = false;
        this.checked = false;
      }else if( self.dataIndex[id][self.json.valueField] === false ){
        self.dataIndex[id][self.json.valueField] = true;
      }else if( self.dataIndex[id][self.json.valueField] === true ){
        if( self.tri && self.originalIndex[id][self.json.valueField] === "indeterminate" ){
          self.dataIndex[id][self.json.valueField] = "indeterminate";
          this.indeterminate = true;
        }else{
          self.dataIndex[id][self.json.valueField] = false;
        }
      }
    }else{
      if( self.dataIndex[id][self.json.valueField] === true ){
        //set original
    /*    self.$.container.find('input[type="checkbox"]').each(function(){
          var id = $(this).closest('div.checkboxb').data('id');
          self.dataIndex[id][self.json.valueField] = self.originalIndex[id][self.json.valueField];
          if(self.dataIndex[id][self.json.valueField] === 'indeterminate'){
            this.checked = false;
            this.indeterminate = true;
          }else{
            this.checked = self.dataIndex[id][self.json.valueField];
          }
        });*/
      }else{
        self.dataIndex[id][self.json.valueField] = true;
        self.$.container.find('input[type="checkbox"]').not(this).each(function(){
          var id = $(this).closest('[data-id]').data('id');
          this.checked = false;
          this.indeterminate = false;
          self.dataIndex[id][self.json.valueField] = false;
        });
      }
    }
    self.doChanges();
  });
}
Form.Fields.MultiCheckbox.prototype.unbind = function(){
  var self = this;
  if( this.$.html )
    this.$.html.find('input').off();
}
Form.Fields.MultiCheckbox.prototype.i18n = function(){
  this.$.html.i18n();
}
Form.Fields.MultiCheckbox.prototype.getData = function(){
  var d = {};

  if( this.json.options ){
    d[this.json.id] = this.get();
  }else{
    d[this.json.id] = JSON.simpleCopy(this.data);
  }
  return d;
}
Form.Fields.MultiCheckbox.prototype.get = function(){
  var self = this;

  if( !self.data )
    return;

  if( this.json.options ){
    if( this.json.radio ){
      return self.data.reduce(function(p, c){
        return p || ( c[self.json.valueField] && c[self.json.idField] ) || false;
      }, false);
    }else{
      return self.data.reduce(function(p, c){
        if( c[self.json.idField] ){
          p[c[self.json.idField]] = c[self.json.valueField];
        }
        return p;
      }, {});
    }
  }else{
    return JSON.simpleCopy(this.dataIndex);
  }
}
Form.Fields.MultiCheckbox.prototype.setData = function( data ){
  var val = JSON.simpleCopy(data[ this.json.id ]);

  if( this.json.options ){
    this.originalVal = val;
    this.set(val);
    this.saveData();
  }else{
    this.unbind();
    if( this.$.html )
      this.$.html.remove();

    this.original = val;
    this.init();
  }

}
Form.Fields.MultiCheckbox.prototype.set = function( val ){
  var self = this;
  this.$.container.find('[data-id]').each(function(){
    var id = this.getAttribute('data-id');
    var check = $(this).find('input')[0];

    if( self.json.options ){
      if( self.json.radio ){
        if( val === id ){
          check.checked = true;
          self.dataIndex[id][self.json.valueField] = true;
          check.indeterminate = false;
        }else{
          check.checked = false;
          self.dataIndex[id][self.json.valueField] = false;
          check.indeterminate = false;
        }
      }else{
        if( val[id] ){      
          if( val[id] === "indeterminate"){
            check.checked = false;
            check.indeterminate = true;
            self.dataIndex[id][self.json.valueField] = "indeterminate";
          }else{
            check.checked = !!val[id];
            self.dataIndex[id][self.json.valueField] = !!val[id];
            check.indeterminate = false;
          }
        }else{
          check.checked = false;
          self.dataIndex[id][self.json.valueField] = false;
          check.indeterminate = false;
        }
      }
    }else{
      if( val[id] === "indeterminate"){
        check.checked = false;
        check.indeterminate = true;
        self.dataIndex[id][self.json.valueField] = "indeterminate";
      }else{
        check.checked = !!val[id];
        self.dataIndex[id][self.json.valueField] = !!val[id];
        check.indeterminate = false;
      }
    }
  });
}
Form.Fields.MultiCheckbox.bindActions = {
  hide: [
    function( self ){ // Do
      self.$.container.parent().addClass('hidden');
    },
    function( self ){ // Undo
      self.$.container.parent().removeClass('hidden');
    }
  ],
  show: [
    function( self ){ // Do
      self.$.container.parent().removeClass('hidden');
    },
    function( self ){ // Undo
      self.$.container.parent().addClass('hidden');
    }
  ]
}
Form.Fields.MultiCheckbox.prototype.isChanged = function(){
  if(!this.data)
    return false;

  for( var i = 0 ; i < this.data.length ; i++ )
    if( this.data[i][this.json.valueField] != this.original[i][this.json.valueField] )
      return true;

  return false;
}
Form.Fields.MultiCheckbox.prototype.reset = function(){
  // nop
}
Form.Fields.MultiCheckbox.prototype.clear = function(){
  // nop?
}

Form.Fields.MultiCheckbox.prototype.applyFieldBinds = function(){
  var self = this;
  var B = this.json.binds;
  if(!B) return;

  B.forEach(function(b){
    if( b.to ){
      var t = self.form._('_'+b.to).get(0);
      // create bind
      t.onChange(function(){
        var get = t.get();
        if( ( b.field && get ? get[b.field] : get ) == b.value ){
          self.do(b.value,b.do, b.to);
        }else{
          self.do(b.value,b.do, b.to, true);
        }
      });
      // apply it
      var get = t.get();
      if( ( b.field && get ? get[b.field] : get ) == b.value ){
        self.do(b.value,b.do, b.to);
      }else{
        self.do(b.value,b.do, b.to, true);
      }
    }else if( b.target ){
      var t = self;

      t.onChange(function(){
        var get = t.get();
        if( ( b.field && get ? get[b.field] : get ) == b.value ){
          self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to);
        }else{
          self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to, true);
        }
      });

      var get = t.get();
      if( ( b.field && get ? get[b.field] : get ) == b.value ){
        self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to);
      }else{
        self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to, true);
      }

    }
  });
}
Form.Fields.MultiCheckbox.prototype.disable = function(){
  if(this.$.html){
    this.$.html.find('.checkboxb > input').prop('disabled', true);
  }else{
    this.json.disabled = true;
  }
}
Form.Fields.MultiCheckbox.prototype.enable = function(){
  if(this.$.html){
    this.$.html.find('.checkboxb > input').prop('disabled', false);
  }else{
    this.json.disabled = false;
  }
}
Form.Fields.MultiCheckbox.prototype.validate = function(){
  var self = this;
  // check if has validation settings
  if( !this.json.validation )
    return true;

  var errors = []; // i18n keys

  // setup validation elements
  if( !this._tabli )
    this._tabli = $('[href="#'+this.$.html.closest('.tab-pane').attr('id')+'"]').parent();


  var val = this.json.validation;
  var value = this.get();

  // validate empty
  if( val.required && this.json.radio && ( value === false ) ){
    // apply error
    // i18n.t('common.errors.required');
    errors.push('app.errors.required-field');
  }
  

  if( val.custom ){
    (Array.isArray(val.custom)?val.custom:[val.custom]).forEach(function(f){
      var err;
      if(self.form.actions[f]){
        err = self.form.actions[f]( value, self, val );
        if( err )
          errors.push(err);
      }
    })
  }

  if(errors.length > 0){
    self.$.container.closestChildren('.for-error').html(errors.map(function(v){return i18n.t(v); }).join('<br>'));

    this.$.html.closest('.form-group').addClass('has-error');

    var cerrors = (this._tabli.attr('data-validation-error') || '').split(';');
    if( cerrors.indexOf(this.json.id) < 0 ){
      if(cerrors[0] === '')
        cerrors = [];
      cerrors.push(this.json.id);
      this._tabli.attr('data-validation-error', cerrors.join(';'));
    }
    return false;
  }

  // unset errors. set success?
  var cerrors = (this._tabli.attr('data-validation-error') || '').split(';');
  if( cerrors.indexOf(this.json.id) > -1 ){
    cerrors.splice(cerrors.indexOf(this.json.id), 1);
    if(cerrors.length > 0){
      this._tabli.attr('data-validation-error', cerrors.join(';') );
    }else{
      this._tabli.removeAttr('data-validation-error');
    }
  }
  this.$.html.closest('.form-group').removeClass('has-error');
  return true;
}
Form.Fields.MultiCheckbox.prototype.saveData = function(){
  var self = this;

  this.originalIndex = JSON.simpleCopy(this.dataIndex);
  this.original = JSON.simpleCopy(this.data);

  this.doChanges();
}
Form.Fields.MultiCheckbox.prototype.refresh = function(){
}

Form.Fields.MultiCheckbox.prototype.do = function( value, action, context, undo ){
  var self = this;
  if(!this.state)
    this.state = {};

  // Get previous differences
  var psK = Object.keys(this.state);
  var ps = {}; // previous state
  for( var i = 0 ; i < psK.length ; i++ ){
    ps[this.state[psK[i]]] = true;
  }

  if(undo){
    if(this.state[action+'_'+value+'_'+context]){
      delete this.state[action+'_'+value+'_'+context];
    }else{
      return;
    }
  }else{
    if(!this.state[action+'_'+value+'_'+context]){
      this.state[action+'_'+value+'_'+context] = action;
    }else{
      return;
    }
  }


  // Get current differences
  var csK = Object.keys(this.state);
  var cs = {}; // current state
  for( var i = 0 ; i < csK.length ; i++ ){
    cs[this.state[csK[i]]] = true;
  }

  // Just making bA as a shortcut for bindActions
  var bA = Form.Fields.MultiCheckbox.bindActions;

  // reset states
  var aK = Object.keys(bA);
  for( var i = 0 ; i < aK.length ; i++ ){
    if( ps[aK[i]] ){      // if in previous
      if( cs[aK[i]] ){    // and in current
        continue;         // same state. do nothing
      }
      bA[aK[i]][1](this); // not in current. undo
    }

    if( cs[aK[i]] ){      // if only in current
      bA[aK[i]][0](this); // apply state
    }
  }
}
Form.Fields.MultiCheckbox.prototype.doChanges = function(){
  var self = this;
  var changed = this.isChanged();
  var val = this.get();

  if( changed && !this.json.muted ){
    this.$.container.closest('.form-group').addClass('changed');
  }else{
    this.$.container.closest('.form-group').removeClass('changed');
  }

  this.$.container.find('[data-id]').each(function(){
    var id = this.getAttribute('data-id');

    var changed = self.originalIndex[id][self.json.valueField]
      !== self.dataIndex[id][self.json.valueField];

    if( changed && !self.json.muted ){
      $(this).closest('.multicheckbox').addClass('changed');
    }else{
      $(this).closest('.multicheckbox').removeClass('changed');
    }
  });

  for( var i = 0 ; i < this.changeListeners.length ; i++ ){
    this.changeListeners[i]( this.json.id, val, changed );
  }
}
Form.Fields.MultiCheckbox.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];

  this.changeListeners.push( callback );
}
Form.Fields.MultiCheckbox.prototype._ = scopeInterface;
Form.Fields.MultiCheckbox.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('MultiCheckbox').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};

/**
 * MultiSwitch
 */

Form.Fields.MultiSwitch = function MultiSwitch(scope, container, json ){
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._('^form').get(0);

  this.value = null;
  this.original = null;

  this.changeListeners = [];

  // this.init();
  // Only inits on .setData
}
Form.Fields.MultiSwitch.prototype.init = function(){
  this.data = JSON.simpleCopy( this.original );
  this.dataIndex = {};
  var obj = [];
  var d;

  if( this.original ){
    for( var i = 0 ; i < this.original.length ; i++ ){
      d = {};

      d["id"] = this.original[i][this.json.idField];
      d["value"] = this.original[i][this.json.valueField];
      if( this.json.labelField ){
        d["label"] = this.original[i][this.json.labelField];
      }else if( this.json.i18nField ){
        d["label-i18n"] = this.json['base-i18n']
          + this.original[i][this.json.i18nField].toLowerCase().replace(/\s/g,'_');
      }

      if(this.json.onColor)
        d["onColor"] = this.json.onColor;
      if(this.json["label-before"])
        d["label-before"] = this.json["label-before"];

      obj.push(d);
      this.dataIndex[d["id"]] = this.data[i];
    }
    this.originalIndex = JSON.simpleCopy(this.dataIndex);
  }

  var html = Form.Template( this.json, {data: {
    input: true,
    data: obj
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);

  this.bind();
  this.i18n();
}
Form.Fields.MultiSwitch.prototype.bind = function(){
  var self = this;
  this.$.html.find('input').on('change', function( ev, state ){
    var id = $(this).closest('div.checkbox').data('id');
    self.dataIndex[id][self.json.valueField] = this.checked;

    self.doChanges();
  });
}
Form.Fields.MultiSwitch.prototype.unbind = function(){
  var self = this;
  if( this.$.html )
    this.$.html.find('input').off();
}
Form.Fields.MultiSwitch.prototype.i18n = function(){
  this.$.html.i18n();
}
Form.Fields.MultiSwitch.prototype.getData = function(){
  var d = {};

  d[this.json.id] = this.data;
  return d;
}
Form.Fields.MultiSwitch.prototype.get = function(){
  // nop
}
Form.Fields.MultiSwitch.prototype.setData = function( data ){
  var val = JSON.simpleCopy(data[ this.json.id ]);

  this.unbind();
  if( this.$.html )
    this.$.html.remove();

  this.original = val;

  this.init();
}
Form.Fields.MultiSwitch.prototype.set = function( val ){
  // nop
}
Form.Fields.MultiSwitch.prototype.isChanged = function(){
  if(!this.data)
    return false;

  for( var i = 0 ; i < this.data.length ; i++ )
    if( this.data[i][this.json.valueField] != this.original[i][this.json.valueField] )
      return true;

  return false;
}
Form.Fields.MultiSwitch.prototype.reset = function(){
  // nop
}
Form.Fields.MultiSwitch.prototype.clear = function(){
  // nop?
}
Form.Fields.MultiSwitch.prototype.validate = function(){
  // stub
}
Form.Fields.MultiSwitch.prototype.saveData = function(){
  this.original = this.getData()[this.json.id];
  this.doChanges();
}
Form.Fields.MultiSwitch.prototype.refresh = function(){
}
Form.Fields.MultiSwitch.prototype.do = function( value, action, context, undo ){
  var self = this;
  if(!this.state)
    this.state = {};

  // Get previous differences
  var psK = Object.keys(this.state);
  var ps = {}; // previous state
  for( var i = 0 ; i < psK.length ; i++ ){
    ps[this.state[psK[i]]] = true;
  }

  if(undo){
    if(this.state[action+'_'+value+'_'+context]){
      delete this.state[action+'_'+value+'_'+context];
    }else{
      return;
    }
  }else{
    if(!this.state[action+'_'+value+'_'+context]){
      this.state[action+'_'+value+'_'+context] = action;
    }else{
      return;
    }
  }


  // Get current differences
  var csK = Object.keys(this.state);
  var cs = {}; // current state
  for( var i = 0 ; i < csK.length ; i++ ){
    cs[this.state[csK[i]]] = true;
  }

  // Just making bA as a shortcut for bindActions
  var bA = Form.Fields.MultiSwitch.bindActions;

  // reset states
  var aK = Object.keys(bA);
  for( var i = 0 ; i < aK.length ; i++ ){
    if( ps[aK[i]] ){      // if in previous
      if( cs[aK[i]] ){    // and in current
        continue;         // same state. do nothing
      }
      bA[aK[i]][1](this); // not in current. undo
    }

    if( cs[aK[i]] ){      // if only in current
      bA[aK[i]][0](this); // apply state
    }
  }
}

Form.Fields.MultiSwitch.prototype.applyFieldBinds = function(){
  var self = this;
  var B = this.json.binds;
  if(!B) return;

  B.forEach(function(b){
    if( b.to ){
      var t = self.form._('_'+b.to).get(0);
      // create bind
      t.onChange(function(){
        if( t.get() === b.value ){
          self.do(b.value,b.do, b.to);
        }else{
          self.do(b.value,b.do, b.to, true);
        }
      });
      // apply it
      if( t.get() === b.value ){
        self.do(b.value,b.do, b.to);
      }else{
        self.do(b.value,b.do, b.to, true);
      }
    }else if( b.target ){
      var t = self;

      t.onChange(function(){
        if( t.get() == b.value ){
          self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to);
        }else{
          self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to, true);
        }
      });

      if( t.get() == b.value ){
        self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to);
      }else{
        self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to, true);
      }

    }
  });
}
Form.Fields.MultiSwitch.prototype.doChanges = function(){
  var self = this;
  var changed = this.isChanged();
  var val = this.get();

  if( changed && !this.json.muted ){
    this.$.container.closest('.form-group').addClass('changed');
  }else{
    this.$.container.closest('.form-group').removeClass('changed');
  }

  this.$.container.find('[data-id]').each(function(){
    var id = this.getAttribute('data-id');
    var changed = self.originalIndex[id][self.json.valueField] !== self.dataIndex[id][self.json.valueField];
    if( changed && !self.json.muted ){
      $(this).closest('.multiswitch').addClass('changed');
    }else{
      $(this).closest('.multiswitch').removeClass('changed');
    }
  });

  for( var i = 0 ; i < this.changeListeners.length ; i++ ){
    this.changeListeners[i]( this.json.id, val, changed );
  }
}
Form.Fields.MultiSwitch.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];

  this.changeListeners.push( callback );
}
Form.Fields.MultiSwitch.prototype._ = scopeInterface;
Form.Fields.MultiSwitch.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('MultiSwitch').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};

/**
 * Number
 */

Form.Fields.Number = function Number(scope, container, json) {
	this.scope = scope;
	this.container = container;
	this.json = json;

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;
	this.form = this._("^form").get(0);

	this.value = 0;
	this.original = null;

	this.changeListeners = [];
	this._state = {
		readonly: {},
		hidden: {},
	};

	this.init();
};
Form.Fields.Number.prototype.init = function () {
	var html = Form.Template(this.json, {
		data: {
			input: true,
		},
	});

	this.$.html = $(html);
	if (this.json.visibility === "hidden")
		this.$.container.parent().addClass("hidden");

	this.$.container.append(this.$.html);
	this.$.input = this.$.container.find("input");

	//  debugger;

	this.$.input.TouchSpin({
		verticalbuttons: true,
		forcestepdivisibility: this.json.decimals ? "none" : "none",
		decimals: this.json.decimals ? this.json.decimals : 0,
		step: this.json.step || 1,
		min:
			this.json.validation && this.json.validation.min !== undefined
				? this.json.validation.min
				: -1000000000000,
		max:
			this.json.validation && this.json.validation.max !== undefined
				? this.json.validation.max
				: 1000000000000,
		prefix: this.json.prefix || "",
		postfix: this.json.postfix || "",
		initval: this.json.default !== undefined ? this.json.default : "",
	});

	this.readonly(this.json.readOnly);
	this.bind();
	this.i18n();
};
Form.Fields.Number.prototype.bind = function () {
	var self = this;

	this.updatePermissions = (p) => this.checkPermissions(p);
	main.permissions.bind(this.updatePermissions);

	this.$.input.on("input change", function (ev) {
		self.value = this.value;

		self.doChanges();
	});

	if (this.json.onChange && this.form.actions[this.json.onChange]) {
		this.onChange(function (_, val) {
			if (!self.muted)
				self.form.actions[self.json.onChange](val, self.form, null, self);
		});
	}
};
Form.Fields.Number.prototype.i18n = function () {
	this.$.html.i18n();
};
Form.Fields.Number.prototype.remove = function () {
	main.permissions.offChange(this.updatePermissions);
};
Form.Fields.Number.prototype.checkPermissions = function (userPermissions) {
	if (!this.json.permissions) {
		return;
	}

	Object.keys(this.json.permissions).forEach((k) => {
		const permission = k;
		const state = this.json.permissions[k];
		const hasPermission = userPermissions.indexOf(permission) > -1;

		if (state === "readonly") {
			this.readonly(!hasPermission, permission);
		}
		if (state === "hidden") {
			this.hidden(!hasPermission, permission);
		}
	});
};
Form.Fields.Number.prototype.hidden = function (set, namespace) {
	if (typeof namespace === "undefined" && typeof set === "undefined") {
		return Object.keys(this._state.hidden).reduce(
			(acc, k) => acc || this._state.hidden[k],
			false
		);
	}

	if (typeof set === "undefined") {
		return this._state.hidden[namespace];
	}

	namespace = namespace == null ? "anon" : namespace;

	this._state.hidden[namespace] = set;

	this.isHidden = Object.keys(this._state.hidden).reduce(
		(acc, k) => acc || this._state.hidden[k],
		false
	);

	if (this.isHidden) {
		this.$.container.addClass("hidden");
	} else {
		this.$.container.removeClass("hidden");
	}
};
Form.Fields.Number.prototype.readonly = function (set, namespace) {
	if (typeof namespace === "undefined" && typeof set === "undefined") {
		return Object.keys(this._state.readonly).reduce(
			(acc, k) => acc || this._state.readonly[k],
			false
		);
	}
	if (typeof set === "undefined") {
		return this._state.readonly[namespace];
	}

	namespace = namespace == null ? "anon" : namespace;

	this._state.readonly[namespace] = set;

	this.isReadOnly = Object.keys(this._state.readonly).reduce(
		(acc, k) => acc || this._state.readonly[k],
		false
	);
	this.$.input
		.parent()
		.find(".input-group-btn-vertical button")
		.prop("disabled", this.isReadOnly);
	this.$.input.attr("readonly", this.isReadOnly);
};
Form.Fields.Number.prototype.getData = function () {
	var d = {};
	d[this.json.id] = this.get();
	return d;
};
Form.Fields.Number.prototype.get = function () {
	if (this.value === "" || this.value == undefined) {
		return null;
	}
	return +this.value;
};
Form.Fields.Number.prototype.setData = function (data, preventSave) {
	var val = data[this.json.id];
	if (val == undefined) {
		this.original = null;
	} else {
		this.original = +val;
	}
	this.set(val);
};
Form.Fields.Number.prototype.set = function (val) {
	this.value = val;
	if (val == undefined) {
		this.$.input.val("").trigger("blur");
	} else {
		this.$.input.val(val).trigger("blur");
	}
	this.doChanges();
};
Form.Fields.Number.prototype.isChanged = function () {
	if (this.json.ignoreChange) return false;
	var val = this.get();
	if (this.original == null && val == null) return false;

	return val != this.original;
};
Form.Fields.Number.prototype.reset = function () {
	this.set(this.original);
};
Form.Fields.Number.prototype.clear = function () {
	this.value = null;
	this.original = null;

	this.$.input.val(this.json.default, "");
	this.clearErrors();
};
Form.Fields.Number.prototype.clearErrors = function () {
	if (!this._tabli)
		this._tabli = $(
			'[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
		).parent();

	var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
	if (cerrors.indexOf(this.json.id) > -1) {
		cerrors.splice(cerrors.indexOf(this.json.id), 1);
		if (cerrors.length > 0) {
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		} else {
			this._tabli.removeAttr("data-validation-error");
		}
	}
	this.$.html.closest(".form-group").removeClass("has-error");
};
Form.Fields.Number.prototype.applyFieldBinds = function () {
	var self = this;
	var B = this.json.binds;
	if (!B) return;

	B.forEach(function (b) {
		var t = self.form._("_" + b.to).get(0);
		// create bind
		t.onChange(function () {
			var get = t.get();
			if ((b.field && get ? get[b.field] : get) == b.value) {
				self.do(b.value, b.do, b.to);
			} else {
				self.do(b.value, b.do, b.to, true);
			}
		});
		// apply it
		var get = t.get();
		if ((b.field && get ? get[b.field] : get) == b.value) {
			self.do(b.value, b.do, b.to);
		} else {
			self.do(b.value, b.do, b.to, true);
		}
	});
};
Form.Fields.Number.prototype.do = function (value, action, context, undo) {
	var self = this;
	if (!this.state) this.state = {};

	// Get previous differences
	var psK = Object.keys(this.state);
	var ps = {}; // previous state
	for (var i = 0; i < psK.length; i++) {
		ps[this.state[psK[i]]] = true;
	}

	if (undo) {
		if (this.state[action + "_" + value + "_" + context]) {
			delete this.state[action + "_" + value + "_" + context];
		} else {
			return;
		}
	} else {
		if (!this.state[action + "_" + value + "_" + context]) {
			this.state[action + "_" + value + "_" + context] = action;
		} else {
			return;
		}
	}

	// Get current differences
	var csK = Object.keys(this.state);
	var cs = {}; // current state
	for (var i = 0; i < csK.length; i++) {
		cs[this.state[csK[i]]] = true;
	}

	// Just making bA as a shortcut for bindActions
	var bA = Form.Fields.Number.bindActions;

	// reset states
	var aK = Object.keys(bA);
	for (var i = 0; i < aK.length; i++) {
		if (ps[aK[i]]) {
			// if in previous
			if (cs[aK[i]]) {
				// and in current
				continue; // same state. do nothing
			}
			bA[aK[i]][1](this); // not in current. undo
		}

		if (cs[aK[i]]) {
			// if only in current
			bA[aK[i]][0](this); // apply state
		}
	}
};
Form.Fields.Number.prototype.validate = function () {
	var self = this;
	// check if has validation settings
	if (!this.json.validation) return true;

	var errors = []; // i18n keys

	// setup validation elements
	if (!this._tabli)
		this._tabli = $(
			'[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
		).parent();

	var val = this.json.validation;
	var value = this.get();

	// validate empty
	if (val.required && value === null) {
		// apply error
		// i18n.t('common.errors.required');
		errors.push("app.errors.required-field");
	}

	if (val.custom) {
		(Array.isArray(val.custom) ? val.custom : [val.custom]).forEach(function (
			f
		) {
			var err;
			if (self.form.actions[f]) {
				err = self.form.actions[f](value, self);
				if (err) errors.push(err);
			}
		});
	}

	if (errors.length > 0) {
		self.$.container.closestChildren(".for-error").html(
			errors
				.map(function (v) {
					return i18n.t(v);
				})
				.join("<br>")
		);

		this.$.html.closest(".form-group").addClass("has-error");

		var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
		if (cerrors.indexOf(this.json.id) < 0) {
			if (cerrors[0] === "") cerrors = [];
			cerrors.push(this.json.id);
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		}
		return false;
	}

	// unset errors. set success?
	var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
	if (cerrors.indexOf(this.json.id) > -1) {
		cerrors.splice(cerrors.indexOf(this.json.id), 1);
		if (cerrors.length > 0) {
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		} else {
			this._tabli.removeAttr("data-validation-error");
		}
	}
	this.$.html.closest(".form-group").removeClass("has-error");
	return true;
};
Form.Fields.Number.prototype.saveData = function () {
	this.original = this.get();
	this.doChanges();
};
Form.Fields.Number.prototype.refresh = function () {};
Form.Fields.Number.prototype.doChanges = function () {
	var changed = this.isChanged();
	var val = this.get();

	if (changed && !this.json.muted) {
		this.$.container.closest(".form-group").addClass("changed");
	} else {
		this.$.container.closest(".form-group").removeClass("changed");
	}

	for (var i = 0; i < this.changeListeners.length; i++) {
		this.changeListeners[i](this.json.id, val, changed);
	}
};
Form.Fields.Number.prototype.onChange = function (callback) {
	if (!this.changeListeners) this.changeListeners = [];

	this.changeListeners.push(callback);
};
Form.Fields.Number.bindActions = {
	disable: [
		function (self) {
			// Do
			self.$.input.prop("disabled", true);
		},
		function (self) {
			// Undo
			self.$.input.prop("disabled", false);
		},
	],
	hide: [
		function (self) {
			// Do
			self.$.container.parent().addClass("hidden");
		},
		function (self) {
			// Undo
			self.$.container.parent().removeClass("hidden");
		},
	],
	show: [
		function (self) {
			// Do
			self.$.container.parent().removeClass("hidden");
		},
		function (self) {
			// Undo
			self.$.container.parent().addClass("hidden");
		},
	],
};
Form.Fields.Number.prototype._ = scopeInterface;
Form.Fields.Number.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "Number".toLowerCase() ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

/**
 * PageLimit
 */

Form.Fields.PageLimit = function PageLimit(scope, container, json ){
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._('^form').get(0);

  this.value = null;
  this.original = null;
  this.changeListeners = [];

  this.init();
}
Form.Fields.PageLimit.prototype.init = function(){
  var html = Form.Template( this.json, {data: {
    input: true
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);

  this.$.pageLimit = this.$.html.find('.page-limit-toggle');

  // Type of limit
  this.$.type = {};
  this.$.type.basic = this.$.html.find('input[data-id="basic"]');
  this.$.type.bycolor = this.$.html.find('input[data-id="bycolor"]');
  this.$.type.bytype = this.$.html.find('input[data-id="bytype"]');
  this.$.type.advanced = this.$.html.find('input[data-id="adv"]');

  // Basic configuration
  this.$.basic = {};

  this.$.basic.limit =
    this.$.html.find('div[data-type="basic"] input[data-id="limit"]');
  this.$.basic.remaining =
    this.$.html.find('div[data-type="basic"] input[data-id="remaining"]');
  this.$.basic.lock =
    this.$.html.find('div[data-type="basic"] input[data-id="lock"]');


  // By Color configuration
  this.$.bycolor = {};
  this.$.bycolor.mono = {};
  this.$.bycolor.color = {};

  this.$.bycolor.mono.limit =
    this.$.html.find('div[data-subtype="mono"] input[data-id="limit"]');
  this.$.bycolor.mono.remaining =
    this.$.html.find('div[data-subtype="mono"] input[data-id="remaining"]');
  this.$.bycolor.mono.lock =
    this.$.html.find('div[data-subtype="mono"] input[data-id="lock"]');
  this.$.bycolor.color.limit =
    this.$.html.find('div[data-subtype="color"] input[data-id="limit"]');
  this.$.bycolor.color.remaining =
    this.$.html.find('div[data-subtype="color"] input[data-id="remaining"]');
  this.$.bycolor.color.lock =
    this.$.html.find('div[data-subtype="color"] input[data-id="lock"]');


  // By Type configuration
  this.$.bytype = {};
  this.$.bytype.print = {};
  this.$.bytype.copy = {};

  this.$.bytype.print.limit =
    this.$.html.find('div[data-subtype="print"] input[data-id="limit"]');
  this.$.bytype.print.remaining =
    this.$.html.find('div[data-subtype="print"] input[data-id="remaining"]');
  this.$.bytype.print.lock =
    this.$.html.find('div[data-subtype="print"] input[data-id="lock"]');
  this.$.bytype.copy.limit =
    this.$.html.find('div[data-subtype="copy"] input[data-id="limit"]');
  this.$.bytype.copy.remaining =
    this.$.html.find('div[data-subtype="copy"] input[data-id="remaining"]');
  this.$.bytype.copy.lock =
    this.$.html.find('div[data-subtype="copy"] input[data-id="lock"]');


  // Advanced configuration
  this.$.advanced = {};
  this.$.advanced.monoprint = {};
  this.$.advanced.monocopy = {};
  this.$.advanced.colorprint = {};
  this.$.advanced.colorcopy = {};

  this.$.advanced.monoprint.limit =
    this.$.html.find('div[data-subtype="monoprint"] input[data-id="limit"]');
  this.$.advanced.monoprint.remaining =
    this.$.html.find('div[data-subtype="monoprint"] input[data-id="remaining"]');
  this.$.advanced.monoprint.lock =
    this.$.html.find('div[data-subtype="monoprint"] input[data-id="lock"]');
  this.$.advanced.monocopy.limit =
    this.$.html.find('div[data-subtype="monocopy"] input[data-id="limit"]');
  this.$.advanced.monocopy.remaining =
    this.$.html.find('div[data-subtype="monocopy"] input[data-id="remaining"]');
  this.$.advanced.monocopy.lock =
    this.$.html.find('div[data-subtype="monocopy"] input[data-id="lock"]');

  this.$.advanced.colorprint.limit =
    this.$.html.find('div[data-subtype="colorprint"] input[data-id="limit"]');
  this.$.advanced.colorprint.remaining =
    this.$.html.find('div[data-subtype="colorprint"] input[data-id="remaining"]');
  this.$.advanced.colorprint.lock =
    this.$.html.find('div[data-subtype="colorprint"] input[data-id="lock"]');
  this.$.advanced.colorcopy.limit =
    this.$.html.find('div[data-subtype="colorcopy"] input[data-id="limit"]');
  this.$.advanced.colorcopy.remaining =
    this.$.html.find('div[data-subtype="colorcopy"] input[data-id="remaining"]');
  this.$.advanced.colorcopy.lock =
    this.$.html.find('div[data-subtype="colorcopy"] input[data-id="lock"]');


  this.i18n();
  this.bind();
}
Form.Fields.PageLimit.prototype.bind = function(){
  var self = this;
  this.$.pageLimit.on('input change', function(){
    if(this.checked){
      $(this).closest('.form-control.contain').addClass('active')
        .children('.row').fadeIn();
    }else{
      $(this).closest('.form-control.contain').removeClass('active')
        .children('.row').fadeOut();
    }
  });
  this.$.pageLimit.trigger('change');

  this.$.html.find('.limit-type input').on('change init', function(ev){
    if(this.checked){
      $(this).closest('.cont')
        .find('.page-limit-form[data-type="'+$(this).data('id')+'"]')
        .show().siblings().hide();

      if(ev.type === 'init'){
        $(this).parent().siblings('label').removeClass('active');
        $(this).parent().addClass('active');
      }
    }
  });
  this.$.html.find('.limit-type input').trigger('change');


  this.$.html.find('input').on('input change', function(){
    for( var i = 0 ; i < self.changeListeners.length ; i++ ){
      self.changeListeners[i]( self.json.id, self.get(), self.isChanged() );
    }
  });
}
Form.Fields.PageLimit.prototype.i18n = function(){
  this.$.html.i18n();
}
Form.Fields.PageLimit.prototype.getData = function(){
  return this.get();
}
Form.Fields.PageLimit.prototype.get = function(){
  return {
    "WorkWithPageLimit":
      this.$.pageLimit[0].checked,
    "WorkWithColorPageLimit":
      this.$.type.bycolor[0].checked || this.$.type.advanced[0].checked,
    "WorkWithSeparatePageLimit":
      this.$.type.bytype[0].checked || this.$.type.advanced[0].checked,

    "Lock": this.$.basic.lock[0].checked,
    "PagesMax": this.$.basic.limit.val(),
    "PagesMaxReamin": this.$.basic.remaining.val(),

    "LockMono": this.$.bycolor.mono.lock[0].checked,
    "PagesMaxMono": this.$.bycolor.mono.limit.val(),
    "PagesMaxMonoRemain": this.$.bycolor.mono.remaining.val(),

    "LockColor": this.$.bycolor.color.lock[0].checked,
    "PagesMaxColor": this.$.bycolor.color.limit.val(),
    "PagesMaxColorRemain": this.$.bycolor.color.remaining.val(),

    "LockPrint": this.$.bytype.print.lock[0].checked,
    "PagesMaxPrint": this.$.bytype.print.limit.val(),
    "PagesMaxPrintRemain": this.$.bytype.print.remaining.val(),

    "LockCopy": this.$.bytype.copy.lock[0].checked,
    "PagesMaxCopy": this.$.bytype.copy.limit.val(),
    "PagesMaxCopyRemain": this.$.bytype.copy.remaining.val(),

    "LockPrintMono": this.$.advanced.monoprint.lock[0].checked,
    "PagesMaxPrintMono": this.$.advanced.monoprint.limit.val(),
    "PagesMaxPrintMonoRemain": this.$.advanced.monoprint.remaining.val(),

    "LockCopyMono": this.$.advanced.monocopy.lock[0].checked,
    "PagesMaxCopyMono": this.$.advanced.monocopy.limit.val(),
    "PagesMaxCopyMonoRemain": this.$.advanced.monocopy.remaining.val(),


    "LockPrintColor": this.$.advanced.colorprint.lock[0].checked,
    "PagesMaxPrintColor": this.$.advanced.colorprint.limit.val(),
    "PagesMaxPrintColorRemain": this.$.advanced.colorprint.remaining.val(),

    "LockCopyColor": this.$.advanced.colorcopy.lock[0].checked,
    "PagesMaxCopyColor": this.$.advanced.colorcopy.limit.val(),
    "PagesMaxCopyColorRemain": this.$.advanced.colorcopy.remaining.val()
  }
}
Form.Fields.PageLimit.prototype.setData = function( data ){
  this.original = {
    "WorkWithPageLimit": data["WorkWithPageLimit"] || false,
    "WorkWithColorPageLimit": data["WorkWithColorPageLimit"] || false,
    "WorkWithSeparatePageLimit": data["WorkWithSeparatePageLimit"] || false,

    "Lock": data["Lock"] || false,
    "PagesMax": data["PagesMax"] || 0,
    "PagesMaxReamin": data["PagesMaxReamin"] || 0,

    "LockMono": data["LockMono"] || false,
    "PagesMaxMono": data["PagesMaxMono"] || 0,
    "PagesMaxMonoRemain": data["PagesMaxMonoRemain"] || 0,

    "LockColor": data["LockColor"] || false,
    "PagesMaxColor": data["PagesMaxColor"] || 0,
    "PagesMaxColorRemain": data["PagesMaxColorRemain"] || 0,

    "LockPrint": data["LockPrint"] || false,
    "PagesMaxPrint": data["PagesMaxPrint"] || 0,
    "PagesMaxPrintRemain": data["PagesMaxPrintRemain"] || 0,

    "LockCopy": data["LockCopy"] || false,
    "PagesMaxCopy": data["PagesMaxCopy"] || 0,
    "PagesMaxCopyRemain": data["PagesMaxCopyRemain"] || 0,

    "LockPrintMono": data["LockPrintMono"] || false,
    "PagesMaxPrintMono": data["PagesMaxPrintMono"] || 0,
    "PagesMaxPrintMonoRemain": data["PagesMaxPrintMonoRemain"] || 0,

    "LockCopyMono": data["LockCopyMono"] || false,
    "PagesMaxCopyMono": data["PagesMaxCopyMono"] || 0,
    "PagesMaxCopyMonoRemain": data["PagesMaxCopyMonoRemain"] || 0,

    "LockPrintColor": data["LockPrintColor"] || false,
    "PagesMaxPrintColor": data["PagesMaxPrintColor"] || 0,
    "PagesMaxPrintColorRemain": data["PagesMaxPrintColorRemain"] || 0,

    "LockCopyColor": data["LockCopyColor"] || false,
    "PagesMaxCopyColor": data["PagesMaxCopyColor"] || 0,
    "PagesMaxCopyColorRemain": data["PagesMaxCopyColorRemain"] || 0
  };
  this.set( this.original );
}
Form.Fields.PageLimit.prototype.set = function( val ){
  this.$.pageLimit.prop('checked', val["WorkWithPageLimit"] );

  if( val["WorkWithColorPageLimit"] && val["WorkWithSeparatePageLimit"] ){
    this.$.type.advanced.prop('checked', true);
  }else if( val["WorkWithColorPageLimit"] ){
    this.$.type.bycolor.prop('checked', true);
  }else if( val["WorkWithSeparatePageLimit"] ){
    this.$.type.bytype.prop('checked', true);
  }else{
    this.$.type.basic.prop('checked', true);
  }

  // Basic configuration
  this.$.basic.limit.val( val["PagesMax"] );
  this.$.basic.remaining.val( val["PagesMaxReamin"] );
  this.$.basic.lock.prop('checked', val["Lock"]);


  // By Color configuration
  this.$.bycolor.mono.limit.val( val["PagesMaxMono"] );
  this.$.bycolor.mono.remaining.val( val["PagesMaxMonoRemain"] );
  this.$.bycolor.mono.lock.prop('checked', val["LockMono"]);

  this.$.bycolor.color.limit.val( val["PagesMaxColor"] );
  this.$.bycolor.color.remaining.val( val["PagesMaxColorRemain"] );
  this.$.bycolor.color.lock.prop('checked', val["LockColor"]);


  // By Type configuration
  this.$.bytype.print.limit.val( val["PagesMaxPrint"] );
  this.$.bytype.print.remaining.val( val["PagesMaxPrintRemain"] );
  this.$.bytype.print.lock.prop('checked', val["LockPrint"]);

  this.$.bytype.copy.limit.val( val["PagesMaxCopy"] );
  this.$.bytype.copy.remaining.val( val["PagesMaxCopyRemain"] );
  this.$.bytype.copy.lock.prop('checked', val["LockCopy"]);


  // Advanced configuration
  this.$.advanced.monoprint.limit.val( val["PagesMaxPrintMono"] );
  this.$.advanced.monoprint.remaining.val( val["PagesMaxPrintMonoRemain"] );
  this.$.advanced.monoprint.lock.prop('checked', val["LockPrintMono"]);

  this.$.advanced.monocopy.limit.val( val["PagesMaxCopyMono"] );
  this.$.advanced.monocopy.remaining.val( val["PagesMaxCopyMonoRemain"] );
  this.$.advanced.monocopy.lock.prop('checked', val["LockCopyMono"]);

  this.$.advanced.colorprint.limit.val( val["PagesMaxPrintColor"] );
  this.$.advanced.colorprint.remaining.val( val["PagesMaxPrintColorRemain"] );
  this.$.advanced.colorprint.lock.prop('checked', val["LockPrintColor"]);

  this.$.advanced.colorcopy.limit.val( val["PagesMaxCopyColor"] );
  this.$.advanced.colorcopy.remaining.val( val["PagesMaxCopyColorRemain"] );
  this.$.advanced.colorcopy.lock.prop('checked', val["LockCopyColor"]);



  this.$.pageLimit.trigger('change');
  this.$.html.find('.limit-type input:checked').trigger('init');

}
Form.Fields.PageLimit.prototype.reset = function(){
}
Form.Fields.PageLimit.prototype.clear = function(){
}
Form.Fields.PageLimit.prototype.applyFieldBinds = function(){
}
Form.Fields.PageLimit.prototype.validate = function(){
  // stub
}
Form.Fields.PageLimit.prototype.saveData = function(){
  this.original = this.get();
  for( var i = 0 ; i < this.changeListeners.length ; i++ ){
    this.changeListeners[i]( this.json.id, this.get(), this.isChanged() );
  }
}
Form.Fields.PageLimit.prototype.refresh = function(){

}
Form.Fields.PageLimit.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];

  this.changeListeners.push( callback );
}
Form.Fields.PageLimit.prototype.isChanged = function(){
  if(!this.original)
    return false;

  var self = this;
  var data = this.get();
  var K = Object.keys( data );

  var r = K.reduce(function( a, k ){
    if( data[k] != self.original[k] ){
      return true;
    }
    return a;
  }, false);

  return r;
}
Form.Fields.PageLimit.prototype._ = scopeInterface;
Form.Fields.PageLimit.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('PageLimit').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};

/**
 * Password
 */

Form.Fields.Password = function Password(scope, container, json ){
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._('^form').get(0);

  this.value = null;
  this.original = null;

  this.changeListeners = [];

  this.init();
}
Form.Fields.Password.prototype.init = function(){
  var html = Form.Template( this.json, {data: {
    input: true
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);
  this.$.input = this.$.container.find('input');
  this.$.button = this.$.container.find('button');
  //this.$.container.find('.form-password').password();
  //this.$.container.find('.input-append').css('width','100%');
  this.bind();
  this.i18n();
}
Form.Fields.Password.prototype.bind = function(){
  var self = this;
  this.$.input.on('input change', function( ev ){
    self.value = this.value;
    self.validate();

    self.doChanges();
  });
  this.$.button.on('click', function( ev ){
    self.$.input.attr('type', self.$.input.attr('type') === 'text' ? 'password' : 'text')
  });
}
Form.Fields.Password.prototype.i18n = function(){
  this.$.html.i18n();
}
Form.Fields.Password.prototype.readonly = function(set){
  if( typeof set === 'undefined' )
    return this.isReadOnly;

  this.isReadOnly = !!set;
  this.$.input.attr('readonly', this.isReadOnly);
}
Form.Fields.Password.prototype.getData = function(){
  var d = {};
  d[this.json.id] = this.value;
  return d;
}
Form.Fields.Password.prototype.get = function(){
  return this.value;
}
Form.Fields.Password.prototype.setData = function( data ){
  this.original = data[ this.json.id ];
  this.set( this.original );
}
Form.Fields.Password.prototype.set = function( val ){
  this.value = val;
  this.$.input.val( val );

  this.doChanges();
}
Form.Fields.Password.prototype.isChanged = function(){
  var val = this.get();
  return val !== this.original &&
    !(this.original === null && val === '' );
}
Form.Fields.Password.prototype.reset = function(){
  this.set( this.original );
}
Form.Fields.Password.prototype.clear = function(){
  this.value = null;
  this.original = null;

  this.$.input.val('');
  this.clearErrors();
}
Form.Fields.Password.prototype.clearErrors = function(){
  if( !this._tabli )
    this._tabli = $('[href="#'+this.$.html.closest('.tab-pane').attr('id')+'"]').parent();

  var cerrors = (this._tabli.attr('data-validation-error') || '').split(';');
  if( cerrors.indexOf(this.json.id) > -1 ){
    cerrors.splice(cerrors.indexOf(this.json.id), 1);
    if(cerrors.length > 0){
      this._tabli.attr('data-validation-error', cerrors.join(';') );
    }else{
      this._tabli.removeAttr('data-validation-error');
    }
  }
  this.$.html.closest('.form-group').removeClass('has-error');
}
Form.Fields.Password.prototype.applyFieldBinds = function(){
  var self = this;
  var B = this.json.binds;
  if(!B) return;

  B.forEach(function(b){
    var t = self.form._('_'+b.to).get(0);
    // create bind
    t.onChange(function(){
      var get = t.get();
      if( ( b.field && get ? get[b.field] : get ) == b.value ){
        self.do(b.value,b.do, b.to);
      }else{
        self.do(b.value,b.do, b.to, true);
      }
    });
    // apply it
    var get = t.get();
    if( ( b.field && get ? get[b.field] : get ) == b.value ){
      self.do(b.value,b.do, b.to);
    }else{
      self.do(b.value,b.do, b.to, true);
    }
  });
}
Form.Fields.Password.prototype.do = function( value, action, context, undo ){
  var self = this;
  if(!this.state)
    this.state = {};

  // Get previous differences
  var psK = Object.keys(this.state);
  var ps = {}; // previous state
  for( var i = 0 ; i < psK.length ; i++ ){
    ps[this.state[psK[i]]] = true;
  }

  if(undo){
    if(this.state[action+'_'+value+'_'+context]){
      delete this.state[action+'_'+value+'_'+context];
    }else{
      return;
    }
  }else{
    if(!this.state[action+'_'+value+'_'+context]){
      this.state[action+'_'+value+'_'+context] = action;
    }else{
      return;
    }
  }


  // Get current differences
  var csK = Object.keys(this.state);
  var cs = {}; // current state
  for( var i = 0 ; i < csK.length ; i++ ){
    cs[this.state[csK[i]]] = true;
  }

  // Just making bA as a shortcut for bindActions
  var bA = Form.Fields.Password.bindActions;

  // reset states
  var aK = Object.keys(bA);
  for( var i = 0 ; i < aK.length ; i++ ){
    if( ps[aK[i]] ){      // if in previous
      if( cs[aK[i]] ){    // and in current
        continue;         // same state. do nothing
      }
      bA[aK[i]][1](this); // not in current. undo
    }

    if( cs[aK[i]] ){      // if only in current
      bA[aK[i]][0](this); // apply state
    }
  }
}
Form.Fields.Password.prototype.validate = function(){
  var self = this;
  // check if has validation settings
  if( !this.json.validation )
    return true;

  var errors = []; // i18n keys

  // setup validation elements
  if( !this._tabli )
    this._tabli = $('[href="#'+this.$.html.closest('.tab-pane').attr('id')+'"]').parent();


  var val = this.json.validation;
  var value = this.get();

  // validate empty
  if( val.required && ( !value || (value+'').trim() === '' ) ){
    // apply error
    // i18n.t('common.errors.required');
    errors.push('app.errors.required-field');
  }else if( val.regex ){
    // make regexes
    if( !this.regexes ){
      this.regexes = {};

      val.regex.forEach(function( v, k ){
        self.regexes[k] = new RegExp(k);
      });
    }

    var vK = Object.keys(val.regex);
    for( var i = 0 ; i < vK.length ; i++ ){
      var k = vK[i];
      var r = self.regexes[k];

      if( !r.test(value) ){
        errors.push(val.regex[k]);
      }
    }
  }


  if( val.custom ){
    (Array.isArray(val.custom)?val.custom:[val.custom]).forEach(function(f){
      var err;
      if(self.form.actions[f]){
        err = self.form.actions[f]( value, self, val );
        if( err )
          errors.push(err);
      }
    })
  }
  if(errors.length > 0){
    self.$.container.closestChildren('.for-error').html(errors.map(function(v){return i18n.t(v); }).join('<br>'));

    this.$.html.closest('.form-group').addClass('has-error');

    var cerrors = (this._tabli.attr('data-validation-error') || '').split(';');
    if( cerrors.indexOf(this.json.id) < 0 ){
      if(cerrors[0] === '')
        cerrors = [];
      cerrors.push(this.json.id);
      this._tabli.attr('data-validation-error', cerrors.join(';'));
    }
    return false;
  }

  // unset errors. set success?
  var cerrors = (this._tabli.attr('data-validation-error') || '').split(';');
  if( cerrors.indexOf(this.json.id) > -1 ){
    cerrors.splice(cerrors.indexOf(this.json.id), 1);
    if(cerrors.length > 0){
      this._tabli.attr('data-validation-error', cerrors.join(';') );
    }else{
      this._tabli.removeAttr('data-validation-error');
    }
  }
  this.$.html.closest('.form-group').removeClass('has-error');
  return true;
}
Form.Fields.Password.prototype.saveData = function(){
  this.original = this.get();
  this.doChanges();
}
Form.Fields.Password.prototype.doChanges = function(){
  var changed = this.isChanged();
  var val = this.get();

  if( changed && !this.json.muted ){
    this.$.container.closest('.form-group').addClass('changed');
  }else{
    this.$.container.closest('.form-group').removeClass('changed');
  }

  for( var i = 0 ; i < this.changeListeners.length ; i++ ){
    this.changeListeners[i]( this.json.id, val, changed );
  }
}
Form.Fields.Password.prototype.refresh = function(){

}
Form.Fields.Password.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];

  this.changeListeners.push( callback );
}
Form.Fields.Password.bindActions = {
  disable: [
    function( self ){ // Do
      self.$.input.prop('disabled', true);
    },
    function( self ){ // Undo
      self.$.input.prop('disabled', false);
    }
  ],
  hide: [
    function( self ){ // Do
      self.$.container.parent().addClass('hidden');
    },
    function( self ){ // Undo
      self.$.container.parent().removeClass('hidden');
    }
  ],
  show: [
    function( self ){ // Do
      self.$.container.parent().removeClass('hidden');
    },
    function( self ){ // Undo
      self.$.container.parent().addClass('hidden');
    }
  ]
}
Form.Fields.Password.prototype._ = scopeInterface;
Form.Fields.Password.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('Password').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};
/**
 * PDFViewer
 */

Form.Fields.PDFViewer = function PDFViewer(scope, container, json) {
	this.scope = scope;
	this.container = container;
	this.json = json;

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;

	this.src = "./include/pdfjs/web/viewer.html";

	this.form = this._("^form").get(0);
	this.view = this._("^view").get(0);
	this.tab = this._("^tab").get(0);

	if (this.form.json.name) {
		this.name = this.form.json.name;
	} else {
		this.name = this.json.name;
	}

	this.value = null;
	this.original = null;

	this.changeListeners = [];

	this.init();
};
Form.Fields.PDFViewer.prototype.init = function () {
	var self = this;
	var html = Form.Template(this.json, {
		data: {
			input: true,
		},
	});

	this.$.html = $(html);
	if (this.json.visibility === "hidden")
		this.$.container.parent().addClass("hidden");

	this.$.container.append(this.$.html);
	if (this.json.pdfUrl) {
		this.url = Handlebars.compile(
			this.view.getUrl(this.json.pdfUrl) || this.json.pdfUrl
		);
	} else {
		this.url = "";
	}

	this.window = null;
	this.$.iframe = this.$.container.find("iframe");
	// set onload for binds
	this.$.iframe[0].src = this.src;

	this.$.iframe.load(function () {
		self.window = this.contentWindow;
		self.window.mozL10n.setLanguage(i18n.lng());

		self.window.document.getElementById("reloadPDF").classList.remove("hidden");

		self.form.initPromise.then((x) => {
			self.formReady = true;
			if (self.waitingForForm) {
				self.waitingForForm = false;
				self.reload();
			}
		});

		if (self.json.autoLoad) {
			if (self.$.html.is(":visible")) {
				self.reload();
			} else {
				self.deferring = true;
			}
		}

		self.bind();
		self.i18n();
	});
};
Form.Fields.PDFViewer.prototype.bind = function () {
	var self = this;

	this.window.viewer.addEventListener("textlayerrendered", function () {
		self.$.container.parent().boxUnBusy();
	});

	this.window.document
		.getElementById("fauxPresentationMode")
		.addEventListener("click", toggleFullscreen);
	this.window.document
		.getElementById("secondaryFauxPresentationMode")
		.addEventListener("click", toggleFullscreen);
	function toggleFullscreen() {
		if (
			!(
				document.fullscreenElement ||
				document.mozFullScreen ||
				document.webkitIsFullScreen ||
				document.msFullscreenElement
			)
		) {
			var viewer = self.$.iframe[0];
			var rFS =
				viewer.mozRequestFullScreen ||
				viewer.webkitRequestFullscreen ||
				viewer.msRequestFullscreen ||
				viewer.requestFullscreen;
			rFS.call(viewer);
		} else {
			var ef =
				document.mozCancelFullScreen ||
				document.webkitExitFullscreen ||
				document.msExitFullscreen ||
				document.exitFullscreen;
			ef.call(document);
		}
	}

	this.window.document
		.getElementById("reloadPDF")
		.addEventListener("click", reloadPDF);
	this.window.document
		.getElementById("secondaryReloadPDF")
		.addEventListener("click", reloadPDF);
	function reloadPDF() {
		self.reload();
	}

	this.window.document
		.getElementById("fauxDownload")
		.addEventListener("click", downloadPDF);
	this.window.document
		.getElementById("secondaryFauxDownload")
		.addEventListener("click", downloadPDF);
	function downloadPDF() {
		self.download("pdf");
	}
	// PDFViewerApplication.download();
};
Form.Fields.PDFViewer.prototype.reload = function (data, urlOverride) {
	if (!this.formReady) {
		this.waitingForForm = true;
		return;
	}

	this.$.container.parent().boxBusy();
	if (urlOverride) {
		this.url = Handlebars.compile(urlOverride);
	}

	this.currentPDF = this.url({
		data: encodeURIComponent(JSON.stringify(data || this.form.getData())),
		format: "pdf",
		id: this.form.id,
	});
	this.window.PDFViewerApplication.open(this.currentPDF);
	this.loaded = true;
	this.lastLoad = Date.now();
};
Form.Fields.PDFViewer.prototype.i18n = function () {
	this.window.mozL10n.setLanguage(i18n.lng());
	if (this.loaded && Date.now > this.lastLoad + 3000) this.reload();
};
Form.Fields.PDFViewer.prototype.download = function (format, opts) {
	var self = this;

	if (!format || format.toLowerCase() === "pdf") {
		if (self.json.pdfNamePromise) {
			self.form.actions[self.json.pdfNamePromise](self).then((filename) => {
				self.window.PDFViewerApplication.pdfDocument
					.getData()
					.then(function (d) {
						download(d, filename, "application/pdf");
					});
			});
		} else {
			this.window.PDFViewerApplication.pdfDocument.getData().then(function (d) {
				download(
					d,
					self.tab.$.label.text().trim().replace("[^a-zA-Z0-9.-]", "_") +
						".pdf",
					"application/pdf"
				);
			});
		}
		//this.window.PDFViewerApplication.download();
	} else if (format.toLowerCase() === "excel") {
		var url = this.url({
			data: encodeURIComponent(JSON.stringify(this.form.getData())),
			format: "xlsx",
			id: this.form.id,
		});
		var x = new XMLHttpRequest();
		x.open("GET", url, true);
		x.responseType = "blob";
		x.onload = function (e) {
			download(
				e.target.response,
				self.tab.$.label.text().trim().replace("[^a-zA-Z0-9.-]", "_") + ".xlsx",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			);
		};
		x.send();
	} else if (format === "custom" && opts) {
		var url = this.url({
			data: encodeURIComponent(JSON.stringify(this.form.getData())),
			format: opts.format,
			id: this.form.id,
		});
		var x = new XMLHttpRequest();
		x.open("GET", url, true);
		x.responseType = "blob";
		x.onload = function (e) {
			download(
				e.target.response,
				self.tab.$.label.text().trim().replace("[^a-zA-Z0-9.-]", "_") +
					"." +
					opts.format,
				opts.mimetype
			);
		};
		x.send();
	}
};
Form.Fields.PDFViewer.prototype.getData = function () {};
Form.Fields.PDFViewer.prototype.get = function () {};
Form.Fields.PDFViewer.prototype.setData = function (data) {
	this.original = data[this.json.id] || "";
	data[this.json.id] = this.original;
	this.set(this.original);
};
Form.Fields.PDFViewer.prototype.set = function (val) {};
Form.Fields.PDFViewer.prototype.reset = function () {};
Form.Fields.PDFViewer.prototype.clear = function () {};
Form.Fields.PDFViewer.prototype.applyFieldBinds = function () {};
Form.Fields.PDFViewer.prototype.validate = function () {
	// stub
};
Form.Fields.PDFViewer.prototype.saveData = function () {};
Form.Fields.PDFViewer.prototype.refresh = function () {
	if (this.deferring) {
		this.deferring = false;
		this.reload();
	}
};
Form.Fields.PDFViewer.prototype.isChanged = function () {};
Form.Fields.PDFViewer.prototype.onChange = function () {};
Form.Fields.PDFViewer.prototype._ = scopeInterface;
Form.Fields.PDFViewer.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "PDFViewer".toLowerCase() ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

Form.Fields.Permissions = function Permissions(scope, container, json ){
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;

  this.form = this._('^form').get(0);
  this.view = this._('^view').get(0);

  this.value = null;
  this.original = null;

  this.changeListeners = [];

  this.init();
}
Form.Fields.Permissions.prototype.init = function(){
  var self = this;
  this.json.ap = permissions;

  var html = Form.Template( this.json, {data: {
    input: true
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);

  this.getUsersUrl = (this.view.getUrl(this.json.getUsersUrl)?this.view.getUrl(this.json.getUsersUrl).fillWith( this ):this.json.getUsersUrl);
  this.getRolesUrl = (this.view.getUrl(this.json.getRolesUrl)?this.view.getUrl(this.json.getRolesUrl).fillWith( this ):this.json.getRolesUrl);
  this.getViewsUrl = (this.view.getUrl(this.json.getViewsUrl)?this.view.getUrl(this.json.getViewsUrl).fillWith( this ):this.json.getViewsUrl);
  this.postUrl = (this.view.getUrl(this.json.postUrl)?this.view.getUrl(this.json.postUrl).fillWith( this ):this.json.postUrl);

  this.templates = ({
    user: ''
      +'<tr class="user-tr hidden">'
      +'  {{#if first}}'
      +'  <td rowspan="1" class="user">'
      +'    <span data-i18n="app.permissions.users"> Users </span>'
      +'  </td>'
      +'  {{/if}}'
      +'  <td class="view-user" data-id="{{data.UserId}}">'
      +'    {{data.FirstName}} {{data.LastName}} <i class="fa fa-trash remove">'
      +'  </td>'
      +'  '
      +'  {{#each ap}}'
      +'  <td class="text-center">'
      +'    <div class="checkboxb">'
      +'      <input type="checkbox" id="u_{{../perm.view}}_{{../data.UserId}}_{{k}}" data-id="{{k}}" {{#eq (prop ../perm.p k) true}}checked{{/eq}}>'
      +'      <label for="u_{{../perm.view}}_{{../data.UserId}}_{{k}}"></label>'
      +'    </div>'
      +'  </td>'
      +'  {{/each}}'
      +'  '
      +'</tr>'
      ,
    role: ''
      +'<tr class="role-tr">'
      +'  {{#if first}}'
      +'  <td rowspan="1" class="role">'
      +'    <span data-i18n="app.permissions.roles"> Roles </span>'
      +'  </td>'
      +'  {{/if}}'
      +'  <td class="view-role" data-id="{{data.RoleId}}">'
      +'    {{data.Name}} <i class="fa fa-trash remove">'
      +'  </td>'
      +'  '
      +'  {{#each ap}}'
      +'  <td class="text-center">'
      +'    <div class="checkboxb">'
      +'      <input type="checkbox" id="r_{{../perm.view}}_{{../data.RoleId}}_{{k}}" data-id="{{k}}" {{#eq (prop ../perm.p k) true}}checked{{/eq}}>'
      +'      <label for="r_{{../perm.view}}_{{../data.RoleId}}_{{k}}"></label>'
      +'    </div>'
      +'  </td>'
      +'  {{/each}}'
      +'  '
      +'</tr>'
      ,
    view: ''
      +'<tbody class="view closed" data-view-id="{{data.ApiObjectId}}" data-order="{{i}}">'
      +'  <tr class="view-tr">'
      +'    <td colspan="2" class="view-name"> <span class="view-collapse"><i class="fa fa-fw"></i> {{{FullViewPath}}} </span>  <i class="fa fa-trash remove"></i> </td>'
      +'    '
      +'    {{#each ap}}'
      +'    <td class="text-center">'
      +'      <div class="checkboxb">'
      +'        <input type="checkbox" id="v_{{../data.ApiObjectId}}_{{k}}" data-id="{{k}}" {{#eq (prop ../p k) true}}checked{{/eq}}>'
      +'        <label for="v_{{../data.ApiObjectId}}_{{k}}"></label>'
      +'      </div>'
      +'    </td>'
      +'    {{/each}}'
      +'    '
      +'  </tr>'
      +'</tbody>'
  }).keyMap(function(v){return Handlebars.compile(v)});


  this.viewIndex = {};
  this.$.tree = this.$.html.find('.view-tree');
  // get views
  Tools.Ajax.defaultPost( this.getViewsUrl )
  .then(function(data){
    var views = data.data;
    var a = views.sort(function(a, b){
      return a.OrderId - b.OrderId
    });

    var index = {};
    self.viewIndex = index;

    var tree = [];

    // index it and format it
    for( var i = 0 ; i < a.length ; i++ ){
      index[a[i].ApiObjectId] = a[i];
      a[i]['data-i18n'] = a[i].I18n;
      a[i].text = i18n.t(a[i]['data-i18n']);
      a[i].icon = a[i].Icon;
    }

    // build tree and add roots to tree
    for( var i = 0, p ; i < a.length ; i++ ){
      p = a[i].ApiObjectPaiId
      if( p && index[p] ){
        index[p].nodes = index[p].nodes || [];
        index[p].nodes.push( a[i] );
      //  index[p].selectable = false;
      }else{
        tree.push( a[i] );
      }
    }

    self.treeData = tree;
    var f = [];
    var Q = tree.map(function(v){return v});
    var q;
    while( Q.length > 0 ){
      q = Q.shift();
      f.push(q);
      if( q.nodes ){
        for( var i = q.nodes.length-1 ; i >= 0 ; i-- ){
          Q.unshift(q.nodes[i]);
        }
      }
    }

    for( var i = 0 ; i < f.length ; i++ ){
      f[i].i=i;
    }
    self.flatTree = f;

    self.$.tree.treeview({
      data: tree,
      levels: 1,
      collapseIcon: 'fa fa-fw fa-minus',
      expandIcon: 'fa fa-fw fa-plus',
      selectedIcon: 'fa fa-check-square-o',
      searchResultColor: 'rgb(22, 115, 221)',
      selectedBackColor: 'rgba(218, 218, 218, 0.1)',
      selectedColor: 'black',
      multiSelect: true
    });

    self.initTable();
  })
  .catch(function(err){
    console.error(err);
  });

  this.$.p = permissions.keyMap(function(v, k){
    return self.$.html.find('#perm-'+k)[0]
  });

  this.$.table = this.$.html.find('table');
  //this.$.table.floatThead({position:'absolute'});

  // add and remove as needed
  this.data = {};
  this.initSelects();
  this.bind();
  this.i18n();
}
Form.Fields.Permissions.prototype.initTable = function(){
  var self = this;
  var tree = self.treeData;
  var f = self.flatTree;
  Tools.Ajax.defaultPost( window.app.settings['api-url']+'/users/getallpermission')
  .then(function( data ){

    data.Users.forEach(function(v){
      self.users[v.UserId] = v;
      var pIndex = {};
      if( v.Permission ){
        v.Permission.forEach(function(p){
          pIndex[p.ApiObjectId] = p;
          self.userP[p.ApiObjectId] = self.userP[p.ApiObjectId] || {};
          self.userP[p.ApiObjectId][v.UserId] = p;
        });
      }

      self.addRows(
        [],
        [v.UserId],
        f.filter(function(f){
          if( pIndex[f.ApiObjectId] )
            return true;
          return false;
        })
      );
    });

    data.Roles.forEach(function(v){
      self.roles[v.RoleId] = v;
      var pIndex = {};
      if( v.Permission ){
        v.Permission.forEach(function(p){
          pIndex[p.ApiObjectId] = p;
          self.roleP[p.ApiObjectId] = self.roleP[p.ApiObjectId] || {};
          self.roleP[p.ApiObjectId][v.RoleId] = p;
        });
      }

      self.addRows(
        [v.RoleId],
        [],
        f.filter(function(f){
          if( pIndex[f.ApiObjectId] )
            return true;
          return false;
        })
      );
    });
  });
}
Form.Fields.Permissions.prototype.addRows = function( roles, users, views ){
  var self = this;

  // get defaults from checkboxes
  var p = self.$.p.keyMap(function(v){return v.checked});

  // add to structure
  var d = self.data;
  views.reverse();
  views.forEach(function(v){
    var id = v.ApiObjectId;
    var $view;
    if( d[id] ){
      $view = self.$.table.find('[data-view-id="'+id+'"]');
      $view.detach().prependTo(self.$.table);
      // pull up
    }else{
      // add view to both data and DOM
      d[id] = {
        id: id,
        roles: {},
        users: {}
      };
      $view = $(self.templates.view({
        ap: permissions,
        p: p,
        i: v.i,
        data: self.viewIndex[id],
        FullViewPath: (function gp(i){
          return (i.ApiObjectPaiId?gp(self.viewIndex[i.ApiObjectPaiId])+' > ':'')
            +'<span data-i18n="'+i.I18n+'">'+i18n.t(i.I18n)+'</span>';
          })( self.viewIndex[id] )
        })
      );

      if( !self.$.table.has('tbody').length ){
        $view.appendTo( self.$.table );
      }else{
        $view.insertBefore( self.$.table.find('tbody')[0] );
      }
    }

    roles.forEach(function(rid){
      var r = self.roles[rid];
      if( d[id].roles[rid] ){
        // pull up
        // or maybe not

        // check permissions
      }else{
        d[id].roles[rid] = r;
        if( !$view.has('.role').length ){
          $view.append( self.templates.role({
            ap:permissionList,
            perm:{
              view:id,
              p:( self.roleP[id]&&self.roleP[id][rid]
                ? ({}).deepMerge(p).deepMerge(parsePermissions(self.roleP[id][rid].ApiPermissionValue))
                :p)
            },
            data:r,
            first:true
          }));
        }else{
          var $vr = $view.find('.role')
          $vr.attr('rowspan', ($vr.attr('rowspan')|0) + 1 );
          $view.find('.view-role').parent().last().after(
            self.templates.role({
              ap:permissionList,
              perm:{
                view:id,
                p:( self.roleP[id]&&self.roleP[id][rid]
                  ? ({}).deepMerge(p).deepMerge(parsePermissions(self.roleP[id][rid].ApiPermissionValue))
                  :p)
              },
              data:r
            })
          );
        }
        // check permissions
      }
    });

    users.forEach(function(rid){
      var r = self.users[rid];
      if( d[id].users[rid] ){
        // pull up
        // or maybe not

        // check permissions
      }else{
        d[id].users[rid] = r;
        if( !$view.has('.user').length ){
          $view.append( self.templates.user({
            ap:permissionList,
            perm:{
              view:id,
              p:( self.userP[id]&&self.userP[id][rid]
                ? ({}).deepMerge(p).deepMerge(parsePermissions(self.userP[id][rid].ApiPermissionValue))
                :p)
            },
            data:r,
            first:true
          }));
        }else{
          var $vr = $view.find('.user')
          $vr.attr('rowspan', ($vr.attr('rowspan')|0) + 1 );
          $view.find('.view-user').parent().last().after(
            self.templates.user({
              ap:permissionList,
              perm:{
                view:id,
                p:( self.userP[id]&&self.userP[id][rid]
                  ? ({}).deepMerge(p).deepMerge(parsePermissions(self.userP[id][rid].ApiPermissionValue))
                  :p)
              },
              data:r
            })
          );
        }
        // check permissions
      }
    });
    // check headers
  });
  self.$.table.find('.view-tr').each(function(){
    var $tr = $(this);
    var $tbody = $tr.closest('tbody');
    $tr.find('input[type="checkbox"]').each(function(){
      var p = $(this).data('id');
      if( $tbody.children(':not(.view-tr)').find('[data-id="'+p+'"]:not(:checked)').length === 0 ){
        $tbody.children('.view-tr').find('[data-id="'+p+'"]')[0].checked = true;
      }else{
        $tbody.children('.view-tr').find('[data-id="'+p+'"]')[0].checked = false;
      }
    });
  });

  $( self.$.table.children('tbody').detach().toArray().sort(function(a, b){
    return a.getAttribute('data-order') - b.getAttribute('data-order')
  })).appendTo(self.$.table);

  $(window).trigger('resize');
  self.$.table.floatThead('reflow');

  if( Object.keys(self.data).length > 0 ){
    self.$.table.closest('.form-group').removeClass('hidden')
  }

  // trigger changes logic
  self.$.table.find('tr:not(.view-tr)').find('[data-id="read"]').trigger('change');

  self.$.table.i18n();
}
Form.Fields.Permissions.prototype.bind = function(){
  var self = this;
  // Bind search
  this.$.html.find('.tree-search-input').on('input change', function(ev){
    self.$.tree.treeview('search', [ $(this).val(), {
      ignoreCase: true,     // case insensitive
      exactMatch: false,    // like or equals
      revealResults: true,  // reveal matching nodes
    }]);
  });

  this.$.html.find('[data-id="btn-select-all"]').on('click', function(){
    self.$.tree.treeview('selectAll');
  });

  this.$.html.find('[data-id="btn-select-none"]').on('click', function(){
    self.$.tree.treeview('unselectAll');
    self.$.tree.treeview('collapseAll');
    self.$.html.find('.tree-search-input').trigger('change');
  });


  this.$.html.find('[data-id="add-button"]').on('click', function(){
    // get roles from select
    var roles = self.$.roles.val() || [];

    // get users from select
    var users = self.$.users.val() || [];

    if( users.length + roles.length === 0 )
      return;

    // get views from treeview
    var views = self.$.tree.treeview('getSelected');
    if( !views.length )
      return;

    self.addRows( roles, users, views );
  });

  this.$.html.find('.default-permissions').on('change', 'input[type="checkbox"]', function(){
    var $this = $(this);
    if( this.checked && $this.data('id') !== 'read' ){
      $this.closest('.form-group').find('[data-id="read"]:not(:checked)').prop('checked', true);
    } else if( !this.checked &&  $this.data('id') === 'read' ){
      $this.closest('.form-group').find('[data-id!="read"]:checked').prop('checked', false);
    }
  });

  this.$.html.find('.searchclear').on('click', function(ev){
    $(this).siblings('input').val('').trigger('change');
  });

  this.$.html.find('table').on('click', '.view-collapse', function(ev){
    $(this).closest('tbody').toggleClass('closed');
    self.$.table.floatThead('reflow');
  });

  this.$.html.find('table').on('change', 'input[type="checkbox"]', function(ev){
    var $this = $(this);
    var p = $this.data('id');
    var checked = this.checked;
    var $tbody = $this.closest('tbody');
    var vid = $tbody.data('view-id');
    var $tr = $this.closest('tr');
    // check if is header
    //   check all underneath
    //   foreach changed
    //     if in changes
    //       remove
    //     else
    //       add to changes
    // else
    //   if all checked, check header
    //   else uncheck
    //   if in changes
    //     remove
    //   else
    //     add to changes
    if( $tr.hasClass('view-tr') ){
      if( checked ){
        $tbody.find('[data-id="'+p+'"]:not(:checked)').not(this).each(function(){
          this.checked = true;
          $(this).trigger('change');
        });

      }else{
        $tbody.find('[data-id="'+p+'"]:checked').not(this).each(function(){
          this.checked = false;
          $(this).trigger('change');
        });
      }
    }else{
      if( $tr.hasClass('role-tr') ){
        if( $tbody.children(':not(.view-tr)').find('[data-id="'+p+'"]:not(:checked)').length === 0 ){
          $tbody.children('.view-tr').find('[data-id="'+p+'"]')[0].checked = true;
        }else{
          $tbody.children('.view-tr').find('[data-id="'+p+'"]')[0].checked = false;
        }


        var id = $tr.children('.view-role').data('id');
        var nP = makePermissions(permissions.keyMap(function(v,k){return $tr.find('[data-id="'+k+'"]')[0].checked}));
        var oP;
        if( !self.roleP[vid] || !self.roleP[vid][id] ){
          oP = 0;
        }else{
          oP = self.roleP[vid][id].ApiPermissionValue;
        }

        if( nP === oP ){
          if( self.rolePChanges[vid] && self.rolePChanges[vid][id] ){
            delete self.rolePChanges[vid][id];
            if( Object.keys(self.rolePChanges[vid]).length === 0 )
              delete self.rolePChanges[vid];
          }
        }else{
          if( !self.roleP[vid] || !self.roleP[vid][id] ){
            self.rolePChanges[vid] = self.rolePChanges[vid] || {};
            self.rolePChanges[vid][id] = {
              ApiPermissionValue: nP,
              ApiObjectId: vid
            }
          }else{
            self.rolePChanges[vid] = self.rolePChanges[vid] || {};
            self.rolePChanges[vid][id] = {
              ApiPermissionId: self.roleP[vid][id].ApiPermissionId,
              ApiPermissionValue: nP,
              ApiObjectId: vid
            }
          }
        }

        // if(self.data[vid].roles[id])

      }else if( $tr.hasClass('user-tr') ){
        if( $tbody.children(':not(.view-tr)').find('[data-id="'+p+'"]:not(:checked)').length === 0 ){
          $tbody.children('.view-tr').find('[data-id="'+p+'"]')[0].checked = true;
        }else{
          $tbody.children('.view-tr').find('[data-id="'+p+'"]')[0].checked = false;
        }
        var id = $tr.children('.view-user').data('id');
        var nP = makePermissions(permissions.keyMap(function(v,k){return $tr.find('[data-id="'+k+'"]')[0].checked}));
        var oP;
        if( !self.userP[vid] || !self.userP[vid][id] ){
          oP = 0;
        }else{
          oP = self.userP[vid][id].ApiPermissionValue;
        }

        if( nP === oP ){
          if( self.userPChanges[vid] && self.userPChanges[vid][id] ){
            delete self.userPChanges[vid][id];
            if( Object.keys(self.userPChanges[vid]).length === 0 )
              delete self.userPChanges[vid];
          }
        }else{
          if( !self.userP[vid] || !self.userP[vid][id] ){
          self.userPChanges[vid] = self.userPChanges[vid] || {};
          self.userPChanges[vid][id] = {
            ApiPermissionValue: nP,
            ApiObjectId: vid
          }
          }else{
            self.userPChanges[vid] = self.userPChanges[vid] || {};
            self.userPChanges[vid][id] = {
              ApiPermissionId: self.userP[vid][id].ApiPermissionId,
              ApiPermissionValue: nP,
              ApiObjectId: vid
            }
          }
        }

      }else{
        // wat
      }
      if( checked &&  $this.data('id') !== 'read' ){
        $tr.find('[data-id="read"]:not(:checked)').prop('checked', true).trigger('change');
      } else if( !checked &&  $this.data('id') === 'read' ){
        $tr.find('[data-id!="read"]:checked').prop('checked', false).trigger('change');
      }
    }

    for( var i = 0 ; i < self.changeListeners.length ; i++ ){
      self.changeListeners[i]( self.json.id, self.get(), self.isChanged() );
    }
  });

  this.$.html.find('table').on('click', '.remove', function(ev){
    var $this = $(this);
    $this.closest('tr').find('[data-id!="read"]:checked').prop('checked', false).trigger('change');
    return;
    // Should I hide it
    var $tbody = $this.closest('tbody');
    var vid = $this.closest('tbody').data('view-id');
    var id, num;
    if( $this.parent().is('.view-name') ){
    // if parent is .view-name
    //   is view. remove all changes and from data
      if( self.rolePChanges[vid] ){
        delete self.rolePChanges[vid];
      }
      if( self.userPChanges[vid] ){
        delete self.userPChanges[vid];
      }
      if( self.data[vid] ){
        delete self.data[vid];
      }
      $tbody.remove();
      // if empty hide table
    }else{
    // else
    //   is either role or user
    //   get id from tbody, remove self fromdata and changes
      if( $this.parent().is('.view-role') ){
        id = $this.parent().data('id');

        // update changes
        if( self.rolePChanges[vid] ){
          if( self.rolePChanges[vid][id] ){
            delete self.rolePChanges[vid][id];
            if(Object.keys(self.rolePChanges[vid]).length === 0)
              delete self.rolePChanges[vid];
          }
        }

        // update table data
        if( self.data[vid] ){
          if( self.data[vid].roles[id] ){
            delete self.data[vid].roles[id];
            if( Object.keys( self.data[vid].roles).length === 0
              && Object.keys( self.data[vid].users).length === 0 )
              delete self.data[vid];
          }
        }

        // decrement, create or ignore rowspan
        // get role count
        num = $tbody.find('.view-role').length;
        if( num > 1 ){ //at least one, self
          // check if is first
          if( $tbody.find('.view-role').first().has($this).length > 0 ){
            // add rowspan to next
            $tbody.find('.view-role').eq(1).parent().prepend(''
              +'<td rowspan="'+(num-1)+'" class="role">'
              +'  <span data-i18n="app.permissions.roles"> Roles </span>'
              +'</td>'
            );
          }else{
            // decrement stuff
            $tbody.find('.view-role').first().siblings('[rowspan]').attr('rowspan', num-1);
          }
        }
        // remove from dom
        $this.closest('tr').remove();

        // if empty
        //   remove tbody
        if( $tbody.children('tr').length < 2 )
          $tbody.remove();

      }else if( $this.parent().is('.view-user') ){
        id = $this.parent().data('id');

        // update changes
        if( self.userPChanges[vid] ){
          if( self.userPChanges[vid][id] ){
            delete self.userPChanges[vid][id];
            if(Object.keys(self.userPChanges[vid]).length === 0)
              delete self.userPChanges[vid];
          }
        }

        // update table data
        if( self.data[vid] ){
          if( self.data[vid].users[id] ){
            delete self.data[vid].users[id];
            if( Object.keys( self.data[vid].roles).length === 0
              && Object.keys( self.data[vid].users).length === 0 )
              delete self.data[vid];
          }
        }

        // decrement, create or ignore rowspan
        // get user count
        num = $tbody.find('.view-user').length;
        if( num > 1 ){ //at least one, self
          // check if is first
          if( $tbody.find('.view-user').first().has($this).length > 0 ){
            // add rowspan to next
            $tbody.find('.view-user').eq(1).parent().prepend(''
              +'<td rowspan="'+(num-1)+'" class="user">'
              +'  <span data-i18n="app.permissions.users"> Users </span>'
              +'</td>'
            );
          }else{
            // decrement stuff
            $tbody.find('.view-user').first().siblings('[rowspan]').attr('rowspan', num-1);
          }
        }
        // remove from dom
        $this.closest('tr').remove();

        // if empty
        //   remove tbody
        if( $tbody.children('tr').length < 2 )
          $tbody.remove();



      }else{
        // wat
      }
    }

    if( Object.keys(self.data).length === 0 ){
      self.$.table.closest('.form-group').addClass('hidden')
    }

    for( var i = 0 ; i < self.changeListeners.length ; i++ ){
      self.changeListeners[i]( self.json.id, self.get(), self.isChanged() );
    }
  });


}; 
Form.Fields.Permissions.prototype.initSelects = function(){
  var self = this;

  // generated while getting data for user select
  this.users = {};
  this.userP = {};
  this.userPChanges = {};
  this.$.users = this.$.html.find('[data-id="user-select"]')
  this.$.users.selectize({
    plugins: ['remove_button','restore_on_backspace'],
    maxItems: 20,
    valueField: 'UserId',
    searchField: ['FirstName', 'LastName'],
    render: {
      option:function(o){
        return '<div>'+o.FirstName + ' ' + o.LastName+'</div>';
      },
      item:function(o){
        return '<div>'+o.FirstName + ' ' + o.LastName+'</div>';
      }
    },
    preload: true,
    load: function(query, callback){
      Tools.Ajax.defaultPost( self.getUsersUrl, {
        length: 20,
        start: 0,
        fields: ['UserId', 'FirstName', 'LastName', 'Permission','ServerId'],
        query: query
      })
      .then(function( data ){
        data.data.forEach(function(v){
          self.users[v.UserId] = v;
          if( v.Permission ){
            v.Permission.forEach(function(p){
              self.userP[p.ApiObjectId] = self.userP[p.ApiObjectId] || {};
              self.userP[p.ApiObjectId][v.UserId] = p;
            });
          }

        });
        callback(data.data);
      })
      .catch(function( err ){
        console.error(err);
      })
    }
  });


  // generated while getting data for role select
  this.roles = {};
  this.roleP = {};
  this.rolePChanges = {};
  this.$.roles = this.$.html.find('[data-id="role-select"]');
  this.$.roles.selectize({
    plugins: ['remove_button','restore_on_backspace'],
    maxItems: 20,
    valueField: 'RoleId',
    searchField: ['Name'],
    labelField: 'Name',
    render: {
      option:function(o){
        return '<div>'+o.Name+'</div>';
      },
      item:function(o){
        return '<div>'+o.Name+'</div>';
      }
    },
    preload: true,
    load: function(query, callback){
      Tools.Ajax.defaultPost( self.getRolesUrl, {
        length: 20,
        start: 0,
        fields: ['RoleId', 'Name', 'Permission','ServerId'],
        query: query
      })
      .then(function( data ){
        data.data.forEach(function(v){
          self.roles[v.RoleId] = v;
          if( v.Permission ){
            v.Permission.forEach(function(p){
              self.roleP[p.ApiObjectId] = self.roleP[p.ApiObjectId] || {};
              self.roleP[p.ApiObjectId][v.RoleId] = p;
            });
          }
        });
        callback(data.data);
      })
      .catch(function( err ){
        console.error( err );
      })
    }
  });
}
Form.Fields.Permissions.prototype.i18n = function(){
  this.$.html.i18n();
  this.$.html.find('[data-toggle="tooltip"]').tooltip();
}
Form.Fields.Permissions.prototype.getData = function(){
  var d = {};
  d[this.json.id] = this.value;
  return d;
}
Form.Fields.Permissions.prototype.get = function(){
  var self = this;
  var list = [];

  self.rolePChanges.forEach(function(v, vid){
    v.forEach(function(r, rid){
      var nR = ({}).deepMerge(r);
      if( !nR.ApiPermissionId ){
        nR.ApiObjectId = vid|0;
        nR.ApiRoleId = rid|0;
      }
      list.push(nR);
    });
  });

  self.userPChanges.forEach(function(v, vid){
    v.forEach(function(u, uid){
      var nU = ({}).deepMerge(u);
      if( !nU.ApiPermissionId ){
        nU.ApiObjectId = vid|0;
        nU.ApiUserId = uid|0;
      }
      list.push(nU);
    });
  });

  return list;
}
Form.Fields.Permissions.prototype.setData = function( data ){
  var val = data[ this.json.id ];
  this.original = val;
  this.set( val );
}
Form.Fields.Permissions.prototype.save = function(){
  var self = this;
  if( this.isPosting )
    return ajaxStub();

  this.isPosting = true;

  return Tools.Ajax.defaultPost(this.postUrl, this.get())
  .then(function(){
    self.isPosting = false;
  })
  .catch(function(){
    self.isPosting = false;
  });
}
Form.Fields.Permissions.prototype.set = function( val ){

}
Form.Fields.Permissions.prototype.isChanged = function(){
  return !(Object.keys(this.rolePChanges).length === 0 && Object.keys(this.userPChanges).length === 0);
}
Form.Fields.Permissions.prototype.toggleAddPermissions = function(){
  if(this.showingAdd){
    this.closeAddPermissions();
  }else{
    this.openAddPermissions();
  }
}
Form.Fields.Permissions.prototype.openAddPermissions = function(){
  this.$.container.children('div.hidden').removeClass('hidden').addClass('showing');
  this.showingAdd = true;
}
Form.Fields.Permissions.prototype.closeAddPermissions = function(){
  this.$.container.children('div.showing').removeClass('showing').addClass('hidden');
  this.showingAdd = false;
}
Form.Fields.Permissions.prototype.reset = function(){
  var self = this;
  this.$.table.find('.view-tr .remove').each(function(){
    var $this = $(this);
    var $tbody = $this.closest('tbody');
    var vid = $this.closest('tbody').data('view-id');
    var id, num;
    if( $this.parent().is('.view-name') ){
    // if parent is .view-name
    //   is view. remove all changes and from data
      if( self.rolePChanges[vid] ){
        delete self.rolePChanges[vid];
      }
      if( self.userPChanges[vid] ){
        delete self.userPChanges[vid];
      }
      if( self.data[vid] ){
        delete self.data[vid];
      }
      $tbody.remove();
      // if empty hide table
    }else{
    // else
    //   is either role or user
    //   get id from tbody, remove self fromdata and changes
      if( $this.parent().is('.view-role') ){
        id = $this.parent().data('id');

        // update changes
        if( self.rolePChanges[vid] ){
          if( self.rolePChanges[vid][id] ){
            delete self.rolePChanges[vid][id];
            if(Object.keys(self.rolePChanges[vid]).length === 0)
              delete self.rolePChanges[vid];
          }
        }

        // update table data
        if( self.data[vid] ){
          if( self.data[vid].roles[id] ){
            delete self.data[vid].roles[id];
            if( Object.keys( self.data[vid].roles).length === 0
              && Object.keys( self.data[vid].users).length === 0 )
              delete self.data[vid];
          }
        }

        // decrement, create or ignore rowspan
        // get role count
        num = $tbody.find('.view-role').length;
        if( num > 1 ){ //at least one, self
          // check if is first
          if( $tbody.find('.view-role').first().has($this).length > 0 ){
            // add rowspan to next
            $tbody.find('.view-role').eq(1).parent().prepend(''
              +'<td rowspan="'+(num-1)+'" class="role">'
              +'  <span data-i18n="app.permissions.roles"> Roles </span>'
              +'</td>'
            );
          }else{
            // decrement stuff
            $tbody.find('.view-role').first().siblings('[rowspan]').attr('rowspan', num-1);
          }
        }
        // remove from dom
        $this.closest('tr').remove();

        // if empty
        //   remove tbody
        if( $tbody.children('tr').length < 2 )
          $tbody.remove();

      }else if( $this.parent().is('.view-user') ){
        id = $this.parent().data('id');

        // update changes
        if( self.userPChanges[vid] ){
          if( self.userPChanges[vid][id] ){
            delete self.userPChanges[vid][id];
            if(Object.keys(self.userPChanges[vid]).length === 0)
              delete self.userPChanges[vid];
          }
        }

        // update table data
        if( self.data[vid] ){
          if( self.data[vid].users[id] ){
            delete self.data[vid].users[id];
            if( Object.keys( self.data[vid].roles).length === 0
              && Object.keys( self.data[vid].users).length === 0 )
              delete self.data[vid];
          }
        }

        // decrement, create or ignore rowspan
        // get user count
        num = $tbody.find('.view-user').length;
        if( num > 1 ){ //at least one, self
          // check if is first
          if( $tbody.find('.view-user').first().has($this).length > 0 ){
            // add rowspan to next
            $tbody.find('.view-user').eq(1).parent().prepend(''
              +'<td rowspan="'+(num-1)+'" class="user">'
              +'  <span data-i18n="app.permissions.users"> Users </span>'
              +'</td>'
            );
          }else{
            // decrement stuff
            $tbody.find('.view-user').first().siblings('[rowspan]').attr('rowspan', num-1);
          }
        }
        // remove from dom
        $this.closest('tr').remove();

        // if empty
        //   remove tbody
        if( $tbody.children('tr').length < 2 )
          $tbody.remove();



      }else{
        // wat
      }

      if( Object.keys(self.data).length === 0 ){
        self.$.table.closest('.form-group').addClass('hidden')
      }

      for( var i = 0 ; i < self.changeListeners.length ; i++ ){
        self.changeListeners[i]( self.json.id, self.get(), self.isChanged() );
      }
    }
  });//.trigger('click');

  this.$.roles[0].selectize.destroy();
  this.$.users[0].selectize.destroy();

  this.initSelects();
  this.initTable();
}
Form.Fields.Permissions.prototype.clear = function(){
  this.value = null;
  this.original = null;

  this.$input.val('');
}
Form.Fields.Permissions.prototype.applyFieldBinds = function(){
}
Form.Fields.Permissions.prototype.validate = function(){
  // stub
}
Form.Fields.Permissions.prototype.saveData = function(){
  this.original = this.get();
  for( var i = 0 ; i < this.changeListeners.length ; i++ ){
    this.changeListeners[i]( this.json.id, this.get(), this.isChanged() );
  }
}
Form.Fields.Permissions.prototype.refresh = function(){
   
}
Form.Fields.Permissions.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = []; 
 
  this.changeListeners.push( callback );
}
Form.Fields.Permissions.prototype._ = scopeInterface;
Form.Fields.Permissions.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('Permissions').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};

Form.Fields.Recurrence = function Recurrence(scope, container, json ){
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._('^form').get(0);

  this.value = null;
  this.original = null;

  this.changeListeners = [];

  this.init();
}
Form.Fields.Recurrence.prototype.init = function(){
  var html = Form.Template( this.json, {data: {
    input: true
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);

  this.$.translates = this.$.html.find('[data-i18n]');

  // find all selects
  this.$.selects = this.$.html.find('select');
  this.$.selects.selectize();

  // find date input
  this.$.dateinput = this.$.html.find('[data-type="datepicker"]');

  // find all injectable elements
  this.$.injs = this.$.html.find('[data-i18ninj]');

  // init data
  this.default = {
    "Recorrente" : false,

    "TipoAgendamento" : null, // Hora/Dia/Semana/M??s/Ano

    "RecorrenteQtd" : null,        // int
    "DiaMes" : null,               // int
    "Mes" : null,                  // int. 1~12
    "Posicao" : null,     // Primeiro/Segundo/Terceiro/Quarto/Ultimo

    "Segunda" : null,           // bool
    "Terca" : null,            // bool
    "Quarta" : null,           // bool
    "Quinta" : null,           // bool
    "Sexta" : null,            // bool
    "Sabado" : null,           // bool
    "Domingo" : null,          // bool
    "Dia" : null,              // bool
    "Dia_Semana" : null,       // bool
    "Dia_Fim_Semana" : null,   // bool
    "EndQtd" : null,
    "EndDate" : null
  };

  var $hf = this.$.html;
  this.$.inputs = {
    recurrence: $hf.find('.recurrence-toggle > input'),
    type: $hf.find('.recurrence-type input'),
    hour: {
      radio: $hf.find('.recurrence-form[data-id="form-hour"] input.type-opt'),
      values: [
        { rec:$hf.find('.recurrence-form[data-id="form-hour"] input[name="hours"]')
        }
      ]
    },
    day: {
      radio: $hf.find('.recurrence-form[data-id="form-day"] input.type-opt'),
      values: [
        { rec: $hf.find('.recurrence-form[data-id="form-day"] input[name="days"]')
        },
        {}
      ]
    },
    week: {
      radio: $hf.find('.recurrence-form[data-id="form-week"] input.type-opt'),
      values: [
        { rec: $hf.find('.recurrence-form[data-id="form-week"] input[name="weeks"]'),
          weekdays: $hf.find('.recurrence-form[data-id="form-week"] .weekdays input')
        }
      ]},
    month: {
      radio: $hf.find('.recurrence-form[data-id="form-month"] input.type-opt'),
      values: [
        { rec: $hf.find('.recurrence-form[data-id="form-month"] .op1 input[name="months"]'),
          day: $hf.find('.recurrence-form[data-id="form-month"] .op1 input[name="day"]')
        },
        { rec: $hf.find('.recurrence-form[data-id="form-month"] .op2 input[name="months"]'),
          ord: $hf.find('.recurrence-form[data-id="form-month"] .op2 select'),
          weekdays: $hf.find('.recurrence-form[data-id="form-month"] .op2 .weekdays input')
        }
      ]
    },
    year: {
      radio: $hf.find('.recurrence-form[data-id="form-year"] input.type-opt'),
      values: [
        { day: $hf.find('.recurrence-form[data-id="form-year"] .op1 input[name="day"]'),
          month: $hf.find('.recurrence-form[data-id="form-year"] .op1 select')
        },
        { ord: $hf.find('.recurrence-form[data-id="form-year"] .op2 select.ord'),
          weekdays: $hf.find('.recurrence-form[data-id="form-year"] .op2 .weekdays input'),
          month: $hf.find('.recurrence-form[data-id="form-year"] .op2 select.month')
        }
      ]
    },
    until: {
      radio: $hf.find('.recurrence-repeat input[type="radio"]'),
      values: [
        {},
        { times: $hf.find('.recurrence-repeat input.times') },
        { until: $hf.find('.recurrence-repeat input.until') }
      ]
    }
  };

  this.bind();
  this.i18n();
  this.setData(this.default);
}
Form.Fields.Recurrence.prototype.bind = function(){
  var self = this;

  // handle multi-line radios
  this.$.html.find('.month-day-radio1 .btn').on('click', function(){
    self.$.html.find('.month-day-radio2 .active').removeClass('active');
  });
  this.$.html.find(".month-day-radio2 .btn").on('click', function(){
    self.$.html.find('.month-day-radio1 .active').removeClass('active');
  });

  // handle multi-line radios
  this.$.html.find('.year-day-radio1 .btn').on('click', function(){
    self.$.html.find('.year-day-radio2 .active').removeClass('active');
  });
  this.$.html.find(".year-day-radio2 .btn").on('click', function(){
    self.$.html.find('.year-day-radio1 .active').removeClass('active');
  });

  // handle subtype decoration
  this.$.html.find('input[type="radio"].type-opt').on('change',function(){
    if(this.checked){
      $(this).parent().filter('label').addClass('well').siblings().removeClass('well');
    }
  });

  // handle recurrence type
  this.$.html.find('.recurrence-type input').on('change', function(){
    self.$.html.find('[data-id="form-'+this.value+'"]').show().siblings().hide();
  });

  // handle input visibility
  this.$.html.find('.recurrence-toggle > input').on('change',function(){
    if(this.checked){
      $(this).closest('.form-control.contain').addClass('active')
      self.$.html.find('[data-id="recurrence-form"]').fadeIn();
      self.$.html.find('.recurrence-repeat').fadeIn();
    }else{
      $(this).closest('.form-control.contain').removeClass('active')
      self.$.html.find('[data-id="recurrence-form"]').fadeOut();
      self.$.html.find('.recurrence-repeat').fadeOut();
    }
  });


  this.$.html.find('input').on('input change', function(){
    for( var i = 0 ; i < self.changeListeners.length ; i++ ){
      self.changeListeners[i]( self.json.id, self.get(), self.isChanged() );
    }
  });

  this.bindSelects();
}
Form.Fields.Recurrence.prototype.bindSelects = function(){
  this.$.html.find('.selectize-input').on('click mousedown', function(ev){
    ev.preventDefault();
  });
}
Form.Fields.Recurrence.prototype.i18n = function(){
  // destroy selects
  this.$.selects.each(function(){
    if(this.selectize){
      var v = this.selectize.getValue();
      this.selectize.destroy();
      $(this).val(v);
    }
  });

  // direct translations
  this.$.translates.i18n();

  // Inject translations
  this.$.injs.each(function(){
    i18nInject( $(this) );
  });

  // i18n datepickers
  if(this.$.dateinput.data('daterangepicker'))
    var oldDate = moment(this.$.dateinput.data('daterangepicker').startDate);

  var format = JSON.simpleCopy(i18n.t('plugins.daterangepicker.locale',
    {returnObjectTrees: true}));
  format.format = i18n.t('app.formats.date');

  this.$.dateinput.daterangepicker({
    autoUpdateInput: true,
    showWeekNumbers: true,
    singleDatePicker: true,
    showDropdowns: true
//    locale: format
  });

  if(oldDate)
    this.$.dateinput.data('daterangepicker').setStartDate(oldDate);


  // remake selects
  this.$.selects.selectize();
  // and bind them again
  this.bindSelects();
}
Form.Fields.Recurrence.prototype.getData = function(  ){
  return this.get();
}
Form.Fields.Recurrence.prototype.get = function(){
  var O = JSON.simpleCopy( this.default );
  var $i = this.$.inputs;

  if( !$i.recurrence.is(':checked') )
    return O;

  var wdays = {
    "day": "Dia",
    "wday": "Dia_Semana",
    "weday": "Dia_Fim_Semana",
    "mon": "Segunda",
    "tue": "Terca",
    "wed": "Quarta",
    "thu": "Quinta",
    "fri": "Sexta",
    "sat": "Sabado",
    "sun": "Domingo"
  };

  var ord = {
    "1": "Primeiro",
    "2": "Segundo",
    "3": "Terceiro",
    "4": "Quarto",
    "5": "Ultimo"
  };

  O.Recorrente = true;


  switch( $i.type.filter(':checked').val() ){
    case 'hour':
      O.TipoAgendamento = "Hora";
      O.RecorrenteQtd = $i.hour.values[0].rec.val()|0;
      break;
    case 'day':
      O.TipoAgendamento = "Dia";
      if($i.day.radio.filter(':checked').val() === '1'){
        O.RecorrenteQtd = $i.day.values[0].rec.val()|0;
      }else{
        O.RecorrenteQtd = 1;
      }
      break;
    case 'week':
      O.TipoAgendamento = "Semana";
      O.RecorrenteQtd = $i.week.values[0].rec.val()|0;
      $i.week.values[0].weekdays.each(function(x){
        O[wdays[this.value]] = false;
      }).filter(':checked').each(function(){
        O[wdays[this.value]] = true;
      });

      break;
    case 'month':
      O.TipoAgendamento = "M??s";
      if($i.month.radio.filter(':checked').val() === '1'){
        O.DiaMes = $i.month.values[0].day.val()|0;
        O.RecorrenteQtd = $i.month.values[0].rec.val()|0;
      }else{
        O.RecorrenteQtd = $i.month.values[1].rec.val()|0;
        O.Posicao = ord[$i.month.values[1].ord.val()];
        $i.month.values[1].weekdays.each(function(x){
          O[wdays[this.value]] = false;
        }).filter(':checked').each(function(){
          O[wdays[this.value]] = true;
        });
      }
      break;
    case 'year':
      O.TipoAgendamento = "Ano";
      if($i.year.radio.filter(':checked').val() === '1'){
        O.DiaMes = $i.year.values[0].day.val()|0;
        O.Mes = $i.year.values[0].month.val()|0;
      }else{
        O.Mes = $i.year.values[1].month.val()|0;
        O.Posicao = ord[$i.year.values[1].ord.val()];
        $i.year.values[1].weekdays.each(function(x){
          O[wdays[this.value]] = false;
        }).filter(':checked').each(function(){
          O[wdays[this.value]] = true;
        });
      }
      break;
  }
  switch( $i.until.radio.filter(':checked').val() ){
    case '2':
      O.EndQtd = $i.until.values[1].times.val()|0;
      break;
    case '3':
      if($i.until.values[2].until.data('daterangepicker'))
        O.EndDate = moment( $i.until.values[2].until.data('daterangepicker').startDate).toISOString();
      break;
  }

  return O;
}
Form.Fields.Recurrence.prototype.setData = function( data ){
  var dK = Object.keys(this.default);
  var newData = {};
  for( var i = 0 ; i < dK.length ; i++ ){
    var dk = dK[i];
    if( data[dk] !== null ){
      newData[dk] = data[dk];
    }else{
      newData[dk] = this.default[dk];
    }
  }
  this.original = newData;
  this.set( this.original );
}
Form.Fields.Recurrence.prototype.set = function( val ){
  var $i = this.$.inputs;

  $i.recurrence.prop('checked', val.Recorrente);
  if(!val.Recorrente){
    this.$.html.find('input[type="checkbox"]').trigger('change');
  }

  var wdays = {
    "Dia":"day",
    "Dia_Semana":"wday",
    "Dia_Fim_Semana":"weday",
    "Segunda":"mon",
    "Terca":"tue",
    "Quarta":"wed",
    "Quinta":"thu",
    "Sexta":"fri",
    "Sabado":"sat",
    "Domingo":"sun"
  };

  var ord = {
    "Primeiro":"1",
    "Segundo":"2",
    "Terceiro":"3",
    "Quarto":"4",
    "Ultimo":"5"
  };



  this.$.html.find("select").each(function(){
    if(this.selectize){
      this.selectize.setValue('1');
    }else{
      $(this).val('1');
    }
  }).trigger('change');
  $i.type.prop('checked', false).closest('label').removeClass('active');

  if(val.TipoAgendamento === null || typeof val.TipoAgendamento === 'undefined' )
    $i.type.filter('[value="hour"]').prop('checked', true).closest('label').addClass('active');

  switch( val.TipoAgendamento ){
    case 'Hora':
      $i.type.filter('[value="hour"]').prop('checked', true).closest('label').addClass('active');
      $i.hour.values[0].rec.val(val.RecorrenteQtd);
      break;
    case 'Dia':
      $i.type.filter('[value="day"]').prop('checked', true).closest('label').addClass('active');

      $i.day.radio.prop('checked', false);
      if( val.RecorrenteQtd !== 1 ){
        $i.day.radio.filter('[value="1"]').prop('checked', true);
        $i.day.values[0].rec.val(val.RecorrenteQtd);
      }else{
        $i.day.radio.filter('[value="2"]').prop('checked', true);
      }

      break;
    case 'Semana':
      $i.type.filter('[value="week"]').prop('checked', true).closest('label').addClass('active');
      $i.week.values[0].rec.val(val.RecorrenteQtd);

      Object.keys(wdays).forEach(function(k){
        var c = $i.week.values[0].weekdays.filter('[value="'+wdays[k]+'"]')
        c.prop('checked', !!val[k]);
        if(!!val[k]){
          c.closest('label').addClass('active');
        }else{
          c.closest('label').removeClass('active');
        }
      });

      break;
    case 'M??s':
      $i.type.filter('[value="month"]').prop('checked', true).closest('label').addClass('active');

      $i.month.radio.prop('checked', false);
      if( val.DiaMes ){
        $i.month.radio.filter('[value="1"]').prop('checked', true);
        $i.month.values[0].rec.val(val.RecorrenteQtd);
        $i.month.values[0].day.val(val.DiaMes+'');
      }else{
        $i.month.radio.filter('[value="2"]').prop('checked', true);
        $i.month.values[1].rec.val(val.RecorrenteQtd);
        $i.month.values[1].ord[0].selectize.setValue(ord[val.Posicao]);

        Object.keys(wdays).forEach(function(k){
          var c = $i.month.values[1].weekdays.filter('[value="'+wdays[k]+'"]')
          c.prop('checked', !!val[k]);
          if(!!val[k]){
            c.closest('label').addClass('active');
          }else{
            c.closest('label').removeClass('active');
          }
        });
      }
      break;
    case 'Ano':
      $i.type.filter('[value="year"]').prop('checked', true).closest('label').addClass('active');

      $i.year.radio.prop('checked', false);
      if( val.DiaMes ){
        $i.year.radio.filter('[value="1"]').prop('checked', true);
        $i.year.values[0].month[0].selectize.setValue(val.Mes);
        $i.year.values[0].day.val(val.DiaMes);
      }else{
        $i.year.radio.filter('[value="2"]').prop('checked', true);
        $i.year.values[1].month[0].selectize.setValue(val.Mes);
        $i.year.values[1].ord[0].selectize.setValue(ord[val.Posicao]);

        Object.keys(wdays).forEach(function(k){
          var c = $i.year.values[1].weekdays.filter('[value="'+wdays[k]+'"]')
          c.prop('checked', !!val[k]);
          if(!!val[k]){
            c.closest('label').addClass('active');
          }else{
            c.closest('label').removeClass('active');
          }
        });
      }
      break;
  }

  $i.until.radio.prop('checked', false);
  if( val.EndQtd ){
    $i.until.radio.filter('[value="2"]').prop('checked', true);
    $i.until.values[1].times.val(val.EndQtd);
  }else if( val.EndDate ){
    $i.until.radio.filter('[value="3"]').prop('checked', true);
    $i.until.values[2].until.data('daterangepicker').setStartDate( moment( val.EndDate ) );
  }else{
    $i.until.radio.filter('[value="1"]').prop('checked', true);
  }

  this.$.html.find('input[type="checkbox"]').trigger('change');
  this.$.html.find('input[type="radio"]:checked').trigger('change');
}
Form.Fields.Recurrence.prototype.isChanged = function(){
  var n = this.get();
  var nK = Object.keys(n);

  for( var i = 0 ; i < nK.length ; i++ ){
    if(n[nK[i]] !== this.original[nK[i]])
      return true;
  }
  return false;
}
Form.Fields.Recurrence.prototype.reset = function(){
  this.set( this.original );
}
Form.Fields.Recurrence.prototype.clear = function(){
  // nop
}
Form.Fields.Recurrence.prototype.applyFieldBinds = function(){
  // nop
}
Form.Fields.Recurrence.prototype.validate = function(){
  // nop
}
Form.Fields.Recurrence.prototype.saveData = function(){
  this.original = this.get();
  for( var i = 0 ; i < this.changeListeners.length ; i++ ){
    this.changeListeners[i]( this.json.id, this.get(), this.isChanged() );
  }
}
Form.Fields.Recurrence.prototype.refresh = function(){
  // nop
}
Form.Fields.Recurrence.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];

  this.changeListeners.push( callback );
}
Form.Fields.Recurrence.prototype._ = scopeInterface;
Form.Fields.Recurrence.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('Recurrence').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};

/**
 * Select
 */

Form.Fields.Select = function Select(scope, container, json) {
	this.scope = scope;
	this.container = container;
	this.json = json;

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;
	this.form = this._("^form").get(0);

	this.changeActions = this.form ? this.form.actions : {};

	this.value = null;
	this.original = null;

	if (this.json.searchUrl) {
		this.searchUrl =
			this.form && this.form.view.getUrl(this.json.searchUrl)
				? this.form.view.getUrl(this.json.searchUrl)
				: this.json.searchUrl;
		this.searchUrl = this.searchUrl.fillWith({
			form_id: this.form ? this.form.opts.id : null,
			tab: this.form ? this.form.host && this.form.host.info.name : null,
			context: this.form ? this.form.opts.context : null,
			view: this.form ? this.form.opts.view : null,
		});
	}

	this.changeListeners = [];
	this._state = {
		readonly: {},
		hidden: {},
	};

	this.initListeners = [];
	this.isInit = false;
	this.isReady = true;
	this.old = [];

	this.init();
};
Form.Fields.Select.prototype.init = function () {
	var html = Form.Template(this.json, {
		data: {
			input: true,
		},
	});

	this.isReadOnly = !!this.json.readOnly;

	this.$.html = $(html);
	if (this.json.visibility === "hidden")
		this.$.container.parent().addClass("hidden");

	this.$.container.append(this.$.html);
	this.initSelect();
	this.i18n();
	this.bind();
};
Form.Fields.Select.prototype.initSelect = function () {
	var self = this;
	var rT, sT;
	if (self.json.resultsTemplate) {
		rT = Handlebars.compile(self.json.resultsTemplate);
	}
	if (self.json.selectedTemplate) {
		sT = Handlebars.compile(self.json.selectedTemplate);
	}

	var opts = {
		plugins: ["remove_button"],
		valueField: this.json.valueField || "value",
		searchField: this.json.searchFields || ["text"],
		labelField: this.json.labelField || ["text"],
		maxItems: (this.json.maxItems || 1) | 0,
		maxOptions: (this.json.maxResults || 1000) | 0,
		closeAfterSelect:
			this.json.maxItems && this.json.maxItems > 1 ? false : true,
		dropdownParent: "body",
		preload: this.json.options || this.json.preload ? true : "focus",
		openOnFocus: true,
		/* onDropdownClose: function(dropdown) {
      self.$.html.find('input').blur();
    },*/
		render: {
			option: function (item) {
				if (rT) {
					return rT(item);
				}
				return (
					"<div>" +
					(item["i18n"] ? i18n.t(item["i18n"]) : item["text"]) +
					"</div>"
				);
			},
			item: function (item) {
				if (sT) {
					return sT(item);
				}
				return (
					"<div>" +
					(item["i18n"] ? i18n.t(item["i18n"]) : item["text"]) +
					"</div>"
				);
			},
		},
		onInitialize: function () {
			if (!(self.json.options || self.json.preload)) self.inited();
		},
	};
	self.opts = opts;

	if (self.json.allowNewOption) {
		opts.create = true;
		if (self.json.newOptionPrompt) {
			opts.render.option_create = function (data, escape) {
				return `<div class="create">${escape(
					self.json.newOptionPrompt
				)} <b>${escape(data.input)}</b></div>`;
			};
			// check
		}
		// check
	}

	if (!self.json.allowNull) {
		opts.onBlur = function () {
			if (this.getValue() == "" || this.getValue() === null) {
				if (self.original) {
					//self.reset();
					this.setValue(self.original);
				} else {
					if (this.items[0]) this.setValue(this.items[0].id);
				}
			}
		};
	} else {
		opts.allowEmptyOption = true;
	}

	function filterData(q, data) {
		if (q === "") return data;

		return data.filter(function (d) {
			return q.split(" ").every(function (qq) {
				return self.opts.searchField.some(function (s) {
					return (d[s] || "").indexOf(qq) !== -1;
				});
			});
		});
	}

	opts.load = function (query, callback) {
		(self.form ? self.form : self.scope).initPromise.then(function () {
			if (self.json.options) {
				// options set in json. Is static
				var results = filterData(
					query.toLowerCase(),
					self.json.options.map(function (o) {
						if (o["text-i18n"]) {
							o.text = i18n.t(o["text-i18n"]);
						}
						return o;
					})
				);
				callback(results);
				self.inited();
				return;
			}

			var opts = {
				start: 0,
				length: self.json.maxResults || 100,
				searchFields: self.json.searchFields,
				fields: self.json.fields,
			};
			if (!!query && query !== "") {
				var q = query.toLowerCase();
				opts.query = q;
			} else {
				opts.query = "";
			}

			if (self.json.extraFields) {
				if (!opts.search) opts.search = [];

				self.json.extraFields.forEach(function (ef) {
					var v = self.form.getField(ef);

					if (v) {
						opts.search.push({
							field: ef,
							constraint: self.json.extraFieldsConstraint || "equals",
							value: v,
						});
						opts.search.push({
							level: 0,
							logicalOperator: "AND",
						});
					}
				});
				opts.search.pop();
			}

			if (self.json.preload) {
				opts = {
					start: -1,
					length: -1,
					query: "",
					fields: self.json.fields,
					searchFields: [],
				};
				if (self.json.extraFields) {
					if (!opts.search) opts.search = [];

					self.json.extraFields.forEach(function (ef) {
						var v = self.form.getField(ef);

						if (v) {
							opts.search.push({
								field: ef,
								constraint: "equals",
								value: v,
							});
							opts.search.push({
								level: 0,
								logicalOperator: "AND",
							});
						}
					});
					opts.search.pop();
				}
			}

			if (self.json.preload && self.preloadedData) {
				callback(filterData(query.toLowerCase(), self.preloadedData));
				return;
			} else {
				var load = function (cb) {
					self.$.container.addClass("loading");

					Tools.Ajax.defaultPost(self.searchUrl, opts)
						.then(function (data) {
							if (self.json.computedFields) {
								Object.keys(self.json.computedFields).forEach(function (k) {
									data.data.forEach(function (d) {
										d[k] = renderCached(self.json.computedFields[k], d, {
											helpers: self.form.view.Actions.helpers || {},
										});
									});
								});
							}
							self.$.container.removeClass("loading");

							if (self.json.preload) {
								if (self.preloadedData) {
									self.preloadedData = data.data;
									callback(data.data);
									cb && cb();
								} else {
									self.preloadedData = data.data;
									callback(data.data);
									cb && cb();
									self.inited();
								}
							} else {
								callback(data.data);
								cb && cb();
							}
						})
						.catch(function (err) {
							self.$.container.removeClass("loading");

							console.error(
								"Select: Error loading searches at " + self.id,
								err
							);
						});
				};
				if (self.json.preload) {
					self.reload = load;
					self.$.html.find(".reload-btn").on("click", function () {
						var v = self.get();
						self.sel.clear();
						self.sel.clearOptions();
						self.sel.loadedSearches = {};

						load(function () {
							self.set(v);
						});
					});
				}
				load();
			}
		});
	};
	//}

	this.sel = this.$.container.find("select").selectize(opts)[0].selectize;
	if (this.json.disabled || this.json.readOnly) {
		this.readonly(true);
	}
};
Form.Fields.Select.prototype.bind = function () {
	var self = this;

	this.updatePermissions = (p) => this.checkPermissions(p);
	main.permissions.bind(this.updatePermissions);

	this.sel.on("change", function (ev) {
		self.validate();

		self.old.push(self.get());

		if (self.json.onChange) {
			if (self.changeActions[self.json.onChange]) {
				self.changeActions[self.json.onChange](
					self.get(),
					self.form,
					function () {
						self.old.pop();
						self.set(self.old.pop(), true);
					},
					self
				);
			}
		}

		self.doChanges();
	});

	if (self.json.extraFields) {
		setTimeout(() => {
			self.json.extraFields.forEach(function (f) {
				var field = self.form._(">" + f)[0];
				if (field && field.onChange) {
					var setup = function () {
						var oldVal = field.get();
						field.onChange(function (id, newVal, changed, f) {
							var val;
							if (self.json.loadObject && !self.json.saveObejct) {
								val = self.getObject();
							} else {
								val = self.get();
							}
							if (newVal === oldVal) {
								return;
							}
							oldVal = newVal;

							self.sel.clear();
							self.sel.clearOptions();
							self.sel.loadedSearches = {};
							if (val === null && self.trySet) {
								self.set(self.trySet);
								self.trySet = null;
							} else {
								self.set(val);
							}
						});
					};
					if (field.onInit) {
						field.onInit(function () {
							if (field.settingPromise) {
								field.settingPromise.then(setup);
							} else {
								setup();
							}
						});
					} else {
						if (field.settingPromise) {
							field.settingPromise.then(setup);
						} else {
							setup();
						}
					}
				}
			});
		}, 0);
	}
};
Form.Fields.Select.prototype.i18n = function () {
	this.$.html.i18n();
};
Form.Fields.Select.prototype.remove = function () {
	main.permissions.offChange(this.updatePermissions);
};
Form.Fields.Select.prototype.checkPermissions = function (userPermissions) {
	if (!this.json.permissions) {
		return;
	}

	Object.keys(this.json.permissions).forEach((k) => {
		const permission = k;
		const state = this.json.permissions[k];
		const hasPermission = userPermissions.indexOf(permission) > -1;

		if (state === "readonly") {
			this.readonly(!hasPermission, permission);
		}
	});
};
Form.Fields.Select.prototype.readonly = function (set, namespace) {
	if (typeof namespace === "undefined" && typeof set === "undefined") {
		return Object.keys(this._state.readonly).reduce(
			(acc, k) => acc || this._state.readonly[k],
			false
		);
	}
	if (typeof set === "undefined") {
		return this._state.readonly[namespace];
	}

	namespace = namespace == null ? "anon" : namespace;

	this._state.readonly[namespace] = set;

	this.isReadOnly = Object.keys(this._state.readonly).reduce(
		(acc, k) => acc || this._state.readonly[k],
		false
	);

	if (this.isReadOnly) {
		this.sel.disable();
	} else {
		this.sel.enable();
	}
};
Form.Fields.Select.prototype.inited = function () {
	if (this.isInit === false) {
		this.isInit = true;

		for (var i = 0; i < this.initListeners.length; i++) {
			this.initListeners[i]();
		}
		this.initListeners = [];
	}
};
Form.Fields.Select.prototype.removeOption = function (val) {
	var self = this;
	this.onInit(function () {
		if (self.sel.options[val]) {
			self.json.options = self.json.options.filter(function (o) {
				return o.value !== val;
			});
			self.sel.clear();
			self.sel.removeOption(val);
		}
	});
};
Form.Fields.Select.prototype.getData = function () {
	var d = {};
	d[this.json.id] = this.get();
	return d;
};
Form.Fields.Select.prototype.getObject = function () {
	var v = this.get();
	return Array.isArray(v)
		? v.map((x) => this.sel.options[x])
		: this.sel.options[v];
};
Form.Fields.Select.prototype.get = function () {
	var val = this.$.container.find("select").val();
	if (val === "") val = null;

	if (this.preSetVal !== undefined) {
		return this.preSetVal;
	}

	if (this.json.saveObject) {
		if (this.json.maxItems && this.json.maxItems > 1) {
			if (val === null) {
				return [];
			}
			return val.map((x) => this.sel.options[x]);
		} else {
			if (val === null) {
				return null;
			}
			return this.sel.options[val];
		}
		/*this.sel.options.find(function(o){
      debugger;
      return o.value !== val;
    });*/
	}

	if (this.json.maxItems && this.json.maxItems > 1) {
		if (val === null) {
			return [];
		} else {
			if (
				val.every(function (v) {
					return !isNaN(v) && "" + +v == "" + v;
				})
			) {
				return val.map(function (v) {
					return +v;
				});
			} else {
				return val.map(function (v) {
					return v;
				});
			}
		}
	}

	if (this.json.hasOwnProperty("defaultEmptyValue") && val === null) {
		return this.json.defaultEmptyValue;
	}

	return val;
};
Form.Fields.Select.prototype.setData = function (data) {
	var self = this;
	var val = data[this.json.id];

	if (val === null || val === undefined /*|| val === 0*/) {
		this.original = null;
		if (this.isReady) this.sel.setValue(val);
	} else if (
		Array.isArray(val) &&
		this.json.maxItems &&
		this.json.maxItems > 1
	) {
		if (this.json.loadObject /* && !this.json.saveObject */) {
			this.original = val.map(function (v) {
				return v;
			});
		} else {
			this.original = val.map(function (v) {
				return v[self.json.valueField];
			});
		}
		this.onInit(function () {
			self.isReady = false;
			self.set(val);
		});
		return;
	} else if (Array.isArray(val)) {
		this.original = val;
	} else if (
		typeof val === "object" &&
		(this.json.saveObject || this.json.loadObject)
	) {
		this.original = val;
	} else {
		this.original = val + "";
	}
	data[this.json.id] = val;
	if (this.original === "" || this.original === null) return;

	this.onInit(function () {
		self.isReady = false;
		self.reset();
	});
};
Form.Fields.Select.prototype.set = function (val) {
	var self = this;

	if (val === undefined) return;

	if (Array.isArray(val) && this.json.loadObject) {
		val.forEach(function (v) {
			if (self.json.computedFields) {
				Object.keys(self.json.computedFields).forEach(function (k) {
					v[k] = renderCached(self.json.computedFields[k], v, {
						helpers: self.form.view.Actions.helpers || {},
					});
				});
			}
			self.sel.addOption(v);
		});

		self.sel.setValue(
			val.map(function (v) {
				return v[self.json.valueField];
			})
		);
		self.old.push(self.get());
		self.isReady = true;

		self.doChanges();

		self.validate();
	} else if (
		Array.isArray(val) &&
		(val.length === 0 ||
			val.reduce((acc, v) => acc && this.sel.options[v], true))
	) {
		// value already exists. Select it.
		this.sel.setValue(val);
		this.old.push(this.get());
		this.isReady = true;
		this.doChanges();
	} else if (this.json.loadObject && val !== null) {
		self.sel.addOption(val);

		self.sel.setValue(val[self.json.valueField]);
		self.old.push(self.get());
		self.isReady = true;

		self.doChanges();

		self.validate();
	} else if (this.sel.options[val] || val === null) {
		// value already exists. Select it.
		this.sel.setValue(val);
		this.old.push(this.get());
		this.isReady = true;
		this.doChanges();
	} else if (this.json.allowNewOption) {
		// value doesn't exist but creation of new options is allowed.
		var n = {};
		n[this.json.valueField] = val;
		n[this.json.labelField] = val;
		this.sel.addOption(n);
		this.sel.setValue(val);
		this.old.push(this.get());
		this.isReady = true;
		this.doChanges();
	} else if (val && this.searchUrl) {
		// otherwise, if we have a getUrl, we try to get our info from the server
		self.trySet = val;
		var opts = {
			start: 0,
			length: 10,
			fields: self.json.fields,
			logicalOperator: "AND",
			search: [
				{
					field: self.json.valueField,
					constraint: "equals",
					type: "string",
					value: val,
					value1: null,
				},
			],
		};

		if (self.json.extraFields) {
			if (!opts.search) {
				opts.search = [];
			} else {
				opts.search.push({
					level: 0,
					logicalOperator: "AND",
				});
			}

			self.json.extraFields.forEach(function (ef) {
				var v = self.form.getField(ef);

				if (v) {
					opts.search.push({
						field: ef,
						constraint: self.json.extraFieldsConstraint || "equals",
						value: v,
					});
					opts.search.push({
						level: 0,
						logicalOperator: "AND",
					});
				}
			});
			opts.search.pop();
		}

		self.settingPromise = new Promise(function (res, rej) {
			Tools.Ajax.defaultPost(self.searchUrl, opts)
				.then(function (data) {
					data = data.data;
					if (data.length !== 1) {
						console.error(
							"Select: Error loading searches at " + self.json.id,
							"No data."
						);
						return;
					}
					data = data[0];
					self.sel.addOption(data);
					self.sel.setValue(val);
					self.old.push(self.get());
					self.isReady = true;

					self.doChanges();

					self.validate();
					self.settingPromise = null;
					res();
				})
				.catch(function (err) {
					console.error(
						"Select: Error loading searches at " + self.json.id,
						err
					);
					self.settingPromise = null;
				});
		});

		if (self.settingPromise) {
			self.preSetVal = val;
			self.settingPromise.then(function () {
				delete self.preSetVal;
				//self.set(val);
			});
		}
	} else if (this.json.options) {
		console.warn(
			"Value " +
				val +
				" is not a valid value for " +
				this.json.id +
				". ( " +
				this.json.options
					.map(function (v) {
						return v.value;
					})
					.join(" / ") +
				" )"
		);
		this.isReady = true;
	}
};
Form.Fields.Select.prototype.isChanged = function () {
	if (this.json.ignoreChange) return false;
	if (!this.isInit || !this.isReady) {
		return false;
	}
	var get = this.get();
	if (
		(this.original === "" ||
			this.original === undefined ||
			this.original === null) &&
		(get === null || (Array.isArray(get) && get.length === 0))
	)
		return false;

	if (this.json.saveObject) {
		return !(JSON.stringify(get) === JSON.stringify(this.original));
	} else if (!this.json.saveObject && this.json.loadObject) {
		if (
			(this.original === "" ||
				this.original === undefined ||
				this.original === null) &&
			get !== null
		)
			return true;

		if (Array.isArray(get)) {
			if (get.length !== this.original.length) return true;

			for (var ij = 0; ij < get.length; ij++) {
				if (get[ij] != this.original[ij][this.json.valueField]) return true;
			}
			return false;
		}
		return get != this.original[this.json.valueField];
	} else if (Array.isArray(get)) {
		if (!Array.isArray(this.original) || get.length !== this.original.length)
			return true;

		for (var i = 0; i < get.length; i++) {
			if (get[i] + "" != this.original[i] + "") return true;
		}
		return false;
	} else {
		return get !== this.original;
	}
};
Form.Fields.Select.prototype.reset = function () {
	this.set(this.original);
};
Form.Fields.Select.prototype.clear = function () {
	this.original = null;
	this.reset();
	this.set(null);
	this.clearErrors();
};
Form.Fields.Select.prototype.clearErrors = function () {
	if (!this._tabli)
		this._tabli = $(
			'[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
		).parent();

	var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
	if (cerrors.indexOf(this.json.id) > -1) {
		cerrors.splice(cerrors.indexOf(this.json.id), 1);
		if (cerrors.length > 0) {
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		} else {
			this._tabli.removeAttr("data-validation-error");
		}
	}
	this.$.html.closest(".form-group").removeClass("has-error");
};
Form.Fields.Select.prototype.remove = function () {
	this.sel.close();
	this.sel.destroy();
};

Form.Fields.Select.prototype.applyFieldBinds = function () {
	var self = this;
	var B = this.json.binds;
	if (!B) return;

	B.forEach(function (b) {
		if (b.to) {
			var t = self.form._("_" + b.to).get(0);
			// create bind
			t.onChange(function () {
				var get = t.get();
				if ((b.field && get ? get[b.field] : get) == b.value) {
					self.do(b.value, b.do, b.to);
				} else {
					self.do(b.value, b.do, b.to, true);
				}
			});
			// apply it
			var get = t.get();
			if ((b.field && get ? get[b.field] : get) == b.value) {
				self.do(b.value, b.do, b.to);
			} else {
				self.do(b.value, b.do, b.to, true);
			}
		} else if (b.target) {
			var t = self;

			t.onChange(function () {
				var get = t.get();
				if ((b.field && get ? get[b.field] : get) == b.value) {
					self.doTo({ type: b.type || "field", target: b.target }, b.do, b.to);
				} else {
					self.doTo(
						{ type: b.type || "field", target: b.target },
						b.do,
						b.to,
						true
					);
				}
			});

			var get = t.get();
			if ((b.field && get ? get[b.field] : get) == b.value) {
				self.doTo({ type: b.type || "field", target: b.target }, b.do, b.to);
			} else {
				self.doTo(
					{ type: b.type || "field", target: b.target },
					b.do,
					b.to,
					true
				);
			}
		}
	});
};
Form.Fields.Select.prototype.do = function (value, action, context, undo) {
	var self = this;
	if (!this.state) this.state = {};

	// Get previous differences
	var psK = Object.keys(this.state);
	var ps = {}; // previous state
	for (var i = 0; i < psK.length; i++) {
		ps[this.state[psK[i]]] = true;
	}

	if (undo) {
		if (this.state[action + "_" + value + "_" + context]) {
			delete this.state[action + "_" + value + "_" + context];
		} else {
			return;
		}
	} else {
		if (!this.state[action + "_" + value + "_" + context]) {
			this.state[action + "_" + value + "_" + context] = action;
		} else {
			return;
		}
	}

	// Get current differences
	var csK = Object.keys(this.state);
	var cs = {}; // current state
	for (var i = 0; i < csK.length; i++) {
		cs[this.state[csK[i]]] = true;
	}

	// Just making bA as a shortcut for bindActions
	var bA = Form.Fields.Select.bindActions;

	// reset states
	var aK = Object.keys(bA);
	for (var i = 0; i < aK.length; i++) {
		if (ps[aK[i]]) {
			// if in previous
			if (cs[aK[i]]) {
				// and in current
				continue; // same state. do nothing
			}
			bA[aK[i]][1](this); // not in current. undo
		}

		if (cs[aK[i]]) {
			// if only in current
			bA[aK[i]][0](this); // apply state
		}
	}
};
Form.Fields.Select.prototype.doTo = function (target, action, context, undo) {
	var self = this;
	if (!this.targetStates) this.targetStates = {};

	if (!this.targetStates[target.type + "_" + target.target])
		this.targetStates[target.type + "_" + target.target] = {};

	// Get previous differences
	var psK = Object.keys(this.targetStates[target.type + "_" + target.target]);
	var ps = {}; // previous state
	for (var i = 0; i < psK.length; i++) {
		ps[this.targetStates[target.type + "_" + target.target][psK[i]]] = true;
	}

	if (undo) {
		if (
			this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			]
		) {
			delete this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			];
		} else {
			return;
		}
	} else {
		if (
			!this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			]
		) {
			this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			] = action;
		} else {
			return;
		}
	}

	// Get current differences
	var csK = Object.keys(this.targetStates[target.type + "_" + target.target]);
	var cs = {}; // current state
	for (var i = 0; i < csK.length; i++) {
		cs[this.targetStates[target.type + "_" + target.target][csK[i]]] = true;
	}

	// Just making bA as a shortcut for bindActions
	var bA = Form.Fields.Select.bindActions;

	// reset states
	var aK = Object.keys(bA);
	for (var i = 0; i < aK.length; i++) {
		if (ps[aK[i]]) {
			// if in previous
			if (cs[aK[i]]) {
				// and in current
				continue; // same state. do nothing
			}
			bA[aK[i]][1](this, target); // not in current. undo
		}

		if (cs[aK[i]]) {
			// if only in current
			bA[aK[i]][0](this, target); // apply state
		}
	}
};
Form.Fields.Select.bindActions = {
	disable: [
		function (self) {
			self.sel.disable();
		},
		function (self) {
			self.sel.enable();
		},
	],
	hide: [
		function (self) {
			// Do
			self.$.container.parent().addClass("hidden");
		},
		function (self) {
			// Undo
			self.$.container.parent().removeClass("hidden");
		},
	],
	show: [
		function (self, target) {
			// Do
			if (target && target.type === "tab") {
				self.form.$.container
					.find('[data-tab-id="' + target.target + '"]')
					.each(function () {
						var $this = $(this);
						var states = JSON.parse(
							decodeURIComponent($this.attr("data-state-shown") || "") || "[]"
						);
						if (states.indexOf(self.json.id) === -1) {
							states.push(self.json.id);
							$this.attr(
								"data-state-shown",
								encodeURIComponent(JSON.stringify(states))
							);
						}
					});
			} else {
				self.$.container.parent().removeClass("hidden");
			}
		},
		function (self, target) {
			// Undo
			if (target && target.type === "tab") {
				self.form.$.container
					.find('[data-tab-id="' + target.target + '"]')
					.each(function () {
						var $this = $(this);
						var states = JSON.parse(
							decodeURIComponent($this.attr("data-state-shown") || "") || "[]"
						);
						if (states.indexOf(self.json.id) > -1) {
							states.splice(states.indexOf(self.json.id), 1);

							if (states.length === 0) {
								$this.removeAttr("data-state-shown");
							} else {
								$this.attr(
									"data-state-shown",
									encodeURIComponent(JSON.stringify(states))
								);
							}
						}
					});
			} else {
				self.$.container.parent().addClass("hidden");
			}
		},
	],
};
Form.Fields.Select.prototype.refresh = function () {
	// stub
};
Form.Fields.Select.prototype.saveData = function () {
	this.original =
		this.json.loadObject && !this.json.saveObject
			? this.getObject()
			: this.get();
	this.doChanges();
};
Form.Fields.Select.prototype.doChanges = function () {
	var changed = this.isChanged();
	var val = this.get();

	if (changed && !this.json.muted) {
		this.$.container.closest(".form-group").addClass("changed");
	} else {
		this.$.container.closest(".form-group").removeClass("changed");
	}

	for (var i = 0; i < this.changeListeners.length; i++) {
		this.changeListeners[i](this.json.id, val, changed, this);
	}
};
Form.Fields.Select.prototype.validate = function () {
	var self = this;
	// check if has validation settings
	if (!this.json.validation) return true;

	var errors = []; // i18n keys

	// setup validation elements
	if (!this._tabli)
		this._tabli = $(
			'[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
		).parent();

	var val = this.json.validation;
	var value = this.get();

	// validate empty
	if (val.required && (!value || (value + "").trim() === "")) {
		// apply error
		errors.push("app.errors.required-field");
	}

	if (val.custom) {
		(Array.isArray(val.custom) ? val.custom : [val.custom]).forEach(function (
			f
		) {
			var err;
			if (self.form.actions[f]) {
				err = self.form.actions[f](value, self);
				if (err) errors.push(err);
			}
		});
	}
	if (errors.length > 0) {
		self.$.container.closestChildren(".for-error").html(
			errors
				.map(function (v) {
					return i18n.t(v);
				})
				.join("<br>")
		);

		this.$.html.closest(".form-group").addClass("has-error");

		var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
		if (cerrors.indexOf(this.json.id) < 0) {
			if (cerrors[0] === "") cerrors = [];
			cerrors.push(this.json.id);
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		}
		return false;
	}

	// unset errors. set success?
	var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
	if (cerrors.indexOf(this.json.id) > -1) {
		cerrors.splice(cerrors.indexOf(this.json.id), 1);
		if (cerrors.length > 0) {
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		} else {
			this._tabli.removeAttr("data-validation-error");
		}
	}
	this.$.html.closest(".form-group").removeClass("has-error");
	return true;
};
Form.Fields.Select.prototype.onChange = function (callback) {
	if (!this.changeListeners) this.changeListeners = [];

	this.changeListeners.push(callback);
};
Form.Fields.Select.prototype.onInit = function (callback) {
	if (this.isInit) {
		callback();
	} else {
		this.initListeners.push(callback);
	}
};
Form.Fields.Select.prototype._ = scopeInterface;
Form.Fields.Select.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "Select".toLowerCase() ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

/**
 * SimpleGrid
 */

Form.Fields.SimpleGrid = function SimpleGrid(scope, container, json ){
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._('^form').get(0);

  this.value = null;
  this.original = null;

  this.changeListeners = [];

  this.init();
}
Form.Fields.SimpleGrid.prototype.init = function(){
  var html = Form.Template( this.json, {data: {
    input: true
  }});
  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);

  this.$.table = this.$.container.find('table');
  this.$.thead = this.$.table.find('thead');
  this.$.tbody = this.$.table.find('tbody');

  this.bind();
  this.i18n();
}
Form.Fields.SimpleGrid.prototype.bind = function(){
  // nop
}
Form.Fields.SimpleGrid.prototype.i18n = function(){
  this.$.html.i18n();
}
Form.Fields.SimpleGrid.prototype.getData = function(){
  // nop
}
Form.Fields.SimpleGrid.prototype.get = function(){
  // nop
}
Form.Fields.SimpleGrid.prototype.setData = function( data ){
  if( !this.data )
    return;
  this.set( data[this.json.id] );
}
Form.Fields.SimpleGrid.prototype.set = function( val ){
  var data = val.data.map(function(v){
    return val.fields.map(function(k){
      return v[k];
    });
  });
  this.$.thead.empty().append('<tr>'+val.fields.map(function(v){return '<th>'+escapeHTML(v+'')+'</th>'})+'</tr>');
  this.$.tbody.empty().append(data.map(function(r){return '<tr>'+r.map(function(v){return '<td>'+escapeHTML(v+'')+'</td>'})+'</tr>'}));
}
Form.Fields.SimpleGrid.prototype.isChanged = function(){
  return false;
}
Form.Fields.SimpleGrid.prototype.reset = function(){
  // nop
}
Form.Fields.SimpleGrid.prototype.clear = function(){
  // clear all
}
Form.Fields.SimpleGrid.prototype.applyFieldBinds = function(){
  // nop
}
Form.Fields.SimpleGrid.prototype.validate = function(){
  // stub
}
Form.Fields.SimpleGrid.prototype.saveData = function(){
  // nop
}
Form.Fields.SimpleGrid.prototype.refresh = function(){
  // nop
}
Form.Fields.SimpleGrid.prototype.onChange = function( callback ){
  // nop
}
Form.Fields.SimpleGrid.prototype._ = scopeInterface;
Form.Fields.SimpleGrid.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('SimpleGrid').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};

/**
 * Slider
 */

Form.Fields.Slider = function Slider(scope, container, json ){
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._('^form').get(0);

  this.value = 0;
  this.original = null;

  this.changeListeners = [];

  this.init();
}
Form.Fields.Slider.prototype.init = function(){
  var html = Form.Template( this.json, {data: {
    input: true
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);
  this.$.input = this.$.container.find('input');

  this.$.input.ionRangeSlider({
    min:     ( this.json.min     === undefined ? 0    : this.json.min ),
    max:     ( this.json.max     === undefined ? 100  : this.json.max ),
    step:    ( this.json.step    === undefined ? 1    : this.json.step ),
    grid:    ( this.json.grid    === undefined ? true : this.json.grid ),
    postfix: ( this.json.postfix === undefined ? true : this.json.postfix )
  });

  this.bind();
  this.i18n();
}
Form.Fields.Slider.prototype.bind = function(){
  var self = this;
  this.slider = this.$.input.data('ionRangeSlider');
  this.$.input.on('input change', function( ev ){
    self.value = this.value;

    self.doChanges();
  });
}
Form.Fields.Slider.prototype.i18n = function(){
  this.$.html.i18n();
}
Form.Fields.Slider.prototype.readonly = function(set){
  if( typeof set === 'undefined' )
    return this.isReadOnly;

  this.isReadOnly = !!set;
  this.slider.update({disable: this.isReadOnly})
}
Form.Fields.Slider.prototype.getData = function(){
  var d = {};
  d[this.json.id] = this.value;
  return d;
}
Form.Fields.Slider.prototype.get = function(){
  return this.value;
}
Form.Fields.Slider.prototype.setData = function( data ){
  var val = data[ this.json.id ];
  this.original = val;
  this.set( val );
}
Form.Fields.Slider.prototype.set = function( val ){
  this.value = val;
  this.$.input.data('ionRangeSlider').update({
    from: val
  });
  this.doChanges();
}
Form.Fields.Slider.prototype.isChanged = function(){
  var val = this.get();
  return val != this.original &&
    !(this.original === null && val === '' );
}
Form.Fields.Slider.prototype.reset = function(){
  this.set( this.original );
}
Form.Fields.Slider.prototype.clear = function(){
  this.value = null;
  this.original = null;

  this.$.input.val('');
}
Form.Fields.Slider.prototype.applyFieldBinds = function(){
}
Form.Fields.Slider.prototype.applyFieldBinds = function(){
  var self = this;
  var B = this.json.binds;
  if(!B) return;

  B.forEach(function(b){
    var t = self.form._('_'+b.to).get(0);
    // create bind
    t.onChange(function(){
      var get = t.get();
      if( ( b.field && get ? get[b.field] : get ) == b.value ){
        self.do(b.value,b.do, b.to);
      }else{
        self.do(b.value,b.do, b.to, true);
      }
    });
    // apply it
    var get = t.get();
    if( ( b.field && get ? get[b.field] : get ) == b.value ){
      self.do(b.value,b.do, b.to);
    }else{
      self.do(b.value,b.do, b.to, true);
    }
  });
}
Form.Fields.Slider.prototype.do = function( value, action, context, undo ){
  var self = this;
  if(!this.state)
    this.state = {};

  // Get previous differences
  var psK = Object.keys(this.state);
  var ps = {}; // previous state
  for( var i = 0 ; i < psK.length ; i++ ){
    ps[this.state[psK[i]]] = true;
  }

  if(undo){
    if(this.state[action+'_'+value+'_'+context]){
      delete this.state[action+'_'+value+'_'+context];
    }else{
      return;
    }
  }else{
    if(!this.state[action+'_'+value+'_'+context]){
      this.state[action+'_'+value+'_'+context] = action;
    }else{
      return;
    }
  }


  // Get current differences
  var csK = Object.keys(this.state);
  var cs = {}; // current state
  for( var i = 0 ; i < csK.length ; i++ ){
    cs[this.state[csK[i]]] = true;
  }

  // Just making bA as a shortcut for bindActions
  var bA = Form.Fields.Slider.bindActions;

  // reset states
  var aK = Object.keys(bA);
  for( var i = 0 ; i < aK.length ; i++ ){
    if( ps[aK[i]] ){      // if in previous
      if( cs[aK[i]] ){    // and in current
        continue;         // same state. do nothing
      }
      bA[aK[i]][1](this); // not in current. undo
    }

    if( cs[aK[i]] ){      // if only in current
      bA[aK[i]][0](this); // apply state
    }
  }
}
Form.Fields.Slider.prototype.validate = function(){
  var self = this;
  // check if has validation settings
  if( !this.json.validation )
    return true;

  var errors = []; // i18n keys

  // setup validation elements
  if( !this._tabli )
    this._tabli = $('[href="#'+this.$.html.closest('.tab-pane').attr('id')+'"]').parent();


  var val = this.json.validation;
  var value = this.get();

  // validate empty
  if( val.required && ( value === null ) ){
    // apply error
    // i18n.t('common.errors.required');
    errors.push('app.errors.required-field');
  }
  

  if( val.custom ){
    (Array.isArray(val.custom)?val.custom:[val.custom]).forEach(function(f){
      var err;
      if(self.form.actions[f]){
        err = self.form.actions[f]( value, self, val );
        if( err )
          errors.push(err);
      }
    })
  }

  if(errors.length > 0){
    self.$.container.closestChildren('.for-error').html(errors.map(function(v){return i18n.t(v); }).join('<br>'));

    this.$.html.closest('.form-group').addClass('has-error');

    var cerrors = (this._tabli.attr('data-validation-error') || '').split(';');
    if( cerrors.indexOf(this.json.id) < 0 ){
      if(cerrors[0] === '')
        cerrors = [];
      cerrors.push(this.json.id);
      this._tabli.attr('data-validation-error', cerrors.join(';'));
    }
    return false;
  }

  // unset errors. set success?
  var cerrors = (this._tabli.attr('data-validation-error') || '').split(';');
  if( cerrors.indexOf(this.json.id) > -1 ){
    cerrors.splice(cerrors.indexOf(this.json.id), 1);
    if(cerrors.length > 0){
      this._tabli.attr('data-validation-error', cerrors.join(';') );
    }else{
      this._tabli.removeAttr('data-validation-error');
    }
  }
  this.$.html.closest('.form-group').removeClass('has-error');
  return true;
}
Form.Fields.Slider.prototype.saveData = function(){
  this.original = this.get();
  this.doChanges();
}
Form.Fields.Slider.prototype.refresh = function(){

}
Form.Fields.Slider.prototype.doChanges = function(){
  var changed = this.isChanged();
  var val = this.get();

  if( changed && !this.json.muted ){
    this.$.container.closest('.form-group').addClass('changed');
  }else{
    this.$.container.closest('.form-group').removeClass('changed');
  }

  for( var i = 0 ; i < this.changeListeners.length ; i++ ){
    this.changeListeners[i]( this.json.id, val, changed );
  }
}
Form.Fields.Slider.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];

  this.changeListeners.push( callback );
}
Form.Fields.Slider.bindActions = {
  disable: [
    function( self ){ // Do
      self.$.input.prop('disabled', true);
    },
    function( self ){ // Undo
      self.$.input.prop('disabled', false);
    }
  ],
  hide: [
    function( self ){ // Do
      self.$.container.parent().addClass('hidden');
    },
    function( self ){ // Undo
      self.$.container.parent().removeClass('hidden');
    }
  ],
  show: [
    function( self ){ // Do
      self.$.container.parent().removeClass('hidden');
    },
    function( self ){ // Undo
      self.$.container.parent().addClass('hidden');
    }
  ]
}
Form.Fields.Slider.prototype._ = scopeInterface;
Form.Fields.Slider.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('Slider').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};

/**
 * Sortable
 */

Form.Fields.Sortable = function Sortable(scope, container, json) {
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._("^form").get(0);

  this.value = [];
  this.original = [];

  this.changeListeners = [];

  this.init();
};
Form.Fields.Sortable.prototype.init = function() {
  var html = Form.Template(this.json, {
    data: {
      input: true
    }
  });

  this.render = this.json.render;

  this.$.html = $(html);
  if (this.json.visibility === "hidden")
    this.$.container.parent().addClass("hidden");

  this.$.container.append(this.$.html);
  this.$.ul = this.$.container.find("ul.sortable");

  this.sortable = Sortable.create(this.$.ul[0], {
    sort: true,
    animation: 100,
    /* > Having it set to true causes drag to block on Firefox
    forceFallback: true, */
    ghostClass: "sort-ghost",
    chosenClass: "sort-chosen"
  });

  this.bind();
  this.i18n();
};
Form.Fields.Sortable.prototype.bind = function() {
  var self = this;

  this.sortable.option("onUpdate", function(ev) {
    self.value = self.$.ul
      .children("li")
      .map(function() {
        return $(this).data("data");
      })
      .get();
    self.doChanges();
  });

  this.sortable.option("filter", ".sort-custom-tool, .sort-remove");
  this.sortable.option("onFilter", function(ev) {
    var item = ev.item,
      ctrl = ev.target;

    if (Sortable.utils.is(ctrl, ".sort-remove")) {
      // Click on remove button
      $(item).remove();
      self.value = self.$.ul
        .children("li")
        .map(function() {
          return $(this).data("data");
        })
        .get();
      self.doChanges();
    } else if (Sortable.utils.is(ctrl, ".sort-custom-tool")) {
      // Click on remove button
      var action = $(ctrl).data("action");
      if (self.form.actions[action]) {
        self.form.actions[action]($(item).data("data"), item, self, self.form);
      }
    }
  });
};
Form.Fields.Sortable.prototype.i18n = function() {
  this.$.html.i18n();
};
Form.Fields.Sortable.prototype.addItem = function(data) {
  var $base = $(
    Form.Template(
      { type: "Sortable-item" },
      { data: { tools: this.json.tools, cantRemove: this.json.cantRemove } }
    )
  );
  var extra = {
    helpers:
      (this.form && this.form.view.Actions && this.form.view.Actions.helpers) ||
      {}
  };
  var html = renderCached(this.render, data, extra);
  $base.find(".sort-content").html(html);
  this.$.ul.append($base);
  $base.data("data", data);

  this.value = this.$.ul
    .children("li")
    .map(function() {
      return $(this).data("data");
    })
    .get();

  this.validate();
  this.doChanges();
};
Form.Fields.Sortable.prototype.updateItem = function(li) {
  var data = $(li).data("data");
  var extra = {
    helpers:
      (this.form && this.form.view.Actions && this.form.view.Actions.helpers) ||
      {}
  };
  var html = renderCached(this.render, data, extra);
  $(li)
    .find(".sort-content")
    .html(html);

  this.value = this.$.ul
    .children("li")
    .map(function() {
      return $(this).data("data");
    })
    .get();

  this.validate();
  this.doChanges();
};
Form.Fields.Sortable.prototype.getData = function() {
  var d = {};
  d[this.json.id] = this.get();
  return d;
};
Form.Fields.Sortable.prototype.get = function() {
  return this.value;
};
Form.Fields.Sortable.prototype.setData = function(data, preventSave) {
  var val = data[this.json.id];
  if (val === null || val === undefined) return;

  if (!preventSave) this.original = val;

  this.set(val);
};
Form.Fields.Sortable.prototype.set = function(val) {
  this.$.ul.empty();
  this.value = val;

  for (var i = 0; i < val.length; i++) {
    this.addItem(val[i]);
  }

  this.value = this.$.ul
    .children("li")
    .map(function() {
      return $(this).data("data");
    })
    .get();

  this.doChanges();
};
Form.Fields.Sortable.prototype.isChanged = function() {
  var val = this.get();
  return (
    JSON.stringify(val) !== JSON.stringify(this.original) &&
    !(this.original === null && val === "")
  );
};
Form.Fields.Sortable.prototype.reset = function() {
  this.set(this.original);
};
Form.Fields.Sortable.prototype.clear = function() {
  this.original = null;
};
Form.Fields.Sortable.prototype.applyFieldBinds = function() {
  var self = this;
  var B = this.json.binds;
  if (!B) return;

  B.forEach(function(b) {
    var t = self.form._("_" + b.to).get(0);
    // create bind
    t.onChange(function() {
      var get = t.get();
      if ((b.field && get ? get[b.field] : get) == b.value) {
        self.do(b.value, b.do, b.to);
      } else {
        self.do(b.value, b.do, b.to, true);
      }
    });
    // apply it
    var get = t.get();
    if ((b.field && get ? get[b.field] : get) == b.value) {
      self.do(b.value, b.do, b.to);
    } else {
      self.do(b.value, b.do, b.to, true);
    }
  });
};
Form.Fields.Sortable.prototype.do = function(value, action, context, undo) {
  var self = this;
  if (!this.state) this.state = {};

  // Get previous differences
  var psK = Object.keys(this.state);
  var ps = {}; // previous state
  for (var i = 0; i < psK.length; i++) {
    ps[this.state[psK[i]]] = true;
  }

  if (undo) {
    if (this.state[action + "_" + value + "_" + context]) {
      delete this.state[action + "_" + value + "_" + context];
    } else {
      return;
    }
  } else {
    if (!this.state[action + "_" + value + "_" + context]) {
      this.state[action + "_" + value + "_" + context] = action;
    } else {
      return;
    }
  }

  // Get current differences
  var csK = Object.keys(this.state);
  var cs = {}; // current state
  for (var i = 0; i < csK.length; i++) {
    cs[this.state[csK[i]]] = true;
  }

  // Just making bA as a shortcut for bindActions
  var bA = Form.Fields.Sortable.bindActions;

  // reset states
  var aK = Object.keys(bA);
  for (var i = 0; i < aK.length; i++) {
    if (ps[aK[i]]) {
      // if in previous
      if (cs[aK[i]]) {
        // and in current
        continue; // same state. do nothing
      }
      bA[aK[i]][1](this); // not in current. undo
    }

    if (cs[aK[i]]) {
      // if only in current
      bA[aK[i]][0](this); // apply state
    }
  }
};
Form.Fields.Sortable.prototype.validate = function() {
  var self = this;
  // check if has validation settings
  if (!this.json.validation) return true;

  var errors = []; // i18n keys

  // setup validation elements
  if (!this._tabli)
    this._tabli = $(
      '[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
    ).parent();

  var val = this.json.validation;
  var value = this.get();

  // validate empty
  if (val.required && value.length === 0) {
    // apply error
    // i18n.t('common.errors.required');
    errors.push("app.errors.required-field");
  } else if (val.regex) {
    // make regexes
    if (!this.regexes) {
      this.regexes = {};

      val.regex.forEach(function(v, k) {
        self.regexes[k] = new RegExp(k);
      });
    }

    var vK = Object.keys(val.regex);
    for (var i = 0; i < vK.length; i++) {
      var k = vK[i];
      var r = self.regexes[k];

      if (!r.test(value)) {
        errors.push(val.regex[k]);
      }
    }
  }

  if (val.custom) {
    (Array.isArray(val.custom) ? val.custom : [val.custom]).forEach(function(
      f
    ) {
      var err;
      if (self.form.actions[f]) {
        err = self.form.actions[f](value, self, val);
        if (err) errors.push(err);
      }
    });
  }
  if (errors.length > 0) {
    self.$.container.closestChildren(".for-error").html(
      errors
        .map(function(v) {
          return i18n.t(v);
        })
        .join("<br>")
    );

    this.$.html.closest(".form-group").addClass("has-error");

    var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
    if (cerrors.indexOf(this.json.id) < 0) {
      if (cerrors[0] === "") cerrors = [];
      cerrors.push(this.json.id);
      this._tabli.attr("data-validation-error", cerrors.join(";"));
    }
    return false;
  }

  // unset errors. set success?
  var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
  if (cerrors.indexOf(this.json.id) > -1) {
    cerrors.splice(cerrors.indexOf(this.json.id), 1);
    if (cerrors.length > 0) {
      this._tabli.attr("data-validation-error", cerrors.join(";"));
    } else {
      this._tabli.removeAttr("data-validation-error");
    }
  }
  this.$.html.closest(".form-group").removeClass("has-error");
  return true;
};
Form.Fields.Sortable.prototype.doChanges = function() {
  var changed = this.isChanged();
  var val = this.get();

  if (changed && !this.json.muted) {
    this.$.container.closest(".form-group").addClass("changed");
  } else {
    this.$.container.closest(".form-group").removeClass("changed");
  }

  for (var i = 0; i < this.changeListeners.length; i++) {
    this.changeListeners[i](this.json.id, val, changed);
  }
};
Form.Fields.Sortable.prototype.saveData = function() {
  this.original = this.get();
  this.doChanges();
};
Form.Fields.Sortable.prototype.refresh = function() {};
Form.Fields.Sortable.prototype.onChange = function(callback) {
  if (!this.changeListeners) this.changeListeners = [];

  this.changeListeners.push(callback);
};
Form.Fields.Sortable.bindActions = {
  disable: [
    function(self) {
      // Do
      self.$.input.prop("disabled", true);
    },
    function(self) {
      // Undo
      self.$.input.prop("disabled", false);
    }
  ],
  hide: [
    function(self) {
      // Do
      self.$.container.parent().addClass("hidden");
    },
    function(self) {
      // Undo
      self.$.container.parent().removeClass("hidden");
    }
  ]
};
Form.Fields.Sortable.prototype._ = scopeInterface;
Form.Fields.Sortable.prototype.is = function(t) {
  if (t === "*") return true;
  return (
    t.toLowerCase() === "Sortable".toLowerCase() ||
    t.toLowerCase() === this.json.id.toLowerCase()
  );
};

/**
 * SortaForm
 */

Form.Fields.SortaForm = function SortaForm(scope, container, json) {
	this.scope = scope;
	this.container = container;
	this.json = json;

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;
	this.form = this._("^form").get(0);

	this.value = [];
	this.original = [];

	this.components = [];
	this.children = [];

	this.changeListeners = [];

	this.init();
};
Form.Fields.SortaForm.prototype.init = function() {
	var html = Form.Template(this.json, {
		data: {
			input: true
		}
	});

	this.render = this.json.render;

	this.$.html = $(html);
	if (this.json.visibility === "hidden")
		this.$.container.parent().addClass("hidden");

	this.$.container.append(this.$.html);
	this.$.ul = this.$.container.find("ul.sortable");

	this.sortable = Sortable.create(this.$.ul[0], {
		sort: !this.json.noSort,
		animation: 100,
		// forceFallback: true,
		ghostClass: "sort-ghost",
		chosenClass: "sort-chosen",
		onMove: event => {
			return false;
		}
	});

	this.bind();
	this.initContent();
	this.i18n();
};
Form.Fields.SortaForm.prototype.initContent = function(info) {
	var self = this;
	info = info || this.json.info;

	this.$.container.find("[data-component]").each(function() {
		var $this = $(this);
		var instance = $this.data("component");
		var comp = JSON.simpleCopy(window.Instances[instance]);

		var tmplt = null;
		if (comp.type.indexOf(".") > -1) {
			var cI = window.Templates;
			comp.type.split(".").forEach(function(v) {
				if (!cI[v]) {
					console.error("Error. " + v + " doesn't exist.");
				}
				cI = cI[v];
			});
			tmplt = cI;
		} else {
			tmplt = window.Templates[comp.type];
		}

		try {
			var component = new tmplt(self, this, comp.opts, info || self.scope.opts);
			self.components.push(component);
			self.children.push(component);

			component.initPromise
				.then(function() {
					component.readonly(true);
				})
				.catch(function(err) {
					console.error(err);
				});

			self.innerForm = component;
		} catch (e) {
			console.error(e);
		}
	});

	this.components.forEach(function(c) {
		if (c.onChange) {
			c.onChange(function(id, value, changed) {
				for (var i = 0; i < self.changeListeners.length; i++) {
					self.changeListeners[i](c.json.id + "." + id, value, changed);
				}
			});
		}
	});

	if (this.json.readonly) {
		this.readonly(true);
	}
};
Form.Fields.SortaForm.prototype.bind = function() {
	var self = this;

	this.$.addbtn = this.$.container.find(".sort-btns-add");
	this.$.savebtn = this.$.container.find(".sort-btns-save");
	this.$.cancelbtn = this.$.container.find(".sort-btns-cancel");

	this.sortable.option("onUpdate", function(ev) {
		self.value = self.$.ul
			.children("li")
			.map(function() {
				return $(this).data("data");
			})
			.get();
		self.doChanges();
	});

	this.$.addbtn.on("click", function() {
		self.addingLi = self.addItem({});

		self.setActive(self.addingLi);
		self.innerForm.clear();
		self.innerForm.readonly(false);
		if (self.json.defaultData) {
			self.innerForm.applyData(self.json.defaultData);
		}
		self.$.addbtn.attr("disabled", true);
		self.$.savebtn.removeClass("hidden");
		self.$.cancelbtn.removeClass("hidden");
	});

	this.$.savebtn.on("click", function() {
		var li = self.addingLi || self.editingLi;
		// validate subform
		if (!self.innerForm.validate()) return;
		li.data("data", self.innerForm.get());
		self.updateItem(li);

		self.innerForm.readonly(true);
		self.$.addbtn.attr("disabled", false);
		self.$.savebtn.addClass("hidden");
		self.$.cancelbtn.addClass("hidden");
		self.addingLi = null;
		self.editingLi = null;
		self.setActive();

		self.innerForm.clear();
		self.innerForm.setSaved();
		self.doChanges();
	});

	this.$.cancelbtn.on("click", function() {
		self.setActive();

		if (self.addingLi) {
			self.addingLi.remove();
		} else if (self.editingLi) {
		}

		self.innerForm.readonly(true);
		self.$.addbtn.attr("disabled", false);
		self.$.savebtn.addClass("hidden");
		self.$.cancelbtn.addClass("hidden");

		self.value = self.$.ul
			.children("li")
			.map(function() {
				return $(this).data("data");
			})
			.get();

		self.innerForm.clear();
		self.innerForm.setSaved();

		self.doChanges();
	});

	this.sortable.option("filter", ".sort-action");
	this.sortable.option("onFilter", function(ev) {
		var item = ev.item,
			ctrl = ev.target;
		if (Sortable.utils.is(ctrl, ".sort-remove")) {
			// Click on remove button
			$(item).remove();
			self.value = self.$.ul
				.children("li")
				.map(function() {
					return $(this).data("data");
				})
				.get();
			self.doChanges();
		} else if (Sortable.utils.is(ctrl, ".sort-edit")) {
			// Click on edit button
			self.editingLi = $(item).closest(".list-group-item");

			self.setActive(self.editingLi);
			self.innerForm.readonly(false);
			self.$.addbtn.attr("disabled", true);
			self.$.savebtn.removeClass("hidden");
			self.$.cancelbtn.removeClass("hidden");
			self.innerForm.applyData($(item).data("data"));
		} else if (Sortable.utils.is(ctrl, ".sort-view")) {
			// Click on edit button

			self.innerForm.readonly(true);
			self.innerForm.applyData($(item).data("data"));
		}
	});
};
Form.Fields.SortaForm.prototype.i18n = function() {
	this.$.html.i18n();
};
Form.Fields.SortaForm.prototype.setActive = function(li) {
	if (this.highlighted == li || $(li).is(this.highlighted)) return;

	if (li == null) {
		this.highlighted.siblings().removeClass("blocked");
		this.highlighted.removeClass("blocked highlighted");
		this.highlighted = null;
	} else {
		if (this.highlighted == null) {
			li.siblings().addClass("blocked");
			li.addClass("blocked");
		} else {
			this.highlighted.removeClass("highlighted");
		}

		li.addClass("highlighted");
		this.highlighted = li;
	}
};
Form.Fields.SortaForm.prototype.addItem = function(data) {
	var $base = $(Form.Template({ type: "Sortaform-item" }, { data: this.json }));
	var extra = {
		helpers:
			(this.form && this.form.view.Actions && this.form.view.Actions.helpers) ||
			{}
	};
	var html = renderCached(this.render, data, extra);
	$base.find(".sort-content").html(html);
	this.$.ul.append($base);
	$base.data("data", data);

	this.value = this.$.ul
		.children("li")
		.map(function() {
			return $(this).data("data");
		})
		.get();

	this.validate();
	this.doChanges();

	return $base;
};
Form.Fields.SortaForm.prototype.updateItem = function(li) {
	var data = $(li).data("data");
	var extra = {
		helpers:
			(this.form && this.form.view.Actions && this.form.view.Actions.helpers) ||
			{}
	};
	var html = renderCached(this.render, data, extra);
	$(li)
		.find(".sort-content")
		.html(html);

	this.value = this.$.ul
		.children("li")
		.map(function() {
			return $(this).data("data");
		})
		.get();

	this.validate();
	this.doChanges();
};
Form.Fields.SortaForm.prototype.readonly = function(set) {
	if (typeof set === "undefined") return this.isReadOnly;

	this.isReadOnly = !!set;

	if (this.isReadOnly) {
		this.$.addbtn.addClass("hidden");
		this.$.ul.addClass("readonly");
	} else {
		this.$.addbtn.removeClass("hidden");
		this.$.ul.removeClass("readonly");
	}
	// disable edit, delete, add
};
Form.Fields.SortaForm.prototype.getData = function() {
	var d = {};
	d[this.json.id] = this.get();
	return d;
};
Form.Fields.SortaForm.prototype.get = function() {
	return this.value;
};
Form.Fields.SortaForm.prototype.setData = function(data, preventSave) {
	var val = data[this.json.id];
	if (val === null || val === undefined) return;

	if (!preventSave) this.original = val;

	this.set(val);
};
Form.Fields.SortaForm.prototype.set = function(val) {
	this.$.ul.empty();
	this.value = val;

	for (var i = 0; i < val.length; i++) {
		this.addItem(val[i]);
	}

	this.value = this.$.ul
		.children("li")
		.map(function() {
			return $(this).data("data");
		})
		.get();

	this.doChanges();
};
Form.Fields.SortaForm.prototype.isChanged = function() {
	var val = this.get();
	return (
		JSON.stringify(val) !== JSON.stringify(this.original) &&
		!(this.original === null && val === "")
	);
};
Form.Fields.SortaForm.prototype.reset = function() {
	this.set(this.original);
};
Form.Fields.SortaForm.prototype.clear = function() {
	this.original = null;
};
Form.Fields.SortaForm.prototype.applyFieldBinds = function() {
	var self = this;
	var B = this.json.binds;
	if (!B) return;

	B.forEach(function(b) {
		var t = self.form._("_" + b.to).get(0);
		// create bind
		t.onChange(function() {
			var get = t.get();
			if ((b.field && get ? get[b.field] : get) == b.value) {
				self.do(b.value, b.do, b.to);
			} else {
				self.do(b.value, b.do, b.to, true);
			}
		});
		// apply it
		var get = t.get();
		if ((b.field && get ? get[b.field] : get) == b.value) {
			self.do(b.value, b.do, b.to);
		} else {
			self.do(b.value, b.do, b.to, true);
		}
	});
};
Form.Fields.SortaForm.prototype.do = function(value, action, context, undo) {
	var self = this;
	if (!this.state) this.state = {};

	// Get previous differences
	var psK = Object.keys(this.state);
	var ps = {}; // previous state
	for (var i = 0; i < psK.length; i++) {
		ps[this.state[psK[i]]] = true;
	}

	if (undo) {
		if (this.state[action + "_" + value + "_" + context]) {
			delete this.state[action + "_" + value + "_" + context];
		} else {
			return;
		}
	} else {
		if (!this.state[action + "_" + value + "_" + context]) {
			this.state[action + "_" + value + "_" + context] = action;
		} else {
			return;
		}
	}

	// Get current differences
	var csK = Object.keys(this.state);
	var cs = {}; // current state
	for (var i = 0; i < csK.length; i++) {
		cs[this.state[csK[i]]] = true;
	}

	// Just making bA as a shortcut for bindActions
	var bA = Form.Fields.SortaForm.bindActions;

	// reset states
	var aK = Object.keys(bA);
	for (var i = 0; i < aK.length; i++) {
		if (ps[aK[i]]) {
			// if in previous
			if (cs[aK[i]]) {
				// and in current
				continue; // same state. do nothing
			}
			bA[aK[i]][1](this); // not in current. undo
		}

		if (cs[aK[i]]) {
			// if only in current
			bA[aK[i]][0](this); // apply state
		}
	}
};
Form.Fields.SortaForm.prototype.validate = function() {
	var self = this;
	// check if has validation settings
	if (!this.json.validation) return true;

	var errors = []; // i18n keys

	// setup validation elements
	if (!this._tabli)
		this._tabli = $(
			'[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
		).parent();

	var val = this.json.validation;
	var value = this.get();

	// validate empty
	if (val.required && value.length === 0) {
		// apply error
		// i18n.t('common.errors.required');
		errors.push("app.errors.required-field");
	} else if (val.regex) {
		// make regexes
		if (!this.regexes) {
			this.regexes = {};

			val.regex.forEach(function(v, k) {
				self.regexes[k] = new RegExp(k);
			});
		}

		var vK = Object.keys(val.regex);
		for (var i = 0; i < vK.length; i++) {
			var k = vK[i];
			var r = self.regexes[k];

			if (!r.test(value)) {
				errors.push(val.regex[k]);
			}
		}
	}

	if (val.custom) {
		(Array.isArray(val.custom) ? val.custom : [val.custom]).forEach(function(
			f
		) {
			var err;
			if (self.form.actions[f]) {
				err = self.form.actions[f](value, self, val);
				if (err) errors.push(err);
			}
		});
	}
	if (errors.length > 0) {
		self.$.container.closestChildren(".for-error").html(
			errors
				.map(function(v) {
					return i18n.t(v);
				})
				.join("<br>")
		);

		this.$.html.closest(".form-group").addClass("has-error");

		var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
		if (cerrors.indexOf(this.json.id) < 0) {
			if (cerrors[0] === "") cerrors = [];
			cerrors.push(this.json.id);
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		}
		return false;
	}

	// unset errors. set success?
	var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
	if (cerrors.indexOf(this.json.id) > -1) {
		cerrors.splice(cerrors.indexOf(this.json.id), 1);
		if (cerrors.length > 0) {
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		} else {
			this._tabli.removeAttr("data-validation-error");
		}
	}
	this.$.html.closest(".form-group").removeClass("has-error");
	return true;
};
Form.Fields.SortaForm.prototype.doChanges = function() {
	var changed = this.isChanged();
	var val = this.get();

	if (changed && !this.json.muted) {
		this.$.container.closest(".form-group").addClass("changed");
	} else {
		this.$.container.closest(".form-group").removeClass("changed");
	}

	for (var i = 0; i < this.changeListeners.length; i++) {
		this.changeListeners[i](this.json.id, val, changed);
	}
};
Form.Fields.SortaForm.prototype.saveData = function() {
	this.original = this.get();
	this.doChanges();
};
Form.Fields.SortaForm.prototype.refresh = function() {};
Form.Fields.SortaForm.prototype.onChange = function(callback) {
	if (!this.changeListeners) this.changeListeners = [];

	this.changeListeners.push(callback);
};
Form.Fields.SortaForm.bindActions = {
	disable: [
		function(self) {
			// Do
			self.$.input.prop("disabled", true);
		},
		function(self) {
			// Undo
			self.$.input.prop("disabled", false);
		}
	],
	hide: [
		function(self) {
			// Do
			self.$.container.parent().addClass("hidden");
		},
		function(self) {
			// Undo
			self.$.container.parent().removeClass("hidden");
		}
	]
};
Form.Fields.SortaForm.prototype._ = scopeInterface;
Form.Fields.SortaForm.prototype.is = function(t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "SortaForm".toLowerCase() ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

/**
 * Static
 */

Form.Fields.Static = function Static(scope, container, json ){
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._('^form').get(0);

  this.value = null;
  this.original = null;

  this.changeListeners = [];

  this.init();
}
Form.Fields.Static.prototype.init = function(){
  var html = Form.Template( this.json, {data: {
   input: true
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);
  this.i18n();
}
Form.Fields.Static.prototype.bind = function(){
 // nop
}
Form.Fields.Static.prototype.i18n = function(){
  this.$.html.i18n();
}
Form.Fields.Static.prototype.getData = function(){
  var d = {};
  d[this.json.id] = this.value;
  return d;
}
Form.Fields.Static.prototype.get = function(){
  return this.value;
}
Form.Fields.Static.prototype.setData = function( data, preventSave ){
  var val = data[ this.json.id ];

  if( !preventSave )
    this.original = val;

  this.set( val );
}
Form.Fields.Static.prototype.set = function( val ){
  this.value = val;
  this.$.container.find('.form-control-static')
    .text( val );
}
Form.Fields.Static.prototype.isChanged = function(){
  return this.get() !== this.original;
}
Form.Fields.Static.prototype.clear = function(){
  this.value = null;
  this.original = null;
  this.$.container.find('.form-control-static')
    .text( '' );
}
Form.Fields.Static.prototype.applyFieldBinds = function(){
}
Form.Fields.Static.prototype.validate = function(){
  // stub
}
Form.Fields.Static.prototype.saveData = function(){
}
Form.Fields.Static.prototype.refresh = function(){
 // nop
}
Form.Fields.Static.prototype.reset = function(){
 // nop
}
Form.Fields.Static.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];

  this.changeListeners.push( callback );
}
Form.Fields.Static.prototype._ = scopeInterface;
Form.Fields.Static.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('Static').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};
/**
 * StaticHTML
 */

Form.Fields.StaticHTML = function StaticHTML(scope, container, json) {
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._("^form").get(0);

  this.value = null;
  this.original = null;

  this.changeListeners = [];

  this.init();
};
Form.Fields.StaticHTML.prototype.init = function() {
  this.render();
  this.i18n();
};
Form.Fields.StaticHTML.prototype.render = function() {
  this.$.container.empty();
  var html = Form.Template(this.json, {
    data: {
      input: true,
      type: this.json.template ? "handlebars" : "none",
      content: this.json.template
        ? renderCached(
            this.json["template-i18n"]
              ? i18n.t(this.json["template-i18n"])
              : this.json.template,
            this.get()
          )
        : undefined
    }
  });

  this.$.html = $(html);
  if (this.json.visibility === "hidden")
    this.$.container.parent().addClass("hidden");

  if (this.json.well) this.$.container.parent().addClass("well");

  this.$.container.append(this.$.html);
};
Form.Fields.StaticHTML.prototype.bind = function() {};
Form.Fields.StaticHTML.prototype.i18n = function() {
  this.render();
  this.$.html.i18n();
};
Form.Fields.StaticHTML.prototype.getData = function() {};
Form.Fields.StaticHTML.prototype.get = function() {
  return this.val;
};
Form.Fields.StaticHTML.prototype.setData = function(data) {
  this.set(JSON.simpleCopy(data));
  this.render();
  this.i18n();
};
Form.Fields.StaticHTML.prototype.set = function(val) {
  this.val = val;
};
Form.Fields.StaticHTML.prototype.isChanged = function() {
  return false;
};
Form.Fields.StaticHTML.prototype.reset = function() {};
Form.Fields.StaticHTML.prototype.clear = function() {};
Form.Fields.StaticHTML.prototype.applyFieldBinds = function() {
  var self = this;
  var B = this.json.binds;
  if (!B) return;

  B.forEach(function(b) {
    if (b.to) {
      var t = self.form._("_" + b.to).get(0);
      // create bind
      t.onChange(function() {
        var get = t.get();
        if ((b.field && get ? get[b.field] : get) == b.value) {
          self.do(b.value, b.do, b.to);
        } else {
          self.do(b.value, b.do, b.to, true);
        }
      });
      // apply it
      var get = t.get();
      if ((b.field && get ? get[b.field] : get) == b.value) {
        self.do(b.value, b.do, b.to);
      } else {
        self.do(b.value, b.do, b.to, true);
      }
    } else if (b.target) {
      var t = self;

      t.onChange(function() {
        var get = t.get();
        if ((b.field && get ? get[b.field] : get) == b.value) {
          self.doTo({ type: b.type || "field", target: b.target }, b.do, b.to);
        } else {
          self.doTo(
            { type: b.type || "field", target: b.target },
            b.do,
            b.to,
            true
          );
        }
      });

      var get = t.get();
      if ((b.field && get ? get[b.field] : get) == b.value) {
        self.doTo({ type: b.type || "field", target: b.target }, b.do, b.to);
      } else {
        self.doTo(
          { type: b.type || "field", target: b.target },
          b.do,
          b.to,
          true
        );
      }
    }
  });
};
Form.Fields.StaticHTML.prototype.validate = function() {
  var self = this;
  // check if has validation settings
  if (!this.json.validation) return true;

  var errors = []; // i18n keys

  // setup validation elements
  if (!this._tabli)
    this._tabli = $(
      '[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
    ).parent();

  var val = this.json.validation;
  var value = this.get();

  // validate empty
  (Array.isArray(val) ? val : [val]).forEach(function(val) {
    if (val.required && (!value || (value + "").trim() === "")) {
      // apply error
      // i18n.t('common.errors.required');
      errors.push("app.errors.required-field");
    } else if (val.regex) {
      // make regexes
      if (!self.regexes) {
        self.regexes = {};

        val.regex.forEach(function(v, k) {
          self.regexes[k] = new RegExp(k);
        });
      }

      var vK = Object.keys(val.regex);
      for (var i = 0; i < vK.length; i++) {
        var k = vK[i];
        var r = self.regexes[k];

        if (!r.test(value)) {
          errors.push(val.regex[k]);
        }
      }
    }

    if (val.custom) {
      (Array.isArray(val.custom) ? val.custom : [val.custom]).forEach(function(
        f
      ) {
        var err;
        if (self.form.actions[f]) {
          err = self.form.actions[f](value, self, val);
          if (err) errors.push(err);
        }
      });
    }
  });
  if (errors.length > 0) {
    self.$.container.closestChildren(".for-error").html(
      errors
        .map(function(v) {
          return i18n.t(v);
        })
        .join("<br>")
    );

    this.$.html.closest(".form-group").addClass("has-error");

    var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
    if (cerrors.indexOf(this.json.id) < 0) {
      if (cerrors[0] === "") cerrors = [];
      cerrors.push(this.json.id);
      this._tabli.attr("data-validation-error", cerrors.join(";"));
    }
    return false;
  }

  // unset errors. set success?
  var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
  if (cerrors.indexOf(this.json.id) > -1) {
    cerrors.splice(cerrors.indexOf(this.json.id), 1);
    if (cerrors.length > 0) {
      this._tabli.attr("data-validation-error", cerrors.join(";"));
    } else {
      this._tabli.removeAttr("data-validation-error");
    }
  }
  this.$.html.closest(".form-group").removeClass("has-error");
  return true;
};
Form.Fields.StaticHTML.prototype.do = function(value, action, context, undo) {
  var self = this;
  if (!this.state) this.state = {};

  // Get previous differences
  var psK = Object.keys(this.state);
  var ps = {}; // previous state
  for (var i = 0; i < psK.length; i++) {
    ps[this.state[psK[i]]] = true;
  }

  if (undo) {
    if (this.state[action + "_" + value + "_" + context]) {
      delete this.state[action + "_" + value + "_" + context];
    } else {
      return;
    }
  } else {
    if (!this.state[action + "_" + value + "_" + context]) {
      this.state[action + "_" + value + "_" + context] = action;
    } else {
      return;
    }
  }

  // Get current differences
  var csK = Object.keys(this.state);
  var cs = {}; // current state
  for (var i = 0; i < csK.length; i++) {
    cs[this.state[csK[i]]] = true;
  }

  // Just making bA as a shortcut for bindActions
  var bA = Form.Fields.StaticHTML.bindActions;

  // reset states
  var aK = Object.keys(bA);
  for (var i = 0; i < aK.length; i++) {
    if (ps[aK[i]]) {
      // if in previous
      if (cs[aK[i]]) {
        // and in current
        continue; // same state. do nothing
      }
      bA[aK[i]][1](this); // not in current. undo
    }

    if (cs[aK[i]]) {
      // if only in current
      bA[aK[i]][0](this); // apply state
    }
  }
};
Form.Fields.StaticHTML.prototype.doTo = function(
  target,
  action,
  context,
  undo
) {
  var self = this;
  if (!this.targetStates) this.targetStates = {};

  if (!this.targetStates[target.type + "_" + target.target])
    this.targetStates[target.type + "_" + target.target] = {};

  // Get previous differences
  var psK = Object.keys(this.targetStates[target.type + "_" + target.target]);
  var ps = {}; // previous state
  for (var i = 0; i < psK.length; i++) {
    ps[this.targetStates[target.type + "_" + target.target][psK[i]]] = true;
  }

  if (undo) {
    if (
      this.targetStates[target.type + "_" + target.target][
        action + "_" + context
      ]
    ) {
      delete this.targetStates[target.type + "_" + target.target][
        action + "_" + context
      ];
    } else {
      return;
    }
  } else {
    if (
      !this.targetStates[target.type + "_" + target.target][
        action + "_" + context
      ]
    ) {
      this.targetStates[target.type + "_" + target.target][
        action + "_" + context
      ] = action;
    } else {
      return;
    }
  }

  // Get current differences
  var csK = Object.keys(this.targetStates[target.type + "_" + target.target]);
  var cs = {}; // current state
  for (var i = 0; i < csK.length; i++) {
    cs[this.targetStates[target.type + "_" + target.target][csK[i]]] = true;
  }

  // Just making bA as a shortcut for bindActions
  var bA = Form.Fields.StaticHTML.bindActions;

  // reset states
  var aK = Object.keys(bA);
  for (var i = 0; i < aK.length; i++) {
    if (ps[aK[i]]) {
      // if in previous
      if (cs[aK[i]]) {
        // and in current
        continue; // same state. do nothing
      }
      bA[aK[i]][1](this, target); // not in current. undo
    }

    if (cs[aK[i]]) {
      // if only in current
      bA[aK[i]][0](this, target); // apply state
    }
  }
};
Form.Fields.StaticHTML.bindActions = {
  disable: [
    function(self) {
      self.$.input.attr("disabled", true);
    },
    function(self) {
      self.$.input.attr("disabled", false);
    }
  ],
  hide: [
    function(self) {
      // Do
      self.$.container.parent().addClass("hidden");
    },
    function(self) {
      // Undo
      self.$.container.parent().removeClass("hidden");
    }
  ],
  show: [
    function(self, target) {
      // Do
      if (target && target.type === "tab") {
        self.form.$.container
          .find('[data-tab-id="' + target.target + '"]')
          .each(function() {
            var $this = $(this);
            var states = JSON.parse(
              decodeURIComponent($this.attr("data-state-shown") || "") || "[]"
            );
            if (states.indexOf(self.json.id) === -1) {
              states.push(self.json.id);
              $this.attr(
                "data-state-shown",
                encodeURIComponent(JSON.stringify(states))
              );
            }
          });
      } else {
        self.$.container.parent().removeClass("hidden");
      }
    },
    function(self, target) {
      // Undo
      if (target && target.type === "tab") {
        self.form.$.container
          .find('[data-tab-id="' + target.target + '"]')
          .each(function() {
            var $this = $(this);
            var states = JSON.parse(
              decodeURIComponent($this.attr("data-state-shown") || "") || "[]"
            );
            if (states.indexOf(self.json.id) > -1) {
              states.splice(states.indexOf(self.json.id), 1);

              if (states.length === 0) {
                $this.removeAttr("data-state-shown");
              } else {
                $this.attr(
                  "data-state-shown",
                  encodeURIComponent(JSON.stringify(states))
                );
              }
            }
          });
      } else {
        self.$.container.parent().addClass("hidden");
      }
    }
  ]
};
Form.Fields.StaticHTML.prototype.validate = function() {};
Form.Fields.StaticHTML.prototype.saveData = function() {};
Form.Fields.StaticHTML.prototype.refresh = function() {};
Form.Fields.StaticHTML.prototype.doChanges = function() {};
Form.Fields.StaticHTML.prototype.onChange = function() {};
Form.Fields.StaticHTML.prototype._ = scopeInterface;
Form.Fields.StaticHTML.prototype.is = function(t) {
  if (t === "*") return true;
  return (
    t.toLowerCase() === "StaticHTML".toLowerCase() ||
    t.toLowerCase() === this.json.id.toLowerCase()
  );
};

/**
 * Switch
 */

Form.Fields.Switch = function Switch(scope, container, json ){
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._('^form').get(0);

  this.changeActions = this.form.actions;

  this.value = false;
  this.original = null;

  this.old = [];

  this.changeListeners = [];

  this.init();
}
Form.Fields.Switch.prototype.init = function(){
  var html = Form.Template( this.json, {data: {
    input: true
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);
  this.$.input = this.$.html.find('input');
  this.bind();
  this.i18n();
}
Form.Fields.Switch.prototype.bind = function(){
  var self = this;
  this.$.input.on('change', function( ev, state ){
    self.value = this.checked;

    self.old.push(self.get());

    if( self.json.onChange ){
      if( self.changeActions[self.json.onChange] ){
        self.changeActions[self.json.onChange](self.get(), self.form,
          function () {
            self.old.pop();
            self.set(self.old.pop());
          }
        );
      }
    }
    self.doChanges();
  });
}
Form.Fields.Switch.prototype.i18n = function(){
  this.$.html.i18n();
  this.refresh();
}
Form.Fields.Switch.prototype.readonly = function(set){
  if( typeof set === 'undefined' )
    return this.isReadOnly;

  this.isReadOnly = !!set;
  this.$.input.prop('disabled', this.isReadOnly);
}
Form.Fields.Switch.prototype.getData = function(){
  var d = {};

  d[this.json.id] = this.get();
  return d;
}
Form.Fields.Switch.prototype.get = function(){
  return ( this.value === undefined && this.json.defaultToFalse === true 
    ? false
    : this.value
  );
}
Form.Fields.Switch.prototype.setData = function( data ){
  var val = data[ this.json.id ];
  this.original = val;
  this.set( val );
}
Form.Fields.Switch.prototype.set = function( val ){
  if( val === "false" ) val = false;
  if( val === "true"  ) val = true;

  this.value = val;
  this.$.input.prop('checked', val);

  this.doChanges();
}
Form.Fields.Switch.prototype.isChanged = function(){
  return (this.get()||false) !== (this.original||false);
}
Form.Fields.Switch.prototype.reset = function(){
  this.set( this.original );
}
Form.Fields.Switch.prototype.clear = function(){
  // nop?
}
Form.Fields.Switch.prototype.applyFieldBinds = function(){
  var self = this;
  var B = this.json.binds;
  if(!B) return;

  B.forEach(function(b){
    if( b.to ){
      var t = self.form._('_'+b.to).get(0);
      // create bind
      t.onChange(function(){
        var get = t.get();
        if( ( b.field && get ? get[b.field] : get ) == b.value ){
          self.do(b.value,b.do, b.to);
        }else{
          self.do(b.value,b.do, b.to, true);
        }
      });
      // apply it
      var get = t.get();
      if( ( b.field && get ? get[b.field] : get ) == b.value ){
        self.do(b.value,b.do, b.to);
      }else{
        self.do(b.value,b.do, b.to, true);
      }
    }else if( b.target ){
      var t = self;

      t.onChange(function(){
        var get = t.get();
        if( ( b.field && get ? get[b.field] : get ) == b.value ){
          self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to);
        }else{
          self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to, true);
        }
      });

      var get = t.get();
      if( ( b.field && get ? get[b.field] : get ) == b.value ){
        self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to);
      }else{
        self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to, true);
      }

    }
  });
}
Form.Fields.Switch.prototype.do = function( value, action, context, undo ){
  var self = this;
  if(!this.state)
    this.state = {};

  // Get previous differences
  var psK = Object.keys(this.state);
  var ps = {}; // previous state
  for( var i = 0 ; i < psK.length ; i++ ){
    ps[this.state[psK[i]]] = true;
  }

  if(undo){
    if(this.state[action+'_'+value+'_'+context]){
      delete this.state[action+'_'+value+'_'+context];
    }else{
      return;
    }
  }else{
    if(!this.state[action+'_'+value+'_'+context]){
      this.state[action+'_'+value+'_'+context] = action;
    }else{
      return;
    }
  }


  // Get current differences
  var csK = Object.keys(this.state);
  var cs = {}; // current state
  for( var i = 0 ; i < csK.length ; i++ ){
    cs[this.state[csK[i]]] = true;
  }

  // Just making bA as a shortcut for bindActions
  var bA = Form.Fields.Switch.bindActions;

  // reset states
  var aK = Object.keys(bA);
  for( var i = 0 ; i < aK.length ; i++ ){
    if( ps[aK[i]] ){      // if in previous
      if( cs[aK[i]] ){    // and in current
        continue;         // same state. do nothing
      }
      bA[aK[i]][1](this); // not in current. undo
    }

    if( cs[aK[i]] ){      // if only in current
      bA[aK[i]][0](this); // apply state
    }
  }
}

Form.Fields.Switch.prototype.doTo = function( target, action, context, undo ){
  var self = this;
  if(!this.targetStates)
    this.targetStates = {};

  if(!this.targetStates[target.type + '_' + target.target])
    this.targetStates[target.type + '_' + target.target] = {};

  // Get previous differences
  var psK = Object.keys(this.targetStates[target.type + '_' + target.target]);
  var ps = {}; // previous state
  for( var i = 0 ; i < psK.length ; i++ ){
    ps[this.targetStates[target.type + '_' + target.target][psK[i]]] = true;
  }

  if(undo){
    if(this.targetStates[target.type + '_' + target.target][action+'_'+context]){
      delete this.targetStates[target.type + '_' + target.target][action+'_'+context];
    }else{
      return;
    }
  }else{
    if(!this.targetStates[target.type + '_' + target.target][action+'_'+context]){
      this.targetStates[target.type + '_' + target.target][action+'_'+context] = action;
    }else{
      return;
    }
  }


  // Get current differences
  var csK = Object.keys(this.targetStates[target.type + '_' + target.target]);
  var cs = {}; // current state
  for( var i = 0 ; i < csK.length ; i++ ){
    cs[this.targetStates[target.type + '_' + target.target][csK[i]]] = true;
  }

  // Just making bA as a shortcut for bindActions
  var bA = Form.Fields.Switch.bindActions;

  // reset states
  var aK = Object.keys(bA);
  for( var i = 0 ; i < aK.length ; i++ ){
    if( ps[aK[i]] ){      // if in previous
      if( cs[aK[i]] ){    // and in current
        continue;         // same state. do nothing
      }
      bA[aK[i]][1](this, target); // not in current. undo
    }

    if( cs[aK[i]] ){      // if only in current
      bA[aK[i]][0](this, target); // apply state
    }
  }
}
Form.Fields.Switch.prototype.validate = function(){
  // stub
}
Form.Fields.Switch.prototype.saveData = function(){
  this.original = this.get();
  this.doChanges();
}
Form.Fields.Switch.prototype.refresh = function(){
  // nop
}
Form.Fields.Switch.prototype.doChanges = function(){
  var changed = this.isChanged();
  var val = this.get();

  if( changed && !this.json.muted ){
    this.$.container.closest('.form-group').addClass('changed');
  }else{
    this.$.container.closest('.form-group').removeClass('changed');
  }

  for( var i = 0 ; i < this.changeListeners.length ; i++ ){
    this.changeListeners[i]( this.json.id, val, changed );
  }
}
Form.Fields.Switch.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];

  this.changeListeners.push( callback );
}
Form.Fields.Switch.bindActions = {
  disable: [
    function( self ){ // Do
      self.$.input.prop('disabled', true);
    },
    function( self ){ // Undo
      self.$.input.prop('disabled', false);
    }
  ],
  enable: [
    function( self ){ // Do
      self.$.input.prop('disabled', false);
    },
    function( self ){ // Undo
      self.$.input.prop('disabled', true);
    }
  ],
  hide: [
    function( self ){ // Do
      self.$.container.parent().addClass('hidden');
    },
    function( self ){ // Undo
      self.$.container.parent().removeClass('hidden');
    }
  ],
  uncheck: [
    function( self ){ // Do
      self.$.input.prop('checked', false);
    },
    function( self ){ // Undo
    }
  ],
  show: [
    function( self, target ){ // Do
      if( target && target.type === 'tab' ){
        self.form.$.container.find('[data-tab-id="'+target.target+'"]').each(function(){
          var $this = $(this);
          var states = JSON.parse( decodeURIComponent($this.attr('data-state-shown') || '') || '[]' );
          if( states.indexOf( self.json.id ) === -1 ){
            states.push( self.json.id );
            $this.attr('data-state-shown', encodeURIComponent(JSON.stringify(states)) );
          }
        });
      }else{
        self.$.container.parent().removeClass('hidden');
      }
    },
    function( self, target ){ // Undo
      if( target && target.type === 'tab' ){
        self.form.$.container.find('[data-tab-id="'+target.target+'"]').each(function(){
          var $this = $(this);
          var states = JSON.parse( decodeURIComponent($this.attr('data-state-shown') || '') || '[]' );
          if( states.indexOf( self.json.id ) > -1 ){
            states.splice( states.indexOf( self.json.id ), 1 );

            if( states.length === 0 ){
              $this.removeAttr('data-state-shown');
            }else{
              $this.attr('data-state-shown', encodeURIComponent(JSON.stringify(states)) );
            }
          }
        });
      }else{
        self.$.container.parent().addClass('hidden');
      }
    }
  ]
}
Form.Fields.Switch.prototype._ = scopeInterface;
Form.Fields.Switch.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('Switch').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};

/**
 * Text
 */

Form.Fields.Text = function Text(scope, container, json) {
	this.scope = scope;
	this.container = container;
	this.json = json;

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;
	this.form = this._("^form").get(0);

	this.value = null;
	this.original = null;

	this.changeListeners = [];
	this._state = {
		readonly: {},
		hidden: {},
	};

	this.init();
};
Form.Fields.Text.prototype.init = function () {
	var html = Form.Template(this.json, {
		data: {
			input: true,
		},
	});

	this.isReadOnly = !!this.json.readOnly;

	this.$.html = $(html);
	if (this.json.visibility === "hidden")
		this.$.container.parent().addClass("hidden");

	this.$.container.append(this.$.html);
	this.$.input = this.$.container.find("input");

	// input mask
	if (this.json.mask) {
		delete this.json.mask;
	}
	if (this.json.mask) {
		if (this.json.mask === "email") {
			Inputmask({ alias: "email", placeholder: "??" }).mask(this.$.input[0]);
		} else {
			Inputmask(this.json.mask).mask(this.$.input[0]);
		}
	}

	this.bind();
	this.i18n();
};
Form.Fields.Text.prototype.bind = function () {
	var self = this;

	this.updatePermissions = (p) => this.checkPermissions(p);
	main.permissions.bind(this.updatePermissions);

	this.$.input.on("input change", function (ev) {
		if (self.json.mask) {
			self.value = this.inputmask.unmaskedvalue().split("??").join("");
		} else {
			self.value = this.value;
		}

		self.validate();

		self.doChanges();
	});
};
Form.Fields.Text.prototype.i18n = function () {
	this.$.html.i18n();
};
Form.Fields.Text.prototype.remove = function () {
	main.permissions.offChange(this.updatePermissions);
};
Form.Fields.Text.prototype.checkPermissions = function (userPermissions) {
	if (!this.json.permissions) {
		return;
	}

	Object.keys(this.json.permissions).forEach((k) => {
		const permission = k;
		const state = this.json.permissions[k];
		const hasPermission = userPermissions.indexOf(permission) > -1;

		if (state === "readonly") {
			this.readonly(!hasPermission, permission);
		}
		if (state === "hidden") {
			this.hidden(!hasPermission, permission);
		}
	});
};
Form.Fields.Text.prototype.hidden = function (set, namespace) {
	if (typeof namespace === "undefined" && typeof set === "undefined") {
		return Object.keys(this._state.hidden).reduce(
			(acc, k) => acc || this._state.hidden[k],
			false
		);
	}

	if (typeof set === "undefined") {
		return this._state.hidden[namespace];
	}

	namespace = namespace == null ? "anon" : namespace;

	this._state.hidden[namespace] = set;

	this.isHidden = Object.keys(this._state.hidden).reduce(
		(acc, k) => acc || this._state.hidden[k],
		false
	);

	if (this.isHidden) {
		this.$.container.addClass("hidden");
	} else {
		this.$.container.removeClass("hidden");
	}
};
Form.Fields.Text.prototype.readonly = function (set, namespace) {
	if (typeof namespace === "undefined" && typeof set === "undefined") {
		return Object.keys(this._state.readonly).reduce(
			(acc, k) => acc || this._state.readonly[k],
			false
		);
	}
	if (typeof set === "undefined") {
		return this._state.readonly[namespace];
	}

	namespace = namespace == null ? "anon" : namespace;

	this._state.readonly[namespace] = set;

	this.isReadOnly = Object.keys(this._state.readonly).reduce(
		(acc, k) => acc || this._state.readonly[k],
		false
	);
	this.$.input.attr("readonly", this.isReadOnly);
};
Form.Fields.Text.prototype.getData = function () {
	var d = {};
	d[this.json.id] = this.get();
	return d;
};
Form.Fields.Text.prototype.get = function () {
	return this.value;
};
Form.Fields.Text.prototype.setData = function (data, preventSave) {
	var val = data[this.json.id];
	if (val === null || val === undefined) return;

	if (!preventSave) this.original = val;

	this.set(val);
};
Form.Fields.Text.prototype.set = function (val, silent) {
	this.value = val;
	this.$.input.val(val);

	if (!silent) this.doChanges();
};
Form.Fields.Text.prototype.isChanged = function () {
	var val = this.get();
	return val !== this.original && !(this.original === null && val === "");
};
Form.Fields.Text.prototype.reset = function () {
	this.set(this.original);
};
Form.Fields.Text.prototype.clear = function () {
	this.value = null;
	this.original = null;

	this.$.input.val("");

	this.clearErrors();
};
Form.Fields.Text.prototype.clearErrors = function () {
	if (!this._tabli)
		this._tabli = $(
			'[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
		).parent();

	var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
	if (cerrors.indexOf(this.json.id) > -1) {
		cerrors.splice(cerrors.indexOf(this.json.id), 1);
		if (cerrors.length > 0) {
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		} else {
			this._tabli.removeAttr("data-validation-error");
		}
	}
	this.$.html.closest(".form-group").removeClass("has-error");
};
Form.Fields.Text.prototype.applyFieldBinds = function () {
	var self = this;
	var B = this.json.binds;
	if (!B) return;

	B.forEach(function (b) {
		if (b.to) {
			var t = self.form._("_" + b.to).get(0);
			// create bind
			t.onChange(function () {
				var get = t.get();
				if (
					Array.isArray(get)
						? get.indexOf(b.value) > -1
						: (b.field && get ? get[b.field] : get) == b.value
				) {
					self.do(b.value, b.do, b.to);
				} else {
					self.do(b.value, b.do, b.to, true);
				}
			});
			// apply it
			var get = t.get();
			if (
				Array.isArray(get)
					? get.indexOf(b.value) > -1
					: (b.field && get ? get[b.field] : get) == b.value
			) {
				self.do(b.value, b.do, b.to);
			} else {
				self.do(b.value, b.do, b.to, true);
			}
		} else if (b.target) {
			var t = self;

			t.onChange(function () {
				var get = t.get();
				if ((b.field && get ? get[b.field] : get) == b.value) {
					self.doTo({ type: b.type || "field", target: b.target }, b.do, b.to);
				} else {
					self.doTo(
						{ type: b.type || "field", target: b.target },
						b.do,
						b.to,
						true
					);
				}
			});

			var get = t.get();
			if ((b.field && get ? get[b.field] : get) == b.value) {
				self.doTo({ type: b.type || "field", target: b.target }, b.do, b.to);
			} else {
				self.doTo(
					{ type: b.type || "field", target: b.target },
					b.do,
					b.to,
					true
				);
			}
		}
	});
};
Form.Fields.Text.prototype.validate = function () {
	var self = this;
	// check if has validation settings
	if (!this.json.validation) return true;

	var errors = []; // i18n keys

	// setup validation elements
	if (!this._tabli)
		this._tabli = $(
			'[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
		).parent();

	var val = this.json.validation;
	var value = this.get();

	// validate empty
	(Array.isArray(val) ? val : [val]).forEach(function (val) {
		if (val.required && (!value || (value + "").trim() === "")) {
			// apply error
			// i18n.t('common.errors.required');
			errors.push("app.errors.required-field");
		} else if (val.regex) {
			// make regexes
			if (!self.regexes) {
				self.regexes = {};

				val.regex.forEach(function (v, k) {
					self.regexes[k] = new RegExp(k);
				});
			}

			var vK = Object.keys(val.regex);
			for (var i = 0; i < vK.length; i++) {
				var k = vK[i];
				var r = self.regexes[k];

				if (!r.test(value)) {
					errors.push(val.regex[k]);
				}
			}
		}

		if (val.custom) {
			(Array.isArray(val.custom) ? val.custom : [val.custom]).forEach(function (
				f
			) {
				var err;
				if (self.form.actions[f]) {
					err = self.form.actions[f](value, self, val);
					if (err) errors.push(err);
				}
			});
		}
	});
	if (errors.length > 0) {
		self.$.container.closestChildren(".for-error").html(
			errors
				.map(function (v) {
					return i18n.t(v);
				})
				.join("<br>")
		);

		this.$.html.closest(".form-group").addClass("has-error");

		var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
		if (cerrors.indexOf(this.json.id) < 0) {
			if (cerrors[0] === "") cerrors = [];
			cerrors.push(this.json.id);
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		}
		return false;
	}

	// unset errors. set success?
	var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
	if (cerrors.indexOf(this.json.id) > -1) {
		cerrors.splice(cerrors.indexOf(this.json.id), 1);
		if (cerrors.length > 0) {
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		} else {
			this._tabli.removeAttr("data-validation-error");
		}
	}
	this.$.html.closest(".form-group").removeClass("has-error");
	return true;
};
Form.Fields.Text.prototype.do = function (value, action, context, undo) {
	console.log(value, action, context, undo);
	var self = this;
	if (!this.state) this.state = {};

	// Get previous differences
	var psK = Object.keys(this.state);
	var ps = {}; // previous state
	for (var i = 0; i < psK.length; i++) {
		ps[this.state[psK[i]]] = true;
	}

	if (undo) {
		if (this.state[action + "_" + value + "_" + context]) {
			delete this.state[action + "_" + value + "_" + context];
		} else {
			return;
		}
	} else {
		if (!this.state[action + "_" + value + "_" + context]) {
			this.state[action + "_" + value + "_" + context] = action;
		} else {
			return;
		}
	}

	// Get current differences
	var csK = Object.keys(this.state);
	var cs = {}; // current state
	for (var i = 0; i < csK.length; i++) {
		cs[this.state[csK[i]]] = true;
	}

	// Just making bA as a shortcut for bindActions
	var bA = Form.Fields.Text.bindActions;

	// reset states
	var aK = Object.keys(bA);
	for (var i = 0; i < aK.length; i++) {
		if (ps[aK[i]]) {
			// if in previous
			if (cs[aK[i]]) {
				// and in current
				continue; // same state. do nothing
			}
			bA[aK[i]][1](this); // not in current. undo
		}

		if (cs[aK[i]]) {
			// if only in current
			bA[aK[i]][0](this); // apply state
		}
	}
};
Form.Fields.Text.prototype.doTo = function (target, action, context, undo) {
	var self = this;
	if (!this.targetStates) this.targetStates = {};

	if (!this.targetStates[target.type + "_" + target.target])
		this.targetStates[target.type + "_" + target.target] = {};

	// Get previous differences
	var psK = Object.keys(this.targetStates[target.type + "_" + target.target]);
	var ps = {}; // previous state
	for (var i = 0; i < psK.length; i++) {
		ps[this.targetStates[target.type + "_" + target.target][psK[i]]] = true;
	}

	if (undo) {
		if (
			this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			]
		) {
			delete this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			];
		} else {
			return;
		}
	} else {
		if (
			!this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			]
		) {
			this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			] = action;
		} else {
			return;
		}
	}

	// Get current differences
	var csK = Object.keys(this.targetStates[target.type + "_" + target.target]);
	var cs = {}; // current state
	for (var i = 0; i < csK.length; i++) {
		cs[this.targetStates[target.type + "_" + target.target][csK[i]]] = true;
	}

	// Just making bA as a shortcut for bindActions
	var bA = Form.Fields.Text.bindActions;

	// reset states
	var aK = Object.keys(bA);
	for (var i = 0; i < aK.length; i++) {
		if (ps[aK[i]]) {
			// if in previous
			if (cs[aK[i]]) {
				// and in current
				continue; // same state. do nothing
			}
			bA[aK[i]][1](this, target); // not in current. undo
		}

		if (cs[aK[i]]) {
			// if only in current
			bA[aK[i]][0](this, target); // apply state
		}
	}
};
Form.Fields.Text.bindActions = {
	disable: [
		function (self) {
			self.$.input.attr("disabled", true);
		},
		function (self) {
			self.$.input.attr("disabled", false);
		},
	],
	hide: [
		function (self) {
			// Do
			self.$.container.parent().addClass("hidden");
		},
		function (self) {
			// Undo
			self.$.container.parent().removeClass("hidden");
		},
	],
	show: [
		function (self, target) {
			// Do
			if (target && target.type === "tab") {
				self.form.$.container
					.find('[data-tab-id="' + target.target + '"]')
					.each(function () {
						var $this = $(this);
						var states = JSON.parse(
							decodeURIComponent($this.attr("data-state-shown") || "") || "[]"
						);
						if (states.indexOf(self.json.id) === -1) {
							states.push(self.json.id);
							$this.attr(
								"data-state-shown",
								encodeURIComponent(JSON.stringify(states))
							);
						}
					});
			} else {
				self.$.container.parent().removeClass("hidden");
			}
		},
		function (self, target) {
			// Undo
			if (target && target.type === "tab") {
				self.form.$.container
					.find('[data-tab-id="' + target.target + '"]')
					.each(function () {
						var $this = $(this);
						var states = JSON.parse(
							decodeURIComponent($this.attr("data-state-shown") || "") || "[]"
						);
						if (states.indexOf(self.json.id) > -1) {
							states.splice(states.indexOf(self.json.id), 1);

							if (states.length === 0) {
								$this.removeAttr("data-state-shown");
							} else {
								$this.attr(
									"data-state-shown",
									encodeURIComponent(JSON.stringify(states))
								);
							}
						}
					});
			} else {
				self.$.container.parent().addClass("hidden");
			}
		},
	],
};
Form.Fields.Text.prototype.doChanges = function () {
	var changed = this.isChanged();
	var val = this.get();

	if (changed && !this.json.muted) {
		this.$.container.closest(".form-group").addClass("changed");
	} else {
		this.$.container.closest(".form-group").removeClass("changed");
	}

	for (var i = 0; i < this.changeListeners.length; i++) {
		this.changeListeners[i](this.json.id, val, changed);
	}
};
Form.Fields.Text.prototype.saveData = function () {
	this.original = this.get();
	this.doChanges();
};
Form.Fields.Text.prototype.refresh = function () {};
Form.Fields.Text.prototype.onChange = function (callback) {
	if (!this.changeListeners) this.changeListeners = [];

	this.changeListeners.push(callback);
};
Form.Fields.Text.prototype._ = scopeInterface;
Form.Fields.Text.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "Text".toLowerCase() ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

/**
 * TextAction
 */

Form.Fields.TextAction = function TextAction(scope, container, json) {
	this.scope = scope;
	this.container = container;
	this.json = json;

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;
	this.form = this._("^form").get(0);

	this.actions = this.form.actions;

	this.value = null;
	this.original = null;

	this.changeListeners = [];
	this._state = {
		readonly: {},
		hidden: {},
	};

	this.init();
};
Form.Fields.TextAction.prototype.init = function () {
	var html = Form.Template(this.json, {
		data: {
			input: true,
		},
	});

	this.$.html = $(html);
	if (this.json.visibility === "hidden")
		this.$.container.parent().addClass("hidden");

	this.$.container.append(this.$.html);
	this.$.input = this.$.container.find("input");
	this.$.button = this.$.container.find("button");

	// input mask
	if (this.json.mask) {
		delete this.json.mask;
	}
	if (this.json.mask) {
		if (this.json.mask === "email") {
			Inputmask({ alias: "email", placeholder: "??" }).mask(this.$.input[0]);
		} else {
			Inputmask(this.json.mask).mask(this.$.input[0]);
		}
	}

	this.bind();
	this.i18n();
};
Form.Fields.TextAction.prototype.i18n = function () {
	this.$.html.i18n();
};
Form.Fields.TextAction.prototype.remove = function () {
	main.permissions.offChange(this.updatePermissions);
};
Form.Fields.TextAction.prototype.checkPermissions = function (userPermissions) {
	if (!this.json.permissions) {
		return;
	}

	Object.keys(this.json.permissions).forEach((k) => {
		const permission = k;
		const state = this.json.permissions[k];
		const hasPermission = userPermissions.indexOf(permission) > -1;

		if (state === "readonly") {
			this.readonly(!hasPermission, permission);
		}
	});
};
Form.Fields.TextAction.prototype.readonly = function (set, namespace) {
	if (typeof namespace === "undefined" && typeof set === "undefined") {
		return Object.keys(this._state.readonly).reduce(
			(acc, k) => acc || this._state.readonly[k],
			false
		);
	}
	if (typeof set === "undefined") {
		return this._state.readonly[namespace];
	}

	namespace = namespace == null ? "anon" : namespace;

	this._state.readonly[namespace] = set;

	this.isReadOnly = Object.keys(this._state.readonly).reduce(
		(acc, k) => acc || this._state.readonly[k],
		false
	);

	this.$.input.attr("readonly", this.isReadOnly);
	this.$.button.attr("disabled", this.isReadOnly);
};
Form.Fields.TextAction.prototype.getData = function () {
	var d = {};
	d[this.json.id] = this.value;
	return d;
};
Form.Fields.TextAction.prototype.bind = function () {
	var self = this;
	this.$.input.on("input change", function (ev) {
		if (self.json.mask) {
			self.value = this.inputmask.unmaskedvalue().split("??").join("");
		} else {
			self.value = this.value;
		}

		self.doChanges();
	});

	this.$.html.find("button").on("click", function (ev) {
		if (self.actions && self.actions[self.json.action]) {
			self.actions[self.json.action](self);
		}
		ev.preventDefault();
	});
	if (this.json.onChange && this.form.actions[this.json.onChange]) {
		this.onChange(function (_, val) {
			if (!self.muted)
				self.form.actions[self.json.onChange](val, self.form, null, self);
		});
	}
};
Form.Fields.TextAction.prototype.get = function () {
	return this.value;
};
Form.Fields.TextAction.prototype.setData = function (data) {
	var val = data[this.json.id];
	this.original = val;
	this.set(val);
};
Form.Fields.TextAction.prototype.set = function (val) {
	this.value = val;
	this.$.input.val(val);

	for (var i = 0; i < this.changeListeners.length; i++) {
		this.changeListeners[i](this.json.id, this.get(), this.isChanged());
	}
};
Form.Fields.TextAction.prototype.reset = function () {
	this.set(this.original);
};
Form.Fields.TextAction.prototype.clear = function () {
	this.value = null;
	this.original = null;

	this.$.html.val("");
};
Form.Fields.TextAction.prototype.applyFieldBinds = function () {};
Form.Fields.TextAction.prototype.validate = function () {
	var self = this;
	// check if has validation settings
	if (!this.json.validation) return true;

	var errors = []; // i18n keys

	// setup validation elements
	if (!this._tabli)
		this._tabli = $(
			'[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
		).parent();

	var val = this.json.validation;
	var value = this.get();

	// validate empty
	if (val.required && (!value || (value + "").trim() === "")) {
		// apply error
		// i18n.t('common.errors.required');
		errors.push("app.errors.required-field");
	} else if (val.regex) {
		// make regexes
		if (!this.regexes) {
			this.regexes = {};

			val.regex.forEach(function (v, k) {
				self.regexes[k] = new RegExp(k);
			});
		}

		var vK = Object.keys(val.regex);
		for (var i = 0; i < vK.length; i++) {
			var k = vK[i];
			var r = self.regexes[k];

			if (!r.test(value)) {
				errors.push(val.regex[k]);
			}
		}
	}

	if (val.custom) {
		(Array.isArray(val.custom) ? val.custom : [val.custom]).forEach(function (
			f
		) {
			var err;
			if (self.form.actions[f]) {
				err = self.form.actions[f](value, self, val);
				if (err) errors.push(err);
			}
		});
	}
	if (errors.length > 0) {
		self.$.container.closestChildren(".for-error").html(
			errors
				.map(function (v) {
					return i18n.t(v);
				})
				.join("<br>")
		);

		this.$.html.closest(".form-group").addClass("has-error");

		var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
		if (cerrors.indexOf(this.json.id) < 0) {
			if (cerrors[0] === "") cerrors = [];
			cerrors.push(this.json.id);
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		}
		return false;
	}

	// unset errors. set success?
	var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
	if (cerrors.indexOf(this.json.id) > -1) {
		cerrors.splice(cerrors.indexOf(this.json.id), 1);
		if (cerrors.length > 0) {
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		} else {
			this._tabli.removeAttr("data-validation-error");
		}
	}
	this.$.html.closest(".form-group").removeClass("has-error");
	return true;
};
Form.Fields.TextAction.prototype.saveData = function () {
	this.original = this.get();
	for (var i = 0; i < this.changeListeners.length; i++) {
		this.changeListeners[i](this.json.id, this.get(), this.isChanged());
	}
};
Form.Fields.TextAction.prototype.refresh = function () {};
Form.Fields.TextAction.prototype.doChanges = function () {
	var changed = this.isChanged();
	var val = this.get();

	if (changed && !this.json.muted) {
		this.$.container.closest(".form-group").addClass("changed");
	} else {
		this.$.container.closest(".form-group").removeClass("changed");
	}

	for (var i = 0; i < this.changeListeners.length; i++) {
		this.changeListeners[i](this.json.id, val, changed);
	}
};
Form.Fields.TextAction.prototype.isChanged = function () {
	if (this.json.muted) return false;

	return this.get() !== this.original;
};
Form.Fields.TextAction.prototype.onChange = function (callback) {
	if (!this.changeListeners) this.changeListeners = [];

	this.changeListeners.push(callback);
};
Form.Fields.TextAction.prototype._ = scopeInterface;
Form.Fields.TextAction.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "TextAction".toLowerCase() ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

/**
 * TextArea
 */

Form.Fields.TextArea = function TextArea(scope, container, json ){
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._('^form').get(0);

  this.value = null;
  this.original = null;

  this.changeListeners = [];

  this.init();
}
Form.Fields.TextArea.prototype.init = function(){
  var html = Form.Template( this.json, {data: {
    input: true
  }});
  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);
  this.$.input = this.$.container.find('textarea');

  this.bind();
  this.i18n();
}
Form.Fields.TextArea.prototype.bind = function(){
  var self = this;
  this.$.input.on('input change', function( ev ){
    self.value = this.value;
    self.doChanges();
  });
}
Form.Fields.TextArea.prototype.i18n = function(){
  this.$.html.i18n();
}
Form.Fields.TextArea.prototype.readonly = function(set){
  if( typeof set === 'undefined' )
    return this.isReadOnly;

  this.isReadOnly = !!set;
  this.$.input.attr('readonly', this.isReadOnly);
}
Form.Fields.TextArea.prototype.getData = function(){
  var d = {};
  d[this.json.id] = this.get();
  return d;
}
Form.Fields.TextArea.prototype.get = function(){
  return this.value;
}
Form.Fields.TextArea.prototype.setData = function( data ){
  this.original = data[this.json.id] || '';
  data[this.json.id] = this.original;
  this.set( this.original );
}
Form.Fields.TextArea.prototype.set = function( val ){
  this.value = val;
  this.$.input.val( val );
  this.doChanges();
}
Form.Fields.TextArea.prototype.isChanged = function(){
  var val = this.get();
  return val !== this.original &&
    !(this.original === null && val === '' );
}
Form.Fields.TextArea.prototype.reset = function(){
  this.set( this.original );
}
Form.Fields.TextArea.prototype.clear = function(){
  this.value = null;
  this.original = null;
  this.$.input.val('');
  this.clearErrors();
}
Form.Fields.TextArea.prototype.clearErrors = function(){
  if( !this._tabli )
    this._tabli = $('[href="#'+this.$.html.closest('.tab-pane').attr('id')+'"]').parent();

  var cerrors = (this._tabli.attr('data-validation-error') || '').split(';');
  if( cerrors.indexOf(this.json.id) > -1 ){
    cerrors.splice(cerrors.indexOf(this.json.id), 1);
    if(cerrors.length > 0){
      this._tabli.attr('data-validation-error', cerrors.join(';') );
    }else{
      this._tabli.removeAttr('data-validation-error');
    }
  }
  this.$.html.closest('.form-group').removeClass('has-error');
}
Form.Fields.TextArea.prototype.applyFieldBinds = function(){
  var self = this;
  var B = this.json.binds;
  if(!B) return;

  B.forEach(function(b){
    if( b.to ){
      var t = self.form._('_'+b.to).get(0);
      // create bind
      t.onChange(function(){
        var get = t.get();
        if( ( b.field && get ? get[b.field] : get ) == b.value ){
          self.do(b.value,b.do, b.to);
        }else{
          self.do(b.value,b.do, b.to, true);
        }
      });
      // apply it
      var get = t.get();
      if( ( b.field && get ? get[b.field] : get ) == b.value ){
        self.do(b.value,b.do, b.to);
      }else{
        self.do(b.value,b.do, b.to, true);
      }
    }else if( b.target ){
      var t = self;

      t.onChange(function(){
        var get = t.get();
        if( ( b.field && get ? get[b.field] : get ) == b.value ){
          self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to);
        }else{
          self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to, true);
        }
      });

      var get = t.get();
      if( ( b.field && get ? get[b.field] : get ) == b.value ){
        self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to);
      }else{
        self.doTo( {type: b.type || 'field', target: b.target}, b.do, b.to, true);
      }

    }
  });
}
Form.Fields.TextArea.prototype.validate = function(){
  // stub
}
Form.Fields.TextArea.prototype.saveData = function(){
  this.original = this.get();
  this.doChanges();
}
Form.Fields.TextArea.prototype.refresh = function(){
}

Form.Fields.TextArea.prototype.do = function( value, action, context, undo ){
  var self = this;
  if(!this.state)
    this.state = {};

  // Get previous differences
  var psK = Object.keys(this.state);
  var ps = {}; // previous state
  for( var i = 0 ; i < psK.length ; i++ ){
    ps[this.state[psK[i]]] = true;
  }

  if(undo){
    if(this.state[action+'_'+value+'_'+context]){
      delete this.state[action+'_'+value+'_'+context];
    }else{
      return;
    }
  }else{
    if(!this.state[action+'_'+value+'_'+context]){
      this.state[action+'_'+value+'_'+context] = action;
    }else{
      return;
    }
  }


  // Get current differences
  var csK = Object.keys(this.state);
  var cs = {}; // current state
  for( var i = 0 ; i < csK.length ; i++ ){
    cs[this.state[csK[i]]] = true;
  }

  // Just making bA as a shortcut for bindActions
  var bA = Form.Fields.TextArea.bindActions;

  // reset states
  var aK = Object.keys(bA);
  for( var i = 0 ; i < aK.length ; i++ ){
    if( ps[aK[i]] ){      // if in previous
      if( cs[aK[i]] ){    // and in current
        continue;         // same state. do nothing
      }
      bA[aK[i]][1](this); // not in current. undo
    }

    if( cs[aK[i]] ){      // if only in current
      bA[aK[i]][0](this); // apply state
    }
  }
}

Form.Fields.TextArea.prototype.doTo = function( target, action, context, undo ){
  var self = this;
  if(!this.targetStates)
    this.targetStates = {};

  if(!this.targetStates[target.type + '_' + target.target])
    this.targetStates[target.type + '_' + target.target] = {};

  // Get previous differences
  var psK = Object.keys(this.targetStates[target.type + '_' + target.target]);
  var ps = {}; // previous state
  for( var i = 0 ; i < psK.length ; i++ ){
    ps[this.targetStates[target.type + '_' + target.target][psK[i]]] = true;
  }

  if(undo){
    if(this.targetStates[target.type + '_' + target.target][action+'_'+context]){
      delete this.targetStates[target.type + '_' + target.target][action+'_'+context];
    }else{
      return;
    }
  }else{
    if(!this.targetStates[target.type + '_' + target.target][action+'_'+context]){
      this.targetStates[target.type + '_' + target.target][action+'_'+context] = action;
    }else{
      return;
    }
  }


  // Get current differences
  var csK = Object.keys(this.targetStates[target.type + '_' + target.target]);
  var cs = {}; // current state
  for( var i = 0 ; i < csK.length ; i++ ){
    cs[this.targetStates[target.type + '_' + target.target][csK[i]]] = true;
  }

  // Just making bA as a shortcut for bindActions
  var bA = Form.Fields.TextArea.bindActions;

  // reset states
  var aK = Object.keys(bA);
  for( var i = 0 ; i < aK.length ; i++ ){
    if( ps[aK[i]] ){      // if in previous
      if( cs[aK[i]] ){    // and in current
        continue;         // same state. do nothing
      }
      bA[aK[i]][1](this, target); // not in current. undo
    }

    if( cs[aK[i]] ){      // if only in current
      bA[aK[i]][0](this, target); // apply state
    }
  }
}
Form.Fields.TextArea.bindActions = {
  disable: [
    function( self ){
      self.$.input.attr('disabled', true);
    },
    function( self ){
      self.$.input.attr('disabled', false);
    }
  ],
  hide: [
    function( self ){ // Do
      self.$.container.parent().addClass('hidden');
    },
    function( self ){ // Undo
      self.$.container.parent().removeClass('hidden');
    }
  ],
  show: [
    function( self, target ){ // Do
      if( target && target.type === 'tab' ){
        self.form.$.container.find('[data-tab-id="'+target.target+'"]').each(function(){
          var $this = $(this);
          var states = JSON.parse( decodeURIComponent($this.attr('data-state-shown') || '') || '[]' );
          if( states.indexOf( self.json.id ) === -1 ){
            states.push( self.json.id );
            $this.attr('data-state-shown', encodeURIComponent(JSON.stringify(states)) );
          }
        });
      }else{
        self.$.container.parent().removeClass('hidden');
      }
    },
    function( self, target ){ // Undo
      if( target && target.type === 'tab' ){
        self.form.$.container.find('[data-tab-id="'+target.target+'"]').each(function(){
          var $this = $(this);
          var states = JSON.parse( decodeURIComponent($this.attr('data-state-shown') || '') || '[]' );
          if( states.indexOf( self.json.id ) > -1 ){
            states.splice( states.indexOf( self.json.id ), 1 );

            if( states.length === 0 ){
              $this.removeAttr('data-state-shown');
            }else{
              $this.attr('data-state-shown', encodeURIComponent(JSON.stringify(states)) );
            }
          }
        });
      }else{
        self.$.container.parent().addClass('hidden');
      }
    }
  ]
}
Form.Fields.TextArea.prototype.doChanges = function(){
  var changed = this.isChanged();
  var val = this.get();

  if( changed && !this.json.muted ){
    this.$.container.closest('.form-group').addClass('changed');
  }else{
    this.$.container.closest('.form-group').removeClass('changed');
  }

  for( var i = 0 ; i < this.changeListeners.length ; i++ ){
    this.changeListeners[i]( this.json.id, val, changed );
  }
}
Form.Fields.TextArea.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];
  this.changeListeners.push( callback );
}
Form.Fields.TextArea.prototype._ = scopeInterface;
Form.Fields.TextArea.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('TextArea').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};

/**
 * TimeInterval
 */

Form.Fields.TimeInterval = function TimeInterval(scope, container, json ){
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._('^form').get(0);

  this.value = null;
  this.original = null;

  this.changeListeners = [];

  this.init();
}
Form.Fields.TimeInterval.prototype.init = function(){
  var html = Form.Template( this.json, {data: {
    input: true
  }});

  this.$.html = $(html);
  if( this.json.visibility === 'hidden' )
    this.$.container.parent().addClass('hidden');;

  this.$.container.append(this.$.html);
  this.$.label = this.$.container.find('label');

  this.table = this.$.container.find('.interval-container > table');
  this.trs = this.table.find('tbody tr');

  this.table.find('[data-weekday]').each(function(){
    var $this = $(this);
    $this.attr('data-i18n', 'components.recurrence.weekdays.'+([
      'sunday','monday','tuesday','wednesday','thursday','friday','saturday'
    ])[$this.data('weekday')]);
  });

  this.tr = this.trs.map(function(){
    return [$(this).find('td.time-block').map(function(){
      return this;
    }).get()];
  }).get();

  this.bind();
  this.i18n();
}
Form.Fields.TimeInterval.prototype.bind = function(){
  var self = this;
  var table = this.table;
  var trs = this.trs;
  var tr = this.tr;


  var mode = 'square';
  var fill = '';

  this.$.html.find('.lock-toggle > i').on('click', function(){
    var $this = $(this);
    var p = $this.parent().parent();
    if( $this.data('id') === 'lock' ){
      p.find('.unlocked-only').removeClass('hidden');
      p.find('.locked-only').addClass('hidden');
      table.removeClass('disabled');
      fill = 'fill';
      self.$.html.find('.fill-toggle > i[data-id="fill"]').addClass('active');
    }else{
      p.find('.unlocked-only').addClass('hidden');
      p.find('.locked-only').removeClass('hidden');
      table.addClass('disabled');
      fill = '';
      self.$.html.find('.fill-toggle > i.active').removeClass('active');
    }
  });

  this.$.html.find('.tools-toggle > i').on('click', function(){
    table.find('td.time-block.selected').removeClass('selected');
  });

  this.$.html.find('.control-toggle > i').on('click', function(){
    var $this = $(this);
    $this.addClass('active').siblings().removeClass('active');
    mode = $this.data('id');
  });

  this.$.html.find('.fill-toggle > i').on('click', function(){
    var $this = $(this);
    var p = $this.parent().parent();
    if( $this.hasClass('active') ){
      fill = '';
      p.find('.unlocked-only').addClass('hidden');
      p.find('.locked-only').removeClass('hidden');
      table.addClass('disabled');
    }else{
      fill = $this.data('id');
      p.find('.unlocked-only').removeClass('hidden');
      p.find('.locked-only').addClass('hidden');
      table.removeClass('disabled');
    }
    $this.toggleClass('active').siblings().removeClass('active');
  });


  var markSeq = function( from_, to_ ){
    var tmp = null;
    if( from_.y > to_.y ){
      tmp = from_;
      from_ = to_;
      to_ = tmp;
    }else if( from_.y === to_.y ){
      if( from_.x > to_.x ){
        tmp = from_;
        from_ = to_;
        to_ = tmp;
      }
    }

    table.find('td').removeClass('selected').removeClass('active');
    state.addClass('selected')

    for( var j = from_.y ; j <= to_.y ; j++ ){
      for( var i = (j===from_.y?from_.x:0) ; i <= (j===to_.y?to_.x:47) ; i++ ){

        if( fill === 'fill' ){
          tr[j][i].classList.add('selected');
        }else if( fill === 'erase' ){
          tr[j][i].classList.remove('selected');
        }else{
          tr[j][i].classList.toggle('selected');
        }
        tr[j][i].classList.add('active');
      }
    }
  }
  var markSquare = function( from_, to_ ){
    var tmp = null;;
    if( from_.y > to_.y ){
      tmp = from_.y;
      from_.y = to_.y;
      to_.y = tmp;
    }
    if( from_.x > to_.x ){
      tmp = from_.x;
      from_.x = to_.x;
      to_.x = tmp;
    }

    table.find('td').removeClass('selected').removeClass('active');
    state.addClass('selected')

    for( var j = from_.y ; j <= to_.y ; j++ ){
      for( var i = from_.x ; i <= to_.x ; i++ ){
        if( fill === 'fill' ){
          tr[j][i].classList.add('selected');
        }else if( fill === 'erase' ){
          tr[j][i].classList.remove('selected');
        }else{
          tr[j][i].classList.toggle('selected');
        }
        tr[j][i].classList.add('active');
      }
    }
  }
  var markLine = function( from_, to_ ){
    var tmp = null;
    to_.y = from_.y;

    if( from_.x > to_.x ){
      tmp = from_.x;
      from_.x = to_.x;
      to_.x = tmp;
    }

    table.find('td').removeClass('selected').removeClass('active');
    state.addClass('selected')

    for( var j = from_.y ; j <= to_.y ; j++ ){
      for( var i = from_.x ; i <= to_.x ; i++ ){
        if( fill === 'fill' ){
          tr[j][i].classList.add('selected');
        }else if( fill === 'erase' ){
          tr[j][i].classList.remove('selected');
        }else{
          tr[j][i].classList.toggle('selected');
        }
        tr[j][i].classList.add('active');
      }
    }
  }

  var onHover = function(e){
    e.preventDefault();
    var self = this;
    var $this = $(this);

    var y = trs.index( this.parentNode );
    var x = tr[y].indexOf(this);

    ({
      square: markSquare,
      seq: markSeq,
      line: markLine
    })[mode]({x:target_x,y:target_y}, {x:x,y:y});

  };
  var target = null;
  var state = null;

  table.find('td.time-block').on('mousedown', function(e){
    e.preventDefault();

    if( table.hasClass('disabled') )
      return;

    target = this;

    target_y = trs.index( this.parentNode );
    target_x = tr[target_y].indexOf(this);

    state = table.find('td.selected');
    table.find('td.time-block').on('mouseover', onHover);
    $(this).trigger('mouseover');

    $(window).one('mouseup', function(e){
      e.preventDefault();
      self.doChanges();
      table.find('td').off('mouseover', onHover);
      table.find('td.active').removeClass('active');
      target = null;
      state = null;
    });
  });

}
Form.Fields.TimeInterval.prototype.i18n = function(){
  this.$.container.find('[data-i18n]').i18n();;
}
Form.Fields.TimeInterval.prototype.getData = function(){
  var d = {};

  var d_ = {};
  this.get().forEach(function( v, i ){
    d_['DayWeek'+i] = v;
  });

  d[this.json.id] = d_;
  return d;
}
Form.Fields.TimeInterval.prototype.get = function(){
  var data = this.tr.reduce(function(p, c){
    var d = [];
    var state = false;
    for( var i = 0 ; i < c.length ; i++ ){
      if( c[i].classList.contains('selected') !== state ){
        d.push( ''+((i/2)|0)+':'+(i%2>0?'30':'00') );
        state = !state;
      }
    }
    if( state ){
      d.push('24:00');
    }

    p.push(d.join(';'));
    return p;
  }, []);

  return data;
}
Form.Fields.TimeInterval.prototype.setData = function( data ){
  var d = [];
  for( var i = 0 ; i < 7 ; i++ ){
    d.push(data[this.json.id]['DayWeek'+i]);
  }

  this.original = d;
  this.set( this.original );
}
Form.Fields.TimeInterval.prototype.set = function( val ){
  // parse stuff
  if(val.length !== 7)
    return;

  var spl = null;
  var splpl = null;
  var tmp = [];
  var d = [];

  for( var i = 0 ; i < val.length ; i++ ){
    spl = val[i].split(';');
    tmp = [];
    if( spl.length > 1 ){
      for( var j = 0 ; j < spl.length ; j++ ){
        splpl = spl[j].split(':');
        tmp.push( ((splpl[0]|0)*2) + (splpl[1]==='30'?1:0) );
      }
    }
    d.push(tmp);
  }

  this.table.find('td.time-block').removeClass('selected');
  for( j = 0 ; j < d.length ; j++ ){
    for( i = 0 ; i < d[j].length ; i+=2 ){
      for( z = d[j][i] ; z < d[j][i+1] ; z++ )
        this.tr[j][z].classList.add('selected');
    }
  }

  this.doChanges();
}
Form.Fields.TimeInterval.prototype.isChanged = function(){
  var val = this.get();
  for( var i = 0 ; i < this.original.length ; i++ ){
    if(this.original[i] !== val[i]){
      return true;
    }
  }
  return false;
}
Form.Fields.TimeInterval.prototype.reset = function(){
  this.set( this.original );
}
Form.Fields.TimeInterval.prototype.clear = function(){
  this.table.find('td.time-block.selected').removeClass('selected');
}
Form.Fields.TimeInterval.prototype.applyFieldBinds = function(){}
Form.Fields.TimeInterval.prototype.validate = function(){
  return true;
}
Form.Fields.TimeInterval.prototype.saveData = function(){
  this.original = this.get();
  this.doChanges();
}
Form.Fields.TimeInterval.prototype.refresh = function(){}
Form.Fields.TimeInterval.prototype.doChanges = function(){
  var changed = this.isChanged();
  var val = this.get();

  if( changed && !this.json.muted ){
    this.$.container.closest('.form-group').addClass('changed');
  }else{
    this.$.container.closest('.form-group').removeClass('changed');
  }

  for( var i = 0 ; i < this.changeListeners.length ; i++ ){
    this.changeListeners[i]( this.json.id, val, changed );
  }
}
Form.Fields.TimeInterval.prototype.onChange = function( callback ){
  if( !this.changeListeners )
    this.changeListeners = [];
  this.changeListeners.push( callback );
}
Form.Fields.TimeInterval.prototype._ = scopeInterface;
Form.Fields.TimeInterval.prototype.is = function(t){
  if( t === '*' )
    return true;
  return (t.toLowerCase() === ('TimeInterval').toLowerCase()
    || t.toLowerCase() === this.json.id.toLowerCase() );
};

/**
 * TimePicker
 */

Form.Fields.TimePicker = function TimePicker(scope, container, json) {
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._("^form").get(0);

  this.value = null;
  this.original = null;

  this.changeListeners = [];

  this.init();
};
Form.Fields.TimePicker.prototype.init = function() {
  var html = Form.Template(this.json, {
    data: {
      input: true
    }
  });

  this.$.html = $(html);
  if (this.json.visibility === "hidden")
    this.$.container.parent().addClass("hidden");

  this.$.container.append(this.$.html);
  this.$.label = this.$.container.find("label");
  this.$.input = this.$.container.find("input");
  this.$.input.clockpicker(
    {
      placement: "bottom",
      align: "left",
      autoclose: true
    }.deepMerge(this.json.opts || {})
  );

  this.bind();

  if (this.json.readOnly) {
    this.readonly(true);
  }
  this.i18n();
};
Form.Fields.TimePicker.prototype.bind = function() {
  var self = this;
  this.$.input.on("change", function(ev) {
    self.value = this.value;
    self.doChanges();
  });
};
Form.Fields.TimePicker.prototype.i18n = function() {
  this.$.label.i18n();
};
Form.Fields.TimePicker.prototype.readonly = function(set) {
  if (typeof set === "undefined") return this.isReadOnly;

  this.isReadOnly = !!set;
  this.$.input.attr("disabled", this.isReadOnly);
  this.$.html.find('button[data-id="close-button"]').attr("disabled", set);
};
Form.Fields.TimePicker.prototype.getData = function() {
  var d = {};
  d[this.json.id] = this.get();
  return d;
};
Form.Fields.TimePicker.prototype.get = function() {
  return this.value;
};
Form.Fields.TimePicker.prototype.setData = function(data) {
  this.original = data[this.json.id] || "";
  data[this.json.id] = this.original;
  this.set(this.original);
};
Form.Fields.TimePicker.prototype.set = function(val) {
  this.value = val;
  this.$.input.val(val);
  this.doChanges();
};
Form.Fields.TimePicker.prototype.isChanged = function() {
  return this.get() !== this.original;
};
Form.Fields.TimePicker.prototype.reset = function() {
  this.set(this.original);
};
Form.Fields.TimePicker.prototype.clear = function() {
  this.value = null;
  this.original = null;
  this.$.input.val("");
};
Form.Fields.TimePicker.prototype.applyFieldBinds = function() {};
Form.Fields.TimePicker.prototype.validate = function() {
  var self = this;

  // check if has validation settings
  if (!this.json.validation) return true;

  var errors = []; // i18n keys

  // setup validation elements
  if (!this._tabli)
    this._tabli = $(
      '[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
    ).parent();

  var val = this.json.validation;
  var value = this.get();

  // validate empty
  if (val.required && (!value || (value + "").trim() === "")) {
    // apply error
    // i18n.t('common.errors.required');
    errors.push("app.errors.required-field");
  }

  if (val.custom) {
    (Array.isArray(val.custom) ? val.custom : [val.custom]).forEach(function(
      f
    ) {
      var err;
      if (self.form.actions[f]) {
        err = self.form.actions[f](value, self, val);
        if (err) errors.push(err);
      }
    });
  }
  if (errors.length > 0) {
    self.$.container.closestChildren(".for-error").html(
      errors
        .map(function(v) {
          return i18n.t(v);
        })
        .join("<br>")
    );

    this.$.html.closest(".form-group").addClass("has-error");

    var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
    if (cerrors.indexOf(this.json.id) < 0) {
      if (cerrors[0] === "") cerrors = [];
      cerrors.push(this.json.id);
      this._tabli.attr("data-validation-error", cerrors.join(";"));
    }
    return false;
  }

  // unset errors. set success?
  var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
  if (cerrors.indexOf(this.json.id) > -1) {
    cerrors.splice(cerrors.indexOf(this.json.id), 1);
    if (cerrors.length > 0) {
      this._tabli.attr("data-validation-error", cerrors.join(";"));
    } else {
      this._tabli.removeAttr("data-validation-error");
    }
  }
  this.$.html.closest(".form-group").removeClass("has-error");
  return true;
};
Form.Fields.TimePicker.prototype.saveData = function() {
  this.original = this.get();
  this.doChanges();
};
Form.Fields.TimePicker.prototype.refresh = function() {};
Form.Fields.TimePicker.prototype.doChanges = function() {
  var changed = this.isChanged();
  var val = this.get();

  if (changed && !this.json.muted) {
    this.$.container.closest(".form-group").addClass("changed");
  } else {
    this.$.container.closest(".form-group").removeClass("changed");
  }

  for (var i = 0; i < this.changeListeners.length; i++) {
    this.changeListeners[i](this.json.id, val, changed);
  }
};
Form.Fields.TimePicker.prototype.onChange = function(callback) {
  if (!this.changeListeners) this.changeListeners = [];
  this.changeListeners.push(callback);
};
Form.Fields.TimePicker.prototype._ = scopeInterface;
Form.Fields.TimePicker.prototype.is = function(t) {
  if (t === "*") return true;
  return (
    t.toLowerCase() === "TimePicker".toLowerCase() ||
    t.toLowerCase() === this.json.id.toLowerCase()
  );
};

/**
 * WYSIWYG
 */

Form.Fields.WYSIWYG = function WYSIWYG(scope, container, json) {
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._("^form").get(0);

  this.value = null;
  this.original = null;

  this.changeListeners = [];

  this.init();
};
Form.Fields.WYSIWYG.prototype.init = function() {
  var self = this;
  var html = Form.Template(this.json, {
    data: {
      input: true
    }
  });

  this.$.html = $(html);
  if (this.json.visibility === "hidden")
    this.$.container.parent().addClass("hidden");

  this.$.container.append(this.$.html);
  this.$input = this.$.container.find("[data-id]");
  var opts = {
    svgPath: "include/plugins/trumbowyg/ui/icons.svg"
  };

  if (this.json.btns) {
    opts.btns = this.json.btns;
  }

  this.trumbowyg = this.$input
    .trumbowyg(opts)
    .on("tbwinit", function() {
      self.isInit = true;
      self.inited();
    })
    .data("trumbowyg");
  this.bind();
  this.i18n();
};
Form.Fields.WYSIWYG.prototype.bind = function() {
  var self = this;
  this.$input.on("tbwchange", function() {
    self.doChanges();
  });
  this.$.container
    .find(".trumbowyg-editor")
    .on("cut paste dragend mouseup", function() {
      self.$.container
        .find("textarea")
        .val(self.$input.html())
        .trigger("keyup");
    });
};
Form.Fields.WYSIWYG.prototype.i18n = function() {
  this.$.html.i18n();
};
Form.Fields.WYSIWYG.prototype.readonly = function(set) {
  if (typeof set === "undefined") return this.isReadOnly;

  this.isReadOnly = !!set;
  this.$input.trumbowyg(this.isReadOnly ? "disable" : "enable");
};
Form.Fields.WYSIWYG.prototype.getData = function() {
  var d = {};
  d[this.json.id] = this.get();
  return d;
};
Form.Fields.WYSIWYG.prototype.get = function() {
  var html = this.$input.trumbowyg("html");
  return this.$input.trumbowyg("html");
};
Form.Fields.WYSIWYG.prototype.setData = function(data) {
  this.original = data[this.json.id] || "";
  data[this.json.id] = this.original;
  this.set(this.original);
};
Form.Fields.WYSIWYG.prototype.set = function(val) {
  var self = this;
  if (!this.isInit) {
    this.onInit(function() {
      self.$input.trumbowyg("html", val || "");
      self.$.container.find("textarea").trigger("keyup");
    });
  } else {
    this.$input.trumbowyg("html", val || "");
    this.$.container.find("textarea").trigger("keyup");
  }
};
Form.Fields.WYSIWYG.prototype.reset = function() {
  this.set(this.original);
};
Form.Fields.WYSIWYG.prototype.clear = function() {
  this.value = null;
  this.original = null;
  this.set(this.value);
  this.clearErrors();
};
Form.Fields.WYSIWYG.prototype.clearErrors = function() {
  if (!this._tabli)
    this._tabli = $(
      '[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
    ).parent();

  var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
  if (cerrors.indexOf(this.json.id) > -1) {
    cerrors.splice(cerrors.indexOf(this.json.id), 1);
    if (cerrors.length > 0) {
      this._tabli.attr("data-validation-error", cerrors.join(";"));
    } else {
      this._tabli.removeAttr("data-validation-error");
    }
  }
  this.$.html.closest(".form-group").removeClass("has-error");
};
Form.Fields.WYSIWYG.prototype.applyFieldBinds = function() {};
Form.Fields.WYSIWYG.prototype.validate = function() {
  // stub
};
Form.Fields.WYSIWYG.prototype.saveData = function() {
  this.original = this.get();
  this.doChanges();
};
Form.Fields.WYSIWYG.prototype.refresh = function() {};
Form.Fields.WYSIWYG.prototype.inited = function() {
  if (!this.initListeners) this.initListeners = [];

  for (i = 0; i < this.initListeners.length; i++) {
    this.initListeners[i]();
  }
};
Form.Fields.WYSIWYG.prototype.onInit = function(callback) {
  if (!this.initListeners) this.initListeners = [];

  this.initListeners.push(callback);
};
Form.Fields.WYSIWYG.prototype.doChanges = function() {
  var changed = this.isChanged();
  var val = this.get();
  if (changed && !this.json.muted) {
    this.$.container.closest(".form-group").addClass("changed");
  } else {
    this.$.container.closest(".form-group").removeClass("changed");
  }

  for (var i = 0; i < this.changeListeners.length; i++) {
    this.changeListeners[i](this.json.id, val, changed);
  }
};
Form.Fields.WYSIWYG.prototype.isChanged = function() {
  return (this.get() + "").trim() !== (this.original + "" || "").trim();
};
Form.Fields.WYSIWYG.prototype.onChange = function(callback) {
  if (!this.changeListeners) this.changeListeners = [];

  this.changeListeners.push(callback);
};
Form.Fields.WYSIWYG.prototype._ = scopeInterface;
Form.Fields.WYSIWYG.prototype.is = function(t) {
  if (t === "*") return true;
  return (
    t.toLowerCase() === "WYSIWYG".toLowerCase() ||
    t.toLowerCase() === this.json.id.toLowerCase()
  );
};

/**  Bar Chart
 *       __
 *      |  |  __
 *  __  |  | |  |  __
 * |  | |  | |  | |  |
 */

Widgets.BarChart = function BarChart(scope, container, json, opts) {
	Widgets.chartProto.call(this);

	this.scope = scope;
	this.opts = opts;
	this.container = container;
	this.json = JSON.simpleCopy(json);
	this.view = this._("^view").get(0);

	if (this.view && this.view.getUrl(this.json.url)) {
		this.url = this.view.getUrl(this.json.url).fillWith(opts);
	} else {
		this.url = this.json.url;
	}

	this.json["boxColor"] =
		this.json["boxColor"] ||
		Widgets.defaultColors[(Math.random() * Widgets.defaultColors.length) | 0];

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;

	this.init();
};
Widgets.BarChart.prototype = Object.create(Widgets.chartProto.prototype);
Widgets.BarChart.prototype.constructor = Widgets.BarChart;

Widgets.BarChart.prototype.initChart = function () {
	var self = this;

	this.$.title.i18n();
	this.$.chart.boxBusy();
	this.deferring = false;

	this.get(function (data) {
		var d = {};
		var colors = null;
		self._data = data;

		// prepare data
		// Handle colors
		if (data["colors"]) {
			colors = JSON.simpleCopy(data["colors"]);
		} else if (self.json["colors"]) {
			colors = JSON.simpleCopy(self.json["colors"]);
		} else {
			colors = JSON.simpleCopy(Widgets.BarChart.defaultColors);
		}

		// Handle color order
		if (data["colorAssign"] || self.json["colorAssign"]) {
			self.cA = data["colorAssign"] || self.json["colorAssign"];
		} else {
			self.cA = "random";
		}
		if (self.cA === "random") {
			shuffle(colors);
		}

		// Handle labels
		if (data["labels-i18n"]) {
			self.i18nLabels = true;
			self.dataLabels = data["labels-i18n"];
		} else if (data["labels"]) {
			self.dataLabels = data["labels"];
		} else if (self.json["labels-i18n"]) {
			self.i18nLabels = true;
			self.dataLabels = self.json["labels-i18n"];
		} else if (self.json["labels"]) {
			self.dataLabels = self.json["labels"];
		} else {
			console.warn("No labels for chart.", self);
		}

		// Handle xLabels
		if (data["xLabels-i18n"]) {
			self.i18nXLabels = true;
			self.labels = data["xLabels-i18n"];
		} else if (data["xLabels"]) {
			self.labels = data["xLabels"];
		} else if (self.json["xLabels-i18n"]) {
			self.i18nXLabels = true;
			self.labels = self.json["xLabels-i18n"];
		} else if (self.json["xLabels"]) {
			self.labels = self.json["xLabels"];
		} else {
			console.warn("No x labels for chart.", self);
		}

		// Handle yLabel
		if (data["yLabel-i18n"]) {
			self.i18nYLabel = true;
			self.yLabel = data["yLabel-i18n"];
		} else if (data["yLabel"]) {
			self.yLabel = data["yLabel"];
		} else if (self.json["yLabel-i18n"]) {
			self.i18nYLabel = true;
			self.yLabel = self.json["yLabel-i18n"];
		} else if (self.json["yLabel"]) {
			self.yLabel = self.json["yLabel"];
		} else {
		}

		// Handle xLabel
		if (data["xLabel-i18n"]) {
			self.i18nXLabel = true;
			self.xLabel = data["xLabel-i18n"];
		} else if (data["xLabel"]) {
			self.xLabel = data["xLabel"];
		} else if (self.json["xLabel-i18n"]) {
			self.i18nXLabel = true;
			self.xLabel = self.json["xLabel-i18n"];
		} else if (self.json["xLabel"]) {
			self.xLabel = self.json["xLabel"];
		} else {
		}

		d.labels = self.labels;

		// construct dataSets

		d.datasets = [];

		if (
			data.data.length === 0 ||
			data.data.reduce(function (a, v) {
				return a && v.length === 0;
			}, true)
		) {
			self.error("no-data");
			return;
		}

		d.datasets.push({
			type: "bar",
			marker: {
				color: colors.map(function (v) {
					return v[0];
				}),
			},
			x: self.dataLabels.map(function (v) {
				return self.i18nLabels ? i18n.t(v) : v;
			}),
			y: data.data.map(function (v) {
				return v[0];
			}),
		});

		self._d = d;

		self.isReady = true;

		if (self.$.html.is(":visible")) {
			self.renderChart();
		} else {
			self.deferring = true;
		}
	});
};

Widgets.BarChart.prototype.renderChart = function () {
	var self = this;

	var d3 = Plotly.d3;

	var p_width = 100,
		p_height = 35;

	var gd3 = d3.select(self.$.chart[0]).style({
		width: "100%",
		height: "100%",
	});

	this.$.chart.parent().addClass("for-chart");

	var gd = gd3.node();

	var layout = {
		margin: {
			t: 20,
			l: 40 + (this.yLabel ? 20 : 0),
			r: 20,
			b: null,
			pad: 4,
		},
		legend: {
			x: 0,
			y: 1,
			traceorder: "normal",
			font: {
				family: "sans-serif",
				size: 12,
				color: "#000",
			},
			bgcolor: "rgba(240,240,240,.4)",
			bordercolor: "rgba(240,240,240,.8)",
			borderwidth: 2,
		},
	};

	if (this.xLabel) {
		layout.xaxis = {};
		if (this.i18nXLabel) {
			layout.xaxis.title = i18n.t(this.xLabel);
		} else {
			layout.xaxis.title = this.xLabel;
		}
	}

	if (this.yLabel) {
		layout.yaxis = {};
		if (this.i18nYLabel) {
			layout.yaxis.title = i18n.t(this.yLabel);
		} else {
			layout.yaxis.title = this.yLabel;
		}
	}

	Plotly.newPlot(gd, self._d.datasets, layout, {
		modeBarButtonsToRemove: ["sendDataToCloud", "lasso2d", "select2d"],
		displaylogo: false,
	});

	if (this.legendHidden) this.$.html.find("g.legend").hide();

	this.$.chart.boxUnBusy();
	this.$.title.i18n();
};
Widgets.BarChart.prototype.i18n = function () {
	if (!this.isReady) return;

	var self = this;

	for (var i = 0; i < this._d.datasets.length; i++) {
		this._d.datasets[i].x = this.dataLabels.map(function (v) {
			return self.i18nLabels ? i18n.t(v) : v;
		});
	}

	if (this.$.chart.is(":visible")) {
		this.renderChart();
	} else {
		this.deferring = true;
	}
};
Widgets.BarChart.prototype._ = scopeInterface;
Widgets.BarChart.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "BarChart".toLowerCase() ||
		t.toLowerCase() === "chart" ||
		t.toLowerCase() === "widget" ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};
Widgets.BarChart.defaultColors = JSON.simpleCopy(Widgets.defaultColorPairs);

/** HTML Template widget
 *   ________
 *  | <html> |
 *  |   ...  |
 *  | </html>|
 *  |________|
 *
 */

Widgets.d3Chart = function d3Chart(scope, container, json, opts) {
	this.scope = scope;
	this.opts = opts;
	this.container = container;
	this.json = JSON.simpleCopy(json);
	this.view = this._("^view").get(0);
	this.actions = this.view.Actions.widgets;

	if (this.view && this.view.getUrl(this.json.url)) {
		this.url = this.view.getUrl(this.json.url).fillWith(opts);
	} else {
		this.url = this.json.url;
	}

	this.json["boxColor"] =
		this.json["boxColor"] ||
		Widgets.defaultColors[(Math.random() * Widgets.defaultColors.length) | 0];

	this.$ = {};
	this.$.container = $(this.container);
	this.$.container.data("componentRef", this);
	this.$.html = null;

	this.d3 = {
		container: d3.select(this.container),
	};

	this.init();
};
Widgets.d3Chart.prototype.init = function () {
	var html = Widgets.Template(this.json, {
		data: {
			chart: true,
		},
	});

	this.$.html = $(html);
	this.$.container.append(this.$.html);

	this.$.chart = this.$.html.find(".chart");
	this.$.body = this.$.html.find(".box-body");
	this.$.title = this.$.html.find(".chart-title");

	this.template = Handlebars.compile(this.json.templates.join(""));

	this.bind();

	this.preInit = false;
	//this.initChart();
};
Widgets.d3Chart.prototype.initChart = function () {
	var self = this;

	this.$.title.i18n();
	this.$.chart.boxBusy();

	this.get(function (data) {
		var d = JSON.simpleCopy(data);

		if (self.json.data) {
			d.data.deepMerge(self.json.data);
		}

		self.data = d;

		self.$.chart.empty();
		self.div = document.createElement("div");
		self.$.div = $(self.div);
		self.$.chart.append(self.$.div);
		self.$.chart.attr("style", "min-height: 60px;");

		var $html = self.template(d.data);

		self.$.div.append($html);

		self.$.chart.boxUnBusy();
		self.bindActions();
		self.i18n();
	});
};
Widgets.d3Chart.prototype.update = function () {
	this.$.chart.empty();
	this.initChart();
};
Widgets.d3Chart.prototype.setData = function (data) {
	this._d = data;
};
Widgets.d3Chart.prototype.get = function (callback) {
	var self = this;

	Tools.Ajax.defaultGet(this.url)
		.then(function (data) {
			callback(data);
		})
		.then(function (err) {
			self.error(err.status);
		});
};
Widgets.d3Chart.prototype.error = function (err) {
	this.$.chart.boxUnBusy();
	err = Errors({
		type: "Widget",
		status: err,
	});
	this.$.chart.append(err.html);
	this.bindErrors();
	this.$.title
		.closest(".box-header")
		.children(".box-tools")
		.find(".badge")
		.remove();

	this.$.title
		.closest(".box-header")
		.children(".box-tools")
		.prepend(
			'<span data-i18n="' +
				err.opts["title-i18n"] +
				'" class="badge label-' +
				err.opts.severity +
				'"></span>'
		)
		.i18n();

	if (this.collapsed === "auto") this.$.body.hide();

	this.$.title.i18n();
};
Widgets.d3Chart.prototype.bind = function () {
	var self = this;
	this.collapsed = "auto";
	this.$.html
		.find(".body-toggle")
		.off()
		.on("click", function () {
			var sc = self.collapsed;
			if (sc === "closed" || (sc === "auto" && self.$.body.is(":hidden"))) {
				self.collapsed = "open";
				$(this).attr("data-collapsed", "open");
				self.$.body.slideDown(300);
			} else if (
				sc === "open" ||
				(sc === "auto" && !self.$.body.is(":hidden"))
			) {
				self.collapsed = "closed";
				$(this).attr("data-collapsed", "closed");
				self.$.body.slideUp(300);
			}
		})
		.on("contextmenu", function (ev) {
			self.collapsed = "auto";
			$(this).attr("data-collapsed", "auto");
			ev.preventDefault();
		});
	this.$.html
		.find(".chart-refresh")
		.off()
		.on("click", function () {
			self.update();
		});
};
Widgets.d3Chart.prototype.bindErrors = function () {
	var self = this;
	this.$.div
		.find(".closebtn")
		.off()
		.on("click", function () {
			self.$.html.find(".body-toggle").trigger("click");
		});
	this.$.div
		.find(".retrybtn")
		.off()
		.on("click", function () {
			self.$.html.find(".chart-refresh").trigger("click");
		});
};
Widgets.d3Chart.prototype.bindActions = function () {
	var self = this;

	this.$.html
		.find("[data-action]")
		.off()
		.on("click", function () {
			// get action here
			var action = self.actions[$(this).data("action")];
			action(
				self.data.data[$(this).closest("tr").data("row-id")],
				self.data.data,
				self,
				$(this).closest("tr")
			);
		});
};
Widgets.d3Chart.prototype.i18n = function () {
	this.$.html.i18n();
};
Widgets.d3Chart.prototype.refresh = function () {
	if (!this.preInit) {
		if (this.$.container.is(":visible")) {
			this.preInit = true;
			this.initChart();
		}
	}
	// update every x seconds
	// if not visible (diferent view in focus, minimized) s et needsRefresh
	// if needs-Refresh, get new data
};
Widgets.d3Chart.prototype._ = scopeInterface;
Widgets.d3Chart.prototype.is = function (t) {
	if (t === "*") return true;

	return (
		t.toLowerCase() === "d3Chart".toLowerCase() ||
		t.toLowerCase() === "chart" ||
		t.toLowerCase() === "widget" ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};
/**
 *
 *
 *
 *
 * */
Widgets.d3ChartABDias = function d3ChartABDias(scope, container, json, opts) {
	var self = this;
	this.scope = scope;
	this.opts = opts;
	this.container = container;
	this.json = JSON.simpleCopy(json);
	this.view = this._("^view").get(0);
	this.actions = this.view.Actions.widgets;

	if (this.view && this.view.getUrl(this.json.url)) {
		this.url = this.view.getUrl(this.json.url).fillWith(opts);
	} else {
		this.url = this.json.url;
	}

	this.json["boxColor"] =
		this.json["boxColor"] ||
		Widgets.defaultColors[(Math.random() * Widgets.defaultColors.length) | 0];

	this.$ = {};
	this.$.container = $(this.container);
	this.$.container.data("componentRef", this);
	this.$.html = null;

	this.d3 = {
		container: d3.select(this.container),
	};

	var dimensions = self.container.getBoundingClientRect();

	self.height = dimensions.height;
	self.width = dimensions.width;
	self.d3.container
		.select(".graph")
		.attr("width", self.width)
		.attr("height", self.height);
	self.margin = [10, 10, 40, 80];

	this.init();
};
Widgets.d3ChartABDias.prototype.init = function () {
	var html = Widgets.Template(this.json, {
		data: {
			chart: true,
		},
	});

	this.$.html = $(html);
	this.$.container.append(this.$.html);

	this.$.chart = this.$.html.find(".chart");
	this.$.body = this.$.html.find(".box-body");
	this.$.title = this.$.html.find(".chart-title");

	this.bind();

	this.preInit = false;
	//this.initChart();
};
Widgets.d3ChartABDias.prototype.initChart = function () {
	var self = this;

	this.$.title.i18n();
	this.$.chart.boxBusy();

	this.get(function (data) {
		var d = JSON.simpleCopy(data);

		if (self.json.data) {
			d.data.deepMerge(self.json.data);
		}

		self.data = d;

		self.$.chart.empty();
		self.div = document.createElement("div");
		self.$.div = $(self.div);
		self.$.chart.append(self.$.div);
		self.$.chart.attr("style", "min-height: 60px;");

		var $html = self.template(d.data);

		self.$.div.append($html);

		self.$.chart.boxUnBusy();
		self.bindActions();
		self.i18n();
	});
};
Widgets.d3ChartABDias.prototype.drawChart = function () {
	const self = this;
	// Draw
	self.drawBody =
		self.drawBody ||
		((data) => {
			const { iWidth, iHeight, margin } = self;

			const root = self.d3.container.select(".graph");
			root.selectAll("*").remove();
			const bgs = root
				.append("g")
				.attr("class", "backgrounds")
				.attr("transform", `translate(${margin[3]},${margin[0]})`);
			root.append("g").attr("class", "xAxis");
			root.append("g").attr("class", "yAxis");
			root
				.append("g")
				.attr("class", "bands")
				.attr("transform", `translate(${margin[3]},${margin[0]})`);
			root
				.append("g")
				.attr("class", "g")
				.attr("transform", `translate(${margin[3]},${margin[0]})`);

			const marks = root
				.append("g")
				.attr("class", "marks")
				.attr("transform", `translate(${margin[3]},${margin[0]})`);

			const g = root.select(".g");

			let scale = d3
				.scaleLinear()
				.range([0, iWidth])
				.domain([0, globalRules.days.days]);

			let scalePosition = d3
				.scaleBand()
				.rangeRound([0, iHeight])
				.domain(data.map((d) => d.id));

			scalePosition.paddingOuter(0.2).paddingInner(0.4);

			let join = g.selectAll("rect").data(data);

			// Draw bars
			g.selectAll("rect.amount")
				.data(data)
				.enter()
				.append("rect")
				.style("fill", "#225588")
				.attr("class", "amount")
				.attr("width", (d) => scale(d.amount))
				.attr("height", scalePosition.bandwidth())
				.attr("transform", (d) => `translate(0,${scalePosition(d.id)})`)
				.on("mouseover", function (d) {
					this.style.fill = "#bb4444";
				})
				.on("mouseout", function (d) {
					this.style.fill = "#225588";
				});

			// Draw addbars
			g.selectAll("rect.add")
				.data(data)
				.enter()
				.append("rect")
				.style("fill", "#22aadd")
				.attr("class", "add")
				.attr("width", (d) => scale(d.add))
				.attr("height", scalePosition.bandwidth())
				.attr(
					"transform",
					(d) => `translate(${scale(d.amount)},${scalePosition(d.id)})`
				);

			// Draw separators
			join
				.enter()
				.append("path")
				.attr("stroke", "black")
				.attr("shape-rendering", "crispEdges")
				.attr("d", (d, i) => `M0 ${scalePosition.step() * i} H ${iWidth}`);

			function makeMark(x, y) {
				return `M${x},${y}L${x - 6},${y - 8}L${x + 6},${y - 8}`;
			}

			function makeMarkDown(x, y) {
				return `M${x},${y}L${x + 6},${y + 8}L${x - 6},${y + 8}`;
			}

			var alerts = marks
				.selectAll(".mark")
				.data(
					data.flatMap((d) =>
						d.rules.flatMap((r) =>
							r.alerts.map((a) => ({
								id: d.id,
								rule: r,
								alert: a,
							}))
						)
					)
				)
				.enter();

			alerts
				.append("path")
				.attr("class", "mark")
				.attr("fill", "red")
				.attr("d", (d, i) => makeMark(scale(d.alert), scalePosition(d.id)));
			alerts
				.append("path")
				.attr("class", "mark")
				.attr("fill", "red")
				.attr("d", (d, i) =>
					makeMarkDown(
						scale(d.alert),
						scalePosition(d.id) + scalePosition.bandwidth()
					)
				);

			let yAxis = d3.axisLeft(scalePosition);
			let xAxis = d3.axisBottom(scale).ticks(8);

			let yAxisContainer = root
				.select(".yAxis")
				.style("transform", `translate(${margin[3]}px, ${margin[0]}px)`)
				.transition()
				.call(yAxis);

			let xAxisContainer = root
				.select(".xAxis")
				.style(
					"transform",
					`translate(${margin[3]}px, ${iHeight + margin[0]}px)`
				)
				.transition()
				.call(xAxis);

			var xBands = d3
				.axisBottom(scale)
				.ticks(8)
				.tickSize(-iHeight)
				.tickFormat("");

			root
				.select(".bands")
				.append("g")
				.attr("class", "grid")
				.attr("transform", "translate(0," + iHeight + ")")
				.call(xBands);

			let = root.select(".backgrounds");

			var greenBox = bgs
				.append("rect")
				.attr("x", scale(2))
				.attr("y", 0)
				.attr("width", scale(5) - scale(2))
				.attr("height", iHeight)
				.attr("fill", "#66bb2b")
				.attr("opacity", 0.3);

			var redBox = bgs
				.append("rect")
				.attr("x", scale(5))
				.attr("y", 0)
				.attr("width", scale(globalRules.days.days) - scale(5))
				.attr("height", iHeight)
				.attr("fill", "#ff532b")
				.attr("opacity", 0.3);
		});

	self.drawBody(self._d);
};

Widgets.d3ChartABDias.prototype.update = function () {
	this.$.chart.empty();
	this.initChart();
};
Widgets.d3ChartABDias.prototype.setData = function (data) {
	this._d = data;
};
Widgets.d3ChartABDias.prototype.get = function (callback) {
	var self = this;

	Tools.Ajax.defaultGet(this.url)
		.then(function (data) {
			callback(data);
		})
		.then(function (err) {
			self.error(err.status);
		});
};
Widgets.d3ChartABDias.prototype.error = function (err) {
	this.$.chart.boxUnBusy();
	err = Errors({
		type: "Widget",
		status: err,
	});
	this.$.chart.append(err.html);
	this.bindErrors();
	this.$.title
		.closest(".box-header")
		.children(".box-tools")
		.find(".badge")
		.remove();

	this.$.title
		.closest(".box-header")
		.children(".box-tools")
		.prepend(
			'<span data-i18n="' +
				err.opts["title-i18n"] +
				'" class="badge label-' +
				err.opts.severity +
				'"></span>'
		)
		.i18n();

	if (this.collapsed === "auto") this.$.body.hide();

	this.$.title.i18n();
};
Widgets.d3ChartABDias.prototype.bind = function () {
	var self = this;
	this.collapsed = "auto";
	const getHMargin = (_) => self.margin[1] + self.margin[3];
	const getVMargin = (_) => self.margin[0] + self.margin[2];

	const resizeObserver = new ResizeObserver((entries) => {
		for (const entry of entries) {
			if (entry.contentBoxSize) {
				self.height = entry.contentBoxSize.blockSize;
				self.width = entry.contentBoxSize.inlineSize;
			} else {
				self.height = entry.contentRect.height;
				self.width = entry.contentRect.width;
			}
			self.iWidth = self.width - getHMargin();
			self.iHeight = self.height - getVMargin();
		}
		self.d3.container
			.select(".graph")
			.attr("width", self.width)
			.attr("height", self.height);

		self.refresh();
	});
	resizeObserver.observe(self.container);

	this.$.html
		.find(".body-toggle")
		.off()
		.on("click", function () {
			var sc = self.collapsed;
			if (sc === "closed" || (sc === "auto" && self.$.body.is(":hidden"))) {
				self.collapsed = "open";
				$(this).attr("data-collapsed", "open");
				self.$.body.slideDown(300);
			} else if (
				sc === "open" ||
				(sc === "auto" && !self.$.body.is(":hidden"))
			) {
				self.collapsed = "closed";
				$(this).attr("data-collapsed", "closed");
				self.$.body.slideUp(300);
			}
		})
		.on("contextmenu", function (ev) {
			self.collapsed = "auto";
			$(this).attr("data-collapsed", "auto");
			ev.preventDefault();
		});
	this.$.html
		.find(".chart-refresh")
		.off()
		.on("click", function () {
			self.update();
		});
};
Widgets.d3ChartABDias.prototype.bindErrors = function () {
	var self = this;
	this.$.div
		.find(".closebtn")
		.off()
		.on("click", function () {
			self.$.html.find(".body-toggle").trigger("click");
		});
	this.$.div
		.find(".retrybtn")
		.off()
		.on("click", function () {
			self.$.html.find(".chart-refresh").trigger("click");
		});
};
Widgets.d3ChartABDias.prototype.bindActions = function () {
	var self = this;

	this.$.html
		.find("[data-action]")
		.off()
		.on("click", function () {
			// get action here
			var action = self.actions[$(this).data("action")];
			action(
				self.data.data[$(this).closest("tr").data("row-id")],
				self.data.data,
				self,
				$(this).closest("tr")
			);
		});
};
Widgets.d3ChartABDias.prototype.i18n = function () {
	this.$.html.i18n();
};
Widgets.d3ChartABDias.prototype.refresh = function () {
	if (!this.preInit) {
		if (this.$.container.is(":visible")) {
			this.preInit = true;
			this.initChart();
		}
	}
	// update every x seconds
	// if not visible (diferent view in focus, minimized) s et needsRefresh
	// if needs-Refresh, get new data
};
Widgets.d3ChartABDias.prototype._ = scopeInterface;
Widgets.d3ChartABDias.prototype.is = function (t) {
	if (t === "*") return true;

	return (
		t.toLowerCase() === "d3ChartABDias".toLowerCase() ||
		t.toLowerCase() === "chart" ||
		t.toLowerCase() === "widget" ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

/**  Grouped Bar Chart
 *
 */
Widgets.GroupedBarChart = function GroupedBarChart(
	scope,
	container,
	json,
	opts
) {
	Widgets.chartProto.call(this);

	this.scope = scope;
	this.opts = opts;
	this.container = container;
	this.json = JSON.simpleCopy(json);
	this.view = this._("^view").get(0);

	if (this.view && this.view.getUrl(this.json.url)) {
		this.url = this.view.getUrl(this.json.url).fillWith(opts);
	} else {
		this.url = this.json.url;
	}

	this.json["boxColor"] =
		this.json["boxColor"] ||
		Widgets.defaultColors[(Math.random() * Widgets.defaultColors.length) | 0];

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;

	this.init();
};
Widgets.GroupedBarChart.prototype = Object.create(Widgets.chartProto.prototype);
Widgets.GroupedBarChart.prototype.constructor = Widgets.GroupedBarChart;

Widgets.GroupedBarChart.prototype.initChart = function () {
	var self = this;

	this.$.title.i18n();
	this.$.chart.boxBusy();
	this.deferring = false;

	this.get(function (data) {
		var d = {};
		var colors = null;

		// prepare data
		// Handle colors
		if (data["colors"]) {
			colors = data["colors"].slice();
		} else if (self.json["colors"]) {
			colors = self.json["colors"].slice();
		} else {
			colors = Widgets.GroupedBarChart.defaultColors.slice();
		}

		// Handle color order
		if (data["colorAssign"] || self.json["colorAssign"]) {
			self.cA = data["colorAssign"] || self.json["colorAssign"];
		} else {
			self.cA = "randomStart";
		}
		if (self.cA === "random") {
			shuffle(colors);
		} else if (self.cA === "randomStart") {
			shift(colors);
		}

		// Handle labels
		if (data["labels-i18n"]) {
			self.i18nLabels = true;
			self.dataLabels = data["labels-i18n"];
		} else if (data["labels"]) {
			self.dataLabels = data["labels"];
		} else if (self.json["labels-i18n"]) {
			self.i18nLabels = true;
			self.dataLabels = self.json["labels-i18n"];
		} else if (self.json["labels"]) {
			self.dataLabels = self.json["labels"];
		} else {
			console.warn("No labels for chart.", self);
		}

		// Handle xLabels
		if (data["xLabels-i18n"]) {
			self.i18nXLabels = true;
			self.labels = data["xLabels-i18n"];
		} else if (data["xLabels"]) {
			self.labels = data["xLabels"];
		} else if (self.json["xLabels-i18n"]) {
			self.i18nXLabels = true;
			self.labels = self.json["xLabels-i18n"];
		} else if (self.json["xLabels"]) {
			self.labels = self.json["xLabels"];
		} else {
			console.warn("No x labels for chart.", self);
		}

		// Handle yLabel
		if (data["yLabel-i18n"]) {
			self.i18nYLabel = true;
			self.yLabel = data["yLabel-i18n"];
		} else if (data["yLabel"]) {
			self.yLabel = data["yLabel"];
		} else if (self.json["yLabel-i18n"]) {
			self.i18nYLabel = true;
			self.yLabel = self.json["yLabel-i18n"];
		} else if (self.json["yLabel"]) {
			self.yLabel = self.json["yLabel"];
		} else {
		}

		// Handle xLabel
		if (data["xLabel-i18n"]) {
			self.i18nXLabel = true;
			self.xLabel = data["xLabel-i18n"];
		} else if (data["xLabel"]) {
			self.xLabel = data["xLabel"];
		} else if (self.json["xLabel-i18n"]) {
			self.i18nXLabel = true;
			self.xLabel = self.json["xLabel-i18n"];
		} else if (self.json["xLabel"]) {
			self.xLabel = self.json["xLabel"];
		} else {
		}

		if (self.i18nXLabels) {
			d.labels = self.labels.map(function (v) {
				return i18n.t(v);
			});
		} else {
			d.labels = self.labels;
		}

		if (
			data.data.length === 0 ||
			data.data.reduce(function (a, v) {
				return a && v.length === 0;
			}, true)
		) {
			self.error("no-data");
			return;
		}

		// construct dataSets
		d.datasets = [];

		for (var i = 0; i < data.data.length; i++) {
			d.datasets.push({
				type: "bar",
				"label-i18n": self.dataLabels[i],
				name: self.i18nLabels ? i18n.t(self.dataLabels[i]) : self.dataLabels[i],
				marker: {
					color: colors[i],
					size: 6,
				},
				x: d.labels,
				y: data.data[i].map(function (v, i) {
					return v;
				}),
			});
		}

		// init chart
		self._d = d;

		self.isReady = true;

		if (self.$.chart.is(":visible")) {
			self.renderChart();
		} else {
			self.deferring = true;
		}
	});
};
Widgets.GroupedBarChart.prototype.renderChart = function () {
	var self = this;

	var d3 = Plotly.d3;

	var p_width = 100,
		p_height = 35;

	var gd3 = d3.select(self.$.chart[0]).style({
		width: "100%",
		height: "100%",
	});

	this.$.chart.parent().addClass("for-chart");

	var gd = gd3.node();

	var layout = {
		hovermode: "closest",
		barmode: "group",
		margin: {
			t: 20,
			l: 40 + (this.yLabel ? 20 : 0),
			r: 20,
			b: 40,
			pad: 4,
		},
		legend: {
			x: 0,
			y: 1,
			traceorder: "normal",
			font: {
				family: "sans-serif",
				size: 12,
				color: "#000",
			},
			bgcolor: "rgba(240,240,240,.4)",
			bordercolor: "rgba(240,240,240,.8)",
			borderwidth: 2,
		},
	};

	if (this.xLabel) {
		layout.xaxis = {};
		if (this.i18nXLabel) {
			layout.xaxis.title = i18n.t(this.xLabel);
		} else {
			layout.xaxis.title = this.xLabel;
		}
	}

	if (this.yLabel) {
		layout.yaxis = {};
		if (this.i18nYLabel) {
			layout.yaxis.title = i18n.t(this.yLabel);
		} else {
			layout.yaxis.title = this.yLabel;
		}
	}

	Plotly.newPlot(gd, self._d.datasets, layout, {
		modeBarButtonsToRemove: ["sendDataToCloud", "lasso2d", "select2d"],
		displaylogo: false,
	});

	if (this.legendHidden) this.$.html.find("g.legend").hide();

	this.$.chart.boxUnBusy();
	this.$.title.i18n();
};
Widgets.GroupedBarChart.prototype.i18n = function () {
	if (!this.isReady) return;

	var self = this;

	if (this.i18nXLabels) {
		for (var i = 0; i < this._d.labels.length; i++) {
			this._d.labels[i] = i18n.t(this.labels[i]);
		}

		for (var i = 0; i < this._d.datasets.length; i++) {
			this._d.datasets[i].x = this._d.labels;
		}
	}

	if (this.i18nLabels) {
		for (var i = 0; i < this._d.datasets.length; i++) {
			this._d.datasets[i].name = i18n.t(this._d.datasets[i]["label-i18n"]);
		}
	}

	if (this.$.chart.is(":visible")) {
		this.renderChart();
	} else {
		this.deferring = true;
	}
};
Widgets.GroupedBarChart.prototype._ = scopeInterface;
Widgets.GroupedBarChart.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "GroupedBarChart".toLowerCase() ||
		t.toLowerCase() === "chart" ||
		t.toLowerCase() === "widget" ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};
Widgets.GroupedBarChart.defaultColors = Widgets.defaultColors.slice();

/** HTML Template widget
 *   ________
 *  | <html> |
 *  |   ...  |
 *  | </html>|
 *  |________|
 *
 */

Widgets.HTMLContainer = function HTMLContainer(scope, container, json, opts) {
	this.scope = scope;
	this.opts = opts;
	this.container = container;
	this.json = JSON.simpleCopy(json);
	this.view = this._("^view").get(0);
	this.actions = this.view.Actions.widgets;

	if (this.view && this.view.getUrl(this.json.url)) {
		this.url = this.view.getUrl(this.json.url).fillWith(opts);
	} else {
		this.url = this.json.url;
	}

	this.json["boxColor"] =
		this.json["boxColor"] ||
		Widgets.defaultColors[(Math.random() * Widgets.defaultColors.length) | 0];

	this.$ = {};
	this.$.container = $(this.container);
	this.$.container.data("componentRef", this);
	this.$.html = null;

	this.init();
};
Widgets.HTMLContainer.prototype.init = function () {
	var html = Widgets.Template(this.json, {
		data: {
			chart: true,
		},
	});

	this.$.html = $(html);
	this.$.container.append(this.$.html);

	this.$.chart = this.$.html.find(".chart");
	this.$.body = this.$.html.find(".box-body");
	this.$.title = this.$.html.find(".chart-title");

	this.template = Handlebars.compile(this.json.templates.join(""));

	this.bind();

	this.preInit = false;
	//this.initChart();
};
Widgets.HTMLContainer.prototype.initChart = function () {
	var self = this;

	this.$.title.i18n();
	this.$.chart.boxBusy();

	this.get(function (data) {
		var d = JSON.simpleCopy(data);

		if (self.json.data) {
			d.data.deepMerge(self.json.data);
		}

		self.data = d;

		self.$.chart.empty();
		self.div = document.createElement("div");
		self.$.div = $(self.div);
		self.$.chart.append(self.$.div);
		self.$.chart.attr("style", "min-height: 60px;");

		var $html = self.template(d.data);

		self.$.div.append($html);

		self.$.chart.boxUnBusy();
		self.bindActions();
		self.i18n();
	});
};
Widgets.HTMLContainer.prototype.update = function () {
	this.$.chart.empty();
	this.initChart();
};
Widgets.HTMLContainer.prototype.get = function (callback) {
	var self = this;

	if (!this.url) return callback({});

	Tools.Ajax.defaultGet(this.url)
		.then(function (data) {
			if (self.json.dataCallback && self.actions[self.json.dataCallback]) {
				callback(self.actions[self.json.dataCallback](data));
			} else {
				callback(data);
			}
		})
		.then(function (err) {
			self.error(err.status);
		});
};
Widgets.HTMLContainer.prototype.error = function (err) {
	this.$.chart.boxUnBusy();
	err = Errors({
		type: "Widget",
		status: err,
	});
	this.$.chart.append(err.html);
	this.bindErrors();
	this.$.title
		.closest(".box-header")
		.children(".box-tools")
		.find(".badge")
		.remove();

	this.$.title
		.closest(".box-header")
		.children(".box-tools")
		.prepend(
			'<span data-i18n="' +
				err.opts["title-i18n"] +
				'" class="badge label-' +
				err.opts.severity +
				'"></span>'
		)
		.i18n();

	if (this.collapsed === "auto") this.$.body.hide();

	this.$.title.i18n();
};
Widgets.HTMLContainer.prototype.bind = function () {
	var self = this;
	this.collapsed = "auto";
	this.$.html
		.find(".body-toggle")
		.off()
		.on("click", function () {
			var sc = self.collapsed;
			if (sc === "closed" || (sc === "auto" && self.$.body.is(":hidden"))) {
				self.collapsed = "open";
				$(this).attr("data-collapsed", "open");
				self.$.body.slideDown(300);
			} else if (
				sc === "open" ||
				(sc === "auto" && !self.$.body.is(":hidden"))
			) {
				self.collapsed = "closed";
				$(this).attr("data-collapsed", "closed");
				self.$.body.slideUp(300);
			}
		})
		.on("contextmenu", function (ev) {
			self.collapsed = "auto";
			$(this).attr("data-collapsed", "auto");
			ev.preventDefault();
		});
	this.$.html
		.find(".chart-refresh")
		.off()
		.on("click", function () {
			self.update();
		});
};
Widgets.HTMLContainer.prototype.bindErrors = function () {
	var self = this;
	this.$.div
		.find(".closebtn")
		.off()
		.on("click", function () {
			self.$.html.find(".body-toggle").trigger("click");
		});
	this.$.div
		.find(".retrybtn")
		.off()
		.on("click", function () {
			self.$.html.find(".chart-refresh").trigger("click");
		});
};
Widgets.HTMLContainer.prototype.bindActions = function () {
	var self = this;

	this.$.html
		.find("[data-action]")
		.off()
		.on("click", function () {
			// get action here
			var action = self.actions[$(this).data("action")];
			action(
				self.data.data[$(this).closest("tr").data("row-id")],
				self.data.data,
				self,
				$(this).closest("tr")
			);
		});
};
Widgets.HTMLContainer.prototype.i18n = function () {
	this.$.html.i18n();
};
Widgets.HTMLContainer.prototype.refresh = function () {
	if (!this.preInit) {
		if (this.$.container.is(":visible")) {
			this.preInit = true;
			this.initChart();
		}
	}
	// update every x seconds
	// if not visible (diferent view in focus, minimized) s et needsRefresh
	// if needs-Refresh, get new data
};
Widgets.HTMLContainer.prototype._ = scopeInterface;
Widgets.HTMLContainer.prototype.is = function (t) {
	if (t === "*") return true;

	return (
		t.toLowerCase() === "HTMLContainer".toLowerCase() ||
		t.toLowerCase() === "chart" ||
		t.toLowerCase() === "widget" ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

/**  Line Chart
 *          ____
 *  __  _/\/    \
 *    \/  /\_/\
 *  __/\_/     \_
 */
Widgets.LineChart = function LineChart(scope, container, json, opts) {
	Widgets.chartProto.call(this);

	this.scope = scope;
	this.opts = opts;
	this.container = container;
	this.json = JSON.simpleCopy(json);
	this.view = this._("^view").get(0);

	if (this.view && this.view.getUrl(this.json.url)) {
		this.url = this.view.getUrl(this.json.url).fillWith(opts);
	} else {
		this.url = this.json.url;
	}

	this.json["boxColor"] =
		this.json["boxColor"] ||
		Widgets.defaultColors[(Math.random() * Widgets.defaultColors.length) | 0];

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;

	this.init();
};
Widgets.LineChart.prototype = Object.create(Widgets.chartProto.prototype);
Widgets.LineChart.prototype.constructor = Widgets.LineChart;

Widgets.LineChart.prototype.initChart = function () {
	var self = this;

	this.$.title.i18n();
	this.$.chart.boxBusy();
	this.deferring = false;

	this.get(function (data) {
		var d = {};
		var colors = null;

		// prepare data
		// Handle colors
		if (data["colors"]) {
			colors = data["colors"].slice();
		} else if (self.json["colors"]) {
			colors = self.json["colors"].slice();
		} else {
			colors = Widgets.LineChart.defaultColors.slice();
		}

		// Handle color order
		if (data["colorAssign"] || self.json["colorAssign"]) {
			self.cA = data["colorAssign"] || self.json["colorAssign"];
		} else {
			self.cA = "random";
		}
		if (self.cA === "random") {
			shuffle(colors);
		}

		// Handle labels
		if (data["labels-i18n"]) {
			self.i18nLabels = true;
			self.dataLabels = data["labels-i18n"];
		} else if (data["labels"]) {
			self.dataLabels = data["labels"];
		} else if (self.json["labels-i18n"]) {
			self.i18nLabels = true;
			self.dataLabels = self.json["labels-i18n"];
		} else if (self.json["labels"]) {
			self.dataLabels = self.json["labels"];
		} else {
			console.warn("No labels for chart.", self);
		}

		// Handle xLabels
		if (data["xLabels-i18n"]) {
			self.i18nXLabels = true;
			self.labels = data["xLabels-i18n"];
		} else if (data["xLabels"]) {
			self.labels = data["xLabels"];
		} else if (self.json["xLabels-i18n"]) {
			self.i18nXLabels = true;
			self.labels = self.json["xLabels-i18n"];
		} else if (self.json["xLabels"]) {
			self.labels = self.json["xLabels"];
		} else {
			console.warn("No x labels for chart.", self);
		}

		// Handle yLabel
		if (data["yLabel-i18n"]) {
			self.i18nYLabel = true;
			self.yLabel = data["yLabel-i18n"];
		} else if (data["yLabel"]) {
			self.yLabel = data["yLabel"];
		} else if (self.json["yLabel-i18n"]) {
			self.i18nYLabel = true;
			self.yLabel = self.json["yLabel-i18n"];
		} else if (self.json["yLabel"]) {
			self.yLabel = self.json["yLabel"];
		} else {
		}

		// Handle xLabel
		if (data["xLabel-i18n"]) {
			self.i18nXLabel = true;
			self.xLabel = data["xLabel-i18n"];
		} else if (data["xLabel"]) {
			self.xLabel = data["xLabel"];
		} else if (self.json["xLabel-i18n"]) {
			self.i18nXLabel = true;
			self.xLabel = self.json["xLabel-i18n"];
		} else if (self.json["xLabel"]) {
			self.xLabel = self.json["xLabel"];
		} else {
		}

		if (self.i18nXLabels) {
			d.labels = self.labels.map(function (v) {
				return i18n.t(v);
			});
		} else {
			d.labels = self.labels;
		}

		if (
			data.data.length === 0 ||
			data.data.reduce(function (a, v) {
				return a && v.length === 0;
			}, true)
		) {
			self.error("no-data");
			return;
		}

		// construct dataSets
		d.datasets = [];

		for (var i = 0; i < data.data.length; i++) {
			d.datasets.push({
				mode: "lines+markers",
				"label-i18n": self.dataLabels[i],
				name: self.i18nLabels ? i18n.t(self.dataLabels[i]) : self.dataLabels[i],
				line: {
					color: colors[i],
					width: 2,
				},
				marker: {
					color: colors[i],
					size: 6,
				},
				x: data.data[i].map(function (v, i) {
					return i;
				}),
				y: data.data[i].map(function (v, i) {
					return v;
				}),
			});
		}

		// init chart
		self._d = d;

		self.isReady = true;

		if (self.$.chart.is(":visible")) {
			self.renderChart();
		} else {
			self.deferring = true;
		}
	});
};
Widgets.LineChart.prototype.renderChart = function () {
	var self = this;

	var d3 = Plotly.d3;

	var p_width = 100,
		p_height = 35;

	var gd3 = d3.select(self.$.chart[0]).style({
		width: "100%",
		height: "100%",
	});

	this.$.chart.parent().addClass("for-chart");

	var gd = gd3.node();

	var layout = {
		hovermode: "closest",
		margin: {
			t: 20,
			l: 40 + (this.yLabel ? 20 : 0),
			r: 20,
			b: 40,
			pad: 4,
		},
		legend: {
			x: 0,
			y: 1,
			traceorder: "normal",
			font: {
				family: "sans-serif",
				size: 12,
				color: "#000",
			},
			bgcolor: "rgba(240,240,240,.4)",
			bordercolor: "rgba(240,240,240,.8)",
			borderwidth: 2,
		},
	};

	if (this.xLabel) {
		layout.xaxis = {};
		if (this.i18nXLabel) {
			layout.xaxis.title = i18n.t(this.xLabel);
		} else {
			layout.xaxis.title = this.xLabel;
		}
	}

	if (this.yLabel) {
		layout.yaxis = {};
		if (this.i18nYLabel) {
			layout.yaxis.title = i18n.t(this.yLabel);
		} else {
			layout.yaxis.title = this.yLabel;
		}
	}

	Plotly.newPlot(gd, self._d.datasets, layout, {
		modeBarButtonsToRemove: ["sendDataToCloud", "lasso2d", "select2d"],
		displaylogo: false,
	});

	if (this.legendHidden) this.$.html.find("g.legend").hide();

	this.$.chart.boxUnBusy();
	this.$.title.i18n();
};
Widgets.LineChart.prototype.i18n = function () {
	if (!this.isReady) return;
	if (this.i18nLabels) {
		for (var i = 0; i < this._d.datasets.length; i++) {
			this._d.datasets[i].name = i18n.t(this._d.datasets[i]["label-i18n"]);
		}
	}

	if (this.i18nXLabel) {
		for (var i = 0; i < this._d.datasets.length; i++) {
			this._d.labels[i] = i18n.t(this.labels[i]);
		}
	}

	if (this.$.chart.is(":visible")) {
		this.renderChart();
	} else {
		this.deferring = true;
	}
};
Widgets.LineChart.prototype._ = scopeInterface;
Widgets.LineChart.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "LineChart".toLowerCase() ||
		t.toLowerCase() === "chart" ||
		t.toLowerCase() === "widget" ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};
Widgets.LineChart.defaultColors = Widgets.defaultColors.slice();

/**  Pie Chart
 *
 *     3.14
 *
 */

Widgets.PieChart = function PieChart(scope, container, json, opts) {
	Widgets.chartProto.call(this);

	this.scope = scope;
	this.opts = opts;
	this.container = container;
	this.json = JSON.simpleCopy(json);
	this.view = this._("^view").get(0);

	if (this.view && this.view.getUrl(this.json.url)) {
		this.url = this.view.getUrl(this.json.url).fillWith(opts);
	} else {
		this.url = this.json.url;
	}

	this.json["boxColor"] =
		this.json["boxColor"] ||
		Widgets.defaultColors[(Math.random() * Widgets.defaultColors.length) | 0];

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;

	this.init();
};
Widgets.PieChart.prototype = Object.create(Widgets.chartProto.prototype);
Widgets.PieChart.prototype.constructor = Widgets.PieChart;

Widgets.PieChart.prototype.initChart = function (callback) {
	var self = this;

	this.$.title.i18n();
	this.$.chart.boxBusy();
	this.deferring = false;

	this.get(function (data) {
		var d = [];
		var colors = null;

		// prepare data
		// Handle colors
		if (data["colors"]) {
			colors = JSON.simpleCopy(data["colors"]);
		} else if (self.json["colors"]) {
			colors = JSON.simpleCopy(self.json["colors"]);
		} else {
			colors = JSON.simpleCopy(Widgets.PieChart.defaultColors);
		}

		// Handle color order
		if (data["colorAssign"] || self.json["colorAssign"]) {
			self.cA = data["colorAssign"] || self.json["colorAssign"];
		} else {
			self.cA = "randomStart";
		}
		if (self.cA === "random") {
			shuffle(colors);
		} else if (self.cA === "randomStart") {
			colors = shear(colors, 3);
			shift(colors);
		}

		// Handle labels
		if (data["labels-i18n"]) {
			self.i18nLabels = true;
			self.dataLabels = data["labels-i18n"];
		} else if (data["labels"]) {
			self.dataLabels = data["labels"];
		} else if (self.json["labels-i18n"]) {
			self.i18nLabels = true;
			self.dataLabels = self.json["labels-i18n"];
		} else if (self.json["labels"]) {
			self.dataLabels = self.json["labels"];
		} else {
			console.warn("No labels for chart.", self);
		}

		if (data.data.length === 0) {
			self.error("no-data");
			return;
		}

		// construct dataSets
		for (var i = 0; i < data.data.length; i++) {
			d.push({
				label: self.i18nLabels
					? i18n.t(self.dataLabels[i])
					: self.dataLabels[i],
				"label-i18n": self.dataLabels[i],
				color: colors[i],
				highlight: colors[i],
				value: data.data[i],
			});
		}

		// init chart
		self._d = d;

		self.isReady = true;

		if (self.$.chart.is(":visible")) {
			self.renderChart();
		} else {
			self.deferring = true;
		}
	});
};
Widgets.PieChart.prototype.renderChart = function () {
	var self = this;

	var d3 = Plotly.d3;

	var p_width = 100,
		p_height = 35;

	var gd3 = d3.select(self.$.chart[0]).style({
		width: "100%",
		height: "100%",
	});

	this.$.chart.parent().addClass("for-chart");

	var gd = gd3.node();

	var d = [
		{
			values: [],
			labels: [],
			textposition: "outside",
			marker: {
				colors: [],
			},
			type: "pie",
		},
	];
	self._d.forEach(function (dd) {
		d[0].values.push(Array.isArray(dd.value) ? dd.value[0] : dd.value);
		d[0].labels.push(dd.label);
		d[0].marker.colors.push(dd.color);
	});

	var layout = {
		margin: {
			t: 40,
			l: 40,
			r: 40,
			b: 40,
			pad: 4,
		},
		legend: {
			x: 0,
			y: 1,
			traceorder: "normal",
			font: {
				family: "sans-serif",
				size: 12,
				color: "#000",
			},
			bgcolor: "rgba(240,240,240,.4)",
			bordercolor: "rgba(240,240,240,.8)",
			borderwidth: 2,
		},
	};

	Plotly.newPlot(gd, d, layout, {
		modeBarButtonsToRemove: ["sendDataToCloud", "lasso2d", "select2d"],
		displaylogo: false,
	});

	if (this.legendHidden) this.$.html.find("g.legend").hide();

	this.$.chart.boxUnBusy();
	this.$.title.i18n();
};
Widgets.PieChart.prototype.i18n = function () {
	if (!this.isReady) return;
	if (this.i18nLabels) {
		for (var i = 0; i < this._d.length; i++) {
			this._d[i].label = i18n.t(this._d[i]["label-i18n"]);
		}
	}

	if (this.$.chart.is(":visible")) {
		this.renderChart();
	} else {
		this.deferring = true;
	}
};
Widgets.PieChart.prototype._ = scopeInterface;
Widgets.PieChart.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "PieChart".toLowerCase() ||
		t.toLowerCase() === "chart" ||
		t.toLowerCase() === "widget" ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};
Widgets.PieChart.defaultColors = JSON.simpleCopy(Widgets.colors2);

/** Table/List chart hybrid
 *   ________
 *  |__|__|__|
 *  |__|_____|
 *  |__|_____|
 *  |__|_____|
 *
 */

Widgets.TableList = function TableList(scope, container, json, opts) {
	this.scope = scope;
	this.opts = opts;
	this.container = container;
	this.json = JSON.simpleCopy(json);
	this.view = this._("^view").get(0);
	this.actions = this.view.Actions.widgets;

	if (this.view && this.view.getUrl(this.json.url)) {
		this.url = this.view.getUrl(this.json.url).fillWith(opts);
	} else {
		this.url = this.json.url;
	}

	this.json["boxColor"] =
		this.json["boxColor"] ||
		Widgets.defaultColors[(Math.random() * Widgets.defaultColors.length) | 0];

	this.$ = {};
	this.$.container = $(this.container);
	this.$.container.data("componentRef", this);
	this.$.html = null;

	this.init();
};
Widgets.TableList.prototype.init = function () {
	var html = Widgets.Template(this.json, {
		data: {
			chart: true,
		},
	});

	this.$.html = $(html);
	this.$.container.append(this.$.html);

	this.$.chart = this.$.html.find(".chart");
	this.$.body = this.$.html.find(".box-body");
	this.$.title = this.$.html.find(".chart-title");

	this.template = Handlebars.compile(this.json.templates.join(""));

	this.bind();

	this.preInit = false;
	//this.initChart();
};
Widgets.TableList.prototype.initChart = function () {
	var self = this;

	this.table = document.createElement("table");
	this.table.className =
		"table table-condensed table-striped table-responsive table-hover";

	this.$.table = $(this.table);
	this.$.chart.append(this.$.table);

	this.$.title.i18n();

	this.$.chart.boxBusy();

	this.updating = true;

	this.get(function (data) {
		var d = JSON.simpleCopy(data);
		var i;

		if (
			data.data.length === 0 ||
			data.data.reduce(function (a, v) {
				return a && v.length === 0;
			}, true)
		) {
			self.error("no-data");
			return;
		}

		if (self.json.data) {
			if (self.json.data.length !== d.data.length) {
				console.log("Diferently sized arrays for data.", self);
			}

			for (i = 0; i < self.json.data.length; i++) {
				if (d.data[i]) {
					d.data[i].deepMerge(self.json.data[i]);
				} else {
					console.log("Missing data " + i);
				}
			}
		}

		self.data = d;

		i = 0;
		var $html = $(
			d.data
				.map(function (r) {
					i++;
					return (
						'<tr data-row-id="' + (i - 1) + '">' + self.template(r) + "</tr>"
					);
				})
				.join("")
		);

		self.$.table.append($html);
		self.updating = false;
		self.$.chart.boxUnBusy();
		self.bindActions();
		self.i18n();
	});
};
Widgets.TableList.prototype.update = function () {
	if (!this.updating) {
		this.updating = true;
		this.$.chart.empty();
		this.initChart();
	}
};
Widgets.TableList.prototype.get = function (callback) {
	var self = this;

	Tools.Ajax.defaultGet(this.url)
		.then(function (data) {
			callback(data);
		})
		.then(function (err) {
			self.error(err.status);
		});
};
Widgets.TableList.prototype.error = function (err) {
	this.$.chart.boxUnBusy();
	err = Errors({
		type: "Widget",
		status: err,
	});
	this.$.chart.append(err.html);
	this.bindErrors();
	this.$.title
		.closest(".box-header")
		.children(".box-tools")
		.find(".badge")
		.remove();

	this.$.title
		.closest(".box-header")
		.children(".box-tools")
		.prepend(
			'<span data-i18n="' +
				err.opts["title-i18n"] +
				'" class="badge label-' +
				err.opts.severity +
				'"></span>'
		)
		.i18n();

	if (this.collapsed === "auto") this.$.body.hide();

	this.$.title.i18n();
};
Widgets.TableList.prototype.bind = function () {
	var self = this;
	this.collapsed = "auto";
	this.$.html
		.find(".body-toggle")
		.off()
		.on("click", function () {
			var sc = self.collapsed;
			if (sc === "closed" || (sc === "auto" && self.$.body.is(":hidden"))) {
				self.collapsed = "open";
				$(this).attr("data-collapsed", "open");
				self.$.body.slideDown(300);
			} else if (
				sc === "open" ||
				(sc === "auto" && !self.$.body.is(":hidden"))
			) {
				self.collapsed = "closed";
				$(this).attr("data-collapsed", "closed");
				self.$.body.slideUp(300);
			}
		})
		.on("contextmenu", function (ev) {
			self.collapsed = "auto";
			$(this).attr("data-collapsed", "auto");
			ev.preventDefault();
		});
	this.$.html
		.find(".chart-refresh")
		.off()
		.on("click", function () {
			self.update();
		});
};
Widgets.TableList.prototype.bindErrors = function () {
	var self = this;
	this.$.chart
		.find(".closebtn")
		.off()
		.on("click", function () {
			self.$.html.find(".body-toggle").trigger("click");
		});
	this.$.chart
		.find(".retrybtn")
		.off()
		.on("click", function () {
			self.$.html.find(".chart-refresh").trigger("click");
		});
};
Widgets.TableList.prototype.bindActions = function () {
	var self = this;

	this.$.html
		.find("[data-action]")
		.off()
		.on("click", function () {
			// get action here
			var action = self.actions[$(this).data("action")];
			action(
				self.data.data[$(this).closest("tr").data("row-id")],
				self.data.data,
				self,
				$(this).closest("tr")
			);
		});
};
Widgets.TableList.prototype.i18n = function () {
	this.$.html.i18n();
};
Widgets.TableList.prototype.refresh = function () {
	if (!this.preInit) {
		if (this.$.container.is(":visible")) {
			this.preInit = true;
			this.$.chart.empty();
			this.initChart();
		}
	}
	// update every x seconds
	// if not visible (diferent view in focus, minimized) s et needsRefresh
	// if needs-Refresh, get new data
};
Widgets.TableList.prototype._ = scopeInterface;
Widgets.TableList.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "TableList".toLowerCase() ||
		t.toLowerCase() === "chart" ||
		t.toLowerCase() === "widget" ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

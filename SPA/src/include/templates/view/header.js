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

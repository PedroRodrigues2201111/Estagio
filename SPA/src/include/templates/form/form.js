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

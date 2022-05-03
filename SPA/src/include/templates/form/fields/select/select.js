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

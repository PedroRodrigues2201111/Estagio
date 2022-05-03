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
			Inputmask({ alias: "email", placeholder: "¨" }).mask(this.$.input[0]);
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
			self.value = this.inputmask.unmaskedvalue().split("¨").join("");
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

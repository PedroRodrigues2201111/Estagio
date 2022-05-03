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

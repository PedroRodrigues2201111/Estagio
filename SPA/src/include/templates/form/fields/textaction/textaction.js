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
			Inputmask({ alias: "email", placeholder: "¨" }).mask(this.$.input[0]);
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
			self.value = this.inputmask.unmaskedvalue().split("¨").join("");
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

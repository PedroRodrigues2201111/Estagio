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

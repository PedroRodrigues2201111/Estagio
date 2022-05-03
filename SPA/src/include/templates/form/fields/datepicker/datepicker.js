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

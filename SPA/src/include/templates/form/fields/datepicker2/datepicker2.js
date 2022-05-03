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

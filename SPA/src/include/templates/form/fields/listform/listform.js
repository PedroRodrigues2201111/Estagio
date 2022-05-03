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

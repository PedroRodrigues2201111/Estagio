/**
 * Button
 */

Form.Fields.Button = function Button(scope, container, json) {
	this.scope = scope;
	this.container = container;
	this.json = json;

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;
	this.form = this._("^form").get(0);

	this.changeListeners = [];
	this._state = {
		readonly: {},
		hidden: {},
	};

	this.actions = this.form.actions;

	this.init();
};
Form.Fields.Button.prototype.init = function () {
	var html = Form.Template(this.json, {
		data: {
			input: true,
		},
	});

	this.$.html = $(html);
	this.$.button = this.$.html;
	if (this.json.visibility === "hidden")
		this.$.container.parent().addClass("hidden");

	this.$.container.append(this.$.html);
	this.bind();
	this.i18n();
};
Form.Fields.Button.prototype.bind = function () {
	var self = this;

	this.updatePermissions = (p) => this.checkPermissions(p);
	main.permissions.bind(this.updatePermissions);

	this.$.container.find("button").on("click", function (ev) {
		if (self.actions && self.actions[self.json.action]) {
			self.actions[self.json.action](self, self.form);
		}
		ev.preventDefault();
	});
};
Form.Fields.Button.prototype.i18n = function () {
	this.$.html.i18n();
};
Form.Fields.Button.prototype.remove = function () {
	main.permissions.offChange(this.updatePermissions);
};
Form.Fields.Button.prototype.checkPermissions = function (userPermissions) {
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
Form.Fields.Button.prototype.readonly = function (set, namespace) {
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
	this.$.container.find("button").attr("disabled", this.isReadOnly);
};
Form.Fields.Button.prototype.getData = function () {
	// nop
};
Form.Fields.Button.prototype.get = function () {
	// nop
};
Form.Fields.Button.prototype.setData = function () {
	// nop
};
Form.Fields.Button.prototype.set = function () {
	// nop
};
Form.Fields.Button.prototype.reset = function () {};
Form.Fields.Button.prototype.clear = function () {
	// nop
};
Form.Fields.Button.prototype.applyFieldBinds = function () {
	var self = this;
	var B = this.json.binds;
	if (!B) return;

	B.forEach(function (b) {
		var t = self.form._("_" + b.to).get(0);
		// create bind
		t.onChange(function () {
			if (t.get() === b.value) {
				self.do(b.value, b.do, b.to);
			} else {
				self.do(b.value, b.do, b.to, true);
			}
		});
		// apply it
		if (t.get() === b.value) {
			self.do(b.value, b.do, b.to);
		} else {
			self.do(b.value, b.do, b.to, true);
		}
	});
};
Form.Fields.Button.prototype.do = function (value, action, context, undo) {
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
	var bA = Form.Fields.Button.bindActions;

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
Form.Fields.Button.bindActions = {
	disable: [
		function (self) {
			// Do
			self.$.button.prop("disabled", true);
		},
		function (self) {
			// Undo
			self.$.button.prop("disabled", false);
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
Form.Fields.Button.prototype.validate = function () {
	// stub
};
Form.Fields.Button.prototype.saveData = function () {
	this.original = this.get();
	for (var i = 0; i < this.changeListeners.length; i++) {
		this.changeListeners[i](this.json.id, this.get(), this.isChanged());
	}
};
Form.Fields.Button.prototype.refresh = function () {};
Form.Fields.Button.prototype.isChanged = function () {
	return false;
};
Form.Fields.Button.prototype.onChange = function () {
	// nop
};
Form.Fields.Button.prototype._ = scopeInterface;
Form.Fields.Button.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "Button".toLowerCase() ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

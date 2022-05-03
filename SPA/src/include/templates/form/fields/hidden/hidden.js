/**
 * Hidden
 */

Form.Fields.Hidden = function Hidden(scope, container, json) {
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
	this.applyFieldBinds();
};
Form.Fields.Hidden.prototype.init = function () {
	this.$.container.parent().addClass("hidden");
};
Form.Fields.Hidden.prototype.bind = function () {
	// nop
};
Form.Fields.Hidden.prototype.i18n = function () {
	// nop
};
Form.Fields.Hidden.prototype.getData = function () {
	var d = {};
	d[this.json.id] = this.value;
	return d;
};
Form.Fields.Hidden.prototype.get = function () {
	return this.value;
};
Form.Fields.Hidden.prototype.setData = function (data, preventSave) {
	if (!preventSave) this.original = data[this.json.id];

	this.set(this.original);
};
Form.Fields.Hidden.prototype.set = function (val) {
	this.value = val;
	this.doChanges();

	//this.$input.val( val );
};
Form.Fields.Hidden.prototype.isChanged = function () {
	return this.get() !== this.original;
};
Form.Fields.Hidden.prototype.clear = function () {
	this.value = null;
	this.original = null;

	//this.$.html.val('');
};
Form.Fields.Hidden.prototype.validate = function () {
	// stub
};
Form.Fields.Hidden.prototype.saveData = function () {};
Form.Fields.Hidden.prototype.refresh = function () {
	// nop
};
Form.Fields.Hidden.prototype.reset = function () {
	// nop
};
Form.Fields.Hidden.prototype.applyFieldBinds = function () {
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
					self.do(b.do, b.to);
				} else {
					self.do(b.do, b.to, true);
				}
			});
			// apply it
			var get = t.get();
			if ((b.field && get ? get[b.field] : get) == b.value) {
				self.do(b.do, b.to);
			} else {
				self.do(b.do, b.to, true);
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
Form.Fields.Hidden.prototype.do = function (action, context, undo) {
	var self = this;
	if (!this.state) this.state = {};

	// Get previous differences
	var psK = Object.keys(this.state);
	var ps = {}; // previous state
	for (var i = 0; i < psK.length; i++) {
		ps[this.state[psK[i]]] = true;
	}

	if (undo) {
		if (this.state[action + "_" + context]) {
			delete this.state[action + "_" + context];
		} else {
			return;
		}
	} else {
		if (!this.state[action + "_" + context]) {
			this.state[action + "_" + context] = action;
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
	var bA = Form.Fields.Hidden.bindActions;

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
Form.Fields.Hidden.prototype.doTo = function (target, action, context, undo) {
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
	var bA = Form.Fields.Hidden.bindActions;

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
Form.Fields.Hidden.bindActions = {
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
								$this.removeAttribute("data-state-shown");
							} else {
								$this.attr(
									"data-state-shown",
									encodeURIComponent(JSON.stringify(states))
								);
							}
						}
					});
			}
		},
	],
};
Form.Fields.Hidden.prototype.doChanges = function () {
	var changed = this.isChanged();
	var val = this.get();

	for (var i = 0; i < this.changeListeners.length; i++) {
		this.changeListeners[i](this.json.id, val, changed);
	}
};
Form.Fields.Hidden.prototype.onChange = function (callback) {
	if (!this.changeListeners) this.changeListeners = [];

	this.changeListeners.push(callback);
};
Form.Fields.Hidden.prototype._ = scopeInterface;
Form.Fields.Hidden.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "Hidden".toLowerCase() ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

/**
 * Component
 */

Form.Fields.Component = function Component(scope, container, json) {
	this.scope = scope;
	this.container = container;
	this.json = json;

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;
	this.form = this._("^form").get(0);

	this.value = null;
	this.original = null;

	this.components = [];
	this.children = [];

	this.changeListeners = [];

	this.init();
};
Form.Fields.Component.prototype.init = function () {
	var html = Form.Template(this.json, {
		data: {
			input: true,
		},
	});

	this.$.html = $(html);
	if (this.json.visibility === "hidden")
		this.$.container.parent().addClass("hidden");

	this.$.container.append(this.$.html);

	if (this.json.autoInit) {
		this.initContent();
	}

	this.bind();
	this.i18n();
};
Form.Fields.Component.prototype.initContent = function (info) {
	var self = this;
	info = info || this.json.info;

	this.$.container.find("[data-component]").each(function () {
		var $this = $(this);
		var instance = $this.data("component");
		var comp = JSON.simpleCopy(window.Instances[instance]);

		if (comp === false) {
			console.error(`Component ${instance} not found`);
		}

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

		if (
			comp.override &&
			self.form.view.Actions.overrides &&
			self.form.view.Actions.overrides[comp.override]
		) {
			try {
				comp = self.form.view.Actions.overrides[comp.override].call(self, comp);
			} catch (e) {
				console.error(e);
			}
		}

		try {
			var component = new tmplt(self, this, comp.opts, info || self.scope.opts);
			self.components.push(component);
			self.children.push(component);
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
};
Form.Fields.Component.prototype.bind = function () {
	var self = this;
};
Form.Fields.Component.prototype.i18n = function () {
	this.$.html.i18n();
};
Form.Fields.Component.prototype.getData = function () {
	var d = {};

	if (!this.json.noData) d[this.json.id] = this.get();

	return d;
};
Form.Fields.Component.prototype.get = function () {
	var d = {};
	this.children.forEach(function (c) {
		if (c.getData) d[c.json.id] = c.getData();
	});
	return d;
};
Form.Fields.Component.prototype.setData = function (data) {
	// this inits component?
	var d = data[this.json.id];

	if (d) this.set(d);
};
Form.Fields.Component.prototype.set = function (val) {
	var self = this;
	// init here

	for (var i = 0; i < this.children.length; i++) {
		if (this.children[i].applyData)
			this.children[i].applyData(val[this.children[i].json.id]);
	}
};
Form.Fields.Component.prototype.isChanged = function () {
	for (var i = 0; i < this.children.length; i++) {
		if (this.children[i].isChanged & this.children[i].isChanged()) return true;
	}
	return false;
};
Form.Fields.Component.prototype.reset = function () {
	this.children.forEach(function (c) {
		if (c.reset) c.reset();
	});
};
Form.Fields.Component.prototype.clear = function () {
	this.children.forEach(function (c) {
		if (c.clear) c.clear();
	});
};
Form.Fields.Component.prototype.applyFieldBinds = function () {};
Form.Fields.Component.prototype.validate = function () {
	this.children.forEach(function (c) {
		if (c.validate) if (!c.validate()) return false;
	});
	return true;
};
Form.Fields.Component.prototype.saveData = function () {
	this.children.forEach(function (c) {
		if (c.saveData) c.saveData();
	});
};
Form.Fields.Component.prototype.refresh = function () {
	this.children.forEach(function (c) {
		if (c.refresh) c.refresh();
	});
};
Form.Fields.Component.prototype.onChange = function (callback) {
	if (!this.changeListeners) this.changeListeners = [];

	this.changeListeners.push(callback);
};
Form.Fields.Component.prototype._ = scopeInterface;
Form.Fields.Component.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "Component".toLowerCase() ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

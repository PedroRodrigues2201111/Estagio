/**
 * Image
 */

Form.Fields.Image = function Image(scope, container, json) {
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
Form.Fields.Image.prototype.init = function () {
	var html = Form.Template(this.json, {
		data: {
			input: true,
		},
	});

	this.$.html = $(html);
	if (this.json.visibility === "hidden")
		this.$.container.parent().addClass("hidden");

	if (this.json.css) {
		this.$.container.css(this.json.css);
	}

	this.$.container.append(this.$.html);
	this.i18n();
};
Form.Fields.Image.prototype.bind = function () {
	// nop
};
Form.Fields.Image.prototype.i18n = function () {
	this.$.html.i18n();
};
Form.Fields.Image.prototype.getData = function () {
	var d = {};
	d[this.json.id] = this.value;
	return d;
};
Form.Fields.Image.prototype.get = function () {
	return this.value;
};
Form.Fields.Image.prototype.setData = function (data, preventSave) {
	var val = data[this.json.id];
	if (!preventSave) this.original = val;

	this.set(val);
};
Form.Fields.Image.prototype.set = function (val) {
	this.value = val;
	this.$.container
		.find(".form-control-image")
		.attr(
			"src",
			this.json.src === "data" ? "data:image/png;base64," + val : val
		);
};
Form.Fields.Image.prototype.isChanged = function () {
	return this.get() !== this.original;
};
Form.Fields.Image.prototype.clear = function () {
	this.value = null;
	this.original = null;
	this.set("");
};
Form.Fields.Image.prototype.applyFieldBinds = function () {};
Form.Fields.Image.prototype.validate = function () {
	// stub
};
Form.Fields.Image.prototype.saveData = function () {};
Form.Fields.Image.prototype.refresh = function () {
	// nop
};
Form.Fields.Image.prototype.reset = function () {
	// nop
};
Form.Fields.Image.prototype.onChange = function (callback) {
	if (!this.changeListeners) this.changeListeners = [];

	this.changeListeners.push(callback);
};
Form.Fields.Image.prototype._ = scopeInterface;
Form.Fields.Image.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "Image".toLowerCase() ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

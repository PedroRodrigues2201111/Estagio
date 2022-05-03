/** HTML Template widget
 *   ________
 *  | <html> |
 *  |   ...  |
 *  | </html>|
 *  |________|
 *
 */

Widgets.HTMLContainer = function HTMLContainer(scope, container, json, opts) {
	this.scope = scope;
	this.opts = opts;
	this.container = container;
	this.json = JSON.simpleCopy(json);
	this.view = this._("^view").get(0);
	this.actions = this.view.Actions.widgets;

	if (this.view && this.view.getUrl(this.json.url)) {
		this.url = this.view.getUrl(this.json.url).fillWith(opts);
	} else {
		this.url = this.json.url;
	}

	this.json["boxColor"] =
		this.json["boxColor"] ||
		Widgets.defaultColors[(Math.random() * Widgets.defaultColors.length) | 0];

	this.$ = {};
	this.$.container = $(this.container);
	this.$.container.data("componentRef", this);
	this.$.html = null;

	this.init();
};
Widgets.HTMLContainer.prototype.init = function () {
	var html = Widgets.Template(this.json, {
		data: {
			chart: true,
		},
	});

	this.$.html = $(html);
	this.$.container.append(this.$.html);

	this.$.chart = this.$.html.find(".chart");
	this.$.body = this.$.html.find(".box-body");
	this.$.title = this.$.html.find(".chart-title");

	this.template = Handlebars.compile(this.json.templates.join(""));

	this.bind();

	this.preInit = false;
	//this.initChart();
};
Widgets.HTMLContainer.prototype.initChart = function () {
	var self = this;

	this.$.title.i18n();
	this.$.chart.boxBusy();

	this.get(function (data) {
		var d = JSON.simpleCopy(data);

		if (self.json.data) {
			d.data.deepMerge(self.json.data);
		}

		self.data = d;

		self.$.chart.empty();
		self.div = document.createElement("div");
		self.$.div = $(self.div);
		self.$.chart.append(self.$.div);
		self.$.chart.attr("style", "min-height: 60px;");

		var $html = self.template(d.data);

		self.$.div.append($html);

		self.$.chart.boxUnBusy();
		self.bindActions();
		self.i18n();
	});
};
Widgets.HTMLContainer.prototype.update = function () {
	this.$.chart.empty();
	this.initChart();
};
Widgets.HTMLContainer.prototype.get = function (callback) {
	var self = this;

	if (!this.url) return callback({});

	Tools.Ajax.defaultGet(this.url)
		.then(function (data) {
			if (self.json.dataCallback && self.actions[self.json.dataCallback]) {
				callback(self.actions[self.json.dataCallback](data));
			} else {
				callback(data);
			}
		})
		.then(function (err) {
			self.error(err.status);
		});
};
Widgets.HTMLContainer.prototype.error = function (err) {
	this.$.chart.boxUnBusy();
	err = Errors({
		type: "Widget",
		status: err,
	});
	this.$.chart.append(err.html);
	this.bindErrors();
	this.$.title
		.closest(".box-header")
		.children(".box-tools")
		.find(".badge")
		.remove();

	this.$.title
		.closest(".box-header")
		.children(".box-tools")
		.prepend(
			'<span data-i18n="' +
				err.opts["title-i18n"] +
				'" class="badge label-' +
				err.opts.severity +
				'"></span>'
		)
		.i18n();

	if (this.collapsed === "auto") this.$.body.hide();

	this.$.title.i18n();
};
Widgets.HTMLContainer.prototype.bind = function () {
	var self = this;
	this.collapsed = "auto";
	this.$.html
		.find(".body-toggle")
		.off()
		.on("click", function () {
			var sc = self.collapsed;
			if (sc === "closed" || (sc === "auto" && self.$.body.is(":hidden"))) {
				self.collapsed = "open";
				$(this).attr("data-collapsed", "open");
				self.$.body.slideDown(300);
			} else if (
				sc === "open" ||
				(sc === "auto" && !self.$.body.is(":hidden"))
			) {
				self.collapsed = "closed";
				$(this).attr("data-collapsed", "closed");
				self.$.body.slideUp(300);
			}
		})
		.on("contextmenu", function (ev) {
			self.collapsed = "auto";
			$(this).attr("data-collapsed", "auto");
			ev.preventDefault();
		});
	this.$.html
		.find(".chart-refresh")
		.off()
		.on("click", function () {
			self.update();
		});
};
Widgets.HTMLContainer.prototype.bindErrors = function () {
	var self = this;
	this.$.div
		.find(".closebtn")
		.off()
		.on("click", function () {
			self.$.html.find(".body-toggle").trigger("click");
		});
	this.$.div
		.find(".retrybtn")
		.off()
		.on("click", function () {
			self.$.html.find(".chart-refresh").trigger("click");
		});
};
Widgets.HTMLContainer.prototype.bindActions = function () {
	var self = this;

	this.$.html
		.find("[data-action]")
		.off()
		.on("click", function () {
			// get action here
			var action = self.actions[$(this).data("action")];
			action(
				self.data.data[$(this).closest("tr").data("row-id")],
				self.data.data,
				self,
				$(this).closest("tr")
			);
		});
};
Widgets.HTMLContainer.prototype.i18n = function () {
	this.$.html.i18n();
};
Widgets.HTMLContainer.prototype.refresh = function () {
	if (!this.preInit) {
		if (this.$.container.is(":visible")) {
			this.preInit = true;
			this.initChart();
		}
	}
	// update every x seconds
	// if not visible (diferent view in focus, minimized) s et needsRefresh
	// if needs-Refresh, get new data
};
Widgets.HTMLContainer.prototype._ = scopeInterface;
Widgets.HTMLContainer.prototype.is = function (t) {
	if (t === "*") return true;

	return (
		t.toLowerCase() === "HTMLContainer".toLowerCase() ||
		t.toLowerCase() === "chart" ||
		t.toLowerCase() === "widget" ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

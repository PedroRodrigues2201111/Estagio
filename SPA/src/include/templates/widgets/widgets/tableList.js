/** Table/List chart hybrid
 *   ________
 *  |__|__|__|
 *  |__|_____|
 *  |__|_____|
 *  |__|_____|
 *
 */

Widgets.TableList = function TableList(scope, container, json, opts) {
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
Widgets.TableList.prototype.init = function () {
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
Widgets.TableList.prototype.initChart = function () {
	var self = this;

	this.table = document.createElement("table");
	this.table.className =
		"table table-condensed table-striped table-responsive table-hover";

	this.$.table = $(this.table);
	this.$.chart.append(this.$.table);

	this.$.title.i18n();

	this.$.chart.boxBusy();

	this.updating = true;

	this.get(function (data) {
		var d = JSON.simpleCopy(data);
		var i;

		if (
			data.data.length === 0 ||
			data.data.reduce(function (a, v) {
				return a && v.length === 0;
			}, true)
		) {
			self.error("no-data");
			return;
		}

		if (self.json.data) {
			if (self.json.data.length !== d.data.length) {
				console.log("Diferently sized arrays for data.", self);
			}

			for (i = 0; i < self.json.data.length; i++) {
				if (d.data[i]) {
					d.data[i].deepMerge(self.json.data[i]);
				} else {
					console.log("Missing data " + i);
				}
			}
		}

		self.data = d;

		i = 0;
		var $html = $(
			d.data
				.map(function (r) {
					i++;
					return (
						'<tr data-row-id="' + (i - 1) + '">' + self.template(r) + "</tr>"
					);
				})
				.join("")
		);

		self.$.table.append($html);
		self.updating = false;
		self.$.chart.boxUnBusy();
		self.bindActions();
		self.i18n();
	});
};
Widgets.TableList.prototype.update = function () {
	if (!this.updating) {
		this.updating = true;
		this.$.chart.empty();
		this.initChart();
	}
};
Widgets.TableList.prototype.get = function (callback) {
	var self = this;

	Tools.Ajax.defaultGet(this.url)
		.then(function (data) {
			callback(data);
		})
		.then(function (err) {
			self.error(err.status);
		});
};
Widgets.TableList.prototype.error = function (err) {
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
Widgets.TableList.prototype.bind = function () {
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
Widgets.TableList.prototype.bindErrors = function () {
	var self = this;
	this.$.chart
		.find(".closebtn")
		.off()
		.on("click", function () {
			self.$.html.find(".body-toggle").trigger("click");
		});
	this.$.chart
		.find(".retrybtn")
		.off()
		.on("click", function () {
			self.$.html.find(".chart-refresh").trigger("click");
		});
};
Widgets.TableList.prototype.bindActions = function () {
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
Widgets.TableList.prototype.i18n = function () {
	this.$.html.i18n();
};
Widgets.TableList.prototype.refresh = function () {
	if (!this.preInit) {
		if (this.$.container.is(":visible")) {
			this.preInit = true;
			this.$.chart.empty();
			this.initChart();
		}
	}
	// update every x seconds
	// if not visible (diferent view in focus, minimized) s et needsRefresh
	// if needs-Refresh, get new data
};
Widgets.TableList.prototype._ = scopeInterface;
Widgets.TableList.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "TableList".toLowerCase() ||
		t.toLowerCase() === "chart" ||
		t.toLowerCase() === "widget" ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

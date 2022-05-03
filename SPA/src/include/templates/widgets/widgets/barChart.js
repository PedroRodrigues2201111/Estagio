/**  Bar Chart
 *       __
 *      |  |  __
 *  __  |  | |  |  __
 * |  | |  | |  | |  |
 */

Widgets.BarChart = function BarChart(scope, container, json, opts) {
	Widgets.chartProto.call(this);

	this.scope = scope;
	this.opts = opts;
	this.container = container;
	this.json = JSON.simpleCopy(json);
	this.view = this._("^view").get(0);

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
	this.$.html = null;

	this.init();
};
Widgets.BarChart.prototype = Object.create(Widgets.chartProto.prototype);
Widgets.BarChart.prototype.constructor = Widgets.BarChart;

Widgets.BarChart.prototype.initChart = function () {
	var self = this;

	this.$.title.i18n();
	this.$.chart.boxBusy();
	this.deferring = false;

	this.get(function (data) {
		var d = {};
		var colors = null;
		self._data = data;

		// prepare data
		// Handle colors
		if (data["colors"]) {
			colors = JSON.simpleCopy(data["colors"]);
		} else if (self.json["colors"]) {
			colors = JSON.simpleCopy(self.json["colors"]);
		} else {
			colors = JSON.simpleCopy(Widgets.BarChart.defaultColors);
		}

		// Handle color order
		if (data["colorAssign"] || self.json["colorAssign"]) {
			self.cA = data["colorAssign"] || self.json["colorAssign"];
		} else {
			self.cA = "random";
		}
		if (self.cA === "random") {
			shuffle(colors);
		}

		// Handle labels
		if (data["labels-i18n"]) {
			self.i18nLabels = true;
			self.dataLabels = data["labels-i18n"];
		} else if (data["labels"]) {
			self.dataLabels = data["labels"];
		} else if (self.json["labels-i18n"]) {
			self.i18nLabels = true;
			self.dataLabels = self.json["labels-i18n"];
		} else if (self.json["labels"]) {
			self.dataLabels = self.json["labels"];
		} else {
			console.warn("No labels for chart.", self);
		}

		// Handle xLabels
		if (data["xLabels-i18n"]) {
			self.i18nXLabels = true;
			self.labels = data["xLabels-i18n"];
		} else if (data["xLabels"]) {
			self.labels = data["xLabels"];
		} else if (self.json["xLabels-i18n"]) {
			self.i18nXLabels = true;
			self.labels = self.json["xLabels-i18n"];
		} else if (self.json["xLabels"]) {
			self.labels = self.json["xLabels"];
		} else {
			console.warn("No x labels for chart.", self);
		}

		// Handle yLabel
		if (data["yLabel-i18n"]) {
			self.i18nYLabel = true;
			self.yLabel = data["yLabel-i18n"];
		} else if (data["yLabel"]) {
			self.yLabel = data["yLabel"];
		} else if (self.json["yLabel-i18n"]) {
			self.i18nYLabel = true;
			self.yLabel = self.json["yLabel-i18n"];
		} else if (self.json["yLabel"]) {
			self.yLabel = self.json["yLabel"];
		} else {
		}

		// Handle xLabel
		if (data["xLabel-i18n"]) {
			self.i18nXLabel = true;
			self.xLabel = data["xLabel-i18n"];
		} else if (data["xLabel"]) {
			self.xLabel = data["xLabel"];
		} else if (self.json["xLabel-i18n"]) {
			self.i18nXLabel = true;
			self.xLabel = self.json["xLabel-i18n"];
		} else if (self.json["xLabel"]) {
			self.xLabel = self.json["xLabel"];
		} else {
		}

		d.labels = self.labels;

		// construct dataSets

		d.datasets = [];

		if (
			data.data.length === 0 ||
			data.data.reduce(function (a, v) {
				return a && v.length === 0;
			}, true)
		) {
			self.error("no-data");
			return;
		}

		d.datasets.push({
			type: "bar",
			marker: {
				color: colors.map(function (v) {
					return v[0];
				}),
			},
			x: self.dataLabels.map(function (v) {
				return self.i18nLabels ? i18n.t(v) : v;
			}),
			y: data.data.map(function (v) {
				return v[0];
			}),
		});

		self._d = d;

		self.isReady = true;

		if (self.$.html.is(":visible")) {
			self.renderChart();
		} else {
			self.deferring = true;
		}
	});
};

Widgets.BarChart.prototype.renderChart = function () {
	var self = this;

	var d3 = Plotly.d3;

	var p_width = 100,
		p_height = 35;

	var gd3 = d3.select(self.$.chart[0]).style({
		width: "100%",
		height: "100%",
	});

	this.$.chart.parent().addClass("for-chart");

	var gd = gd3.node();

	var layout = {
		margin: {
			t: 20,
			l: 40 + (this.yLabel ? 20 : 0),
			r: 20,
			b: null,
			pad: 4,
		},
		legend: {
			x: 0,
			y: 1,
			traceorder: "normal",
			font: {
				family: "sans-serif",
				size: 12,
				color: "#000",
			},
			bgcolor: "rgba(240,240,240,.4)",
			bordercolor: "rgba(240,240,240,.8)",
			borderwidth: 2,
		},
	};

	if (this.xLabel) {
		layout.xaxis = {};
		if (this.i18nXLabel) {
			layout.xaxis.title = i18n.t(this.xLabel);
		} else {
			layout.xaxis.title = this.xLabel;
		}
	}

	if (this.yLabel) {
		layout.yaxis = {};
		if (this.i18nYLabel) {
			layout.yaxis.title = i18n.t(this.yLabel);
		} else {
			layout.yaxis.title = this.yLabel;
		}
	}

	Plotly.newPlot(gd, self._d.datasets, layout, {
		modeBarButtonsToRemove: ["sendDataToCloud", "lasso2d", "select2d"],
		displaylogo: false,
	});

	if (this.legendHidden) this.$.html.find("g.legend").hide();

	this.$.chart.boxUnBusy();
	this.$.title.i18n();
};
Widgets.BarChart.prototype.i18n = function () {
	if (!this.isReady) return;

	var self = this;

	for (var i = 0; i < this._d.datasets.length; i++) {
		this._d.datasets[i].x = this.dataLabels.map(function (v) {
			return self.i18nLabels ? i18n.t(v) : v;
		});
	}

	if (this.$.chart.is(":visible")) {
		this.renderChart();
	} else {
		this.deferring = true;
	}
};
Widgets.BarChart.prototype._ = scopeInterface;
Widgets.BarChart.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "BarChart".toLowerCase() ||
		t.toLowerCase() === "chart" ||
		t.toLowerCase() === "widget" ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};
Widgets.BarChart.defaultColors = JSON.simpleCopy(Widgets.defaultColorPairs);

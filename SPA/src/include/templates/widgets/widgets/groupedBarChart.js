/**  Grouped Bar Chart
 *
 */
Widgets.GroupedBarChart = function GroupedBarChart(
	scope,
	container,
	json,
	opts
) {
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
Widgets.GroupedBarChart.prototype = Object.create(Widgets.chartProto.prototype);
Widgets.GroupedBarChart.prototype.constructor = Widgets.GroupedBarChart;

Widgets.GroupedBarChart.prototype.initChart = function () {
	var self = this;

	this.$.title.i18n();
	this.$.chart.boxBusy();
	this.deferring = false;

	this.get(function (data) {
		var d = {};
		var colors = null;

		// prepare data
		// Handle colors
		if (data["colors"]) {
			colors = data["colors"].slice();
		} else if (self.json["colors"]) {
			colors = self.json["colors"].slice();
		} else {
			colors = Widgets.GroupedBarChart.defaultColors.slice();
		}

		// Handle color order
		if (data["colorAssign"] || self.json["colorAssign"]) {
			self.cA = data["colorAssign"] || self.json["colorAssign"];
		} else {
			self.cA = "randomStart";
		}
		if (self.cA === "random") {
			shuffle(colors);
		} else if (self.cA === "randomStart") {
			shift(colors);
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

		if (self.i18nXLabels) {
			d.labels = self.labels.map(function (v) {
				return i18n.t(v);
			});
		} else {
			d.labels = self.labels;
		}

		if (
			data.data.length === 0 ||
			data.data.reduce(function (a, v) {
				return a && v.length === 0;
			}, true)
		) {
			self.error("no-data");
			return;
		}

		// construct dataSets
		d.datasets = [];

		for (var i = 0; i < data.data.length; i++) {
			d.datasets.push({
				type: "bar",
				"label-i18n": self.dataLabels[i],
				name: self.i18nLabels ? i18n.t(self.dataLabels[i]) : self.dataLabels[i],
				marker: {
					color: colors[i],
					size: 6,
				},
				x: d.labels,
				y: data.data[i].map(function (v, i) {
					return v;
				}),
			});
		}

		// init chart
		self._d = d;

		self.isReady = true;

		if (self.$.chart.is(":visible")) {
			self.renderChart();
		} else {
			self.deferring = true;
		}
	});
};
Widgets.GroupedBarChart.prototype.renderChart = function () {
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
		hovermode: "closest",
		barmode: "group",
		margin: {
			t: 20,
			l: 40 + (this.yLabel ? 20 : 0),
			r: 20,
			b: 40,
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
Widgets.GroupedBarChart.prototype.i18n = function () {
	if (!this.isReady) return;

	var self = this;

	if (this.i18nXLabels) {
		for (var i = 0; i < this._d.labels.length; i++) {
			this._d.labels[i] = i18n.t(this.labels[i]);
		}

		for (var i = 0; i < this._d.datasets.length; i++) {
			this._d.datasets[i].x = this._d.labels;
		}
	}

	if (this.i18nLabels) {
		for (var i = 0; i < this._d.datasets.length; i++) {
			this._d.datasets[i].name = i18n.t(this._d.datasets[i]["label-i18n"]);
		}
	}

	if (this.$.chart.is(":visible")) {
		this.renderChart();
	} else {
		this.deferring = true;
	}
};
Widgets.GroupedBarChart.prototype._ = scopeInterface;
Widgets.GroupedBarChart.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "GroupedBarChart".toLowerCase() ||
		t.toLowerCase() === "chart" ||
		t.toLowerCase() === "widget" ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};
Widgets.GroupedBarChart.defaultColors = Widgets.defaultColors.slice();

/**  Pie Chart
 *
 *     3.14
 *
 */

Widgets.PieChart = function PieChart(scope, container, json, opts) {
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
Widgets.PieChart.prototype = Object.create(Widgets.chartProto.prototype);
Widgets.PieChart.prototype.constructor = Widgets.PieChart;

Widgets.PieChart.prototype.initChart = function (callback) {
	var self = this;

	this.$.title.i18n();
	this.$.chart.boxBusy();
	this.deferring = false;

	this.get(function (data) {
		var d = [];
		var colors = null;

		// prepare data
		// Handle colors
		if (data["colors"]) {
			colors = JSON.simpleCopy(data["colors"]);
		} else if (self.json["colors"]) {
			colors = JSON.simpleCopy(self.json["colors"]);
		} else {
			colors = JSON.simpleCopy(Widgets.PieChart.defaultColors);
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
			colors = shear(colors, 3);
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

		if (data.data.length === 0) {
			self.error("no-data");
			return;
		}

		// construct dataSets
		for (var i = 0; i < data.data.length; i++) {
			d.push({
				label: self.i18nLabels
					? i18n.t(self.dataLabels[i])
					: self.dataLabels[i],
				"label-i18n": self.dataLabels[i],
				color: colors[i],
				highlight: colors[i],
				value: data.data[i],
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
Widgets.PieChart.prototype.renderChart = function () {
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

	var d = [
		{
			values: [],
			labels: [],
			textposition: "outside",
			marker: {
				colors: [],
			},
			type: "pie",
		},
	];
	self._d.forEach(function (dd) {
		d[0].values.push(Array.isArray(dd.value) ? dd.value[0] : dd.value);
		d[0].labels.push(dd.label);
		d[0].marker.colors.push(dd.color);
	});

	var layout = {
		margin: {
			t: 40,
			l: 40,
			r: 40,
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

	Plotly.newPlot(gd, d, layout, {
		modeBarButtonsToRemove: ["sendDataToCloud", "lasso2d", "select2d"],
		displaylogo: false,
	});

	if (this.legendHidden) this.$.html.find("g.legend").hide();

	this.$.chart.boxUnBusy();
	this.$.title.i18n();
};
Widgets.PieChart.prototype.i18n = function () {
	if (!this.isReady) return;
	if (this.i18nLabels) {
		for (var i = 0; i < this._d.length; i++) {
			this._d[i].label = i18n.t(this._d[i]["label-i18n"]);
		}
	}

	if (this.$.chart.is(":visible")) {
		this.renderChart();
	} else {
		this.deferring = true;
	}
};
Widgets.PieChart.prototype._ = scopeInterface;
Widgets.PieChart.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "PieChart".toLowerCase() ||
		t.toLowerCase() === "chart" ||
		t.toLowerCase() === "widget" ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};
Widgets.PieChart.defaultColors = JSON.simpleCopy(Widgets.colors2);

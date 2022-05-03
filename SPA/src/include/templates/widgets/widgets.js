var Widgets = {};
Widgets.defaultColors = defaultColors;
Widgets.defaultColorPairs = defaultColorPairs;
Widgets.colors2 = [
	"#f44336",
	"#E91E63",
	"#9C27B0",
	"#673AB7",
	"#3F51B5",
	"#2196F3",
	"#03A9F4",
	"#00BCD4",
	"#009688",
	"#4CAF50",
	"#8BC34A",
	"#CDDC39",
	"#FFEB3B",
	"#FFC107",
	"#FF9800",
	"#FF5722",
];

Widgets.chartProto = function () {};
Widgets.chartProto.prototype.init = function () {
	var html = Widgets.Template(this.json, {
		data: {
			chart: true,
		},
	});

	this.$.html = $(html);
	this.$.container.append(this.$.html);
	this.$.container.data("componentRef", this);

	this.$.legend = this.$.html.find(".legend");
	this.$.chart = this.$.html.find(".chart");
	this.$.body = this.$.html.find(".box-body");
	this.$.title = this.$.html.find(".chart-title");

	this.bind();

	this.preInit = false;
	//this.initChart();
};
Widgets.chartProto.prototype.update = function () {
	this.$.chart.empty();

	this.$.title
		.closest(".box-header")
		.children(".box-tools")
		.find(".badge")
		.remove();

	this.$.chart.find(".mini-err").remove();

	if (this.collapsed === "auto") this.$.body.show();

	if (this._d) delete this._d;

	this.initChart();
};
Widgets.chartProto.prototype.get = function (callback) {
	var self = this;

	// ToDo: add filter data

	Tools.Ajax.defaultGet(this.url)
		.then(function (data) {
			callback(data);
		})
		.then(function (err) {
			self.error(err.status);
		});
};
Widgets.chartProto.prototype.error = function (err) {
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
Widgets.chartProto.prototype.bindErrors = function () {
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
Widgets.chartProto.prototype.bind = function () {
	var self = this;
	this.collapsed = "auto";

	$(window).on("resize", function () {
		if (self._d && self.$.chart.is(":visible")) {
			if (self.deferring) {
				self.renderChart();
				self.deferring = false;
			} else {
				Plotly.Plots.resize(self.$.chart[0]);
			}
		} else {
			self.deferring = true;
		}
	});

	this.$.html
		.find(".body-toggle")
		.off()
		.on("click", function () {
			var sc = self.collapsed;
			if (sc === "closed" || (sc === "auto" && self.$.body.is(":hidden"))) {
				self.collapsed = "open";
				$(this).attr("data-collapsed", "open");
				self.$.body.slideDown(300, function () {
					if (self.$.chart.is(":visible")) {
						if (self._d && self.deferring) {
							self.renderChart();
							self.deferring = false;
						} else {
							Plotly.Plots.resize(self.$.chart[0]);
						}
					}
				});
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

	this.legendHidden = false;
	this.$.html
		.find(".legend-toggle")
		.removeClass("hidden")
		.off()
		.on("click", function () {
			self.legendHidden = !self.legendHidden;
			if (self.legendHidden) {
				self.$.html.find("g.legend").hide();
			} else {
				self.$.html.find("g.legend").show();
			}
		});
};
Widgets.chartProto.prototype.refresh = function () {
	if (!this.preInit) {
		if (this.$.container.is(":visible")) {
			this.preInit = true;
			this.initChart();
		}
	} else if (this._d && this.deferring && this.$.html.is(":visible")) {
		this.deferring = false;
		this.renderChart();
	}
};

Widgets.Template = Handlebars.templates["widgets/widgets"];

window.Templates.widgets = Widgets;

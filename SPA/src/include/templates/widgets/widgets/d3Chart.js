/** HTML Template widget
 *   ________
 *  | <html> |
 *  |   ...  |
 *  | </html>|
 *  |________|
 *
 */

Widgets.d3Chart = function d3Chart(scope, container, json, opts) {
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

	this.d3 = {
		container: d3.select(this.container),
	};

	this.init();
};
Widgets.d3Chart.prototype.init = function () {
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
Widgets.d3Chart.prototype.initChart = function () {
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
Widgets.d3Chart.prototype.update = function () {
	this.$.chart.empty();
	this.initChart();
};
Widgets.d3Chart.prototype.setData = function (data) {
	this._d = data;
};
Widgets.d3Chart.prototype.get = function (callback) {
	var self = this;

	Tools.Ajax.defaultGet(this.url)
		.then(function (data) {
			callback(data);
		})
		.then(function (err) {
			self.error(err.status);
		});
};
Widgets.d3Chart.prototype.error = function (err) {
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
Widgets.d3Chart.prototype.bind = function () {
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
Widgets.d3Chart.prototype.bindErrors = function () {
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
Widgets.d3Chart.prototype.bindActions = function () {
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
Widgets.d3Chart.prototype.i18n = function () {
	this.$.html.i18n();
};
Widgets.d3Chart.prototype.refresh = function () {
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
Widgets.d3Chart.prototype._ = scopeInterface;
Widgets.d3Chart.prototype.is = function (t) {
	if (t === "*") return true;

	return (
		t.toLowerCase() === "d3Chart".toLowerCase() ||
		t.toLowerCase() === "chart" ||
		t.toLowerCase() === "widget" ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};
/**
 *
 *
 *
 *
 * */
Widgets.d3ChartABDias = function d3ChartABDias(scope, container, json, opts) {
	var self = this;
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

	this.d3 = {
		container: d3.select(this.container),
	};

	var dimensions = self.container.getBoundingClientRect();

	self.height = dimensions.height;
	self.width = dimensions.width;
	self.d3.container
		.select(".graph")
		.attr("width", self.width)
		.attr("height", self.height);
	self.margin = [10, 10, 40, 80];

	this.init();
};
Widgets.d3ChartABDias.prototype.init = function () {
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

	this.bind();

	this.preInit = false;
	//this.initChart();
};
Widgets.d3ChartABDias.prototype.initChart = function () {
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
Widgets.d3ChartABDias.prototype.drawChart = function () {
	const self = this;
	// Draw
	self.drawBody =
		self.drawBody ||
		((data) => {
			const { iWidth, iHeight, margin } = self;

			const root = self.d3.container.select(".graph");
			root.selectAll("*").remove();
			const bgs = root
				.append("g")
				.attr("class", "backgrounds")
				.attr("transform", `translate(${margin[3]},${margin[0]})`);
			root.append("g").attr("class", "xAxis");
			root.append("g").attr("class", "yAxis");
			root
				.append("g")
				.attr("class", "bands")
				.attr("transform", `translate(${margin[3]},${margin[0]})`);
			root
				.append("g")
				.attr("class", "g")
				.attr("transform", `translate(${margin[3]},${margin[0]})`);

			const marks = root
				.append("g")
				.attr("class", "marks")
				.attr("transform", `translate(${margin[3]},${margin[0]})`);

			const g = root.select(".g");

			let scale = d3
				.scaleLinear()
				.range([0, iWidth])
				.domain([0, globalRules.days.days]);

			let scalePosition = d3
				.scaleBand()
				.rangeRound([0, iHeight])
				.domain(data.map((d) => d.id));

			scalePosition.paddingOuter(0.2).paddingInner(0.4);

			let join = g.selectAll("rect").data(data);

			// Draw bars
			g.selectAll("rect.amount")
				.data(data)
				.enter()
				.append("rect")
				.style("fill", "#225588")
				.attr("class", "amount")
				.attr("width", (d) => scale(d.amount))
				.attr("height", scalePosition.bandwidth())
				.attr("transform", (d) => `translate(0,${scalePosition(d.id)})`)
				.on("mouseover", function (d) {
					this.style.fill = "#bb4444";
				})
				.on("mouseout", function (d) {
					this.style.fill = "#225588";
				});

			// Draw addbars
			g.selectAll("rect.add")
				.data(data)
				.enter()
				.append("rect")
				.style("fill", "#22aadd")
				.attr("class", "add")
				.attr("width", (d) => scale(d.add))
				.attr("height", scalePosition.bandwidth())
				.attr(
					"transform",
					(d) => `translate(${scale(d.amount)},${scalePosition(d.id)})`
				);

			// Draw separators
			join
				.enter()
				.append("path")
				.attr("stroke", "black")
				.attr("shape-rendering", "crispEdges")
				.attr("d", (d, i) => `M0 ${scalePosition.step() * i} H ${iWidth}`);

			function makeMark(x, y) {
				return `M${x},${y}L${x - 6},${y - 8}L${x + 6},${y - 8}`;
			}

			function makeMarkDown(x, y) {
				return `M${x},${y}L${x + 6},${y + 8}L${x - 6},${y + 8}`;
			}

			var alerts = marks
				.selectAll(".mark")
				.data(
					data.flatMap((d) =>
						d.rules.flatMap((r) =>
							r.alerts.map((a) => ({
								id: d.id,
								rule: r,
								alert: a,
							}))
						)
					)
				)
				.enter();

			alerts
				.append("path")
				.attr("class", "mark")
				.attr("fill", "red")
				.attr("d", (d, i) => makeMark(scale(d.alert), scalePosition(d.id)));
			alerts
				.append("path")
				.attr("class", "mark")
				.attr("fill", "red")
				.attr("d", (d, i) =>
					makeMarkDown(
						scale(d.alert),
						scalePosition(d.id) + scalePosition.bandwidth()
					)
				);

			let yAxis = d3.axisLeft(scalePosition);
			let xAxis = d3.axisBottom(scale).ticks(8);

			let yAxisContainer = root
				.select(".yAxis")
				.style("transform", `translate(${margin[3]}px, ${margin[0]}px)`)
				.transition()
				.call(yAxis);

			let xAxisContainer = root
				.select(".xAxis")
				.style(
					"transform",
					`translate(${margin[3]}px, ${iHeight + margin[0]}px)`
				)
				.transition()
				.call(xAxis);

			var xBands = d3
				.axisBottom(scale)
				.ticks(8)
				.tickSize(-iHeight)
				.tickFormat("");

			root
				.select(".bands")
				.append("g")
				.attr("class", "grid")
				.attr("transform", "translate(0," + iHeight + ")")
				.call(xBands);

			let = root.select(".backgrounds");

			var greenBox = bgs
				.append("rect")
				.attr("x", scale(2))
				.attr("y", 0)
				.attr("width", scale(5) - scale(2))
				.attr("height", iHeight)
				.attr("fill", "#66bb2b")
				.attr("opacity", 0.3);

			var redBox = bgs
				.append("rect")
				.attr("x", scale(5))
				.attr("y", 0)
				.attr("width", scale(globalRules.days.days) - scale(5))
				.attr("height", iHeight)
				.attr("fill", "#ff532b")
				.attr("opacity", 0.3);
		});

	self.drawBody(self._d);
};

Widgets.d3ChartABDias.prototype.update = function () {
	this.$.chart.empty();
	this.initChart();
};
Widgets.d3ChartABDias.prototype.setData = function (data) {
	this._d = data;
};
Widgets.d3ChartABDias.prototype.get = function (callback) {
	var self = this;

	Tools.Ajax.defaultGet(this.url)
		.then(function (data) {
			callback(data);
		})
		.then(function (err) {
			self.error(err.status);
		});
};
Widgets.d3ChartABDias.prototype.error = function (err) {
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
Widgets.d3ChartABDias.prototype.bind = function () {
	var self = this;
	this.collapsed = "auto";
	const getHMargin = (_) => self.margin[1] + self.margin[3];
	const getVMargin = (_) => self.margin[0] + self.margin[2];

	const resizeObserver = new ResizeObserver((entries) => {
		for (const entry of entries) {
			if (entry.contentBoxSize) {
				self.height = entry.contentBoxSize.blockSize;
				self.width = entry.contentBoxSize.inlineSize;
			} else {
				self.height = entry.contentRect.height;
				self.width = entry.contentRect.width;
			}
			self.iWidth = self.width - getHMargin();
			self.iHeight = self.height - getVMargin();
		}
		self.d3.container
			.select(".graph")
			.attr("width", self.width)
			.attr("height", self.height);

		self.refresh();
	});
	resizeObserver.observe(self.container);

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
Widgets.d3ChartABDias.prototype.bindErrors = function () {
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
Widgets.d3ChartABDias.prototype.bindActions = function () {
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
Widgets.d3ChartABDias.prototype.i18n = function () {
	this.$.html.i18n();
};
Widgets.d3ChartABDias.prototype.refresh = function () {
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
Widgets.d3ChartABDias.prototype._ = scopeInterface;
Widgets.d3ChartABDias.prototype.is = function (t) {
	if (t === "*") return true;

	return (
		t.toLowerCase() === "d3ChartABDias".toLowerCase() ||
		t.toLowerCase() === "chart" ||
		t.toLowerCase() === "widget" ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

function Filters(scope, container, json) {
	this.scope = scope;
	this.children = [];
	this.container = container;
	this.$ = {};
	this.$.container = $(this.container);
	this.json = json;

	this.gridJson = scope.json;

	this.init();
}
Filters.prototype.init = function () {
	this.html = Filters.Template();
	this.$.html = $(this.html);

	this.filters = [];

	this.$.container.append(this.$.html);

	// Apply selectize to requires columns
	this.autocompleteFilters = this.gridJson.autocompleteFilters || [];
	this.autocompleteAllTextFilters =
		this.gridJson.autocompleteAllTextFilters || false;

	this.setupEvents();

	this.i18n();
};
Filters.prototype.i18n = function () {
	this.$.html.i18n();
};
Filters.prototype.setupEvents = function () {
	var self = this;

	this.$.html.find(".panel-heading").on("click", function () {
		var c = $(this).closest(".filter-container");
		if (c.hasClass("collapsed")) {
			c.find(".panel-body").slideDown(200);
		} else {
			c.find(".panel-body").slideUp(200);
		}
		c.toggleClass("collapsed");
	});

	this.$.html.find(".new-filter").on("click", function () {
		if (self.children.length > 0) self.add(null, null, null, null, true);
		self.add();
	});
	this.$.html.find(".clear-filters").on("click", function () {
		self.removeAll();
	});

	this.$.html.find(".apply-filter").on("click", function () {
		self.scope.refresh(true);
	});

	this.$.count = this.$.html.find('[data-id="filter-count"]');
	this.updateCount();
};
Filters.prototype.get = function () {
	return this.children
		.map(function (f) {
			return f.get();
		})
		.filter(function (f) {
			return (
				f != null &&
				((f.value != null && f.value === f.value) || f.logicalOperator != null)
			);
		});
};
Filters.prototype.getLocalized = function () {
	return this.children
		.map(function (f) {
			return f.getLocalized();
		})
		.filter(function (f) {
			return (
				f != null &&
				((f.value != null && f.value === f.value) || f.logicalOperator != null)
			);
		});
};
Filters.prototype.updateCount = function () {
	if (this.children.length > 0) {
		this.$.count.parent().show();
		this.$.count.text(Math.ceil(this.children.length / 2));
	} else {
		this.$.count.parent().hide();
	}
};
Filters.prototype.removeAll = function () {
	var children = [...this.children];
	children.forEach((f) => f.remove());
	// this.children.splice(0, 0);
	this.updateCount();
};
Filters.prototype.remove = function (filter) {
	this.children.splice(this.children.indexOf(filter), 1);
	this.updateCount();
};
Filters.prototype.fixLevels = function () {
	let min = Math.min(...this.children.map((c) => c.level));
	if (min > 0) {
		for (let c of this.children) {
			c.setLevel(c.level - min);
		}
	}
};
Filters.prototype.addSafe = function (
	selected,
	constraint,
	values,
	focusText,
	isSplit,
	level = 0
) {
	if (this.children.length > 0) this.add(null, null, null, null, true);
	this.add(selected, constraint, values, focusText, isSplit, level);
};
Filters.prototype.add = function (
	selected,
	constraint,
	values,
	focusText,
	isSplit,
	level = 0
) {
	if (isSplit) {
		var nfhr = new FilterHR(
			this,
			this.$.html.find(".container"),
			this.json,
			values,
			level
		);
		this.children.push(nfhr);
		return;
	}

	var nf = new Filter(
		this,
		this.$.html.find(".container"),
		this.json,
		selected,
		constraint,
		values,
		(f) =>
			this.autocompleteAllTextFilters ||
			this.autocompleteFilters.indexOf(f) > -1,
		level
	);
	this.children.push(nf);
	// add to filters
	var c = this.$.container.find(".filter-container");

	if (c.hasClass("collapsed")) {
		c.find(".panel-body").slideDown(200);
		c.removeClass("collapsed");
	}
	this.updateCount();
	if (focusText) {
		nf.$.html.find(".filter-value input").first().focus();
	}
};

Filters.prototype.is = scopeCompare;
Filters.prototype._ = scopeInterface;

Filters.Template = Handlebars.templates["grid/filters"];

window.Templates.filters = Filters;

function Filter(
	scope,
	container,
	json,
	selected,
	currentConstraint,
	values,
	shouldAutocomplete,
	level
) {
	this.scope = scope;
	this.container = container;
	this.$ = {};
	this.$.container = $(this.container);
	this.json = json;

	this.grid = this._("^grid")[0];
	this.shouldAutocomplete = shouldAutocomplete;

	this.selected = selected;

	this.currentField = null;
	this.currentType = null;
	this.currentConstraint = currentConstraint || null;
	this.currentValues = [];
	this.level = level;

	this.initialValues = values || null;

	this.init();
}

Filter.prototype.init = function () {
	var self = this;
	this.html = Filters.Template(this.json, {
		data: {
			filter: true,
			selected: this.selected,
		},
	});

	this.$.html = $(this.html);
	this.$.container.append(this.$.html);
	this.$.constraint = this.$.html.find(".constraint-container");

	this.initPromise = new Promise((res) => res());

	this.makeHandlers();

	this.typemap = {};
	this.filterTypes = ["string", "date", "number", "boolean"];
	for (var i = 0; i < this.json.length; i++) {
		this.typemap[this.json[i].field] = this.typemap[this.json[i].field] || {};
		if (this.filterTypes.indexOf(this.json[i].type) > -1) {
			this.typemap[this.json[i].field].type = this.json[i].type;
		} else {
			this.typemap[this.json[i].field].type = this.json[i].subtype;
			this.typemap[this.json[i].field].as = this.json[i].type;
		}
	}

	this.setupDom();

	this.updateConstraints();
	// this.updateInputs();
	// this.i18n();

	if (this.initialValues) {
		this.$.html
			.find(".constraint .filter-value .form-group:not(.hidden) input")
			.each(function (i) {
				var $this = $(this);
				let classes = this.classList;
				if (classes.contains("datesinglepicker")) {
					let val = moment(self.initialValues[i]).format(
						main.formats.date.toUpperCase()
					);
					$(this).data("daterangepicker").setStartDate(val);
					//	$(this).val(val).trigger("change");
				} else if (classes.contains("datetimesinglepicker")) {
					let val = moment(self.initialValues[i]).format(
						main.formats.date.toUpperCase() + " " + main.formats.time
					);
					$(this).data("daterangepicker").setStartDate(val);
				} else if (classes.contains("datetimerangepicker")) {
					let val = moment(self.initialValues[i]).format(
						main.formats.date.toUpperCase() + " " + main.formats.time
					);
					let val1 = moment(self.initialValues[i + 1]).format(
						main.formats.date.toUpperCase() + " " + main.formats.time
					);
					$(this).data("daterangepicker").setStartDate(val);
					$(this).data("daterangepicker").setEndDate(val1);
				} else {
					$(this).val(self.initialValues[i]).trigger("change");
				}
			});
		this.initialValues = null;
	}

	this.setLevel(this.level);
};
Filter.prototype.i18n = function () {
	this.initComponents();
	/*
  this.$.html.find("select").each(function() {
    var s = this.selectize;
    if (!s) return;

    var val = s.getValue();
    s.destroy();
    $(this).val(val);
  });*/

	this.$.html.i18n();

	this.$.html.find("select.constraint-select:not(.selectized)").selectize({
		onDelete: function () {
			return false;
		},
	});
	this.$.html.find("select.field-select:not(.selectized)").selectize({
		onDelete: function () {
			return false;
		},
	});
};
Filter.prototype.get = function () {
	var f = {
		field: this.currentField,
		constraint: this.currentConstraint,
		type: this.currentType,
		value: this.currentValues[0],
		value1: this.currentValues[1] || null,
		level: this.level,
	};

	if (this.typemap[this.currentField].as === "percentage") {
		if (f.value) f.value = f.value / 100;
		if (f.value1) f.value1 = f.value1 / 100;
	}

	return f;
};
Filter.prototype.getAdjacents = function () {
	var i = this.scope.children.indexOf(this);
	return [
		i > 0 ? this.scope.children[i - 1] : null,
		this.scope.children[i + 1] || null,
	];
};
Filter.prototype.setLevel = function (level) {
	console.log(level);
	this.level = level;
	this.$.html.css({
		//	"margin-left": this.level * 20 + "px",
		//	background: `rgba(0, 0, 0, ${this.level * 0.2})`,
		"border-left": `${this.level * 20}px solid rgba(0,0,0,${this.level * 0.1})`,
	});
};
Filter.prototype.getLocalized = function () {
	var f = this.get();
	f.localization = this.$.html
		.find(".constraint")
		.not(".hidden")
		.find(".constraint-select option:selected")
		.text();

	return f;
};
Filter.prototype.initComponents = function () {
	this.$.html.find(".datetimesinglepicker").each(function () {
		if (this.value && $(this).data("daterangepicker")) {
			var old = moment(
				this.value,
				$(this).data("daterangepicker").locale.format
			);
		}

		var format = JSON.simpleCopy(
			i18n.t("components.daterangepicker.locale", { returnObjectTrees: true })
		);
		format.format = i18n.t("formats.datetime");

		$(this).daterangepicker({
			locale: {
				format: main.formats.date.toUpperCase() + " " + main.formats.time,
			},
			timePicker24Hour: true,
			autoUpdateInput: true,
			showWeekNumbers: true,
			singleDatePicker: true,
			timePicker: true,
			showDropdowns: true,
		});

		if (old) {
			this.value = old.format($(this).data("daterangepicker").locale.format);
		}
	});

	this.$.html.find(".datesinglepicker").each(function () {
		if (this.value && $(this).data("daterangepicker")) {
			var old = moment(
				this.value,
				$(this).data("daterangepicker").locale.format
			);
		}

		var format = JSON.simpleCopy(
			i18n.t("components.daterangepicker.locale", { returnObjectTrees: true })
		);
		format.format = i18n.t("formats.date");

		$(this).daterangepicker({
			locale: {
				format: main.formats.date.toUpperCase(),
			},
			autoUpdateInput: true,
			showWeekNumbers: true,
			singleDatePicker: true,
			showDropdowns: true,
		});

		if (old) {
			this.value = old.format($(this).data("daterangepicker").locale.format);
		}
	});

	this.$.html.find(".datetimerangepicker").each(function () {
		if (this.value && $(this).data("daterangepicker")) {
			var old_s = moment($(this).data("daterangepicker").startDate);
			var old_e = moment($(this).data("daterangepicker").endDate);
		}

		var format = JSON.simpleCopy(
			i18n.t("components.daterangepicker.locale", { returnObjectTrees: true })
		);
		format.format = i18n.t("formats.datetime");

		$(this).daterangepicker({
			locale: {
				format: main.formats.date.toUpperCase() + " " + main.formats.time,
			},
			startDate: moment().hour(0).minute(0),
			endDate: moment().hour(23).minute(45),
			timePicker24Hour: true,
			autoUpdateInput: true,
			timePickerIncrement: 15,
			showWeekNumbers: true,
			timePicker: true,
			showDropdowns: true,
			linkedCalendars: false,
		});

		if (old_s && old_e) {
			$(this).data("daterangepicker").setStartDate(old_s);
			$(this).data("daterangepicker").setEndDate(old_e);
		}
	});

	if (
		this.currentType === "string" &&
		this.shouldAutocomplete(this.currentField)
	) {
		const field = this.currentField;
		const opts = {
			id: `filterSelect_${field}_${Date.now()}`,
			type: "Select",
			searchUrl: this.scope.scope.settings.url,
			fields: [field],
			valueField: field,
			searchFields: [field],
			resultsTemplate: `<div>{{${field}}}</div>`,
			selectedTemplate: `<div>{{${field}}}</div>`,
			trimNullValues: true,
			allowNull: true,
			ignoreChange: true,
			allowNewOption: true,
			newOptionPrompt: "Pesquisar por ",
		};

		const select = new Form.Fields.Select(
			this,
			this.$.constraint
				.find(".constraint:not(.hidden) .filter-value .form-group")
				.empty(),
			opts
		);

		select.onChange(() => this.updateValues());
		select.set(
			this.currentValues[0] || (this.initialValues && this.initialValues[0])
		);
	}
	this.setupDom();
};
Filter.prototype.makeHandlers = function () {
	const self = this;
	this.handleRemove = (_) => self.removeSelf();
	this.handleUpdateConstraints = (_) => self.updateConstraints();
	this.handleUpdateInputs = (_) => self.updateInputs();
	this.handleUpdateValues = (_) => self.updateValues();
	this.handleRefresh = (ev) => ev.which == 13 && true; //self.grid.refresh(true);
};
Filter.prototype.setupDom = function () {
	var self = this;

	this.$.html
		.find(".rm-fltr")
		.off("click", this.handleRemove)
		.on("click", this.handleRemove);

	this.$.html
		.find(".field-select")
		.off("change", this.handleUpdateConstraints)
		.on("change", this.handleUpdateConstraints);

	this.$.html
		.find(".constraint-select")
		.off("change", this.handleUpdateInputs)
		.on("change", this.handleUpdateInputs);

	this.$.html
		.find("input")
		.off("ifChecked ifUnchecked change", this.handleUpdateValues)
		.on("ifChecked ifUnchecked change", this.handleUpdateValues);

	this.$.html
		.find("input")
		.off("keyup", this.handleRefresh)
		.on("keyup", this.handleRefresh);
};
Filter.prototype.updateConstraints = function () {
	this.currentField = this.$.html.find(".field-select").val();

	this.currentType = this.typemap[this.currentField].type;

	this.$.constraint.empty().append(
		Filters.Template(this.json, {
			data: {
				constraint: true,
				fieldType: this.currentType,
			},
		})
	);

	this.updateInputs();
	this.i18n();
};
Filter.prototype.removeSelf = function () {
	const self = this;
	console.log("removing self");
	const [up, down] = this.getAdjacents();
	let sibling = null;

	self.remove();

	// Filtros só têm ligações ao mesmo nivel e abaixo
	// Filtros com ligações têm sempre uma ao mesmo nivel

	if (up && up.level === this.level) {
		sibling = up.getAdjacents()[0];
		up.remove();
	} else if (down && down.level === this.level) {
		sibling = down.getAdjacents()[1];
		down.remove();
	}

	if (sibling) {
		let adj = sibling.getAdjacents().filter((x) => x);
		if (adj.length === 0) {
			sibling.setLevel(0);
		} else if (adj.length === 1) {
			sibling.setLevel(adj[0].level);
		} else if (adj.length === 2) {
			sibling.setLevel(Math.max(...adj.map((x) => x.level)));
		}
	}

	this.scope.fixLevels();
};
Filter.prototype.remove = function () {
	const self = this;

	self.scope.remove(self);
	this.$.html.slideUp(300, function () {
		self.$.html.remove();
	});
};
Filter.prototype.updateInputs = function () {
	var select = this.$.html
		.find(".constraint")
		.not(".hidden")
		.find("select.constraint-select");
	var _c = select.val();
	if (this._loaded) {
		this.currentConstraint = _c;
	} else {
		this.currentConstraint = this.currentConstraint || _c;
		select.val(this.currentConstraint);
		this._loaded = true;
	}
	var input = {
		string: {
			contains: "string",
			excludes: "string",
			equals: "string",
		},
		date: {
			lessThan: "date",
			greaterThan: "date",
			during: "date-day",
			between: "date-dual",
		},
		number: {
			greaterThan: "number",
			lessThan: "number",
			equals: "number",
			between: "number-dual",
			notEqual: "number",
		},
		boolean: {
			equals: "boolean",
			notEqual: "boolean",
		},
	}[this.currentType][this.currentConstraint];

	this.$.html.find(".filter-value").children().addClass("hidden");

	this.$.html
		.find(".filter-value")
		.children(".filter-" + input)
		.removeClass("hidden");
	this.updateValues();
};
Filter.prototype.updateValues = function () {
	var self = this;
	this.currentValues = [];
	this.$.html
		.find(".filter-value")
		.children()
		.not(".hidden")
		.find("input.filter-val")
		.each(function () {
			if ($(this).data("daterangepicker")) {
				self.currentValues.push(
					$(this).data("daterangepicker").startDate.format()
				);
				if ($(this).is(".datetimerangepicker"))
					self.currentValues.push(
						$(this).data("daterangepicker").endDate.format()
					);
			} else if (this.type === "number") {
				self.currentValues.push(parseFloat(this.value));
			} else {
				self.currentValues.push(
					this.type === "checkbox" ? this.checked : this.value
				);
			}
		});

	this.$.html.find(".filter-value select").each(function () {
		self.currentValues.push($(this).val());
	});
};

Filter.prototype.is = scopeCompare;
Filter.prototype._ = scopeInterface;

function FilterHR(scope, container, json, values, level) {
	this.scope = scope;
	this.container = container;
	this.$ = {};
	this.$.container = $(this.container);
	this.json = json;

	this.grid = this._("^grid")[0];

	this.logicalOperator = values || "AND";
	this.level = level || 0;

	this.init();
}

FilterHR.prototype.init = function () {
	var self = this;
	this.html = `
		<div style="display:flex;align-items:center;">
			<button style="margin: 0 5px 0 5px" class="btn btn-xs btn-default">
				<i class="fa fa-fw fa-chevron-left"></i>
			</button>
			<span style="margin: 5px;">E</span>
			<div style="display: inline-block" class="checkbox checkbox-slider--c checkbox-slider-success">
				<label>
					<input ${
						this.logicalOperator === "OR" ? "checked" : ""
					} type="checkbox" data-id="operation">
					<span style="padding-left:22px;"></span>
				</label>
			</div>
			<span style="margin: 5px;">OU2</span>
			<button style="margin-left: 5px;" class="btn btn-xs btn-default">
				<i class="fa fa-fw fa-chevron-right"></i>
			</button>
			<div style="flex-grow:1;">	<hr /> </div>
		</div>
	`;

	this.$.html = $(this.html);
	this.$.container.append(this.$.html);
	this.$.constraint = this.$.html.find(".constraint-container");

	this.setLevel(this.level);
	this.bind();
};
FilterHR.prototype.bind = function () {
	this.$.html.find("input").on("change", (ev) => {
		this.logicalOperator = ev.currentTarget.checked ? "OR" : "AND";
	});
	this.$.html
		.find(".fa-chevron-left")
		.parent()
		.on("click", (_) => {
			if (this.level > 0) {
				this.setLevel(this.level - 1);

				var adjacents = this.getAdjacents();

				for (const a of adjacents) {
					if (a === null) continue;
					let aa = a.getAdjacents().map((x) => (x === null ? -1 : x.level));
					a.setLevel(Math.max(...aa));
				}
			}
		});

	this.$.html
		.find(".fa-chevron-right")
		.parent()
		.on("click", (_) => {
			console.log("stuff", this.scope.children);
			var adjacents = this.getAdjacents();
			var siblings = adjacents.flatMap((a) => a.getAdjacents());
			var edges = [siblings[0], siblings[3]];

			if (
				this.level > 0 &&
				Math.max(...edges.map((x) => (x === null ? -1 : x.level))) < this.level
			)
				return;

			this.setLevel(this.level + 1);

			console.log(adjacents);
			for (const a of adjacents) {
				console.log(a.level, this.level);
				if (a.level < this.level) a.setLevel(this.level);
			}
		});
};

FilterHR.prototype.setLevel = function (level) {
	this.level = level;
	this.$.html.css({
		//	"margin-left": this.level * 20 + "px",
		//	background: `rgba(0, 0, 0, ${this.level * 0.2})`,
		"border-left": `${this.level * 20}px solid rgba(0,0,0,${this.level * 0.1})`,
	});
};
FilterHR.prototype.getAdjacents = function () {
	var i = this.scope.children.indexOf(this);
	return [
		i > 0 ? this.scope.children[i - 1] : null,
		this.scope.children[i + 1] || null,
	];
};
FilterHR.prototype.i18n = function () {};
FilterHR.prototype.get = function () {
	return {
		logicalOperator: this.logicalOperator,
		level: this.level,
	};
};
FilterHR.prototype.getLocalized = function () {
	return {
		logicalOperator: this.logicalOperator,
		level: this.level,
	};
};
FilterHR.prototype.setupDom = function () {
	var self = this;
};
FilterHR.prototype.remove = function () {
	var self = this;
	console.log("removing HR");
	self.scope.remove(self);
	this.$.html.slideUp(300, function () {
		console.log("removing HR cb");
		self.$.html.remove();
	});
};

FilterHR.prototype.is = scopeCompare;
FilterHR.prototype._ = scopeInterface;

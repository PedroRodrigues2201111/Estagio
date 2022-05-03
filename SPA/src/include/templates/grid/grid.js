function Grid(scope, container, json, opts) {
	this.scope = scope;
	this.children = [];
	this.opts = opts;
	this.container = container;
	this.view = this._("^view").get(0);
	this.actions = this.view.Actions.grid;

	this.updatePermissions = (_) => this.refresh();
	this.permissions = main.permissions.onChange(this.updatePermissions);

	this.tab = this._("<tab")[0];

	this.$ = {};
	this.$.container = $(this.container);
	this.$.container.data("componentRef", this);

	this.changeListeners = [];

	this.on = {};
	this.on.ready = function () {};

	this.storage = this._("<mainController")[0].storage;

	this.json = JSON.simpleCopy(json);

	this.id = this.json.id;

	var self = this;
	this.init()
		.then(function () {
			self.on.ready(self);
		})
		.catch(function (err) {
			console.error(err);
		});
}
Grid.prototype.init = function () {
	var self = this;
	// merge options
	this.initPromise = new Promise(function (resolve, reject) {
		// Check permissions on Columns
		self.json.fields = self.json.fields.filter((f) => {
			if (!f.permissions) return true;

			var K = Object.keys(f.permissions);
			var userPermissions = main.permissions.get();

			for (let i = 0; i < K.length; i++) {
				if (userPermissions.indexOf(K[i]) === -1) return false;
			}

			return true;
		});

		if (self.json.on) {
			if (self.json.on.ready && self.actions[self.json.on.ready])
				self.on.ready = self.actions[self.json.on.ready];
		}
		self.json.datatable = self.json.datatable || {};
		self.json.datatable.columns = Grid.factory.columns(
			self.json.fields,
			self.actions,
			self
		);

		var settings = {}.deepMerge(Grid.dataTablesDefaults);

		if (self.json.datatable) settings.deepMerge(self.json.datatable);

		self.fixed = 1;
		// Add the buttons as the second column
		if (self.json.buttons && self.json.buttons.length > 0) {
			self.json.datatable.columns.unshift(
				Grid.factory.buttons(self.json.buttons, self)
			);
			settings.colReorder.fixedColumnsLeft = 2;
			self.fixed = 2;
		}

		if (self.json.order) {
			settings.order = self.json.order;
		}

		if (self.json["no-pages"]) {
			self.$.container.addClass("no-pages");
		}

		if (settings.order) {
			settings.order = settings.order.map(function (v) {
				return [v[0] + self.fixed, v[1]];
			});
		} else {
			settings.order = [];
		}

		self.visibles = {};

		self.json.fields
			.filter(function (f) {
				return f.visibility !== "none" && f.field !== undefined;
			})
			.forEach(function (f) {
				self.visibles[f.field] =
					f.visibility !== "hidden" && f.type !== "hidden";
			});

		// Not supported
		// Breaks both cell selection, footers, and causes issues with ColVis
		settings.colReorder = false;

		// Add the checkboxes as the first column
		self.json.datatable.columns.unshift(Grid.factory.checkboxes(self));

		// Build our .get function
		if (!self.view.getUrls()[self.json.getUrl]) {
			/*console.error('Can\'t find "getUrl" for grid.');
      return;*/
			settings.url = self.json.getUrl.fillWith(self.opts);
		} else {
			settings.url = self.view.getUrls()[self.json.getUrl].fillWith(self.opts);
		}
		settings.ajax = Grid.factory.ajaxGet(settings.url, self);

		self.settings = settings;

		if (!self.json.hasOwnProperty("controls")) {
			self.json.controls = JSON.simpleCopy(Grid.defaultControls);
		} else {
			if (self.json.controls !== false)
				self.json.controls = JSON.simpleCopy(Grid.defaultControls).deepMerge(
					self.json.controls
				);
		}

		self.html = Grid.Template(self.json, {
			helpers: {
				getFieldTitle: function (title) {
					try {
						return self.json.fields.find(function (f) {
							return f.field === title;
						}).i18n;
					} catch (e) {
						console.log(e);
					}
				},
			},
		});
		self.$.html = $(self.html);

		self.$.table = self.$.html.filter("table");

		self.$.table.append("<thead></thead>").append("<tfoot><tr></tr></tfoot>");
		self.$.container.append(
			$('<div style="padding: 5px;" class="box">').append(self.$.html)
		);

		self.setupDataTable();

		self.bindLiveEvents();

		self.lastState = self.storage.get("grids." + self.json.id);
		self.currentFontSize = 1;
		if (self.lastState) {
			self.setPage(self.lastState.page);
			self.setVisibility(self.lastState.visibility);
			self.setResultsPerPage(self.lastState.resultsPerPage);
			self.lastState.filters.forEach(function (f) {
				console.log(f.logicalOperator);
				self.filters.add(
					f.field,
					f.constraint,
					f.logicalOperator != null ? f.logicalOperator : [f.value, f.value1],
					null,
					f.logicalOperator != null,
					f.level
				);
			});
			self.$.table[0].style.setProperty(
				"font-size",
				self.lastState.textSize + "em",
				"important"
			);
			self.currentFontSize = self.lastState.textSize;
			try {
				self.setOrder(self.lastState.sort).draw();
			} catch (err) {}
		} else {
			self.lastState = JSON.simpleCopy(self.getState());
		}

		self.processState();

		self.tab.boundElements.forEach(function (h) {
			if (h.componentReady) h.componentReady(self.json.id, self);
		});

		self.firstLoad = true;
		self.deferred = true; //self.json.defer;

		self.i18n();

		self.$.dtWrapper.on("draw.dt", function () {
			self.$.dtWrapper.i18n();
		});

		resolve();
	});

	return this.initPromise;
};
Grid.prototype.eventActions = function (act) {
	var self = this;
	var actions = {
		refresh: function () {
			self.refresh();
		},
	};
	return actions[act];
};
Grid.prototype.bindLiveEvents = function (p) {
	var self = this;
	this.$.search = this.$.container.find(".grid-search > input");
	this.$.search.on("keyup", function (ev) {
		if (ev.which === 13) self.refresh();
	});

	if (!this.json.events) return;

	var alerts = this._("<maincontroller").find(">alertcontroller")[0];
	var actions = this.actions;

	this.json.events.forEach(function (v, k) {
		var _k = k.split(".");
		var ns = _k[0];
		var event = _k[1];
		var action = null;

		if (v[0] === ":") {
			v = v.substring(1);
			action = actions[v];
		} else {
			action = self.eventActions(v);
		}

		if (!action) {
			console.error('No such handler "' + v + '" for event "' + k + '".');
		}

		alerts.on(ns, event, action);
	});
};
Grid.prototype.setPage = function (p) {
	this.dt.api().page(p);
};
Grid.prototype.setVisibility = function (v) {
	var self = this;
	var vis = self.$.html.find(".grid-vis .menu");
	v.forEach(function (v, k) {
		vis
			.children('[data-field="' + k + '"]')
			.find("input")
			.prop("checked", v)
			.trigger("click");
	});
};
Grid.prototype.setOrder = function (o) {
	if (o.length === 0) return;

	return this.dt.api().order(o);
};
Grid.prototype.setResultsPerPage = function (l) {
	this.dt.api().page.len(l);
};
Grid.prototype.onReady = function (callback) {
	var self = this;
	this.initPromise
		.then(function () {
			callback(self);
		})
		.catch(function () {
			console.warn("Error in Grid[ " + self.json.id + " ] onReady.");
		});
};
Grid.prototype.postGet = function () {
	for (var i = 0; i < this.changeListeners.length; i++) {
		this.changeListeners[i](this.getSelected(), this);
	}
};

Grid.prototype.i18n = function () {
	var oLang = i18n.t("plugins.datatables", { returnObjectTrees: true });

	// Change inner language object
	this.dt.fnSettings().oLanguage.deepMerge(oLang);

	// Redraw what little is possible
	this.dt._fnDraw();

	// Manually update other elements without redrawing them (to keep bindings)

	// starting with 'records per page'
	var len = this.$.container.find(".dataTables_length label").get(0);

	// remove all nodes until only the Select is left
	for (var i = 0; len.childNodes.length > 1; ) {
		if (len.childNodes[i].nodeName === "#text") {
			len.removeChild(len.childNodes[i]);
		} else {
			i++;
		}
	}

	var len_menu = len.childNodes[0];

	var len_parts = oLang.sLengthMenu.split("_MENU_");
	var len_after = document.createTextNode(len_parts[1]);

	if (len_parts[0]) {
		var len_before = document.createTextNode(len_parts[0]);
		len.insertBefore(len_before, len_menu);
	}
	if (len_parts[1]) {
		var len_after = document.createTextNode(len_parts[1]);
		len.appendChild(len_after);
	}

	// Handle table headers
	this.$.container.i18n();
};
Grid.prototype.setupDataTable = function () {
	var self = this;

	this.settings.dom =
		'<"table-responsive"t><"footwheel"<"pull-left"i><"pull-right"p><"center-block text-center"l>>';
	this.settings.footerCallback = function (row, data, start, end, display) {
		if (!self.dt) return;

		var api = self.dt.api();
		$(api.table().footer()).html("");
		if (!self.footerData || !self.footers) {
			return;
		}
		self.dt
			.find("tfoot")
			.append(
				$(
					"<tr>" +
						"<td></td>".repeat(
							self.$.dtWrapper.find("thead > tr > th").length
						) +
						"</tr>"
				)
			);

		self.footerData.forEach(function (v) {
			if (self.footers[v.column] === undefined) {
				return;
			}

			var col = api.column(v.column + ":name")[0][0];

			api.column(v.column + ":name").footer("" + v.value + " ");

			var th = $(api.table().footer()).children().children()[col];
			var $th = $(th);

			$th.html(
				(self.footers[v.column].i18n
					? '<div data-i18n="' +
					  self.footers[v.column].i18n +
					  '">' +
					  i18n.t(self.footers[v.column].i18n) +
					  "</div> "
					: "") +
					v.value +
					" "
			);
		});
	};

	if (this.json.groupSelect) {
		let rowGroupClick = function (rows) {
			const $rows = [];
			rows.every(function () {
				$rows.push($(this.node()));
			});

			if ($rows.every(($r) => $r.find(".col_check input").is(":checked"))) {
				$rows.forEach(($r) =>
					$r.find(".col_check input").each(function () {
						this.checked = false;
						$(this).closest("tr").removeClass("selected");
					})
				);
			} else {
				$rows.forEach(($r) =>
					$r.find(".col_check input").each(function () {
						this.checked = true;
						$(this).closest("tr").addClass("selected");
					})
				);
			}

			self.$.dtWrapper
				.find("tbody")
				.trigger("selects.process")
				.trigger("checkbox.process");
		};

		this.settings.rowGroup.startRender = (rows, group) => {
			let $btn = $(`
				<button type="button" class="btn-flat btn btn-xs btn-default">
					${group}
				</button>
			`);
			$btn.on("click", (_) => rowGroupClick(rows));
			return $btn;
		};
	}

	this.dataTable = this.$.table.DataTable(this.settings);
	if (this.json.defaultGroup) {
		let colIndex = self.dataTable
			.column(this.json.defaultGroup + ":name")
			.index();

		self.dataTable.order.fixed({
			pre: self.json["pre-sort"]
				? [
						...self.json["pre-sort"],
						[colIndex, "desc"],
						...self.json["pre-post-sort"],
				  ]
				: [colIndex, "desc"],
		});
		self.dataTable.rowGroup().dataSrc(this.json.defaultGroup).draw("gui");
		this.$.html.find(".grid-row-grouping select").val(this.json.defaultGroup);
	} else {
		this.dataTable.rowGroup().disable();
	}

	this.dt = this.$.table.dataTable();

	window.gg = this.dt;

	this.$.dtWrapper = this.$.table.closest(".dataTables_wrapper");
	this.setupGridTools();
	this.setupEvents();
	this.setupGridFilters();

	// setup search field
	// TODO
};
Grid.prototype.setupGridTools = function () {
	var self = this;
	var $tbody = this.$.table.find("tbody");

	this.selectionMode = "rows";

	// Create a hidden container to copy from
	var copyContainer = document.createElement("textarea");

	this.$.container
		.find(".grid-export .menu > li[data-id]")
		.on("click", function () {
			var data = JSON.simpleCopy(self.lastData);
			var format = $(this).data("id");
			//    data.format = format;

			data.titles = self.json.fields.reduce(function (p, v) {
				p[v.field] = i18n.t(v.i18n);
				return p;
			}, {});

			if (data.hasOwnProperty("start")) delete data.start;
			if (data.hasOwnProperty("draw")) delete data.draw;
			if (data.hasOwnProperty("length")) delete data.length;

			var title = i18n.t(self._("<tab")[0].boundElements[0].json["title-i18n"]);

			if (data.hasOwnProperty("search"))
				data.search = self.filters.getLocalized();

			data.viewTitle = title;

			data.visibility = self.visibles
				.map(function (f, k) {
					return [k, f];
				})
				.filter(function (f) {
					return f[1];
				})
				.map(function (f) {
					return f[0];
				});

			self.$.container.boxBusy();

			Tools.Ajax.defaultPost(self.settings.url, data)
				.then(function (b) {
					var list = [];

					var fieldIndex = {};
					data.fields.forEach(function (field) {
						fieldIndex[field] = self.json.fields.find(function (f) {
							return f.field === field;
						});
					});

					if (format === "csv") {
						// make headers
						list.push(
							data.fields
								.map(function (f) {
									if (data.visibility.indexOf(f) === -1) return false;
									return data.titles[f];
								})
								.filter(function (f) {
									return f !== false;
								})
						);

						// push data
						list = list
							.concat(
								b.data.map(function (d) {
									return data.fields
										.map(function (f) {
											if (data.visibility.indexOf(f) === -1) return false;
											if (fieldIndex[f].type === "date") {
												return moment(d[f]).format(
													i18n.t("app.formats.datetime")
												);
											}

											if (d[f] && d[f]["$id"]) {
												delete d[f]["$id"];
											}

											return d[f];
										})
										.filter(function (f) {
											return f !== false;
										})
										.join(",");
								})
							)
							.join("\n");
					} else if (format === "json") {
						// push data
						var titles = {};
						data.titles.forEach(function (v, k) {
							if (data.visibility.indexOf(k) === -1) return;
							titles[k] = v;
						});
						list = JSON.stringify({
							data: b.data.map(function (d) {
								var o = {};
								data.fields.forEach(function (f) {
									if (data.visibility.indexOf(f) === -1) return;
									o[f] = d[f];
								});
								return o;
							}),
							titles: titles,
						});
					} else if (format === "xlsx") {
						var gnn = function (num) {
							if (num < 1) return "";

							var ltrs = " ABCDEFGHIJKLMNOPQRSTUVWXYZ";

							var str = "";

							while (num > 0) {
								str = ltrs.charAt(num % 26) + str;
								num = (num / 26) | 0;
							}
							return str;
						};
						list = {};

						list[1] = data.fields
							.map(function (f) {
								if (data.visibility.indexOf(f) === -1) return false;
								return {
									value: data.titles[f],
									type: "str",
									s: 2,
								};
							})
							.filter(function (f) {
								return f !== false;
							});
						var ll = {};
						for (var i = 0; i < list[1].length; i++) {
							ll[gnn(i + 1)] = list[1][i];
						}
						list[1] = ll;

						b.data.forEach(function (d, i) {
							i = i + 1; // account for headers
							list[i + 1] = {};
							var j = 1;
							data.fields.forEach(function (f) {
								var type = fieldIndex[f].subtype || fieldIndex[f].type;
								if (data.visibility.indexOf(f) === -1) return;

								if (type === "date") {
									if (d[f] != null) {
										console.log(d[f], moment(d[f]));
										list[i + 1][gnn(j)] = {
											value:
												/*(moment(d[f]).format("X") -
													new Date().getTimezoneOffset() * 60)*/
												moment.utc(d[f]).format("X") / 86400 + 25569,
											type: "d",
										};
									} else {
										list[i + 1][gnn(j)] = {
											value: null,
											type: "d",
										};
									}
								} else if (type === "number") {
									list[i + 1][gnn(j)] = {
										value: d[f],
										type: "n",
									};
								} else if (type === "boolean") {
									list[i + 1][gnn(j)] = {
										value:
											d[f] === true ||
											d[f] === "S" ||
											d[f] === "1" ||
											d[f] === 1
												? 1
												: 0,
										type: "b",
									};
								} else {
									list[i + 1][gnn(j)] = {
										value: d[f],
										type: "str",
									};
								}

								j++;
							});
						});
						list = (function () {
							var zip = new JSZip();

							var xlsx_rels = Grid.Template(
								{ list: list },
								{ data: { xlsx_rels: true } }
							)
								.replace(/^\s+\</g, "<")
								.replace(/\>\s+\</g, "><")
								.replace(/\>\s+$/g, ">");

							zip.file(
								"_rels/.rels",
								new Blob(["\uFEFF" + xlsx_rels], {
									type: "text/xml;charset=utf-8",
								})
							);

							var xlsx_workbook_rels = Grid.Template(
								{ list: list },
								{ data: { xlsx_workbook_rels: true } }
							)
								.replace(/^\s+\</g, "<")
								.replace(/\>\s+\</g, "><")
								.replace(/\>\s+$/g, ">");

							zip.file(
								"xl/_rels/workbook.xml.rels",
								new Blob(["\uFEFF" + xlsx_workbook_rels], {
									type: "text/xml;charset=utf-8",
								})
							);

							var xlsx_content_types = Grid.Template(
								{ list: list },
								{ data: { xlsx_content_types: true } }
							)
								.replace(/^\s+\</g, "<")
								.replace(/\>\s+\</g, "><")
								.replace(/\>\s+$/g, ">");

							zip.file(
								"[Content_Types].xml",
								new Blob(["\uFEFF" + xlsx_content_types], {
									type: "text/xml;charset=utf-8",
								})
							);

							var xlsx_workbook = Grid.Template(
								{ list: list },
								{ data: { xlsx_workbook: true } }
							)
								.replace(/^\s+\</g, "<")
								.replace(/\>\s+\</g, "><")
								.replace(/\>\s+$/g, ">");

							zip.file(
								"xl/workbook.xml",
								new Blob(["\uFEFF" + xlsx_workbook], {
									type: "text/xml;charset=utf-8",
								})
							);

							var xlsx_styles = Grid.Template(
								{ list: list },
								{ data: { xlsx_styles: true } }
							)
								.replace(/^\s+\</g, "<")
								.replace(/\>\s+\</g, "><")
								.replace(/\>\s+$/g, ">");

							zip.file(
								"xl/styles.xml",
								new Blob(["\uFEFF" + xlsx_styles], {
									type: "text/xml;charset=utf-8",
								})
							);

							var xlsx_sheet = Grid.Template(
								{ list: list },
								{ data: { xlsx_sheet: true } }
							)
								.replace(/^\s+\</g, "<")
								.replace(/\>\s+\</g, "><")
								.replace(/\>\s+$/g, ">");

							zip.file(
								"xl/worksheets/sheet.xml",
								new Blob(["\uFEFF" + xlsx_sheet], {
									type: "text/xml;charset=utf-8",
								})
							);

							zip.generateAsync({ type: "blob" }).then(function (data) {
								download(
									data,
									title + ".xlsx",
									"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
								);
								self.$.container.boxUnBusy();
							});
						})();
						return;
					}

					download(
						list,
						title + "." + format,
						{
							html: "text/html",
							xls: "application/vnd.ms-excel",
							xlsx:
								"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
							xml: "application/vnd.ms-excel",
							csv: "plain/text",
							pdf: "application/pdf",
						}[format]
					);
					self.$.container.boxUnBusy();
				})
				.catch(function () {
					console.warn("err", arguments);
				});
		});
	var $prompt = this.$.html.find(".grid-copy-prompt");
	copyContainer.addEventListener("focus", function () {
		this.select();
		if ($(this).val().length > 0) $prompt.addClass("active");
	});
	copyContainer.addEventListener("blur", function () {
		$prompt.removeClass("active");
	});
	self.allSelected = false;
	var $status = self.$.container.find(".select-everything");
	$status.on("click", "a", function () {
		if (!self.allSelected) {
			self.allSelected = true;
			$status
				.html(
					i18n.t("app.grid.selected-all").fillWith({
						selected: self.curPageSize,
						total: self.totalSelectable,
					})
				)
				.addClass("active");

			for (var i = 0; i < self.changeListeners.length; i++) {
				self.changeListeners[i](self.getSelected(), self);
			}
		} else {
			self.allSelected = false;

			$status.addClass("hidden").removeClass("active");
			self.$.dtWrapper
				.find(".col_check input:checked")
				.each(function () {
					this.checked = false;
					$(this).closest("tr").removeClass("selected");
				})
				.closest("tbody")
				.trigger("selects.process")
				.trigger("checkbox.process");
		}
	});
	copyContainer.className = "hiddenCopyField hidden-xs";
	$("body").append(copyContainer);

	// Unselect and clean text from container if user clicks outside
	var tc = this.$.dtWrapper;

	// add only on mode
	var modes = {
		rows: {
			button: this.$.container.find(
				'.grid-select-mode-options > i[data-mode="rows"]'
			),
			start: function () {
				modes.rows.button.addClass("selected");
				$tbody.on("click", "tr", handleRowClick);
				$tbody.addClass("row-select");
			},
			stop: function () {
				modes.rows.button.removeClass("selected");
				$tbody.off("click", "tr", handleRowClick);
				$tbody.removeClass("row-select");
			},
		},
		cells: {
			button: this.$.container.find(
				'.grid-select-mode-options > i[data-mode="cells"]'
			),
			start: function () {
				$tbody.on("mousedown", "td", beginCellSelection);
				$(window).on("mousedown", clearCellSelection);

				$tbody.find("td").eq(self.fixed).addClass("first-selected-cell");

				modes.cells.button.addClass("selected");
				$tbody.addClass("cell-select");
			},
			stop: function () {
				$tbody.off("mousedown", "td", beginCellSelection);
				$(window).off("mousedown", clearCellSelection);

				$tbody
					.find(".td-selected")
					.removeClass("td-selected top bottom left right first-selected-cell");

				modes.cells.button.removeClass("selected");
				$tbody.removeClass("cell-select");
			},
		},
		text: {
			button: this.$.container.find(
				'.grid-select-mode-options > i[data-mode="text"]'
			),
			start: function () {
				modes.text.button.addClass("selected");
			},
			stop: function () {
				modes.text.button.removeClass("selected");
			},
		},
	};
	function clearCellSelection() {
		$tbody
			.find(".td-selected")
			.removeClass("td-selected top bottom left right");
	}
	function beginCellSelection(ev) {
		ev.stopPropagation();

		var $this = $(this);

		if ($this.index() < self.fixed) {
			return;
		}

		if (ev.shiftKey) {
			$(window).on("mouseup", endCellSelection);
			$tbody.on("mouseover", "td", moveCellSelection);
			$this.trigger("mouseover");
			$this.trigger("mouseup");
			return;
		}

		$tbody.find(".first-selected-cell").removeClass("first-selected-cell");
		$this.addClass("first-selected-cell");

		$(window).on("mouseup", endCellSelection);
		$tbody.on("mouseover", "td", moveCellSelection);
		$this.trigger("mouseover");
	}

	function moveCellSelection(ev) {
		var $this = $(this);
		var $other = $tbody.find(".first-selected-cell");
		var lX, hX, lY, hY;
		var oi = $other.index(),
			ti = $this.index(),
			opi = $other.parent().index(),
			tpi = $this.parent().index();
		if (oi > ti) {
			lX = ti;
			hX = oi;
		} else {
			lX = oi;
			hX = ti;
		}
		if (opi > tpi) {
			lY = tpi;
			hY = opi;
		} else {
			lY = opi;
			hY = tpi;
		}

		if (hX < self.fixed) {
			return;
		}

		if (lX < self.fixed) {
			lX = self.fixed;
		}

		$tbody
			.children("tr")
			.children("td.td-selected")
			.removeClass("td-selected top bottom left right");
		$tbody
			.children("tr")
			.slice(lY, hY + 1)
			.each(function (i) {
				var trs = $(this)
					.children("td")
					.slice(lX, hX + 1)
					.addClass("td-selected");
				if (i === 0) {
					trs.addClass("top");
				}
				if (i === hY - lY) {
					trs.addClass("bottom");
				}
				trs.first().addClass("left");
				trs.last().addClass("right");
			});
	}
	function endCellSelection(ev) {
		$(window).off("mouseup", endCellSelection);
		$tbody.off("mouseover", "td", moveCellSelection);
		$tbody.trigger("selects.process");
	}

	this.$.html
		.find(".grid-row-grouping select")
		.on("click", function (ev) {
			ev.stopPropagation();
		})
		.on("change", function (ev) {
			if (this.value === "none") {
				self.dataTable.order.fixed({
					pre: [],
				});
				self.dataTable.rowGroup().disable().draw();
			} else {
				let colIndex = self.dataTable
					.column(self.json.defaultGroup + ":name")
					.index();
				self.dataTable.order.fixed({
					pre: self.json["pre-sort"]
						? [
								...self.json["pre-sort"],
								[colIndex, "desc"],
								...self.json["pre-post-sort"],
						  ]
						: [colIndex, "desc"],
				});
				self.dataTable.rowGroup().enable().dataSrc(this.value).draw("gui");
			}
		});

	var currentSize = 1;
	this.$.html.find(".grid-text-options-options > i").on("click", function (ev) {
		ev.preventDefault();
		ev.stopPropagation();
		var $this = $(this);

		var sizes = [0.7, 0.85, 1, 1.2, 1.5];
		currentSize =
			sizes[
				Math.min(
					sizes.length - 1,
					Math.max(
						0,
						sizes.indexOf(currentSize) +
							($this.data("mode") === "minus" ? -1 : 1)
					)
				)
			];
		self.currentFontSize = currentSize;
		self.$.table[0].style.setProperty(
			"font-size",
			currentSize + "em",
			"important"
		);
		self.processState();

		//fontSize = currentSize + "em !important";
		//self.$.table.css("font-size", currentSize + "em !important");
	});

	this.$.html.find(".grid-select-mode-options > i").on("click", function () {
		var $this = $(this);
		var mode = $this.data("mode");

		if (modes[mode]) {
			modes[self.selectionMode].stop();
			modes[mode].start();
			self.selectionMode = mode;
		}
	});

	$tbody.on("checkbox.process", function () {
		if ($tbody.find('input[type="checkbox"]:not(:checked)').length > 0) {
			self.$.dtWrapper
				.find('thead input[type="checkbox"]')
				.prop("checked", false);
			if ($tbody.find('input[type="checkbox"]:checked').length > 0) {
				self.$.dtWrapper
					.find('thead input[type="checkbox"]')
					.prop("indeterminate", true)
					.data("indeterminate", true);
			} else {
				self.$.dtWrapper
					.find('thead input[type="checkbox"]')
					.prop("indeterminate", false)
					.data("indeterminate", false);
			}
			self.allSelected = false;
			self.$.container
				.find(".select-everything")
				.addClass("hidden")
				.removeClass("active");
		} else {
			self.$.dtWrapper
				.find('thead input[type="checkbox"]')
				.prop("checked", true)
				.prop("indeterminate", false)
				.data("indeterminate", false);
		}
	});
	this.$.dtWrapper.on("draw.dt", function () {
		$tbody.trigger("checkbox.process");
	});

	$tbody.on("change", 'input[type="checkbox"]', function (ev) {
		var $this = $(this);
		var $tr = $this.closest("tr");

		ev.preventDefault();
		ev.stopPropagation();

		if (this.checked) {
			$tr.addClass("selected");
		} else {
			$tr.removeClass("selected");
		}

		$tbody.trigger("selects.process");
		$tbody.trigger("checkbox.process");
	});

	$tbody.on("selects.process", function (ev) {
		// Get this from json
		if (self.selectionMode === "rows") {
			// if rows

			var selects = self.$.dtWrapper.find("tr.selected").toArray();
			var selectIds = [];
			var info = [];
			for (var i = 0; i < selects.length; i++) {
				var pos = self.dt.fnGetPosition(selects[i]);
				var row = self.dt.fnGetData(pos);

				// Ids from selected users. might be useful for multiple deletes
				selectIds.push(row.UserId);

				info.push(
					self.json.fields
						.map(function (v) {
							return v.copyTemplate(row);
						})
						.join("\t")
				);
			}
			copyContainer.value = info.join("\n");
			copyContainer.focus();
			copyContainer.select();
		} else if (self.selectionMode === "cells") {
			// get api
			var api = self.dt.api();

			// get selecteds
			var trs = $tbody
				.find("tr:has(.td-selected)")
				.map(function () {
					var tr = this;
					var $tr = $(tr);

					var rowData = api.row(tr).data();

					return $tr
						.children(".td-selected")
						.map(function () {
							var td = this;

							var colIndex = api.cell(td).index().column;
							var field = api.column(colIndex).dataSrc();

							if (self.colIndex[field].copyTemplate) {
								return self.colIndex[field].copyTemplate(rowData);
							}
						})
						.get()
						.join("\t");
				})
				.get()
				.join("\n");
			copyContainer.value = trs;
			copyContainer.focus();
			copyContainer.select();
		}

		// fire change listeners
		for (var i = 0; i < self.changeListeners.length; i++) {
			self.changeListeners[i](self.getSelected(), self);
		}
	});

	var dt = Date.now();
	var $topCheck = $(
		'<div class="checkboxb checkbox-primary checkbox-inline"><input id="all_cb_' +
			dt +
			'" type="checkbox" /><label for="all_cb_' +
			dt +
			'"></label></div>'
	);
	this.$.dtWrapper.find("thead th:first-child").prepend($topCheck);

	this.$.html
		.find(".grid-status-buttons .grid-select-options > .grid-select-all")
		.on("click", function () {
			self.$.dtWrapper
				.find(".col_check input:not(:checked)")
				.each(function () {
					this.checked = true;
					$(this).closest("tr").addClass("selected");
				})
				.closest("tbody")
				.trigger("selects.process")
				.trigger("checkbox.process");

			if (self.curPageSize < self.totalSelectable)
				self.$.container
					.find(".select-everything")
					.html(
						i18n.t("app.grid.selected-page").fillWith({
							selected: self.curPageSize,
							total: self.totalSelectable,
						})
					)
					.removeClass("hidden");
		});
	this.$.html
		.find(".grid-status-buttons .grid-select-options > .grid-select-none")
		.on("click", function () {
			self.$.dtWrapper
				.find(".col_check input:checked")
				.each(function () {
					this.checked = false;
					$(this).closest("tr").removeClass("selected");
				})
				.closest("tbody")
				.trigger("selects.process")
				.trigger("checkbox.process");
		});
	this.$.html
		.find(".grid-status-buttons .grid-select-options > .grid-select-inverse")
		.on("click", function () {
			self.$.dtWrapper
				.find(".col_check input")
				.each(function () {
					this.checked = !this.checked;
					$(this).closest("tr").toggleClass("selected");
				})
				.closest("tbody")
				.trigger("selects.process")
				.trigger("checkbox.process");
		});

	$topCheck.find("input").on("change", function (ev) {
		if (this.checked && !$(this).data("indeterminate")) {
			self.$.dtWrapper
				.find(".col_check input:not(:checked)")
				.each(function () {
					this.checked = true;
					$(this).closest("tr").addClass("selected");
				})
				.closest("tbody")
				.trigger("selects.process");

			if (self.curPageSize < self.totalSelectable)
				self.$.container
					.find(".select-everything")
					.html(
						i18n.t("app.grid.selected-page").fillWith({
							selected: self.curPageSize,
							total: self.totalSelectable,
						})
					)
					.removeClass("hidden");
		} else {
			this.checked = false;
			self.$.dtWrapper
				.find(".col_check input:checked")
				.each(function () {
					this.checked = false;
					$(this).closest("tr").removeClass("selected");
				})
				.closest("tbody")
				.trigger("selects.process");

			self.allSelected = false;
			self.$.container
				.find(".select-everything")
				.addClass("hidden")
				.removeClass("active");
		}
		$(this).data("indeterminate", false);
	});

	function handleRowClick(ev) {
		var $this = $(this);

		if ($(ev.target).is("a") || $(ev.target).parent().is("a")) return;

		if ($(ev.target).closest("td").index() < self.fixed) return;

		if ($(ev.target).is(".grid-btn")) return;

		if ($this.parent().children("tr.previous").length === 0) {
			$this.parent().children("tr:first").addClass("previous");
		}

		// replication of windows Explorer Selection behaviour
		//   to be honest I'm not a fan of using css classes for row states

		if (ev.shiftKey && ev.ctrlKey) {
			if ($this.hasClass("previous")) {
			} else if ($this.prevAll(".previous").length > 0) {
				$this.prevUntil(".previous").addClass("selected");
				$this.siblings(".previous").addClass("selected");
			} else if ($this.nextAll(".previous").length > 0) {
				$this.nextUntil(".previous").addClass("selected");
				$this.siblings(".previous").addClass("selected");
			}

			$this.addClass("selected");
		} else if (ev.shiftKey) {
			$this.siblings("tr").removeClass("selected");

			if ($this.hasClass("previous")) {
			} else if ($this.prevAll(".previous").length > 0) {
				$this.prevUntil(".previous").addClass("selected");
				$this.siblings(".previous").addClass("selected");
			} else if ($this.nextAll(".previous").length > 0) {
				$this.nextUntil(".previous").addClass("selected");
				$this.siblings(".previous").addClass("selected");
			}
			$this.addClass("selected");
		} else if (ev.ctrlKey) {
			$this.siblings("tr").removeClass("previous");
			$this.toggleClass("selected").addClass("previous");
		} else {
			$this.siblings("tr").removeClass("selected");
			$this.siblings("tr").removeClass("previous");
			$this.addClass("selected").addClass("previous");
		}

		$this
			.parent()
			.children("tr.selected")
			.find('input[type="checkbox"]')
			.prop("checked", true);
		$this
			.parent()
			.children("tr:not(.selected)")
			.find('input[type="checkbox"]')
			.prop("checked", false);

		if (self.$.table.find("td > .checkboxb > input:not(:checked)").length > 0) {
			self.$.table.find("th > .checkboxb > input").prop("checked", false);
		} else {
			self.$.table.find("th > .checkboxb > input").prop("checked", true);
		}

		$tbody.trigger("selects.process");
		$tbody.trigger("checkbox.process");

		ev.preventDefault();
	}

	modes[this.selectionMode].start();
};
Grid.prototype.onChange = function (callback) {
	this.changeListeners.push(callback);
};
Grid.prototype.setupGridFilters = function () {
	var self = this;
	// hijack search input

	// create filter area
	if (!(this.json.noFilters || this.json["no-filters"])) {
		this.$filters = $("<div />");
		this.$.container.children(".box").prepend(this.$filters);
		this.filters = new Filters(this, this.$filters, this.json.fields);
		this.children.push(this.filters);

		// add filter button bindings
		this.$.dtWrapper
			.find("thead th.has-filter")
			.prepend('<i class="glyphicon glyphicon-filter grid-filter"></i>');

		function newFilter(ev) {
			if (self.filters.children.length > 0)
				self.filters.add(null, null, null, null, true);
			self.filters.add(
				self.dt.api().column(this.parentNode).dataSrc(),
				undefined,
				undefined,
				true
			);

			ev.preventDefault();
			ev.stopPropagation();
		}
		this.$.dtWrapper.find("thead .grid-filter").on("click", newFilter);
	}

	var visMenu = this.$.html.find(".grid-status-buttons .grid-vis .menu");
	this.json.fields.forEach(function (v) {
		if (v.visibility !== "none" && v.type !== "hidden") {
			var $html = $(
				"" +
					'<li data-field="' +
					v.field +
					'">' +
					'  <div class="checkbox checkbox-slider--c checkbox-slider-success checkbox-slider-sm">' +
					"    <label>" +
					'      <input type="checkbox"' +
					(v.visibility !== "hidden" ? " checked" : "") +
					">" +
					'      <span class="small" data-i18n="' +
					v.i18n +
					'">  </span>' +
					"    </label>" +
					"  </div>" +
					"</li>"
			);

			$html.find(".checkbox").on("click", function (ev) {
				ev.preventDefault();
				var $this = $(this);
				var $li = $this.closest("li");
				var api = self.dt.api();
				var $check = $li.find("input")[0];

				if (
					self.visibles
						.map(function (v) {
							return v;
						})
						.filter(function (v) {
							return v;
						}).length === 1 &&
					$check.checked
				)
					return false;

				$check.checked = !$check.checked;
				var f = $li.data("field");

				// Get the column API object
				var column = self.dt.api().column(f + ":name");

				// Toggle the visibility
				try {
					column.visible($check.checked);

					if ($check.checked) {
						$(
							$(api.table().footer()).children().children()[column[0][0]]
						).show();
					} else {
						$(
							$(api.table().footer()).children().children()[column[0][0]]
						).hide();
					}

					self.visibles[f] = $check.checked;
				} catch (e) {}

				self.processState();

				$(column.header()).i18n();

				if (!self.json["no-filters"]) {
					self.$.dtWrapper
						.find("thead th.has-filter:not(:has(.grid-filter))")
						.prepend(
							$('<i class="fa fa-fw fa-filter grid-filter"></i>').on(
								"click",
								newFilter
							)
						);
				}
				$this
					.closest("tbody")
					.find(".td-selected")
					.removeClass("td-selected top bottom left right first-selected-cell");
				return false;
			});

			visMenu.append($html);
		}
	});

	this.$.html.find(".grid-status-buttons .fa-refresh").on("click", function () {
		self.refresh();
	});

	var main = self._("<mainController")[0];
	this.$.html.find(".grid-status-buttons .fa-save").on("click", function () {
		var d = self.getState();
		main.storage.set("grids." + self.json.id, d);
		$(this).css("color", appColors["green"]);
		self.lastState = JSON.simpleCopy(d);
	});
};
Grid.prototype.setupSubCompenent = function (
	el,
	opts,
	info,
	data,
	row,
	callback
) {
	var self = this;
	el.find("[data-component]").each(function () {
		var $this = $(this);
		var $controls = $(el).find(".controls");
		var instance = $this.data("component");
		var comp = JSON.simpleCopy(window.Instances[instance]);

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
			self.view.Actions.overrides &&
			self.view.Actions.overrides[comp.override]
		) {
			try {
				comp = self.view.Actions.overrides[comp.override].call(self, comp);
			} catch (e) {
				console.error(e);
			}
		}

		try {
			var component = new tmplt(self, this, comp.opts, info || self.scope.opts);
			self.children.push(component);
		} catch (e) {
			console.error(e);
		}

		if (comp.type === "form" && !opts.readonly) {
			$controls.html(`
        <div data-id="save" class="btn btn-flat btn-success btn-sm">Save</div>
        <div data-id="cancel" class="btn btn-flat btn-default btn-sm">Cancel</div>
      `);
			$controls.find('[data-id="save"]').on("click", function () {
				var $btn = $(this);
				if (!component.validate()) {
					Tools.Notifications.invalidForm();
				} else {
					$btn.boxBusy("black", "transparent", ".75em", "fa-cog");
					$btn.addClass("disabled");
					component
						.post()
						.then(function (res) {
							$btn.removeClass("disabled");
							$btn.boxUnBusy();
							if (res.xhr.status == 200) {
								Tools.Notifications.success(res.xhr.responseText || null);
							} else if (res.xhr.status == 202) {
								Tools.Notifications.info("app.core.processing");
							}
							component.remove();
							el.remove();
							callback && callback();
						})
						.catch(function (err) {
							console.error(err);

							$btn.removeClass("disabled");
							$btn.boxUnBusy();

							//   Tools.Notifications.error( i18n.t(err.message) || JSON.tryParse(err.message));
						});
				}
			});
			$controls.find('[data-id="cancel"]').on("click", function () {
				component.remove();
				el.remove();
				callback && callback();
			});
		} else {
			$controls.html(`
        <div data-id="close" class="btn btn-flat btn-default btn-sm">Close</div>
      `);
			$controls.find('[data-id="close"]').on("click", function () {
				component.remove();
				el.remove();
				callback && callback();
			});
		}
	});
};
Grid.prototype.setupEvents = function () {
	var self = this;

	// setup button events
	this.$.dtWrapper.on(
		"click",
		"button.grid-btn:not(.disabled):not(.disabled-by-permission)",
		function (ev) {
			var pos = self.dt.fnGetPosition($(this).closest("tr").get(0));
			var $btn = $(this);
			var action = $(this).data("btn-name");
			var btn = self.json.buttons.find(function (b) {
				return b.name === action;
			});
			var data = self.dt.fnGetData(pos);

			if (btn.action) {
				if (btn.action.type === "modalComponent") {
				} else if (btn.action.type === "innerComponent") {
					var $tr = $btn.closest("tr");
					var ntr = $(`
          <tr></tr>
          <tr class="inline-component">
            <td colspan="${$tr.children("td").length}">
              <div class="component" data-component="${
								btn.action.opts.component
							}"></div>
              <div class="controls pull-right">
              </div>
            </td>
          </tr>
        `);
					$tr.after(ntr);

					$tr.addClass("inline-open");
					$btn.addClass("disabled");
					self.setupSubCompenent(
						ntr,
						btn.action.opts,
						{
							id: data[btn.action.opts.idField],
						},
						data,
						$tr,
						function () {
							$tr.removeClass("inline-open");
							$btn.removeClass("disabled");
							self.refresh();
						}
					);
				} else if (btn.action.type === "tab") {
					if (btn.action.view) {
						nav.goto({
							section: btn.action.view,
							tab: btn.action.name,
							tid: btn.action.field ? data[btn.action.field] : btn.action.id,
						});
					} else {
						self.view.changeOrMakeTab(
							btn.action.name,
							btn.action.field
								? btn.action.field[0] == "-"
									? "-" + data[btn.action.field.slice(1)]
									: data[btn.action.field]
								: btn.action.id
						);
					}
				} else if (btn.action.type === "api") {
					var url = self.view.getUrl(btn.action.url) || btn.action.url;

					if (!url)
						console.warn(
							'Url "' + url + '" for button "' + btn.name + '" not found.'
						);

					url = url.fillWith({
						id: self.tab.info.tid,
						tab: self.tab.info.name,
						// "context": self.scope.json.id,
						view: nav.getCurrentSection(),
					});

					var grid = self;
					var ids = {
						list: [data[btn.action.field]],
						length: 1,
					};

					var box;
					if (btn.action.text === "delete") {
						box = Tools.Modals.confirmDelete();
					} else if (typeof btn.action.text === "string") {
						box = Tools.Modals.custom({
							message: btn.action.text,
							title: btn.action.title,
							ok: "app.core.ok",
							cancel: "app.core.cancel",
						});
					} else if (typeof btn.action.text === "object") {
						box = Tools.Modals.custom(btn.action.text);
					} else {
						box = Tools.Modals.confirmAction();
					}

					$btn.boxBusy("black", "transparent", ".6em", "fa-cog");
					$btn.addClass("disabled");
					grid.$.container.boxBusy();

					box
						.then(function () {
							Tools.Ajax.completePost(url, ids)
								.then(function (res) {
									grid.$.container.boxUnBusy();
									$btn.removeClass("disabled");
									$btn.boxUnBusy();

									if (btn.action.after === "refresh") grid.refresh();

									if (res.xhr.status == 200) {
										try {
											const data = JSON.parse(res.xhr.responseText);
											if (typeof data === "object") {
												Tools.Notifications.success(data.notification || null);
											} else {
												Tools.Notifications.success(data || null);
											}
										} catch (e) {
											Tools.Notifications.success(res.xhr.responseText || null);
										}
									} else if (res.xhr.status == 202) {
										Tools.Notifications.info("app.core.processing");
									}
								})
								.catch(function (err) {
									console.error(err);
									$btn.removeClass("disabled");
									$btn.boxUnBusy();

									try {
										Tools.Notifications.error(i18n.t(JSON.parse(err.message)));
									} catch (e) {
										Tools.Notifications.error(i18n.t(err.message));
									}

									grid.$.container.boxUnBusy();
								});
						})
						.catch(function () {
							$btn.removeClass("disabled");
							$btn.boxUnBusy();
							grid.$.container.boxUnBusy();
						});
				} else if (btn.action.type === "custom") {
					if (self.actions[btn.action.action]) {
						self.actions[btn.action.action].call(this, data, self, $btn);
					} else {
						console.warn(
							'No custom button handler "' +
								btn.action.action +
								'" for button "' +
								btn.name +
								'".'
						);
					}
				} else {
					console.warn(
						'Unknown action "' +
							btn.action.type +
							'" for button "' +
							btn.name +
							'".'
					);
				}
			} else if (self.actions[action]) {
				self.actions[action].call(this, data, self, $btn);
			}
		}
	);

	// setup processingevent
	this.$.table.on("processing.dt", function (e, settings, processing) {
		if (processing) {
			self.$.dtWrapper.boxBusy();
			self.isbusy = true;

			self.processState();
		} else {
			self.$.dtWrapper.boxUnBusy();
			self.isbusy = false;
		}
	});
};
Grid.prototype.processState = function () {
	if (JSON.stringify(this.lastState) === JSON.stringify(this.getState())) {
		this.$.html.find(".fa-save").css("color", appColors["green"]);
	} else {
		this.$.html.find(".fa-save").css("color", appColors["yellow"]);
	}
};
Grid.prototype.getSelected = function () {
	var self = this;
	var data = [];

	if (this.allSelected && this.filters) {
		return {
			search: this.filters.get(),
			length: this.totalSelectable,
		};
	}

	this.$.dtWrapper.find(".selected").each(function () {
		var pos = self.dt.fnGetPosition(this);
		var row = self.dt.fnGetData(pos);
		if (Array.isArray(row)) return;
		data.push(row);
	});

	return {
		list: data,
		length: data.length,
	};
};
Grid.prototype.getState = function () {
	var page = this.dt.api().page.info();
	return {
		filters: this.filters ? this.filters.get() : [],
		//   page: page.page,
		resultsPerPage: page.length,
		textSize: this.currentFontSize,
		sort: this.dt.api().order(),
		visibility: this.visibles,
	};
};
Grid.prototype.setState = function (state) {};
Grid.prototype.error = function (err) {
	console.error(err);
	var self = this;
	var error = Errors({ type: "Grid", status: err });

	this.$.dtWrapper.boxUnBusy();
	this.$.dtWrapper.prepend(error.html);

	error.html.find(".closebtn").on("click", function () {
		self.isbusy = false;
		error.html.remove();
	});

	error.html.find(".retrybtn").on("click", function () {
		self.refresh(true);
		error.html.remove();
	});
};
Grid.prototype.refresh = function (force) {
	this.deferred = false;
	if ((!this.isbusy && this.dt && this.dt.is(":visible")) || force) {
		this.dt._fnDraw();
		this.$.dtWrapper.find("thead .checkboxb > input").prop("checked", false);
	}
};
Grid.defaultControls = {
	copyPrompt: true,
	selectionModes: {
		rows: true,
		cells: true,
		text: true,
	},
	textOptions: true,
	select: true,
	visibility: true,
	export: true,
	save: true,
	refresh: true,
};
Grid.factory = {
	ajaxGet: function (_url, self) {
		return function (data, callback, settings) {
			if (self.deferred) {
				callback({ data: [] });
				return;
			}
			if (!self.firstLoad) {
				// self.firstLoad = true;
				return;
			}
			// get filters here
			// get sorts here
			// build request

			if (data.order) {
				data.sort = [];
				data.order.forEach(function (v) {
					data.sort.push({
						sortBy: data.columns[v.column].data,
						sortDir: v.dir,
					});
				});
				delete data.order;
			}

			if (data.columns) delete data.columns;

			if (data.search) delete data.search;

			data.fields = self.json.fields.map(function (v) {
				return v.field;
			});

			if (self.footers)
				data.footer = self.footers.map(function (v, k) {
					return {
						column: k,
						operation: v.op,
					};
				});

			if (self.filters) {
				data.search = self.filters.get();
			}

			if (self.json.search && self.$.search) {
				data.query = self.$.search.val();
				data.searchFields = self.json.search;
			}

			self.lastData = data;
			Tools.Ajax.defaultPost(self.settings.url, data)
				.then(function (res) {
					self.footerData = res.footer;

					if (res.recordsFiltered <= data.start) {
						self.dt.api().page("first").draw("gui");
					}

					if (res.columnFormat) {
						res.data.forEach(function (d) {
							res.columnFormat.forEach(function (v) {
								v.column.forEach(function (c) {
									if (c in d) {
										d[c] = strFormat("{0:" + v.inputMask + "}", d[c]);
									}
								});
							});
						});
						res.footer.forEach(function (f) {
							res.columnFormat.forEach(function (v) {
								if (v.column.indexOf(f.column) > -1) {
									f.value = strFormat("{0:" + v.inputMask + "}", f.value);
								}
							});
						});
					}

					self.totalSelectable = res.recordsFiltered;
					self.curPageSize = res.data.length;
					self.lastReceived = res;

					callback(res);

					self.postGet();
				})
				.catch(function (err) {
					console.error(err);
					self.error(err.status);
				});
		};
	},
	checkboxes: function () {
		var html =
			"" +
			'<div class="checkboxb col_check checkbox-primary checkbox-inline">' +
			'  <input id="{{id}}" type="checkbox" /><label for="{{id}}"></label>' +
			"</div>";

		return {
			title: "",
			render: function (data, type, row, meta) {
				return html.fillWith({
					id: "checkbox_row_" + meta.row + "_" + meta.settings.sInstance,
				});
			},
			searchable: false,
			orderable: false,
			width: "15px",
			"min-width": "15px",
		};
	},
	buttons: function (json, self) {
		return {
			title: "<i class='fa fa-gears'></i>",
			render: function (_data, _type, row, _meta) {
				// check for actions/buttonCallback
				var buttonHtml = Grid.Template(
					{ buttons: json },
					{
						data: {
							buttons: true,
							row: row,
							permissions: main.permissions.get(),
						},
					}
				);
				var html = buttonHtml;

				return self.actions && self.actions.buttonCallback
					? self.actions.buttonCallback("<div>" + html + "</div>", row)
					: html;
			},
			searchable: false,
			orderable: false,
			className: "text-center adjust-td",
			width: "1px",
		};
	},
	columns: function (cols, actions, self) {
		var columns = [];
		self.colIndex = {};
		var col, nc;
		for (var i = 0; i < cols.length; i++) {
			col = cols[i];
			self.colIndex[col.field] = col;
			nc = {};
			nc.data = col.field;
			nc.name = col.field;
			nc.className = "";
			nc.className += col.className || "";

			col.copyTemplate = Handlebars.compile(
				col.copyTemplate || "{{" + col.field + "}}"
			);

			if (col.type === "hidden") {
				continue;
			}

			if (col.visibility === "hidden") {
				nc.visible = false;
			} else if (col.visibility === "none") {
				nc.visible = false;
				nc.className += " none";
			}

			if (col["min-width"]) {
				nc.className += " adjust-td";
			}

			if (col.footer) {
				self.footers = self.footers || {};
				self.footers[col.field] = {
					i18n: col.footer["label-i18n"],
					op: col.footer.operation,
				};
			}

			nc["title-i18n"] = col.i18n;

			nc.title = '<span data-i18n="' + nc["title-i18n"] + '"></span>';

			if (col["no-sort"]) {
				nc.orderable = false;
			} else {
				nc.orderable = true;
			}

			nc.className += " type-" + col.type;

			if (!self.json["no-filters"] && col.field && !col["no-filter"]) {
				nc.searchable = nc.orderable && true;
				if (nc.searchable) nc.className += " has-filter";
			}

			if (col.render) {
				if (Array.isArray(col.render)) {
					col.render = col.render.join("");
				}
				if (actions && actions[col.render]) {
					nc.render = actions[col.render];
				} else {
					nc.render = Grid.factory.renderTemplate.call(
						self,
						col.render,
						col.unsafe
					);
				}
			} else if (col.type === "boolean") {
				nc.render = Grid.factory.renderBoolean;
				nc.className += " dt-center";
			} else if (col.type === "string-i18n") {
				nc.render = Grid.factory.renderI18n;
				nc.className = nc.className.replace("has-filter", "");
				//   nc.orderable = false;
				nc.searchable = false;
			} else if (col.type === "date") {
				nc.render = Grid.factory.renderDate;
			} else if (col.type === "datetime") {
				nc.render = Grid.factory.renderDateTime;
			} else if (col.type === "percentage") {
				nc.render = Grid.factory.renderPercentage;
			} else if (col.type === "sparkBar") {
				nc.render = Grid.factory.renderSparkBar(col.color);
			} else if (!col.unsafe) {
				nc.render = Grid.factory.safeRender;
			}

			if (col.isButton) {
				nc.render = Grid.factory.colButton(nc.render, col.buttonOpts, self);
			}

			if (col.callback) {
				if (actions && actions[col.callback]) {
					nc.createdCell = actions[col.callback];
				}
			}

			columns.push(nc);
		}
		return columns;
	},
	colButton: function (render, buttonOpts, self) {
		return (col, type, row) => {
			const btn = Grid.Template(
				{ ...buttonOpts, content: render(col, type, row) },
				{ data: { single_button: true } }
			);

			return buttonOpts.override &&
				self.actions &&
				self.actions[buttonOpts.override]
				? self.actions[buttonOpts.override](btn, col, row)
				: btn;
		};
	},
	safeRender: function (data) {
		if (typeof data === "string") return data.escapeHtml();

		return data;
	},
	escapeHtml: function (text) {
		return text.replace(/[\"&<>]/g, function (a) {
			return {
				'"': "&quot;",
				"&": "&amp;",
				"<": "&lt;",
				">": "&gt;",
			}[a];
		});
	},
	renderTemplate: function (tmplt) {
		var d = {
			helpers: (this.view.Actions && this.view.Actions.helpers) || {},
		};
		var tmplt = Handlebars.compile(tmplt);
		return function (data, type, row) {
			try {
				var a = tmplt(row, d);
			} catch (e) {
				console.error(e);
			}
			return a;
		};
	},
	renderI18n: function (data, type, row) {
		return i18n.t(data);
	},
	renderBoolean: function (data, type, row) {
		if (!data || data === "false") return '<i class="fa fa-fw fa-times">';
		return '<i class="fa fa-fw fa-check">';
	},
	renderSparkBar: function (color) {
		return function (data, type, row) {
			if (data === null) return "";

			var val = data | 0;
			return `
        <div style="width:70px!important;height:20px;padding: 0px 14px;">
          <div class="bar bard" 
            style="text-align:right;width:${Math.max(
							Math.min(val, 100),
							0
						)}%;height:15px;position: relative;"
          >
            <div class="tooltip top" style="z-index: 1000;position:absolute;right: -4px;opacity: 1;margin-top: -8px;">     
              <div class="tooltip-arrow" style="width: 5px;overflow: hidden;right: 1px;left: inherit;bottom: 4px;border-width: 5px 3px 0;">  
              </div>       
              <span class="tooltip-inner" style="color: white;font-size: 9px;font-weight: normal;padding: 1px 4px;"> 
                ${val}%
              </span> 
            </div> 
          </div> 
          <div class="bar" style="width:100%;height:5px;background-color:#eeeeee;border-radius:1px;">
            <div style="width:${Math.max(
							Math.min(val, 100),
							0
						)}%;height: 100%;border-radius:1px;background-color:${color}">
            </div>
          </div>
        </div>
      `;
		};
	},
	renderPercentage: function (data, type, row) {
		return data * 100 + "%";
	},
	renderDate: function (data, type, row) {
		var date = moment.utc(data);
		if (date.isValid()) {
			return date.format(
				main.formats.date.toUpperCase() + " " + main.formats.time
			);
		} else {
			return "-";
		}
	},
	renderDateTime: function (data, type, row) {
		var date = moment.utc(data);
		if (date.isValid()) {
			return date.format(
				main.formats.date.toUpperCase() + " " + main.formats.time
			);
		} else {
			return "-";
		}
	},
};

Grid.prototype.remove = function () {
	main.permissions.offChange(this.updatePermissions);
};
Grid.prototype._ = scopeInterface;
Grid.prototype.is = scopeCompare;

Grid.dataTablesDefaults = {
	order: [],
	rowGroup: {},
	colReorder: {
		fixedColumnsLeft: 1,
	},
	lengthMenu: [
		[10, 25, 50, 100, 150, 10000000],
		[10, 25, 50, 100, 150, "Todos"],
	],
	autoWidth: false,
	processing: true,
	deferLoading: true,
	serverSide: true,
	columns: [
		{
			// default buttons column.
			title: "",
			render: "",
		},
	],
};

Grid.Template = Handlebars.templates["grid/grid"];

window.Templates.grid = Grid;

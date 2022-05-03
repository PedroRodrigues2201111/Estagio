/**
 * EditGrid
 */

Form.Fields.EditGrid = function EditGrid(scope, container, json) {
	this.scope = scope;
	this.container = container;
	this.json = json;

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;
	this.form = this._("^form").get(0);

	this.actions = this.form.actions;

	this.edits = this.json.editableFields || {};
	this.hiddens = this.json.hiddenFields || [];

	this.fields = this.json.fields || [];
	this.fieldTypes = this.json.fieldTypes || [];

	this.value = null;
	this.original = null;
	this.isReadOnly = this.json.readOnly || false;
	this.changeListeners = [];

	this.init();
};
Form.Fields.EditGrid.prototype.init = function () {
	var self = this;
	var html = Form.Template(this.json, {
		data: {
			input: true,
		},
	});
	this.$.html = $(html);

	if (this.json.visibility === "hidden")
		this.$.container.parent().addClass("hidden");

	this.$.container.append(this.$.html);

	if (this.json.colCallback && this.actions[this.json.colCallback]) {
		this.renderCol = this.actions[this.json.colCallback];
	} else {
		this.renderCol = function (a) {
			return a;
		};
	}

	if (this.json.rowDataCallback && this.actions[this.json.rowDataCallback]) {
		this.rowData = this.actions[this.json.rowDataCallback];
	} else {
		this.rowData = function (a) {
			return a;
		};
	}

	if (this.json.rowCallback && this.actions[this.json.rowCallback]) {
		this.renderRow = this.actions[this.json.rowCallback];
	} else {
		this.renderRow = function (a) {
			return a;
		};
	}

	if (this.json.dataCallback && this.actions[this.json.dataCallback]) {
		this.dataCallback = this.actions[this.json.dataCallback];
	} else {
		this.dataCallback = function (row, fieldTypes) {
			var obj = {};
			row.find(".input").each(function () {
				var $this = $(this);
				if ($this.is(".selectize-control")) return;

				if ($this.is(":checkbox")) {
					obj[$this.closest("[data-field]").data("field")] =
						$this.is(":checked");
				} else {
					obj[$this.closest("[data-field]").data("field")] = $this.val();
				}
			});
			row.find("[data-field]").each(function () {
				var $this = $(this);
				var field = $this.data("field");
				if (!obj.hasOwnProperty(field)) {
					obj[field] = $this.text();
				}
			});

			var K = Object.keys(obj);
			for (var i = 0; i < K.length; i++) {
				if (fieldTypes[K[i]] === "int") obj[K[i]] = +obj[K[i]];
			}

			return obj;
		};
	}

	this.$.table = this.$.container.find("table");
	this.$.thead = this.$.table.find("thead");

	var editGrid = this;
	this.$.thead.empty().append(
		this.renderCol(
			"<tr>" +
				(editGrid.json.allowDelete && !editGrid.isReadOnly ? "<th></th>" : "") +
				editGrid.fields
					.map(function (v) {
						if (typeof v === "string")
							return (
								'<th class="' +
								(editGrid.hiddens.indexOf(v) === -1 ? "" : "hidden") +
								'" data-field="' +
								v +
								'">' +
								v +
								"</th>"
							);
						return (
							'<th class="' +
							(v.class || "") +
							" " +
							(editGrid.hiddens.indexOf(v.name) === -1 ? "" : "hidden") +
							'" data-field="' +
							v.name +
							'">' +
							v.title +
							"</th>"
						);
					})
					.join("") +
				"</tr>"
		)
	);

	this.$.tbody = this.$.table.find("tbody");

	if (!this.isReadOnly && this.json.allowNew !== false)
		this.$.table.after(
			'<div class="addrow btn btn-xs btn-flat btn-primary"><i class="fa fa-fw fa-plus"></i></div>'
		);

	this.bind();
	this.i18n();
};
Form.Fields.EditGrid.prototype.bind = function () {
	var self = this;
	this.$.table.on("change input", ".input", function () {
		var $this = $(this);
		var val = null;

		if ($this.data("bind")) {
			if ($this.is(":checkbox")) {
				//  $this.siblings('[data-bound="'+$this.data('bind')+'"]').text($this.val());
				val = $this.prop("checked");
			} else {
				$this
					.siblings('[data-bound="' + $this.data("bind") + '"]')
					.text($this.val());
				val = $this.val();
			}
		}

		if (
			self.json.rowChangedCallback &&
			self.actions &&
			self.actions[self.json.rowChangedCallback]
		) {
			self.actions[self.json.rowChangedCallback]();
			// TODO
			// get row data
			// call callback
			// set row data
		}

		if (encodeURIComponent(val) !== $this.data("value") + "") {
			$this.addClass("changed");
		} else {
			$this.removeClass("changed");
		}

		for (var i = 0; i < self.changeListeners.length; i++) {
			self.changeListeners[i](self.json.id, self.get(), self.isChanged());
		}
		self.validate();
	});
	this.$.table.on("click", ".delete", function () {
		if (self.json.noUndo) {
			$(this).closest("tr").remove();
		} else {
			$(this)
				.closest("tr")
				.addClass("deleted")
				.find(".input")
				.prop("disabled", true);
		}

		for (var i = 0; i < self.changeListeners.length; i++) {
			self.changeListeners[i](self.json.id, self.get(), self.isChanged());
		}

		self.validate();
	});
	this.$.table.on("click", ".restore", function () {
		$(this)
			.closest("tr")
			.removeClass("deleted")
			.find(".input")
			.prop("disabled", false);
		for (var i = 0; i < self.changeListeners.length; i++) {
			self.changeListeners[i](self.json.id, self.get(), self.isChanged());
		}
		self.validate();
	});
	this.$.container.find(".addrow").on("click", function () {
		var d = {};
		for (var i = 0; i < self.fields.length; i++) {
			d[
				typeof self.fields[i] === "string"
					? self.fields[i]
					: self.fields[i].name
			] =
				self.fieldTypes[
					typeof self.fields[i] === "string"
						? self.fields[i]
						: self.fields[i].name
				] === "int"
					? 0
					: "";
		}

		d = self.rowData(d, self, self.form);

		var $row = $(self.makeRow(self.fields, d)).addClass("new");

		self.$.tbody.append($row);

		$row.find("select.auto").selectize({
			dropdownParent: "body",
			allowNull: true,
			onDropdownOpen: function () {
				this.clear();
			},
		});

		for (var i = 0; i < self.changeListeners.length; i++) {
			self.changeListeners[i](self.json.id, self.get(), self.isChanged());
		}
		self.validate();
	});
};
Form.Fields.EditGrid.prototype.i18n = function () {
	this.$.html.i18n();
};
Form.Fields.EditGrid.prototype.readonly = function (set) {
	if (typeof set === "undefined") return this.isReadOnly;

	this.isReadOnly = !!set;
	this.$.html
		.parent()
		.find("textarea, input, select")
		.prop("disabled", this.isReadOnly);

	this.$.html.parent().find(".del-btn").toggleClass("hidden", this.isReadOnly);

	this.$.html.parent().find(".addrow").toggleClass("hidden", this.isReadOnly);
};
Form.Fields.EditGrid.prototype.getData = function () {
	var d = {};
	d[this.json.id] = this.get();
	return d;
};
Form.Fields.EditGrid.prototype.get = function () {
	var self = this;
	var d = JSON.simpleCopy(this.original);

	d.data = [];
	d.deleted = [];
	d.new = [];
	d.fullData = [];

	this.$.tbody.children("tr").each(function () {
		var $this = $(this);
		if ($this.is(".deleted.new")) {
			// nope
		} else if ($this.is(".deleted")) {
			d.deleted.push(self.dataCallback($(this), self.fieldTypes));
		} else if ($this.is(".new")) {
			d.fullData.push(self.dataCallback($(this), self.fieldTypes));
			d.new.push(self.dataCallback($(this), self.fieldTypes));
		} else {
			d.fullData.push(self.dataCallback($(this), self.fieldTypes));
			d.data.push(self.dataCallback($(this), self.fieldTypes));
		}
	});

	return d;
};
Form.Fields.EditGrid.prototype.setData = function (data) {
	if (data[this.json.id]) this.set(data[this.json.id]);
};
Form.Fields.EditGrid.prototype.set = function (val) {
	var self = this;
	this.original = val;
	this.fields = val.fields;
	this.fieldTypes = {};
	for (var i = 0; i < val.fieldTypes.length; i++) {
		this.fieldTypes[
			typeof val.fields[i] === "string" ? val.fields[i] : val.fields[i].name
		] = val.fieldTypes[i];
	}

	var data = val.data.map(function (v) {
		return val.fields.map(function (k) {
			return v[typeof k === "string" ? k : k.name];
		});
	});

	this.$.thead.empty().append(
		this.renderCol(
			"<tr>" +
				(this.json.allowDelete && !this.isReadOnly ? "<th></th>" : "") +
				val.fields
					.map(function (v) {
						if (typeof v === "string")
							return (
								'<th class="' +
								(self.hiddens.indexOf(v) === -1 ? "" : "hidden") +
								'" data-field="' +
								v +
								'">' +
								v +
								"</th>"
							);
						return (
							'<th class="' +
							(v.class || "") +
							" " +
							(self.hiddens.indexOf(v.name) === -1 ? "" : "hidden") +
							'" data-field="' +
							v.name +
							'">' +
							v.title +
							"</th>"
						);
					})
					.join("") +
				"</tr>"
		)
	);

	this.$.tbody.empty().append(
		val.data.map(function (v) {
			return self.renderRow(self.makeRow(val.fields, v));
		})
	);

	this.$.tbody.find("select.auto").selectize({
		dropdownParent: "body",
		allowNull: true,
		onDropdownOpen: function () {
			this.clear();
		},
	});

	for (var i = 0; i < self.changeListeners.length; i++) {
		self.changeListeners[i](self.json.id, self.get(), self.isChanged());
	}
};
Form.Fields.EditGrid.prototype.makeRow = function (fields, row) {
	var self = this;
	return `
    <tr>
      ${
				(this.json.allowDelete && !this.isReadOnly
					? `
          <td class="">
            <div class="del-btn delete btn btn-xs btn-flat btn-danger">
              <i class="fa fa-fw fa-times"></i>
            </div>
            <div class="del-btn restore btn btn-xs btn-flat btn-info">
              <i class="fa fa-fw fa-undo"></i>
            </div>
          </td>
        `
					: "") +
				fields
					.map(function (f) {
						var k = typeof f === "string" ? f : f.name;
						return `
              <td class="${
								self.hiddens.indexOf(k) === -1 ? "" : "hidden"
							}" data-field="${k}">
                ${self.makeField(k, row[k])}
              </td>
            `;
					})
					.join("")
			}
    </tr>
  `;
};
Form.Fields.EditGrid.prototype.makeField = function (field, value) {
	var self = this;
	var html;
	var bind_id;

	if (this.edits.hasOwnProperty(field)) {
		switch (this.edits[field].type) {
			case "text":
				if (
					typeof value === "string" &&
					(value.length > 150 || value.indexOf("\n") > -1)
				) {
					html = `
            <textarea 
              ${this.isReadOnly ? "disabled" : ""} 
              class="input" type="text" 
              style="width:100%"
              data-value="${encodeURIComponent(value)}"'
              >${value}</textarea>
          `;
				} else {
					bind_id = Date.now() + "_" + Math.random();
					html = `
            <div style="height:0px;color:transparent;" data-bound="${bind_id}">
              ${value}
            </div>
            <input 
              ${this.isReadOnly ? "disabled" : ""} 
              class="input" 
              style="width:100%" type="text" 
              data-bind="${bind_id}" 
              data-value="${encodeURIComponent(value)}" 
              value="${value}" 
            />
          `;
				}
				break;
			case "textarea":
				html = `
          <textarea${this.isReadOnly ? " disabled" : ""} 
            style="width:100%"
            class="input" type="text" 
            data-value="${encodeURIComponent(value)}"
            >${value}</textarea>
        `;
				break;
			case "number":
				bind_id = Date.now() + "_" + Math.random();
				html = `
          <div style="height:0px;color:transparent;" data-bound="${bind_id}">
            ${value}
          </div>
          <input${this.isReadOnly ? " disabled" : ""} 
            class="input" style="width:100%" type="number" inputmode="numeric"
            data-bind="${bind_id}" data-value="${encodeURIComponent(value)}"'
            value="${value}" 
          />
        `;
				break;
			case "boolean":
				bind_id = Date.now() + "_" + Math.random();
				html = `
          <div style="height:0px;color:transparent;" data-bound="${bind_id}"></div>
          <input${this.isReadOnly ? " disabled" : ""} 
            class="input" style="width:100%" type="checkbox" data-bind="${bind_id}" 
            data-value="${encodeURIComponent(value)}"
            ${value ? " checked " : ""} value="checked" 
          />
        `;
				break;
			case "select":
				html = `
            <select${
							this.isReadOnly ? " disabled" : ""
						} class="input" data-value="${encodeURIComponent(value)}" >'
              ${this.edits[field].options
								.map(function (o) {
									if (typeof o === "string") {
										return `
                    <option value="${o}" ${o === value ? "selected" : ""}>
                      ${o}
                    </option>
                  `;
									} else if (typeof o === "object") {
										if (!self.edits[field].valueField) {
											throw "EditGrid: valueField for " + field + " is missing";
										}
										if (!self.edits[field].labelField) {
											throw "EditGrid: labelField for " + field + " is missing";
										}
										var v = o[self.edits[field].valueField];
										var l = o[self.edits[field].labelField];
										return `
                    <option value="${v}" ${v === value ? "selected" : ""}>
                      ${l}
                    </option>
                  `;
									}
								})
								.join("")}
            </select>
          `;
				break;
			case "autoSelect":
				html = `
        <div style="min-width:${this.edits[field]["min-width"]}">
              <select${
								this.isReadOnly ? " disabled" : ""
							} class="input auto" data-value="${encodeURIComponent(value)}" >'
                ${this.edits[field].options
									.map(function (o) {
										if (typeof o === "string") {
											return `
                      <option value="${o}" ${o === value ? "selected" : ""}>
                        ${o}
                      </option>
                    `;
										} else if (typeof o === "object") {
											if (!self.edits[field].valueField) {
												throw (
													"EditGrid: valueField for " + field + " is missing"
												);
											}
											if (!self.edits[field].labelField) {
												throw (
													"EditGrid: labelField for " + field + " is missing"
												);
											}
											var v = o[self.edits[field].valueField];
											var l = o[self.edits[field].labelField];
											return `
                      <option value="${v}" ${v === value ? "selected" : ""}>
                        ${l}
                      </option>
                    `;
										}
									})
									.join("")}
              </select></div>
            `;
				break;
		}
		return html;
	}

	return value;
};
Form.Fields.EditGrid.prototype.isChanged = function () {
	if (this.$.table.find(".deleted:not(.new)").length > 0) {
		return true;
	}

	if (this.$.table.find(".changed").closest("tr").is(":not(.deleted)")) {
		return true;
	}

	if (this.$.table.find(".new:not(.deleted)").length > 0) {
		return true;
	}

	return false;
};
Form.Fields.EditGrid.prototype.reset = function () {
	// clear
	this.$.thead.empty();
	this.$.tbody.empty();
};
Form.Fields.EditGrid.prototype.clear = function () {
	this.$.tbody.empty();
};
Form.Fields.EditGrid.prototype.applyFieldBinds = function () {
	var self = this;
	var B = this.json.binds;
	if (!B) return;

	B.forEach(function (b) {
		if (b.to) {
			var t = self.form._("_" + b.to).get(0);
			// create bind
			t.onChange(function () {
				var get = t.get();
				if ((b.field && get ? get[b.field] : get) == b.value) {
					self.do(b.value, b.do, b.to);
				} else {
					self.do(b.value, b.do, b.to, true);
				}
			});
			// apply it
			var get = t.get();
			if ((b.field && get ? get[b.field] : get) == b.value) {
				self.do(b.value, b.do, b.to);
			} else {
				self.do(b.value, b.do, b.to, true);
			}
		} else if (b.target) {
			var t = self;

			t.onChange(function () {
				var get = t.get();
				if ((b.field && get ? get[b.field] : get) == b.value) {
					self.doTo({ type: b.type || "field", target: b.target }, b.do, b.to);
				} else {
					self.doTo(
						{ type: b.type || "field", target: b.target },
						b.do,
						b.to,
						true
					);
				}
			});

			var get = t.get();
			if ((b.field && get ? get[b.field] : get) == b.value) {
				self.doTo({ type: b.type || "field", target: b.target }, b.do, b.to);
			} else {
				self.doTo(
					{ type: b.type || "field", target: b.target },
					b.do,
					b.to,
					true
				);
			}
		}
	});
};
Form.Fields.EditGrid.prototype.do = function (value, action, context, undo) {
	var self = this;
	if (!this.state) this.state = {};

	// Get previous differences
	var psK = Object.keys(this.state);
	var ps = {}; // previous state
	for (var i = 0; i < psK.length; i++) {
		ps[this.state[psK[i]]] = true;
	}

	if (undo) {
		if (this.state[action + "_" + value + "_" + context]) {
			delete this.state[action + "_" + value + "_" + context];
		} else {
			return;
		}
	} else {
		if (!this.state[action + "_" + value + "_" + context]) {
			this.state[action + "_" + value + "_" + context] = action;
		} else {
			return;
		}
	}

	// Get current differences
	var csK = Object.keys(this.state);
	var cs = {}; // current state
	for (var i = 0; i < csK.length; i++) {
		cs[this.state[csK[i]]] = true;
	}

	// Just making bA as a shortcut for bindActions
	var bA = Form.Fields.EditGrid.bindActions;

	// reset states
	var aK = Object.keys(bA);
	for (var i = 0; i < aK.length; i++) {
		if (ps[aK[i]]) {
			// if in previous
			if (cs[aK[i]]) {
				// and in current
				continue; // same state. do nothing
			}
			bA[aK[i]][1](this); // not in current. undo
		}

		if (cs[aK[i]]) {
			// if only in current
			bA[aK[i]][0](this); // apply state
		}
	}
};

Form.Fields.EditGrid.prototype.doTo = function (target, action, context, undo) {
	var self = this;
	if (!this.targetStates) this.targetStates = {};

	if (!this.targetStates[target.type + "_" + target.target])
		this.targetStates[target.type + "_" + target.target] = {};

	// Get previous differences
	var psK = Object.keys(this.targetStates[target.type + "_" + target.target]);
	var ps = {}; // previous state
	for (var i = 0; i < psK.length; i++) {
		ps[this.targetStates[target.type + "_" + target.target][psK[i]]] = true;
	}

	if (undo) {
		if (
			this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			]
		) {
			delete this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			];
		} else {
			return;
		}
	} else {
		if (
			!this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			]
		) {
			this.targetStates[target.type + "_" + target.target][
				action + "_" + context
			] = action;
		} else {
			return;
		}
	}

	// Get current differences
	var csK = Object.keys(this.targetStates[target.type + "_" + target.target]);
	var cs = {}; // current state
	for (var i = 0; i < csK.length; i++) {
		cs[this.targetStates[target.type + "_" + target.target][csK[i]]] = true;
	}

	// Just making bA as a shortcut for bindActions
	var bA = Form.Fields.EditGrid.bindActions;

	// reset states
	var aK = Object.keys(bA);
	for (var i = 0; i < aK.length; i++) {
		if (ps[aK[i]]) {
			// if in previous
			if (cs[aK[i]]) {
				// and in current
				continue; // same state. do nothing
			}
			bA[aK[i]][1](this, target); // not in current. undo
		}

		if (cs[aK[i]]) {
			// if only in current
			bA[aK[i]][0](this, target); // apply state
		}
	}
};
Form.Fields.EditGrid.bindActions = {
	disable: [
		function (self) {
			// Do
			self.$.input.prop("disabled", true);
		},
		function (self) {
			// Undo
			self.$.input.prop("disabled", false);
		},
	],
	hide: [
		function (self) {
			// Do
			self.$.container.parent().addClass("hidden");
		},
		function (self) {
			// Undo
			self.$.container.parent().removeClass("hidden");
		},
	],
	show: [
		function (self, target) {
			// Do
			if (target && target.type === "tab") {
				self.form.$.container
					.find('[data-tab-id="' + target.target + '"]')
					.each(function () {
						var $this = $(this);
						var states = JSON.parse(
							decodeURIComponent($this.attr("data-state-shown") || "") || "[]"
						);
						if (states.indexOf(self.json.id) === -1) {
							states.push(self.json.id);
							$this.attr(
								"data-state-shown",
								encodeURIComponent(JSON.stringify(states))
							);
						}
					});
			} else {
				self.$.container.parent().removeClass("hidden");
			}
		},
		function (self, target) {
			// Undo
			if (target && target.type === "tab") {
				self.form.$.container
					.find('[data-tab-id="' + target.target + '"]')
					.each(function () {
						var $this = $(this);
						var states = JSON.parse(
							decodeURIComponent($this.attr("data-state-shown") || "") || "[]"
						);
						if (states.indexOf(self.json.id) > -1) {
							states.splice(states.indexOf(self.json.id), 1);

							if (states.length === 0) {
								$this.removeAttr("data-state-shown");
							} else {
								$this.attr(
									"data-state-shown",
									encodeURIComponent(JSON.stringify(states))
								);
							}
						}
					});
			} else {
				self.$.container.parent().addClass("hidden");
			}
		},
	],
};
Form.Fields.EditGrid.prototype.validate = function () {
	var self = this;
	// check if has validation settings
	if (!this.json.validation) return true;

	var errors = []; // i18n keys

	// setup validation elements
	if (!this._tabli)
		this._tabli = $(
			'[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
		).parent();

	var val = this.json.validation;
	var value = this.get();

	// validate empty

	(Array.isArray(val) ? val : [val]).forEach(function (val) {
		if (val.required && (!value || (value + "").trim() === "")) {
			// apply error
			// i18n.t('common.errors.required');
			errors.push("app.errors.required-field");
		}

		if (val.custom) {
			(Array.isArray(val.custom) ? val.custom : [val.custom]).forEach(function (
				f
			) {
				var err;
				if (self.form.actions[f]) {
					err = self.form.actions[f](value, self, val);
					if (err) errors.push(err);
				}
			});
		}
	});
	if (errors.length > 0) {
		self.$.container.closestChildren(".for-error").html(
			errors
				.map(function (v) {
					return i18n.t(v);
				})
				.join("<br>")
		);

		this.$.html.closest(".form-group").addClass("has-error");

		var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
		if (cerrors.indexOf(this.json.id) < 0) {
			if (cerrors[0] === "") cerrors = [];
			cerrors.push(this.json.id);
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		}
		return false;
	}

	// unset errors. set success?
	var cerrors = (this._tabli.attr("data-validation-error") || "").split(";");
	if (cerrors.indexOf(this.json.id) > -1) {
		cerrors.splice(cerrors.indexOf(this.json.id), 1);
		if (cerrors.length > 0) {
			this._tabli.attr("data-validation-error", cerrors.join(";"));
		} else {
			this._tabli.removeAttr("data-validation-error");
		}
	}
	this.$.html.closest(".form-group").removeClass("has-error");
	return true;
};
Form.Fields.EditGrid.prototype.saveData = function () {
	const data = this.get();
	this.set({
		data: data.fullData,
		fieldTypes: data.fieldTypes,
		fields: data.fields,
	});
};
Form.Fields.EditGrid.prototype.refresh = function () {
	// nop
};
Form.Fields.EditGrid.prototype.onChange = function (callback) {
	if (!this.changeListeners) this.changeListeners = [];
	this.changeListeners.push(callback);
};
Form.Fields.EditGrid.prototype._ = scopeInterface;
Form.Fields.EditGrid.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "EditGrid".toLowerCase() ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

/**
 * FileInput
 */

Form.Fields.FileInput = function FileInput(scope, container, json) {
	this.scope = scope;
	this.children = [];
	this.container = container;
	this.json = json;

	this.$ = {};
	this.$.container = $(this.container);
	this.$.html = null;
	this.form = this._("^form").get(0);

	this.value = null;
	this.original = null;

	this.changeListeners = [];
	this._state = {
		readonly: {},
		hidden: {},
	};

	this.init();
};
Form.Fields.FileInput.prototype.init = function () {
	var html = Form.Template(this.json, {
		data: {
			input: true,
		},
	});
	this.$.html = $(html);
	if (this.json.visibility === "hidden")
		this.$.container.parent().addClass("hidden");

	this.$.container.append(this.$.html);
	this.$.input = this.$.container.find("input");
	this.$.files = this.$.container.find(".files");

	if (this.json.parseCallback) {
		this.parseCallback = this.form.actions[this.json.parseCallback];
	}

	if (this.json.regex) {
		try {
			this.regex = RegExp(this.json.regex);
		} catch (err) {
			console.error(err);
		}
	}
	if (this.json.maxFiles) {
		this.maxFiles = this.json.maxFiles;
	}

	this.url = this.json.url;
	this.files = [];

	this.bind();
	this.i18n();
};
Form.Fields.FileInput.prototype.bind = function () {
	var self = this;
	function sendFiles(files, isLocal) {
		for (var i = 0, file = files[0]; i < files.length; i++, file = files[i]) {
			if (
				self.maxFiles &&
				self.children.filter(function (f) {
					return !f.info.deleted;
				}).length >= self.maxFiles
			)
				return;

			if (self.regex && !self.regex.test(file.name)) return;

			var f = new self.constructor.File(
				self,
				{
					filename: file.name,
					description: file.name,
					mimetype: file.type,
				},
				self.json.url,
				file,
				isLocal
			);
			self.children.push(f);
			self.$.files.append(f.$.html);
		}
	}

	this.$.input.on("input", function (ev) {
		var fs = self.$.input[0].files;
		sendFiles(fs, self.json.noUpload);
	});
	this.$.html
		.on(
			"drag dragstart dragend dragover dragenter dragleave drop",
			function (e) {
				e.preventDefault();
				e.stopPropagation();
			}
		)
		.on("dragover dragenter", function (e) {
			self.$.html.addClass("is-dragover");
		})
		.on("dragleave dragend", function (e) {
			self.$.html.removeClass("is-dragover");
		})
		.on("drop", function (e) {
			self.$.html.removeClass("is-dragover");
			sendFiles(e.originalEvent.dataTransfer.files, self.json.noUpload);
		});
};

Form.Fields.FileInput.File = function File(scope, info, url, file, isLocal) {
	console.log("🚀 ~ file: fileinput.js ~ line 113 ~ File ~ isLocal", isLocal);

	var self = this;
	this.scope = scope;
	this.info = info;
	this.$ = {};
	this.$.html = $(this.render(info));
	this.$.progress = this.$.html.find(".file-progress");

	this.$.desc = this.$.html.find("input.fi-file-desc");
	this.$.name = this.$.html.find("input.fi-file-name");
	this.$.del = this.$.html.find(".fi-delete");

	this.$.desc.val(info.filename);
	this.$.name.val(info.description);

	this.$.desc
		.on("change input", function () {
			info.filename = this.value;
			this.size = this.value.length;
		})
		.attr("size", info.filename.length);
	this.$.name
		.on("change input", function () {
			info.description = this.value;
			this.size = this.value.length;
		})
		.attr("size", info.description.length);

	this.$.del.on("click", function () {
		info.deleted = true;
		self.$.del.remove();
		self.$.name.prop("disabled", true);
		self.$.progress.remove();
		self.$.desc.parent().remove();
		self.$.html.css("opacity", ".5");

		if (!self.busy) {
			self.$.html.css("border-color", "gray");
		} else {
			self.req.request.ajax.abort();
			self.$.html.css("border-color", "red");
		}
	});

	this.i18n();
	if (isLocal) {
		// readFile / parse
		const reader = new FileReader();
		reader.addEventListener(
			"load",
			() => {
				this.info.data = this.scope.parseCallback(reader.result);
			},
			false
		);

		if (file) {
			reader.readAsText(file, this.scope.json.encoding);
		}
	} else if (url && file) {
		this.upload(url, file);
	} else {
		this.original = JSON.simpleCopy(info);
	}
};
Form.Fields.FileInput.File.prototype.upload = function (url, file) {
	var self = this;
	this.progress = 0;

	this.busy = true;

	self.p = new Promise(function (resolve, reject) {
		self.req = Tools.Ajax.defaultUpload(url, file, {
			"fi-filename": self.info.filename,
			"fi-description": self.info.description,
			"fi-mimetype": self.info.mimetype,
		});
		self.req.upProgress(function (p) {
			self.progress = p;
			self.$.progress.css("width", p * 100 + "%");
		});
		self.req.then(function (id) {
			self.info.id = id;
			self.busy = false;
			resolve();
		});
		self.req.catch(function (err) {
			self.busy = false;
			self.setError();
			resolve();
		});
	});
};
Form.Fields.FileInput.File.prototype.isChanged = function () {
	if (this.info.deleted && !this.original) return false;

	if (!this.original) return true;

	if (this.info.deleted) return true;

	return (
		this.info.filename !== this.original.filename ||
		this.info.description !== this.original.description
	);
};
Form.Fields.FileInput.File.prototype.setError = function () {
	// remove delete button
	this.$.del.remove();
	this.$.name.disable();
	this.$.progress.remove();
	this.$.desc.parent().remove();
	this.$.html.css("border-color", "red");
	this.info.deleted = true;
	this.$.html.css("opacity", ".5");
};
Form.Fields.FileInput.File.prototype.get = function () {
	return this.info;
};
Form.Fields.FileInput.File.prototype.i18n = function () {
	this.$.html.i18n();
};
Form.Fields.FileInput.File.prototype.isBusy = function () {
	return this.busy;
};
Form.Fields.FileInput.File.prototype.whenReady = function () {
	return this.p;
};
Form.Fields.FileInput.File.prototype.render = Handlebars.compile(`
  <div class="file-info">
    <i class="fa fa-times fi-delete"></i>
    <div class="fi-file-details" style="">
      <div>
        <span>File name:</span>
        <input class="fi-file-name" type="text" />
      </div>
      <div>
        <span>Description:</span>
        <input class="fi-file-desc" type="text" />
      </div>
    </div>
    <div class="file-progress"></div>
  </div>
`);

Form.Fields.FileInput.prototype.i18n = function () {
	this.$.html.i18n();
};
Form.Fields.FileInput.prototype.checkPermissions = function (userPermissions) {
	if (!this.json.permissions) {
		return;
	}

	Object.keys(this.json.permissions).forEach((k) => {
		const permission = k;
		const state = this.json.permissions[k];
		const hasPermission = userPermissions.indexOf(permission) > -1;

		if (state === "readonly") {
			this.readonly(!hasPermission, permission);
		}
		if (state === "hidden") {
			this.hidden(!hasPermission, permission);
		}
	});
};
Form.Fields.FileInput.prototype.hidden = function (set, namespace) {
	if (typeof namespace === "undefined" && typeof set === "undefined") {
		return Object.keys(this._state.hidden).reduce(
			(acc, k) => acc || this._state.hidden[k],
			false
		);
	}

	if (typeof set === "undefined") {
		return this._state.hidden[namespace];
	}

	namespace = namespace == null ? "anon" : namespace;

	this._state.hidden[namespace] = set;

	this.isHidden = Object.keys(this._state.hidden).reduce(
		(acc, k) => acc || this._state.hidden[k],
		false
	);

	if (this.isHidden) {
		this.$.container.addClass("hidden");
	} else {
		this.$.container.removeClass("hidden");
	}
};
Form.Fields.FileInput.prototype.readonly = function (set, namespace) {
	if (typeof namespace === "undefined" && typeof set === "undefined") {
		return Object.keys(this._state.readonly).reduce(
			(acc, k) => acc || this._state.readonly[k],
			false
		);
	}
	if (typeof set === "undefined") {
		return this._state.readonly[namespace];
	}

	namespace = namespace == null ? "anon" : namespace;

	this._state.readonly[namespace] = set;

	this.isReadOnly = Object.keys(this._state.readonly).reduce(
		(acc, k) => acc || this._state.readonly[k],
		false
	);
	this.$.input.attr("readonly", this.isReadOnly);
};
Form.Fields.FileInput.prototype.getData = function () {
	var d = {};
	d[this.json.id] = this.get();
	return d;
};
Form.Fields.FileInput.prototype.get = function () {
	return this.children
		.map(function (f) {
			return f.get();
		})
		.filter(function (f) {
			return !f.deleted || !!f.id;
		});
};
Form.Fields.FileInput.prototype.setData = function (data) {
	this.clear();
	this.original = data[this.json.id] || [];

	data[this.json.id] = this.original;
	this.set(this.original);
};
Form.Fields.FileInput.prototype.set = function (val) {
	for (var i = 0, file = val[0]; i < val.length; i++, file = val[i]) {
		var f = new this.constructor.File(this, file);
		this.children.push(f);
		this.$.files.append(f.$.html);
	}
	this.doChanges();
};
Form.Fields.FileInput.prototype.isChanged = function () {
	return this.children.reduce(function (p, c) {
		return p || c.isChanged();
	}, false);
};
Form.Fields.FileInput.prototype.reset = function () {
	this.set(this.original);
};
Form.Fields.FileInput.prototype.clear = function () {
	this.$.files.empty();
	this.children = [];
};
Form.Fields.FileInput.prototype.isBusy = function () {
	return this.children.reduce(function (p, c) {
		return p || (c.isBusy && c.isBusy());
	}, false);
};
Form.Fields.FileInput.prototype.whenReady = function () {
	var ps = this.children
		.filter(function (c) {
			return c.whenReady && c.isBusy();
		})
		.map(function (c) {
			return c.whenReady();
		});

	return Promise.all(ps);
};
Form.Fields.FileInput.prototype.applyFieldBinds = function () {
	var self = this;
	var B = this.json.binds;
	if (!B) return;

	B.forEach(function (b) {
		if (b.to) {
			var t = self.form._("_" + b.to).get(0);
			// create bind
			t.onChange(function () {
				var get = t.get();
				if (
					Array.isArray(get)
						? get.indexOf(b.value) > -1
						: (b.field && get ? get[b.field] : get) == b.value
				) {
					self.do(b.value, b.do, b.to);
				} else {
					self.do(b.value, b.do, b.to, true);
				}
			});
			// apply it
			var get = t.get();
			if (
				Array.isArray(get)
					? get.indexOf(b.value) > -1
					: (b.field && get ? get[b.field] : get) == b.value
			) {
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
Form.Fields.FileInput.prototype.validate = function () {
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
		} else if (val.regex) {
			// make regexes
			if (!self.regexes) {
				self.regexes = {};

				val.regex.forEach(function (v, k) {
					self.regexes[k] = new RegExp(k);
				});
			}

			var vK = Object.keys(val.regex);
			for (var i = 0; i < vK.length; i++) {
				var k = vK[i];
				var r = self.regexes[k];

				if (!r.test(value)) {
					errors.push(val.regex[k]);
				}
			}
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
Form.Fields.FileInput.prototype.do = function (value, action, context, undo) {
	console.log(value, action, context, undo);
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
	var bA = Form.Fields.FileInput.bindActions;

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
Form.Fields.FileInput.prototype.doTo = function (
	target,
	action,
	context,
	undo
) {
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
	var bA = Form.Fields.FileInput.bindActions;

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
Form.Fields.FileInput.bindActions = {
	disable: [
		function (self) {
			self.$.input.attr("disabled", true);
		},
		function (self) {
			self.$.input.attr("disabled", false);
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
Form.Fields.FileInput.prototype.saveData = function () {
	this.setData(this.getData());
	this.doChanges();
};
Form.Fields.FileInput.prototype.refresh = function () {};
Form.Fields.FileInput.prototype.doChanges = function () {
	var changed = this.isChanged();
	var val = this.get();

	if (changed && !this.json.muted) {
		this.$.container.closest(".form-group").addClass("changed");
	} else {
		this.$.container.closest(".form-group").removeClass("changed");
	}

	for (var i = 0; i < this.changeListeners.length; i++) {
		this.changeListeners[i](this.json.id, val, changed);
	}
};
Form.Fields.FileInput.prototype.onChange = function (callback) {
	if (!this.changeListeners) this.changeListeners = [];
	this.changeListeners.push(callback);
};
Form.Fields.FileInput.prototype._ = scopeInterface;
Form.Fields.FileInput.prototype.is = function (t) {
	if (t === "*") return true;
	return (
		t.toLowerCase() === "FileInput".toLowerCase() ||
		t.toLowerCase() === this.json.id.toLowerCase()
	);
};

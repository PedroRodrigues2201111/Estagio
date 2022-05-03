/**
 * StaticHTML
 */

Form.Fields.StaticHTML = function StaticHTML(scope, container, json) {
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._("^form").get(0);

  this.value = null;
  this.original = null;

  this.changeListeners = [];

  this.init();
};
Form.Fields.StaticHTML.prototype.init = function() {
  this.render();
  this.i18n();
};
Form.Fields.StaticHTML.prototype.render = function() {
  this.$.container.empty();
  var html = Form.Template(this.json, {
    data: {
      input: true,
      type: this.json.template ? "handlebars" : "none",
      content: this.json.template
        ? renderCached(
            this.json["template-i18n"]
              ? i18n.t(this.json["template-i18n"])
              : this.json.template,
            this.get()
          )
        : undefined
    }
  });

  this.$.html = $(html);
  if (this.json.visibility === "hidden")
    this.$.container.parent().addClass("hidden");

  if (this.json.well) this.$.container.parent().addClass("well");

  this.$.container.append(this.$.html);
};
Form.Fields.StaticHTML.prototype.bind = function() {};
Form.Fields.StaticHTML.prototype.i18n = function() {
  this.render();
  this.$.html.i18n();
};
Form.Fields.StaticHTML.prototype.getData = function() {};
Form.Fields.StaticHTML.prototype.get = function() {
  return this.val;
};
Form.Fields.StaticHTML.prototype.setData = function(data) {
  this.set(JSON.simpleCopy(data));
  this.render();
  this.i18n();
};
Form.Fields.StaticHTML.prototype.set = function(val) {
  this.val = val;
};
Form.Fields.StaticHTML.prototype.isChanged = function() {
  return false;
};
Form.Fields.StaticHTML.prototype.reset = function() {};
Form.Fields.StaticHTML.prototype.clear = function() {};
Form.Fields.StaticHTML.prototype.applyFieldBinds = function() {
  var self = this;
  var B = this.json.binds;
  if (!B) return;

  B.forEach(function(b) {
    if (b.to) {
      var t = self.form._("_" + b.to).get(0);
      // create bind
      t.onChange(function() {
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

      t.onChange(function() {
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
Form.Fields.StaticHTML.prototype.validate = function() {
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
  (Array.isArray(val) ? val : [val]).forEach(function(val) {
    if (val.required && (!value || (value + "").trim() === "")) {
      // apply error
      // i18n.t('common.errors.required');
      errors.push("app.errors.required-field");
    } else if (val.regex) {
      // make regexes
      if (!self.regexes) {
        self.regexes = {};

        val.regex.forEach(function(v, k) {
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
      (Array.isArray(val.custom) ? val.custom : [val.custom]).forEach(function(
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
        .map(function(v) {
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
Form.Fields.StaticHTML.prototype.do = function(value, action, context, undo) {
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
  var bA = Form.Fields.StaticHTML.bindActions;

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
Form.Fields.StaticHTML.prototype.doTo = function(
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
  var bA = Form.Fields.StaticHTML.bindActions;

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
Form.Fields.StaticHTML.bindActions = {
  disable: [
    function(self) {
      self.$.input.attr("disabled", true);
    },
    function(self) {
      self.$.input.attr("disabled", false);
    }
  ],
  hide: [
    function(self) {
      // Do
      self.$.container.parent().addClass("hidden");
    },
    function(self) {
      // Undo
      self.$.container.parent().removeClass("hidden");
    }
  ],
  show: [
    function(self, target) {
      // Do
      if (target && target.type === "tab") {
        self.form.$.container
          .find('[data-tab-id="' + target.target + '"]')
          .each(function() {
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
    function(self, target) {
      // Undo
      if (target && target.type === "tab") {
        self.form.$.container
          .find('[data-tab-id="' + target.target + '"]')
          .each(function() {
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
    }
  ]
};
Form.Fields.StaticHTML.prototype.validate = function() {};
Form.Fields.StaticHTML.prototype.saveData = function() {};
Form.Fields.StaticHTML.prototype.refresh = function() {};
Form.Fields.StaticHTML.prototype.doChanges = function() {};
Form.Fields.StaticHTML.prototype.onChange = function() {};
Form.Fields.StaticHTML.prototype._ = scopeInterface;
Form.Fields.StaticHTML.prototype.is = function(t) {
  if (t === "*") return true;
  return (
    t.toLowerCase() === "StaticHTML".toLowerCase() ||
    t.toLowerCase() === this.json.id.toLowerCase()
  );
};

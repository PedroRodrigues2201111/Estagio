/**
 * Sortable
 */

Form.Fields.Sortable = function Sortable(scope, container, json) {
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._("^form").get(0);

  this.value = [];
  this.original = [];

  this.changeListeners = [];

  this.init();
};
Form.Fields.Sortable.prototype.init = function() {
  var html = Form.Template(this.json, {
    data: {
      input: true
    }
  });

  this.render = this.json.render;

  this.$.html = $(html);
  if (this.json.visibility === "hidden")
    this.$.container.parent().addClass("hidden");

  this.$.container.append(this.$.html);
  this.$.ul = this.$.container.find("ul.sortable");

  this.sortable = Sortable.create(this.$.ul[0], {
    sort: true,
    animation: 100,
    /* > Having it set to true causes drag to block on Firefox
    forceFallback: true, */
    ghostClass: "sort-ghost",
    chosenClass: "sort-chosen"
  });

  this.bind();
  this.i18n();
};
Form.Fields.Sortable.prototype.bind = function() {
  var self = this;

  this.sortable.option("onUpdate", function(ev) {
    self.value = self.$.ul
      .children("li")
      .map(function() {
        return $(this).data("data");
      })
      .get();
    self.doChanges();
  });

  this.sortable.option("filter", ".sort-custom-tool, .sort-remove");
  this.sortable.option("onFilter", function(ev) {
    var item = ev.item,
      ctrl = ev.target;

    if (Sortable.utils.is(ctrl, ".sort-remove")) {
      // Click on remove button
      $(item).remove();
      self.value = self.$.ul
        .children("li")
        .map(function() {
          return $(this).data("data");
        })
        .get();
      self.doChanges();
    } else if (Sortable.utils.is(ctrl, ".sort-custom-tool")) {
      // Click on remove button
      var action = $(ctrl).data("action");
      if (self.form.actions[action]) {
        self.form.actions[action]($(item).data("data"), item, self, self.form);
      }
    }
  });
};
Form.Fields.Sortable.prototype.i18n = function() {
  this.$.html.i18n();
};
Form.Fields.Sortable.prototype.addItem = function(data) {
  var $base = $(
    Form.Template(
      { type: "Sortable-item" },
      { data: { tools: this.json.tools, cantRemove: this.json.cantRemove } }
    )
  );
  var extra = {
    helpers:
      (this.form && this.form.view.Actions && this.form.view.Actions.helpers) ||
      {}
  };
  var html = renderCached(this.render, data, extra);
  $base.find(".sort-content").html(html);
  this.$.ul.append($base);
  $base.data("data", data);

  this.value = this.$.ul
    .children("li")
    .map(function() {
      return $(this).data("data");
    })
    .get();

  this.validate();
  this.doChanges();
};
Form.Fields.Sortable.prototype.updateItem = function(li) {
  var data = $(li).data("data");
  var extra = {
    helpers:
      (this.form && this.form.view.Actions && this.form.view.Actions.helpers) ||
      {}
  };
  var html = renderCached(this.render, data, extra);
  $(li)
    .find(".sort-content")
    .html(html);

  this.value = this.$.ul
    .children("li")
    .map(function() {
      return $(this).data("data");
    })
    .get();

  this.validate();
  this.doChanges();
};
Form.Fields.Sortable.prototype.getData = function() {
  var d = {};
  d[this.json.id] = this.get();
  return d;
};
Form.Fields.Sortable.prototype.get = function() {
  return this.value;
};
Form.Fields.Sortable.prototype.setData = function(data, preventSave) {
  var val = data[this.json.id];
  if (val === null || val === undefined) return;

  if (!preventSave) this.original = val;

  this.set(val);
};
Form.Fields.Sortable.prototype.set = function(val) {
  this.$.ul.empty();
  this.value = val;

  for (var i = 0; i < val.length; i++) {
    this.addItem(val[i]);
  }

  this.value = this.$.ul
    .children("li")
    .map(function() {
      return $(this).data("data");
    })
    .get();

  this.doChanges();
};
Form.Fields.Sortable.prototype.isChanged = function() {
  var val = this.get();
  return (
    JSON.stringify(val) !== JSON.stringify(this.original) &&
    !(this.original === null && val === "")
  );
};
Form.Fields.Sortable.prototype.reset = function() {
  this.set(this.original);
};
Form.Fields.Sortable.prototype.clear = function() {
  this.original = null;
};
Form.Fields.Sortable.prototype.applyFieldBinds = function() {
  var self = this;
  var B = this.json.binds;
  if (!B) return;

  B.forEach(function(b) {
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
  });
};
Form.Fields.Sortable.prototype.do = function(value, action, context, undo) {
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
  var bA = Form.Fields.Sortable.bindActions;

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
Form.Fields.Sortable.prototype.validate = function() {
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
  if (val.required && value.length === 0) {
    // apply error
    // i18n.t('common.errors.required');
    errors.push("app.errors.required-field");
  } else if (val.regex) {
    // make regexes
    if (!this.regexes) {
      this.regexes = {};

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
Form.Fields.Sortable.prototype.doChanges = function() {
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
Form.Fields.Sortable.prototype.saveData = function() {
  this.original = this.get();
  this.doChanges();
};
Form.Fields.Sortable.prototype.refresh = function() {};
Form.Fields.Sortable.prototype.onChange = function(callback) {
  if (!this.changeListeners) this.changeListeners = [];

  this.changeListeners.push(callback);
};
Form.Fields.Sortable.bindActions = {
  disable: [
    function(self) {
      // Do
      self.$.input.prop("disabled", true);
    },
    function(self) {
      // Undo
      self.$.input.prop("disabled", false);
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
  ]
};
Form.Fields.Sortable.prototype._ = scopeInterface;
Form.Fields.Sortable.prototype.is = function(t) {
  if (t === "*") return true;
  return (
    t.toLowerCase() === "Sortable".toLowerCase() ||
    t.toLowerCase() === this.json.id.toLowerCase()
  );
};

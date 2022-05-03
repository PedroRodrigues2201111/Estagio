/**
 * AreaPicker
 */

Form.Fields.AreaPicker = function AreaPicker(scope, container, json) {
  this.scope = scope;
  this.container = container;
  this.json = json;

  this.$ = {};
  this.$.container = $(this.container);
  this.$.html = null;
  this.form = this._("^form").get(0);

  this.value = null;
  this.original = {
    fields: []
  };

  this.changeListeners = [];

  this.init();
};
Form.Fields.AreaPicker.prototype.init = function() {
  var html = Form.Template(this.json, {
    data: {
      input: true
    }
  });

  this.$.html = $(html);
  if (this.json.visibility === "hidden")
    this.$.container.parent().addClass("hidden");

  this.$.container.append(this.$.html);
  this.$.cont = this.$.container.find("rsel");

  this.vue = vues.areapicker(this.$.cont[0]);

  // this.bind();
  //this.i18n();
};
Form.Fields.AreaPicker.prototype.bind = function() {
  var self = this;

  this.vue.onChange(function() {
    // check if changed
  });
};
Form.Fields.AreaPicker.prototype.i18n = function() {
  this.vue.setLang(i18n.language);
};
Form.Fields.AreaPicker.prototype.readonly = function(set) {
  if (typeof set === "undefined") return this.isReadOnly;

  this.isReadOnly = !!set;
  this.vue.readonly(this.isReadOnly);
  // this.$.input.attr('readonly', this.isReadOnly);
};
Form.Fields.AreaPicker.prototype.getData = function() {
  var d = {};
  d[this.json.id] = this.get();
  return d;
};
Form.Fields.AreaPicker.prototype.get = function() {
  return {
    fields: this.vue.get()
  };
};
Form.Fields.AreaPicker.prototype.setData = function(data, preventSave) {
  var val = data[this.json.id];
  if (val === null || val === undefined) return;

  if (!this.vue.isValidData(val)) return;

  if (!preventSave) this.original = JSON.parse(JSON.stringify(val));

  this.set(val);
};
Form.Fields.AreaPicker.prototype.set = function(val, silent) {
  this.vue.set(val);

  if (!silent) this.doChanges();
};
Form.Fields.AreaPicker.prototype.isChanged = function() {
  var data = this.get();
  var o = this.original;

  if ((o === null || o.length === 0) && (data === null || data.length === 0)) {
    return false;
  }

  if (data.length !== o.length) {
    return true;
  }
  for (var q = 0; q < data.length; q++) {
    if (data[q].rects.length !== o[q].rects.length) {
      return true;
    }

    if (data[q].name !== o[q].name) {
      return true;
    }

    if (data[q].color !== o[q].color) {
      return true;
    }
    for (var qq = 0; qq < data[q].rects.length; qq++) {
      if (data[q].rects[qq].name !== o[q].rects[qq].name) {
        return true;
      }

      if (data[q].rects[qq].coords.top !== o[q].rects[qq].coords.top) {
        return true;
      }
      if (data[q].rects[qq].coords.bottom !== o[q].rects[qq].coords.bottom) {
        return true;
      }
      if (data[q].rects[qq].coords.left !== o[q].rects[qq].coords.left) {
        return true;
      }
      if (data[q].rects[qq].coords.right !== o[q].rects[qq].coords.right) {
        return true;
      }
    }
  }
  return false;
};
Form.Fields.AreaPicker.prototype.reset = function() {
  this.set(this.original);
};
Form.Fields.AreaPicker.prototype.clear = function() {
  this.value = null;
  this.original = null;

  this.vue.set([]);
  this.clearErrors();
};
Form.Fields.AreaPicker.prototype.clearErrors = function() {
  if (!this._tabli)
    this._tabli = $(
      '[href="#' + this.$.html.closest(".tab-pane").attr("id") + '"]'
    ).parent();

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
};
Form.Fields.AreaPicker.prototype.applyFieldBinds = function() {
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
Form.Fields.AreaPicker.prototype.validate = function() {
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
  if (val.required && (!value || (value + "").trim() === "")) {
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
Form.Fields.AreaPicker.prototype.do = function(value, action, context, undo) {
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
  var bA = Form.Fields.AreaPicker.bindActions;

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
Form.Fields.AreaPicker.bindActions = {
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
  ],
  show: [
    function(self) {
      // Do
      self.$.container.parent().removeClass("hidden");
    },
    function(self) {
      // Undo
      self.$.container.parent().addClass("hidden");
    }
  ]
};
Form.Fields.AreaPicker.prototype.doChanges = function() {
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
Form.Fields.AreaPicker.prototype.saveData = function() {
  this.original = this.get();
  this.doChanges();
};
Form.Fields.AreaPicker.prototype.refresh = function() {};
Form.Fields.AreaPicker.prototype.onChange = function(callback) {
  if (!this.changeListeners) this.changeListeners = [];

  this.changeListeners.push(callback);
};
Form.Fields.AreaPicker.prototype._ = scopeInterface;
Form.Fields.AreaPicker.prototype.is = function(t) {
  if (t === "*") return true;
  return (
    t.toLowerCase() === "AreaPicker".toLowerCase() ||
    t.toLowerCase() === this.json.id.toLowerCase()
  );
};

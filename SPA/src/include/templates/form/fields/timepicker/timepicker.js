/**
 * TimePicker
 */

Form.Fields.TimePicker = function TimePicker(scope, container, json) {
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
Form.Fields.TimePicker.prototype.init = function() {
  var html = Form.Template(this.json, {
    data: {
      input: true
    }
  });

  this.$.html = $(html);
  if (this.json.visibility === "hidden")
    this.$.container.parent().addClass("hidden");

  this.$.container.append(this.$.html);
  this.$.label = this.$.container.find("label");
  this.$.input = this.$.container.find("input");
  this.$.input.clockpicker(
    {
      placement: "bottom",
      align: "left",
      autoclose: true
    }.deepMerge(this.json.opts || {})
  );

  this.bind();

  if (this.json.readOnly) {
    this.readonly(true);
  }
  this.i18n();
};
Form.Fields.TimePicker.prototype.bind = function() {
  var self = this;
  this.$.input.on("change", function(ev) {
    self.value = this.value;
    self.doChanges();
  });
};
Form.Fields.TimePicker.prototype.i18n = function() {
  this.$.label.i18n();
};
Form.Fields.TimePicker.prototype.readonly = function(set) {
  if (typeof set === "undefined") return this.isReadOnly;

  this.isReadOnly = !!set;
  this.$.input.attr("disabled", this.isReadOnly);
  this.$.html.find('button[data-id="close-button"]').attr("disabled", set);
};
Form.Fields.TimePicker.prototype.getData = function() {
  var d = {};
  d[this.json.id] = this.get();
  return d;
};
Form.Fields.TimePicker.prototype.get = function() {
  return this.value;
};
Form.Fields.TimePicker.prototype.setData = function(data) {
  this.original = data[this.json.id] || "";
  data[this.json.id] = this.original;
  this.set(this.original);
};
Form.Fields.TimePicker.prototype.set = function(val) {
  this.value = val;
  this.$.input.val(val);
  this.doChanges();
};
Form.Fields.TimePicker.prototype.isChanged = function() {
  return this.get() !== this.original;
};
Form.Fields.TimePicker.prototype.reset = function() {
  this.set(this.original);
};
Form.Fields.TimePicker.prototype.clear = function() {
  this.value = null;
  this.original = null;
  this.$.input.val("");
};
Form.Fields.TimePicker.prototype.applyFieldBinds = function() {};
Form.Fields.TimePicker.prototype.validate = function() {
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
Form.Fields.TimePicker.prototype.saveData = function() {
  this.original = this.get();
  this.doChanges();
};
Form.Fields.TimePicker.prototype.refresh = function() {};
Form.Fields.TimePicker.prototype.doChanges = function() {
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
Form.Fields.TimePicker.prototype.onChange = function(callback) {
  if (!this.changeListeners) this.changeListeners = [];
  this.changeListeners.push(callback);
};
Form.Fields.TimePicker.prototype._ = scopeInterface;
Form.Fields.TimePicker.prototype.is = function(t) {
  if (t === "*") return true;
  return (
    t.toLowerCase() === "TimePicker".toLowerCase() ||
    t.toLowerCase() === this.json.id.toLowerCase()
  );
};

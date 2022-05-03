/**
 * WYSIWYG
 */

Form.Fields.WYSIWYG = function WYSIWYG(scope, container, json) {
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
Form.Fields.WYSIWYG.prototype.init = function() {
  var self = this;
  var html = Form.Template(this.json, {
    data: {
      input: true
    }
  });

  this.$.html = $(html);
  if (this.json.visibility === "hidden")
    this.$.container.parent().addClass("hidden");

  this.$.container.append(this.$.html);
  this.$input = this.$.container.find("[data-id]");
  var opts = {
    svgPath: "include/plugins/trumbowyg/ui/icons.svg"
  };

  if (this.json.btns) {
    opts.btns = this.json.btns;
  }

  this.trumbowyg = this.$input
    .trumbowyg(opts)
    .on("tbwinit", function() {
      self.isInit = true;
      self.inited();
    })
    .data("trumbowyg");
  this.bind();
  this.i18n();
};
Form.Fields.WYSIWYG.prototype.bind = function() {
  var self = this;
  this.$input.on("tbwchange", function() {
    self.doChanges();
  });
  this.$.container
    .find(".trumbowyg-editor")
    .on("cut paste dragend mouseup", function() {
      self.$.container
        .find("textarea")
        .val(self.$input.html())
        .trigger("keyup");
    });
};
Form.Fields.WYSIWYG.prototype.i18n = function() {
  this.$.html.i18n();
};
Form.Fields.WYSIWYG.prototype.readonly = function(set) {
  if (typeof set === "undefined") return this.isReadOnly;

  this.isReadOnly = !!set;
  this.$input.trumbowyg(this.isReadOnly ? "disable" : "enable");
};
Form.Fields.WYSIWYG.prototype.getData = function() {
  var d = {};
  d[this.json.id] = this.get();
  return d;
};
Form.Fields.WYSIWYG.prototype.get = function() {
  var html = this.$input.trumbowyg("html");
  return this.$input.trumbowyg("html");
};
Form.Fields.WYSIWYG.prototype.setData = function(data) {
  this.original = data[this.json.id] || "";
  data[this.json.id] = this.original;
  this.set(this.original);
};
Form.Fields.WYSIWYG.prototype.set = function(val) {
  var self = this;
  if (!this.isInit) {
    this.onInit(function() {
      self.$input.trumbowyg("html", val || "");
      self.$.container.find("textarea").trigger("keyup");
    });
  } else {
    this.$input.trumbowyg("html", val || "");
    this.$.container.find("textarea").trigger("keyup");
  }
};
Form.Fields.WYSIWYG.prototype.reset = function() {
  this.set(this.original);
};
Form.Fields.WYSIWYG.prototype.clear = function() {
  this.value = null;
  this.original = null;
  this.set(this.value);
  this.clearErrors();
};
Form.Fields.WYSIWYG.prototype.clearErrors = function() {
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
Form.Fields.WYSIWYG.prototype.applyFieldBinds = function() {};
Form.Fields.WYSIWYG.prototype.validate = function() {
  // stub
};
Form.Fields.WYSIWYG.prototype.saveData = function() {
  this.original = this.get();
  this.doChanges();
};
Form.Fields.WYSIWYG.prototype.refresh = function() {};
Form.Fields.WYSIWYG.prototype.inited = function() {
  if (!this.initListeners) this.initListeners = [];

  for (i = 0; i < this.initListeners.length; i++) {
    this.initListeners[i]();
  }
};
Form.Fields.WYSIWYG.prototype.onInit = function(callback) {
  if (!this.initListeners) this.initListeners = [];

  this.initListeners.push(callback);
};
Form.Fields.WYSIWYG.prototype.doChanges = function() {
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
Form.Fields.WYSIWYG.prototype.isChanged = function() {
  return (this.get() + "").trim() !== (this.original + "" || "").trim();
};
Form.Fields.WYSIWYG.prototype.onChange = function(callback) {
  if (!this.changeListeners) this.changeListeners = [];

  this.changeListeners.push(callback);
};
Form.Fields.WYSIWYG.prototype._ = scopeInterface;
Form.Fields.WYSIWYG.prototype.is = function(t) {
  if (t === "*") return true;
  return (
    t.toLowerCase() === "WYSIWYG".toLowerCase() ||
    t.toLowerCase() === this.json.id.toLowerCase()
  );
};

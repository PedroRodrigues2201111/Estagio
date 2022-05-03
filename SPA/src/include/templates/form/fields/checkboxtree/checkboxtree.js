Form.Fields.CheckboxTree = function CheckboxTree(scope, container, json) {
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

  //this.init();
};
Form.Fields.CheckboxTree.prototype.init = function() {
  if (!this.$.html) {
    var html = Form.Template(this.json, {
      data: {
        input: true
      }
    });

    this.$.html = $(html);
    if (this.json.visibility === "hidden")
      this.$.container.parent().addClass("hidden");

    this.$.container.append(this.$.html);

    this.$.tree = this.$.container.find(".tree-container");
  }
  this.$.tree.jstree({
    core: {
      data: this.t,
      themes: {
        name: "proton"
      }
    },
    plugins: ["checkbox"]
  });

  this.bind();
  //this.i18n(); It's already translated during init
};
Form.Fields.CheckboxTree.prototype.bind = function() {
  var self = this;
  this.$.tree.bind("select_node.jstree", function(e, data) {
    if (data.node.state.selected && !data.node.state.opened)
      data.instance.toggle_node(data.node);

    for (var i = 0; i < self.changeListeners.length; i++) {
      self.changeListeners[i](self.json.id, self.get(), self.isChanged());
    }
  });
  this.$.tree.bind("deselect_node.jstree", function(e, data) {
    for (var i = 0; i < self.changeListeners.length; i++) {
      self.changeListeners[i](self.json.id, self.get(), self.isChanged());
    }
  });
};
Form.Fields.CheckboxTree.prototype.i18n = function() {
  var tree = this.$.tree.jstree(true).settings.app.core.data;
  var treeArray = [];
  var q = [];
  var p = null;
  for (var i = 0; i < tree.length; i++) {
    q.push(tree[i]);
  }
  while ((p = q.shift())) {
    treeArray.push(p);
    if (p.children) {
      for (var i = 0; i < p.children.length; i++) {
        q.push(p.children[i]);
      }
    }
  }
  for (var i = 0; i < treeArray.length; i++) {
    treeArray[i].text = i18n.t(
      this.json.basei18n +
        this.ioriginal[treeArray[i].data.id][this.json.textField]
    );
  }
  this.$.tree.jstree(true).refresh();
};
Form.Fields.CheckboxTree.prototype.getData = function() {
  var d = {};
  d[this.json.id] = this.get();
  return d;
};
Form.Fields.CheckboxTree.prototype.get = function() {
  if (!this.$.html) return;

  var tree = this.$.tree.jstree(true).get_json();

  var treeArray = [];
  var q = [];
  var p = null;
  for (var i = 0; i < tree.length; i++) {
    q.push(tree[i]);
  }
  while ((p = q.shift())) {
    treeArray.push(p);
    if (p.children) {
      for (var i = 0; i < p.children.length; i++) {
        q.push(p.children[i]);
      }
    }
  }

  var d = JSON.parse(JSON.stringify(this.original));
  var di = {};
  for (var i = 0; i < d.length; i++) {
    di[d[i][this.json.idField]] = d[i];
  }
  for (var i = 0; i < treeArray.length; i++) {
    var id = treeArray[i].data.id;
    var dii = di[id];

    if (treeArray[i].children && treeArray[i].children.length > 0) continue;

    if (treeArray[i].state && treeArray[i].state.selected) {
      dii[this.json.checkedField] = true;
    } else {
      dii[this.json.checkedField] = false;
    }
  }
  return d;
};
Form.Fields.CheckboxTree.prototype.setData = function(data) {
  this.original = data[this.json.id];
  this.ioriginal = {};
  for (var i = 0; i < this.original.length; i++) {
    this.ioriginal[this.original[i][this.json.idField]] = this.original[i];
  }

  this.tdata = JSON.parse(JSON.stringify(this.original));
  this.tindex = {};
  for (var i = 0; i < this.tdata.length; i++) {
    this.tindex[this.tdata[i][this.json.idField]] = this.tdata[i];
  }

  this.t = [];
  var pid;
  var pr;
  this.ts = Date.now() + "_";

  for (var i = 0; i < this.tdata.length; i++) {
    if (this.tdata[i][this.json.checkedField])
      this.tdata[i].state = { selected: this.tdata[i][this.json.checkedField] };

    this.tdata[i].text = i18n.t(
      this.json.basei18n + this.tdata[i][this.json.textField]
    );
    this.tdata[i].data = { id: this.tdata[i][this.json.idField] };
    this.tdata[i].id = this.ts + this.tdata[i][this.json.idField];
    pid = this.tdata[i][this.json.parentField];
    if (pid !== null) {
      this.tdata[i].icon = this.tdata[i].icon || "fa fa-fw fa-file-text-o";
      pr = this.tindex[this.tdata[i][this.json.parentField]];
      if (pr) {
        pr.icon = "fa fa-fw fa-folder-o";
        pr.children = pr.children || [];
        pr.children.push(this.tdata[i]);
      }
    } else {
      this.tdata[i].icon = this.tdata[i].icon || "fa fa-fw fa-file-text-o";
      this.t.push(this.tdata[i]);
    }
  }

  for (var i = 0; i < this.tdata.length; i++) {
    if (this.tdata[i].children && this.tdata[i].children.length > 0)
      delete this.tdata[i].state;
  }

  this.init();
};
Form.Fields.CheckboxTree.prototype.set = function() {
  // nop
};
Form.Fields.CheckboxTree.prototype.isChanged = function() {
  if (!this.$.html) return;
  var d = this.original;
  var g = this.get();
  for (var i = 0; i < d.length; i++) {
    if (d[i][this.json.checkedField] !== g[i][this.json.checkedField]) {
      return true;
    }
  }
  return false;
};
Form.Fields.CheckboxTree.prototype.reset = function() {
  this.$.tree.jstree(true).destroy(false);
  var d = {};
  d[this.json.id] = this.original;
  this.setData(d);
};
Form.Fields.CheckboxTree.prototype.clear = function() {};
Form.Fields.CheckboxTree.prototype.applyFieldBinds = function() {};
Form.Fields.CheckboxTree.prototype.saveData = function() {
  this.original = this.get();
  for (var i = 0; i < this.changeListeners.length; i++) {
    this.changeListeners[i](this.json.id, this.get(), this.isChanged());
  }
};
Form.Fields.CheckboxTree.prototype.validate = function() {};
Form.Fields.CheckboxTree.prototype.refresh = function() {};
Form.Fields.CheckboxTree.prototype.onChange = function(callback) {
  if (!this.changeListeners) this.changeListeners = [];

  this.changeListeners.push(callback);
};
Form.Fields.CheckboxTree.prototype._ = scopeInterface;
Form.Fields.CheckboxTree.prototype.is = function(t) {
  if (t === "*") return true;
  return (
    t.toLowerCase() === "CheckboxTree".toLowerCase() ||
    t.toLowerCase() === this.json.id.toLowerCase()
  );
};

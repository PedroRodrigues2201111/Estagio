function scopeInterface(p) {
  return new Scope(this, p);
}
function scopeCompare(t) {
  if (t === "*") return true;

  if (typeof this.id !== "undefined")
    if (t.toLowerCase() === (this.id + "").toLowerCase()) return true;

  if (typeof this.cmpId !== "undefined")
    if (t.toLowerCase() === (this.cmpId + "").toLowerCase()) return true;

  return t.toLowerCase() === this.constructor.name.toLowerCase();
}
function Scope(_this, p) {
  this.r = [];
  if (Array.isArray(_this)) {
    for (var i = 0; i < _this.length; i++) {
      this.r.push(_this[i]);
    }
  } else {
    this.r.push(_this);
  }
  this.p = p;

  if (p) {
    this._find(p);
  }

  this.length = 0;
  Array.prototype.push.apply(this, this.r);
}
Scope.prototype.print = function() {
  function printTree(branch) {
    let s = branch.constructor.name;

    if (branch.cmpId) {
      s += " ( " + branch.cmpId + " )";
    } else if (branch.json && branch.json.id) {
      s += " ( " + branch.json.id + " )";
    }

    if (branch.children && branch.children.length > 0) {
      return [
        s,
        ...branch.children.flatMap(b => printTree(b)).map(s => "> " + s)
      ];
    } else {
      return [s];
    }
  }

  return printTree(main).join("\n");
};
Scope.prototype.get = function(i) {
  if (i !== null && typeof i !== "undefined") return this.r[i];
  return this.r;
};
Scope.prototype.parent = function(find) {
  return new Scope(this.r, "«" + find);
};
Scope.prototype.children = function(find) {
  return new Scope(this.r, "»" + find);
};
Scope.prototype.closest = function(find) {
  return new Scope(this.r, "<" + find);
};
Scope.prototype.closestChildren = function(find) {
  return new Scope(this.r, ">" + find);
};
Scope.prototype.find = function(p) {
  return new Scope(this.r, p);
};
Scope.prototype.each = function(cb, _this) {
  for (var i = 0; i < this.r.length; i++) {
    cb.call(_this, this.r[i]);
  }
};
Scope.prototype.map = function(cb, _this) {
  var r = [];
  for (var i = 0; i < this.r.length; i++) {
    r.push(cb.call(_this, this.r[i]));
  }
  return r;
};
Scope.prototype.i18n = function() {
  for (var i = 0; i < this.r.length; i++) {
    this.r[i].i18n && this.r[i].i18n();
  }
};
Scope.prototype.refresh = function() {
  for (var i = 0; i < this.r.length; i++) {
    this.r[i].refresh && this.r[i].refresh();
  }
};
Scope.prototype.remove = function() {
  for (var i = 0; i < this.r.length; i++) {
    this.r[i].remove && this.r[i].remove();
  }
};
Scope.prototype.do = function(fn) {
  for (var i = 0; i < this.r.length; i++) {
    if (this.r[i][fn] && typeof this.r[i][fn] === "function") this.r[i][fn]();
  }
};
Scope.prototype._find = function(p) {
  var items = this.r;
  var q = null;

  this.r = [];
  var done = null;

  var shallow = false;
  var closest = false;

  var closest_found = false;

  if (p[0] === "1") {
    p = p.slice(1);
    shallow = true;
  } else if (p[0] === "`" || p[0] === "<") {
    p = "«" + p.slice(1);
    closest = true;
  } else if (p[0] === "´" || p[0] === ">") {
    p = "»" + p.slice(1);
    closest = true;
  }

  var dir = p[0];
  var trg = p.slice(1);

  if (trg === "") trg = "*";

  var cur;
  for (var it = 0; it < items.length; it++) {
    q = [items[it]];
    done = [];
    closest_found = false;

    while (q.length > 0) {
      cur = q.shift();

      switch (dir) {
        case "^":
        case "«": // look up
          if (shallow) {
            if (cur.scope && cur.scope._) {
              if (cur.scope.is(trg)) {
                this.r.push(cur.scope);
              }
            }
            break;
          }

          if (cur.scope && cur.scope._) {
            if (cur.scope.is(trg)) {
              if (
                this.r.indexOf(cur.scope) === -1 &&
                done.indexOf(cur.scope) === -1
              )
                this.r.push(cur.scope);
              if (closest) break;
            }

            if (q.indexOf(cur.scope) === -1 && done.indexOf(cur.scope) === -1) {
              q.push(cur.scope);
            }
            done.push(cur);
          }
          break;
        case "_":
        case "»": // look down
          if (cur.children) {
            for (var i = 0; i < cur.children.length; i++) {
              if (typeof cur.children[i] === "undefined") {
                cur.children.splice(i, 1);
                i--;
                continue;
              }

              if (cur.children[i]._ && cur.children[i].is(trg)) {
                this.r.push(cur.children[i]);
                closest_found = true;
              }

              if (shallow) continue;

              if (
                cur.children[i]._ &&
                q.indexOf(cur.children[i]) === -1 &&
                done.indexOf(cur.children[i]) === -1 &&
                !(closest && closest_found)
              ) {
                q.push(cur.children[i]);
              }
            }
          }
          done.push(cur);

          break;
      }
    }
  }
};

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat#Polyfill
if (!String.prototype.repeat) {
  String.prototype.repeat = function(count) {
    "use strict";
    if (this == null) {
      throw new TypeError("can't convert " + this + " to object");
    }
    var str = "" + this;
    count = +count;
    if (count != count) {
      count = 0;
    }
    if (count < 0) {
      throw new RangeError("repeat count must be non-negative");
    }
    if (count == Infinity) {
      throw new RangeError("repeat count must be less than infinity");
    }
    count = Math.floor(count);
    if (str.length == 0 || count == 0) {
      return "";
    }
    // Ensuring count is a 31-bit integer allows us to heavily optimize the
    // main part. But anyway, most current (August 2014) browsers can't handle
    // strings 1 << 28 chars or longer, so:
    if (str.length * count >= 1 << 28) {
      throw new RangeError(
        "repeat count must not overflow maximum string size"
      );
    }
    var rpt = "";
    for (;;) {
      if ((count & 1) == 1) {
        rpt += str;
      }
      count >>>= 1;
      if (count == 0) {
        break;
      }
      str += str;
    }
    return rpt;
  };
}

if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this === null) {
      throw new TypeError("Array.prototype.find called on null or undefined");
    }
    if (typeof predicate !== "function") {
      throw new TypeError("predicate must be a function");
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

if (
  Function.prototype.name === undefined &&
  Object.defineProperty !== undefined
) {
  Object.defineProperty(Function.prototype, "name", {
    get: function() {
      var funcNameRegex = /function\s([^(]{1,})\(/;
      var results = funcNameRegex.exec(this.toString());
      return results && results.length > 1 ? results[1].trim() : "";
    },
    set: function(value) {}
  });
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
Number.isInteger =
  Number.isInteger ||
  function(value) {
    return (
      typeof value === "number" &&
      isFinite(value) &&
      Math.floor(value) === value
    );
  };

Object.defineProperty(Object.prototype, "keyOf", {
  value: function(val) {
    if (!val) return;

    var T = this;

    var K = Object.keys(T);
    for (var i = 0; i < K.length; i++) {
      if (T[K[i]] === val) {
        return K[i];
      }
    }

    return null;
  },
  enumerable: false
});
Object.defineProperty(Object.prototype, "forEach", {
  value: function(callback, _this) {
    if (!callback) return;

    var T = this;

    var K = Object.keys(T);
    for (var i = 0; i < K.length; i++) {
      callback.call(_this, T[K[i]], K[i], T);
    }
  },
  enumerable: false,
  writable: true
});
Object.defineProperty(Object.prototype, "pathGet", {
  value: function(str) {
    var T = this;

    str = str.replace(/\[(\w+)\]/g, ".$1");
    str = str.replace(/^\./, "");

    var a = str.split(".");
    for (var i = 0, n = a.length; i < n; ++i) {
      var k = a[i];
      if (k in T) {
        T = T[k];
      } else {
        return;
      }
    }
    return T;
  },
  enumerable: false,
  writable: true
});
Object.defineProperty(Object.prototype, "pathSet", {
  value: function(str, value) {
    var T = this;

    str = str.replace(/\[(\w+)\]/g, ".$1");
    str = str.replace(/^\./, "");

    var a = str.split(".");
    for (var i = 0, n = a.length; i < n; ++i) {
      var k = a[i];
      if (i === n - 1) {
        T[k] = value;
      } else if (k in T) {
        T = T[k];
      } else if ((a[i + 1] | 0) + "" === a[i + 1]) {
        T[k] = [];
        T = T[k];
      } else {
        T[k] = {};
        T = T[k];
      }
    }
  },
  enumerable: false,
  writable: true
});
Object.defineProperty(Object.prototype, "map", {
  value: function(callback, _this) {
    if (!callback) return;
    var T = this;
    var R = [];

    var K = Object.keys(T);
    for (var i = 0; i < K.length; i++) {
      R.push(callback.call(_this, T[K[i]], K[i], T));
    }

    return R;
  },
  enumerable: false,
  writable: true
});
Object.defineProperty(Object.prototype, "keyMap", {
  value: function(callback, _this) {
    if (!callback) return;
    var T = this;
    var R = {};

    var K = Object.keys(T);
    for (var i = 0; i < K.length; i++) {
      R[K[i]] = callback.call(_this, T[K[i]], K[i], T);
    }

    return R;
  },
  enumerable: false,
  writable: true
});
Object.defineProperty(Object.prototype, "simpleMerge", {
  value: function(obj) {
    var T = this;

    var K = Object.keys(obj);
    for (var i = 0; i < K.length; i++) {
      T[K[i]] = obj[K[i]];
    }

    return T;
  },
  enumerable: false,
  writable: true
});
Object.defineProperty(Object.prototype, "deepMerge", {
  value: function(O) {
    if (!O) return this;

    var T = this;

    var QT = [T];
    var QO = [O];
    while (QO.length > 0) {
      var cT = QT.shift();
      var cO = QO.shift();
      var K = Object.keys(cO);

      for (var i = 0; i < K.length; i++) {
        if (
          !Array.isArray(cT[K[i]]) &&
          typeof cT[K[i]] === "object" &&
          cT[K[i]] !== null &&
          !Array.isArray(cO[K[i]]) &&
          typeof cO[K[i]] === "object" &&
          cO[K[i]] !== null
        ) {
          QO.push(cO[K[i]]);
          QT.push(cT[K[i]]);
        } else {
          cT[K[i]] = cO[K[i]];
        }
      }
    }
    return T;
  },
  enumerable: false,
  writable: true
});
Object.defineProperty(JSON, "tryParse", {
  value: function(str) {
    var o;
    try {
      o = JSON.parse(str);
    } catch (e) {
      o = false;
    }
    return o;
  },
  enumerable: false,
  writable: true
});
Object.defineProperty(JSON, "simpleCopy", {
  value: function(obj) {
    var o;
    try {
      o = JSON.parse(JSON.stringify(obj));
    } catch (e) {
      o = false;
    }
    return o;
  },
  enumerable: false,
  writable: true
});
Object.defineProperty(String.prototype, "fillWith", {
  value: function(obj, safe) {
    if (!obj) return;
    return this.replace(/\{\{\#([\w_-]+)\}\}(.+?)\{\{\/\1\}\}/g, function(
      match,
      v,
      v1
    ) {
      if (typeof obj[v] !== "undefined") {
        if (typeof obj[v] === "object") {
          if (Array.isArray(obj[v])) return v1.repeat(obj[v].length);
          return v1.repeat(Object.keys(obj[v]).length);
        } else {
          return v1;
        }
      }
      return "";
    })
      .replace(/\{\{\:has\(([\w_-]+)\)(.+?)\?\}\}/g, function(match, v, v1) {
        return typeof obj[v] !== "undefined" ? v1 : "";
      })
      .replace(/\{\{([\w_-]+)\}\}/g, function(match, v) {
        if (safe && typeof obj[v] === "string") return obj[v].escapeHtml();
        if (obj[v] === null || obj[v] === undefined) return "";
        return obj[v];
      });
  },
  enumerable: false,
  writable: true
});
Object.defineProperty(String.prototype, "escapeHtml", {
  value: function() {
    return this.replace(/[\"&<>]/g, function(a) {
      return {
        '"': "&quot;",
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;"
      }[a];
    });
  },
  enumerable: false,
  writable: true
});
strFormat = function() {
  if (arguments.length < 2)
    return console.error("strFormat needs at least 2 arguments");

  var vals = Array.prototype.slice.call(arguments, 1);
  var str = arguments[0];

  var matching = false;
  var texts = [];
  var formats = [];
  var curText = [];
  var curFormat = [];

  var j;

  for (var i = 0; i < str.length; i++) {
    if (matching) {
      if (str[i] !== "}") {
        curFormat.push(str[i]);
      } else {
        // check if escaped
        j = 1;
        while (i - j >= 0 && str[i - j] === "\\") {
          j++;
        }
        if (j % 2 === 1) {
          matching = false;
          formats.push(curFormat.join(""));
          curFormat = [];
        } else {
          curFormat.push(str[i]);
        }
      }
    } else {
      if (str[i] !== "{") {
        curText.push(str[i]);
      } else {
        // check if escaped
        j = 1;
        while (i - j >= 0 && str[i - j] === "\\") {
          j++;
        }
        if (j % 2 === 1) {
          matching = true;
          texts.push(curText.join(""));
          curText = [];
        } else {
          curText.push(str[i]);
        }
      }
    }
  }

  if (matching) {
    console.error("Unmatched {");
  } else {
    texts.push(curText.join(""));
  }

  if (texts.length !== formats.length + 1) console.error("Bug in strFormat");

  var f_str = [];
  var f, s, id, ci, frmt, t;
  for (i = 0; i < formats.length; i++) {
    frmt = null;
    f = formats[i];

    // get id
    ci = f.indexOf(":");
    if (ci > -1) {
      id = f.slice(0, ci);
      frmt = f.slice(ci + 1);
    } else {
      id = f | 0;
    }

    if (f > vals.length) console.error("No " + f + " argument.");

    t = typeof vals[id];

    switch (t) {
      case "number":
        f = formatNumber(vals[id], frmt);
        break;
    }

    // find if has colon

    // find period

    // apply format

    f_str.push(texts[i]);
    f_str.push(f);
  }
  f_str.push(texts[i]);
  return f_str.join("");
};

function formatNumber(num, format) {
  var sNum = num + "";
  var fI = format.indexOf(".");
  var nI = sNum.indexOf(".");

  var fInt = fI > -1 ? format.slice(0, fI) : format;
  var fDec = fI > -1 ? format.slice(fI + 1) : "";

  var nInt = nI > -1 ? sNum.slice(0, nI) : sNum;
  var nDec = nI > -1 ? sNum.slice(nI + 1) : "";

  var sInt = [];
  var sDec = [];

  if (fInt !== "") {
    for (var i = 1; i <= fInt.length || i <= nInt.length; i++) {
      switch (fInt[fInt.length - i]) {
        case "0":
          if (nInt.length >= i) {
            sInt.unshift(nInt[nInt.length - i]);
          } else {
            sInt.unshift(0);
          }
          break;
        default:
          sInt.unshift(nInt[nInt.length - i]);
      }
    }
  } else {
    sInt.push(nInt);
  }

  if (fDec !== "") {
    for (var i = 0; i < fDec.length; i++) {
      switch (fDec[i]) {
        case "#":
          if (nDec.length > i) {
            sDec.push(nDec[i]);
          }
          break;
        case "0":
          if (nDec.length > i) {
            sDec.push(nDec[i]);
          } else {
            sDec.push(0);
          }
          break;
        default:
          sDec.push(fDec[i]);
      }
    }
  }

  return sInt.join("") + (sDec.length > 0 ? "." : "") + sDec.join("");
}

if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function(predicate) {
    if (this === null) {
      throw new TypeError(
        "Array.prototype.findIndex called on null or undefined"
      );
    }
    if (typeof predicate !== "function") {
      throw new TypeError("predicate must be a function");
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return i;
      }
    }
    return -1;
  };
}

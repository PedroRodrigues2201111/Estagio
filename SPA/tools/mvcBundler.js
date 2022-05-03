const tty = require.main === module;

function start(LOG) {
  const fs = require("fs");
  const md = require("markdown-it")({ html: true });

  const srcDir = "..\\src\\mvc\\";
  const outputDir = "..\\build\\mvc\\";
  const langOutputDir = "..\\build\\pwa\\include\\resources\\lang\\";

  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(langOutputDir, { recursive: true });

  md.renderer.rules.table_open = function() {
    return '<div class="table-responsive"><table class="table">\n';
  };

  md.renderer.rules.table_close = function() {
    return "</table></div>\n";
  };

  function getComponentsInDir(dir) {
    var rootdir = dir;
    var root;

    try {
      root = fs.readdirSync(rootdir);
    } catch (e) {
      return {};
    }
    var Q = root;

    var components = {};

    while (Q.length > 0) {
      let q = Q.shift();

      if (!q.match(/\.json$/)) continue;

      if (fs.lstatSync(rootdir + "/" + q).isDirectory()) {
        Q = Q.concat(
          fs.readdirSync(rootdir + "/" + q).map(function(v) {
            return q + "/" + v;
          })
        );
      } else {
        try {
          let json = fs
            .readFileSync(rootdir + "/" + q, "utf8")
            .replace(/"<%include:([\w\.]+)%>"/g, function(m, p) {
              return JSON.stringify(fs.readFileSync(rootdir + "/" + p, "utf8"));
            });
          try {
            let tmp = JSON.parse(json);

            if (!tmp.opts.id) {
              LOG("Component " + rootdir + "/" + q + " has no id.", "ERROR");
            } else {
              components[tmp.opts.id] = json;
            }
          } catch (e) {
            LOG("Error parsing Component " + q, "ERROR");
          }
        } catch (err) {
          LOG(err.message + " in " + rootdir + "/" + q, "ERROR");
        }
      }
    }

    return components;
  }

  function getViews() {
    var rootdir = srcDir + "views";
    var compdir = srcDir + "components";
    var i18ndir = srcDir + "en.common.json";

    var root = fs.readdirSync(rootdir);

    var i18n;
    try {
      i18n = JSON.parse(fs.readFileSync(i18ndir, "utf8"));
      i18n.views = i18n.views || {};
    } catch (err) {
      LOG("Error " + err.message + " in " + i18ndir, "ERROR");
      i18n = { views: {} };
    }

    var components = getComponentsInDir(compdir);
    let cK = Object.keys(components);
    for (let i = 0, k = cK[i]; i < cK.length; i++, k = cK[i]) {
      if (components[k] !== null)
        LOG("Duplicate Component: " + compdir + "/" + k + ".json", "ERROR");
      components[k] = JSON.parse(components[k]);
    }

    var Q = root;

    var viewJsons = {};
    var viewScripts = "";

    var initdir = srcDir + "init.js";
    var initjs = "";
    try {
      initjs = fs.readFileSync(initdir, "utf8");
    } catch (err) {
      LOG("No initjs found", "LOG");
    }
    viewScripts += initjs + "\n";

    var viewHelps = {};

    while (Q.length > 0) {
      let q = Q.shift();
      let json;
      let js;
      let help;

      let compdir;
      let comps;

      try {
        json = fs.readFileSync(rootdir + "/" + q + "/view.json", "utf8");

        try {
          js = fs.readFileSync(rootdir + "/" + q + "/view.js", "utf8");
        } catch (e) {
          LOG(`No js for ${q}. Assuming menu entry`, "LOG");
        }

        try {
          help = fs.readFileSync(rootdir + "/" + q + "/help.md", "utf8");
        } catch (e) {}

        compdir = rootdir + "/" + q + "/components";
      } catch (e) {
        LOG("No complete view found for " + q, "LOG");
        continue;
      }
      var jsonId = JSON.parse(json).id;

      comps = getComponentsInDir(compdir);
      let cK = Object.keys(comps);
      for (let i = 0, k = cK[i]; i < cK.length; i++, k = cK[i]) {
        if (components[k]) {
          LOG("Duplicate component: " + compdir + "/" + k + ".json", "ERROR");
        } else {
          try {
            components[k] = JSON.parse(
              comps[k].replace(/<%view%>/g, "views." + jsonId)
            );
          } catch (e) {
            LOG("Error parsing Component: " + q, "ERROR");
          }
        }
      }

      try {
        json = JSON.parse(json.replace(/<%view%>/g, "views." + jsonId));
      } catch (e) {
        LOG("Error parsing View " + q, "ERROR");
        continue;
      }

      if (!jsonId) {
        LOG("View " + q + " has no id", "LOG");
        continue;
      }

      if (jsonId !== q) {
        LOG("View " + q + " has an id of " + jsonId, "LOG");
      }

      i18n["views"][jsonId] = json.i18n || i18n["views"][jsonId];

      if (help) viewHelps[jsonId] = help;

      delete json.i18n;
      viewJsons[jsonId] = json;
      if (js) {
        viewScripts += `
// ## View ${jsonId} start ##
${js}
// ## View ${jsonId} end ##
    `;
      }
    }

    return {
      viewScripts: viewScripts,
      viewJsons: viewJsons,
      viewHelps: viewHelps,
      components: components,
      i18n: i18n
    };
  }

  function renderMarkdown(mds) {
    var K = Object.keys(mds);
    var renders = {};
    for (var i = 0, k = K[i]; i < K.length; i++, k = K[i]) {
      renders[k] = md.render(mds[k]);
    }
    return renders;
  }

  function writeBundles(data) {
    fs.writeFileSync(
      outputDir + "components.json",
      JSON.stringify(data.components, null, 2),
      "utf8"
    );
    fs.writeFileSync(
      outputDir + "views.json",
      JSON.stringify(data.viewJsons, null, 2),
      "utf8"
    );
    fs.writeFileSync(outputDir + "views.js", data.viewScripts, "utf8");
    fs.writeFileSync(
      langOutputDir + "en.json",
      JSON.stringify(data.i18n, null, 2),
      "utf8"
    );
  }

  LOG("Bundling Views", "LOG");

  var viewData = getViews();
  var renders = renderMarkdown(viewData.viewHelps);

  delete viewData.viewHelps;

  viewData.i18n["help-html"] = renders;

  writeBundles(viewData);

  LOG("Done.", "LOG");
}

module.exports = start;

if (tty) {
  const argv = require("minimist")(process.argv.slice(2));
  const args_help = `
    no arguments : compile for production
  `;

  if (argv.h || argv.help) {
    console.log(args_help);
    return;
  }

  start((text, _severity) => {
    console.log(text);
  });
}

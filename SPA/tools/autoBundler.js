const chokidar = require("chokidar");
const argv = require("minimist")(process.argv.slice(2));
const fse = require("fs-extra");
const chalk = require("chalk");
const fs = require("fs");

let SEVERITY = "ERROR";

const indexPath = "..\\static\\index.html";
const indexOutPath = "..\\build\\pwa\\index.html";
const indexReplace = ((_) => {
	const replacements = {};
	return (a, b) => {
		if (Array.isArray(a)) {
			for (const [aa, bb] of a) {
				replacements[aa] = bb;
			}
		} else {
			replacements[a] = b;
		}

		let index = fs.readFileSync(indexPath, "utf8");

		for (const [key, value] of Object.entries(replacements)) {
			index = index.replace(key, value);
		}

		fs.writeFileSync(indexOutPath, index, "utf8");
	};
})();

const LOG = (msg, severity) => {
	switch (severity) {
		case "ERROR":
			console.log(
				chalk` {red [ ${new Date().toLocaleTimeString()} ] >} ${msg}`
			);
			break;

		case "LOG":
			if (SEVERITY === "LOG")
				console.log(
					chalk` {blue [ ${new Date().toLocaleTimeString()} ] >} ${msg}`
				);
			break;
		case "SUCCESS":
			console.log(
				chalk` {green [ ${new Date().toLocaleTimeString()} ] >} ${msg}`
			);
			break;
		default:
			console.log(` [ ${new Date().toLocaleTimeString()} ] > ${msg}`);
	}
};

const debounce = (callback, time = 250) => {
	let interval;
	return (...args) => {
		clearTimeout(interval);
		interval = setTimeout(() => {
			interval = null;
			callback(...args);
		}, time);
	};
};

const args_help = `
  no arguments : run all bundlers
    -a, --auto : run all bundlers and start file listeners
          --js : bundle javascript
         --css : bundle CSS
         --mvc : bundle views
     --automvc : bundle views and start file listeners
       --build : bundle views and prep build output
       --clean : remove /build and /temp
     --rebuild : clean and build
`;

function tri(f) {
	return (...args) => {
		try {
			f(...args);
			return true;
		} catch (e) {
			LOG(e.message, "ERROR");
			return false;
		}
	};
}

function getJSBundler() {
	const bundler = require("./jsBundler");
	return tri(bundler);
}
function getTemplatesBundler() {
	const bundler = require("./templateBundler");
	return tri(bundler);
}
function getHbsTemplatesBundler() {
	const bundler = require("./templateHbsBundler");
	return tri(bundler);
}
function getCSSBundler() {
	const bundler = require("./cssBundler");
	return tri(bundler);
}
function getMVCBundler() {
	const bundler = require("./mvcBundler");
	return tri(bundler);
}

function autoTemplates() {
	const bundleTemplates = debounce((_) => {
		bundle("Component Templates", [
			getTemplatesBundler(),
			getHbsTemplatesBundler(),
		]);
	});

	var hbsWatcher = chokidar.watch("..\\src\\include\\templates\\**");
	hbsWatcher.on("ready", (_) => {
		LOG("Watching: Component Templates");
		hbsWatcher.on("change", (_) => {
			bundleTemplates();
		});
	});
}

function autoCSS() {
	const bundleCSS = debounce((_) => {
		bundle("CSS", getCSSBundler());
	});
	const cssWatcher = chokidar.watch([
		"..\\src\\include\\css\\*.css",
		"..\\src\\include\\vue\\*.css",
	]);
	cssWatcher.on("ready", (_) => {
		LOG("Watching: CSS");
		cssWatcher.on("change", (_) => {
			bundleCSS();
		});
	});
}
function autoMVC() {
	const bundleMVC = debounce((_) => {
		bundle("MVC", getMVCBundler());
	});
	const mvcWatcher = chokidar.watch("..\\src\\mvc\\**");
	mvcWatcher.on("ready", (_) => {
		LOG("Watching: MVC");
		mvcWatcher.on("change", (_) => {
			bundleMVC();
		});
	});
}
function autoJS() {
	const bundleJS = debounce((_) => {
		bundle("JS", getJSBundler());
	});
	var jsWatcher = chokidar.watch([
		"..\\src\\include\\js\\*.js",
		"..\\src\\include\\vue\\*.js",
		"..\\temp\\templates*.js",
	]);
	jsWatcher.on("ready", (_) => {
		LOG("Watching: JS");
		jsWatcher.on("change", (_) => {
			bundleJS();
		});
	});
}

async function autoBundle() {
	bundleAll();
	autoTemplates();
	autoJS();
	autoCSS();
	autoMVC();
}

if (argv.h || argv.help) {
	console.log(args_help);
	return;
}

function clean() {
	fse.removeSync("..\\temp");
	fse.removeSync("..\\build");
}

function buildPrep() {
	fse.mkdirSync("..\\temp", { recursive: true });
	fse.mkdirSync("..\\build\\pwa\\include", { recursive: true });

	// copy statics
	fse.copySync("..\\static\\index.html", "..\\build\\pwa\\index.html");
	fse.copySync("..\\static\\manifest.json", "..\\build\\pwa\\manifest.json");
	fse.copySync("..\\static\\resources", "..\\build\\pwa\\include\\resources");
	fse.copySync("..\\static\\sw-toolbox", "..\\build\\pwa\\sw-toolbox");
	fse.copySync("..\\static\\assets", "..\\build\\pwa\\assets");
	fse.copySync("..\\static\\sw.js", "..\\build\\pwa\\sw.js");
	fse.copySync("..\\static\\offline.html", "..\\build\\pwa\\offline.html");

	fse.copySync("..\\static\\scripts", "..\\build\\pwa\\scripts");

	// copy pdfjs
	fse.copySync(
		"..\\src\\include\\plugins\\pdfjs",
		"..\\build\\pwa\\include\\pdfjs"
	);
	// copy fontawesome
	fse.copySync(
		"..\\src\\include\\plugins\\font-awesome",
		"..\\build\\pwa\\include\\font-awesome"
	);
}

function bundle(name, f) {
	LOG("----------");
	LOG("Bundling: " + name);
	var result = Array.isArray(f)
		? f.reduce((acc, ff) => acc && ff(LOG, indexReplace), true)
		: f(LOG, indexReplace);

	if (result) {
		LOG("Bundled: " + name, "SUCCESS");
	} else {
		LOG("Error bundling: " + name, "ERROR");
	}
}

function bundleAll() {
	LOG("Bundling All");

	bundle("Component Templates", [
		getTemplatesBundler(),
		getHbsTemplatesBundler(),
	]);
	bundle("JS", getJSBundler());
	bundle("CSS", getCSSBundler());
	bundle("MVC", getMVCBundler());

	LOG("----------");
	LOG("Bundled All", "SUCCESS");
	LOG("----------");
}

if (argv.v || argv.verbose) {
	SEVERITY = "LOG";
}

if (argv.a || argv.auto) {
	buildPrep();
	LOG("Starting all auto bundlers");
	autoBundle();
} else if (argv.automvc) {
	LOG("Starting MVC auto bundler");
	autoMVC();
} else if (argv.js) {
	bundle("Component Templates", [
		getTemplatesBundler(),
		getHbsTemplatesBundler(),
	]);
	bundle("JS", getJSBundler());
} else if (argv.css) {
	bundle("CSS", getCSSBundler());
} else if (argv.mvc) {
	bundle("MVC", getMVCBundler());
} else if (argv.build) {
	buildPrep();
	bundleAll();
} else if (argv.rebuild) {
	clean();
	buildPrep();
	bundleAll();
} else if (argv.clean) {
	clean();
} else {
	buildPrep();
	bundleAll();
}

const tty = require.main === module;

function start(LOG, indexReplace) {
	const fs = require("fs");
	const UglifyJS = require("uglify-js");
	const path = require("path");

	const indexFullPath = "..\\static\\index.full.html";
	const indexPath = "..\\static\\index.html";
	const indexOutPath = "..\\build\\pwa\\index.html";
	const srcDir = "..\\src\\";
	const outputDir = "..\\build\\pwa\\include\\";

	var file = fs.readFileSync(indexFullPath, "utf8");

	var reg = /src\=\"([\w\/\-\.]+)\"/g;

	var matches,
		scripts = [];
	while ((matches = reg.exec(file))) {
		scripts.push(path.normalize(matches[1]));
	}

	function isNoCompile(s) {
		return (
			s === "include\\bundles\\templates.hbs.js" ||
			s === "include\\bundles\\templates.js" ||
			s.indexOf("include\\js\\") === 0 ||
			s.indexOf("include\\vue\\") === 0
		);
	}

	var no_compile = scripts.filter(isNoCompile);

	var compile = scripts.filter(function (s) {
		return !isNoCompile(s);
	});

	function parsePath(s) {
		return (
			{
				"include\\bundles\\templates.hbs.js": "..\\temp\\templates.hbs.js",
				"include\\bundles\\templates.js": "..\\temp\\templates.js",
			}[s] || srcDir + s
		);
	}

	var ncbundle = no_compile
		.map(function (s) {
			return "// ### " + s + " ### \n" + fs.readFileSync(parsePath(s), "utf8");
		})
		.join("\n");

	var code = compile
		.map(function (s) {
			return {
				name: s,
				content: fs.readFileSync(path.normalize(srcDir + s), "utf8"),
			};
		})
		.reduce((p, n) => {
			p[n.name] = n.content;
			return p;
		}, {});

	var result = {
		code: Object.keys(code)
			.map((k) => "\n// >>> " + k + " <<<\n" + code[k])
			.join("\n\n"),
	};

	let timestamp = Date.now();

	let outVendorPath = outputDir + `vendor_bundle_${timestamp}.js`;
	fs.writeFileSync(
		outVendorPath,
		result.code.replace(/\r\n|\r|\n/g, "\n"),
		"utf8"
	);
	let outJsPath = outputDir + `js_bundle_${timestamp}.js`;
	fs.writeFileSync(outJsPath, ncbundle.replace(/\r\n|\r|\n/g, "\n"), "utf8");
	indexReplace([
		["vendor_bundle.js", `vendor_bundle_${timestamp}.js`],
		["js_bundle.js", `js_bundle_${timestamp}.js`],
	]);
	/*
	let index = fs.readFileSync(indexPath, "utf8");
	index = index.replace("vendor_bundle.js", `vendor_bundle_${timestamp}.js`);
	index = index.replace("js_bundle.js", `js_bundle_${timestamp}.js`);
	fs.writeFileSync(indexOutPath, index, "utf8");
*/
	let ls = fs.readdirSync(outputDir);
	ls.forEach((l) => {
		if (l.indexOf(timestamp) > -1) return;
		if (l.match(/vendor_bundle.*js$/)) {
			fs.unlinkSync(outputDir + l);
		} else if (l.match(/js_bundle.*js$/)) {
			fs.unlinkSync(outputDir + l);
		}
	});
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

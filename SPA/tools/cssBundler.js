const tty = require.main === module;

function start(LOG, indexReplace) {
	const fs = require("fs");
	const ccss = require("clean-css");
	const npath = require("path");

	const indexPath = "../static/index.full.html";
	const srcDir = "../src/";
	const outputDir = "../build/pwa/include/";

	var file = fs.readFileSync(indexPath, "utf8");

	var reg = /href\=\"(include\/[\w\/\-\.]+)\"/g;

	var matches,
		scripts = [];

	while ((matches = reg.exec(file))) {
		scripts.push(matches[1]);
	}

	function isDevFile(s) {
		return (
			s == "include/css/main.css" ||
			s == "include/css/grid.css" ||
			s.indexOf("include/vue/") > -1
		);
	}

	var imports = [];
	var bundles = scripts
		.map(function (script) {
			var scriptPath = npath.normalize(script);
			var f = fs.readFileSync(srcDir + scriptPath, "utf8");
			return [
				scriptPath,
				"/* ### " +
					scriptPath +
					" ### */\n" +
					f
						.replace(
							/(url\([\"\']?)(?![\"\']?(?:data|http|\/\/|\/))/g,
							function (_, p1) {
								const dir = npath.normalize(
									p1 +
										srcDir +
										scriptPath.split("\\").slice(0, -1).join("\\") +
										"\\"
								);

								return dir;
							}
						)
						.replace(/^@import.*$/gm, function (m) {
							imports.push(m);
							return "";
						}),
			];
		})
		.map((c) => c[1]);

	function parseImports(str) {
		LOG("Parsing...", "LOG");
		return str.replace(/^@import url\("?(.+)"?\).*$/gm, (_, path) => {
			LOG("Trying to @import " + srcDir + path, "LOG");
			try {
				const css = fs.readFileSync(srcDir + path, "utf8");
				return css.replace(
					/(url\()'?"?((?!'?"?data).+?)'?"?(\))/gm,
					(_, pre, urlPath, post) => {
						LOG("Changing path " + urlPath, "LOG");

						var newPath =
							npath
								.normalize(srcDir + path)
								.split("\\")
								.slice(0, -1)
								.join("\\") +
							"\\" +
							urlPath;

						return npath.normalize(pre + newPath + post);
					}
				);
			} catch (e) {
				LOG("Failed to open file: " + e, "LOG");
			}
			return "";
		});
	}

	function parseUrls(str) {
		LOG("Parsing...", "LOG");
		return str.replace(
			/(url\()'?"?((?!'?"?data).+?)'?"?(\))/gm,
			(_, pre, path, post) => {
				LOG(" | Trying to move " + " | " + srcDir + " | " + path, "LOG");
				try {
					let cannonPath = ~path.indexOf("#")
						? path.split("#").slice(0, -1).join("#")
						: path;
					cannonPath = ~cannonPath.indexOf("?")
						? cannonPath.split("?").slice(0, -1).join("?")
						: cannonPath;
					cannonPath = npath.normalize(cannonPath);

					const oldPath = npath.normalize(srcDir + cannonPath);
					const filename = cannonPath.split("\\").slice(-1)[0];

					const newPath = npath.normalize(outputDir + "assets\\" + filename);

					fs.copyFileSync(oldPath, newPath);

					LOG("=> SUCCESS \n", "LOG");

					return (
						pre +
						newPath.replace("..\\build\\pwa\\include", ".") +
						post
					).replace(/\\/g, "/");
				} catch (e) {
					LOG("=> FAILED to move file: " + e + "\n", "LOG");
				}
				return _;
			}
		);
	}

	fs.mkdirSync(outputDir + "assets/", { recursive: true });
	const unparsedCss = imports.join("\n") + "\n" + bundles.join("\n");
	const parsedCss = parseUrls(parseImports(unparsedCss));
	var css = parsedCss; //new ccss({ processImport: false }).minify(parsedCss).styles;

	let timestamp = Date.now();
	fs.writeFileSync(`${outputDir}bundle_${timestamp}.css`, css, "utf8");
	indexReplace([["bundle.css", `bundle_${timestamp}.css`]]);
	LOG("cssFull bundled.", "LOG");
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

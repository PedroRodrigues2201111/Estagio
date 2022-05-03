const tty = require.main === module;

function start(LOG) {
	const fs = require("fs");
	const srcDir = "..\\src\\include\\templates\\";
	const outputDir = "..\\temp\\";

	const dirs = ["view", "components", "errors", "form", "grid", "widgets"];
	const superDirs = ["form\\fields", "widgets"];

	const filelist = [
		...dirs.flatMap((dir) =>
			fs
				.readdirSync(srcDir + dir, { withFileTypes: true })
				.filter(
					(dirent) =>
						dirent.isFile() &&
						dirent.name.indexOf(".js") === dirent.name.length - 3
				)
				.map(({ name }) => srcDir + dir + "\\" + name)
		),
		...superDirs.flatMap((sd) =>
			fs
				.readdirSync(srcDir + sd, { withFileTypes: true })
				.filter((dirent) => dirent.isDirectory())
				.map(({ name }) => name)
				.flatMap((d) =>
					fs
						.readdirSync(srcDir + sd + "\\" + d, { withFileTypes: true })
						.filter(
							(dirent) =>
								dirent.isFile() &&
								dirent.name.indexOf(".js") === dirent.name.length - 3
						)
						.map(({ name }) => srcDir + sd + "\\" + d + "\\" + name)
				)
		),
	];

	const bundle = filelist.map((x) => fs.readFileSync(x, "utf-8")).join("\n");

	fs.mkdirSync(outputDir, { recursive: true });
	fs.writeFileSync(outputDir + "templates.js", bundle, "utf-8");
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

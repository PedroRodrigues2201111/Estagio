var tty = require.main === module;

function start(LOG) {
  const cp = require("child_process");
  const srcDir = "..\\src\\include\\templates\\";
  const outputDir = "..\\temp\\";

  cp.execFileSync(".\\handlebars.exe", [
    "-e",
    "hbs",
    srcDir,
    "-f",
    outputDir + "templates.hbs.js"
  ]);
}

module.exports = start;

if (tty) {
  const argv = require("minimist")(process.argv.slice(2));
  const args_help = `
    no arguments : compile for production
  `;

  if (argv.h || argv.help) {
    tty && console.log(args_help);
    return;
  }

  start((text, _severity) => {
    console.log(text);
  });
}

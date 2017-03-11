import child_process = require("child_process");
import process = require("process");

let spawnSync = child_process.spawnSync;
let isWin = /^win/.test(process.platform);

let pkg_config_executable = "pkg-config" + (isWin) ? ".exe" : "";

let args = process.argv.slice(2);
// console.log('argv',args);

if (args.indexOf("--exists") !== -1) {
	console.log(spawnSync("pkg-config", args).status === 0 ? "1" : "0");
} else if (args.indexOf("--libs") !== -1) {
	console.log(spawnSync("pkg-config", args).output.join(" "));
} else if (args.indexOf("--cflags") !== -1) {
	console.log(spawnSync("pkg-config", args).output.join(" "));
}

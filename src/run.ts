#!/usr/bin/env node

console.log(process.argv);

import child_process = require("child_process");
let spawnSync = child_process.spawnSync;

let command = normalize_path(process.argv[2]);
let args = process.argv.slice(3);
console.log(command, args);
let stat = spawnSync(command, args, { shell: true, stdio: "inherit" });
process.exit(stat.status);

function normalize_path(filepath: string): string {
	if (process.platform === "win32") {
		return filepath.split(/\/|\\/).join("\\");
	}
	return filepath;
}

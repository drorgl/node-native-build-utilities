#!/usr/bin/env node
"use strict";
exports.__esModule = true;
console.log(process.argv);
var child_process = require("child_process");
var spawnSync = child_process.spawnSync;
var command = normalize_path(process.argv[2]);
var args = process.argv.slice(3);
console.log(command, args);
var stat = spawnSync(command, args, { shell: true, stdio: "inherit" });
process.exit(stat.status);
function normalize_path(filepath) {
    if (process.platform === "win32") {
        return filepath.split(/\/|\\/).join("\\");
    }
    return filepath;
}
//# sourceMappingURL=run.js.map
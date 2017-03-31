#!/usr/bin/env node
"use strict";
exports.__esModule = true;
var promisified_fs_1 = require("./utilities/promisified_fs");
console.log(process.argv);
var child_process = require("child_process");
var spawnSync = child_process.spawnSync;
var command = promisified_fs_1.normalize_path(process.argv[2]);
var args = process.argv.slice(3);
console.log(command, args);
var stat = spawnSync(command, args, { shell: true, stdio: "inherit" });
process.exit(stat.status);
//# sourceMappingURL=run.js.map
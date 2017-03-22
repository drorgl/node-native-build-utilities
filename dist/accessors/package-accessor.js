"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var app_root_path = require("app-root-path");
exports.node_package = JSON.parse(fs.readFileSync(path.join(app_root_path.path, "package.json")).toString());
//# sourceMappingURL=package-accessor.js.map
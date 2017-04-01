"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
exports.node_package = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json")).toString());
//# sourceMappingURL=package-accessor.js.map
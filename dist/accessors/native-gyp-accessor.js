"use strict";
exports.__esModule = true;
var fs = require("fs");
var strip_json_comments = require("strip-json-comments");
exports.NATIVE_GYP_FILENAME = "native_gyp.json";
function exists() {
    return fs.existsSync(exports.NATIVE_GYP_FILENAME);
}
exports.exists = exists;
function read() {
    if (!fs.existsSync(exports.NATIVE_GYP_FILENAME)) {
        throw new Error("file not found");
    }
    var file = fs.readFileSync(exports.NATIVE_GYP_FILENAME).toString("utf8");
    file = strip_json_comments(file, { whitespace: true });
    return JSON.parse(file);
}
exports.read = read;
//# sourceMappingURL=native-gyp-accessor.js.map
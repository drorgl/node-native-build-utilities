"use strict";
exports.__esModule = true;
var child_process = require("child_process");
var spawnSync = child_process.spawnSync;
function version() {
    var result = spawnSync("pkg-config", ["--version"], { shell: true });
    return result.output.join("").toString().trim();
}
exports.version = version;
function modversion(module_name) {
    var result = spawnSync("pkg-config", ["--modversion", module_name], { shell: true });
    return result.output.join("").toString().trim();
}
exports.modversion = modversion;
var module_info;
(function (module_info) {
    module_info[module_info["libs"] = 0] = "libs";
    module_info[module_info["cflags"] = 1] = "cflags";
})(module_info = exports.module_info || (exports.module_info = {}));
function info(module_name, info_type) {
    var command = "";
    switch (info_type) {
        case module_info.libs:
            command = "--libs";
            break;
        case module_info.cflags:
            command = "--cflags";
            break;
        default:
            throw new Error("not implemented");
    }
    var result = spawnSync("pkg-config", [command, module_name], { shell: true });
    return result.output.join("").toString().trim();
}
exports.info = info;
function exists(module_name) {
    var result = spawnSync("pkg-config", ["--exists", module_name], { shell: true });
    return result.output.join("").toString().trim() === "0" || result.status === 0;
}
exports.exists = exists;
function list_all() {
    var result = spawnSync("pkg-config", ["--list-all"], { shell: true });
    var result_data = result.output.join("").toString();
    var result_rows = result_data.split("\r");
    var packages = [];
    for (var _i = 0, result_rows_1 = result_rows; _i < result_rows_1.length; _i++) {
        var row = result_rows_1[_i];
        row = row.trim();
        var name_end = row.indexOf(" ");
        var package_name = row.substr(0, name_end).trim();
        var package_description = row.substr(name_end).trim();
        packages.push({
            name: package_name,
            description: package_description
        });
    }
    return packages;
}
exports.list_all = list_all;
//# sourceMappingURL=pkg-config-accessor.js.map
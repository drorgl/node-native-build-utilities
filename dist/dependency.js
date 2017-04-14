#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
exports.__esModule = true;
var commander = require("commander");
var nativeConfiguration = require("./accessors/native-configuration-accessor");
var nativeGyp = require("./accessors/native-gyp-accessor");
var package_accessor_1 = require("./accessors/package-accessor");
var dependencyEngine = require("./engine/dependency-engine");
var detection = require("./utilities/detection_utilities");
var logger = require("./utilities/logger");
var path = require("path");
// dependencies - for gyp dependencies
// headers/includes - for preinstalled binaries
// libraries - for preinstalled binaries
var default_toolset = null;
var default_toolset_version = null;
if (detection.msbuild_version) {
    default_toolset = "vc";
    default_toolset_version = detection.msbuild_version.normalized_version;
}
else if (detection.gcc_version) {
    default_toolset = "gcc";
    default_toolset_version = detection.gcc_version.normalized_version;
}
var default_source_path = "./build.sources";
commander
    .version(package_accessor_1.node_package.version)
    .option("-p, --source-path", "assume source path", default_source_path)
    .option("-v, --verify", "verify configuration")
    .option("-d, --dependency [name]", "retrieve dependency by name")
    .option("-h, --headers [name]", "retrieve headers by name")
    .option("-l, --libs [name]", "retrieve libraries by name")
    .option("-f, --lib-fix", "appends .. before the library path, its a workaround to a bug in node-gyp where library root is different from includes root")
    .option("-c, --copy [name]", "retrieve files to copy to output")
    .option("-g, --logs", "dump logs to nnbu.*.log")
    .parse(process.argv);
process.on("SIGINT", function () {
    logger.error("Caught interrupt signal");
    process.exit(1);
});
if (commander["logs"]) {
    var timestamp = new Date().getTime().toString();
    logger.log_to_file("nncu." + timestamp + ".log");
}
if (commander["dependency"] || commander["headers"] || commander["libs"] || commander["copy"]) {
    logger.log_to_console(false);
}
logger.info("arguments", process.argv);
(function () { return __awaiter(_this, void 0, void 0, function () {
    var native_configuration_filename, root_configuration, native_configuration, native_gyp, dep, gyp_sources, _i, _a, gyp_src, gyp_source, dep, pkg_configs, _b, _c, pkg_source, headers, _d, _e, header, dep, pkg_configs, _f, _g, pkg_source, libraries, _h, _j, header, dep, files, _k, _l, file, e_1;
    return __generator(this, function (_m) {
        switch (_m.label) {
            case 0:
                _m.trys.push([0, 3, , 4]);
                return [4 /*yield*/, nativeConfiguration.find_native_configuration_file(nativeConfiguration.NATIVE_CONFIGURATION_FILE)];
            case 1:
                native_configuration_filename = _m.sent();
                logger.debug("found native configuration", native_configuration_filename);
                root_configuration = path.dirname(native_configuration_filename);
                return [4 /*yield*/, nativeConfiguration.load(native_configuration_filename)];
            case 2:
                native_configuration = _m.sent();
                native_gyp = nativeGyp.read();
                if (commander["sourcePath"]) {
                    default_source_path = commander["sourcePath"];
                }
                if (commander["dependency"]) {
                    dep = native_configuration.dependencies[commander["dependency"]];
                    if (dep) {
                        logger.debug("looking for dependency", dep);
                        if (dep.source === "source" || dep.source === "archived_source" || (dep.source.indexOf("source") !== -1) || (dep.source.indexOf("archived_source") !== -1)) {
                            gyp_sources = "";
                            for (_i = 0, _a = dep.gyp_sources; _i < _a.length; _i++) {
                                gyp_src = _a[_i];
                                gyp_source = dependencyEngine.gyp_source_parse(gyp_src);
                                gyp_sources += " " + normalize_path(path.join(root_configuration, native_configuration.source_path, path.basename(gyp_source.source, path.extname(gyp_source.source)), gyp_source.gyp_file)) + ":" + gyp_source.gyp_target;
                            }
                            console.log(gyp_sources);
                        }
                    }
                }
                if (commander["headers"]) {
                    dep = native_configuration.dependencies[commander["headers"]];
                    if (dep) {
                        logger.debug("looking for headers", dep);
                        if (dep.source === "pkg-config" || (dep.source.indexOf("pkg-config") !== -1)) {
                            pkg_configs = "";
                            for (_b = 0, _c = dep.pkg_includes; _b < _c.length; _b++) {
                                pkg_source = _c[_b];
                                pkg_configs += " " + pkg_source;
                            }
                            console.log(pkg_configs);
                        }
                        else if (dep.source === "prebuilt" || (dep.source.indexOf("prebuilt") !== -1)) {
                            headers = "";
                            for (_d = 0, _e = dep.pre_headers; _d < _e.length; _d++) {
                                header = _e[_d];
                                headers += " " + normalize_path(path.join(root_configuration, native_configuration.source_path, header));
                            }
                            console.log(headers);
                        }
                        else if (dep.source === "source" || (dep.source.indexOf("source") !== -1)) {
                            // ignore, should be handled by "dependency" section
                        }
                    }
                }
                if (commander["libs"]) {
                    dep = native_configuration.dependencies[commander["libs"]];
                    if (dep) {
                        logger.debug("looking for libraries", dep);
                        if (dep.source === "pkg-config" || (dep.source.indexOf("pkg-config") !== -1)) {
                            pkg_configs = "";
                            for (_f = 0, _g = dep.pkg_libraries; _f < _g.length; _f++) {
                                pkg_source = _g[_f];
                                pkg_configs += " " + pkg_source;
                            }
                            console.log(pkg_configs);
                        }
                        else if (dep.source === "prebuilt" || (dep.source.indexOf("prebuilt") !== -1)) {
                            libraries = "";
                            for (_h = 0, _j = dep.pre_libraries; _h < _j.length; _h++) {
                                header = _j[_h];
                                logger.debug("header", header);
                                libraries += " " + normalize_path(path.join(root_configuration, (commander["libFix"]) ? ".." : "", native_configuration.source_path, header));
                            }
                            console.log(libraries);
                        }
                        else if (dep.source === "source" || (dep.source.indexOf("source") !== -1)) {
                            // ignore, should be handled by "dependency" section
                        }
                    }
                }
                if (commander["copy"]) {
                    dep = native_configuration.dependencies[commander["copy"]];
                    if (dep) {
                        logger.debug("looking for copy", dep);
                        if (dep.source === "pkg-config" || (dep.source.indexOf("pkg-config") !== -1)) {
                            // nothing to do
                        }
                        else if (dep.source === "prebuilt" || (dep.source.indexOf("prebuilt") !== -1)) {
                            files = "";
                            for (_k = 0, _l = dep.copy; _k < _l.length; _k++) {
                                file = _l[_k];
                                logger.debug("copy", file);
                                files += " " + normalize_path(path.join(root_configuration, native_configuration.source_path, file));
                            }
                            console.log(files);
                        }
                        else if (dep.source === "source" || (dep.source.indexOf("source") !== -1)) {
                            // ignore, should be handled by "dependency" section
                        }
                    }
                }
                return [3 /*break*/, 4];
            case 3:
                e_1 = _m.sent();
                logger.error("error executing dependency tracker", e_1, e_1.stackTrace);
                process.exit(1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); })();
function normalize_path(filepath) {
    return filepath.split(/\/|\\/).join("/");
}
//# sourceMappingURL=dependency.js.map
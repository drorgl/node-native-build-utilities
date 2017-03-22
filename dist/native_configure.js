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
var fs = require("fs");
var commander = require("commander");
var package_accessor_1 = require("./accessors/package-accessor");
var nativeGyp = require("./accessors/native-gyp-accessor");
var detection = require("./utilities/detection_utilities");
var dependencyEngine = require("./engine/dependency-engine");
var nativeConfiguration = require("./accessors/native-configuration-accessor");
var logger = require("./utilities/logger");
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
logger.info("native build configuration", package_accessor_1.node_package.version);
// if build type == current platform
commander
    .version(package_accessor_1.node_package.version)
    .option("-f, --force [type]", "force setup of package/binary/source")
    .option("-p, --platform [type]", "assume platform is win/linux", process.platform)
    .option("-a, --arch [architecture]", "assume architecture is x64/ia32/arm", process.arch)
    .option("-t, --toolset [type]", "assume toolset is vc/gcc", default_toolset)
    .option("-s, --toolset-version [version]", "assume toolset version", default_toolset_version)
    .option("-p,  --source-path", "assume source path", default_source_path)
    .option("-v, --verify", "verify configuration")
    .parse(process.argv);
// read native_gyp.json
if (!nativeGyp.exists()) {
    logger.error(nativeGyp.NATIVE_GYP_FILENAME, "not found, nothing to do");
    process.exit(0);
}
// verify git is installed
if (!detection.git_version) {
    logger.error("git not found in path, unable to proceed");
    process.exit(1);
}
// verify 7z is installed
if (!detection.z7_version) {
    logger.error("7z not found in path, unable to proceed");
    process.exit(1);
}
(function () { return __awaiter(_this, void 0, void 0, function () {
    var native_gyp, platforms, selected_platform, architectures, selected_arch, toolsets, selected_toolset, selected_toolset_version, configuration, configured_dependencies, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 7, , 8]);
                native_gyp = nativeGyp.read();
                platforms = ["darwin", "freebsd", "linux", "sunos", "win32"];
                selected_platform = commander["platform"];
                if (platforms.indexOf(selected_platform) === -1) {
                    logger.error("platform should be one of the following:", platforms);
                    process.exit(1);
                }
                architectures = ["x64", "ia32", "arm"];
                selected_arch = commander["arch"];
                if (architectures.indexOf(selected_arch) === -1) {
                    logger.error("architectue shoule be one of the following:", architectures);
                    process.exit(1);
                }
                toolsets = ["vc", "gcc"];
                selected_toolset = commander["toolset"];
                if (toolsets.indexOf(selected_toolset) === -1) {
                    logger.error("toolset should be one of the following:", toolsets);
                    process.exit(1);
                }
                selected_toolset_version = commander["toolsetVersion"];
                logger.info("configuration:");
                logger.info(" platform: ", selected_platform);
                logger.info(" architecture: ", selected_arch);
                logger.info(" toolset:", selected_toolset);
                logger.info(" toolset version:", selected_toolset_version);
                logger.info(" source path:", default_source_path);
                if (!fs.existsSync(default_source_path)) {
                    fs.mkdirSync(default_source_path);
                }
                configuration = {
                    platform: selected_platform,
                    arch: selected_arch,
                    toolset: selected_toolset,
                    toolset_version: selected_toolset_version,
                    source_path: default_source_path
                };
                return [4 /*yield*/, dependencyEngine.parse_dependencies(native_gyp, configuration)];
            case 1:
                configured_dependencies = _a.sent();
                configuration.dependencies = configured_dependencies.dependencies;
                logger.info("configuration:", configuration);
                if (!(configured_dependencies.precompiled_sources, default_source_path && configured_dependencies.precompiled_sources, default_source_path.length > 0)) return [3 /*break*/, 3];
                logger.info("preparing precompiled dependencies..");
                return [4 /*yield*/, dependencyEngine.download_precompiled_sources(configured_dependencies.precompiled_sources, default_source_path)];
            case 2:
                _a.sent();
                logger.info("done");
                _a.label = 3;
            case 3:
                if (!(configured_dependencies.git_repositories && configured_dependencies.git_repositories.length)) return [3 /*break*/, 5];
                logger.info("preparing source dependencies..");
                return [4 /*yield*/, dependencyEngine.clone_git_sources(configured_dependencies.git_repositories, default_source_path)];
            case 4:
                _a.sent();
                logger.info("done");
                _a.label = 5;
            case 5: return [4 /*yield*/, nativeConfiguration.save(nativeConfiguration.NATIVE_CONFIGURATION_FILE, configuration)];
            case 6:
                _a.sent();
                return [3 /*break*/, 8];
            case 7:
                e_1 = _a.sent();
                logger.error("unable to configure", e_1, e_1.stackTrace);
                process.exit(1);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); })();
//# sourceMappingURL=native_configure.js.map
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
var pfs = require("./utilities/promisified_fs");
var path = require("path");
var commander = require("commander");
var buildAccessor = require("./accessors/build-accessor");
var githubAccessor = require("./accessors/github-accessor");
var packageAccessor = require("./accessors/package-accessor");
var abiReleases = require("./utilities/abi_releases");
var nativeGyp = require("./accessors/native-gyp-accessor");
var detection = require("./utilities/detection_utilities");
var dependencyEngine = require("./engine/dependency-engine");
var nativeConfiguration = require("./accessors/native-configuration-accessor");
var logger = require("./utilities/logger");
var merger = require("./utilities/object_utilities");
var archive_1 = require("./utilities/archive");
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
logger.info("native build configuration", packageAccessor.node_package.version);
// if build type == current platform
commander
    .version(packageAccessor.node_package.version)
    .option("-f, --force [type]", "force setup of package/binary/source")
    .option("-p, --platform [type]", "assume platform is win/linux", process.platform)
    .option("-a, --arch [architecture]", "assume architecture is x64/ia32/arm", process.arch)
    .option("-t, --toolset [type]", "assume toolset is vc/gcc", default_toolset)
    .option("-s, --toolset-version [version]", "assume toolset version", default_toolset_version)
    .option("-p,  --source-path", "assume source path", default_source_path)
    .option("-v, --verify", "verify configuration")
    .parse(process.argv);
process.on("SIGINT", function () {
    logger.error("Caught interrupt signal");
    process.exit(1);
});
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
function attempt_prebuilt_install(selected_platform, selected_arch) {
    return __awaiter(this, void 0, void 0, function () {
        var current_native_gyp, version_info, package_name, github_accessor, repo, package_filename, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, nativeGyp.read()];
                case 1:
                    current_native_gyp = _a.sent();
                    return [4 /*yield*/, abiReleases.get_current_node_version()];
                case 2:
                    version_info = _a.sent();
                    package_name = buildAccessor.get_module_package_name(current_native_gyp.binary, {
                        module_name: (current_native_gyp.binary && current_native_gyp.binary.module_name) ? current_native_gyp.binary.module_name : packageAccessor.node_package.name,
                        version: packageAccessor.node_package.version,
                        node_abi: version_info.modules,
                        platform: selected_platform,
                        arch: selected_arch
                    });
                    github_accessor = new githubAccessor.GitHubAccessor();
                    repo = packageAccessor.parse_repository();
                    package_filename = path.join(default_source_path, package_name);
                    try {
                        result = github_accessor.download_asset(repo.username, repo.repo, packageAccessor.node_package.version, package_name, package_filename);
                    }
                    catch (e) {
                        logger.error("unable to retrieve dependency, fallback to build");
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, pfs.exists(package_filename)];
                case 3:
                    if (!(_a.sent())) {
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, archive_1.extractFull(package_filename, path.join("./", "build/Release"))];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
(function () { return __awaiter(_this, void 0, void 0, function () {
    var native_gyps, platforms, selected_platform, architectures, selected_arch, toolsets, selected_toolset, selected_toolset_version, result, configuration, last_configured_dependencies, last_native_gyps, rescan_iteration, _i, native_gyps_1, native_gyp, configured_dependencies, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 23, , 24]);
                return [4 /*yield*/, nativeGyp.read_all_native_gyps("./")];
            case 1:
                native_gyps = _a.sent();
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
                return [4 /*yield*/, pfs.exists(default_source_path)];
            case 2:
                if (!!(_a.sent())) return [3 /*break*/, 4];
                return [4 /*yield*/, pfs.mkdir(default_source_path)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                if (!!commander["force"]) return [3 /*break*/, 6];
                return [4 /*yield*/, attempt_prebuilt_install(selected_platform, selected_arch)];
            case 5:
                result = _a.sent();
                if (result) {
                    process.exit(0);
                }
                _a.label = 6;
            case 6:
                configuration = {
                    platform: selected_platform,
                    arch: selected_arch,
                    toolset: selected_toolset,
                    toolset_version: selected_toolset_version,
                    source_path: default_source_path,
                    dependencies: {}
                };
                last_configured_dependencies = null;
                last_native_gyps = void 0;
                rescan_iteration = 1;
                _a.label = 7;
            case 7:
                if (!(JSON.stringify(last_native_gyps) !== JSON.stringify(native_gyps) && rescan_iteration < 11)) return [3 /*break*/, 19];
                _i = 0, native_gyps_1 = native_gyps;
                _a.label = 8;
            case 8:
                if (!(_i < native_gyps_1.length)) return [3 /*break*/, 17];
                native_gyp = native_gyps_1[_i];
                console.log("processing ", native_gyp);
                return [4 /*yield*/, dependencyEngine.parse_dependencies(native_gyp, configuration)];
            case 9:
                configured_dependencies = _a.sent();
                configuration.dependencies = merger.merge(configuration.dependencies, configured_dependencies.dependencies);
                logger.info("configuration:", configuration);
                if (!(configured_dependencies.precompiled_sources, default_source_path && configured_dependencies.precompiled_sources, default_source_path.length > 0)) return [3 /*break*/, 11];
                logger.info("preparing precompiled dependencies..");
                return [4 /*yield*/, dependencyEngine.download_precompiled_sources(configured_dependencies.precompiled_sources, default_source_path)];
            case 10:
                _a.sent();
                logger.info("done");
                _a.label = 11;
            case 11:
                if (!(configured_dependencies.archived_sources && configured_dependencies.archived_sources.length)) return [3 /*break*/, 13];
                logger.info("preparing archived source dependencies...");
                return [4 /*yield*/, dependencyEngine.download_archived_sources(configured_dependencies.archived_sources, default_source_path)];
            case 12:
                _a.sent();
                logger.info("done");
                _a.label = 13;
            case 13:
                if (!(configured_dependencies.git_repositories && configured_dependencies.git_repositories.length)) return [3 /*break*/, 15];
                logger.info("preparing source dependencies..");
                return [4 /*yield*/, dependencyEngine.clone_git_sources(configured_dependencies.git_repositories, default_source_path)];
            case 14:
                _a.sent();
                logger.info("done");
                _a.label = 15;
            case 15:
                rescan_iteration++;
                if (rescan_iteration > 10) {
                    logger.warn("maximum rescan iteration reached, dependency tree might not be complete");
                    return [3 /*break*/, 17];
                }
                _a.label = 16;
            case 16:
                _i++;
                return [3 /*break*/, 8];
            case 17:
                last_native_gyps = native_gyps;
                return [4 /*yield*/, nativeGyp.read_all_native_gyps("./")];
            case 18:
                native_gyps = _a.sent();
                return [3 /*break*/, 7];
            case 19: return [4 /*yield*/, nativeConfiguration.save(nativeConfiguration.NATIVE_CONFIGURATION_FILE, configuration)];
            case 20:
                _a.sent();
                return [4 /*yield*/, buildAccessor.configure()];
            case 21:
                _a.sent();
                return [4 /*yield*/, buildAccessor.build()];
            case 22:
                _a.sent();
                return [3 /*break*/, 24];
            case 23:
                e_1 = _a.sent();
                logger.error("unable to configure", e_1, e_1.stackTrace);
                process.exit(1);
                return [3 /*break*/, 24];
            case 24: return [2 /*return*/];
        }
    });
}); })();
//# sourceMappingURL=native_configure.js.map
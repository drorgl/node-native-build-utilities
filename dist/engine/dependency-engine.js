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
exports.__esModule = true;
var pkg_config = require("../accessors/pkg-config-accessor");
var detection = require("../utilities/detection_utilities");
var semver = require("semver");
var path = require("path");
var fs = require("fs");
var url = require("url");
//import { cancel, download, download_size } from "../accessors/download-accessor";
var dependencyAccessor = require("../accessors/dependency-accessor");
var gitAccessor = require("../accessors/git-accessor");
var archive_1 = require("../utilities/archive");
var logger = require("../utilities/logger");
function parse_dependencies(native_gyp, configuration) {
    return __awaiter(this, void 0, void 0, function () {
        var dependencies_information, dependency_name, dependency, failed_packages, package_name, pkg_version, packages, packages_includes, packages_libraries, package_name, precompiled_header_sources, precompiled_library_sources, prebuilt_header_name, prebuilt_precompiled_source, _i, prebuilt_precompiled_source_1, prebuilt_source, prebuilt_library_name, prebuilt_precompiled_source, _a, prebuilt_precompiled_source_2, prebuilt_source, precompiled_header_paths, precompiled_library_paths, precompiled_file_copy, _b, precompiled_header_sources_1, source, _c, precompiled_library_sources_1, source, archived_sources, _d, _e, asource, _f, archived_sources_1, source, sources, _g, _h, source, _j, sources_1, source;
        return __generator(this, function (_k) {
            dependencies_information = {
                dependencies: {},
                precompiled_sources: [],
                archived_sources: [],
                git_repositories: []
            };
            // let configured_dependencies: nativeConfiguration.IDependencies = {};
            for (dependency_name in native_gyp.dependencies) {
                if (!native_gyp.dependencies.hasOwnProperty(dependency_name)) {
                    continue;
                }
                logger.info("checking dependencies for", dependency_name);
                dependency = native_gyp.dependencies[dependency_name];
                // if current architecture is node architecture, try to use pkgconfig, fallback to prebuilt, fallback to source
                // console.log(process.platform, selected_platform, process.arch, selected_arch, detection.pkg_config_version);
                if ((process.platform === configuration.platform) && (process.arch === configuration.arch) && (detection.pkg_config_version != null)) {
                    // check all packages exist
                    if (dependency.pkgconfig && Object.getOwnPropertyNames(dependency.pkgconfig).length > 0) {
                        failed_packages = false;
                        // console.log(dependency.pkgconfig);
                        for (package_name in dependency.pkgconfig) {
                            if (!dependency.pkgconfig.hasOwnProperty(package_name)) {
                                continue;
                            }
                            logger.debug("checking package", package_name);
                            if (!pkg_config.exists(package_name)) {
                                logger.warn("package", package_name, "not found");
                                failed_packages = true;
                            }
                            else {
                                pkg_version = pkg_config.modversion(package_name);
                                if (!semver.satisfies(detection.normalize_version(pkg_version), dependency.pkgconfig[package_name])) {
                                    logger.warn("package", package_name, "exists but version", pkg_version, "does not match -", dependency.pkgconfig[package_name]);
                                    failed_packages = true;
                                }
                            }
                        }
                        if (failed_packages === false) {
                            packages = [];
                            packages_includes = [];
                            packages_libraries = [];
                            for (package_name in dependency.pkgconfig) {
                                if (!dependency.pkgconfig.hasOwnProperty(package_name)) {
                                    continue;
                                }
                                packages.push(package_name);
                                packages_includes.push(pkg_config.info(package_name, pkg_config.module_info.cflags));
                                packages_libraries.push(pkg_config.info(package_name, pkg_config.module_info.libs));
                            }
                            dependencies_information.dependencies[dependency_name] = {
                                source: "pkg-config",
                                packages: packages,
                                pkg_includes: packages_includes,
                                pkg_libraries: packages_libraries
                            };
                        }
                    }
                }
                if (dependencies_information.dependencies[dependency_name]) {
                    continue;
                }
                precompiled_header_sources = [];
                precompiled_library_sources = [];
                // check prebuilt binaries are compatible with selected architecture and platform
                for (prebuilt_header_name in dependency.headers) {
                    if (!dependency.headers.hasOwnProperty(prebuilt_header_name)) {
                        continue;
                    }
                    prebuilt_precompiled_source = dependency.headers[prebuilt_header_name];
                    for (_i = 0, prebuilt_precompiled_source_1 = prebuilt_precompiled_source; _i < prebuilt_precompiled_source_1.length; _i++) {
                        prebuilt_source = prebuilt_precompiled_source_1[_i];
                        if ((!prebuilt_source.arch || prebuilt_source.arch === configuration.arch) &&
                            (!prebuilt_source.platform || prebuilt_source.platform === configuration.platform) &&
                            (!prebuilt_source.toolset || prebuilt_source.toolset === configuration.toolset) &&
                            (!prebuilt_source.toolset_version || semver.satisfies(configuration.toolset_version, prebuilt_source.toolset_version))) {
                            precompiled_header_sources.push(prebuilt_source);
                        }
                    }
                }
                // check prebuilt binaries are compatible with selected architecture and platform
                for (prebuilt_library_name in dependency.libraries) {
                    if (!dependency.libraries.hasOwnProperty(prebuilt_library_name)) {
                        continue;
                    }
                    prebuilt_precompiled_source = dependency.libraries[prebuilt_library_name];
                    for (_a = 0, prebuilt_precompiled_source_2 = prebuilt_precompiled_source; _a < prebuilt_precompiled_source_2.length; _a++) {
                        prebuilt_source = prebuilt_precompiled_source_2[_a];
                        if ((!prebuilt_source.arch || prebuilt_source.arch === configuration.arch) &&
                            (!prebuilt_source.platform || prebuilt_source.platform === configuration.platform) &&
                            (!prebuilt_source.toolset || prebuilt_source.toolset === configuration.toolset) &&
                            (!prebuilt_source.toolset_version || semver.satisfies(configuration.toolset_version, prebuilt_source.toolset_version))) {
                            precompiled_library_sources.push(prebuilt_source);
                        }
                    }
                }
                // TODO: add handling for "copy" section (perhaps multiple sections?)
                if (precompiled_header_sources.length > 0 || precompiled_library_sources.length > 0) {
                    precompiled_header_paths = [];
                    precompiled_library_paths = [];
                    precompiled_file_copy = [];
                    for (_b = 0, precompiled_header_sources_1 = precompiled_header_sources; _b < precompiled_header_sources_1.length; _b++) {
                        source = precompiled_header_sources_1[_b];
                        dependencies_information.precompiled_sources.push(source);
                        precompiled_header_paths.push(parse_precompiled_source(source.source).path);
                        if (source.copy) {
                            precompiled_file_copy.push(parse_precompiled_source(source.copy).path);
                        }
                    }
                    for (_c = 0, precompiled_library_sources_1 = precompiled_library_sources; _c < precompiled_library_sources_1.length; _c++) {
                        source = precompiled_library_sources_1[_c];
                        dependencies_information.precompiled_sources.push(source);
                        precompiled_library_paths.push(parse_precompiled_source(source.source).path);
                        if (source.copy) {
                            precompiled_file_copy.push(parse_precompiled_source(source.copy).path);
                        }
                    }
                    dependencies_information.dependencies[dependency_name] = {
                        source: "prebuilt",
                        pre_headers: precompiled_header_paths,
                        pre_libraries: precompiled_library_paths,
                        copy: precompiled_file_copy
                    };
                }
                if (dependencies_information.dependencies[dependency_name]) {
                    continue;
                }
                archived_sources = [];
                if (dependency.archived_sources) {
                    for (_d = 0, _e = dependency.archived_sources; _d < _e.length; _d++) {
                        asource = _e[_d];
                        archived_sources.push(asource);
                    }
                }
                if (archived_sources.length > 0) {
                    // TODO: download all sources, switch to the branch
                    // git clone --recursive git://github.com/foo/bar.git
                    for (_f = 0, archived_sources_1 = archived_sources; _f < archived_sources_1.length; _f++) {
                        source = archived_sources_1[_f];
                        dependencies_information.archived_sources.push(source);
                        // await git_clone(source, default_source_path);
                    }
                    dependencies_information.dependencies[dependency_name] = {
                        source: "archived_source",
                        gyp_sources: dependency.archived_sources
                    };
                }
                if (dependencies_information.dependencies[dependency_name]) {
                    continue;
                }
                sources = [];
                for (_g = 0, _h = dependency.sources; _g < _h.length; _g++) {
                    source = _h[_g];
                    sources.push(source);
                }
                if (sources.length > 0) {
                    // TODO: download all sources, switch to the branch
                    // git clone --recursive git://github.com/foo/bar.git
                    for (_j = 0, sources_1 = sources; _j < sources_1.length; _j++) {
                        source = sources_1[_j];
                        dependencies_information.git_repositories.push(source);
                        // await git_clone(source, default_source_path);
                    }
                    dependencies_information.dependencies[dependency_name] = {
                        source: "source",
                        gyp_sources: dependency.sources
                    };
                }
                if (dependencies_information.dependencies[dependency_name]) {
                    continue;
                }
                // if prebuilt exists in toolset and architecture, use prebuilt, fallback to source
                // dependency.packages
            }
            return [2 /*return*/, dependencies_information];
        });
    });
}
exports.parse_dependencies = parse_dependencies;
function download_precompiled_sources(precompiled_sources, source_path) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, precompiled_sources_1, source;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, precompiled_sources_1 = precompiled_sources;
                    _a.label = 1;
                case 1:
                    if (!(_i < precompiled_sources_1.length)) return [3 /*break*/, 8];
                    source = precompiled_sources_1[_i];
                    if (!source.source) return [3 /*break*/, 4];
                    return [4 /*yield*/, download_source(source.source, source_path)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, extract_source_file(path.join(source_path, parse_precompiled_source(source.source).filename), source_path)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    if (!source.copy) return [3 /*break*/, 7];
                    return [4 /*yield*/, download_source(source.copy, source_path)];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, extract_source_file(path.join(source_path, parse_precompiled_source(source.copy).filename), source_path)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8: return [2 /*return*/];
            }
        });
    });
}
exports.download_precompiled_sources = download_precompiled_sources;
function download_archived_sources(git_repositories, source_path) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, git_repositories_1, source, source_archive, source_archive_file, extract_path;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, git_repositories_1 = git_repositories;
                    _a.label = 1;
                case 1:
                    if (!(_i < git_repositories_1.length)) return [3 /*break*/, 5];
                    source = git_repositories_1[_i];
                    logger.debug("downloading archived source", source);
                    source_archive = void 0;
                    if (source.source) {
                        source_archive = source.source;
                    }
                    else {
                        source_archive = source;
                    }
                    source_archive_file = (source_archive.indexOf("@") !== -1) ? source_archive.substr(0, source_archive.indexOf("@")) : source_archive;
                    extract_path = path.basename(source_archive_file, path.extname(source_archive_file));
                    logger.debug("archive path", source_archive_file, "extract path", extract_path);
                    return [4 /*yield*/, download_source(source_archive, source_path)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, extract_source_file(path.join(source_path, parse_precompiled_source(source_archive).filename), path.join(source_path, extract_path))];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.download_archived_sources = download_archived_sources;
function clone_git_sources(git_repositories, source_path) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, git_repositories_2, source;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, git_repositories_2 = git_repositories;
                    _a.label = 1;
                case 1:
                    if (!(_i < git_repositories_2.length)) return [3 /*break*/, 4];
                    source = git_repositories_2[_i];
                    return [4 /*yield*/, git_clone(source, source_path)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.clone_git_sources = clone_git_sources;
// unique download flag
var _download_handled = {};
function download_file(fileurl, filename) {
    return __awaiter(this, void 0, void 0, function () {
        var filesize, fileinfo;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (_download_handled[fileurl + filename]) {
                        return [2 /*return*/];
                    }
                    if (!fs.existsSync(filename)) return [3 /*break*/, 2];
                    return [4 /*yield*/, dependencyAccessor.get_package_size(fileurl)];
                case 1:
                    filesize = _a.sent();
                    fileinfo = fs.statSync(filename);
                    if (fileinfo.size === filesize) {
                        logger.debug("file", filename, "already exists with the same size, assuming its the same");
                        _download_handled[fileurl + filename] = true;
                        return [2 /*return*/];
                    }
                    else {
                        logger.info("file", filename, "size is different from download url", fileinfo.size, filesize, "downloading again");
                    }
                    return [3 /*break*/, 3];
                case 2:
                    logger.info("downloading", fileurl, "into", filename);
                    _a.label = 3;
                case 3: return [4 /*yield*/, dependencyAccessor.get_package(fileurl, filename)];
                case 4:
                    _a.sent();
                    _download_handled[fileurl + filename] = true;
                    return [2 /*return*/];
            }
        });
    });
}
function download_source(source, source_path) {
    return __awaiter(this, void 0, void 0, function () {
        var fileurl, filename;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fileurl = source.substr(0, source.lastIndexOf("@"));
                    filename = path.join(source_path, path.basename(url.parse(fileurl).pathname));
                    return [4 /*yield*/, download_file(fileurl, filename)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function parse_precompiled_source(source) {
    var file_url_index = source.lastIndexOf("@");
    if (file_url_index === -1) {
        return {
            url: source,
            filename: path.basename(url.parse(source).pathname),
            path: ""
        };
    }
    return {
        url: source.substr(0, file_url_index),
        path: source.substr(file_url_index + 1),
        filename: path.basename(url.parse(source.substr(0, file_url_index)).pathname)
    };
}
var _extraction_handled = {};
function extract_source_file(filename, source_path) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger.debug("extract source", filename, source_path);
                    if (!!_extraction_handled[filename + source_path]) return [3 /*break*/, 2];
                    return [4 /*yield*/, archive_1.extractFull(filename, source_path)];
                case 1:
                    _a.sent();
                    _extraction_handled[filename + source_path] = true;
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
function gyp_source_parse(source) {
    var src = source;
    var ssource = source;
    if (!src.source) {
        var source_gyp_index = ssource.lastIndexOf("@");
        // https://github.com/drorgl/ffmpeg.module.git#2.7
        var source_with_branch = ssource.substr(0, source_gyp_index);
        var branch_index = source_with_branch.lastIndexOf("#");
        // https://github.com/drorgl/ffmpeg.module.git
        var source_only = (branch_index !== -1) ? source_with_branch.substr(0, branch_index) : source_with_branch;
        // 2.7
        var branch_only = (branch_index !== -1) ? source_with_branch.substr(branch_index + 1) : "";
        // ffmpeg.gyp:avcodec
        var gyp_full = ssource.substr(source_gyp_index + 1);
        var gyp_target_index = gyp_full.lastIndexOf(":");
        // ffmpeg.gyp
        var gyp_file = gyp_full.substr(0, gyp_target_index);
        // avcodec
        var gyp_target = gyp_full.substr(gyp_target_index + 1);
        src = {
            source: source_only,
            branch: branch_only,
            gyp_file: gyp_file,
            gyp_target: gyp_target
        };
    }
    return src;
}
exports.gyp_source_parse = gyp_source_parse;
function git_clone(source, cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var src, gitsrc, repo_path;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    src = gyp_source_parse(source);
                    gitsrc = (src.source) ? src.source : source;
                    repo_path = path.join(cwd, path.basename(gitsrc, path.extname(gitsrc)));
                    if (!!fs.existsSync(repo_path)) return [3 /*break*/, 5];
                    logger.info("cloning git", gitsrc, "into", cwd);
                    return [4 /*yield*/, gitAccessor.git_clone(gitsrc, cwd)];
                case 1:
                    _a.sent();
                    if (!src.branch) return [3 /*break*/, 3];
                    return [4 /*yield*/, gitAccessor.git_checkout(repo_path, src.branch)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [4 /*yield*/, gitAccessor.git_submodule_update(repo_path)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    logger.debug("repo", gitsrc, "already exists, skipping");
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=dependency-engine.js.map
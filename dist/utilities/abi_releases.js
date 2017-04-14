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
var merger = require("./object_utilities");
var download_accessor_1 = require("../accessors/download-accessor");
var pfs = require("./promisified_fs");
var path = require("path");
var iojs_releases_url = "https://iojs.org/download/release/index.json";
var node_releases_url = "https://nodejs.org/download/release/index.json";
var abi_filename = path.join(__dirname, "abi.json");
var _node_versions = null;
function sort_function(a, b) {
    //compare versions
    var i, diff;
    var segmentsA = a.version.substr(1).split('.');
    var segmentsB = b.version.substr(1).split('.');
    var l = Math.min(segmentsA.length, segmentsB.length);
    for (i = 0; i < l; i++) {
        diff = parseInt(segmentsB[i], 10) - parseInt(segmentsA[i], 10);
        if (diff) {
            return diff;
        }
    }
    if (segmentsA.length - segmentsB.length != 0) {
        return segmentsA.length - segmentsB.length;
    }
    //compare module
    return parseInt(b.modules || "0") - parseInt(a.modules || "0");
}
function get_remote_node_versions() {
    return __awaiter(this, void 0, void 0, function () {
        var iojs_releases, _a, _b, _c, node_releases, _d, _e, _f, versions;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, download_accessor_1.request_get(iojs_releases_url)];
                case 1:
                    iojs_releases = _b.apply(_a, [(_g.sent()).toString("utf8")]);
                    _e = (_d = JSON).parse;
                    return [4 /*yield*/, download_accessor_1.request_get(node_releases_url)];
                case 2:
                    node_releases = _e.apply(_d, [(_g.sent()).toString("utf8")]);
                    versions = merger.merge(iojs_releases, node_releases);
                    versions.sort(sort_function);
                    return [2 /*return*/, versions];
            }
        });
    });
}
exports.get_remote_node_versions = get_remote_node_versions;
function get_node_versions(use_fresh) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b, _c, e_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!!use_fresh) return [3 /*break*/, 3];
                    if (_node_versions) {
                        return [2 /*return*/, _node_versions];
                    }
                    return [4 /*yield*/, pfs.exists(abi_filename)];
                case 1:
                    if (!_d.sent()) return [3 /*break*/, 3];
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, pfs.readFile(abi_filename, "utf8")];
                case 2:
                    _node_versions = _b.apply(_a, [_d.sent()]);
                    _d.label = 3;
                case 3:
                    _d.trys.push([3, 6, , 7]);
                    return [4 /*yield*/, get_remote_node_versions()];
                case 4:
                    _node_versions = _d.sent();
                    return [4 /*yield*/, pfs.writeFile(abi_filename, "utf8", JSON.stringify(_node_versions, null, "\t"))];
                case 5:
                    _d.sent();
                    return [2 /*return*/, _node_versions];
                case 6:
                    e_1 = _d.sent();
                    console.error("unable to update abi file", e_1, abi_filename);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.get_node_versions = get_node_versions;
function get_node_version(version) {
    return __awaiter(this, void 0, void 0, function () {
        var node_versions, abi_version;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, get_node_versions()];
                case 1:
                    node_versions = _a.sent();
                    abi_version = node_versions.find(function (i) { return i.version == version; });
                    if (abi_version && abi_version.modules) {
                        return [2 /*return*/, {
                                version: process.version,
                                arch: process.arch,
                                platform: process.platform,
                                modules: abi_version.modules
                            }];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.get_node_version = get_node_version;
function get_current_node_version() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (process && process.versions && process.versions.modules) {
                return [2 /*return*/, {
                        version: process.version,
                        modules: process.versions.modules,
                        arch: process.arch,
                        platform: process.platform
                    }];
            }
            if (process && process.config && process.config.variables && process.config.variables.node_module_version) {
                return [2 /*return*/, {
                        version: process.version,
                        modules: process.config.variables.node_module_version,
                        arch: process.arch,
                        platform: process.platform
                    }];
            }
            return [2 /*return*/, get_node_version(process.version)];
        });
    });
}
exports.get_current_node_version = get_current_node_version;
// process
//   version: 'v6.5.0',
//   versions:
//     { http_parser: '2.7.0',
//         node: '6.5.0',
//         v8: '5.1.281.81',
//         uv: '1.9.1',
//         zlib: '1.2.8',
//         ares: '1.10.1-DEV',
//         icu: '57.1',
//         modules: '48',
//         openssl: '1.0.2h' },
// arch: 'x64',
// platform: 'win32',
//  config:
//   { target_defaults:
//      { cflags: [],
//        default_configuration: 'Release',
//        defines: [],
//        include_dirs: [],
//        libraries: [] },
//     variables:
//      { asan: 0,
//        debug_devtools: 'node',
//        force_dynamic_crt: 0,
//        host_arch: 'x64',
//        icu_data_file: 'icudt57l.dat',
//        icu_data_in: '..\\..\\deps/icu-small\\source/data/in\\icudt57l.dat',
//        icu_endianness: 'l',
//        icu_gyp_path: 'tools/icu/icu-generic.gyp',
//        icu_locales: 'en,root',
//        icu_path: 'deps/icu-small',
//        icu_small: true,
//        icu_ver_major: '57',
//        node_byteorder: 'little',
//        node_enable_d8: false,
//        node_enable_v8_vtunejit: false,
//        node_install_npm: true,
//        node_module_version: 48,
//        node_no_browser_globals: false,
//        node_prefix: '/usr/local',
//        node_release_urlbase: '',
//        node_shared: false,
//        node_shared_cares: false,
//        node_shared_http_parser: false,
//        node_shared_libuv: false,
//        node_shared_openssl: false,
//        node_shared_zlib: false,
//        node_tag: '',
//        node_use_bundled_v8: true,
//        node_use_dtrace: false,
//        node_use_etw: true,
//        node_use_lttng: false,
//        node_use_openssl: true,
//        node_use_perfctr: true,
//        node_use_v8_platform: true,
//        openssl_fips: '',
//        openssl_no_asm: 0,
//        shlib_suffix: 'so.48',
//        target_arch: 'x64',
//        v8_enable_gdbjit: 0,
//        v8_enable_i18n_support: 1,
//        v8_inspector: true,
//        v8_no_strict_aliasing: 1,
//        v8_optimized_debug: 0,
//        v8_random_seed: 0,
//        v8_use_snapshot: true,
//        want_separate_host_toolset: 0 } },
//# sourceMappingURL=abi_releases.js.map
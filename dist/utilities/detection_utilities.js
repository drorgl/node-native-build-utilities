"use strict";
exports.__esModule = true;
var child_process = require("child_process");
var semver = require("semver");
var msbuild_version_regex = /^(\d+)\.?(\d+)\.?(\d+)?(\.\d+)$/gm;
var node_gyp_version_regex = /^v(\d+)\.?(\d+)\.?(\d+)?(\.\d+)$/gm;
var v_version_regex = /v(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?/;
var version_regex = /(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?/;
var git_version_regex = /git version (\d+)(?:\.(\d+))?(?:\.(\d+))?/gm;
var zip7_version_regex = /7-Zip\s\[(\d+)\]\s((\d+)(?:\.(\d+))?(?:\.(\d+))?)\s+Copyright\s+\(c\)/gm;
// enum platform_type {
// 	darwin,
// 	freebsd,
// 	linux,
// 	sunos,
// 	win32,
// 	unknown
// }
// enum arch_type {
// 	x64,
// 	ia32,
// 	arm,
// 	unknown
// }
// export let platform: platform_type;
// export let arch: arch_type;
// switch (process.platform) {
// 	case "darwin": platform = platform_type.darwin; break;
// 	case "freebsd": platform = platform_type.freebsd; break;
// 	case "linux": platform = platform_type.linux; break;
// 	case "sunos": platform = platform_type.sunos; break;
// 	case "win32": platform = platform_type.win32; break;
// 	default:
// 		platform = platform_type.unknown;
// }
// switch (process.arch) {
// 	case "x64": arch = arch_type.x64; break;
// 	case "ia32": arch = arch_type.ia32; break;
// 	case "arm": arch = arch_type.arm; break;
// 	default:
// 		arch = arch_type.unknown; break;
// }
function normalize_version(ver) {
    if (v_version_regex.test(ver)) {
        return v_version_regex.exec(ver).slice(1, 4).join(".");
    }
    else if (version_regex.test(ver)) {
        return version_regex.exec(ver).slice(1, 4).join(".");
    }
    else {
        return ver;
    }
}
exports.normalize_version = normalize_version;
exports.node_gyp_version = null;
function node_gyp_version_satisfies(required_version) {
    return semver.satisfies(exports.node_gyp_version.version, required_version);
}
exports.node_gyp_version_satisfies = node_gyp_version_satisfies;
var node_gyp_status = child_process.spawnSync("node-gyp", ["--version"], { shell: true });
if (node_gyp_status.status === 0) {
    var parsed_version = node_gyp_version_regex.exec(node_gyp_status.output.join("").toString());
    exports.node_gyp_version = {
        version: parsed_version[0],
        normalized_version: normalize_version(parsed_version[0]),
        major: parseInt(parsed_version[1]),
        minor: parseInt(parsed_version[2]),
        patch: parseInt(parsed_version[2])
    };
}
exports.msbuild_version = null;
function msbuild_version_satisfies(required_version) {
    return semver.satisfies(exports.msbuild_version.version, required_version);
}
exports.msbuild_version_satisfies = msbuild_version_satisfies;
var msbuild_status = child_process.spawnSync("msbuild", ["/version"], { shell: true });
if (msbuild_status.status === 0) {
    var parsed_version = msbuild_version_regex.exec(msbuild_status.output.join("").toString());
    exports.msbuild_version = {
        version: parsed_version[0].trim(),
        normalized_version: normalize_version(parsed_version[0]),
        major: parseInt(parsed_version[1]),
        minor: parseInt(parsed_version[2]),
        patch: parseInt(parsed_version[2])
    };
}
exports.gcc_version = null;
function gcc_version_satisfies(required_version) {
    return semver.satisfies(exports.gcc_version.version, required_version);
}
exports.gcc_version_satisfies = gcc_version_satisfies;
var gcc_status = child_process.spawnSync("gcc", ["-dumpversion"], { shell: true });
if (gcc_status.status === 0) {
    var parsed_version = gcc_status.output.join("").toString().split(".");
    exports.gcc_version = {
        version: gcc_status.output.join("").toString().trim(),
        normalized_version: normalize_version(gcc_status.output.join("").toString().trim()),
        major: parseInt(parsed_version[0]),
        minor: parseInt(parsed_version[1]),
        patch: parseInt(parsed_version[2])
    };
}
exports.pkg_config_version = null;
function pkg_config_version_satisfies(required_version) {
    return semver.satisfies(exports.pkg_config_version.version, required_version);
}
exports.pkg_config_version_satisfies = pkg_config_version_satisfies;
var pkg_config_status = child_process.spawnSync("pkg-config", ["--version"], { shell: true });
if (pkg_config_status.status === 0) {
    var parsed_version = pkg_config_status.output.join("").toString().split(".");
    exports.pkg_config_version = {
        version: pkg_config_status.output.join("").toString().trim(),
        normalized_version: normalize_version(parsed_version[0]),
        major: parseInt(parsed_version[0]),
        minor: parseInt(parsed_version[1]),
        patch: parseInt(parsed_version[2])
    };
}
exports.git_version = null;
function git_version_satisfies(required_version) {
    return semver.satisfies(exports.git_version.version, required_version);
}
exports.git_version_satisfies = git_version_satisfies;
var git_status = child_process.spawnSync("git", ["--version"], { shell: true });
if (git_status.status === 0) {
    var parsed_version = git_version_regex.exec(git_status.output.join("").toString()).slice(1);
    exports.git_version = {
        version: parsed_version.join("."),
        normalized_version: normalize_version(parsed_version.join(".")),
        major: parseInt(parsed_version[0]),
        minor: parseInt(parsed_version[1]),
        patch: parseInt(parsed_version[2])
    };
}
exports.z7_version = null;
function z7_version_satisfies(required_version) {
    return semver.satisfies(exports.z7_version.version, required_version);
}
exports.z7_version_satisfies = z7_version_satisfies;
var z7_status = child_process.spawnSync("7z", [], { shell: true });
if (z7_status.status === 0) {
    var parsed_version = zip7_version_regex.exec(z7_status.output.join("").toString()).slice(2);
    exports.z7_version = {
        version: parsed_version.join("."),
        normalized_version: normalize_version(parsed_version.join(".")),
        major: parseInt(parsed_version[0]),
        minor: parseInt(parsed_version[1]),
        patch: parseInt(parsed_version[2])
    };
}
//# sourceMappingURL=detection_utilities.js.map
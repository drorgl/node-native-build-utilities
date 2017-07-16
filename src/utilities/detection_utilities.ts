import child_process = require("child_process");

import * as versionUtility from "./version";

const msbuild_version_regex = /^(\d+)\.?(\d+)\.?(\d+)?(\.\d+)$/gm;
const node_gyp_version_regex = /^v(\d+)\.?(\d+)\.?(\d+)?(\.\d+)$/gm;

const v_version_regex = /v(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?/;
const version_regex = /(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?/;

const git_version_regex = /git version (\d+)(?:\.(\d+))?(?:\.(\d+))?/gm;

const zip7_version_regex = /7-Zip\s*(?:\[(?:\d+)\])?\s*(\d+)(?:\.(\d+))?(?:\.(\d+))?\s+(?:\:\s+)?Copyright\s+\(c\)/gm;

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

interface IVersionInfo {
	version: string;
	normalized_version: string;
	major: number;
	minor: number;
	patch: number;
}

export let node_gyp_version: IVersionInfo = null;
export function node_gyp_version_satisfies(required_version: string): boolean {
	return versionUtility.satisfies(node_gyp_version.version, required_version);
}

const node_gyp_status = child_process.spawnSync("node-gyp", ["--version"], { shell: true });
if (node_gyp_status.status === 0) {
	const parsed_version = node_gyp_version_regex.exec(node_gyp_status.output.join("").toString());
	node_gyp_version = {
		version: parsed_version[0],
		normalized_version: versionUtility.normalize_version(parsed_version[0]),
		major: parseInt(parsed_version[1]),
		minor: parseInt(parsed_version[2]),
		patch: parseInt(parsed_version[2])
	};
}

export let msbuild_version: IVersionInfo = null;
export function msbuild_version_satisfies(required_version: string): boolean {
	return versionUtility.satisfies(msbuild_version.version, required_version);
}

const msbuild_status = child_process.spawnSync("msbuild", ["/version"], { shell: true });
if (msbuild_status.status === 0) {
	const parsed_version = msbuild_version_regex.exec(msbuild_status.output.join("").toString());
	msbuild_version = {
		version: parsed_version[0].trim(),
		normalized_version: versionUtility.normalize_version(parsed_version[0]),
		major: parseInt(parsed_version[1]),
		minor: parseInt(parsed_version[2]),
		patch: parseInt(parsed_version[2])
	};
}

export let gcc_version: IVersionInfo = null;
export function gcc_version_satisfies(required_version: string): boolean {
	return versionUtility.satisfies(gcc_version.version, required_version);
}

const gcc_status = child_process.spawnSync("gcc", ["-dumpversion"], { shell: true });
if (gcc_status.status === 0) {
	const parsed_version = gcc_status.output.join("").toString().split(".");
	gcc_version = {
		version: gcc_status.output.join("").toString().trim(),
		normalized_version: versionUtility.normalize_version(gcc_status.output.join("").toString().trim()),
		major: parseInt(parsed_version[0]),
		minor: parseInt(parsed_version[1]),
		patch: parseInt(parsed_version[2])
	};
}

export let pkg_config_version: IVersionInfo = null;
export function pkg_config_version_satisfies(required_version: string): boolean {
	return versionUtility.satisfies(pkg_config_version.version, required_version);
}

const pkg_config_status = child_process.spawnSync("pkg-config", ["--version"], { shell: true });
if (pkg_config_status.status === 0) {
	const parsed_version = pkg_config_status.output.join("").toString().split(".");
	pkg_config_version = {
		version: pkg_config_status.output.join("").toString().trim(),
		normalized_version: versionUtility.normalize_version(parsed_version[0]),
		major: parseInt(parsed_version[0]),
		minor: parseInt(parsed_version[1]),
		patch: parseInt(parsed_version[2])
	};
}

export let git_version: IVersionInfo = null;
export function git_version_satisfies(required_version: string): boolean {
	return versionUtility.satisfies(git_version.version, required_version);
}

const git_status = child_process.spawnSync("git", ["--version"], { shell: true });
if (git_status.status === 0) {
	const parsed_version = git_version_regex.exec(git_status.output.join("").toString()).slice(1);
	git_version = {
		version: parsed_version.join("."),
		normalized_version: versionUtility.normalize_version(parsed_version.join(".")),
		major: parseInt(parsed_version[0]),
		minor: parseInt(parsed_version[1]),
		patch: parseInt(parsed_version[2])
	};
}

export let z7_version: IVersionInfo = null;
export function z7_version_satisfies(required_version: string): boolean {
	return versionUtility.satisfies(z7_version.version, required_version);
}

const z7_status = child_process.spawnSync("7z", [], { shell: true });
if (z7_status.status === 0) {
	const parsed_version = zip7_version_regex.exec(z7_status.output.join("").toString()).slice(1);
	z7_version = {
		version: parsed_version.join("."),
		normalized_version: versionUtility.normalize_version(parsed_version.join(".")),
		major: parseInt(parsed_version[0]),
		minor: parseInt(parsed_version[1]),
		patch: parseInt(parsed_version[2])
	};
}

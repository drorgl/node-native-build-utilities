#!/usr/bin/env node

import fs = require("fs");
import commander = require("commander");
import { node_package } from "./package-accessor";

import * as detection from "./detection_utilities";
import { IPrecompiledSource, ISource, read_native_gyp } from "./native-gyp-accessor";

import * as pkg_config from "./pkg-config-accessor";
import semver = require("semver");

let default_toolset: string = null;
let default_toolset_version: string = null;
if (detection.msbuild_version) {
	default_toolset = "vc";
	default_toolset_version = detection.msbuild_version.normalized_version;
} else if (detection.gcc_version) {
	default_toolset = "gcc";
	default_toolset_version = detection.gcc_version.normalized_version;
}

console.log("native build configuration", node_package.version);

// if build type == current platform
commander
	.version(node_package.version)

	.option("-f, --force [type]", "force setup of package/binary/source")
	.option("-p, --platform [type]", "assume platform is win/linux", process.platform)
	.option("-a, --arch [architecture]", "assume architecture is x64/ia32/arm", process.arch)
	.option("-t, --toolset [type]", "assume toolset is vc/gcc", default_toolset)
	.option("-s, --toolset-version [version]", "assume toolset version", default_toolset_version)
	.option("-v, --verify", "verify configuration")
	.parse(process.argv);

// read native_gyp.json
const native_gyp_filename = "native_gyp.json";
if (!fs.existsSync(native_gyp_filename)) {
	console.log(native_gyp_filename, "not found, nothing to do");
	process.exit(0);
}

let native_gyp = read_native_gyp(native_gyp_filename);

// platform win/linux
const platforms = ["darwin", "freebsd", "linux", "sunos", "win32"];
let selected_platform = commander["platform"];

// architectrure x64/ia32/atm/arm64
const architectures = ["x64", "ia32", "arm"];
let selected_arch = commander["arch"];
// toolset vc/gcc
const toolsets = ["vc", "gcc"];
let selected_toolset = commander["toolset"];

let selected_toolset_version = commander["toolsetVersion"];

console.log("configuration:");
console.log(" platform: ", selected_platform);
console.log(" architecture: ", selected_arch);
console.log(" toolset:", selected_toolset);
console.log(" toolset version:", selected_toolset_version);

interface IConfiguredDependency {
	source: string;
}

let configured_dependencies: { [dependency_name: string]: IConfiguredDependency } = {};

for (let dependency_name in native_gyp.dependencies) {
	if (!native_gyp.dependencies.hasOwnProperty(dependency_name)) {
		continue;
	}
	console.log("checking dependencies for", dependency_name);
	let dependency = native_gyp.dependencies[dependency_name];

	// if current architecture is node architecture, try to use pkgconfig, fallback to prebuilt, fallback to source
	// console.log(process.platform, selected_platform, process.arch, selected_arch, detection.pkg_config_version);
	if ((process.platform === selected_platform) && (process.arch === selected_arch) && (detection.pkg_config_version != null)) {
		// check all packages exist
		if (dependency.pkgconfig && Object.getOwnPropertyNames(dependency.pkgconfig).length > 0) {
			let failed_packages = false;
			// console.log(dependency.pkgconfig);
			for (let package_name in dependency.pkgconfig) {
				if (!dependency.pkgconfig.hasOwnProperty(package_name)) {
					continue;
				}
				console.log("checking package", package_name);
				if (!pkg_config.exists(package_name)) {
					console.warn("package", package_name, "not found");
					failed_packages = true;
				} else {
					let pkg_version = pkg_config.modversion(package_name);
					if (!semver.satisfies(pkg_version, dependency.pkgconfig[package_name])) {
						console.warn("package", package_name, "exists but version", pkg_version, "does not match -", dependency.pkgconfig[package_name]);
						failed_packages = true;
					}
				}
			}

			if (failed_packages === false) {
				configured_dependencies[dependency_name] = {
					source: "pkg-config"
				};
			}
		}
	}

	if (configured_dependencies[dependency_name]) {
		continue;
	}

	let precompiled_sources: IPrecompiledSource[] = [];

	// check prebuilt binaries are compatible with selected architecture and platform
	for (let prebuilt_header_name in dependency.headers) {
		if (!dependency.headers.hasOwnProperty(prebuilt_header_name)) {
			continue;
		}
		let prebuilt_precompiled_source = dependency.headers[prebuilt_header_name];
		for (let prebuilt_source of prebuilt_precompiled_source) {
			if (
				(!prebuilt_source.arch || prebuilt_source.arch === selected_arch) &&
				(!prebuilt_source.platform || prebuilt_source.platform === selected_platform) &&
				(!prebuilt_source.toolset || prebuilt_source.toolset === selected_toolset) &&
				(!prebuilt_source.toolset_version || semver.satisfies(selected_toolset_version, prebuilt_source.toolset_version))) {

				precompiled_sources.push(prebuilt_source);
			}
		}
	}

	if (precompiled_sources.length > 0) {
		configured_dependencies[dependency_name] = {
			source: "prebuilt"
		};
	}

	if (configured_dependencies[dependency_name]) {
		continue;
	}

	let sources: Array<string | ISource> = [];

	for (let source of dependency.sources) {
		sources.push(source);
	}

	if (sources.length > 0) {
		configured_dependencies[dependency_name] = {
			source: "source"
		};
	}

	if (configured_dependencies[dependency_name]) {
		continue;
	}

	// if prebuilt exists in toolset and architecture, use prebuilt, fallback to source

	// dependency.packages
}
console.log("configuration:", configured_dependencies);

// if build type == current platform, use pkg-config, fallback to headers and libraries, fallback to sources

// for each dependency
//  check pkg-config for each package

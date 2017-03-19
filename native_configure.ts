#!/usr/bin/env node

import fs = require("fs");
import path = require("path");
import commander = require("commander");
import { node_package } from "./package-accessor";
import node7z = require("node-7z");
let task7z = new node7z();

import { cancel, download, download_size } from "./download-accessor";
import url = require("url");

import * as detection from "./detection_utilities";
import { IPrecompiledSource, ISource, read_native_gyp } from "./native-gyp-accessor";

import * as pkg_config from "./pkg-config-accessor";
import semver = require("semver");

import child_process = require("child_process");

import * as gitAccessor from "./git-accessor";

import * as nativeConfiguration from "./native-configuration-accessor";


let default_toolset: string = null;
let default_toolset_version: string = null;
if (detection.msbuild_version) {
	default_toolset = "vc";
	default_toolset_version = detection.msbuild_version.normalized_version;
} else if (detection.gcc_version) {
	default_toolset = "gcc";
	default_toolset_version = detection.gcc_version.normalized_version;
}

let default_source_path = "./build.sources";

console.log("native build configuration", node_package.version);

// if build type == current platform
commander
	.version(node_package.version)

	.option("-f, --force [type]", "force setup of package/binary/source")
	.option("-p, --platform [type]", "assume platform is win/linux", process.platform)
	.option("-a, --arch [architecture]", "assume architecture is x64/ia32/arm", process.arch)
	.option("-t, --toolset [type]", "assume toolset is vc/gcc", default_toolset)
	.option("-s, --toolset-version [version]", "assume toolset version", default_toolset_version)
	.option("-p,  --source-path", "assume source path", default_source_path)
	.option("-v, --verify", "verify configuration")
	.parse(process.argv);

// read native_gyp.json
const native_gyp_filename = "native_gyp.json";
if (!fs.existsSync(native_gyp_filename)) {
	console.log(native_gyp_filename, "not found, nothing to do");
	process.exit(0);
}

if (!detection.git_version) {
	console.log("git not found in path, unable to proceed");
	process.exit(1);
}

if (!detection.z7_version) {
	console.log("7z not found in path, unable to proceed");
	process.exit(1);
}

(async () => {
	try {
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
		console.log(" source path:", default_source_path);

		if (!fs.existsSync(default_source_path)) {
			fs.mkdirSync(default_source_path);
		}

		interface IConfiguredDependency {
			source: string;

			gyp_file?: string;
			gyp_target?: string;

			headers?: string[];
			libraries?: string[];
		}

		let configured_dependencies: nativeConfiguration.IDependencies = {};

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
							if (!semver.satisfies(detection.normalize_version(pkg_version), dependency.pkgconfig[package_name])) {
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

			// check prebuilt binaries are compatible with selected architecture and platform
			for (let prebuilt_library_name in dependency.libraries) {
				if (!dependency.libraries.hasOwnProperty(prebuilt_library_name)) {
					continue;
				}
				let prebuilt_precompiled_source = dependency.libraries[prebuilt_library_name];
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

			//TODO: add handling for "copy" section (perhaps multiple sections?)

			if (precompiled_sources.length > 0) {
				// TODO: download/extract all prebuilt binaries
				for (let source of precompiled_sources) {
					await download_source(source);
					await extract_source(source);
				}

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
				// TODO: download all sources, switch to the branch
				// git clone --recursive git://github.com/foo/bar.git
				for (let source of sources) {
					await git_clone(source, default_source_path);
				}
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

		let configuration: nativeConfiguration.INativeConfiguration = {
			platform: selected_platform,
			arch: selected_arch,
			toolset: selected_toolset,
			toolset_version: selected_toolset_version,
			source_path: default_source_path,
			dependencies: configured_dependencies
		};

		await nativeConfiguration.save(nativeConfiguration.NATIVE_CONFIGURATION_FILE, configuration);

	} catch (e) {
		console.log("unable to configure", e, e.stackTrace);
		process.exit(1);
	}
})();
// if build type == current platform, use pkg-config, fallback to headers and libraries, fallback to sources

// for each dependency
//  check pkg-config for each package

async function download_source(source: IPrecompiledSource) {
	let fileurl = source.source.substr(0, source.source.lastIndexOf("@"));
	let filename = path.join(default_source_path, path.basename(url.parse(fileurl).pathname));

	if (fs.existsSync(filename)) {
		let filesize = await download_size(fileurl);
		let fileinfo = fs.statSync(filename);
		if (fileinfo.size === filesize) {
			console.log("file", filename, "already exists with the same size, assuming its the same");
			return;
		} else {
			console.log("file", filename, "size is different from download url", fileinfo.size, filesize, "downloading again");
		}
	} else {
		console.log("downloading", fileurl, "into", filename);
	}
	await download(fileurl, filename, true);
}

async function extract_source(source: IPrecompiledSource) {
	let fileurl = source.source.substr(0, source.source.lastIndexOf("@"));
	let filename = path.join(default_source_path, path.basename(url.parse(fileurl).pathname));

	console.log("extracting", filename, "into", default_source_path);
	await task7z.extractFull(filename, default_source_path, {});
}

async function git_clone(source: string | ISource, cwd: string) {
	let src = <ISource>source;
	let ssource = <string>source;

	// https://github.com/drorgl/ffmpeg.module.git#2.7@ffmpeg.gyp:avcodec
	if (!src.source) {
		let source_gyp_index = ssource.lastIndexOf("@");

		// https://github.com/drorgl/ffmpeg.module.git#2.7
		let source_with_branch = ssource.substr(0, source_gyp_index);

		let branch_index = source_with_branch.lastIndexOf("#");

		// https://github.com/drorgl/ffmpeg.module.git
		let source_only = (branch_index !== -1) ? source_with_branch.substr(0, branch_index) : source_with_branch;

		// 2.7
		let branch_only = (branch_index !== -1) ? source_with_branch.substr(branch_index + 1) : "";

		// ffmpeg.gyp:avcodec
		let gyp_full = ssource.substr(source_gyp_index + 1);

		let gyp_target_index = gyp_full.lastIndexOf(":");

		// ffmpeg.gyp
		let gyp_file = gyp_full.substr(0, gyp_target_index);

		// avcodec
		let gyp_target = gyp_full.substr(gyp_target_index + 1);

		src = {
			source: source_only,
			branch: branch_only,
			gyp_file,
			gyp_target
		};
	}

	let gitsrc = (src.source) ? src.source : <string>source;

	let repo_path = path.join(cwd, path.basename(gitsrc, path.extname(gitsrc)));

	if (!fs.existsSync(repo_path)) {

		await gitAccessor.git_clone(gitsrc, cwd);
		if (src.branch) {
			await gitAccessor.git_checkout(path.join(cwd, repo_path), src.branch);
		}
	} else {
		console.log("repo", gitsrc, "already exists, skipping");
	}
}

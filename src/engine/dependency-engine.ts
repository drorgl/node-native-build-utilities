
import * as nativeConfiguration from "../accessors/native-configuration-accessor";
import * as nativeGyp from "../accessors/native-gyp-accessor";
import * as pkg_config from "../accessors/pkg-config-accessor";
import * as detection from "../utilities/detection_utilities";

import path = require("path");
import fs = require("fs");
import url = require("url");
import * as dependencyAccessor from "../accessors/dependency-accessor";
import * as gitAccessor from "../accessors/git-accessor";
import { extractFull } from "../utilities/archive";
import * as logger from "../utilities/logger";

import * as versionUtility from "../utilities/version";

export interface IDependenciesInformation {
	dependencies: nativeConfiguration.IDependencies;
	precompiled_sources: nativeGyp.IPrecompiledSource[];
	archived_sources: Array<string | nativeGyp.ISource>;
	git_repositories: Array<string | nativeGyp.ISource>;
}

export async function parse_dependencies(native_gyp: nativeGyp.INativeGyp, configuration: nativeConfiguration.INativeConfiguration): Promise<IDependenciesInformation> {
	let dependencies_information: IDependenciesInformation = {
		dependencies: {},
		precompiled_sources: [],
		archived_sources: [],
		git_repositories: []
	};
	// let configured_dependencies: nativeConfiguration.IDependencies = {};

	for (let dependency_name in native_gyp.dependencies) {
		if (!native_gyp.dependencies.hasOwnProperty(dependency_name)) {
			continue;
		}
		logger.info("checking dependencies for", dependency_name);
		let dependency = native_gyp.dependencies[dependency_name];

		// if current architecture is node architecture, try to use pkgconfig, fallback to prebuilt, fallback to source
		// console.log(process.platform, selected_platform, process.arch, selected_arch, detection.pkg_config_version);
		if ((process.platform === configuration.platform) && (process.arch === configuration.arch) && (detection.pkg_config_version != null)) {
			// check all packages exist
			if (dependency.pkgconfig && Object.getOwnPropertyNames(dependency.pkgconfig).length > 0) {
				let failed_packages = false;
				// console.log(dependency.pkgconfig);
				for (let package_name in dependency.pkgconfig) {
					if (!dependency.pkgconfig.hasOwnProperty(package_name)) {
						continue;
					}
					logger.debug("checking package", package_name);
					if (!pkg_config.exists(package_name)) {
						logger.warn("package", package_name, "not found");
						failed_packages = true;
					} else {
						let pkg_version = pkg_config.modversion(package_name);
						if (!versionUtility.satisfies(versionUtility.normalize_version(pkg_version), dependency.pkgconfig[package_name])) {
							logger.warn("package", package_name, "exists but version", pkg_version, "does not match -", dependency.pkgconfig[package_name]);
							failed_packages = true;
						}
					}
				}

				if (failed_packages === false) {
					let packages = [];
					let packages_includes = [];
					let packages_cflags = [];
					let packages_libraries = [];
					for (let package_name in dependency.pkgconfig) {
						if (!dependency.pkgconfig.hasOwnProperty(package_name)) {
							continue;
						}
						packages.push(package_name);
						packages_cflags.push(pkg_config.info(package_name, pkg_config.module_info.cflags));
						packages_includes.push(pkg_config.info(package_name, pkg_config.module_info.includedir));
						packages_libraries.push(pkg_config.info(package_name, pkg_config.module_info.libs));
					}

					dependencies_information.dependencies[dependency_name] = {
						source: "pkg-config",
						packages,
						pkg_includes: packages_includes,
						pkg_libraries: packages_libraries,
						pkg_cflags: packages_cflags
					};
				}
			}
		}

		if (dependencies_information.dependencies[dependency_name]) {
			continue;
		}

		let precompiled_header_sources: nativeGyp.IPrecompiledSource[] = [];
		let precompiled_library_sources: nativeGyp.IPrecompiledSource[] = [];

		// check prebuilt binaries are compatible with selected architecture and platform
		for (let prebuilt_header_name in dependency.headers) {
			if (!dependency.headers.hasOwnProperty(prebuilt_header_name)) {
				continue;
			}
			let prebuilt_precompiled_source = dependency.headers[prebuilt_header_name];
			for (let prebuilt_source of prebuilt_precompiled_source) {
				if (
					(!prebuilt_source.arch || prebuilt_source.arch === configuration.arch) &&
					(!prebuilt_source.platform || prebuilt_source.platform === configuration.platform) &&
					(!prebuilt_source.toolset || prebuilt_source.toolset === configuration.toolset) &&
					(!prebuilt_source.toolset_version || versionUtility.satisfies(configuration.toolset_version, prebuilt_source.toolset_version))) {

					precompiled_header_sources.push(prebuilt_source);
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
					(!prebuilt_source.arch || prebuilt_source.arch === configuration.arch) &&
					(!prebuilt_source.platform || prebuilt_source.platform === configuration.platform) &&
					(!prebuilt_source.toolset || prebuilt_source.toolset === configuration.toolset) &&
					(!prebuilt_source.toolset_version || versionUtility.satisfies(configuration.toolset_version, prebuilt_source.toolset_version))) {

					precompiled_library_sources.push(prebuilt_source);
				}
			}
		}

		// TODO: add handling for "copy" section (perhaps multiple sections?)

		if (precompiled_header_sources.length > 0 || precompiled_library_sources.length > 0) {
			// TODO: download/extract all prebuilt binaries
			let precompiled_header_paths = [];
			let precompiled_library_paths = [];
			let precompiled_file_copy: string[] = [];

			for (let source of precompiled_header_sources) {
				dependencies_information.precompiled_sources.push(source);
				precompiled_header_paths.push(parse_precompiled_source(source.source).path);

				if (source.copy) {
					precompiled_file_copy.push(parse_precompiled_source(source.copy).path);
				}
			}

			for (let source of precompiled_library_sources) {
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

		let archived_sources: Array<string | nativeGyp.ISource> = [];
		if (dependency.archived_sources) {
			for (let asource of dependency.archived_sources) {
				archived_sources.push(asource);
			}
		}

		if (archived_sources.length > 0) {
			// TODO: download all sources, switch to the branch
			// git clone --recursive git://github.com/foo/bar.git
			for (let source of archived_sources) {
				dependencies_information.archived_sources.push(source);
			}
			dependencies_information.dependencies[dependency_name] = {
				source: "archived_source",
				gyp_sources: dependency.archived_sources
			};
		}

		if (dependencies_information.dependencies[dependency_name]) {
			continue;
		}

		let sources: Array<string | nativeGyp.ISource> = [];

		for (let source of dependency.sources) {
			sources.push(source);
		}

		if (sources.length > 0) {
			// TODO: download all sources, switch to the branch
			// git clone --recursive git://github.com/foo/bar.git
			for (let source of sources) {
				dependencies_information.git_repositories.push(source);
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
	return dependencies_information;
}

export async function download_precompiled_sources(precompiled_sources: nativeGyp.IPrecompiledSource[], source_path: string) {
	for (let source of precompiled_sources) {
		if (source.source) {
			await download_source(source.source, source_path);
			await extract_source_file(path.join(source_path, parse_precompiled_source(source.source).filename), source_path);
		}

		if (source.copy) {
			await download_source(source.copy, source_path);
			await extract_source_file(path.join(source_path, parse_precompiled_source(source.copy).filename), source_path);
		}
	}
}

export async function download_archived_sources(git_repositories: Array<string | nativeGyp.ISource>, source_path: string) {
	for (let source of git_repositories) {
		logger.debug("downloading archived source", source);

		let source_archive: string;
		if ((source as nativeGyp.ISource).source) {
			source_archive = (source as nativeGyp.ISource).source;
		} else {
			source_archive = source as string;
		}

		let source_archive_file = (source_archive.indexOf("@") !== -1) ? source_archive.substr(0, source_archive.indexOf("@")) : source_archive;

		let extract_path = path.basename(source_archive_file, path.extname(source_archive_file));
		logger.debug("archive path", source_archive_file, "extract path", extract_path);

		await download_source(source_archive, source_path);
		await extract_source_file(path.join(source_path, parse_precompiled_source(source_archive).filename), path.join(source_path, extract_path));
	}
}

export async function clone_git_sources(git_repositories: Array<string | nativeGyp.ISource>, source_path: string) {
	for (let source of git_repositories) {
		await git_clone(source, source_path);
	}
}

// unique download flag
let _download_handled: { [file: string]: boolean } = {};

async function download_file(fileurl: string, filename: string) {
	if (_download_handled[fileurl + filename]) {
		return;
	}
	if (fs.existsSync(filename)) {
		let filesize = await dependencyAccessor.get_package_size(fileurl);
		let fileinfo = fs.statSync(filename);
		if (fileinfo.size === filesize) {
			logger.debug("file", filename, "already exists with the same size, assuming its the same");
			_download_handled[fileurl + filename] = true;
			return;
		} else {
			logger.info("file", filename, "size is different from download url", fileinfo.size, filesize, "downloading again");
		}
	} else {
		logger.info("downloading", fileurl, "into", filename);
	}
	await dependencyAccessor.get_package(fileurl, filename);
	_download_handled[fileurl + filename] = true;
}

async function download_source(source: string, source_path: string) {
	let fileurl = source.substr(0, source.lastIndexOf("@"));
	let filename = path.join(source_path, path.basename(url.parse(fileurl).pathname));

	await download_file(fileurl, filename);
}

interface IPrecompiledSourceParsed {
	url: string;
	path: string;
	filename: string;
}

function parse_precompiled_source(source: string): IPrecompiledSourceParsed {
	let file_url_index = source.lastIndexOf("@");
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
		filename: path.basename(url.parse(source.substr(0, file_url_index)).pathname),
	};
}

let _extraction_handled: { [file: string]: boolean } = {};

async function extract_source_file(filename: string, source_path: string) {
	logger.debug("extract source", filename, source_path);
	if (!_extraction_handled[filename + source_path]) {
		await extractFull(filename, source_path);
		_extraction_handled[filename + source_path] = true;
	}
}

export function gyp_source_parse(source: string | nativeGyp.ISource): nativeGyp.ISource {
	let src = <nativeGyp.ISource> source;
	let ssource = <string> source;

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
	return src;
}

async function git_clone(source: string | nativeGyp.ISource, cwd: string) {
	let src = gyp_source_parse(source);

	let gitsrc = (src.source) ? src.source : <string> source;

	let repo_path = path.join(cwd, path.basename(gitsrc, path.extname(gitsrc)));

	if (!fs.existsSync(repo_path)) {
		logger.info("cloning git", gitsrc, "into", cwd);
		await gitAccessor.git_clone(gitsrc, cwd);
		if (src.branch) {
			await gitAccessor.git_checkout(repo_path, src.branch);
		}

		await gitAccessor.git_submodule_update(repo_path);
	} else {
		logger.debug("repo", gitsrc, "already exists, skipping");
	}
}

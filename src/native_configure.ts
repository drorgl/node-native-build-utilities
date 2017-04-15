#!/usr/bin/env node

import * as pfs from "./utilities/promisified_fs";
import path = require("path");
import commander = require("commander");

import * as buildAccessor from "./accessors/build-accessor";
import * as githubAccessor from "./accessors/github-accessor";
import * as packageAccessor from "./accessors/package-accessor";
import * as abiReleases from "./utilities/abi_releases";

import * as nativeGyp from "./accessors/native-gyp-accessor";
import * as detection from "./utilities/detection_utilities";

import * as dependencyEngine from "./engine/dependency-engine";

import * as nativeConfiguration from "./accessors/native-configuration-accessor";
import * as logger from "./utilities/logger";
import * as merger from "./utilities/object_utilities";

import { extractFull } from "./utilities/archive";

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

logger.info("native build configuration", packageAccessor.node_package.version);

// if build type == current platform
commander
	.version(packageAccessor.node_package.version)
	// TODO: add a way to install from github.com/releases....
	.option("-f, --force [type]", "force setup of package/binary/source")
	.option("-p, --platform [type]", "assume platform is win/linux", process.platform)
	.option("-a, --arch [architecture]", "assume architecture is x64/ia32/arm", process.arch)
	.option("-t, --toolset [type]", "assume toolset is vc/gcc", default_toolset)
	.option("-s, --toolset-version [version]", "assume toolset version", default_toolset_version)
	.option("-p,  --source-path", "assume source path", default_source_path)
	.option("-v, --verify", "verify configuration")
	.parse(process.argv);

process.on("SIGINT", () => {
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

async function attempt_prebuilt_install(selected_platform: string, selected_arch: string) {
	logger.info("attempting to download a prebuilt binary");
	let current_native_gyp = await nativeGyp.read();

	if (!current_native_gyp.binary){
		logger.warn("no binary definition, can't install prebuilt binaries");
		return false;
	}

	let version_info = await abiReleases.get_current_node_version();

	let package_name = buildAccessor.get_module_package_name(current_native_gyp.binary, {
		module_name: (current_native_gyp.binary && current_native_gyp.binary.module_name) ? current_native_gyp.binary.module_name : packageAccessor.node_package.name,
		version: packageAccessor.node_package.version,
		node_abi: version_info.modules,
		platform: selected_platform,
		arch: selected_arch
	});

	let github_accessor = new githubAccessor.GitHubAccessor();
	let repo = packageAccessor.parse_repository();

	let package_filename = path.join(default_source_path, package_name);

	logger.info("downloading", repo.username, repo.repo, packageAccessor.node_package.version, package_name, package_filename);
	try {
		let result = await github_accessor.download_asset(repo.username, repo.repo, `v${packageAccessor.node_package.version}`, package_name, package_filename);
	} catch (e) {
		logger.error("unable to retrieve dependency, fallback to build", e);
		return false;
	}

	if (!(await pfs.exists(package_filename))) {
		logger.error("file was downloaded but not found(?!)");
		return false;
	}

	try {
		await extractFull(package_filename, path.normalize("./"));
	} catch (e) {
		logger.error("failed to extract precompiled binary", e);
		return false;
	}
	return true;
}

(async () => {
	try {

		// read ALL native gyps in current package and node_modules
		let native_gyps = await nativeGyp.read_all_native_gyps("./");

		// platform win/linux
		const platforms = ["darwin", "freebsd", "linux", "sunos", "win32"];
		let selected_platform = commander["platform"];
		if (platforms.indexOf(selected_platform) === -1) {
			logger.error("platform should be one of the following:", platforms);
			process.exit(1);
		}

		// architectrure x64/ia32/arm/arm64
		const architectures = ["x64", "ia32", "arm"];
		let selected_arch = commander["arch"];
		if (architectures.indexOf(selected_arch) === -1) {
			logger.error("architectue shoule be one of the following:", architectures);
			process.exit(1);
		}

		// toolset vc/gcc
		const toolsets = ["vc", "gcc"];
		let selected_toolset = commander["toolset"];
		if (toolsets.indexOf(selected_toolset) === -1) {
			logger.error("toolset should be one of the following:", toolsets);
			process.exit(1);
		}

		let selected_toolset_version = commander["toolsetVersion"];

		logger.info("configuration:");
		logger.info(" platform: ", selected_platform);
		logger.info(" architecture: ", selected_arch);
		logger.info(" toolset:", selected_toolset);
		logger.info(" toolset version:", selected_toolset_version);
		logger.info(" source path:", default_source_path);

		if (!await pfs.exists(default_source_path)) {
			await pfs.mkdir(default_source_path);
		}

		// if no parameter specified, attempt to retrieve the precompiled binary
		if (!commander["force"]) {
			let result = await attempt_prebuilt_install(selected_platform, selected_arch);
			if (result) {
				process.exit(0);
			}
		}

		let configuration: nativeConfiguration.INativeConfiguration = {
			platform: selected_platform,
			arch: selected_arch,
			toolset: selected_toolset,
			toolset_version: selected_toolset_version,
			source_path: default_source_path,
			dependencies: {}
		};

		let last_configured_dependencies: dependencyEngine.IDependenciesInformation = null;

		let last_native_gyps: nativeGyp.INativeGyp[];

		let rescan_iteration = 1;

		while (JSON.stringify(last_native_gyps) !== JSON.stringify(native_gyps) && rescan_iteration < 11) {

			for (let native_gyp of native_gyps) {
				console.log("processing ", native_gyp);

				let configured_dependencies = await dependencyEngine.parse_dependencies(native_gyp, configuration);
				configuration.dependencies = merger.merge<nativeConfiguration.IDependencies>(configuration.dependencies, configured_dependencies.dependencies);

				logger.info("configuration:", configuration);

				if (configured_dependencies.precompiled_sources, default_source_path && configured_dependencies.precompiled_sources, default_source_path.length > 0) {
					logger.info("preparing precompiled dependencies..");
					await dependencyEngine.download_precompiled_sources(configured_dependencies.precompiled_sources, default_source_path);
					logger.info("done");
				}

				if (configured_dependencies.archived_sources && configured_dependencies.archived_sources.length) {
					logger.info("preparing archived source dependencies...");
					await dependencyEngine.download_archived_sources(configured_dependencies.archived_sources, default_source_path);
					logger.info("done");
				}

				if (configured_dependencies.git_repositories && configured_dependencies.git_repositories.length) {
					logger.info("preparing source dependencies..");
					await dependencyEngine.clone_git_sources(configured_dependencies.git_repositories, default_source_path);
					logger.info("done");
				}

				rescan_iteration++;

				if (rescan_iteration > 10) {
					logger.warn("maximum rescan iteration reached, dependency tree might not be complete");
					break;
				}
			}

			last_native_gyps = native_gyps;
			native_gyps = await nativeGyp.read_all_native_gyps("./");
		}

		await nativeConfiguration.save(nativeConfiguration.NATIVE_CONFIGURATION_FILE, configuration);

		await buildAccessor.configure();
		await buildAccessor.build();
	} catch (e) {
		logger.error("unable to configure", e, e.stackTrace);
		process.exit(1);
	}
})();

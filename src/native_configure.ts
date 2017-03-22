#!/usr/bin/env node

import fs = require("fs");

import commander = require("commander");
import { node_package } from "./accessors/package-accessor";

import * as nativeGyp from "./accessors/native-gyp-accessor";
import * as detection from "./utilities/detection_utilities";

import * as dependencyEngine from "./engine/dependency-engine";

import * as nativeConfiguration from "./accessors/native-configuration-accessor";
import * as logger from "./utilities/logger";

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

logger.info("native build configuration", node_package.version);

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

(async () => {
	try {
		let native_gyp = nativeGyp.read();

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

		if (!fs.existsSync(default_source_path)) {
			fs.mkdirSync(default_source_path);
		}

		let configuration: nativeConfiguration.INativeConfiguration = {
			platform: selected_platform,
			arch: selected_arch,
			toolset: selected_toolset,
			toolset_version: selected_toolset_version,
			source_path: default_source_path
		};

		let configured_dependencies = await dependencyEngine.parse_dependencies(native_gyp, configuration);
		configuration.dependencies = configured_dependencies.dependencies;

		logger.info("configuration:", configuration);

		if (configured_dependencies.precompiled_sources, default_source_path && configured_dependencies.precompiled_sources, default_source_path.length > 0) {
			logger.info("preparing precompiled dependencies..");
			await dependencyEngine.download_precompiled_sources(configured_dependencies.precompiled_sources, default_source_path);
			logger.info("done");
		}

		if (configured_dependencies.git_repositories && configured_dependencies.git_repositories.length) {
			logger.info("preparing source dependencies..");
			await dependencyEngine.clone_git_sources(configured_dependencies.git_repositories, default_source_path);
			logger.info("done");
		}

		await nativeConfiguration.save(nativeConfiguration.NATIVE_CONFIGURATION_FILE, configuration);

	} catch (e) {
		logger.error("unable to configure", e, e.stackTrace);
		process.exit(1);
	}
})();

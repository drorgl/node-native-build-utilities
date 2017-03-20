#!/usr/bin/env node

import fs = require("fs");
import commander = require("commander");
import * as nativeConfiguration from "./accessors/native-configuration-accessor";
import * as nativeGyp from "./accessors/native-gyp-accessor";
import { node_package } from "./accessors/package-accessor";
import * as pkgConfig from "./accessors/pkg-config-accessor";
import * as dependencyEngine from "./engine/dependency-engine";
import * as detection from "./utilities/detection_utilities";
import * as logger from "./utilities/logger";

// return data for gyp configuration
// read "native_configuration.json"

// pkg-config for gcc, flag for visual studio

// dependencies - for gyp dependencies
// headers/includes - for preinstalled binaries
// libraries - for preinstalled binaries

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

commander
	.version(node_package.version)
	// 	.option("-f, --force [type]", "force setup of package/binary/source")
	// 	.option("-p, --platform [type]", "assume platform is win/linux", process.platform)
	// 	.option("-a, --arch [architecture]", "assume architecture is x64/ia32/arm", process.arch)
	// 	.option("-t, --toolset [type]", "assume toolset is vc/gcc", default_toolset)
	// 	.option("-s, --toolset-version [version]", "assume toolset version", default_toolset_version)
	.option("-p, --source-path", "assume source path", default_source_path)
	.option("-v, --verify", "verify configuration")
	.option("-d, --dependency [name]", "retrieve dependency by name")
	.option("-h, --headers [name]", "retrieve headers by name")
	.option("-l, --libs [name]", "retrieve libraries by name")
	.parse(process.argv);

let timestamp = new Date().getTime().toString();
logger.log_to_file("nncu." + timestamp + ".log");

(async () => {
	try {
		if (!nativeGyp.exists()) {
			logger.error(nativeGyp.NATIVE_GYP_FILENAME, "not found, nothing to do");
			process.exit(0);
		}

		let native_configuration: nativeConfiguration.INativeConfiguration = await nativeConfiguration.load(nativeConfiguration.NATIVE_CONFIGURATION_FILE);
		let native_gyp = nativeGyp.read();

		let dependencies = (await dependencyEngine.parse_dependencies(native_gyp, native_configuration)).dependencies;

		if (commander["sourcePath"]) {
			default_source_path = commander["sourcePath"];
		}

		if (commander["dependency"]) {
			logger.log_to_console(false);
			let dep = dependencies[commander["dependency"]];
			if (dep) {
				if (dep.source === "source") {
					console.log(dep.gyp_file + ":" + dep.gyp_target);
				}
			}
		}

		if (commander["headers"]) {
			logger.log_to_console(false);
			let dep = dependencies[commander["headers"]];
			if (dep) {
				if (dep.source === "pkg-config") {
					// iterate through pkg-config in native_gyp.json, call pkgconfig on each one and return an aggregate
					// pkgConfig.info("")
				} else if (dep.source === "headers") {
					// iterate through headers in native_gyp.json, return the headers path for each matching (arch/platform/etc') header
				} else if (dep.source === "source") {
					// ignore, should be handled by "dependency" section
				}
				console.log(dep.headers);
			}
		}

		if (commander["libs"]) {
			logger.log_to_console(false);
			let dep = dependencies[commander["libs"]];
			if (dep) {
				if (dep.source === "pkg-config") {
					// iterate through pkg-config in native_gyp.json, call pkgconfig on each one and return an aggregate
					// pkgConfig.info("")
				} else if (dep.source === "headers") {
					// iterate through libraries in native_gyp.json, return the headers path for each matching (arch/platform/etc') header
				} else if (dep.source === "source") {
					// ignore, should be handled by "dependency" section
				}
				console.log(dep.libraries);
			}
		}

	} catch (e) {
		logger.error("error executing dependency tracker", e, e.stackTrace);
		process.exit(1);
	}
})();
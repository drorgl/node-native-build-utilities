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
import path = require("path");
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

if (commander["dependency"] || commander["headers"] || commander["libs"]) {
	logger.log_to_console(false);
}

logger.info("arguments", process.argv);

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
			let dep = dependencies[commander["dependency"]];
			if (dep) {
				if (dep.source === "source") {
					let gyp_sources = "";
					for (let gyp_src of dep.gyp_sources){
						let gyp_source =  dependencyEngine.gyp_source_parse( gyp_src);
						gyp_sources += " " + normalize_path( path.join( native_configuration.source_path, path.basename(gyp_source.source, path.extname(gyp_source.source)) , gyp_source.gyp_file)) + ":" + gyp_source.gyp_target;
					}
					console.log(gyp_sources);
				}
			}
		}

		if (commander["headers"]) {
			let dep = dependencies[commander["headers"]];
			if (dep) {
				if (dep.source === "pkg-config") {
					// iterate through pkg-config in native_gyp.json, call pkgconfig on each one and return an aggregate
					let pkg_configs = "";
					for (let pkg_source of dep.packages){
						pkg_configs += " " +  pkgConfig.info(pkg_source,pkgConfig.module_info.cflags);
					}
					console.log(pkg_configs);
				} else if (dep.source === "prebuilt") {
					// iterate through headers in native_gyp.json, return the headers path for each matching (arch/platform/etc') header
					let headers = "";
					for (let header of dep.headers){
						headers += " " + normalize_path( path.join( native_configuration.source_path , header));
					}

					console.log(headers);
				} else if (dep.source === "source") {
					// ignore, should be handled by "dependency" section
				}
			}
		}

		if (commander["libs"]) {
			let dep = dependencies[commander["libs"]];
			if (dep) {
				if (dep.source === "pkg-config") {
					// iterate through pkg-config in native_gyp.json, call pkgconfig on each one and return an aggregate
					let pkg_configs = "";
					for (let pkg_source of dep.packages){
						pkg_configs += " " +  pkgConfig.info(pkg_source,pkgConfig.module_info.libs);
					}
					console.log(pkg_configs);
				} else if (dep.source === "prebuilt") {
					// iterate through libraries in native_gyp.json, return the headers path for each matching (arch/platform/etc') header
					let libraries = "";
					for (let header of dep.libraries){
						libraries += " " +normalize_path( path.join( native_configuration.source_path , header));
					}

					console.log(libraries);
				} else if (dep.source === "source") {
					// ignore, should be handled by "dependency" section
				}
			}
		}

	} catch (e) {
		logger.error("error executing dependency tracker", e, e.stackTrace);
		process.exit(1);
	}
})();

function normalize_path(filepath : string) : string{
	return filepath.split(/\/|\\/).join("/");
}
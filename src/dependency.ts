#!/usr/bin/env node

import commander = require("commander");
import * as nativeConfiguration from "./accessors/native-configuration-accessor";
import * as nativeGyp from "./accessors/native-gyp-accessor";
import { node_package } from "./accessors/package-accessor";
import * as dependencyEngine from "./engine/dependency-engine";
import * as detection from "./utilities/detection_utilities";
import * as logger from "./utilities/logger";
import path = require("path");

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
	.option("-e, --cflags [name]", "retrieve cflags by name")
	.option("-l, --libs [name]", "retrieve libraries by name")
	.option("-f, --lib-fix", "appends .. before the library path, its a workaround to a bug in node-gyp where library root is different from includes root")
	.option("-c, --copy [name]", "retrieve files to copy to output")
	.option("-g, --logs", "dump logs to nnbu.*.log")
	.parse(process.argv);

process.on("SIGINT", () => {
	logger.error("Caught interrupt signal");
	process.exit(1);
});

if (commander["logs"]) {
	let timestamp = new Date().getTime().toString();
	logger.log_to_file("nncu." + timestamp + ".log");
}

if (commander["dependency"] || commander["headers"] || commander["libs"] || commander["copy"] || commander["cflags"]) {
	logger.log_to_console(false);
}

logger.info("arguments", process.argv);

(async () => {
	try {
		let native_configuration_filename = await nativeConfiguration.find_native_configuration_file(nativeConfiguration.NATIVE_CONFIGURATION_FILE);
		logger.debug("found native configuration", native_configuration_filename);

		let root_configuration = path.dirname(native_configuration_filename);

		let native_configuration: nativeConfiguration.INativeConfiguration = await nativeConfiguration.load(native_configuration_filename);
		let native_gyp = nativeGyp.read();

		if (commander["sourcePath"]) {
			default_source_path = commander["sourcePath"];
		}

		if (commander["dependency"]) {
			let dep = native_configuration.dependencies[commander["dependency"]];
			if (dep) {
				logger.debug("looking for dependency", dep);
				if (dep.source === "source" || dep.source === "archived_source" || (dep.source.indexOf("source") !== -1) || (dep.source.indexOf("archived_source") !== -1)) {
					let gyp_sources = "";
					for (let gyp_src of dep.gyp_sources) {
						let gyp_source = dependencyEngine.gyp_source_parse(gyp_src);
						gyp_sources += " " + normalize_gyp_path(path.join(root_configuration, native_configuration.source_path, path.basename(gyp_source.source, path.extname(gyp_source.source)), gyp_source.gyp_file)) + ":" + gyp_source.gyp_target;
					}
					console.log(gyp_sources);
				}
			}
		}

		if (commander["headers"]) {
			let dep = native_configuration.dependencies[commander["headers"]];
			if (dep) {
				logger.debug("looking for headers", dep);
				if (dep.source === "pkg-config" || (dep.source.indexOf("pkg-config") !== -1)) {
					// iterate through pkg-config in native_gyp.json, call pkgconfig on each one and return an aggregate
					let pkg_configs = "";
					for (let pkg_source of dep.pkg_includes) {
						pkg_configs += " " + pkg_source;
					}
					console.log(pkg_configs);
				} else if (dep.source === "prebuilt" || (dep.source.indexOf("prebuilt") !== -1)) {
					// iterate through headers in native_gyp.json, return the headers path for each matching (arch/platform/etc') header
					let headers = "";
					for (let header of dep.pre_headers) {
						headers += " " + normalize_gyp_path(path.join(root_configuration, native_configuration.source_path, header));
					}

					console.log(headers);
				} else if (dep.source === "source" || (dep.source.indexOf("source") !== -1)) {
					// ignore, should be handled by "dependency" section
				}
			}
		}

		//
		if (commander["cflags"]) {
			let dep = native_configuration.dependencies[commander["cflags"]];
			if (dep) {
				logger.debug("looking for cflags", dep);
				if (dep.source === "pkg-config" || (dep.source.indexOf("pkg-config") !== -1)) {
					// iterate through pkg-config in native_gyp.json, call pkgconfig on each one and return an aggregate
					let pkg_configs = "";
					for (let pkg_cflags of dep.pkg_cflags) {
						pkg_configs += " " + pkg_cflags;
					}
					console.log(pkg_configs);
				} else if (dep.source === "prebuilt" || (dep.source.indexOf("prebuilt") !== -1)) {
					// iterate through cflags in native_gyp.json, return the cflags path for each matching (arch/platform/etc') header
					let cflags = "";

					console.log(cflags);
				} else if (dep.source === "source" || (dep.source.indexOf("source") !== -1)) {
					// ignore, should be handled by "dependency" section
				}
			}
		}

		if (commander["libs"]) {
			let dep = native_configuration.dependencies[commander["libs"]];
			if (dep) {
				logger.debug("looking for libraries", dep);
				if (dep.source === "pkg-config" || (dep.source.indexOf("pkg-config") !== -1)) {
					// iterate through pkg-config in native_gyp.json, call pkgconfig on each one and return an aggregate
					let pkg_configs = "";
					for (let pkg_source of dep.pkg_libraries) {
						pkg_configs += " " + pkg_source;
					}
					console.log(pkg_configs);
				} else if (dep.source === "prebuilt" || (dep.source.indexOf("prebuilt") !== -1)) {
					// iterate through libraries in native_gyp.json, return the headers path for each matching (arch/platform/etc') header
					let libraries = "";
					for (let header of dep.pre_libraries) {
						logger.debug("header", header);
						libraries += " " + normalize_gyp_path(path.join(root_configuration, (commander["libFix"]) ? ".." : "", native_configuration.source_path, header));
					}

					console.log(libraries);
				} else if (dep.source === "source" || (dep.source.indexOf("source") !== -1)) {
					// ignore, should be handled by "dependency" section
				}
			}
		}

		if (commander["copy"]) {
			let dep = native_configuration.dependencies[commander["copy"]];
			if (dep) {
				logger.debug("looking for copy", dep);
				if (dep.source === "pkg-config" || (dep.source.indexOf("pkg-config") !== -1)) {
					// nothing to do
				} else if (dep.source === "prebuilt" || (dep.source.indexOf("prebuilt") !== -1)) {
					// iterate through libraries in native_gyp.json, return the headers path for each matching (arch/platform/etc') header
					let files = "";
					for (let file of dep.copy) {
						logger.debug("copy", file);
						files += " " + normalize_gyp_path(path.join(root_configuration, native_configuration.source_path, file));
					}

					console.log(files);
				} else if (dep.source === "source" || (dep.source.indexOf("source") !== -1)) {
					// ignore, should be handled by "dependency" section
				}
			}
		}
	} catch (e) {
		logger.error("error executing dependency tracker", e, e.stackTrace);
		process.exit(1);
	}
})();

function normalize_gyp_path(filepath: string): string {
	return filepath.split(/\/|\\/).join("/");
}

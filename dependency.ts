import fs = require("fs");
import commander = require("commander");
import { node_package } from "./package-accessor";
import * as detection from "./detection_utilities";


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

console.log("native build configuration", node_package.version);
commander
	.version(node_package.version)
//	.option("-f, --force [type]", "force setup of package/binary/source")
//	.option("-p, --platform [type]", "assume platform is win/linux", process.platform)
//	.option("-a, --arch [architecture]", "assume architecture is x64/ia32/arm", process.arch)
//	.option("-t, --toolset [type]", "assume toolset is vc/gcc", default_toolset)
//	.option("-s, --toolset-version [version]", "assume toolset version", default_toolset_version)
	.option("-p, --source-path", "assume source path", default_source_path)
	.option("-v, --verify", "verify configuration")
	.option("-d, --dependency [name]", "retrieve dependency by name")
	.option("-h, --headers [name]", "retrieve headers by name")
	.option("-l, --libs [name]", "retrieve libraries by name")
	.parse(process.argv);



interface IConfiguredDependency {
	source: string;
	
	gyp_file : string;
	gyp_target: string;

	headers: string[];
	libraries:string[];
}
let configured_dependencies: { [dependency_name: string]: IConfiguredDependency } = JSON.parse(fs.readFileSync("native_configuration.json").toString("utf8"));

if (commander["sourcePath"]){
	default_source_path = commander["sourcePath"];
}

if (commander["dependency"]){
	let dep = configured_dependencies[commander["dependency"]];
	if (dep){
		console.log(dep.gyp_file + ":" + dep.gyp_target);
	}
}

if (commander["headers"]){
	let dep = configured_dependencies[commander["headers"]];
	if (dep){
		console.log(dep.headers);
	}
}

if (commander["libs"]){
	let dep = configured_dependencies[commander["libs"]];
	if (dep){
		console.log(dep.libraries);
	}
}

// '!@(pkg-config --libs-only-l apr-1)',
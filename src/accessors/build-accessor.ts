import * as nativeGyp from "./native-gyp-accessor";

import * as gyp from "./node-gyp-accessor";

// execute node-gyp
// cache results of build is successful, the question is what is the key...? perhaps a hash of all the sources?

//  "binary": {
//     "module_name": "quantlib",
//     "module_path": "./build/Release/quantlib.node",
//     "host": "https://github.com",
//     "package_name": "{platform}-{arch}.tar.gz",
//     "remote_path": "./quantlibnode/quantlibnode/releases/download/v{version}/"
//   }

//   "binary": {
//       "module_name": "mymodule",
//       "module_path": "./build/",
//       "host": "https://github.com",
//       "package_name": "{platform}-{arch}.tar.gz",
//       "remote_path": "./myproject/dist/raw/master/v{version}/"
//   }

// nnbu-configure && node-gyp configure -- --no-duplicate-basename-check   && node-gyp build
//

const DEFAULT_PACKAGE_NAME = "{module_name}-v{version}-{node_abi}-{platform}-{arch}.7z";

interface IProcessInfo {
	module_name: string;
	version: string;
	node_abi: string;
	platform: string;
	arch: string;
}

export function get_module_package_name(binary: nativeGyp.INativeBinary, processInfo: IProcessInfo): string {
	let ret = binary.package_name || DEFAULT_PACKAGE_NAME;
	for (let key of Object.getOwnPropertyNames(processInfo)) {
		let rep = new RegExp(`{${key}}`, "i");
		ret = ret.replace(rep, (processInfo as any)[key]);
	}
	return ret;
}

interface IGypArgs {
	node_gyp_arguments: string[];
	gyp_arguments: string[];
}

function parse_options(configure_params: string): IGypArgs {
	let node_gyp_arguments: string[] = [];
	let gyp_arguments: string[] = [];

	if (configure_params) {

		if (configure_params.startsWith("-- ")) {
			gyp_arguments = gyp_arguments.concat(configure_params.split(" "));
		} else {
			let ngparameters = configure_params.split(" -- ")[0];
			let node_gyp_args = (ngparameters.length > 0) ? ngparameters[0].split(" ") : [];
			let gyp_args = (ngparameters.length > 1) ? ngparameters[1].split(" ") : [];

			node_gyp_arguments = node_gyp_arguments.concat(node_gyp_args);
			gyp_arguments = gyp_arguments.concat(gyp_args);
		}
	}
	return {
		node_gyp_arguments,
		gyp_arguments
	};
}

export async function configure(additional_options?: string): Promise<boolean> {
	let native_gyps = await nativeGyp.read_all_native_gyps("./");

	let args: IGypArgs = parse_options(additional_options);

	// collect configuration options
	for (let ng of native_gyps) {
		let configure_params = ng.node_gyp_configure_parameters;

		if (!configure_params) {
			continue;
		}

		let ngargs = parse_options(configure_params);
		args.gyp_arguments = args.gyp_arguments.concat(ngargs.gyp_arguments);
		args.node_gyp_arguments = args.node_gyp_arguments.concat(ngargs.node_gyp_arguments);
	}

	let cmdargs = args.node_gyp_arguments.join(" ") + " -- " + args.gyp_arguments.join(" ");

	let result = await gyp.configure(cmdargs);
	return (result === 0);
}

export async function build(additional_options?: string): Promise<boolean> {
	let native_gyps = await nativeGyp.read_all_native_gyps("./");

	let args: IGypArgs = parse_options(additional_options);

	// collect build options
	for (let ng of native_gyps) {
		let configure_params = ng.node_gyp_build_parameters;

		if (!configure_params) {
			continue;
		}

		let ngargs = parse_options(configure_params);
		args.gyp_arguments = args.gyp_arguments.concat(ngargs.gyp_arguments);
		args.node_gyp_arguments = args.node_gyp_arguments.concat(ngargs.node_gyp_arguments);
	}

	let cmdargs = args.node_gyp_arguments.join(" ") + " -- " + args.gyp_arguments.join(" ");

	let result = await gyp.build(cmdargs);
	return (result === 0);
}

import * as nativeGyp from "./native-gyp-accessor";

import * as gyp from "./node-gyp-accessor";

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
	for (const key of Object.getOwnPropertyNames(processInfo)) {
		const rep = new RegExp(`{${key}}`, "i");
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
			configure_params = configure_params.substr("-- ".length);
			gyp_arguments = gyp_arguments.concat(configure_params.split(" "));
		} else {
			const ngparameters = configure_params.split(" -- ")[0];
			const node_gyp_args = (ngparameters.length > 0) ? ngparameters[0].split(" ") : [];
			const gyp_args = (ngparameters.length > 1) ? ngparameters[1].split(" ") : [];

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
	const native_gyps = await nativeGyp.read_all_native_gyps("./");

	const args: IGypArgs = parse_options(additional_options);

	// collect configuration options
	for (const ng of native_gyps) {
		const configure_params = ng.node_gyp_configure_parameters;

		if (!configure_params) {
			continue;
		}

		const ngargs = parse_options(configure_params);
		args.gyp_arguments = args.gyp_arguments.concat(ngargs.gyp_arguments);
		args.node_gyp_arguments = args.node_gyp_arguments.concat(ngargs.node_gyp_arguments);
	}

	const cmdargs = args.node_gyp_arguments.join(" ") + " -- " + args.gyp_arguments.join(" ");

	const result = await gyp.configure(cmdargs);
	return (result === 0);
}

export async function build(additional_options?: string): Promise<boolean> {
	const native_gyps = await nativeGyp.read_all_native_gyps("./");

	const args: IGypArgs = parse_options(additional_options);

	// collect build options
	for (const ng of native_gyps) {
		const configure_params = ng.node_gyp_build_parameters;

		if (!configure_params) {
			continue;
		}

		const ngargs = parse_options(configure_params);
		args.gyp_arguments = args.gyp_arguments.concat(ngargs.gyp_arguments);
		args.node_gyp_arguments = args.node_gyp_arguments.concat(ngargs.node_gyp_arguments);
	}

	const cmdargs = args.node_gyp_arguments.join(" ") + " -- " + args.gyp_arguments.join(" ");

	const result = await gyp.build(cmdargs);
	return (result === 0);
}

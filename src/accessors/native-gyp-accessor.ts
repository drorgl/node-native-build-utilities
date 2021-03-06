// import fs = require("fs");
import path = require("path");
import * as pfs from "../utilities/promisified_fs";

import strip_json_comments = require("strip-json-comments");

export const NATIVE_GYP_FILENAME = "native_gyp.json";

export interface IPrecompiledSource {
	arch: string;
	platform: string;
	toolset: string;
	toolset_version?: string;
	source: string;
	copy?: string;
}

export interface ISource {
	source: string;
	branch?: string;
	gyp_file?: string;
	gyp_target?: string;
}

interface IDependency {
	packages: string[];
	pkgconfig: { [package_name: string]: string };
	headers: { [package_name: string]: IPrecompiledSource[] };
	libraries: { [package_name: string]: IPrecompiledSource[] };
	sources: Array<string | ISource>;
	archived_sources: Array<string | ISource>;

}

export interface INativeBinary {
	module_name: string; // quantlib
	module_paths: string[]; // ./build/Release/quantlib.node - add multiple filters!
	publish_repo: string; // github user/repo
	package_name: string; // '{module_name}-v{version}-{node_abi}-{platform}-{arch}.tar.gz';
}

export interface INativeGyp {
	node_gyp_configure_parameters?: string;
	node_gyp_build_parameters?: string;

	binary: INativeBinary;

	dependencies: { [dependencyId: string]: IDependency };
}

export async function exists(): Promise<boolean> {
	return pfs.exists(NATIVE_GYP_FILENAME);
}

export async function read(filename?: string): Promise<INativeGyp> {
	if (!await pfs.exists(filename || NATIVE_GYP_FILENAME)) {
		throw new Error("file not found");
	}

	let file = await pfs.readFile(filename || NATIVE_GYP_FILENAME, "utf8") as string;
	file = strip_json_comments(file, { whitespace: true });
	return JSON.parse(file) as INativeGyp;
}

export async function find_all_native_gyps(base_path: string, level?: number): Promise<string[]> {
	let native_gyps: string[] = [];
	const items = await pfs.readdir(base_path);

	for (const item of items) {
		const stat_ = await pfs.stat(path.join(base_path, item));
		if (stat_.isDirectory()) {
			if (level < 4 || !level) {
				const subdirectories = await find_all_native_gyps(path.join(base_path, item), (level || 0) + 1);
				native_gyps = native_gyps.concat(subdirectories);
			}
		}
		if (path.basename(item).toLowerCase() === NATIVE_GYP_FILENAME) {
			console.log("scanning ", path.join(base_path, item));
			native_gyps.push(path.join(base_path, item));
		}
	}
	return native_gyps;
}

export async function read_all_native_gyps(base_path: string): Promise<INativeGyp[]> {
	const native_gyps: INativeGyp[] = [];
	const gyp_files = await find_all_native_gyps(base_path, 0);
	console.log("gyp files found: ", gyp_files);
	for (const file of gyp_files) {
		native_gyps.push(await read(file));
	}
	return native_gyps;
}

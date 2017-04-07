import bluebird = require("bluebird");
import fs = require("fs");
import path = require("path");
import * as pfs from "../utilities/promisified_fs";
import * as nativeGyp from "./native-gyp-accessor";

let writeFile = bluebird.promisify<void, string, any>(fs.writeFile);
let readFile = bluebird.promisify<string, string, string>(fs.readFile);

export const NATIVE_CONFIGURATION_FILE = "native_configuration.json";

export interface IConfiguredDependency {
	source: string | string[];

	packages?: string[];
	pkg_includes?: string[];
	pkg_libraries?: string[];

	gyp_sources?: Array<string | nativeGyp.ISource>;

	pre_headers?: string[];
	pre_libraries?: string[];
	copy?: string[];
}

export interface IDependencies {
	[dependency_name: string]: IConfiguredDependency;
}

export interface INativeConfiguration {
	platform: string;
	arch: string;
	toolset: string;
	toolset_version: string;
	source_path: string;
	dependencies?: IDependencies;
}

export async function save(filename: string, configuration: INativeConfiguration) {
	await writeFile(filename, JSON.stringify(configuration, null, "\t"));
}

export function find_native_configuration_file(filename: string): Promise<string> {
	return new Promise<string>(async (resolve, reject) => {
		let limit = 5;
		while ((!await pfs.exists(filename)) && limit > 0) {
			filename = path.join("..", filename);
			limit--;
		}

		if (await pfs.exists(filename)) {
			resolve(filename);
		} else {
			reject("not found");
		}
	});
}

export async function load(filename: string): Promise<INativeConfiguration> {
	let fileContents = await readFile(filename, "utf8");
	return JSON.parse(fileContents);
}

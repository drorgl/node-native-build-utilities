import bluebird = require("bluebird");
import fs = require("fs");

let writeFile = bluebird.promisify<void, string, any>(fs.writeFile);
let readFile = bluebird.promisify<string, string, string>(fs.readFile);

export const NATIVE_CONFIGURATION_FILE = "native_configuration.json";

export interface IConfiguredDependency {
	source: string;

	gyp_file?: string;
	gyp_target?: string;

	headers?: string[];
	libraries?: string[];
}

export interface IDependencies {
	[dependency_name: string]: IConfiguredDependency;
}

export async function save(filename: string, configuration: IDependencies) {
	await writeFile(filename, JSON.stringify(configuration));
}

export function load(filename: string): Promise<IDependencies> {
	return new Promise<IDependencies>(async (resolve, reject) => {
		try {
			let fileContents = await readFile(filename, "utf8");
			resolve(JSON.parse(fileContents));
		} catch (e) {
			reject(e);
		}
	});
}

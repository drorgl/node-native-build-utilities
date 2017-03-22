import fs = require("fs");
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
}

export interface INativeGyp {
	dependencies: { [dependencyId: string]: IDependency };
}

export function exists(): boolean {
	return fs.existsSync(NATIVE_GYP_FILENAME);
}

export function read(): INativeGyp {
	if (!fs.existsSync(NATIVE_GYP_FILENAME)) {
		throw new Error("file not found");
	}

	let file = fs.readFileSync(NATIVE_GYP_FILENAME).toString("utf8");
	file = strip_json_comments(file, { whitespace: true });
	return <INativeGyp> JSON.parse(file);
}

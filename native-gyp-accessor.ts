import fs = require("fs");
import strip_json_comments = require("strip-json-comments");

interface IPrecompiledSource {
	arch: string;
	platform: string;
	toolset: string;
	toolset_version?: string;
	source: string;
	copy?: string;
}

interface ISource {
	source: string;
	branch?: string;
	gyp_file?: string;
	gyp_target?: string;
}

interface IDependency {
	packages: string[];
	pkgconfig: string[];
	headers: { [package_name: string]: IPrecompiledSource[] };
	libraries: { [package_name: string]: IPrecompiledSource[] };
	sources: Array<string | ISource>;
}

interface INativeGyp {
	dependencies: { [dependencyId: string]: IDependency };
}

export function read_native_gyp(filename: string): INativeGyp {
	if (!fs.existsSync(filename)) {
		throw new Error("file not found");
	}

	let file = fs.readFileSync(filename).toString("utf8");
	file = strip_json_comments(file,{whitespace:true});
	return <INativeGyp>JSON.parse(file);
}

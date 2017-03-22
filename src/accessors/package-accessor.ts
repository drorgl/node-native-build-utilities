import fs = require("fs");
import path = require("path");
import app_root_path = require("app-root-path");

interface IPerson {
	name: string;
	email: string;
	url: string;
}

interface IDirectory {
	lib?: string | string[];
	bin?: string | string[];
	man?: string | string[];
	doc?: string | string[];
	example?: string | string[];
}

interface IRepository {
	type: string;
	url: string;
}

interface IPackage {
	name: string;
	description: string;
	version: string;
	keywords?: string[];
	homepage?: string;
	bugs?: string;
	license?: string;
	author?: IPerson;
	contributors?: IPerson[];
	files?: string[];
	main?: string;
	bin?: { [name: string]: string };
	man?: { [name: string]: string };
	directories?: IDirectory;
	repository?: IRepository | string;
	scripts?: { [name: string]: string };
	config?: any;
	dependencies?: { [id: string]: string };
	devDependencies?: { [id: string]: string };
	peerDependencies?: { [id: string]: string };
	bundledDependencies?: { [id: string]: string };
	optionalDependencies?: { [id: string]: string };
	engines?: { [id: string]: string };
	os?: string[];
	cpu?: string[];
	preferGlobal?: boolean;
	private?: boolean;
	publishConfig?: any;
}

export const node_package: IPackage =
	JSON.parse(fs.readFileSync(path.join(app_root_path.path, "package.json")).toString());

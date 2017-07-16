import fs = require("fs");
import path = require("path");
import url = require("url");
import { IPackageArgs, npa } from "./npm-package-arg";

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
	JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json")).toString());

enum repository_source {
	git,
	svn,
	github,
	gist,
	bitbucket,
	gitlab
}

interface IParsedRepository {
	repository_type: string;
	url: string;
	username: string;
	repo: string;
}

interface IHostInfo {
	host_type: string;
	username: string;
	repo: string;
}

function parse_shortcut(shortcut: string): IHostInfo {
	const shortcut_regex_with_host = /(\S*)[:](\S*)[\/](\S*)/;
	const shortcut_regex_without_host = /(\S*)[\/](\S*)/;
	if (shortcut_regex_with_host.test(shortcut)) {
		const match = shortcut_regex_with_host.exec(shortcut);
		return {
			host_type: match[1],
			username: match[2],
			repo: match[3]
		};
	} else if (shortcut_regex_without_host.test(shortcut)) {
		const match = shortcut_regex_without_host.exec(shortcut);
		return {
			host_type: match[1],
			username: match[2],
			repo: match[3]
		};
	}
	return null;
}

export function parse_repository(): IParsedRepository {
	let parsed: IPackageArgs;
	if (!node_package.repository) {
		throw new Error("unable to parse repository, doesn't exist");
	}
	if (typeof node_package.repository === "string") {
		parsed = npa(node_package.repository);
	} else if (node_package.repository.url) {
		parsed = npa(node_package.repository.url);
	}

	const parsed_shortcut = parse_shortcut(parsed.hosted.shortcut);

	return {
		repository_type: (parsed.type === "hosted") ? parsed.hosted.type : parsed.type,
		url: (parsed.hosted) ? parsed.hosted.shortcut : parsed.spec,
		username: parsed_shortcut.username,
		repo: parsed_shortcut.repo
	};
}

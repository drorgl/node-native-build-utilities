// tslint:disable-next-line:no-var-requires
let npa_parse = require("npm-package-arg");

export interface IHostedParameters {
	type: string;
	ssh: string;
	sshurl: string;
	https: string;
	directUrl: string;
	shortcut: string;
}

export interface IPackageArgs {
	raw: string;
	name: string;
	escapedName: string;
	scope: string;
	type: string;
	spec: string;
	rawSpec: string;
	hosted: IHostedParameters;
}
export function npa(arg: string): IPackageArgs {
	return npa_parse(arg);
}

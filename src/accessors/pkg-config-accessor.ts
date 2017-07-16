import fs = require("fs");

import child_process = require("child_process");
const spawnSync = child_process.spawnSync;

export function version(): string {
	const result = spawnSync("pkg-config", ["--version"], { shell: true });
	return result.output.join("").toString().trim();
}

export function modversion(module_name: string) {
	const result = spawnSync("pkg-config", ["--modversion", module_name], { shell: true });
	return result.output.join("").toString().trim();
}

export enum module_info {
	libs,
	cflags,
	includedir,
}

export function info(module_name: string, info_type: module_info) {
	let command = "";
	switch (info_type) {
		case module_info.libs:
			command = "--libs";
			break;
		case module_info.cflags:
			command = "--cflags";
			break;
		case module_info.includedir:
			command = "--variable=includedir";
			break;
		default:
			throw new Error("not implemented");
	}

	const result = spawnSync("pkg-config", [command, module_name], { shell: true });
	return result.output.join("").toString().trim();
}

export function exists(module_name: string): boolean {
	const result = spawnSync("pkg-config", ["--exists", module_name], { shell: true });
	return result.output.join("").toString().trim() === "0" || result.status === 0;
}

interface IPackage {
	name: string;
	description: string;
}

export function list_all(): IPackage[] {
	const result = spawnSync("pkg-config", ["--list-all"], { shell: true });
	const result_data = result.output.join("").toString();
	const result_rows = result_data.split("\r");
	const packages: IPackage[] = [];
	for (let row of result_rows) {
		row = row.trim();
		const name_end = row.indexOf(" ");
		const package_name = row.substr(0, name_end).trim();
		const package_description = row.substr(name_end).trim();

		packages.push({
			name: package_name,
			description: package_description
		});
	}

	return packages;
}

import path = require("path");
import node7z from "node-7z";
import * as pfs from "./promisified_fs";

let myTask = new node7z();

export async function extractFull(archive: string, dest: string): Promise<any> {
	return await myTask.extractFull(archive, dest, {});
}

export async function addFull(archive: string, files: string[]): Promise<any> {
	files = files.map((v)=> path.join("./",v));
	return await myTask.add(archive, files, {});
}

const ignores = ["./.git/**", "./.gitignore"];

export async function parse_folder(folder: string): Promise<string[]> {
	let files = await pfs.find_all_files(folder);
	for (let ignore_pattern of ignores) {
		files = await pfs.filter_glob(ignore_pattern, files);
	}
	if ((await pfs.exists(path.join(folder, ".gitignore")))) {
		let gitignore = (await pfs.readFile(path.join(folder, ".gitignore"), "utf8")).split("\r");
		for (let ignore_pattern of gitignore) {
			ignore_pattern = ignore_pattern.trim();
			files = await pfs.filter_glob(ignore_pattern, files);

			ignore_pattern = path.join(ignore_pattern, "**");
			files = await pfs.filter_glob(ignore_pattern, files);

			ignore_pattern = "." + ignore_pattern;
			files = await pfs.filter_glob(ignore_pattern, files);

		}
	}
	return files;
}

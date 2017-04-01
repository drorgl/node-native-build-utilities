import path = require("path");
import node7z from "node-7z";
import * as ProgressBar from "progress";
import * as pfs from "./promisified_fs";

let myTask = new node7z();

export async function extractFull(archive: string, dest: string): Promise<any> {
	return await myTask.extractFull(archive, dest, {});
}

export async function addFull(archive: string, files: string[]): Promise<any> {
	return new Promise<any>((resolve, reject) => {
		files = files.map((v) => path.join("./", v));

		let bar: ProgressBar = null;

		bar = new ProgressBar(path.basename(archive) + " [:bar] :percent :etas", {
			complete: "=",
			incomplete: " ",
			width: 40,
			total: files.length
		});

		myTask.add(archive, files, { mx: "9" })
			.promise.then((resolve_value) => {
				(async () => {
					let fsize = (await pfs.stat(archive)).size;
					console.log();
					console.log(path.basename(archive), "compressed to ", pfs.human_file_size(fsize, true));
					resolve(resolve_value);
				})();
			}, (reject_reason) => {
				reject(reject_reason);
			}, (progress_data) => {
				bar.tick(progress_data.length);
			});
	});
}

const ignores = ["./.git/**", "./.gitignore", "./.tmp/**"];

export async function parse_folder(folder: string): Promise<string[]> {
	let files = await pfs.find_all_files(folder);
	for (let ignore_pattern of ignores) {
		files = await pfs.filter_glob(ignore_pattern, files);
	}
	if ((await pfs.exists(path.join(folder, ".gitignore")))) {
		let gitignore = (await pfs.readFile(path.join(folder, ".gitignore"), "utf8")).split(/\r?\n/);
		for (let ignore_pattern of gitignore) {
			ignore_pattern = ignore_pattern.trim();
			if (!ignore_pattern) {
				continue;
			}
			files = await pfs.filter_glob(ignore_pattern, files);

			ignore_pattern = path.join(ignore_pattern, "**");
			files = await pfs.filter_glob(ignore_pattern, files);

			ignore_pattern = "." + ignore_pattern;
			files = await pfs.filter_glob(ignore_pattern, files);

		}
	}
	return files;
}

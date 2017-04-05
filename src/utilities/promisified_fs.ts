import fs = require("fs");
import path = require("path");
import bluebird = require("bluebird");
import minimatch = require("minimatch");

export let readdir = bluebird.promisify<string[], string | Buffer>(fs.readdir);
export let stat = bluebird.promisify<fs.Stats, string | Buffer>(fs.stat);

export function mkdir(file: string | Buffer): Promise<any> {
	return new Promise<any>((resolve, reject) => {
		fs.mkdir(file, (err) => {
			if (err) {
				reject(err);
				return;
			}
			resolve();
		});
	});
}

export function rmdir(file: string | Buffer): Promise<any> {
	return new Promise<any>((resolve, reject) => {
		fs.rmdir(file, (err) => {
			if (err) {
				reject(err);
				return;
			}
			resolve();
		});
	});
}

export function exists(file: string | Buffer): Promise<boolean> {
	return new Promise<boolean>((resolve, reject) => {
		fs.exists(file, (exists_) => {
			resolve(exists_);
		});
	});
}

export let readFile = bluebird.promisify<string, string, string>(fs.readFile);

export function writeFile(filename: string, encoding: string, data: any): Promise<boolean> {
	return new Promise<boolean>((resolve, reject) => {
		fs.writeFile(filename, data, { encoding }, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve(true);
			}
		});
	});
}

export let mkdtemp = bluebird.promisify<string, string>(fs.mkdtemp);
export let unlink = bluebird.promisify<void, string>(fs.unlink);

export function normalize_path(filepath: string): string {
	if (process.platform === "win32") {
		return filepath.split(/\/|\\/).join("\\");
	} else {
		return filepath.split(/\/|\\/).join("/");
	}
}

function path_join(base: string, file_path: string) {
	let nbase = normalize_path(base);
	let nfp = normalize_path(file_path);
	if (nbase.endsWith("/") || nbase.endsWith("\\")) {
		return nbase + nfp;
	} else {
		return nbase + normalize_path("/") + nfp;
	}
}

export async function find_all_files(base_path: string, level?: number): Promise<string[]> {
	let all_files: string[] = [];
	let items = await readdir(base_path);

	for (let item of items) {
		let full_path = path_join(base_path, item);
		let stat_ = await stat(full_path);
		if (stat_.isDirectory()) {
			if (level < 4 || !level) {
				let files = await find_all_files(full_path, (level || 0) + 1);
				all_files = all_files.concat(files);
			}
		} else {
			all_files.push(full_path);
		}

	}
	return all_files;
}

export async function filter_glob(pattern: string, files: string[]): Promise<string[]> {
	let retfiles = files.filter((v, i, a) => {
		return !minimatch.filter(normalize_path(pattern), { dot: true })(normalize_path(v), i, a);
	});
	return retfiles;
}

// http://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable
export function human_file_size(bytes: number, si?: boolean): string {
	let thresh = si ? 1000 : 1024;
	if (Math.abs(bytes) < thresh) {
		return bytes + " B";
	}
	let units = si
		? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
		: ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
	let u = -1;
	do {
		bytes /= thresh;
		++u;
	} while (Math.abs(bytes) >= thresh && u < units.length - 1);
	return bytes.toFixed(1) + " " + units[u];
}

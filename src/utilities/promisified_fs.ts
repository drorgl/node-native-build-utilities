import fs = require("fs");
import glob = require("glob");
import minimatch = require("minimatch");
import path = require("path");

export interface WriteStream extends fs.WriteStream {

}

export let createWriteStream = fs.createWriteStream;

export async function readdir(path_: string | Buffer): Promise<string[]> {
	return new Promise<string[]>((resolve, reject) => {
		fs.readdir(path_, (err, files) => {
			if (err) {
				reject(err);
			} else {
				resolve(files);
			}
		});
	});
}

export async function stat(path_: string | Buffer): Promise<fs.Stats> {
	return new Promise<any>((resolve, reject) => {
		fs.stat(path_, (err, stats) => {
			if (err) {
				reject(err);
			} else {
				resolve(stats);
			}
		});
	});
}

export async function mkdir(file: string | Buffer): Promise<any> {
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

export async function rmdir(file: string | Buffer): Promise<any> {
	return new Promise<any>((resolve, reject) => {
		fs.rmdir(file, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

export async function exists(file: string | Buffer): Promise<boolean> {
	return new Promise<boolean>((resolve, reject) => {
		fs.exists(file, (exists_) => {
			resolve(exists_);
		});
	});
}

export async function readFile(filename: string, encoding: string | null): Promise<string | Buffer> {
	return new Promise<any>((resolve, reject) => {
		fs.readFile(filename, encoding, (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
}

export async function writeFile(filename: string, encoding: string, data: any): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		fs.writeFile(filename, data, { encoding }, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

export async function mkdtemp(prefix: string): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		fs.mkdtemp(prefix, (err, folder) => {
			if (err) {
				reject(err);
			} else {
				resolve(folder);
			}
		});
	});
}

export async function unlink(path_: string | Buffer): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		fs.unlink(path_, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

export function normalize_path(filepath: string): string {
	if (process.platform === "win32") {
		return filepath.split(/\/|\\/).join("\\");
	} else {
		return filepath.split(/\/|\\/).join("/");
	}
}

function path_join(base: string, file_path: string): string {
	const nbase = normalize_path(base);
	const nfp = normalize_path(file_path);
	if (nbase.endsWith("/") || nbase.endsWith("\\")) {
		return nbase + nfp;
	} else {
		return nbase + normalize_path("/") + nfp;
	}
}

export async function find_all_files(base_path: string, level?: number): Promise<string[]> {
	let all_files: string[] = [];
	const items = await readdir(base_path);

	for (const item of items) {
		const full_path = path_join(base_path, item);
		const stat_ = await stat(full_path);
		if (stat_.isDirectory()) {
			if (level < 10 || !level) {
				const files = await find_all_files(full_path, (level || 0) + 1);
				all_files = all_files.concat(files);
			}
		} else {
			all_files.push(full_path);
		}

	}
	return all_files;
}

export async function filter_glob(pattern: string, files: string[]): Promise<string[]> {
	const retfiles = files.filter((v, i, a) => {
		return !minimatch.filter(path.normalize(normalize_path(pattern)), { dot: true })(path.normalize(normalize_path(v)), i, a);
	});
	return retfiles;
}

// http://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable
export function human_file_size(bytes: number, si?: boolean): string {
	const thresh = si ? 1000 : 1024;
	if (Math.abs(bytes) < thresh) {
		return bytes + " B";
	}
	const units = si
		? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
		: ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
	let u = -1;
	do {
		bytes /= thresh;
		++u;
	} while (Math.abs(bytes) >= thresh && u < units.length - 1);
	return bytes.toFixed(1) + " " + units[u];
}

export async function list_folder_by_pattern(pattern: string): Promise<string[]> {
	return new Promise<string[]>((resolve, reject) => {
		glob(pattern, {}, (er, files) => {
			if (er) {
				reject(er);
				return;
			}
			resolve(files);
		});
	});
}

export async function list_folder(patterns: string[]): Promise<string[]> {
	let files: string[] = [];
	for (const pattern of patterns) {
		files = files.concat(await list_folder_by_pattern(pattern));
	}
	return files;
}

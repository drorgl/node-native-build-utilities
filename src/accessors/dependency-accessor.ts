import * as downloadAccessor from "./download-accessor";
import os = require("os");
import path = require("path");

// allow parameter --disable-cache
let cache_dir = process.env.NNBU_CACHE || path.join(os.homedir(), ".nnbu");

function get_dependency(dependency_url: string) {
	// retrieve dependency from cache or download
}

// specific dependency/all
function clear_cache(dependency_url?: string) {
	// remove dependency from cache or delete all if no url specified
}

export async function cancel(package_url: string): Promise<boolean> {
	return await downloadAccessor.cancel(package_url);
}

export async function get_package_size(package_url: string): Promise<number> {
	return await downloadAccessor.download_size(package_url);
}

export async function get_package(package_url: string, filename: string): Promise<boolean> {
	return await downloadAccessor.download(package_url, filename, true);
}

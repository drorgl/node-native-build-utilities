import { request_get } from "../accessors/download-accessor";
import * as merger from "./object_utilities";
import * as pfs from "./promisified_fs";
import path = require("path");

const iojs_releases_url = "https://iojs.org/download/release/index.json";
const node_releases_url = "https://nodejs.org/download/release/index.json";

const abi_filename = path.join(__dirname, "abi.json");
let _node_versions: INodeVersion[] = null;

interface INodeVersion {
	version: string; // v7.9.0
	date: string; // 2017-04-11
	files: string[]; // ["aix-ppc64", "headers", "linux-arm64", "linux-armv6l", "linux-armv7l", "linux-ppc64le", "linux-x64", "linux-x86", "osx-x64-pkg", "osx-x64-tar", "src", "sunos-x64", "sunos-x86", "win-x64-exe", "win-x64-msi", "win-x86-exe", "win-x86-msi"],
	npm: string; // 4.2.0
	v8: string; // 5.5.372.43
	uv: string; // 1.11.0
	zlib: string; // 1.2.11
	openssl: string; // 1.0.2k
	modules: string; // 51
	lts: boolean; // false
}

function sort_function(a: INodeVersion, b: INodeVersion): number {
	// compare versions
	// let i, diff;
	let segmentsA = a.version.substr(1).split(".");
	let segmentsB = b.version.substr(1).split(".");
	let l = Math.min(segmentsA.length, segmentsB.length);

	for (let i = 0; i < l; i++) {
		let diff = parseInt(segmentsB[i], 10) - parseInt(segmentsA[i], 10);
		if (diff) {
			return diff;
		}
	}
	if (segmentsA.length - segmentsB.length !== 0) {
		return segmentsA.length - segmentsB.length;
	}

	// compare module
	return parseInt(b.modules || "0") - parseInt(a.modules || "0");
}

export async function get_remote_node_versions(): Promise<INodeVersion[]> {
	let iojs_releases: INodeVersion[] = JSON.parse((await request_get(iojs_releases_url)).toString("utf8"));
	let node_releases: INodeVersion[] = JSON.parse((await request_get(node_releases_url)).toString("utf8"));

	let versions = merger.merge(iojs_releases, node_releases);
	versions.sort(sort_function);
	return versions;
}

export async function get_node_versions(use_fresh?: boolean): Promise<INodeVersion[]> {
	if (!use_fresh) {
		if (_node_versions) {
			return _node_versions;
		}

		if (await pfs.exists(abi_filename)) {
			_node_versions = JSON.parse(await pfs.readFile(abi_filename, "utf8"));
		}
	}

	try {
		_node_versions = await get_remote_node_versions();
		await pfs.writeFile(abi_filename, "utf8", JSON.stringify(_node_versions, null, "\t"));
		return _node_versions;
	} catch (e) {
		console.error("unable to update abi file", e, abi_filename);
	}
}

export interface IFullConfig {
	version: string; // node version v7.9.0
	modules: string; // abi module number 51
	arch: string; // architecture x64
	platform: string; // platform win32
}

export async function get_node_version(version: string): Promise<IFullConfig> {
	let node_versions = await get_node_versions();
	let abi_version = node_versions.find((i) => i.version === version);
	if (abi_version && abi_version.modules) {
		return {
			version: process.version,
			arch: process.arch,
			platform: process.platform,
			modules: abi_version.modules
		};
	}
}

export async function get_current_node_version(): Promise<IFullConfig> {
	if (process && process.versions && process.versions.modules) {
		return {
			version: process.version,
			modules: process.versions.modules,
			arch: process.arch,
			platform: process.platform
		};
	}

	if (process && process.config && process.config.variables && (process.config.variables as any).node_module_version) {
		return {
			version: process.version,
			modules: (process.config.variables as any).node_module_version,
			arch: process.arch,
			platform: process.platform
		};
	}

	return get_node_version(process.version);
}

// process
//   version: 'v6.5.0',
//   versions:
//     { http_parser: '2.7.0',
//         node: '6.5.0',
//         v8: '5.1.281.81',
//         uv: '1.9.1',
//         zlib: '1.2.8',
//         ares: '1.10.1-DEV',
//         icu: '57.1',
//         modules: '48',
//         openssl: '1.0.2h' },
// arch: 'x64',
// platform: 'win32',
//  config:
//   { target_defaults:
//      { cflags: [],
//        default_configuration: 'Release',
//        defines: [],
//        include_dirs: [],
//        libraries: [] },
//     variables:
//      { asan: 0,
//        debug_devtools: 'node',
//        force_dynamic_crt: 0,
//        host_arch: 'x64',
//        icu_data_file: 'icudt57l.dat',
//        icu_data_in: '..\\..\\deps/icu-small\\source/data/in\\icudt57l.dat',
//        icu_endianness: 'l',
//        icu_gyp_path: 'tools/icu/icu-generic.gyp',
//        icu_locales: 'en,root',
//        icu_path: 'deps/icu-small',
//        icu_small: true,
//        icu_ver_major: '57',
//        node_byteorder: 'little',
//        node_enable_d8: false,
//        node_enable_v8_vtunejit: false,
//        node_install_npm: true,
//        node_module_version: 48,
//        node_no_browser_globals: false,
//        node_prefix: '/usr/local',
//        node_release_urlbase: '',
//        node_shared: false,
//        node_shared_cares: false,
//        node_shared_http_parser: false,
//        node_shared_libuv: false,
//        node_shared_openssl: false,
//        node_shared_zlib: false,
//        node_tag: '',
//        node_use_bundled_v8: true,
//        node_use_dtrace: false,
//        node_use_etw: true,
//        node_use_lttng: false,
//        node_use_openssl: true,
//        node_use_perfctr: true,
//        node_use_v8_platform: true,
//        openssl_fips: '',
//        openssl_no_asm: 0,
//        shlib_suffix: 'so.48',
//        target_arch: 'x64',
//        v8_enable_gdbjit: 0,
//        v8_enable_i18n_support: 1,
//        v8_inspector: true,
//        v8_no_strict_aliasing: 1,
//        v8_optimized_debug: 0,
//        v8_random_seed: 0,
//        v8_use_snapshot: true,
//        want_separate_host_toolset: 0 } },

#!/usr/bin/env node

import program = require("commander");
import { node_package, parse_repository } from "./accessors/package-accessor";
import * as archive from "./utilities/archive";
import * as logger from "./utilities/logger";
import * as pfs from "./utilities/promisified_fs";
import path = require("path");
import os = require("os");
import * as buildAccessor from "./accessors/build-accessor";
import * as gitAccessor from "./accessors/git-accessor";

import * as githubAccessor from "./accessors/github-accessor";
import * as nativeGyp from "./accessors/native-gyp-accessor";
import * as packageAccessor from "./accessors/package-accessor";
import * as abiReleases from "./utilities/abi_releases";

// pack binary
// pack sources
// ignore what's .gitignore
// ignore node_modules

program
	.version(node_package.version)
	.option("-s, --pack-sources [filename]", "pack sources")
	.option("-b, --pack-binaries", "pack binaries", [])
	.parse(process.argv);

// console.log(program);

async function upload_asset(tag_version: string, zipfile: string): Promise<boolean> {
	const repoinfo = parse_repository();

	const gh = new githubAccessor.GitHubAccessor();
	if ((await gh.authenticate())) {
		console.log("looking for releases", repoinfo.username, repoinfo.repo, tag_version);
		let releases = (await gh.get_releases_by_tag(repoinfo.username, repoinfo.repo, tag_version)).data;
		const release = releases as githubAccessor.IRelease;
		console.log("found", release.id, release.name, release.tag_name, "assets:", release.assets.length);
		if (!releases) {
			releases = await gh.create_release(repoinfo.username, repoinfo.repo, tag_version, tag_version, false);
		}
		console.log("uploading asset");
		try {
			console.log("should upload: ", repoinfo.username, repoinfo.repo, (releases as githubAccessor.IRelease).id.toString(), zipfile, path.basename(zipfile), path.basename(zipfile));
			const result = await gh.upload_release_asset(repoinfo.username, repoinfo.repo, (releases as githubAccessor.IRelease).id.toString(), zipfile, path.basename(zipfile), path.basename(zipfile));
			if (result && (result.data as githubAccessor.IAsset).id) {
				console.log("successfully uploaded", (result.data as githubAccessor.IAsset).id);
				return true;
			} else {
				console.log("failed to upload asset");
				return false;
			}
		} catch (e) {
			const err = e as githubAccessor.IError;
			console.error("problem uploading asset", (JSON.parse(err.message) as githubAccessor.IErrorMessage).errors.map((v) => v.code).join(", "));
			return false;
		}
	} else {
		console.log("unable to authenticate github");
		return false;
	}
}

(async () => {
	try {
		if (program["packSources"]) {
			console.log("packing");
			logger.debug("pack sources", program["packSources"]);

			const tag_version = await gitAccessor.git_get_last_tag(process.cwd());
			if (!tag_version) {
				console.error("unable to pack source for", node_package.name, "no git tags were found");
				return;
			}

			const filename = `${node_package.name}.${tag_version}.7z`;

			const zipfolder = path.join(os.tmpdir(), await archive.generate_random(8));
			if (!await pfs.exists(zipfolder)) {
				await pfs.mkdir(zipfolder);
			}

			const zipfile = path.join(zipfolder, filename);
			if ((await pfs.exists(zipfile))) {
				await pfs.unlink(zipfile);
			}

			const files = await archive.parse_folder("./");
			console.log("compressing ", files.length, "files", zipfile);

			await archive.addFull(zipfile, files);

			await upload_asset(tag_version, zipfile);

			await pfs.unlink(zipfile);
			pfs.rmdir(zipfolder);
		}

		if (program["packBinaries"]) {
			// get filename by modules/types/architecture/platform
			// find the filenames needed to be packed through configuration in package.json
			// 7z the files
			// upload to github/releases

			console.log("packing");
			logger.debug("pack binaries", program["packBinaries"]);

			const tag_version = await gitAccessor.git_get_last_tag(process.cwd());
			if (!tag_version) {
				console.error("unable to pack binaries for", node_package.name, "no git tags were found");
				return;
			}

			const current_native_gyp = await nativeGyp.read();
			const version_info = await abiReleases.get_current_node_version();

			if (!current_native_gyp.binary) {
				console.error("unable to pack a module without native_gyp.json binary section");
				return;
			}

			if (!current_native_gyp.binary.module_paths || current_native_gyp.binary.module_paths.length === 0) {
				console.error("unable to pack a module without native_gyp.json binary module paths");
				return;
			}

			const files = await pfs.list_folder(current_native_gyp.binary.module_paths);

			if (files.length === 0) {
				console.error("no files were found to pack", current_native_gyp.binary.module_paths);
				return;
			}

			const filename = buildAccessor.get_module_package_name(current_native_gyp.binary, {
				module_name: (current_native_gyp.binary && current_native_gyp.binary.module_name) ? current_native_gyp.binary.module_name : packageAccessor.node_package.name,
				version: packageAccessor.node_package.version,
				node_abi: version_info.modules,
				platform: version_info.platform,
				arch: version_info.arch
			});

			const zipfolder = path.join(os.tmpdir(), await archive.generate_random(8));
			if (!await pfs.exists(zipfolder)) {
				await pfs.mkdir(zipfolder);
			}

			const zipfile = path.join(zipfolder, filename);
			if ((await pfs.exists(zipfile))) {
				await pfs.unlink(zipfile);
			}

			console.log("compressing ", files.length, "files", zipfile);

			await archive.addFull(zipfile, files);

			await upload_asset(tag_version, zipfile);

			await pfs.unlink(zipfile);
			pfs.rmdir(zipfolder);

		}
	} catch (e) {
		console.log("error", e);
	}
})();

#!/usr/bin/env node

import program = require("commander");
import { node_package } from "./accessors/package-accessor";
import * as archive from "./utilities/archive";
import * as logger from "./utilities/logger";
import * as pfs from "./utilities/promisified_fs";
import path = require("path");
import os = require("os");
import * as gitAccessor from "./accessors/git-accessor";

import * as githubAccessor from "./accessors/github-accessor";

// pack binary
// pack sources
// ignore what's .gitignore
// ignore node_modules

program
	.version(node_package.version)
	.option("-s, --pack-sources [filename]", "pack sources")
	.option("-b, --pack-binaries [filename]", "pack binaries", [])
	.parse(process.argv);

console.log(program);

(async () => {
	try {
		if (program["packSources"]) {
			console.log("pack");
			logger.debug("pack sources", program["packSources"]);

			let tag_version = await gitAccessor.git_get_last_tag(process.cwd());

			if (!tag_version) {
				console.error("unable to pack source for", node_package.name, "no git tags were found");
				return;
			}

			let filename = `${node_package.name}.${tag_version}.7z`;

			let zipfile = path.join(os.tmpdir(), filename);
			if ((await pfs.exists(zipfile))) {
				await pfs.unlink(zipfile);
			}

			let files = await archive.parse_folder("./");
			console.log("compressing ", files.length, "files", zipfile);

			await archive.addFull(zipfile, files);

			let gh = new githubAccessor.GitHubAccessor();
			if ((await gh.authenticate())) {
				console.log("looking for releases");
				let releases = (await gh.get_releases_by_tag("drorgl", "zlib.module", "v1.2.8")).data;
				let release = releases as githubAccessor.IRelease;
				console.log("found", release.id, release.name, release.tag_name, "assets:", release.assets.length);
				if (!releases) {
					releases = await gh.create_release("drorgl", "zlib.module", "v1.2.8", "v1.2.8", false);
				}
				console.log("uploading asset");
				try {
					let result = await gh.upload_release_asset("drorgl", "zlib.module", (releases as githubAccessor.IRelease).id.toString(), zipfile, path.basename(zipfile), path.basename(zipfile));
					console.log(result);
					if (result && (result.data as githubAccessor.IAsset).id) {
						console.log("successfully uploaded", (result.data as githubAccessor.IAsset).id);
					} else {
						console.log("failed to upload asset");
					}
				} catch (e) {
					let err = e as githubAccessor.IError;
					console.error("problem uploading asset", (JSON.parse( err.message)as githubAccessor.IErrorMessage).errors.map((v) => v.code).join(", "));
				}
			} else {
				console.log("unable to authenticate github");
			}

			await pfs.unlink(zipfile);
		}
	} catch (e) {
		console.log("error", e);
	}
})();

#!/usr/bin/env node

// publish to github
import program = require("commander");
import { GitHubAccessor, IAsset } from "./accessors/github-accessor";
import { node_package } from "./accessors/package-accessor";
import * as logger from "./utilities/logger";

let github_accessor = new GitHubAccessor();

program
	.version(node_package.version)
	.option("-a, --list-assets [asset]", "list assets in user/repo/tag/asset format")
	.option("-d, --download [asset]", "download asset in user/repo/tag/asset format", [])
	.option("-r, --list-releases [release]", "list releases in user/repo format")
	.option("-u, --upload-asset [asset] [filename]", "upload asset in user/repo/tag format")
	.parse(process.argv);

(async () => {
	// console.log(program);

	if (program["listAssets"]) {
		logger.debug("list assets", program["listAssets"]);
		let parameters = program["listAssets"].split("/");
		let owner = parameters[0];
		let repo = parameters[1];
		let tag = (parameters.length > 1) ? parameters[2] : null;
		let releases = await github_accessor.get_releases(owner, repo);
		let filtered_assets = releases.filter((v) => (tag) ? v.tag_name === tag : true).map((v) => v.assets);
		let merged = [].concat.apply([], filtered_assets).map((v: IAsset) => {
			return {
				name: v.name,
				size: v.size,
				url: v.url
			};
		});
		logger.debug(merged);
	}

	if (program["download"] && program["download"].length) {
		logger.debug("download", program["download"]);
		let parameters = program["download"].split("/");
		let owner = parameters[0];
		let repo = parameters[1];
		let tag = parameters[2];
		let filename = parameters[3];

		let releases = await github_accessor.get_releases(owner, repo);
		let filtered_assets = releases.filter((v) => (tag) ? v.tag_name === tag : true).map((v) => v.assets);
		let asset = [].concat.apply([], filtered_assets).find((v: IAsset) => v.name === filename);
		if (asset) {
			logger.debug("downloading " + asset.url);
		} else {
			logger.error("asset not found");
		}
	}

	if (program["listReleases"]) {
		let parameters = program["listReleases"].split("/");
		let owner = parameters[0];
		let repo = parameters[1];
		let tag = (parameters.length > 1) ? parameters[2] : null;
		let releases = await github_accessor.get_releases(owner, repo);
		let filtered_releases = releases.filter((v) => (tag) ? v.tag_name === tag : true).map((v) => {
			return {
				name: v.name,
				url: v.url
			};
		});
		logger.debug(filtered_releases);
	}
	if (program["uploadAsset"]) {
		logger.debug("upload asset", program["uploadAssets"]);
	}
})();

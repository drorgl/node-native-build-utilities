#!/usr/bin/env node

// publish to github
import program = require("commander");
import * as githubAccessor from "./accessors/github-accessor";
import { node_package } from "./accessors/package-accessor";
import * as logger from "./utilities/logger";

const github_accessor = new githubAccessor.GitHubAccessor();

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
		const parameters = program["listAssets"].split("/");
		const owner = parameters[0];
		const repo = parameters[1];
		const tag = (parameters.length > 1) ? parameters[2] : null;
		const releases = await github_accessor.get_releases(owner, repo);
		const filtered_assets = (releases.data as githubAccessor.IRelease[]) .filter((v) => (tag) ? v.tag_name === tag : true).map((v) => v.assets);
		const merged = [].concat.apply([], filtered_assets).map((v: githubAccessor.IAsset) => {
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
		const parameters = program["download"].split("/");
		const owner = parameters[0];
		const repo = parameters[1];
		const tag = parameters[2];
		const filename = parameters[3];

		const releases = await github_accessor.get_releases(owner, repo);
		const filtered_assets = (releases.data as githubAccessor.IRelease[]).filter((v) => (tag) ? v.tag_name === tag : true).map((v) => v.assets);
		const asset = [].concat.apply([], filtered_assets).find((v: githubAccessor.IAsset) => v.name === filename);
		if (asset) {
			logger.debug("downloading " + asset.url);
		} else {
			logger.error("asset not found");
		}
	}

	if (program["listReleases"]) {
		const parameters = program["listReleases"].split("/");
		const owner = parameters[0];
		const repo = parameters[1];
		const tag = (parameters.length > 1) ? parameters[2] : null;
		const releases = await github_accessor.get_releases(owner, repo);
		const filtered_releases = (releases.data as githubAccessor.IRelease[]).filter((v) => (tag) ? v.tag_name === tag : true).map((v) => {
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

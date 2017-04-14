import * as abiReleases from "./utilities/abi_releases";

(async () => {
	console.log("retrieving list of node versions");
	let ver = await abiReleases.get_node_versions(true);
	if (ver) {
		console.log("saved successfully");
	}
})();

#!/usr/bin/env node

import program = require("commander");
import { node_package } from "./accessors/package-accessor";
import * as archive from "./utilities/archive";
import * as logger from "./utilities/logger";

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

			let files = await archive.parse_folder("./");
			console.log("compressing ", files.length, "bla.zip");
			await archive.addFull("bla.7z", files);

		}
	} catch (e) {
		console.log("error", e);
	}
})();

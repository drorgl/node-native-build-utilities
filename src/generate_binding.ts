#!/usr/bin/env node

import fs = require("fs");

(async () => {
	if (process.argv.length > 1) {
		const binding = {
			includes: process.argv.slice(2)
		};

		fs.writeFileSync("binding.gyp", JSON.stringify(binding));
	}
})();

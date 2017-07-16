#!/usr/bin/env node
import * as nativeConfiguration from "./accessors/native-configuration-accessor";

(async () => {
	try {
		const native_configuration: nativeConfiguration.INativeConfiguration = await nativeConfiguration.load(nativeConfiguration.NATIVE_CONFIGURATION_FILE);
		console.log(process.argv.slice(2).join(" "));
	} catch (e) {
		console.log("");
	}
})();

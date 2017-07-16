import * as pfs from "../src/utilities/promisified_fs";
import tape = require("tape");
import chalk = require("chalk");

import * as npm_package_arg from "../src/accessors/npm-package-arg";
import * as package_accessor from "../src/accessors/package-accessor";

const errorColor = chalk.red.bold;
const okColor = chalk.green.bold;
let level = 0;

function tablevel() {
	let retval = "";
	for (let i = 0; i < level; i++) {
		retval += "\t";
	}
	return retval;
}

const results = {
	passed: 0,
	failed: 0
};

const tapestream = tape.createStream({ objectMode: true });

interface ITapeRow {
	type: string;
	name: string;
	id: string;
	ok: boolean;
	skip: boolean;
	objectPrintDepth: number;
	error: any;
	functionName: string;
	file: string;
	line: number;
	column: string;
	at: string;
	test: number;
	operator: string;
	actual: any;
	expected: any;
}

tapestream.on("data", (row: ITapeRow) => {
	if (typeof row === typeof "") {
		console.log(tablevel() + row);
	} else if (row.type === "end") {
		console.log();
		level--;
	} else if (row.type === "test") {
		level++;
		console.log();
		console.log(tablevel() + "%d. Testing %s", row.id, row.name);
	} else {
		if (row.ok) {
			results.passed++;
			console.log(tablevel() + okColor("%d. \t %s \t %s"), row.id, row.ok, row.name);
			if (row.operator === "throws" && row.actual !== undefined) {
				console.log(tablevel() + okColor(" threw: %s"), row.actual);
			}
		} else {
			results.failed++;
			console.log(tablevel() + errorColor("%d. \t %s \t %s"), row.id, row.ok, row.name);
			console.log(tablevel() + errorColor("\t expected: %s actual: %s"), row.expected, row.actual);
		}
	}
	// console.log(JSON.stringify(row))
});

tapestream.on("end", () => {
	console.log("passed:", results.passed);
	console.log("failed:", results.failed);
});

tape("glob filter", async (t) => {
	const files = [
		".git",
		".hello",
		"hello.world",
		"./.git",
		"./.hello",
		"./hello.world",
		"./hello/world.txt",
		"hello/world.txt",
		"./.git/test1.txt",
		".git/test2.txt",
		".gitignore"
	];

	t.deepEqual(await pfs.filter_glob("./.git/**", files), [
		".git",
		".hello",
		"hello.world",
		"./.git",
		"./.hello",
		"./hello.world",
		"./hello/world.txt",
		"hello/world.txt",
		".gitignore"
	]);

	t.deepEqual(await pfs.filter_glob("./.git", files), [
		".hello",
		"hello.world",
		"./.hello",
		"./hello.world",
		"./hello/world.txt",
		"hello/world.txt",
		"./.git/test1.txt",
		".git/test2.txt",
		".gitignore"
	]);
	t.end();
});

tape("parse repository", (t) => {
	const npa_value = npm_package_arg.npa("https://github.com/drorgl/node-alvision.git");
	t.equal(npa_value.hosted.shortcut(), "github:drorgl/node-alvision");

	const parsed = package_accessor.parse_shortcut(npa_value.hosted.shortcut());
	t.deepEqual( parsed, {host_type: "github", username: "drorgl", repo: "node-alvision"});

	t.end();
});

import * as pfs from "../src/utilities/promisified_fs";
import tape = require("tape");
import chalk = require("chalk");

let errorColor = chalk.red.bold;
let okColor = chalk.green.bold;
let level = 0;

function tablevel() {
	let retval = "";
	for (let i = 0; i < level; i++) {
		retval += "\t";
	}
	return retval;
}

let results = {
	passed: 0,
	failed: 0
};

let tapestream = tape.createStream({ objectMode: true });

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
	}
	else if (row.type === "end") {
		console.log();
		level--;
	}
	else if (row.type === "test") {
		level++;
		console.log();
		console.log(tablevel() + "%d. Testing %s", row.id, row.name);
	}
	else {
		if (row.ok) {
			results.passed++;
			console.log(tablevel() + okColor("%d. \t %s \t %s"), row.id, row.ok, row.name);
			if (row.operator === "throws" && row.actual !== undefined) {
				console.log(tablevel() + okColor(" threw: %s"), row.actual);
			}
		}
		else {
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
	let files = [
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



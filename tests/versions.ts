import * as ver from "../src/utilities/version";
import tape = require("tape");
import chalk = require("chalk");

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

const simple_versions = [
	"1.2.3.",
	"2.32.",
	"54.6.10",
	"1.10.",
	"2.32.",
	"0.8.",
	"0.8.",
	"1.2.4",
	"1.10.",
	"1.1.",
	"1.1.",
	"1.4.",
	"1.3.9.2011082",
	"1.10.",
	"2.32.",
	"4.7.10",
	"0.32.",
	"2.32.",
	"1.1.",
	"0.148.",
	"2.",
	"1.0.",
	"1.30.",
	"3.0.",
	"57.7.10",
	"1.1",
	"1.0.",
	"1.2.",
	"8.1",
	"1.30.",
	"0.23.",
	"1.0.",
	"2.26.",
	"55.61.10",
	"2.32.",
	"1.30.",
	"57.72.10",
	"0.9.",
	"1.1.",
	"7.0.2",
	"2.26.",
	"1.3.",
	"0.4.",
	"0.32.",
	"0.13.",
	"0.",
	"1.8.",
	"2.24.1",
	"0.2.4.",
	"3.2.",
	"0.11.",
	"2.24.1",
	"6.84.10",
	"1.1.1",
	"57.92.10",
	"1.7.1.90",
	"1.6.",
	"1.3.",
	"1.10.",
	"5.",
	"0.4.",
	"1.8.",
	"0.1.",
	"1.8.",
	"1.30.",
	"1.3.",
	"2.32.",
	"1.2.",
	"3.3",
	"1.4.99.",
	"1.1.",
	"1.10.",
	"00",
	"1.0.",
	"0.4.",
	"0.30.",
	"2.24.1",
	"0.4.",
	"1.10.",
	"0.8.",
	"7.3.",
	"2.",
	"2.32.",
	"1.3.",
	"3.4.",
	"2011051",
	"1.2.4",
	"2.32.",
	"1.10.",
	"2.8.",
	"0.32.",
	"1.10.",
	"0.1.",
	"8.1",
	"3.4.",
	"1.30.",
	"1.10.",
	"1.0.",
	"1.10.",
	"2.",
	"2.2.",
	"1.10.",
	"1.2.",
	"2.4.",
	"1.1.",
	"1.1.",
	"0.32.",
	"1.3.",
	"1.2.",
	"1.10.",
	"1.",
	"1.3.",
	"1.8.",
	"2.24.1",
	"8.1",
	"1.2.",
	"1.1.",
	"1.4.",
	"2.8.10",
	"14.0.",
	"0.19.",
	"5.",
	"1.8.",
	"0.32.",
	"2.24.1",
	"1.1",
	"17",
	"v1.2.3.4",
	"v2.32.4",
	"v54.6.100",
	"v1.10.2",
	"v2.32.4",
	"v0.8.6",
	"v0.8.6",
	"v1.2.46",
	"v1.10.2",
	"v1.1.1",
	"v1.1.4",
	"v1.4.0",
	"v1.3.9.20110827",
	"v1.10.2",
	"v2.32.4",
	"v4.7.100",
	"v0.32.0",
	"v2.32.4",
	"v1.1.0",
	"v0.148.x",
	"v2.3",
	"v1.0.6",
	"v1.30.0",
	"v3.0.1",
	"v57.7.100",
	"v1.13",
	"v1.0.0",
	"v1.2.0",
	"v8.12",
	"v1.30.0",
	"v0.23.0",
	"v1.0.7",
	"v2.26.1",
	"v55.61.100",
	"v2.32.4",
	"v1.30.0",
	"v57.72.100",
	"v0.9.6",
	"v1.1.1",
	"v7.0.22",
	"v2.26.1",
	"v1.3.0",
	"v0.4.1",
	"v0.32.0",
	"v0.13.6",
	"v0.3",
	"v1.8.1",
	"v2.24.10",
	"v0.2.4.1",
	"v3.2.0",
	"v0.11.1",
	"v2.24.10",
	"v6.84.101",
	"v1.1.12",
	"v57.92.100",
	"v1.7.1.901",
	"v1.6.1",
	"v1.3.2",
	"v1.10.2",
	"v5.0",
	"v0.4.3",
	"v1.8.1",
	"v0.1.5",
	"v1.8.1",
	"v1.30.0",
	"v1.3.2",
	"v2.32.4",
	"v1.2.1",
	"v3.31",
	"v1.4.99.1",
	"v1.1.3",
	"v1.10.2",
	"v005",
	"v1.0.5",
	"v0.4.2",
	"v0.30.2",
	"v2.24.10",
	"v0.4.2",
	"v1.10.2",
	"v0.8.6",
	"v7.3.0",
	"v2.3",
	"v2.32.4",
	"v1.3.2",
	"v3.4.1",
	"v20110511",
	"v1.2.46",
	"v2.32.4",
	"v1.10.2",
	"v2.8.0",
	"v0.32.0",
	"v1.10.2",
	"v0.1.1",
	"v8.12",
	"v3.4.0",
	"v1.30.0",
	"v1.10.2",
	"v1.0.4",
	"v1.10.2",
	"v2.5",
	"v2.2.0",
	"v1.10.2",
	"v1.2.0",
	"v2.4.0",
	"v1.1.1",
	"v1.1.1",
	"v0.32.0",
	"v1.3.2",
	"v1.2.1",
	"v1.10.2",
	"v1.0",
	"v1.3.2",
	"v1.8.1",
	"v2.24.10",
	"v8.12",
	"v1.2.6",
	"v1.1.1",
	"v1.4.1",
	"v2.8.100",
	"v14.0.8",
	"v0.19.2",
	"v5.0",
	"v1.8.1",
	"v0.32.0",
	"v2.24.10",
	"v1.10",
	"v175",
	"3.2.5-3",
	"2014.10.15-alpha.1",
	"2014.10.15-alpha",
	"2014.10.15-beta.1",
	"10.100.1-beta.61",
	"10.100.1-beta.51",
	"9.178.1350-beta.66.0.183.99999",
	"9.178.1350-beta.66.0.183.99999"
];

tape("version parsing", async (t) => {
	for (const version of simple_versions.sort()) {
		let parsed_version: string = "*bad parsing*";
		try {
			parsed_version = ver.parse(ver.normalize_version(version)).format();
		} catch (e) {
			// nop
		}

		t.doesNotThrow(() => {
			t.ok(ver.parse(ver.normalize_version(version)), "parsed successfully " + version + " should be " + parsed_version);
		}, "does not throw " + version + " should be " + parsed_version);
	}
	t.end();
});

tape("version compare", async (t) => {
	const versions = [
		["1.0.0", "<=1.0.1"],
		["2.0.1", "<=2.10.0"],
		["24.3.6", "<=35.2.5"],
		["5.2.5-3", "<=5.2.5-13"],
		["2014.10.15-alpha.1", "<=2014.10.15-beta.1", ],
		["2014.10.15-alpha", "<=2014.10.15-alpha.2"],
		["10.100.1-beta.51", "<=10.100.1-beta.61"],
		["0.0.0", "<=0.0.0"],
		["9.178.1350-beta.66.0.183.99999", "<=9.178.1350-beta.66.0.183.99999"]
	];

	for (const version_parts of versions) {
		t.ok(ver.satisfies(version_parts[0], version_parts[1]), version_parts[0] + " <= " + version_parts[1]);
	}

	t.end();
});

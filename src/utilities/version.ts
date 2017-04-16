import semver = require("semver");

const v_version_regex = /v(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?/;
const version_regex = /(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:\.(\d+))?/;

function isNumber(str: string) {
	if (typeof str !== "string") { return false; }// we only process strings!
	// could also coerce to string: str = ""+str
	return !isNaN(str as any as number) && !isNaN(parseFloat(str));
}

function normalize_version_part(part: string): string {
	if (isNumber(part)) {
		return parseInt(part).toString();
	}

	part = (part || "").trim();
	if (part.length === 0) {
		return "0";
	}

	return part;
}

export function normalize_version(ver: string): string {
	if (v_version_regex.test(ver)) {
		return v_version_regex.exec(ver).slice(1, 4).map((v) => normalize_version_part(v)).join(".");
	} else if (version_regex.test(ver)) {
		return version_regex.exec(ver).slice(1, 4).map((v) => normalize_version_part(v)).join(".");
	} else {
		return ver;
	}
}

export function parse(ver: string): semver.SemVer {
	return new semver.SemVer(ver);
}

export function satisfies(ver: string, range: string) {
	return semver.satisfies(ver, range);
}

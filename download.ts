import * as ProgressBar from "progress";
import url = require("url");
import fs = require("fs");
import https = require("https");
import http = require("http");

// console.log(process.argv);

if (process.argv.length < 4) {
	console.log("usage:");
	console.log("  download <url> <filename>");
	process.exit(0);
}

const downloadurl = process.argv[2];
const filename = process.argv[3];

const downloadurlsplit = url.parse(downloadurl);

const default_https = 443;
const default_http = 80;

let req: http.ClientRequest = null;

if (downloadurlsplit.protocol === "http:") {
	req = http.request({
		host: downloadurlsplit.host,
		port: (downloadurlsplit.port) ? parseInt(downloadurlsplit.port) : default_http,
		path: downloadurlsplit.path
	});
} else if (downloadurlsplit.protocol === "https:") {
	req = https.request({
		host: downloadurlsplit.host,
		port: (downloadurlsplit.port) ? parseInt(downloadurlsplit.port) : default_https,
		path: downloadurlsplit.path
	});
}

let file = fs.createWriteStream(filename);

req.on("response", (res: http.ClientResponse) => {
	let len = parseInt(res.headers["content-length"], 10);

	console.log();
	let bar = new ProgressBar("  downloading [:bar] :percent :etas", {
		complete: "=",
		incomplete: " ",
		width: 40,
		total: len
	});

	res.on("data", (chunk) => {
		file.write(chunk);
		bar.tick(chunk.length);
	});

	res.on("end", () => {
		file.end();
		console.log("\n");
	});
});

req.end();

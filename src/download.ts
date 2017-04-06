import { cancel, download, download_size } from "./accessors/download-accessor";

// console.log(process.argv);

if (process.argv.length < 4) {
	console.log("usage:");
	console.log("  download <url> <filename> [--size]");
	process.exit(0);
}

const downloadurl = process.argv[2];
const filename = process.argv[3];

const size_only = (process.argv.length > 4 && process.argv[4] === "--size") ? true : false;

process.on("SIGINT", () => {
	console.log("Caught interrupt signal");
	cancel(downloadurl);
});

(async () => {
	if (size_only) {
		console.log("size:", await download_size(downloadurl));
	} else {
		download(downloadurl, filename, true);
	}
})();

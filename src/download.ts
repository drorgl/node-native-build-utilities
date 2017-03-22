import { cancel, download } from "./accessors/download-accessor";

// console.log(process.argv);

if (process.argv.length < 4) {
	console.log("usage:");
	console.log("  download <url> <filename>");
	process.exit(0);
}

const downloadurl = process.argv[2];
const filename = process.argv[3];

process.on("SIGINT", () => {
	console.log("Caught interrupt signal");
	cancel(downloadurl);
});

download(downloadurl, filename, true);

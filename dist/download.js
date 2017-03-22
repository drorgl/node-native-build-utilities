"use strict";
exports.__esModule = true;
var download_accessor_1 = require("./accessors/download-accessor");
// console.log(process.argv);
if (process.argv.length < 4) {
    console.log("usage:");
    console.log("  download <url> <filename>");
    process.exit(0);
}
var downloadurl = process.argv[2];
var filename = process.argv[3];
process.on("SIGINT", function () {
    console.log("Caught interrupt signal");
    download_accessor_1.cancel(downloadurl);
});
download_accessor_1.download(downloadurl, filename, true);
//# sourceMappingURL=download.js.map
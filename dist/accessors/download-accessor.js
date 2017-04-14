"use strict";
exports.__esModule = true;
var ProgressBar = require("progress");
var url = require("url");
var fs = require("fs");
// tslint:disable-next-line:no-var-requires
var http = require("follow-redirects").http;
// tslint:disable-next-line:no-var-requires
var https = require("follow-redirects").https;
var path = require("path");
var logger = require("../utilities/logger");
var _file_streams = {};
process.on("SIGINT", function () {
    logger.error("Caught interrupt signal");
    for (var _i = 0, _a = Object.keys(_file_streams); _i < _a.length; _i++) {
        var file = _a[_i];
        cancel(_file_streams[file].downloadurl);
    }
});
function cancel(downloadurl) {
    var download_item = _file_streams[downloadurl];
    if (download_item) {
        logger.info("cancelling ", download_item);
        download_item.request.abort();
        download_item.request.end();
        download_item.filestream.end();
        fs.unlink(download_item.filename);
        delete _file_streams[downloadurl];
        return true;
    }
    return false;
}
exports.cancel = cancel;
function download_size(downloadurl) {
    return new Promise(function (resolve, reject) {
        var downloadurlsplit = url.parse(downloadurl);
        var default_https = 443;
        var default_http = 80;
        var req = null;
        if (downloadurlsplit.protocol === "http:") {
            req = http.request({
                host: downloadurlsplit.host,
                port: (downloadurlsplit.port) ? parseInt(downloadurlsplit.port) : default_http,
                path: downloadurlsplit.path
            });
        }
        else if (downloadurlsplit.protocol === "https:") {
            req = https.request({
                host: downloadurlsplit.host,
                port: (downloadurlsplit.port) ? parseInt(downloadurlsplit.port) : default_https,
                path: downloadurlsplit.path
            });
        }
        req.on("response", function (res) {
            if (res.statusCode === 404) {
                reject("file not found - " + downloadurl);
                return;
            }
            var len = parseInt(res.headers["content-length"], 10);
            req.abort();
            resolve(len);
        });
        req.end();
    });
}
exports.download_size = download_size;
function download(downloadurl, filename, displayProgress) {
    return new Promise(function (resolve, reject) {
        var filename_only = path.basename(filename);
        _file_streams[downloadurl] = {
            downloadurl: downloadurl,
            filename: filename,
            filestream: null,
            length: -1,
            request: null
        };
        var downloadurlsplit = url.parse(downloadurl);
        var default_https = 443;
        var default_http = 80;
        var req = null;
        if (downloadurlsplit.protocol === "http:") {
            req = http.request({
                host: downloadurlsplit.host,
                port: (downloadurlsplit.port) ? parseInt(downloadurlsplit.port) : default_http,
                path: downloadurlsplit.path
            });
        }
        else if (downloadurlsplit.protocol === "https:") {
            req = https.request({
                host: downloadurlsplit.host,
                port: (downloadurlsplit.port) ? parseInt(downloadurlsplit.port) : default_https,
                path: downloadurlsplit.path
            });
        }
        var file = null;
        var bar = null;
        var filesize = 0;
        req.on("response", function (res) {
            if (res.statusCode === 404) {
                reject("file not found - " + downloadurl);
                return;
            }
            if (!_file_streams[downloadurl]) {
                reject("download cancelled");
                req.end();
                return;
            }
            var len = parseInt(res.headers["content-length"], 10);
            if (len > 0) {
                if (displayProgress) {
                    bar = new ProgressBar(filename_only + " [:bar] :percent :etas", {
                        complete: "=",
                        incomplete: " ",
                        width: 40,
                        total: len
                    });
                }
            }
            else {
                process.stdout.write("unknown file size, downloading chunks ");
            }
            var file_directory = path.dirname(filename);
            if (!fs.existsSync(file_directory)) {
                fs.mkdir(file_directory);
            }
            file = fs.createWriteStream(filename);
            if (!file) {
                reject("unable to create file");
                return;
            }
            _file_streams[downloadurl].filestream = file;
            _file_streams[downloadurl].length = len;
            _file_streams[downloadurl].request = req;
            res.on("data", function (chunk) {
                if (!_file_streams[downloadurl]) {
                    reject("download cancelled");
                    req.end();
                    return;
                }
                filesize += chunk.length;
                if (file != null) {
                    file.write(chunk);
                }
                if (displayProgress) {
                    if (bar) {
                        bar.tick(chunk.length);
                    }
                    else {
                        process.stdout.write(".");
                    }
                }
            });
            res.on("end", function () {
                if (file != null) {
                    file.close();
                }
                logger.info("downloaded ", filesize, "bytes");
                if (_file_streams[downloadurl] && filesize === _file_streams[downloadurl].length) {
                    delete _file_streams[downloadurl];
                    // adding timeout to let node js flush the file to disk
                    setImmediate(function () {
                        resolve(true);
                    });
                }
                else if (filesize > 0) {
                    resolve(false);
                }
                else {
                    reject("file not found");
                }
            });
        });
        req.end();
    });
}
exports.download = download;
function request_get(request_url) {
    return new Promise(function (resolve, reject) {
        var requesturlsplit = url.parse(request_url);
        var default_https = 443;
        var default_http = 80;
        var req = null;
        if (requesturlsplit.protocol === "http:") {
            req = http.request({
                host: requesturlsplit.host,
                port: (requesturlsplit.port) ? parseInt(requesturlsplit.port) : default_http,
                path: requesturlsplit.path
            });
        }
        else if (requesturlsplit.protocol === "https:") {
            req = https.request({
                host: requesturlsplit.host,
                port: (requesturlsplit.port) ? parseInt(requesturlsplit.port) : default_https,
                path: requesturlsplit.path
            });
        }
        var filesize = 0;
        var contents = new Buffer(0);
        req.on("response", function (res) {
            if (res.statusCode === 404) {
                reject("url not found");
                return;
            }
            var len = parseInt(res.headers["content-length"], 10);
            if (len > 0) {
                console.info("file length", len);
            }
            else {
                console.info("unknown file size, downloading chunks");
            }
            res.on("data", function (chunk) {
                filesize += chunk.length;
                contents = Buffer.concat([contents, chunk]);
            });
            res.on("end", function () {
                resolve(contents);
            });
        });
        req.end();
    });
}
exports.request_get = request_get;
//# sourceMappingURL=download-accessor.js.map
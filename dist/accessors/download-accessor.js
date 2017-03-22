"use strict";
exports.__esModule = true;
var ProgressBar = require("progress");
var url = require("url");
var fs = require("fs");
var https = require("https");
var http = require("http");
var path = require("path");
var logger = require("../utilities/logger");
var _file_streams = {};
function cancel(downloadurl) {
    var download_item = _file_streams[downloadurl];
    if (download_item) {
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
                method: "HEAD",
                host: downloadurlsplit.host,
                port: (downloadurlsplit.port) ? parseInt(downloadurlsplit.port) : default_http,
                path: downloadurlsplit.path
            });
        }
        else if (downloadurlsplit.protocol === "https:") {
            req = https.request({
                method: "HEAD",
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
            length: -1
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
        process.on("SIGINT", function () {
            logger.error("Caught interrupt signal");
            file.end();
            fs.unlink(filename);
        });
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
            file = fs.createWriteStream(filename);
            _file_streams[downloadurl].filestream = file;
            _file_streams[downloadurl].length = len;
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
                    file.end();
                }
                logger.info("downloaded ", filesize, "bytes");
                if (filesize === _file_streams[downloadurl].length) {
                    resolve(true);
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
//# sourceMappingURL=download-accessor.js.map
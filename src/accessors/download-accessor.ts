import * as ProgressBar from "progress";
import url = require("url");
import fs = require("fs");

import https_ = require("https");
import http_ = require("http");
// tslint:disable-next-line:no-var-requires
let http = require("follow-redirects").http;
// tslint:disable-next-line:no-var-requires
let https = require("follow-redirects").https;
import path = require("path");
import * as logger from "../utilities/logger";

interface IDownloadItem {
	downloadurl: string;
	filestream: fs.WriteStream;
	filename: string;
	length: number;
	request: http_.ClientRequest;
}

let _file_streams: { [downloadurl: string]: IDownloadItem } = {};

process.on("SIGINT", () => {
	logger.error("Caught interrupt signal");
	for (let file of Object.keys(_file_streams)) {
		cancel(_file_streams[file].downloadurl);
	}

});

export function cancel(downloadurl: string): boolean {
	let download_item = _file_streams[downloadurl];
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

export function download_size(downloadurl: string): Promise<number> {
	return new Promise<number>((resolve, reject) => {
		const downloadurlsplit = url.parse(downloadurl);

		const default_https = 443;
		const default_http = 80;

		let req: http_.ClientRequest = null;

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

		req.on("response", (res: http_.ClientResponse) => {
			if (res.statusCode === 404) {
				reject("file not found - " + downloadurl);
				return;
			}

			let len = parseInt(res.headers["content-length"], 10);
			req.abort();
			resolve(len);
		});

		req.end();

	});
}

function delay(ms: number): Promise<any> {
	return new Promise<any>((resolve, reject) => {
		setTimeout(() => {
			resolve();
		}, ms);
	});
}

export function download(downloadurl: string, filename: string, displayProgress: boolean): Promise<boolean> {
	return new Promise<boolean>((resolve, reject) => {
		let filename_only = path.basename(filename);

		_file_streams[downloadurl] = {
			downloadurl,
			filename,
			filestream: null,
			length: -1,
			request: null
		};

		const downloadurlsplit = url.parse(downloadurl);

		const default_https = 443;
		const default_http = 80;

		let req: http_.ClientRequest = null;

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

		let file: fs.WriteStream = null;
		let bar: ProgressBar = null;
		let filesize = 0;
		let filebyteswritten = 0;

		req.on("response", (res: http_.ClientResponse) => {
			if (res.statusCode === 404) {
				reject("file not found - " + downloadurl);
				return;
			}

			if (!_file_streams[downloadurl]) {
				reject("download cancelled");
				req.end();
				return;
			}

			let len = parseInt(res.headers["content-length"], 10);
			if (len > 0) {
				if (displayProgress) {
					bar = new ProgressBar(filename_only + " [:bar] :percent :etas", {
						complete: "=",
						incomplete: " ",
						width: 40,
						total: len
					});
				}
			} else {
				process.stdout.write("unknown file size, downloading chunks ");
			}

			let file_directory = path.dirname(filename);
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

			res.on("data", (chunk) => {
				if (!_file_streams[downloadurl]) {
					reject("download cancelled");
					req.end();
					return;
				}

				let chunklength = chunk.length;

				filesize += chunklength;
				if (file != null) {

					file.write(chunk, () => {
						filebyteswritten += chunklength;
					});
				}
				if (displayProgress) {
					if (bar) {
						bar.tick(chunklength);
					} else {
						process.stdout.write(".");
					}
				}
			});

			res.on("end", async () => {
				if (file != null) {
					let maxwait = 1000;
					while ((filebyteswritten < filesize) && (maxwait > 0)) {
						maxwait--;
						await delay(1);
					}
					if (maxwait < 1) {
						logger.warn("maximum wait time reached, file not written properly");
					}

					file.end();

					file = null;
					_file_streams[downloadurl].filestream = null;

					await delay(1);
				}

				logger.info("downloaded ", filesize, "bytes");

				if (_file_streams[downloadurl] && filesize === _file_streams[downloadurl].length) {
					delete _file_streams[downloadurl];
					// adding timeout to let node js flush the file to disk
					setImmediate(() => {
						resolve(true);
					});
				} else if (filesize > 0) {
					resolve(false);
				} else {
					reject("file not found");
				}
			});
		});

		req.end();
	});
}

export function request_get(request_url: string): Promise<Buffer> {
	return new Promise<Buffer>((resolve, reject) => {

		const requesturlsplit = url.parse(request_url);

		const default_https = 443;
		const default_http = 80;

		let req: http_.ClientRequest = null;

		if (requesturlsplit.protocol === "http:") {
			req = http.request({
				host: requesturlsplit.host,
				port: (requesturlsplit.port) ? parseInt(requesturlsplit.port) : default_http,
				path: requesturlsplit.path
			});
		} else if (requesturlsplit.protocol === "https:") {
			req = https.request({
				host: requesturlsplit.host,
				port: (requesturlsplit.port) ? parseInt(requesturlsplit.port) : default_https,
				path: requesturlsplit.path
			});
		}

		let filesize = 0;

		let contents = new Buffer(0);

		req.on("response", (res: http_.ClientResponse) => {
			if (res.statusCode === 404) {
				reject("url not found");
				return;
			}

			let len = parseInt(res.headers["content-length"], 10);
			if (len > 0) {
				console.info("file length", len);
			} else {
				console.info("unknown file size, downloading chunks");
			}

			res.on("data", (chunk) => {
				filesize += chunk.length;
				contents = Buffer.concat([contents, chunk as Buffer]);
			});

			res.on("end", () => {
				resolve(contents);
			});
		});

		req.end();
	});
}

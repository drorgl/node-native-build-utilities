import fs = require("fs");
import os = require("os");
import util = require("util");

let _log_to_file: string = null;

export let _log_to_console: boolean = true;

export function log_to_console(console: boolean) {
	_log_to_console = console;
}

export enum LogLevel {
	debug = 0,
	info = 1,
	warn = 2,
	error = 3
}

export let log_level: LogLevel = LogLevel.debug;

export function log_to_file(filename: string) {
	_log_to_file = filename;
}

export function debug(message?: any, ...optionalParams: any[]) {
	if (log_level <= LogLevel.debug) {
		const log_message = "DEBUG - " + util.format.apply(null, arguments);
		if (_log_to_console) {
			console.log(log_message);
		}
		if (_log_to_file) {
			fs.appendFile(_log_to_file, log_message + os.EOL, (err) => {if (err) {console.log("unable to write " + log_message + " to log file"); } });
		}
	}
}

export function info(message?: any, ...optionalParams: any[]) {
	if (log_level <= LogLevel.info) {
		const log_message = "INFO - " + util.format.apply(null, arguments);
		if (_log_to_console) {
			console.info(log_message);
		}
		if (_log_to_file) {
			fs.appendFile(_log_to_file, log_message + os.EOL, (err) => {if (err) {console.log("unable to write " + log_message + " to log file"); } });
		}
	}
}

export function warn(message?: any, ...optionalParams: any[]) {
	if (log_level <= LogLevel.warn) {
		const log_message = "WARN - " + util.format.apply(null, arguments);
		if (_log_to_console) {
			console.warn(log_message);
		}
		if (_log_to_file) {
			fs.appendFile(_log_to_file, log_message + os.EOL, (err) => {if (err) {console.log("unable to write " + log_message + " to log file"); } });
		}
	}
}

export function error(message?: any, ...optionalParams: any[]) {
	if (log_level <= LogLevel.error) {
		const log_message = "ERROR - " + util.format.apply(null, arguments);
		if (_log_to_console) {
			console.error(log_message);
		}
		if (_log_to_file) {
			fs.appendFile(_log_to_file, log_message + os.EOL, (err) => {if (err) {console.log("unable to write " + log_message + " to log file"); } });
		}
	}
}

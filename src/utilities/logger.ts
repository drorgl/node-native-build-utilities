import fs = require("fs");
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

export let log_level: LogLevel = LogLevel.info;

export function log_to_file(filename: string) {
	_log_to_file = filename;
}

export function debug(message?: any, ...optionalParams: any[]) {
	if (log_level <= LogLevel.debug) {
		if (_log_to_console) {
			console.debug("DEBUG - " + util.format.apply(null, arguments));
		}
		if (_log_to_file) {
			fs.appendFile(_log_to_file, "DEBUG - " + util.format.apply(null, arguments));
		}
	}
}

export function info(message?: any, ...optionalParams: any[]) {
	if (log_level <= LogLevel.info) {
		if (_log_to_console) {
			console.info("INFO - " + util.format.apply(null, arguments));
		}
		if (_log_to_file) {
			fs.appendFile(_log_to_file, "INFO - " + util.format.apply(null, arguments));
		}
	}
}

export function warn(message?: any, ...optionalParams: any[]) {
	if (log_level <= LogLevel.warn) {
		if (_log_to_console) {
			console.warn("WARN - " + util.format.apply(null, arguments));
		}
		if (_log_to_file) {
			fs.appendFile(_log_to_file, "WARN - " + util.format.apply(null, arguments));
		}
	}
}

export function error(message?: any, ...optionalParams: any[]) {
	if (log_level <= LogLevel.error) {
		if (_log_to_console) {
			console.error("ERROR - " + util.format.apply(null, arguments));
		}
		if (_log_to_file) {
			fs.appendFile(_log_to_file, "ERROR - " + util.format.apply(null, arguments));
		}
	}
}

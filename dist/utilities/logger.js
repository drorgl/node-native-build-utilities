"use strict";
exports.__esModule = true;
var fs = require("fs");
var util = require("util");
var os = require("os");
var _log_to_file = null;
exports._log_to_console = true;
function log_to_console(console) {
    exports._log_to_console = console;
}
exports.log_to_console = log_to_console;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["debug"] = 0] = "debug";
    LogLevel[LogLevel["info"] = 1] = "info";
    LogLevel[LogLevel["warn"] = 2] = "warn";
    LogLevel[LogLevel["error"] = 3] = "error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
exports.log_level = LogLevel.debug;
function log_to_file(filename) {
    _log_to_file = filename;
}
exports.log_to_file = log_to_file;
function debug(message) {
    var optionalParams = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        optionalParams[_i - 1] = arguments[_i];
    }
    if (exports.log_level <= LogLevel.debug) {
        if (exports._log_to_console) {
            console.log("DEBUG - " + util.format.apply(null, arguments));
        }
        if (_log_to_file) {
            fs.appendFile(_log_to_file, "DEBUG - " + util.format.apply(null, arguments) + os.EOL);
        }
    }
}
exports.debug = debug;
function info(message) {
    var optionalParams = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        optionalParams[_i - 1] = arguments[_i];
    }
    if (exports.log_level <= LogLevel.info) {
        if (exports._log_to_console) {
            console.info("INFO - " + util.format.apply(null, arguments));
        }
        if (_log_to_file) {
            fs.appendFile(_log_to_file, "INFO - " + util.format.apply(null, arguments) + os.EOL);
        }
    }
}
exports.info = info;
function warn(message) {
    var optionalParams = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        optionalParams[_i - 1] = arguments[_i];
    }
    if (exports.log_level <= LogLevel.warn) {
        if (exports._log_to_console) {
            console.warn("WARN - " + util.format.apply(null, arguments));
        }
        if (_log_to_file) {
            fs.appendFile(_log_to_file, "WARN - " + util.format.apply(null, arguments) + os.EOL);
        }
    }
}
exports.warn = warn;
function error(message) {
    var optionalParams = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        optionalParams[_i - 1] = arguments[_i];
    }
    if (exports.log_level <= LogLevel.error) {
        if (exports._log_to_console) {
            console.error("ERROR - " + util.format.apply(null, arguments));
        }
        if (_log_to_file) {
            fs.appendFile(_log_to_file, "ERROR - " + util.format.apply(null, arguments) + os.EOL);
        }
    }
}
exports.error = error;
//# sourceMappingURL=logger.js.map
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var bluebird = require("bluebird");
var minimatch = require("minimatch");
exports.readdir = bluebird.promisify(fs.readdir);
exports.stat = bluebird.promisify(fs.stat);
function mkdir(file) {
    return new Promise(function (resolve, reject) {
        fs.mkdir(file, function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}
exports.mkdir = mkdir;
function rmdir(file) {
    return new Promise(function (resolve, reject) {
        fs.rmdir(file, function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}
exports.rmdir = rmdir;
function exists(file) {
    return new Promise(function (resolve, reject) {
        fs.exists(file, function (exists_) {
            resolve(exists_);
        });
    });
}
exports.exists = exists;
exports.readFile = bluebird.promisify(fs.readFile);
function writeFile(filename, encoding, data) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(filename, data, { encoding: encoding }, function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve(true);
            }
        });
    });
}
exports.writeFile = writeFile;
exports.mkdtemp = bluebird.promisify(fs.mkdtemp);
exports.unlink = bluebird.promisify(fs.unlink);
function normalize_path(filepath) {
    if (process.platform === "win32") {
        return filepath.split(/\/|\\/).join("\\");
    }
    else {
        return filepath.split(/\/|\\/).join("/");
    }
}
exports.normalize_path = normalize_path;
function path_join(base, file_path) {
    var nbase = normalize_path(base);
    var nfp = normalize_path(file_path);
    if (nbase.endsWith("/") || nbase.endsWith("\\")) {
        return nbase + nfp;
    }
    else {
        return nbase + normalize_path("/") + nfp;
    }
}
function find_all_files(base_path, level) {
    return __awaiter(this, void 0, void 0, function () {
        var all_files, items, _i, items_1, item, full_path, stat_, files;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    all_files = [];
                    return [4 /*yield*/, exports.readdir(base_path)];
                case 1:
                    items = _a.sent();
                    _i = 0, items_1 = items;
                    _a.label = 2;
                case 2:
                    if (!(_i < items_1.length)) return [3 /*break*/, 8];
                    item = items_1[_i];
                    full_path = path_join(base_path, item);
                    return [4 /*yield*/, exports.stat(full_path)];
                case 3:
                    stat_ = _a.sent();
                    if (!stat_.isDirectory()) return [3 /*break*/, 6];
                    if (!(level < 4 || !level)) return [3 /*break*/, 5];
                    return [4 /*yield*/, find_all_files(full_path, (level || 0) + 1)];
                case 4:
                    files = _a.sent();
                    all_files = all_files.concat(files);
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    all_files.push(full_path);
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8: return [2 /*return*/, all_files];
            }
        });
    });
}
exports.find_all_files = find_all_files;
function filter_glob(pattern, files) {
    return __awaiter(this, void 0, void 0, function () {
        var retfiles;
        return __generator(this, function (_a) {
            retfiles = files.filter(function (v, i, a) {
                return !minimatch.filter(path.normalize(normalize_path(pattern)), { dot: true })(path.normalize(normalize_path(v)), i, a);
            });
            return [2 /*return*/, retfiles];
        });
    });
}
exports.filter_glob = filter_glob;
// http://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable
function human_file_size(bytes, si) {
    var thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
        return bytes + " B";
    }
    var units = si
        ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
        : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + " " + units[u];
}
exports.human_file_size = human_file_size;
//# sourceMappingURL=promisified_fs.js.map
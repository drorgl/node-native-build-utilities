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
var path = require("path");
var node_7z_1 = require("node-7z");
var ProgressBar = require("progress");
var pfs = require("./promisified_fs");
var crypto = require("crypto");
var myTask = new node_7z_1["default"]();
function test(archive) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, myTask.test(archive).promise];
        });
    });
}
exports.test = test;
function extractFull(archive, dest) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, myTask.extractFull(archive, dest, {}).promise];
        });
    });
}
exports.extractFull = extractFull;
function addFull(archive, files) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    files = files.map(function (v) { return path.join("./", v); });
                    var bar = null;
                    bar = new ProgressBar(path.basename(archive) + " [:bar] :percent :etas", {
                        complete: "=",
                        incomplete: " ",
                        width: 40,
                        total: files.length
                    });
                    myTask.add(archive, files, { mx: "9" })
                        .promise.then(function (resolve_value) {
                        (function () { return __awaiter(_this, void 0, void 0, function () {
                            var fsize;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, pfs.stat(archive)];
                                    case 1:
                                        fsize = (_a.sent()).size;
                                        console.log();
                                        console.log(path.basename(archive), "compressed to ", pfs.human_file_size(fsize, true));
                                        resolve(resolve_value);
                                        return [2 /*return*/];
                                }
                            });
                        }); })();
                    }, function (reject_reason) {
                        reject(reject_reason);
                    }, function (progress_data) {
                        bar.tick(progress_data.length);
                    });
                })];
        });
    });
}
exports.addFull = addFull;
var ignores = ["./.git/**", "./.gitignore", "./.tmp/**", "./.github-authentication-cache"];
function parse_folder(folder) {
    return __awaiter(this, void 0, void 0, function () {
        var files, _i, ignores_1, ignore_pattern, gitignore, _a, gitignore_1, ignore_pattern;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, pfs.find_all_files(folder)];
                case 1:
                    files = _b.sent();
                    _i = 0, ignores_1 = ignores;
                    _b.label = 2;
                case 2:
                    if (!(_i < ignores_1.length)) return [3 /*break*/, 5];
                    ignore_pattern = ignores_1[_i];
                    return [4 /*yield*/, pfs.filter_glob(ignore_pattern, files)];
                case 3:
                    files = _b.sent();
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [4 /*yield*/, pfs.exists(path.join(folder, ".gitignore"))];
                case 6:
                    if (!(_b.sent())) return [3 /*break*/, 13];
                    return [4 /*yield*/, pfs.readFile(path.join(folder, ".gitignore"), "utf8")];
                case 7:
                    gitignore = (_b.sent()).split(/\r?\n/);
                    _a = 0, gitignore_1 = gitignore;
                    _b.label = 8;
                case 8:
                    if (!(_a < gitignore_1.length)) return [3 /*break*/, 13];
                    ignore_pattern = gitignore_1[_a];
                    ignore_pattern = ignore_pattern.trim();
                    if (!ignore_pattern) {
                        return [3 /*break*/, 12];
                    }
                    return [4 /*yield*/, pfs.filter_glob(ignore_pattern, files)];
                case 9:
                    files = _b.sent();
                    ignore_pattern = path.join(ignore_pattern, "**");
                    return [4 /*yield*/, pfs.filter_glob(ignore_pattern, files)];
                case 10:
                    files = _b.sent();
                    ignore_pattern = "." + ignore_pattern;
                    return [4 /*yield*/, pfs.filter_glob(ignore_pattern, files)];
                case 11:
                    files = _b.sent();
                    _b.label = 12;
                case 12:
                    _a++;
                    return [3 /*break*/, 8];
                case 13: return [2 /*return*/, files];
            }
        });
    });
}
exports.parse_folder = parse_folder;
function generate_random(size) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    crypto.randomBytes(size, function (err, buf) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(buf.toString("hex"));
                    });
                })];
        });
    });
}
exports.generate_random = generate_random;
//# sourceMappingURL=archive.js.map
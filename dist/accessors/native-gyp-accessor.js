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
//import fs = require("fs");
var path = require("path");
var pfs = require("../utilities/promisified_fs");
var strip_json_comments = require("strip-json-comments");
exports.NATIVE_GYP_FILENAME = "native_gyp.json";
function exists() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, pfs.exists(exports.NATIVE_GYP_FILENAME)];
        });
    });
}
exports.exists = exists;
function read(filename) {
    return __awaiter(this, void 0, void 0, function () {
        var file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pfs.exists(filename || exports.NATIVE_GYP_FILENAME)];
                case 1:
                    if (!(_a.sent())) {
                        throw new Error("file not found");
                    }
                    return [4 /*yield*/, pfs.readFile(exports.NATIVE_GYP_FILENAME, "utf8")];
                case 2:
                    file = _a.sent();
                    file = strip_json_comments(file, { whitespace: true });
                    return [2 /*return*/, JSON.parse(file)];
            }
        });
    });
}
exports.read = read;
function find_all_native_gyps(base_path, level) {
    return __awaiter(this, void 0, void 0, function () {
        var native_gyps, items, _i, items_1, item, stat_, subdirectories;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    native_gyps = [];
                    return [4 /*yield*/, pfs.readdir(base_path)];
                case 1:
                    items = _a.sent();
                    _i = 0, items_1 = items;
                    _a.label = 2;
                case 2:
                    if (!(_i < items_1.length)) return [3 /*break*/, 7];
                    item = items_1[_i];
                    return [4 /*yield*/, pfs.stat(path.join(base_path, item))];
                case 3:
                    stat_ = _a.sent();
                    if (!stat_.isDirectory()) return [3 /*break*/, 5];
                    if (!(level < 4 || !level)) return [3 /*break*/, 5];
                    return [4 /*yield*/, find_all_native_gyps(path.join(base_path, item), (level || 0) + 1)];
                case 4:
                    subdirectories = _a.sent();
                    native_gyps = native_gyps.concat(subdirectories);
                    _a.label = 5;
                case 5:
                    if (path.basename(item).toLowerCase() === exports.NATIVE_GYP_FILENAME) {
                        native_gyps.push(path.join(base_path, item));
                    }
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7: return [2 /*return*/, native_gyps];
            }
        });
    });
}
exports.find_all_native_gyps = find_all_native_gyps;
function read_all_native_gyps(base_path) {
    return __awaiter(this, void 0, void 0, function () {
        var native_gyps, gyp_files, _i, gyp_files_1, file, _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    native_gyps = [];
                    return [4 /*yield*/, find_all_native_gyps(base_path, 0)];
                case 1:
                    gyp_files = _d.sent();
                    _i = 0, gyp_files_1 = gyp_files;
                    _d.label = 2;
                case 2:
                    if (!(_i < gyp_files_1.length)) return [3 /*break*/, 5];
                    file = gyp_files_1[_i];
                    _b = (_a = native_gyps).push;
                    return [4 /*yield*/, read(file)];
                case 3:
                    _b.apply(_a, [_d.sent()]);
                    _d.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, native_gyps];
            }
        });
    });
}
exports.read_all_native_gyps = read_all_native_gyps;
//# sourceMappingURL=native-gyp-accessor.js.map
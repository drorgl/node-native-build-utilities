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
var bluebird = require("bluebird");
var fs = require("fs");
var path = require("path");
var pfs = require("../utilities/promisified_fs");
var writeFile = bluebird.promisify(fs.writeFile);
var readFile = bluebird.promisify(fs.readFile);
exports.NATIVE_CONFIGURATION_FILE = "native_configuration.json";
function save(filename, configuration) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, writeFile(filename, JSON.stringify(configuration, null, "\t"))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.save = save;
function find_native_configuration_file(filename) {
    var _this = this;
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var limit;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    limit = 5;
                    _a.label = 1;
                case 1: return [4 /*yield*/, pfs.exists(filename)];
                case 2:
                    if (!((!(_a.sent())) && limit > 0)) return [3 /*break*/, 3];
                    filename = path.join("..", filename);
                    limit--;
                    return [3 /*break*/, 1];
                case 3: return [4 /*yield*/, pfs.exists(filename)];
                case 4:
                    if (_a.sent()) {
                        resolve(filename);
                    }
                    else {
                        reject("not found");
                    }
                    return [2 /*return*/];
            }
        });
    }); });
}
exports.find_native_configuration_file = find_native_configuration_file;
function load(filename) {
    return __awaiter(this, void 0, void 0, function () {
        var fileContents;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, readFile(filename, "utf8")];
                case 1:
                    fileContents = _a.sent();
                    return [2 /*return*/, JSON.parse(fileContents)];
            }
        });
    });
}
exports.load = load;
//# sourceMappingURL=native-configuration-accessor.js.map
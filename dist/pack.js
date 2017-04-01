#!/usr/bin/env node
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
var _this = this;
exports.__esModule = true;
var program = require("commander");
var package_accessor_1 = require("./accessors/package-accessor");
var archive = require("./utilities/archive");
var logger = require("./utilities/logger");
var pfs = require("./utilities/promisified_fs");
var path = require("path");
var os = require("os");
var gitAccessor = require("./accessors/git-accessor");
var githubAccessor = require("./accessors/github-accessor");
// pack binary
// pack sources
// ignore what's .gitignore
// ignore node_modules
program
    .version(package_accessor_1.node_package.version)
    .option("-s, --pack-sources [filename]", "pack sources")
    .option("-b, --pack-binaries [filename]", "pack binaries", [])
    .parse(process.argv);
console.log(program);
(function () { return __awaiter(_this, void 0, void 0, function () {
    var tag_version, filename, zipfile, files, gh, releases, release, result, e_1, err, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 19, , 20]);
                if (!program["packSources"]) return [3 /*break*/, 18];
                console.log("pack");
                logger.debug("pack sources", program["packSources"]);
                return [4 /*yield*/, gitAccessor.git_get_last_tag(process.cwd())];
            case 1:
                tag_version = _a.sent();
                if (!tag_version) {
                    console.error("unable to pack source for", package_accessor_1.node_package.name, "no git tags were found");
                    return [2 /*return*/];
                }
                filename = package_accessor_1.node_package.name + "." + tag_version + ".7z";
                zipfile = path.join(os.tmpdir(), filename);
                return [4 /*yield*/, pfs.exists(zipfile)];
            case 2:
                if (!(_a.sent())) return [3 /*break*/, 4];
                return [4 /*yield*/, pfs.unlink(zipfile)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4: return [4 /*yield*/, archive.parse_folder("./")];
            case 5:
                files = _a.sent();
                console.log("compressing ", files.length, "files", zipfile);
                return [4 /*yield*/, archive.addFull(zipfile, files)];
            case 6:
                _a.sent();
                gh = new githubAccessor.GitHubAccessor();
                return [4 /*yield*/, gh.authenticate()];
            case 7:
                if (!(_a.sent())) return [3 /*break*/, 15];
                console.log("looking for releases");
                return [4 /*yield*/, gh.get_releases_by_tag("drorgl", "zlib.module", "v1.2.8")];
            case 8:
                releases = (_a.sent()).data;
                release = releases;
                console.log("found", release.id, release.name, release.tag_name, "assets:", release.assets.length);
                if (!!releases) return [3 /*break*/, 10];
                return [4 /*yield*/, gh.create_release("drorgl", "zlib.module", "v1.2.8", "v1.2.8", false)];
            case 9:
                releases = _a.sent();
                _a.label = 10;
            case 10:
                console.log("uploading asset");
                _a.label = 11;
            case 11:
                _a.trys.push([11, 13, , 14]);
                return [4 /*yield*/, gh.upload_release_asset("drorgl", "zlib.module", releases.id.toString(), zipfile, path.basename(zipfile), path.basename(zipfile))];
            case 12:
                result = _a.sent();
                console.log(result);
                if (result && result.data.id) {
                    console.log("successfully uploaded", result.data.id);
                }
                else {
                    console.log("failed to upload asset");
                }
                return [3 /*break*/, 14];
            case 13:
                e_1 = _a.sent();
                err = e_1;
                console.error("problem uploading asset", JSON.parse(err.message).errors.map(function (v) { return v.code; }).join(", "));
                return [3 /*break*/, 14];
            case 14: return [3 /*break*/, 16];
            case 15:
                console.log("unable to authenticate github");
                _a.label = 16;
            case 16: return [4 /*yield*/, pfs.unlink(zipfile)];
            case 17:
                _a.sent();
                _a.label = 18;
            case 18: return [3 /*break*/, 20];
            case 19:
                e_2 = _a.sent();
                console.log("error", e_2);
                return [3 /*break*/, 20];
            case 20: return [2 /*return*/];
        }
    });
}); })();
//# sourceMappingURL=pack.js.map
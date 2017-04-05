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
// console.log(program);
(function () { return __awaiter(_this, void 0, void 0, function () {
    var tag_version, filename, zipfolder, _a, _b, _c, zipfile, files, repoinfo, gh, releases, release, result, e_1, err, e_2;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 23, , 24]);
                if (!program["packSources"]) return [3 /*break*/, 22];
                console.log("packing");
                logger.debug("pack sources", program["packSources"]);
                return [4 /*yield*/, gitAccessor.git_get_last_tag(process.cwd())];
            case 1:
                tag_version = _d.sent();
                if (!tag_version) {
                    console.error("unable to pack source for", package_accessor_1.node_package.name, "no git tags were found");
                    return [2 /*return*/];
                }
                filename = package_accessor_1.node_package.name + "." + tag_version + ".7z";
                _b = (_a = path).join;
                _c = [os.tmpdir()];
                return [4 /*yield*/, archive.generate_random(8)];
            case 2:
                zipfolder = _b.apply(_a, _c.concat([_d.sent()]));
                return [4 /*yield*/, pfs.exists(zipfolder)];
            case 3:
                if (!!(_d.sent())) return [3 /*break*/, 5];
                return [4 /*yield*/, pfs.mkdir(zipfolder)];
            case 4:
                _d.sent();
                _d.label = 5;
            case 5:
                zipfile = path.join(zipfolder, filename);
                return [4 /*yield*/, pfs.exists(zipfile)];
            case 6:
                if (!(_d.sent())) return [3 /*break*/, 8];
                return [4 /*yield*/, pfs.unlink(zipfile)];
            case 7:
                _d.sent();
                _d.label = 8;
            case 8: return [4 /*yield*/, archive.parse_folder("./")];
            case 9:
                files = _d.sent();
                console.log("compressing ", files.length, "files", zipfile);
                return [4 /*yield*/, archive.addFull(zipfile, files)];
            case 10:
                _d.sent();
                repoinfo = package_accessor_1.parse_repository();
                gh = new githubAccessor.GitHubAccessor();
                return [4 /*yield*/, gh.authenticate()];
            case 11:
                if (!(_d.sent())) return [3 /*break*/, 19];
                console.log("looking for releases", repoinfo.username, repoinfo.repo, tag_version);
                return [4 /*yield*/, gh.get_releases_by_tag(repoinfo.username, repoinfo.repo, tag_version)];
            case 12:
                releases = (_d.sent()).data;
                release = releases;
                console.log("found", release.id, release.name, release.tag_name, "assets:", release.assets.length);
                if (!!releases) return [3 /*break*/, 14];
                return [4 /*yield*/, gh.create_release(repoinfo.username, repoinfo.repo, tag_version, tag_version, false)];
            case 13:
                releases = _d.sent();
                _d.label = 14;
            case 14:
                console.log("uploading asset");
                _d.label = 15;
            case 15:
                _d.trys.push([15, 17, , 18]);
                console.log("should upload: ", repoinfo.username, repoinfo.repo, releases.id.toString(), zipfile, path.basename(zipfile), path.basename(zipfile));
                return [4 /*yield*/, gh.upload_release_asset(repoinfo.username, repoinfo.repo, releases.id.toString(), zipfile, path.basename(zipfile), path.basename(zipfile))];
            case 16:
                result = _d.sent();
                if (result && result.data.id) {
                    console.log("successfully uploaded", result.data.id);
                }
                else {
                    console.log("failed to upload asset");
                }
                return [3 /*break*/, 18];
            case 17:
                e_1 = _d.sent();
                err = e_1;
                console.error("problem uploading asset", JSON.parse(err.message).errors.map(function (v) { return v.code; }).join(", "));
                return [3 /*break*/, 18];
            case 18: return [3 /*break*/, 20];
            case 19:
                console.log("unable to authenticate github");
                _d.label = 20;
            case 20: return [4 /*yield*/, pfs.unlink(zipfile)];
            case 21:
                _d.sent();
                pfs.rmdir(zipfolder);
                _d.label = 22;
            case 22: return [3 /*break*/, 24];
            case 23:
                e_2 = _d.sent();
                console.log("error", e_2);
                return [3 /*break*/, 24];
            case 24: return [2 /*return*/];
        }
    });
}); })();
//# sourceMappingURL=pack.js.map
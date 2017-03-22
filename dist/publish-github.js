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
var github_accessor_1 = require("./accessors/github-accessor");
var package_accessor_1 = require("./accessors/package-accessor");
var logger = require("./utilities/logger");
var github_accessor = new github_accessor_1.GitHubAccessor();
program
    .version(package_accessor_1.node_package.version)
    .option("-a, --list-assets [asset]", "list assets in user/repo/tag/asset format")
    .option("-d, --download [asset]", "download asset in user/repo/tag/asset format", [])
    .option("-r, --list-releases [release]", "list releases in user/repo format")
    .option("-u, --upload-asset [asset] [filename]", "upload asset in user/repo/tag format")
    .parse(process.argv);
(function () { return __awaiter(_this, void 0, void 0, function () {
    var parameters, owner, repo, tag_1, releases, filtered_assets, merged, parameters, owner, repo, tag_2, filename_1, releases, filtered_assets, asset, parameters, owner, repo, tag_3, releases, filtered_releases;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!program["listAssets"]) return [3 /*break*/, 2];
                logger.debug("list assets", program["listAssets"]);
                parameters = program["listAssets"].split("/");
                owner = parameters[0];
                repo = parameters[1];
                tag_1 = (parameters.length > 1) ? parameters[2] : null;
                return [4 /*yield*/, github_accessor.get_releases(owner, repo)];
            case 1:
                releases = _a.sent();
                filtered_assets = releases.filter(function (v) { return (tag_1) ? v.tag_name === tag_1 : true; }).map(function (v) { return v.assets; });
                merged = [].concat.apply([], filtered_assets).map(function (v) {
                    return {
                        name: v.name,
                        size: v.size,
                        url: v.url
                    };
                });
                logger.debug(merged);
                _a.label = 2;
            case 2:
                if (!(program["download"] && program["download"].length)) return [3 /*break*/, 4];
                logger.debug("download", program["download"]);
                parameters = program["download"].split("/");
                owner = parameters[0];
                repo = parameters[1];
                tag_2 = parameters[2];
                filename_1 = parameters[3];
                return [4 /*yield*/, github_accessor.get_releases(owner, repo)];
            case 3:
                releases = _a.sent();
                filtered_assets = releases.filter(function (v) { return (tag_2) ? v.tag_name === tag_2 : true; }).map(function (v) { return v.assets; });
                asset = [].concat.apply([], filtered_assets).find(function (v) { return v.name === filename_1; });
                if (asset) {
                    logger.debug("downloading " + asset.url);
                }
                else {
                    logger.error("asset not found");
                }
                _a.label = 4;
            case 4:
                if (!program["listReleases"]) return [3 /*break*/, 6];
                parameters = program["listReleases"].split("/");
                owner = parameters[0];
                repo = parameters[1];
                tag_3 = (parameters.length > 1) ? parameters[2] : null;
                return [4 /*yield*/, github_accessor.get_releases(owner, repo)];
            case 5:
                releases = _a.sent();
                filtered_releases = releases.filter(function (v) { return (tag_3) ? v.tag_name === tag_3 : true; }).map(function (v) {
                    return {
                        name: v.name,
                        url: v.url
                    };
                });
                logger.debug(filtered_releases);
                _a.label = 6;
            case 6:
                if (program["uploadAsset"]) {
                    logger.debug("upload asset", program["uploadAssets"]);
                }
                return [2 /*return*/];
        }
    });
}); })();
//# sourceMappingURL=publish-github.js.map
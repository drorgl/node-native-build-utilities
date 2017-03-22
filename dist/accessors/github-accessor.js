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
var github = require("github");
var fs = require("fs");
var path = require("path");
var app_root_path = require("app-root-path");
var promptly = require("promptly");
var ini = require("ini");
var logger = require("../utilities/logger");
var download_accessor_1 = require("./download-accessor");
var package_accessor_1 = require("./package-accessor");
var GITHUB_APPLICATION_NAME = "github-node-publisher";
var THIS_PACKAGE_NAME = GITHUB_APPLICATION_NAME + " " + package_accessor_1.node_package.name;
// tslint:disable-next-line:max-line-length
var email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
var AuthenticationFilename = ".github-authentication-cache";
var GitHubAccessor = (function () {
    function GitHubAccessor() {
        this._auth_cache_filename = path.join(app_root_path.path, AuthenticationFilename);
        this._github = new github();
        this._authenticated = false;
    }
    GitHubAccessor.prototype.authenticate = function () {
        return __awaiter(this, void 0, void 0, function () {
            var success;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this._authenticated) {
                            return [2 /*return*/, true];
                        }
                        if (!fs.exists(this._auth_cache_filename)) return [3 /*break*/, 4];
                        try {
                            this._authentication = JSON.parse(fs.readFileSync(this._auth_cache_filename).toString("utf8"));
                        }
                        catch (e) {
                            logger.warn("unable to parse authentication cache file " + AuthenticationFilename + ", please delete and retry");
                        }
                        if (!this._authentication) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.test_authentication()];
                    case 1:
                        if (_a.sent()) {
                            this._authenticated = true;
                            return [2 /*return*/, true];
                        }
                        else {
                            logger.info("cached authentication failed");
                            this._authentication = null;
                        }
                        _a.label = 2;
                    case 2:
                        if (!!this._authentication) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.console_authentication()];
                    case 3:
                        success = _a.sent();
                        if (success) {
                            this._authenticated = true;
                        }
                        return [2 /*return*/, success];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    GitHubAccessor.prototype.console_authentication = function () {
        return __awaiter(this, void 0, void 0, function () {
            var useremail, password, authorizations, authorization, should_recreate, success, new_token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.prompt_email()];
                    case 1:
                        useremail = _a.sent();
                        return [4 /*yield*/, this.prompt_password()];
                    case 2:
                        password = _a.sent();
                        this._github.authenticate({
                            type: "basic",
                            username: useremail,
                            password: password
                        });
                        return [4 /*yield*/, this._github.authorization.getAll({})];
                    case 3:
                        authorizations = _a.sent();
                        authorization = authorizations.find(function (v) {
                            return v.note === THIS_PACKAGE_NAME && (v.scopes.indexOf("public_repo") !== -1);
                        });
                        if (!authorization) return [3 /*break*/, 6];
                        logger.info("existing authorization found, but we can't use it since there is no way to get its token");
                        return [4 /*yield*/, this.confirm("delete current token and recreate?")];
                    case 4:
                        should_recreate = _a.sent();
                        if (!should_recreate) return [3 /*break*/, 6];
                        return [4 /*yield*/, this._github.authorization["delete"]({ id: authorization.id.toString() })];
                    case 5:
                        success = _a.sent();
                        if (success) {
                            logger.info("deleted successfully");
                        }
                        else {
                            logger.error("failed to delete token");
                            return [2 /*return*/, false];
                        }
                        _a.label = 6;
                    case 6: return [4 /*yield*/, this._github.authorization.create({
                            scopes: ["public_repo"],
                            note: THIS_PACKAGE_NAME
                        })];
                    case 7:
                        new_token = _a.sent();
                        this.save_token({
                            access_token: new_token.token
                        });
                        return [2 /*return*/, true];
                }
            });
        });
    };
    GitHubAccessor.prototype.get_repo = function (owner, repo) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._github.repos.get({ owner: owner, repo: repo })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    GitHubAccessor.prototype.get_repos = function (owner) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._github.repos.getAll({})];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    };
    GitHubAccessor.prototype.get_releases = function (owner, repo) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._github.repos.getReleases({ owner: owner, repo: repo })];
                    case 1:
                        results = (_a.sent()).data;
                        return [2 /*return*/, results];
                }
            });
        });
    };
    GitHubAccessor.prototype.get_releases_by_tag = function (owner, repo, tag) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._github.repos.getReleaseByTag({ owner: owner, repo: repo, tag: tag })];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    };
    GitHubAccessor.prototype.create_release = function (owner, repo, tag_name, name, draft) {
        return __awaiter(this, void 0, void 0, function () {
            var release;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.authenticate()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._github.repos.createRelease({
                                owner: owner,
                                repo: repo,
                                tag_name: tag_name,
                                name: name,
                                body: "generated by node-native-build-utilities",
                                draft: draft
                            })];
                    case 2:
                        release = _a.sent();
                        return [2 /*return*/, release];
                }
            });
        });
    };
    GitHubAccessor.prototype.upload_release_asset = function (owner, repo, release_id, filePath, name, label) {
        return __awaiter(this, void 0, void 0, function () {
            var asset;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.authenticate()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._github.repos.uploadAsset({
                                owner: owner, repo: repo, id: release_id,
                                filePath: filePath, name: name, label: label
                            })];
                    case 2:
                        asset = _a.sent();
                        return [2 /*return*/, asset];
                }
            });
        });
    };
    GitHubAccessor.prototype.download_asset = function (owner, repo, release_name, filename, localfilename) {
        return __awaiter(this, void 0, void 0, function () {
            var downloadurl;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        downloadurl = "https://github.com/" + owner + "/" + repo + "/releases/download/" + release_name + "/" + filename;
                        return [4 /*yield*/, download_accessor_1.download(downloadurl, localfilename, true)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GitHubAccessor.prototype.test_authentication = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._github.authorization.check(this._authentication)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    GitHubAccessor.prototype.read_default_email = function () {
        var config_filename = path.join(app_root_path.path, ".git/", "./config");
        if (!fs.existsSync(config_filename)) {
            logger.warn("git is not configured for this repository");
            return "";
        }
        var gitconfig = ini.parse(fs.readFileSync(config_filename, "utf-8"));
        if (gitconfig && gitconfig.user && gitconfig.user.email) {
            return gitconfig.user.email;
        }
        logger.warn("email not found in git");
        return "";
    };
    GitHubAccessor.prototype.save_token = function (token) {
        fs.writeFile(this._auth_cache_filename, JSON.stringify(token, null, "\t"), function (err) {
            if (err) {
                logger.error("unable to save token, read only?");
            }
        });
        this._authentication = token;
    };
    GitHubAccessor.prototype.confirm = function (message) {
        return new Promise(function (resolve, reject) {
            promptly.confirm(message, function (err, value) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(value);
            });
        });
    };
    GitHubAccessor.prototype.prompt_email = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var defaultUsername = _this.read_default_email();
            var emailValidator = function (value) {
                if (email_regex.test(value)) {
                    return value;
                }
                throw new Error(value + " is not an email");
            };
            promptly.prompt("Github username: ", {
                "default": defaultUsername,
                trim: true,
                validator: emailValidator,
                retry: true
            }, function (err, value) {
                if (err) {
                    reject(err);
                    return;
                }
                if (value) {
                    resolve(value);
                }
                reject("no email entered");
            });
        });
    };
    GitHubAccessor.prototype.prompt_password = function () {
        return new Promise(function (resolve, reject) {
            promptly.password("password: ", function (err, value) {
                if (err) {
                    reject(err);
                    return;
                }
                if (value) {
                    resolve(value);
                }
                reject("no password entered");
            });
        });
    };
    return GitHubAccessor;
}());
exports.GitHubAccessor = GitHubAccessor;
//# sourceMappingURL=github-accessor.js.map
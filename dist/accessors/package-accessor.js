"use strict";
exports.__esModule = true;
var fs = require("fs");
var path = require("path");
var npm_package_arg_1 = require("./npm-package-arg");
exports.node_package = JSON.parse(fs.readFileSync(path.join(process.cwd(), "package.json")).toString());
var repository_source;
(function (repository_source) {
    repository_source[repository_source["git"] = 0] = "git";
    repository_source[repository_source["svn"] = 1] = "svn";
    repository_source[repository_source["github"] = 2] = "github";
    repository_source[repository_source["gist"] = 3] = "gist";
    repository_source[repository_source["bitbucket"] = 4] = "bitbucket";
    repository_source[repository_source["gitlab"] = 5] = "gitlab";
})(repository_source || (repository_source = {}));
function parse_shortcut(shortcut) {
    var shortcut_regex_with_host = /(\S*)[:](\S*)[\/](\S*)/;
    var shortcut_regex_without_host = /(\S*)[\/](\S*)/;
    if (shortcut_regex_with_host.test(shortcut)) {
        var match = shortcut_regex_with_host.exec(shortcut);
        return {
            host_type: match[1],
            username: match[2],
            repo: match[3]
        };
    }
    else if (shortcut_regex_without_host.test(shortcut)) {
        var match = shortcut_regex_without_host.exec(shortcut);
        return {
            host_type: match[1],
            username: match[2],
            repo: match[3]
        };
    }
    return null;
}
function parse_repository() {
    var parsed;
    if (!exports.node_package.repository) {
        throw new Error("unable to parse repository, doesn't exist");
    }
    if (typeof exports.node_package.repository === "string") {
        parsed = npm_package_arg_1.npa(exports.node_package.repository);
    }
    else if (exports.node_package.repository.url) {
        parsed = npm_package_arg_1.npa(exports.node_package.repository.url);
    }
    var parsed_shortcut = parse_shortcut(parsed.hosted.shortcut);
    return {
        repository_type: (parsed.type === "hosted") ? parsed.hosted.type : parsed.type,
        url: (parsed.hosted) ? parsed.hosted.shortcut : parsed.spec,
        username: parsed_shortcut.username,
        repo: parsed_shortcut.repo
    };
}
exports.parse_repository = parse_repository;
//# sourceMappingURL=package-accessor.js.map
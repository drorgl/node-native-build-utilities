"use strict";
exports.__esModule = true;
var child_process = require("child_process");
var logger = require("../utilities/logger");
function git_clone(gitsrc, cwd) {
    return new Promise(function (resolve, reject) {
        logger.info("cloning", gitsrc, "into", cwd);
        var command = child_process.spawn("git", ["clone", "--recursive", gitsrc], { shell: true, cwd: cwd, stdio: "inherit" });
        command.on("close", function (code) {
            resolve(code);
        });
    });
}
exports.git_clone = git_clone;
function git_checkout(cwd, branch) {
    return new Promise(function (resolve, reject) {
        logger.info("checking out branch", branch, "in", cwd);
        var command = child_process.spawn("git", ["checkout", branch], { shell: true, cwd: cwd, stdio: "inherit" });
        command.on("close", function (code) {
            resolve(code);
        });
    });
}
exports.git_checkout = git_checkout;
//# sourceMappingURL=git-accessor.js.map
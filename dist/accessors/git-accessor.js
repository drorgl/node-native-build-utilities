"use strict";
exports.__esModule = true;
var child_process = require("child_process");
var logger = require("../utilities/logger");
function git_clone(gitsrc, cwd) {
    return new Promise(function (resolve, reject) {
        logger.info("cloning", gitsrc, "into", cwd);
        var command = child_process.spawn("git", ["clone", gitsrc], { shell: true, cwd: cwd, stdio: "inherit" });
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
function git_get_last_tag(cwd) {
    return new Promise(function (resolve, reject) {
        logger.info("getting last tag", "in", cwd);
        var command = child_process.spawnSync("git", ["describe", "--abbrev=0", "--tags"], { shell: true, cwd: cwd });
        if (command.status === 0) {
            resolve(command.output.join("").toString().trim());
        }
        else {
            reject(command.stderr.toString());
        }
    });
}
exports.git_get_last_tag = git_get_last_tag;
function git_submodule_update(cwd) {
    return new Promise(function (resolve, reject) {
        logger.info("updating submodule in", cwd);
        var initcommand = child_process.spawn("git", ["submodule", "init"], { shell: true, cwd: cwd, stdio: "inherit" });
        initcommand.on("close", function (icode) {
            if (icode !== 0) {
                reject(icode);
                return;
            }
            var updatecommand = child_process.spawn("git", ["submodule", "update"], { shell: true, cwd: cwd, stdio: "inherit" });
            updatecommand.on("close", function (ucode) {
                resolve(ucode);
            });
        });
    });
}
exports.git_submodule_update = git_submodule_update;
//# sourceMappingURL=git-accessor.js.map
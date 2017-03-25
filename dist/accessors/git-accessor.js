"use strict";
exports.__esModule = true;
var child_process = require("child_process");
var logger = require("../utilities/logger");
function git_clone(gitsrc, cwd, branch) {
    return new Promise(function (resolve, reject) {
        logger.info("cloning", gitsrc, "into", cwd);
        var params = ["clone", "--recursive", gitsrc];
        if (branch) {
            params.unshift("--branch", branch);
        }
        var command = child_process.spawn("git", params, { shell: true, cwd: cwd, stdio: "inherit" });
        command.on("close", function (code) {
            resolve(code);
        });
    });
}
exports.git_clone = git_clone;
//# sourceMappingURL=git-accessor.js.map
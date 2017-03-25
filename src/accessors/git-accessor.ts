import child_process = require("child_process");
import * as logger from "../utilities/logger";

export function git_clone(gitsrc: string, cwd: string, branch?: string): Promise<number> {
	return new Promise<number>((resolve, reject) => {
		logger.info("cloning", gitsrc, "into", cwd);

		let params = ["clone", "--recursive", gitsrc];
		if (branch) {
			params.unshift("--branch", branch);
		}

		let command = child_process.spawn("git", params, { shell: true, cwd, stdio: "inherit" });

		command.on("close", (code: number) => {
			resolve(code);
		});
	});
}

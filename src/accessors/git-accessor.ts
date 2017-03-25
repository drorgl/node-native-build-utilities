import child_process = require("child_process");
import * as logger from "../utilities/logger";

export function git_clone(gitsrc: string, cwd: string): Promise<number> {
	return new Promise<number>((resolve, reject) => {
		logger.info("cloning", gitsrc, "into", cwd);
		let command = child_process.spawn("git", ["clone", gitsrc], { shell: true, cwd, stdio: "inherit" });

		command.on("close", (code) => {
			resolve(code);
		});
	});
}

export function git_checkout(cwd: string, branch: string): Promise<number> {
	return new Promise<number>((resolve, reject) => {
		logger.info("checking out branch", branch, "in", cwd);
		let command = child_process.spawn("git", ["checkout", branch], { shell: true, cwd, stdio: "inherit" });

		command.on("close", (code) => {
			resolve(code);
		});
	});
}

export function git_submodule_update(cwd: string): Promise<number> {
	return new Promise<number>((resolve, reject) => {
		logger.info("updating submodule in", cwd);
		let initcommand = child_process.spawn("git", ["submodule", "init"], { shell: true, cwd, stdio: "inherit" });
		initcommand.on("close", (icode: number) => {
			if (icode !== 0) {
				reject(icode);
				return;
			}

			let updatecommand = child_process.spawn("git", ["submodule", "update"], { shell: true, cwd, stdio: "inherit" });
			updatecommand.on("close", (ucode: number) => {
				resolve(ucode);
			});
		});
	});
}

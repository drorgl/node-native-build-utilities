import child_process = require("child_process");
import * as logger from "../utilities/logger";

export function git_clone(gitsrc: string, cwd: string): Promise<number> {
	return new Promise<number>((resolve, reject) => {
		logger.info("cloning", gitsrc, "into", cwd);
		const command = child_process.spawn("git", ["clone", gitsrc], { shell: true, cwd, stdio: "inherit" });

		command.on("close", (code) => {
			resolve(code);
		});
	});
}

export function git_checkout(cwd: string, branch: string): Promise<number> {
	return new Promise<number>((resolve, reject) => {
		logger.info("checking out branch", branch, "in", cwd);
		const command = child_process.spawn("git", ["checkout", branch], { shell: true, cwd, stdio: "inherit" });

		command.on("close", (code) => {
			resolve(code);
		});
	});
}

export function git_get_last_tag(cwd: string): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		logger.info("getting last tag", "in", cwd);

		const command = child_process.spawnSync("git", ["describe", "--abbrev=0", "--tags"], { shell: true, cwd});
		if (command.status === 0) {
			resolve(command.output.join("").toString().trim());
		} else {
			reject(command.stderr.toString());
		}
	});
}

export function git_submodule_update(cwd: string): Promise<number> {
	return new Promise<number>((resolve, reject) => {
		logger.info("updating submodule in", cwd);
		const initcommand = child_process.spawn("git", ["submodule", "init"], { shell: true, cwd, stdio: "inherit" });
		initcommand.on("close", (icode: number) => {
			if (icode !== 0) {
				reject(icode);
				return;
			}

			const updatecommand = child_process.spawn("git", ["submodule", "update"], { shell: true, cwd, stdio: "inherit" });
			updatecommand.on("close", (ucode: number) => {
				resolve(ucode);
			});
		});
	});
}

import child_process = require("child_process");

export function git_clone(gitsrc: string, cwd: string): Promise<number> {
	return new Promise<number>((resolve, reject) => {
		console.log("cloning", gitsrc, "into", cwd);
		let command = child_process.spawn("git", ["clone", "--recursive", gitsrc], { shell: true, cwd, stdio: "inherit" });

		command.on("close", (code) => {
			resolve(code);
		});
	});
}

export function git_checkout(cwd:string, branch : string): Promise<number>{
	return new Promise<number>((resolve, reject) => {
		console.log("checking out branch", branch, "in", cwd);
		let command = child_process.spawn("git", ["checkout",  branch], { shell: true, cwd, stdio: "inherit" });

		command.on("close", (code) => {
			resolve(code);
		});
	});
}

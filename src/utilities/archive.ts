import node7z = require("node-7z");
let myTask = new node7z();

export async function extractFull(archive: string, dest: string): Promise<any> {
	return myTask.extractFull(archive, dest, {});
}

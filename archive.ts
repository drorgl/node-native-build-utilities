import node7z = require("node-7z");
let myTask = new node7z();
// import * as node7z from "node-7z";

(async () => {
	let x = await myTask.list("bla", {});
})();

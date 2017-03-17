import child_process = require("child_process");

const msbuild_version_regex = /^(\d+)\.?(\d+)\.?(\d+)?(\.\d+)$/gm;
const node_gyp_version_regex = /^v(\d+)\.?(\d+)\.?(\d+)?(\.\d+)$/gm;

// check node-gyp
let node_gyp_status = child_process.spawnSync("node-gyp", ['--version'], { shell: true });
if (node_gyp_status.status === 0) {
	let node_gyp_version = node_gyp_version_regex.exec(node_gyp_status.output.join("").toString())[0];
	console.log("node-gyp installed", node_gyp_version);
} else {
	console.error("node-gyp not installed", node_gyp_status);
}



// npm config set msvs_version 2015

// npm install --global --production windows-build-tools
let msbuild_status = child_process.spawnSync("msbuild", ["/version"], { shell: true });
if (msbuild_status.status === 0) {
	let version = msbuild_version_regex.exec(msbuild_status.output.join("").toString())[0];
	console.log("msbuild installed", version);
} else {
	console.log("msbuild not installed", msbuild_status);
}

let gcc_status = child_process.spawnSync("gcc", ["--version"], { shell: true }).status;
if (gcc_status === 0) {
	console.log("gcc installed");
} else {
	console.log("gcc not installed", gcc_status);
}

// check python version


// node-gyp --release --debug --arch=
// npm list --depth 0 --global typescript --no-progress
let npm_list = child_process.spawnSync("npm", ['list --depth 0 --global typescript --no-progress']);
if (npm_list.status == 0) {
	//??
}

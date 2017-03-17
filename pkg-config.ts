import fs = require("fs");
fs.appendFileSync("pkg-config.log",process.argv.join(" ") + "\r\n\r\n" );

 import child_process = require("child_process");
 let spawnSync = child_process.spawnSync;
 
 
 let args = process.argv.slice(2);
 // console.log('argv',args);
 if (args.indexOf("--exists") !== -1) {
 	console.log(spawnSync("pkg-config", args,{shell:true}).status === 0 ? "1" : "0");
 } else if (args.indexOf("--libs") !== -1) {
 	console.log(spawnSync("pkg-config", args,{shell:true}).output.join(" "));
 } else if (args.indexOf("--cflags") !== -1) {
 	console.log(spawnSync("pkg-config", args,{shell:true}).output.join(" "));
 }

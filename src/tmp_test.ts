import minimatch = require("minimatch");

console.log(minimatch(".\\node_modules\\balanced-match\\.npmignore", ".\\node_modules\\**", { flipNegate: false, dot: true }));

"use strict";
exports.__esModule = true;
//TODO: caching layer between download-accessor and nnbu
var os = require("os");
var path = require("path");
//allow parameter --disable-cache
var cache_dir = process.env.NNBU_CACHE || path.join(os.homedir(), '.nnbu');
function get_dependency(dependency_url) {
}
//specific dependency/all
function clear_cache(dependency_url) {
}
//'{module_name}-v{version}-{node_abi}-{platform}-{arch}.tar.gz';
//# sourceMappingURL=dependency-accessor.js.map
//TODO: caching layer between download-accessor and nnbu
import os = require("os");
import path = require("path");

//allow parameter --disable-cache
let cache_dir = process.env.NNBU_CACHE || path.join(os.homedir(), '.nnbu');

function get_dependency(dependency_url : string){

}

//specific dependency/all
function clear_cache(dependency_url? : string){

}

//'{module_name}-v{version}-{node_abi}-{platform}-{arch}.tar.gz';

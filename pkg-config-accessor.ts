import fs = require("fs");

import child_process = require("child_process");
let spawnSync = child_process.spawnSync;

export function version() : string{
    let result = spawnSync("pkg-config",["--version"],{shell:true});
    return result.output.join("").toString().trim();
}

export function modversion(module_name : string){
    let result = spawnSync("pkg-config",["--modversion",module_name], {shell:true});
    return result.output.join("").toString().trim();
}

export enum module_info{
    libs,
    cflags,
}

export function info(module_name : string, info_type : module_info){
    let command = "";
    switch (info_type){
        case module_info.libs:
        command = "--libs";
        break;
        case module_info.cflags:
        command = "--cflags";
        break;
    }

    let result = spawnSync("pkg-config",[command,module_name],{shell:true});
    return result.output.join("").toString().trim();
}

export function exists(module_name:string) : boolean{
    let result = spawnSync("pkg-config",["--exists",module_name],{shell:true});
    return result.output.join("").toString().trim() == "0";
}

interface IPackage{
    name : string;
    description: string;
}

export function list_all() : IPackage[]{
    let result = spawnSync("pkg-config",["--list-all"],{shell:true});
    let result_data = result.output.join("").toString();
    let result_rows = result_data.split("\r");
    let packages : IPackage[] = [];
    for (let row in result_rows){
        row = row.trim();
        let name_end = row.indexOf(" ");
        let package_name = row.substr(0,name_end).trim();
        let package_description = row.substr(name_end).trim();

        packages.push({
            name : package_name,
            description : package_description
        })
    }

    return packages;
}

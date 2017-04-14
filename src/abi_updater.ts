
(async () => {
    console.log("retrieving list of node versions");
    let ver = await get_node_versions();

    console.log("saving to",abi_filename);
    fs.writeFileSync(abi_filename, JSON.stringify(ver, null, "\t"), { encoding: "utf8" });
})();
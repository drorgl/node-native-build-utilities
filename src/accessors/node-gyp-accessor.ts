import child_process = require("child_process");

function spawn_promise(cmd: string, argv?: string[], cwd?: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        let child = child_process.spawn(cmd, argv, { shell: true, cwd, stdio: "inherit" });
        child.on("close", (ucode: number) => {
            resolve(ucode);
        });
    });

}


export async function build(argv: string): Promise<number> {
    return await spawn_promise("node-gyp", ["build", argv]);
}


export async function clean(argv: string): Promise<number> {
    return await spawn_promise("node-gyp", ["clean", argv]);
}

export async function configure(argv: string): Promise<number> {
    return await spawn_promise("node-gyp", ["configure", argv]);
}


export async function rebuild(argv: string): Promise<number> {
    return await spawn_promise("node-gyp", ["rebuild", argv]);
}


export async function install(argv: string): Promise<number> {
    return await spawn_promise("node-gyp", ["install", argv]);
}


export async function list(argv: string): Promise<number> {
    return await spawn_promise("node-gyp", ["list", argv]);
}


export async function remove(argv: string): Promise<number> {
    return await spawn_promise("node-gyp", ["remove", argv]);
}
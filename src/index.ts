#!/usr/bin/env node

import { readdir } from "fs/promises";
import { extname, resolve } from "path";

import { ArgoCDApplication } from "./argocd-application";
import { Logger } from "./logger";

const EXCLUDED_DIRECTORIES = [
    ".git",
    "node_modules"
];
const INCLUDED_EXTENSIONS = [
    "yaml",
    "yml"
];

(async() => {
    for await (const file of getFiles(".")) {
        const application = await ArgoCDApplication.parse(file);

        if (application) {
            await application.update();
        }
    }
})();

async function* getFiles(dir: string): AsyncGenerator<string> {
    // Get the entries in the provided directory, also include whether the entry is a sub directory.
    const dirents = await readdir(dir, { withFileTypes: true });

    for (const dirent of dirents) {
        // Exclude some directories.
        if (EXCLUDED_DIRECTORIES.includes(dirent.name)) {
            continue;
        }

        // Resolve the full file or directory name.
        const res = resolve(dir, dirent.name);

        if (dirent.isDirectory()) {
            // When the entry is a directory, yield all the results of a recursive call to this function.
            yield* getFiles(res);
        } else {
            const extension = extname(dirent.name)?.substring(1);

            if (INCLUDED_EXTENSIONS.includes(extension)) {
                // Yield only the files that have supported extensions.
                yield(res);
            }
        }
    }
}

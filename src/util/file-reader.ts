import { readdir } from "fs/promises";
import { extname, resolve } from "path";

const EXCLUDED_DIRECTORIES = [
    ".git",
    "node_modules"
];
const INCLUDED_EXTENSIONS = [
    "yaml",
    "yml"
];

export class FileReader {
    /**
     * Get all the files in the provided directory and all its subdirectories.
     * @param {string} dir - The directory.
     * @returns {AsyncGenerator<string>} - A generator of all the files. 
     */
    public static async * getFiles(dir: string): AsyncGenerator<string> {
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
                yield* FileReader.getFiles(res);
            } else {
                const extension = extname(dirent.name)?.substring(1);

                if (INCLUDED_EXTENSIONS.includes(extension)) {
                    // Yield only the files that have supported extensions.
                    yield(res);
                }
            }
        }
    }
}

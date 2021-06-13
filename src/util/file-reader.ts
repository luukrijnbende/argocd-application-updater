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
        const entries = await readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            if (EXCLUDED_DIRECTORIES.includes(entry.name)) {
                continue;
            }

            // Resolve the full file name.
            const file = resolve(dir, entry.name);

            if (entry.isDirectory()) {
                // Yield results of a recursive call to this function.
                yield* FileReader.getFiles(file);
            } else {
                const extension = extname(entry.name)?.substring(1);

                if (INCLUDED_EXTENSIONS.includes(extension)) {
                    // Yield only the files that have supported extensions.
                    yield(file);
                }
            }
        }
    }
}

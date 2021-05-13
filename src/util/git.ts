import { exec } from "child_process"; 

export class Git {
    /**
     * Check if a branch exists locally or on the remote.
     * @param {string} branch - The branch to check.
     * @returns {boolean} - Whether the branch exists.
     */
    public static async branchExists(branch: string): Promise<boolean> {
        const local = await Git.execute(`branch --list ${branch}`);
        const remote = await Git.execute(`ls-remote --heads origin ${branch}`);

        if (local || remote) {
            return true;
        }

        return false;
    }

    /**
     * Create a new branch and check it out.
     * @param {string} branch - The branch to create. 
     */
    public static async createAndCheckoutBranch(branch: string): Promise<void> {
        await Git.execute(`checkout -b ${branch}`);
    }

    /**
     * Add all changed files for a commit.
     */
    public static async addAll(): Promise<void> {
        await Git.execute("add .");
    }

    /**
     * Commit all added files.
     * @param {string} message - The commit message.
     */
    public static async commit(message: string): Promise<void> {
        await Git.execute(`commit -m "${message}"`);
    }

    /**
     * Push the commit to the remote and create a pull request.
     * WARNING: Only works for GitLab!
     * @param {string} branch - The name of the branch to push. 
     */
    public static async pushAndCreatePullRequest(branch: string): Promise<void> {
        await Git.execute(`push --set-upstream origin ${branch} -o merge_request.create`);
    }

    /**
     * Execute a git command.
     * @param {string} command - The command to execute. 
     * @returns {string} - The result of the command.
     */
    private static async execute(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            exec(`git ${command}`, (err, stdout, stderr) => {
                if (err) {
                    return reject(err);
                }

                return resolve(stdout || stderr);
            });
        });
    }
}

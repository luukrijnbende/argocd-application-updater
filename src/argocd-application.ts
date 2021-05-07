import fs from "fs/promises";

import axios from "axios";
import yaml from "yaml";
import semver from "semver";

import { Logger } from "./logger";

export enum ArgoCDApplicationType {
    Git = "git",
    Helm = "helm",
    Kustomize = "kustomize",
    Unknown = "unknown",
}

export class ArgoCDApplication {
    public readonly file: string;
    public readonly name: string;
    public readonly type: ArgoCDApplicationType;
    public readonly repository: string;
    public readonly path: string;
    public version: string;

    /**
     * Read the provided file and turn it into an Argo CD application.
     * @param {string} file - The file to parse.
     * @returns {ArgoCDApplication | null} - The parsed Argo CD application.
     */
    public static async parse(file: string): Promise<ArgoCDApplication | null> {
        const fileContent = await fs.readFile(file, "utf-8");
        // Multiple documents might exist in a single file, so parse them all.
        // Even though having multiple applications in a single file is not supported,
        // normal parsing gives errors on multiple documents.
        const documents = yaml.parseAllDocuments(fileContent);

        if (documents.length === 0) {
            Logger.debug(file, `No documents found, skipping.`);
            return null;
        }

        if (documents.length > 1) {
            Logger.debug(file, `Multiple documents found, using first.`);
        }

        const document = documents[0];

        if (document.errors.length > 0) {
            Logger.error(file, `Document contains errors, skipping.`);
            return null;
        }

        const manifest = document.toJSON();

        if (manifest.apiVersion !== "argoproj.io/v1alpha1" || manifest.kind !== "Application") {
            Logger.debug(file, `Document is not an Argo CD application, skipping.`);
            return null;
        }

        const application = new ArgoCDApplication(file, manifest);

        if (application.type === ArgoCDApplicationType.Unknown) {
            Logger.debug(file, `Application is of unknown type, skipping.`);
            return null;
        }

        Logger.info(file, `Found ${application.type} application '${application.name}'.`);

        return application;
    }

    /**
     * Get the application type from the spec in the manifest.
     * @param {any} spec - The spec.
     * @returns {ArgoCDApplicationType} - The type of application.
     */
    private static getTypeFromSpec(spec: any): ArgoCDApplicationType {
        if (spec.source.chart !== undefined) {
            return ArgoCDApplicationType.Helm;
        }

        return ArgoCDApplicationType.Unknown;
    }

    /**
     * @param {string} file - The file that contains this Argo CD application.
     * @param {any} manifest - The application manifest. 
     */
    public constructor(file: string, manifest: any) {
        this.file = file;
        this.name = manifest.metadata.name;
        this.type = ArgoCDApplication.getTypeFromSpec(manifest.spec);
        this.repository = manifest.spec.source.repoURL;
        this.path = this.type === ArgoCDApplicationType.Helm ? manifest.spec.source.chart : manifest.spec.source.path;
        this.version = manifest.spec.source.targetRevision;
    }

    /**
     * Update this application to the latest version.
     */
    public async update(): Promise<void> {
        let latestVersion;

        Logger.info(this.file, "Checking for updates..");

        switch (this.type) {
            case ArgoCDApplicationType.Helm:
                latestVersion = await this.checkForHelmUpdate();
        }

        if (!latestVersion) {
            Logger.info(this.file, "Application is already on the latest version.");
            return;
        }

        Logger.info(this.file, `Found new version '${latestVersion}'`);
    }

    /**
     * Check for a new version of the Helm chart.
     * @returns {string | null} - The new version.
     */
    private async checkForHelmUpdate(): Promise<string | null> {
        const helmIndex = await axios.get<string>(`${this.repository}/index.yaml`);
        const manifest = yaml.parse(helmIndex.data);

        const entries = manifest.entries[this.path];
        let latestVersion = this.version;

        for (const entry of entries) {
            try {
                if (semver.gt(entry.version, latestVersion)) {
                    latestVersion = entry.version;
                }
            } catch (err) {
                Logger.debug(this.file, err);
            }
        }

        if (semver.gt(latestVersion, this.version) && !semver.prerelease(latestVersion)) {
            return latestVersion;
        }

        return null;
    }
}

#!/usr/bin/env node

import { ArgoCDApplication } from "./argocd-application";
import { FileReader } from "./util/file-reader";
import { Logger } from "./util/logger";

const TAG = "Argo CD Application Updater";

(async() => {
    Logger.info(TAG, "Starting..");

    let numberOfUpdates = 0;

    for await (const file of FileReader.getFiles(".")) {
        const application = await ArgoCDApplication.parse(file);

        if (application) {
            const hasUpdated = await application.update();

            if (hasUpdated) {
                numberOfUpdates++;
            }
        }
    }

    Logger.info(TAG, `All done, found ${numberOfUpdates} update(s).`);
})().catch(err => Logger.error(TAG, err));

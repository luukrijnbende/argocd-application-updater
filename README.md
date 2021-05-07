# Argo CD Application Updater

NodeJS command line application that checks all Argo CD application manifest in the directory it's being run in for an update of the target revision.

## Supported application types
- Helm

## Running locally
- `npm install`
- `npm run build`
- `npm link`
- CD to the repository that contains your Argo CD application files
- `argocd-application-updater`

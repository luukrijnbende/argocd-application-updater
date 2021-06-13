# Argo CD Application Updater

NodeJS command line application that checks all Argo CD application manifests in the directory it's being run in for an update of the target revision.
It then updates the application manifest, writes it back to git and creates a pull request.

### Supported application types
- Helm

## Running locally
- `npm install`
- `npm run build`
- `npm link`
- `cd` to the repository that contains the Argo CD application manifests
- `argocd-application-updater`

## Running on GitLab CI
These steps have to be executed in the repo that contains the Argo CD application manifests.
- Create a deploy key with write access (https://docs.gitlab.com/ee/user/project/deploy_keys)
- Add the private part as a CI variable under the name `SSH_PRIVATE_KEY`
- Add the example below to `.gitlab-ci.yml` and fill in the blanks

### Example pipeline
```yaml
stages:
- update

update:
  stage: update
  image: <docker_image_created_from_argocd_application_updater>
  variables:
    # Disable auto clone.
    GIT_STRATEGY: none
  before_script:
    # Prepare the SSH client to connect to GitLab.
  - ssh-keyscan gitlab.com >> ~/.ssh/known_hosts
  - echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
  - chmod 600 ~/.ssh/id_rsa
    # Setup an identity.
  - git config --global user.email "<email_address>"
  - git config --global user.name "Argo CD Application Updater"
  script:
    # Clone the repository using SSH and cd into it.
  - git clone ssh://git@gitlab.com/$CI_PROJECT_PATH.git
  - cd $CI_PROJECT_NAME
    # Update!
  - argocd-application-updater
  rules:
    # Trigger the pipeline on a schedule.
  - if: '$CI_PIPELINE_SOURCE == "schedule"'
    when: always
    # Trigger the pipeline manually through the web UI.
  - if: '$CI_PIPELINE_SOURCE == "web"'
    when: always
    # Otherwise, never trigger the pipeline.
  - when: never
```

## TODO
- Add support for updating Kustomize
- Add as package to NPM registry
- Publish a docker image that can be used in CI

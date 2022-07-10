# Deployment Resources

Deployment resources are organized into the following folders:

## docker

The main Dockerfile used in local Docker and Kubernetes deployment scenarios.

## docker-local

Scripts for local standalone Docker deployment of this component:

```bash
cd deployment/docker-local
./build.sh
./deploy.sh
./teardown.sh
```

## environments

A number of copies of the API configuration file for different setups:

| Filename | Usage |
| -------- | ----- |
| dev.config.json | Used for local development against the AWS Cognito Authorization Server |
| test.config.json | Used by API tests, which point to Wiremock as a mock Authorization Server |
| docker-local.config.json | The configuration file for local standalone testing |
| kubernetes-local.config.json | The configuration file for local KIND testing |

## kubernetes

Resources used in all Kubernetes deployment scenarios

## kubernetes-local

Scripts for deploying this component in an end-to-end local KIND setup.

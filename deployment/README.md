# Deployment Resources

Deployment resources are organized into the following folders:

## cloudfront

First run this script to build the SPA into a folder structure that can be copied to S3:

```bash
./package.sh
```

Next deploy the SPA's web static content to S3 and run a Cloudfront invalidation:

```bash
./deploy.sh
```

See the [Cloud Web Content Delivery](https://authguidance.com/2018/12/02/spa-content-deployment/) blog post for the production deployment design.

## docker

The main Dockerfile used in local development setups that use Docker or Kubernetes.

## docker-local

Scripts for local standalone Docker deployment of the web host and static content:

```bash
cd deployment/docker-local
./build.sh
./deploy.sh
./teardown.sh
```

## environments

A number of copies of the SPA and Web Host configuration file exist for different setups:

| Filename | Usage |
| -------- | ----- |
| dev.config.json | Used for local React focused development of the SPA |
| dev.localapi.config.json | Used for running the SPA and an API locally, along with a local token handler |
| docker-local.config.json | Used when getting web static content from a local Docker Compose network |
| kubernetes-local.config.json | Used when getting web static content from local Kubernetes pods |

## kubernetes

Resources used in all Kubernetes deployment scenarios

## kubernetes-local

Scripts for deploying this component in an end-to-end local KIND setup.

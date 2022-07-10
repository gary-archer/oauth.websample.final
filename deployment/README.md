# Deployment Resources

Deployment resources are organized into the following folders:

## cloudfront

These scripts deploy the SPA's web static content to S3 and run a Cloudfront invalidation:

```bash
./package.sh
./deploy.sh
```

See the [Cloud Web Content Delivery](https://authguidance.com/2018/12/02/spa-content-deployment/) blog post for the production deployment design.

## docker

The main webhost Dockerfile used in local development setups that use Docker or Kubernetes.

## docker-local

Scripts for local standalone Docker deployment of the web host and static content:

```bash
cd deployment/docker-local
./build.sh
./deploy.sh
./teardown.sh
```

## environments

A number of environments exist for various setups, with different configuration files:

| Environment | Description |
| ----------- | ----------- |
| dev | Local development of the OAuth Agent component |
| dev-localapi | Used to also run an API locally, where a Docker token handler handles receiving cookies |
| docker-local | A deployment of the OAuth Agent and OAuth Proxy to support local SPA to API routing |
| kubernetes-local | A deployment of the OAuth Agent and OAuth Proxy for an end-to-end KIND setup |

## kubernetes

Resources used in all Kubernetes deployment scenarios

## kubernetes-local

Scripts for deploying this component in an end-to-end local KIND setup.

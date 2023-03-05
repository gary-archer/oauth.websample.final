# Deployment Resources

Resources to manage builds and deployment for this component.

## Local Environments

A number of local development configurations are used when running on the local machine:

| Environment | Description |
| ----------- | ----------- |
| dev | Local development of the SPA and running the web host on a development domain |
| dev-localapi | Used to point the SPA to a local API, via a [Local Token Handler](https://github.com/gary-archer/oauth.tokenhandler.docker) |
| docker-local | Used to test standalone Docker deployment of the Web Host and SPA |
| kubernetes-local | An end-to-end deployment of SPA, API and token handler components that runs in a KIND cluster |

## Cloud Environments

The real deployments instead use a content delivery network, and two separate CDN environments are used:

| Environment | Description |
| ----------- | ----------- |
| serverless | A deployed cloudfront distribution for which the SPA connects to AWS APIs that use Serverless hosting |
| cloudnative | A deployed cloudfront distribution for which the SPA connects to AWS APIs that use Kubernetes hosting |

## Shared

The shared resources include the Dockerfile and are used in multiple local deployment scenarios.

## Docker Local

Scripts for local standalone Docker deployment of this component:

```bash
cd deployment/docker-local
./build.sh
./deploy.sh
./teardown.sh
```

## Kubernetes Local

Scripts invoked using parent scripts from the [Cloud Native Local](https://github.com/gary-archer/oauth.cloudnative.local) project.\
This runs an end-to-end SPA and API setup in a local Kubernetes in Docker (KIND) cluster.

## Cloudfront Deployment

See the [Cloud Web Content Delivery](https://authguidance.com/2018/12/02/spa-content-deployment/) blog post for details on the final web deployment.\
The following commands deploy resources to AWS S3 and Cloudfront for the SPA that runs at https://web.authsamples.com/demoapp. \
This SPA then calls from the browser to APIs running in AWS using Serverless hosting:

```bash
cd deployment/cloudfront
./build.sh serverless
./deploy.sh serverless
```

The following commands deploy resources to S3 and Cloudfront for the SPA that runs at https://web.authsamples-k8s.com/demoapp. \
This SPA then calls from the browser to APIs running in an AWS Kubernetes cluster:

```bash
cd deployment/cloudfront
./build.sh cloudnative
./deploy.sh cloudnative
```

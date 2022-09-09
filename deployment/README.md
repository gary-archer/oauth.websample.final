# Deployment Resources

Resources to manage builds and deployment for this component.

## Local Environments

A number of configuration files exist for various local development setups:

| Environment | Description |
| ----------- | ----------- |
| dev | Local development of the SPA and running the web host on a development domain |
| dev-localapi | Used to point the SPA to a local API, via a [Docker Token Handler](https://github.com/gary-archer/oauth.tokenhandler.docker) |
| docker-local | Used to test Docker deployment of the Web Host and SPA |
| kubernetes-local | An end-to-end deployment of SPA, API and token handler components that runs in a KIND cluster |
| kubernetes-aws | An end-to-end deployment of SPA, API and token handler components that runs in an AWS cluster |

## Cloud Environments

Two different deployed environments exist for the Final SPA:

| Environment | Description |
| ----------- | ----------- |
| serverless | A deployed cloudfront distribution for which the SPA connects to AWS APIs that use Serverless hosting |
| cloudnative | A deployed cloudfront distribution for which the SPA connects to AWS APIs that use Kubernetes hosting |

Deploy to one these by running scripts from the `cloudfront` folder and providing a command line argument.\
This deploys the SPA's web static content to S3, then runs a Cloudfront invalidation:

```bash
./package.sh
./deploy.sh serverless
```

See the [Cloud Web Content Delivery](https://authguidance.com/2018/12/02/spa-content-deployment/) blog post for the final web deployment.

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

## kubernetes-local

Scripts invoked using parent scripts from the [Cloud Native Local](https://github.com/gary-archer/oauth.cloudnative.local) project.\
This runs an end-to-end SPA and API setup in a local Kubernetes in Docker (KIND) cluster.
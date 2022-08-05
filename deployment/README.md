# Deployment Resources

## environments

A number of environments exist for various setups, with different configuration files:

| Environment | Description |
| ----------- | ----------- |
| dev | Local development of the SPA and running the web host on a development domain |
| dev-localapi | Used to point the SPA to a local API, via a [Docker Token Handler](https://github.com/gary-archer/oauth.tokenhandler.docker) |
| docker-local | Used to test Docker deployment of the Web Host and SPA |
| kubernetes-local | An end-to-end deployment of the Web Host and SPA, that runs in a KIND cluster |

## cloudfront

These scripts deploy the SPA's web static content to S3 and run a Cloudfront invalidation:

```bash
./package.sh
./deploy.sh
```

See the [Cloud Web Content Delivery](https://authguidance.com/2018/12/02/spa-content-deployment/) blog post for the final web deployment.

## docker

The main webhost Dockerfile used in local development setups that use Docker or Kubernetes.

## docker-local

Scripts to test local standalone Docker deployment of the web host and static content:

```bash
cd deployment/docker-local
./build.sh
./deploy.sh
./teardown.sh
```

## kubernetes-local

Scripts invoked using parent scripts from the [Cloud Native Deployment](https://github.com/gary-archer/oauth.cloudnative.deployment) project.

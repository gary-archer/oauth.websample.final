# Deployment Resources

Resources to manage builds and deployment for this component.

## Local Environments

A number of local development configurations are used when running on the local machine:

| Environment | Description |
| ----------- | ----------- |
| dev | Local development of the SPA, running the web host on a development domain |
| dev-localapi | Local development of the SPA against a local API |
| docker-local | Used to test standalone Docker deployment of the Web Host and SPA |
| kubernetes-local | Used when deploying the Web Host and SPA to a local KIND cluster |

## Cloud Environments

The real deployments instead use a content delivery network, and two separate CDN environments are used:

| Environment | Description |
| ----------- | ----------- |
| serverless | A deployed cloudfront distribution for which the SPA connects to AWS APIs that use Serverless hosting |
| cloudnative | A deployed cloudfront distribution for which the SPA connects to AWS APIs that use Kubernetes hosting |

## Docker Local

I use these commands to test local Docker deployment of the web host and SPA:

```bash
cd deployment/docker-local
./build.sh
./deploy.sh
./teardown.sh
```

## Cloudfront Deployment

See the [Web Content Delivery](https://github.com/gary-archer/oauth.blog/tree/master/public/posts/cdn-static-content-delivery.mdx) blog post for details on the final web deployment.\
The following commands deploy resources to AWS S3 and Cloudfront for the SPA that runs at https://www.authsamples.com/spa. \
This SPA then calls from the browser to APIs running in AWS using Serverless hosting:

```bash
cd deployment/cloudfront
./build.sh serverless
./deploy.sh serverless
```

The following commands deploy resources to S3 and Cloudfront for the SPA that runs at https://www.authsamples-k8s.com/spa. \
This SPA then calls from the browser to APIs running in an AWS Kubernetes cluster:

```bash
cd deployment/cloudfront
./build.sh cloudnative
./deploy.sh cloudnative
```

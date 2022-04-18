# Cloudfront Deployment

First build the SPA into a folder structure that can be copied to S3:

```bash
./package.sh
```

Next deploy the SPA's web static content to S3 and run a Cloudfront invalidation:

```bash
./deploy.sh
```

## Further Information

See the [Cloud Web Content Delivery](https://authguidance.com/2018/12/02/spa-content-deployment/) blog post for the production deployment design.
# Cloudfront Deployment

First build the SPA assets into files ready for deployment:

```bash
cd spa
npm install
npm run buildRelease
```

Then run this project's commands to deploy the SPA's web static content to S3:

```bash
./package.sh
./deploy.sh
```
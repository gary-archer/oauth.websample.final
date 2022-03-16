# Cloudfront Deployment

First go to the SPA assets into files ready for deployment:

```bash
cd spa
npm install
npm run buildRelease
```

Next run this project's commands to deploy the SPA's web static content to S3:

```bash
npm install
npm run package
npm run deploy
```
# Cloudfront Extensions

## Default Document

This lambda edge function serves the `index.html` file.\
This ensures that the user can browse to any path without errors:

- https://web.authsamples.com/anypath

## Security Headers

This lambda edge function ensures that the SPA returns recommended security headers.\
This also ensures a good secrity rating on sites such as [Mozilla Observatory](https://observatory.mozilla.org/analyze/web.authsamples.com).

## Usage

Run these commands to build the lambda functions:

```bash
npm install
npm run build
```

Run these commands to test the lambda functions:

```bash
npm run defaultDocument
npm run securityHeaders
```

## Web Host Deployment

Deployment to AWS is done by scripts in the parent project's `deployment/cloudfront` folder.\
These deploy both the SPA's static content and the lambda edge extensions:

```bash
./build.sh  serverless
./deploy.sh serverless
```
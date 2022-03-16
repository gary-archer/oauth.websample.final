# Lambda Edge Deployment

The default document lambda edge functions serves the `index.html` file.\
This ensures that the user can browse to any path without errors:

- https://web.authsamples.com/anypath

The security headers lambda edge function ensures that the SPA returns recommended security headers.\
This also ensures a good secrity rating on sites such as Mozilla Observatory:

- https://observatory.mozilla.org/analyze/web.authsamples.com

Run these commands to deploy the lambda functions and attach them to the Cloudfront distribution:

```bash
npm install
npm run package
npm run deploy
```
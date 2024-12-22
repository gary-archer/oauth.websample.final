# OAuth Final SPA

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/b8102db7e793492ca3d13fff4573f090)](https://app.codacy.com/gh/gary-archer/oauth.websample.final?utm_source=github.com&utm_medium=referral&utm_content=gary-archer/oauth.websample.final&utm_campaign=Badge_Grade)
 
[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample.final/badge.svg?targetFile=spa/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample.final?targetFile=spa/package.json)
[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample.final/badge.svg?targetFile=webhost/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample.final?targetFile=webhost/package.json)

## Overview

The final demo Single Page Application, which aims to meet some [Web Architecture Goals](https://github.com/gary-archer/oauth.blog/tree/master/public/posts/web-architecture-goals.mdx).\
The `Token Handler Pattern` enables the following main behaviors:

- The SPA uses the most secure cookies with no tokens in the browser, to limit the impact of XSS exploits.
- The SPA uses modern productive development with only client side React technology.
- The SPA static content is distributed to ~400 locations by a CDN for best web performance.
  
## Components

Cookies are managed solely by OAuth Agent and OAuth Proxy utilities on the API side of the architecture:

![SPA Architecture](./images/spa-architecture.png)

## Views

The SPA is a simple UI with some basic navigation between views, to render fictional investment resources.\
Its data is returned from an OAuth-secured API that uses claims-based authorization.\
The SPA uses user attributes from both the OpenID Connect userinfo endpoint and its API. 

![SPA Views](./images/spa-views.png)

## Online System

The online version uses the AWS Cloudfront content delivery network to deliver static content to the browser.\
Login at https://www.authsamples.com/ with this AWS Cognito test account:

```text
- User: guestuser@example.com
- Password: GuestPassword1
```

## Local Development Quick Start

To run the code sample locally you must configure some infrastructure before you run the code.

### Configure DNS and SSL

Configure custom development domains by adding this DNS entry to your hosts file:

```bash
127.0.0.1 localhost www.authsamples-dev.com
```

Install OpenSSL 3+ if required, create a secrets folder, then create development certificates:

```bash
export SECRETS_FOLDER='~/secrets'
mkdir ~/secrets
./certs/create.sh
```

Finally, configure [Browser SSL Trust](https://github.com/gary-archer/oauth.blog/tree/master/public/posts/developer-ssl-setup.mdx#trust-a-root-certificate-in-browsers) for the SSL root certificate at this location:

```text
./certs/authsamples-dev.ca.crt
```

### Run the Code

Ensure that Node.js 20+ is installed, then build and run the SPA in the webpack development server:

```bash
./build.sh && ./run.sh
```

The browser then opens at `https://www.authsamples-dev.com/` and you can sign in with the test account.\
You can then test all lifecycle operations, including expiry events, multi-tab browsing and multi-tab logout.

## Further Information

* See the [API Journey - Client Side](https://github.com/gary-archer/oauth.blog/tree/master/public/posts/api-journey-client-side.mdx) for further information on the app's behaviour.
* See blog posts for further details specific to the SPA, starting in the [Final SPA Overview](https://github.com/gary-archer/oauth.blog/tree/master/public/posts/final-spa-overview.mdx).

## Programming Languages

* The app's code uses TypeScript and its views use React.

## Infrastructure

* AWS Route 53 provides custom hosting domains.
* AWS S3 is the upload point for web static content.
* AWS Cloudfront distributes web static content globally, for equal web performance.
* AWS Certificate Manager issues and auto renews the web host's SSL certificate.
* AWS Cognito is the default authorization server for the SPA and API components.
* [AWS Serverless](https://github.com/gary-archer/oauth.apisample.serverless) or Kubernetes host remote API endpoints that the SPA calls.
* Token handler components implement API-driven cookie issuing on behalf of the SPA.

# OAuth Final SPA

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/f2c5ede8739440599096fc25010ab6f6)](https://www.codacy.com/gh/gary-archer/oauth.websample.final/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=gary-archer/oauth.websample.final&amp;utm_campaign=Badge_Grade)
 
[![Known Vulnerabilities](https://snyk.io/test/github/gary-archer/oauth.websample.final/badge.svg?targetFile=spa/package.json)](https://snyk.io/test/github/gary-archer/oauth.websample.final?targetFile=spa/package.json)

## Overview

The final OpenID Connect secured SPA, which aims for a [Web Architecture](https://authguidance.com/2017/09/08/goal-1-spas/) with best capabilities.\
The SPA interacts with an [OAuth Proxy API](https://github.com/gary-archer/oauth.webproxyapi) as part of a [Back End for Front End](https://authguidance.com/2019/09/09/spa-back-end-for-front-end) solution.

## Quick Start

Ensure that NodeJS and Docker Desktop are installed, then run these commands for an end-to-end solution:

```bash
./build.sh
./deploy.sh
```

## OAuth Classes

- The [SPA WebAuthenticator Class](https://github.com/gary-archer/oauth.websample.final/blob/master/spa/src/plumbing/oauth/web/webAuthenticator.ts) demonstrates the front end security handling
- The [Proxy API Authorizer Class](https://github.com/gary-archer/oauth.webproxyapi/blob/master/src/core/services/authorizer.ts) provides an outline of the more complex back end security

## Deployed Solution

Any reader can sign in to the Deployed SPA via the [Quick Start Page](https://authguidance.com/home/code-samples-quickstart/):

- AWS CloudFront is used as the SPA's Content Delivery Network
- The OAuth Proxy API runs as a Serverless Lambda and is called via AWS API Gateway
- The SPA uses a separate [Business API](https://github.com/gary-archer/oauth.apisample.serverless) for its application data
- AWS Cognito is used as the default low cost Authorization Server

## Blog Posts

- See the [Final SPA Overview](https://authguidance.com/2019/04/07/local-ui-setup) for a summary of behaviour
- See the [Final SPA Instructions](https://authguidance.com/2019/04/08/how-to-run-the-react-js-spa) for details on how to run the code
- See the [Web Content Delivery](https://authguidance.com/2018/12/02/spa-content-deployment) post for details on Cloudfront deployment
- See the [Final OAuth Messages](https://authguidance.com/2020/05/24/spa-and-api-final-http-messages) page for details on HTTP requests

## Same Site Cookies

The Proxy API writes SameSite cookies containing OAuth tokens, which the SPA sends during OAuth requests.\
The cookies have these properties, to keep them private to the Proxy API.\
The access token SameSite cookie has a path of `/` so that it can be sent to any API.

- HTTP Only
- Secure
- AES256 encrypted
- SameSite = strict
- Domain = api.authsamples.com
- Path = /proxy
